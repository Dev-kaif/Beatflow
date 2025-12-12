// src/app/api/download/[trackId]/route.ts
import { getDownloadUrl } from "@/actions/generation";

export async function GET(req: Request , { params }: { params:  Promise<{ trackId: string }>}) {
  const trackId = (await params).trackId;
  if (!trackId) return new Response("Missing trackId", { status: 400 });

  try {
    const url = await getDownloadUrl(trackId);
    if (!url) return new Response("File not found", { status: 404 });

    const response = await fetch(url);
    if (!response.ok)
      return new Response("Failed to fetch file", { status: 500 });

    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${trackId}.mp3"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
