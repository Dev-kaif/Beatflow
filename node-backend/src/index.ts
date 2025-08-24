import express from "express";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import stream from "stream";
import dotenv from "dotenv";
import path from "path";

// --- Basic Setup ---
dotenv.config();
const app = express();
app.use(express.json());

// --- AWS S3 Client Configuration ---
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});


// --- Main Processing Endpoint ---
app.post("/process-audio", async (req, res) => {
  const { songKey, outputKey, task, params = {} } = req.body;

  if (!songKey || !outputKey || !task) {
    return res
      .status(400)
      .json({ error: "Missing required fields: songKey, outputKey, or task" });
  }

  // Define temporary local paths for processing.
  const tempSongPath = path.join("/tmp", `in-${path.basename(songKey)}`);
  const tempOutputPath = path.join("/tmp", `out-${path.basename(outputKey)}`);

  try {
    // 1. Download the source audio file from S3.
    console.log(`Downloading ${songKey}...`);
    const getObjectResponse = await s3.send(
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: songKey })
    );
    const songStream = getObjectResponse.Body as stream.Readable;
    await new Promise<void>((resolve, reject) =>
      songStream
        .pipe(fs.createWriteStream(tempSongPath))
        .on("finish", resolve)
        .on("error", reject)
    );

    // 2. Prepare the FFmpeg command.
    const ffmpegCommand = ffmpeg(tempSongPath);

    switch (task) {
      case "CONVERT_TO_MP3": {
        console.log(`Task: Converting ${songKey} to MP3`);
        const { bitrate = "192k" } = params;
        ffmpegCommand.outputOptions(["-f mp3", `-b:a ${bitrate}`]);
        break;
      }
      case "CREATE_PREVIEW": {
        console.log(`Task: Creating watermarked preview for ${songKey}`);
        const { duration = 30, bitrate = "128k" } = params;
        const watermarkPath = path.join(process.cwd(), "assets", "watermark.mp3");

        if (!fs.existsSync(watermarkPath)) {
          throw new Error("Watermark file not found on server.");
        }

        ffmpegCommand
          .input(watermarkPath)
          .complexFilter([
            `[0:a]atrim=0:${duration},asetpts=PTS-STARTPTS[a0]`,
            `[1:a]asetpts=PTS-STARTPTS[a1]`,
            `[a0][a1]concat=n=2:v=0:a=1[a]`,
          ])
          .outputOptions(["-map [a]", `-b:a ${bitrate}`]);
        break;
      }
      default:
        throw new Error(`Unknown task: ${task}`);
    }

    // 3. Process the audio using a Promise to allow for async/await.
    await new Promise<void>((resolve, reject) => {
      ffmpegCommand
        .save(tempOutputPath)
        .on("end", () => {
          console.log("FFmpeg processing finished.");
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg Error:", err.message);
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        });
    });

    // 4. Upload the processed file back to S3.
    console.log(`Uploading ${outputKey}...`);
    const fileStream = fs.createReadStream(tempOutputPath);
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: outputKey,
        Body: fileStream,
        ContentType: "audio/mpeg",
      })
    );
    console.log(`Successfully processed and uploaded ${outputKey}`);

    res.status(200).json({ success: true, outputKey });

  } catch (error) {
    console.error("An error occurred during processing:", error);
    res.status(500).json({
      error: "An error occurred on the server.",
      details: (error as Error).message,
    });
  } finally {
    // 5. Cleanup: This block ensures temporary files are deleted even if an error occurs.
    console.log("Cleaning up temporary files...");
    if (fs.existsSync(tempSongPath)) await fs.promises.unlink(tempSongPath);
    if (fs.existsSync(tempOutputPath)) await fs.promises.unlink(tempOutputPath);
  }
});

app.get("/ping", (req, res) => {
  console.log("Ping received! 🏓");
  res.status(200).json({ message: "pong" });
});

// --- Start the Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎧 Audio processing server running on port ${PORT}`);
});