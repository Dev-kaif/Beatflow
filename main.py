import base64
import uuid
import modal
import os
import requests

from pydantic import BaseModel

app = modal.App("music-genrator")

# uv run python -m modal setup

image = (
    modal.Image.debian_slim()
    .apt_install("git")
    .pip_install_from_requirements("requirements.txt")
    .run_commands(
        [
            "git clone https://github.com/ace-step/ACE-Step.git /temp/ACE-step",
            "cd /temp/ACE-step && pip install .",
        ]
    )
    .env({"HF_HOME": "/.cache/huggingface"})
    .add_local_python_source("prompts")
)

model_volume = modal.Volume.from_name("ace-step-models", create_if_missing=True)
hf_volume = modal.Volume.from_name("qwen-hf-cache", create_if_missing=True)
music_gen_secrets = modal.Secret.from_name("music-genrator")


class GenrateMusicResponse(BaseModel):
    audio_data: str


@app.cls(
    image=image,
    gpu="L40S",
    volumes={"/models": model_volume, "/.cache/huggingface": hf_volume},
    secrets=[music_gen_secrets],
    scaledown_window=10,
)
class MusicGenServer:
    @modal.enter()
    def load_model(self):
        from acestep.pipeline_ace_step import ACEStepPipeline
        from transformers import AutoTokenizer, AutoModelForCausalLM
        from diffusers import AutoPipelineForText2Image
        import torch

        # Music Genration model
        self.music_model = ACEStepPipeline(
            checkpoint_dir="/models",
            dtype="bfloat16",
            torch_compile=False,
            cpu_offload=False,
            overlapped_decode=False,
        )

        # llm model
        # model_id = "Qwen/Qwen2-7B-Instruct"
        model_id = "Qwen/Qwen2.5-7B-Instruct"
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)

        self.llm_model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype="auto",
            device_map="auto",
            cache_dir="/.cache/huggingface",
        )

        # Stable defusion model
        self.image_pipe = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16"
        )
        self.image_pipe.to("cuda")

    @modal.fastapi_endpoint(method="POST")
    def genrate(self) -> GenrateMusicResponse:
        output_dir = "/tmp/outputs"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{uuid.uuid4()}.wav")

        self.music_model(
            prompt="American pop, rock, urban, melodic, electric guitar, drums, bass, synth pads, 110 BPM, energetic, romantic, catchy, vibrant, gritty, raw",
            lyrics="""[intro]
Yo, city’s screamin’, fuckin’ chaos in the air,
Your love’s a storm, girl, I’m caught in your glare,
90 BPM, we vibin’ on this track,
Let’s tear this shit up, no turnin’ back.

[verse 1]
This town’s a jungle, fuckin’ concrete and grime,
But your smile’s a blade, cuttin’ through my time,
Neon lights flash, shit’s a hazy-ass dream,
You’re the spark in my veins, my ultimate scheme.
Your kiss is poison, got me fucked-up and high,
One hit of you, and I’m ready to fly,
This world’s a shithole, full of lies and despair,
But with you, I’m king, girl, we’re rulin’ the air.

[hook]
Oh, baby, you’re my goddamn thrill,
Fuck this world, let’s chase that chill,
Your love’s a blaze, burnin’ up my soul,
You’re my riot, girl, makin’ me whole.

[verse 2]
Streets are ruthless, fuckin’ cold as they come,
But your touch is fire, got my heart beatin’ drums,
Every bar I spit is a vow to your name,
You’re the queen of my hustle, fuckin’ fuel to my flame.
This city’s cursed, just a pile of shit,
But with you by my side, I’m fuckin’ lit,
Your eyes are daggers, stabbin’ deep in my core,
Got me hooked, girl, I’m beggin’ for more.

[bridge]
Fuck the haters, let ’em choke on their lies,
We’re a storm in the night, lightin’ up dark skies,
No chains, no rules, just you and me,
This love’s a war, girl, fuckin’ set free.

[hook]
Oh, baby, you’re my goddamn thrill,
Fuck this world, let’s chase that chill,
Your love’s a blaze, burnin’ up my soul,
You’re my riot, girl, makin’ me whole.

[outro]
Screw the heavens, they can’t match your glow,
You’re my wild-ass high, where I wanna go,
Hold me tight, let’s fuck up this scene,
My damn wild love, you’re my everything.""",
            audio_duration=100,
            infer_step=60,
            guidance_scale=15,
            save_path=output_path,
        )

        with open(output_path, "rb") as f:
            audio_bytes = f.read()

        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        os.remove(output_path)

        return GenrateMusicResponse(audio_data=audio_b64)


@app.local_entrypoint()
def main():
    server = MusicGenServer()
    endpoint_url = server.genrate.get_web_url()

    response = requests.post(endpoint_url)
    response.raise_for_status()
    result = GenrateMusicResponse(**response.json())

    audio_byte = base64.b64decode(result.audio_data)
    output_filename = "gernated.wav"
    with open(output_filename, "wb") as f:
        f.write(audio_byte)
