import type { NextApiRequest, NextApiResponse } from "next";
import { sendCreditEmail } from "@/lib/email";
import { db } from "@/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Optional: only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

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


    return res.status(200).json({ message: "Credits updated and emails sent" });
  } catch (err) {
    console.error("Credit refresh error:", err);
    return res.status(500).json({
      error: "Failed to refresh credits or send emails",
    });
  }
}
