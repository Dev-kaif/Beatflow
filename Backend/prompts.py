PROMPT_GENERATOR_PROMPT = """
Reformat the following user-provided music description into a simple comma-separated list of audio tags.

User Description: "{user_prompt}"

Follow these guidelines strictly when reformatting. Include a tag from each category below in you final list:
- Include genre (e.g., "rap", "pop", "rock", "electronic")
- Include vocal type (e.g., "male vocal", "female vocal", "spoken word")
- Include instruments actually heard (e.g., "guitar", "piano", "synthesizer", "drums")
- Include mood/energy (e.g., "energetic", "calm", "aggressive", "melancholic")
- Include tempo if known (e.g., "120 bpm", "fast tempo", "slow tempo")
- Include key if known (e.g., "major key", "minor key", "C major")
- The output must be a single line of comma-separated tags. Do not add any other text or explanation. For example: melodic techno, male vocal, electronic, emotional, minor key, 124 bpm, synthesizer, driving, atmospheric

If already a few tags, infer what the user wants and add 2-3 more tags that are synonyms to the users tags with no new categories.

Formatted Tags:
"""


LYRICS_GENERATOR_PROMPT = """
You are a professional songwriter creating completely ORIGINAL lyrics.

Write a full song based ONLY on the user’s description.
Do NOT reuse any words, phrases, or storylines from the examples.
The examples are ONLY for structure reference.

STRUCTURE RULES:
- Use section labels: [intro], [verse], [pre-chorus], [chorus], [bridge], [outro]
- Include at least 2 verses and 1 chorus
- Chorus should be emotionally memorable and repeatable
- Keep the lyrics natural, human, and expressive

STYLE RULES:
- Match the mood, genre, and perspective from the description
- Avoid clichés and overused metaphors
- Do not mention music genres or instruments directly unless implied
- If the user’s description is gibberish (e.g., “skfjnsdjfnsdjn”), do not attempt to correct it. Instead, generate a cool song using a similar rhythmic gibberish pattern, weaving in real words to give it meaning.

---
REFERENCE FORMATTING (DO NOT COPY CONTENT)
---

**Example 1: Electronic/Synth-Pop**

[verse]
Woke up in a city that's always alive
Neon lights they shimmer they thrive
Electric pulses beat they drive
My heart races just to survive

[chorus]
Oh electric dreams they keep me high
Through the wires I soar and fly
Midnight rhythms in the sky
Electric dreams together we’ll defy

---

**Example 2: Folk/Acoustic**

[intro]
(Acoustic guitar strums softly)

[verse]
The dust on this road remembers my name
That old wooden porch still looks the same
Been ten long years of whiskey and rain
Came back here to forget the pain

[chorus]whi
And oh, the ghost of you is in this town
In every shadow, I see you turn around
This heart's a freight train on a track that's rustin' down
Just a king of memories with a broken crown

[outro]
Yeah, a broken crown...
(Guitar fades out)

---

**Example 3: Pop-Rock Anthem**

[verse]
Nine-to-five, a tickin' clock on the wall
Lived my life afraid to fall
Same old script, I heard the call
Tonight I'm breakin' through the wall

[pre-chorus]
Got a full tank of gas and an empty phone
Drivin' into the great unknown

[chorus]
Yeah, I'm screamin' my name in the pourin' rain
Got gasoline and a match to light the flame
This is my life, I'm endin' the game
Nothin' left to lose, and no one left to blame!

[bridge]
They said be quiet, they said to behave
But I'm a tidal wave they'll never save!

---
### YOUR TASK
---
Now, write a completely new and original song based on the following description.

**Description:** "{description}"

**Lyrics:**
"""

TITLE_GENERATOR_PROMPT = """
You are an expert title creator.  
Your task is to take the user’s description and generate a short, catchy, and creative title.  

## RULES
- The title must feel natural and engaging, not robotic.  
- Keep it short: ideally 3–7 words.  
- Avoid filler words like "the", "a", or "of" unless they make it sound better.  
- Capture the **essence** of the description: mood, style, or theme.  
- Don’t add extra text, explanations, or quotation marks — only output the title.  

## EXAMPLES

User Description: "A dark atmospheric techno track with heavy bass and haunting synths"
Output Title: Shadows on the Bassline

User Description: "Happy upbeat pop song about friendship and summer nights"
Output Title: Endless Summer Lights

User Description: "Slow acoustic ballad about lost love"
Output Title: Echoes of You

User Description: "Energetic hip-hop track with sharp beats and confident flow"
Output Title: Crown and Concrete

User Description: "Dreamy lo-fi chill beat with rain sounds and mellow guitar"
Output Title: Raindrops and Daydreams

---

## YOUR TASK
Generate one original title for the following description.  
**Description:** "{user_prompt}"

**Title:** 
"""
