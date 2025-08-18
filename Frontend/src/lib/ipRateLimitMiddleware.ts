import { createAuthMiddleware } from "better-auth/plugins";
import type {
  BetterAuthPlugin,
  HookEndpointContext,
  MiddlewareInputContext,
} from "better-auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { db } from "@/server/db";
import { env } from "@/env";

// Redis + Rate limiter
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "1h"),
});

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Server-side Better Auth plugin
export const ipRateLimitPlugin = (): BetterAuthPlugin => ({
  id: "ip-rate-limit",
  hooks: {
    before: [
      {
        matcher: (ctx: HookEndpointContext) => ctx.path.startsWith("/sign-up"),
        handler: createAuthMiddleware(
          async (
            ctx: MiddlewareInputContext<Record<string, unknown>> & {
              metadata?: Record<string, unknown>;
            },
          ) => {
            let ipHeader: string | undefined;
            if (
              ctx.headers &&
              typeof (ctx.headers as Headers).get === "function"
            ) {
              ipHeader =
                (ctx.headers as Headers).get("x-forwarded-for") ?? undefined;
            }
            const safeIp = ipHeader ? ipHeader.split(",")[0] : "unknown";

            // 1️⃣ Rate limit check
            const { success } = await ratelimit.limit(safeIp!);

            if (!success)
              return jsonResponse({ error: "Too many signups from this IP" }, 429);

            // 2️⃣ Check if IP already exists in DB
            const existingUser = await db.user.findFirst({
              where: { ipAddress: safeIp },
            });
            console.log(existingUser);

            if (existingUser)
              return jsonResponse(
                { error: "An account from this IP already exists" },
                403,
              );

            // 3️⃣ Store IP in metadata for onUserCreatedkaifnewip@gmail.com
            ctx.metadata = { ...(ctx.metadata ?? {}), ip: safeIp };

            return {
              context: {
                ...ctx,
                metadata: { ...(ctx.metadata ?? {}), ip: safeIp },
              },
            };
          },
        ),
      },
    ],
    after: [],
  },
});
