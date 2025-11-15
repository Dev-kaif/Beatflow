import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { polar, checkout, webhooks, portal } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { env } from "@/env";
import { ipRateLimitPlugin } from "./ipRateLimitMiddleware";
import { resendClient } from "./resend";

const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: "production",
});

const productMid = env.PRODUCT_ID_MID;
const productMax = env.PRODUCT_ID_MAX;

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    trustedOrigins: ["http://localhost:3000", "https://www.beatflow.art"],
    cookies: {
        secure: false,
        sameSite: "lax",
    },
    advanced: {
        ipAddress: {
            ipAddressHeaders: ["x-client-ip", "x-forwarded-for", "cf-connecting-ip"],
            disableIpTracking: false,
        },
    },
    databaseHooks: {
        user: {
            create: {
                after:
                    async (user, context) => {
                        await db.user.update({
                            where: { id: user.id },
                            data: {
                                credits: 5,
                            },
                        });
                        const ipFromAdvanced = (context as { ip?: string | null }).ip ?? null;

                        const ipFromPlugin =
                            (context as { metadata?: { ip?: string | null } }).metadata?.ip ??
                            null;

                        const ip = ipFromAdvanced ?? ipFromPlugin;

                        if (ip) {
                            await db.user.update({
                                where: { id: user.id },
                                data: { ipAddress: ip },
                            });
                        }
                    },
            },
        },
    },

    rateLimit: {
        enabled: true,
        window: 10, // time window in seconds
        max: 50, // max requests in the window
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await resendClient.emails.send({
                from: "Beatflow <noreply@verify.beatflow.art>",
                to: user.email,
                subject: "Verify your email",
                text: `Verify your email:\n${url}\nIf you didn’t request this, ignore this message.`,
                html: `
  <!doctype html>
  <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Verify your email</title>
      <style>
        a { color: #2563eb; text-decoration: none; }
        .btn { display:inline-block;padding:12px 20px;border-radius:8px;background:#111827;color:#ffffff;font-weight:600 }
        .container { max-width: 560px; margin: 0 auto; padding: 24px; font: 14px/1.6 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111827; }
        .card { border:1px solid #e5e7eb; border-radius:12px; padding:24px; }
        .muted { color:#6b7280; font-size:12px; }
      </style>
    </head>
    <body style="background:#f9fafb;margin:0;">
      <div class="container">
        <div class="card">
          <h2 style="margin:0 0 8px;">Verify your email</h2>
          <p style="margin:0 0 16px;">Hi ${user.name ?? ""}, confirm this email to activate your Beatflow account.</p>
          <p style="margin:0 0 20px;">
            <a href="${url}" target="_blank" rel="noopener"
            style="
                display:inline-block;
                padding:12px 20px;
                border-radius:8px;
                background: linear-gradient(to right, #f97316, #ec4899); /* orange-500 → pink-500 */
                color:#ffffff;
                font-weight:600;
                text-decoration:none;
                font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
                "
            >
                Verify email
            </a>
          </p>
          <p class="muted" style="margin:0 0 8px;">Button not working? Paste this link into your browser:</p>
          <p style="word-break:break-all;margin:0 0 16px;">
            <a href="${url}" target="_blank" rel="noopener">${url}</a>
          </p>
          <p class="muted" style="margin:0;">If you didn’t request this, you can safely ignore this email.</p>
        </div>
        <p class="muted" style="text-align:center;margin:16px 0 0;">© ${new Date().getFullYear()} Beatflow</p>
      </div>
    </body>
  </html>
  `,
            });
        },
        afterEmailVerification: async (user) => {
            console.log(`${user.email} verified successfully.`);
            // more logic here if needed
        },
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            accessType: "offline",
            prompt: "select_account consent",
        },
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
        },
    },
    plugins: [
        ipRateLimitPlugin(),
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: productMid,
                            slug: "Medium",
                        },
                        {
                            productId: productMax,
                            slug: "High",
                        },
                    ],
                    successUrl: "/home",
                    authenticatedUsersOnly: true,
                }),
                portal(),
                webhooks({
                    secret: env.POLAR_WEBHOOK_SECRET,
                    onOrderPaid: async (order) => {
                        const externalCustomerId = order.data.customer.externalId;

                        if (!externalCustomerId) {
                            throw new Error("No external customer ID found in order");
                        }

                        const productId = order.data.product.id;

                        let CreditsToAdd = 0;
                        let package_tier = "free";

                        switch (productId) {
                            case productMid: // Medium
                                CreditsToAdd = 10;
                                package_tier = "starter";
                                break;
                            case productMax: // High
                                CreditsToAdd = 30;
                                package_tier = "creator";
                                break;
                        }

                        await db.user.update({
                            where: {
                                id: externalCustomerId,
                            },
                            data: {
                                package: package_tier,
                                credits: {
                                    increment: CreditsToAdd,
                                },
                            },
                        });
                    },
                }),
            ],
        }),
    ],
});
