import { env } from "@/env";
import { Resend } from "resend";

export const resendClient = new Resend(env.RESEND_API_KEY as string);
