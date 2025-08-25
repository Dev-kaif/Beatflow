# 🎵 Music Generation Project – Beatflow

An end-to-end application for AI-powered music creation. It combines a **Next.js frontend**, a **Python backend** (for generation), and a **Node.js backend** (for audio processing). Users can describe a mood, theme, or lyrics, and get back a full track with title, tags, and cover art.  

👉 Live Demo: [https://www.beatflow.art](https://www.beatflow.art)

---

## 🏗️ Architecture Overview

The system is split into three main services:

1. **Frontend (Next.js + TypeScript)**  
   A web interface where users log in, generate tracks, and manage their music library.  

2. **Python Backend (Modal)**  
   Handles all heavy AI tasks like generating music, lyrics, titles, and cover art.  

3. **Node.js Backend (Express + FFmpeg)**  
   Responsible for post-processing audio before storage (conversion, previews, watermarking).  

---

## ✨ Features

### Frontend
- **Authentication** – Handled by [Better Auth](https://better-auth.com).  
- **Music Generation UI** – Generate tracks from prompts or lyrics.  
- **Track Library** – Save, browse, and play generated tracks.  
- **Audio Player** – Stream generated music directly.  
- **State Management** – Powered by [Zustand](https://zustand-demo.pmnd.rs/).  

### Python Backend (Modal + FastAPI)
- **Music Generation** – Uses `ACEStepPipeline` to turn prompts/lyrics into music.  
- **Lyric Writing** – Powered by `Qwen2-7B-Instruct`.  
- **Automatic Titles + Tags** – AI-generated for each track.  
- **Cover Art** – Generated using `stabilityai/sdxl-turbo`.  
- **Cloudflare R2 Storage** – Uploads outputs (music + art).  

### Node.js Backend (Express + FFmpeg)
- **Audio Conversion** – WAV → MP3 (with bitrate options).  
- **Preview Creation** – 30s watermarked snippets.  
- **Redis Queueing** – [Upstash Redis](https://upstash.com) handles task queues + caching.  
- **Cloudflare R2 Integration** – Downloads raw files, uploads processed versions.  

### Database Layer
- **Neon (Postgres)** – Scalable Postgres for storing users, tracks, metadata.  

---

## 🛠️ Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js (TypeScript), React, TailwindCSS, Zustand, Better Auth |
| **Database** | Neon (Postgres), Upstash Redis |
| **Python Backend** | Modal, PyTorch, Hugging Face Transformers, FastAPI |
| **Node.js Backend** | Express, TypeScript, FFmpeg, Cloudflare R2 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js + [pnpm](https://pnpm.io)  
- Python 3.11+  
- [Modal](https://modal.com) CLI + account  
- [Neon](https://neon.tech) Postgres database  
- [Upstash Redis](https://upstash.com) account  
- [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) bucket  

---

### 1. Frontend Setup
```bash
cd frontend
pnpm install
cp .env.example .env   # add auth, DB, Redis, R2 keys
pnpm dev
````

---

### 2. Python Backend (Modal) Setup

```bash
cd backend
pip install -r requirements.txt
# set secrets with `modal secret create <name> <value>`
modal deploy main.py
```

---

### 3. Node.js Backend Setup

```bash
cd node-backend
pnpm install
cp .env.example .env   # add S3/R2 credentials, Redis config
pnpm start
```

---

## 📡 API Reference

### Python Backend (FastAPI on Modal)

#### `POST /generate_from_description`

Generate a track from a **text prompt**.

```json
{
  "prompt": "A calm lo-fi track with rain sounds"
}
```

#### `POST /generate_with_lyrics`

Generate music from **custom lyrics**.

```json
{
  "lyrics": "Under the stars, we fade away...",
  "style": "dreamy pop"
}
```

#### `POST /generate_with_described_lyrics`

Auto-generate lyrics from a description, then create a track.

```json
{
  "description": "An upbeat motivational anthem with electronic vibes"
}
```

---

### Node.js Backend (Express)

#### `POST /process-audio`

Convert or preview audio.

```json
{
  "songKey": "raw/song123.wav",
  "outputKey": "processed/song123.mp3",
  "task": "CONVERT_TO_MP3",
  "params": { "bitrate": "192k" }
}
```

Tasks:

* `CONVERT_TO_MP3` – Full conversion
* `CREATE_PREVIEW` – 30s preview with watermark

#### `GET /ping`

Health check – returns `"pong"`.

---

## 📂 Project Structure

```
.
├── frontend/        # Next.js (TypeScript) app
├── backend/         # Python backend (Modal + FastAPI)
├── node-backend/    # Node.js backend (Express + FFmpeg)
└── README.md
```

---

## 🔮 Roadmap

* [ ] Stems generation (vocals, drums, instruments separately)
* [ ] User playlists & sharing
* [ ] Fine-tuned models per genre/mood
* [ ] Real-time collaborative track editing

---

## 🤝 Contributing

Contributions welcome — open an issue before submitting a PR.

---

## 📜 License

MIT – free to use, modify, and share.
