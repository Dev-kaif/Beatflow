import base64
from typing import List
import uuid
import modal
import os
import requests
import boto3
from botocore.client import Config

from pydantic import BaseModel

from prompts import (
    LYRICS_GENERATOR_PROMPT,
    PROMPT_GENERATOR_PROMPT,
    TITLE_GENERATOR_PROMPT
)

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

model_volume = modal.Volume.from_name(
    "ace-step-models", create_if_missing=True)
hf_volume = modal.Volume.from_name("qwen-hf-cache", create_if_missing=True)
music_gen_secrets = modal.Secret.from_name("music-genrator")


class AudioGenrationBase(BaseModel):
    audio_duration: float = 60.00
    seed: int = -1
    guidance_scale: float = 15
    infer_step: int = 60
    instrumental: bool = False


class GenrateFromDescriptionRequest(AudioGenrationBase):
    full_described_song: str


class GenrateWithCustomLyricsRequest(AudioGenrationBase):
    prompt: str
    lyrics: str


class GenrateWithDescribedLyricsRequest(AudioGenrationBase):
    prompt: str
    described_lyrics: str


class GenrateMusicResponseS3(BaseModel):
    s3_key: str
    title: str
    cover_image_s3_key: str
    categories: List[str]


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
        import torchaudio
        import soundfile as sf

        def safe_save(path, waveform, sample_rate, **kwargs):
            sf.write(path, waveform.cpu().numpy().T, sample_rate)

        torchaudio.save = safe_save

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
        model_id = "Qwen/Qwen2.5-14B-Instruct"
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

    def qwen_prompt(self, question: str):
        messages = [{"role": "user", "content": question}]

        text = self.tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )

        model_inputs = self.tokenizer([text], return_tensors="pt").to(
            self.llm_model.device
        )

        generated_ids = self.llm_model.generate(
            **model_inputs, max_new_tokens=512)

        generated_ids = [
            output_ids[len(input_ids):]
            for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        response = self.tokenizer.batch_decode(
            generated_ids, skip_special_tokens=True)[0]

        return response

    # Genrate Tags
    def generate_prompt(self, desc: str):
        # insert description
        full_prompt = PROMPT_GENERATOR_PROMPT.format(user_prompt=desc)

        # Run LLM and Return the response
        return self.qwen_prompt(full_prompt)

    def generate_title(self, desc: str):
        # insert description
        full_prompt = TITLE_GENERATOR_PROMPT.format(user_prompt=desc)

        # Run LLM and Return the response
        return self.qwen_prompt(full_prompt)

    # Generate Lyrics
    def generate_lyrics(self, desc: str):
        # insert description
        full_prompt = LYRICS_GENERATOR_PROMPT.format(description=desc)

        # Run LLM and Return the response
        return self.qwen_prompt(full_prompt)

    # Generate Categories
    def generate_categories(self, description: str) -> List[str]:
        prompt = f"Based on the following music description, list 3-5 relevant genres or categories as a comma-separated list. For example: Pop, Electronic, Sad, 80s. Description: '{description}'"

        response_text = self.qwen_prompt(prompt)
        categories = [cat.strip()
                      for cat in response_text.split(",") if cat.strip()]
        return categories

    def genrate_And_upload_s3(
        self,
        prompt: str,
        lyrics: str,
        audio_duration: float,
        seed: int,
        infer_step: float,
        guidance_scale: float,
        instrumental: bool,
        description_for_categorization: str,
    ) -> GenrateMusicResponseS3:

        R2_ENDPOINT_URL = os.environ["R2_ENDPOINT_URL"]
        R2_ACCESS_KEY_ID = os.environ["R2_ACCESS_KEY_ID"]
        R2_SECRET_ACCESS_KEY = os.environ["R2_SECRET_ACCESS_KEY"]
        R2_BUCKET_NAME = os.environ["R2_BUCKET_NAME"]

        s3_client = boto3.client(
            "s3",
            endpoint_url=R2_ENDPOINT_URL,
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )

        final_lyrics = "[instrumental]" if instrumental else lyrics

        output_dir = "/tmp/outputs"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{uuid.uuid4()}.wav")

        self.music_model(
            prompt=prompt,
            lyrics=final_lyrics,
            audio_duration=audio_duration,
            infer_step=infer_step,
            guidance_scale=guidance_scale,
            save_path=output_path,
            manual_seeds=str(seed),
        )

        audio_s3_key_name = f"{uuid.uuid4()}.wav"

        s3_client.upload_file(output_path, R2_BUCKET_NAME, audio_s3_key_name)

        os.remove(output_path)

        # Thumbnail Genration
        thumbnail_prompt = f"{prompt} , Create Music Album cover art"
        image = self.image_pipe(
            prompt=thumbnail_prompt, num_inference_steps=1, guidance_scale=0.0
        ).images[0]
        image_output_path = os.path.join(output_dir, f"{uuid.uuid4()}.png")
        image.save(image_output_path)

        image_s3_key_name = f"{uuid.uuid4()}.png"

        s3_client.upload_file(
            image_output_path, R2_BUCKET_NAME, image_s3_key_name)

        os.remove(image_output_path)

        # Category Genration
        categories = self.generate_categories(description_for_categorization)

        title = self.generate_title(final_lyrics)

        return GenrateMusicResponseS3(
            s3_key=audio_s3_key_name,
            cover_image_s3_key=image_s3_key_name,
            categories=categories,
            title=title
        )

    # Generate Song from Song Description
    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def genrate_from_description(
        self, request: GenrateFromDescriptionRequest
    ) -> GenrateMusicResponseS3:
        prompt = self.generate_prompt(request.full_described_song)

        # Generating lyrics
        lyrics = ""
        if not request.instrumental:
            lyrics = self.generate_lyrics(request.full_described_song)
            print(lyrics)
        return self.genrate_And_upload_s3(
            prompt=prompt,
            lyrics=lyrics,
            description_for_categorization=request.full_described_song,
            **request.model_dump(exclude={"full_described_song"}),
        )

    # Generate Song from Lyrics Given by user
    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def genrate_with_lyrics(
        self, request: GenrateWithCustomLyricsRequest
    ) -> GenrateMusicResponseS3:
        return self.genrate_And_upload_s3(
            prompt=request.prompt,
            lyrics=request.lyrics,
            description_for_categorization=request.prompt,
            **request.model_dump(exclude={"prompt", "lyrics"}),
        )

    # Generate Song from Described Lyrics and given Tags
    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def genrate_with_described_lyrics(
        self, request: GenrateWithDescribedLyricsRequest
    ) -> GenrateMusicResponseS3:
        # Generating lyrics
        lyrics = ""
        if not request.instrumental:
            lyrics = self.generate_lyrics(request.described_lyrics)
            print(lyrics)

        return self.genrate_And_upload_s3(
            prompt=request.prompt,
            lyrics=lyrics,
            description_for_categorization=request.prompt,
            **request.model_dump(exclude={"described_lyrics", "prompt"}),
        )


@app.local_entrypoint()
def main():
    server = MusicGenServer()
    endpoint_url = server.genrate_from_description.get_web_url()

    request_data = GenrateFromDescriptionRequest(
        full_described_song="love song about guys first girlfriend who he founds really adorable",
        guidance_scale=15,

    )

    payload = request_data.model_dump()

    headers = {
        "Modal-Secret": "ws-PZeAmpwfCL0bIU25hNcwLA",
        "Modal-Key": "wk-7yMrBmHcnaJeSqQTylgQBB",
    }

    # Modal-Secret: ws-PZeAmpwfCL0bIU25hNcwLA
    # Modal-Key: wk-7yMrBmHcnaJeSqQTylgQBB

    response = requests.post(endpoint_url, json=payload, headers=headers)
    response.raise_for_status()

    result = GenrateMusicResponseS3(**response.json())

    print(result)
