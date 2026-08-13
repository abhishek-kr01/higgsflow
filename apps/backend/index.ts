import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import path from "node:path";
import { prisma } from "./db";
import { CreateAvatarSchema, CreateUserSchema, CreateVideoSchema, SigninSchema } from "./types";
import { createImage } from "./image";
import { generateVideo, getVideoGeneration, listVideoModels } from "./video";
import { createToken, requireAuth, type AuthenticatedRequest } from "./auth";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const publicBaseUrl = (process.env.PUBLIC_BACKEND_URL ?? `http://localhost:${port}`).replace(/\/$/, "");
const assetsDir = path.resolve(import.meta.dir, "assets");

app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
}));
app.use(express.json({ limit: "1mb" }));
app.use("/assets", express.static(assetsDir));

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", service: "higgsflow-backend" });
});

// Auth
app.post("/api/v1/signup", async (req, res, next) => {
  try {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid username or password" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } });
    if (existing) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    const password = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: { username: parsed.data.username, password },
      select: { id: true, username: true },
    });
    const token = await createToken(user.id);

    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
});

app.post("/api/v1/signin", async (req, res, next) => {
  try {
    const parsed = SigninSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid username or password" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const token = await createToken(user.id);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/me", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, username: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Avatars
app.post("/api/v1/avatar", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = CreateAvatarSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "name and a valid image URL are required" });
      return;
    }

    const avatar = await prisma.avatar.create({
      data: {
        userId: req.userId!,
        name: parsed.data.name,
        avatarImages: {
          create: {
            type: "User",
            url: parsed.data.image,
          },
        },
      },
      include: { avatarImages: true },
    });

    // Generate one model/profile image. The original source image is always retained.
    const outputName = `avatar-${avatar.id}-model.png`;
    const outputPath = path.join(assetsDir, outputName);

    try {
      await createImage(
        "Create a professional cinematic profile headshot based on this person. Preserve their identity and facial characteristics. Produce a clean, realistic portrait suitable as an AI avatar reference.",
        parsed.data.image,
        outputPath,
      );

      await prisma.avatarImage.create({
        data: {
          avatarId: avatar.id,
          type: "Model",
          url: `${publicBaseUrl}/assets/${outputName}`,
        },
      });
    } catch (error) {
      await prisma.avatar.delete({ where: { id: avatar.id } });
      throw error;
    }

    const result = await prisma.avatar.findUnique({
      where: { id: avatar.id },
      include: { avatarImages: true },
    });

    res.status(201).json({ avatar: result });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/avatars", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const avatars = await prisma.avatar.findMany({
      where: { userId: req.userId! },
      include: { avatarImages: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ avatars });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/avatar/:avatarId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const avatar = await prisma.avatar.findFirst({
      where: { id: req.params.avatarId, userId: req.userId! },
      include: { avatarImages: true },
    });

    if (!avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    res.json({ avatar });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/v1/avatar/:avatarId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const avatar = await prisma.avatar.findFirst({
      where: { id: req.params.avatarId, userId: req.userId! },
      select: { id: true },
    });

    if (!avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    await prisma.avatar.delete({ where: { id: avatar.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Video generation
app.post("/api/v1/video", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = CreateVideoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid video request", issues: parsed.error.flatten() });
      return;
    }

    let references: Array<{ url: string }> = [];
    if (parsed.data.avatarId) {
      const avatar = await prisma.avatar.findFirst({
        where: { id: parsed.data.avatarId, userId: req.userId! },
        include: { avatarImages: true },
      });
      if (!avatar) {
        res.status(404).json({ message: "Avatar not found" });
        return;
      }

      // Video providers must be able to fetch the URL. Prefer the original public source image
      // instead of a localhost-generated asset during local development.
      const publicSource = avatar.avatarImages.find(
        (item) => item.type === "User" && !item.url.includes("localhost"),
      );
      const fallback = avatar.avatarImages.find((item) => item.type === "User") ?? avatar.avatarImages[0];
      const image = publicSource ?? fallback;
      if (image) references = [{ url: image.url }];
    }

    const video = await prisma.avatarVideo.create({
      data: {
        userId: req.userId!,
        prompt: parsed.data.prompt,
        duration: parsed.data.duration,
        width: parsed.data.aspectRatio === "9:16" ? 720 : 1280,
        height: parsed.data.aspectRatio === "9:16" ? 1280 : 720,
        status: "Pending",
        startFrame: parsed.data.startFrame,
        endFrame: parsed.data.endFrame,
      },
    });

    try {
      const job = await generateVideo({
        prompt: parsed.data.prompt,
        model: parsed.data.model ?? process.env.OPENROUTER_VIDEO_MODEL ?? "google/veo-3.1-lite",
        duration: parsed.data.duration,
        resolution: parsed.data.resolution,
        aspectRatio: parsed.data.aspectRatio,
        generateAudio: parsed.data.generateAudio,
        references,
        startFrame: parsed.data.startFrame,
        endFrame: parsed.data.endFrame,
      });

      const updated = await prisma.avatarVideo.update({
        where: { id: video.id },
        data: {
          status: job.status === "completed" ? "Done" : "Processing",
          providerJobId: job.id,
          outputUrl: job.unsigned_urls?.[0],
          error: job.error,
        },
      });

      res.status(202).json({ video: updated, providerJobId: job.id, providerStatus: job.status });
    } catch (error) {
      await prisma.avatarVideo.update({
        where: { id: video.id },
        data: { status: "Error", error: error instanceof Error ? error.message : "Video submission failed" },
      });
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/video/:videoId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const video = await prisma.avatarVideo.findFirst({
      where: { id: req.params.videoId, userId: req.userId! },
      include: { avatarVideoReferences: { include: { avatar: true } } },
    });

    if (!video) {
      res.status(404).json({ message: "Video not found" });
      return;
    }

    if (video.providerJobId && (video.status === "Pending" || video.status === "Processing")) {
      try {
        const provider = await getVideoGeneration(video.providerJobId);
        const nextStatus = provider.status === "completed" ? "Done" : provider.status === "failed" ? "Error" : "Processing";

        const updated = await prisma.avatarVideo.update({
          where: { id: video.id },
          data: {
            status: nextStatus,
            outputUrl: provider.unsigned_urls?.[0] ?? video.outputUrl,
            error: provider.error ?? video.error,
          },
          include: { avatarVideoReferences: { include: { avatar: true } } },
        });

        res.json({ video: updated, provider });
        return;
      } catch (error) {
        res.json({ video, providerError: error instanceof Error ? error.message : "Provider status unavailable" });
        return;
      }
    }

    res.json({ video });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/videos", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const videos = await prisma.avatarVideo.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      include: { avatarVideoReferences: { include: { avatar: true } } },
    });
    res.json({ videos });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/models", async (_req, res, next) => {
  try {
    const result = await listVideoModels();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  console.error(error);
  res.status(500).json({ message });
});

app.listen(port, () => {
  console.log(`HiggsFlow backend running on http://localhost:${port}`);
});
