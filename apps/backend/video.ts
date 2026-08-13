type VideoReference = {
  url: string;
};

type SubmitVideoInput = {
  prompt: string;
  model: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  generateAudio: boolean;
  references?: VideoReference[];
  startFrame?: string;
  endFrame?: string;
};

const baseUrl = "https://openrouter.ai/api/v1";

function requireApiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured");
  return key;
}

async function openRouter(path: string, init: RequestInit = {}) {
  const key = requireApiKey();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${body}`);
  }

  return response;
}

export async function generateVideo(input: SubmitVideoInput) {
  const body: Record<string, unknown> = {
    model: input.model,
    prompt: input.prompt,
    duration: input.duration,
    resolution: input.resolution,
    aspect_ratio: input.aspectRatio,
    generate_audio: input.generateAudio,
  };

  if (input.references?.length) {
    body.input_references = input.references.map((reference) => ({
      type: "image_url",
      image_url: { url: reference.url },
    }));
  }

  const frames = [] as Array<{ frame_type: string; image_url: { url: string } }>;
  if (input.startFrame) {
    frames.push({ frame_type: "first_frame", image_url: { url: input.startFrame } });
  }
  if (input.endFrame) {
    frames.push({ frame_type: "last_frame", image_url: { url: input.endFrame } });
  }
  if (frames.length) body.frame_images = frames;

  const response = await openRouter("/videos", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return response.json() as Promise<{
    id: string;
    polling_url: string;
    status: string;
    generation_id?: string;
    unsigned_urls?: string[];
    error?: string;
  }>;
}

export async function getVideoGeneration(jobId: string) {
  const response = await openRouter(`/videos/${encodeURIComponent(jobId)}`, {
    method: "GET",
  });

  return response.json() as Promise<{
    id: string;
    polling_url: string;
    status: string;
    generation_id?: string;
    unsigned_urls?: string[];
    error?: string;
    usage?: { cost?: number };
  }>;
}

export async function listVideoModels() {
  const response = await openRouter("/videos/models", { method: "GET" });
  return response.json() as Promise<{ data: unknown[] }>;
}
