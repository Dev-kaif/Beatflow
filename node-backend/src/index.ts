import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
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

// --- FFmpeg Configuration ---
// Point the ffmpeg library to the installed static binary.
ffmpeg.setFfmpegPath(ffmpegStatic!);

// --- Main Processing Endpoint ---
app.post("/process-audio", async (req, res) => {
  // 1. Destructure the job details from the request body.
  const { songKey, outputKey, task, params = {} } = req.body;

  if (!songKey || !outputKey || !task) {
    return res
      .status(400)
      .json({ error: "Missing required fields: songKey, outputKey, or task" });
  }

  // Define temporary local paths for processing.
  const tempSongPath = path.join("/tmp", path.basename(songKey));
  const tempOutputPath = path.join("/tmp", path.basename(outputKey));

  try {
    // 2. Download the source audio file from S3 to a temporary location.
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

    // 3. Prepare the FFmpeg command based on the requested 'task'.
    const ffmpegCommand = ffmpeg(tempSongPath);

    switch (task) {
      case "CONVERT_TO_MP3": {
        console.log(`Task: Converting ${songKey} to MP3`);
        const { bitrate = "192k" } = params; // Default to high quality
        ffmpegCommand.outputOptions(["-f mp3", `-b:a ${bitrate}`]);
        break;
      }

      case "CREATE_PREVIEW": {
        console.log(`Task: Creating watermarked preview for ${songKey}`);
        const { duration = 30, bitrate = "128k" } = params;
        // ... inside the "CREATE_PREVIEW" case
        const watermarkPath = path.join(process.cwd(), "assets", "watermark.mp3");

        // Check if watermark file exists
        if (!fs.existsSync(watermarkPath)) {
          throw new Error("Watermark file not found on server.");
        }

        ffmpegCommand
          .input(watermarkPath)
          .complexFilter([
            `[0:a]atrim=0:${duration},asetpts=PTS-STARTPTS[a0]`, // Trim song
            `[1:a]asetpts=PTS-STARTPTS[a1]`, // Prepare watermark
            `[a0][a1]concat=n=2:v=0:a=1[a]`, // Concatenate
          ])
          .outputOptions(["-map [a]", `-b:a ${bitrate}`]);
        break;
      }

      default:
        throw new Error(`Unknown task: ${task}`);
    }

    // Execute FFmpeg, upload the result, and send the response.
    ffmpegCommand
      .save(tempOutputPath)
      .on("end", async () => {
        console.log("FFmpeg processing finished. Uploading to S3...");
        const fileStream = fs.createReadStream(tempOutputPath);
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: outputKey,
            Body: fileStream,
            ContentType: "audio/mpeg",
          })
        );
        console.log(`Successfully uploaded ${outputKey}`);

        // 5. Clean up temporary local files.
        await fs.promises.unlink(tempSongPath);
        await fs.promises.unlink(tempOutputPath);

        res.status(200).json({ success: true, outputKey });
      })
      .on("error", (err) => {
        console.error("FFmpeg Error:", err.message);
        res
          .status(500)
          .json({ error: "FFmpeg processing failed.", details: err.message });
      });
  } catch (error) {
    console.error("Server Error:", error);
    if (fs.existsSync(tempSongPath)) await fs.promises.unlink(tempSongPath);
    if (fs.existsSync(tempOutputPath)) await fs.promises.unlink(tempOutputPath);
    res.status(500).json({
      error: "An error occurred on the server.",
      details: (error as Error).message,
    });
  }
});

// --- Start the Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎧 Audio processing server running on port ${PORT}`);
});
