import { db } from "@/server/db";
import { inngest } from "./client";
import { env } from "@/env";

interface RequestBody {
  guidanceScale?: number;
  inferSteps?: number;
  prompt?: string;
  lyrics?: string;
  fullDescribedSong?: string;
  describedLyrics?: string;
  audioDuration?: number;
  instrumental?: boolean;
  seed?: number;
}

export const GenerateSong = inngest.createFunction(
  {
    id: "generate-song",

    concurrency: {
      limit: 1,
      key: "event.data.userId",
    },
    
    onFailure: async ({ event, error }) => {
      await db.song.update({
        where: {
          id: (event?.data?.event?.data as { songId: string }).songId,
        },
        data: {
          status: "failed",
        },
      });
    },
  },
  { event: "song-event" },
  async ({ event, step }) => {
    const { songId } = event.data as {
      songId: string;
      userId: string;
    };

    const { userId, credits, endpoint, body } = await step.run(
      "check-credits",
      async () => {
        const song = await db.song.findUniqueOrThrow({
          where: { id: songId },
          select: {
            user: {
              select: {
                id: true,
                credits: true,
              },
            },
            prompt: true,
            lyrics: true,
            fullDescribedSong: true,
            describedLyrics: true,
            guidanceScale: true,
            inferSteps: true,
            audioDuration: true,
            instrumental: true,
            seed: true,
          },
        });

        let endpoint = "";
        let body: RequestBody = {};

        const commonParameters = {
          guidanceScale: song.guidanceScale ?? undefined,
          inferSteps: song.inferSteps ?? undefined,
          audioDuration: song.audioDuration ?? undefined,
          seed: song.seed ?? undefined,
          instrumental: song.instrumental ?? undefined,
        };

        // Description for the song generation = Description of Lyrics (no prompt and lyrics)
        if (song.fullDescribedSong && song) {
          endpoint = env.GENERATE_FROM_DESCRIPTION;
          body = {
            fullDescribedSong: song.fullDescribedSong,
            ...commonParameters,
          };
        }

        // custom lyrics for the song generation = Lyrics + prompt (given by user)
        else if (song.lyrics && song.prompt) {
          endpoint = env.GENERATE_WITH_LYRICS;
          body = {
            prompt: song.prompt,
            lyrics: song.lyrics,
            ...commonParameters,
          };
        }

        // Prompt for the song generation : Prompt + Description of Lyrics
        else if (song.prompt && song.describedLyrics) {
          endpoint = env.GENERATE_WITH_LYRICS;
          body = {
            prompt: song.prompt,
            describedLyrics: song.describedLyrics,
            ...commonParameters,
          };
        }

        return {
          userId: song.user.id,
          credits: song.user.credits,
          endpoint,
          body,
        };
      },
    );

    if (credits <= 0) {
      await step.run("set-status-no-credits", async () => {
        await db.song.update({
          where: { id: songId },
          data: {
            status: "No-Credits",
          },
        });

        const response = await step.fetch(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            "Modal-Key": env.MODAL_KEY,
            "Modal-Secret": env.MODAL_SECRET,
          },
        });

        await step.run("update-song-results", async () => {
          const responseData = response.ok
            ? ((await response.json()) as {
                s3_key: string;
                cover_image_s3_key: string;
                categories: string[];
              })
            : null;

          await db.song.update({
            where: { id: songId },
            data: {
              s3Key: responseData?.s3_key ?? null,
              thumbnailUrl: responseData?.cover_image_s3_key ?? null,
              status: response.ok ? "Completed" : "Failed",
            },
          });

          if (responseData && responseData.categories.length > 0) {
            await db.song.update({
              where: { id: songId },
              data: {
                categories: {
                  connectOrCreate: responseData.categories.map(
                    (categoryName) => ({
                      where: { name: categoryName },
                      create: { name: categoryName },
                    }),
                  ),
                },
              },
            });
          }

          return await step.run("update-user-credits", async () => {
            if (!response.ok) return;

            return await db.user.update({
              where: { id: userId },
              data: {
                credits: {
                  decrement: 1,
                },
              },
            });
          });
        });
      });
    } else {
      await step.run("set-status-processing", async () => {
        return await db.song.update({
          where: { id: songId },
          data: {
            status: "Processing",
          },
        });
      });
    }
  },
);
