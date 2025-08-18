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

const productLow = env.PRODUCT_ID_MIN as string
const productMid = env.PRODUCT_ID_MID as string
const productMax = env.PRODUCT_ID_MAX as string

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    databaseHooks: {
        user: {
            create: {
                after: async (user, context) => {
                    type ContextWithMetadata = { metadata?: { ip?: string | null } };
                    const ctx = context as ContextWithMetadata;
                    const ip = ctx.metadata?.ip ?? "unknown";
                    console.log("🔥 User created! IP:", ip, user);

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
                            productId: productLow,
                            slug: "Low",
                        },
                        {
                            productId: productMid,
                            slug: "Medium",
                        },
                        {
                            productId: productMax,
                            slug: "High",
                        },
                    ],
                    successUrl: "/",
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

                        switch (productId) {
                            case productLow: // Low
                                CreditsToAdd = 5;
                                break;
                            case productMid: // Medium
                                CreditsToAdd = 10;
                                break;
                            case productMax: // High
                                CreditsToAdd = 25;
                                break;
                        }

                        await db.user.update({
                            where: {
                                id: externalCustomerId,
                            },
                            data: {
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
