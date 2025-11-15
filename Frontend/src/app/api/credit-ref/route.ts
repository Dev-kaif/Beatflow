import { sendCreditEmail } from "@/lib/email";
import { db } from "@/server/db";

export async function POST(req: Request) {
  try {
    // Step 1: Add 5 credits to all users
    await db.user.updateMany({
      data: {
        credits: { increment: 5 },
      },
    });

    // Step 2: Fetch all users
    // const users = await db.user.findMany({
    //   select: {
    //     id: true,
    //     name: true,
    //     email: true,
    //   },
    // });

    // Step 3: Email all users
    // await Promise.all(users.map((user) => sendCreditEmail(user)));
    try {
      await sendCreditEmail({
        email: "mohammadkaifpro@gmail.com",
        name: "Kaif",
      });
    } catch (err) {
      console.error("Email send error:", err);
    }

    return new Response("Credits refreshed and emails sent", { status: 200 });
  } catch (err) {
    console.error("Credit refresh error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
