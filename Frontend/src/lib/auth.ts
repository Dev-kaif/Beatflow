import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { polar, checkout, webhooks, portal } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { env } from "@/env";
import { ipRateLimitPlugin } from "./ipRateLimitMiddleware";

const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: "sandbox",
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
    databaseHooks: {
        user: {
            create: {
                after: async (user, context) => {
                    type ContextWithMetadata = { metadata?: { ip?: string | null } };
                    const ctx = context as ContextWithMetadata;
                    const ip = ctx.metadata?.ip ?? "unknown";

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
    },
    // socialProviders: {
    //   google: {
    //       clientId: process.env.GOOGLE_CLIENT_ID as string,
    //       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    //   },
    //   github: {
    //     clientId: process.env.GITHUB_CLIENT_ID as string,
    //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //   },
    // },
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
