import { sendCreditEmail } from "@/lib/email";
import { db } from "@/server/db";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("cron_secret");

  // Protect route
  if (!secret || secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const users = await db.user.findMany({
      select: {
        name: true,
        email: true,
      },
    });

    // Batch size (3–10 recommended)
    const batchSize = 5;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      await Promise.all(
        batch.map((user) =>
          sendCreditEmail(user).catch((err) => {
            console.error("Email error for:", user.email, err);
          }),
        ),
      );

      // avoid hammering email provider
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return new Response("Emails sent in batches", { status: 200 });
  } catch (err) {
    console.error("Credit refresh error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
