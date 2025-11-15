import { resendClient } from "./resend";

export interface CreditEmailUser {
  name?: string | null;
  email: string;
}

export async function sendCreditEmail(user: CreditEmailUser) {
  const dashboardUrl = "https://www.beatflow.art/home";

  await resendClient.emails.send({
    from: "Beatflow <noreply@verify.beatflow.art>",
    to: user.email,
    subject: "You've received 5 new Beatflow credits 🎉",
    html: `
<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Beatflow Monthly Credits</title>

    <style>
      a { color: #2563eb; text-decoration: none; }

      .btn { 
        display:inline-block;
        padding:12px 20px;
        border-radius:8px;
        background: linear-gradient(to right, #f97316, #ec4899);
        color:#ffffff !important;
        font-weight:600;
        text-decoration:none;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      }

      .container { 
        max-width: 560px; 
        margin: 0 auto; 
        padding: 24px; 
        font: 14px/1.6 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; 
        color:#111827; 
      }

      .card { 
        border:1px solid #e5e7eb; 
        border-radius:12px; 
        padding:24px; 
        background:#ffffff;
      }

      .muted { 
        color:#6b7280; 
        font-size:12px; 
      }
    </style>
  </head>

  <body style="background:#f9fafb;margin:0;">
    <div class="container">
      <div class="card">

        <h2 style="margin:0 0 8px;">You've received monthly credits 🎉</h2>

        <p style="margin:0 0 16px;">
          Hi ${user.name ?? ""}, great news — we've added 
          <strong>5 new credits</strong> to your Beatflow account!
        </p>

        <p style="margin:0 0 16px;">
          You can now create more AI songs, instrumentals, lyrics, and explore new ideas with Beatflow.
        </p>

        <p style="margin:0 0 20px;">
          <a href="${dashboardUrl}" target="_blank" class="btn">
            Go to Dashboard
          </a>
        </p>

        <p class="muted" style="margin:0 0 8px;">If the button doesn't work:</p>
        <p style="word-break:break-all;margin:0 0 16px;">
          <a href="${dashboardUrl}" target="_blank">${dashboardUrl}</a>
        </p>

        <p style="margin:0;">Enjoy creating!</p>
        <p style="margin:0;">– The Beatflow Team</p>
      </div>

      <p class="muted" style="text-align:center;margin:16px 0 0;">
        © ${new Date().getFullYear()} Beatflow. All rights reserved.
      </p>
    </div>
  </body>
</html>
`,
  });
}
