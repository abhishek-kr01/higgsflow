import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(128),
});

export const SigninSchema = CreateUserSchema;

export const CreateAvatarSchema = z.object({
  name: z.string().trim().min(1).max(80),
  image: z.string().url(),
});

export const CreateVideoSchema = z.object({
  prompt: z.string().trim().min(5).max(4000),
  avatarId: z.string().uuid().optional(),
  duration: z.coerce.number().int().min(4).max(15).default(8),
  resolution: z.enum(["480p", "720p", "1080p"]).default("720p"),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:3", "3:4"]).default("16:9"),
  model: z.string().trim().optional(),
  generateAudio: z.boolean().default(false),
  startFrame: z.string().url().optional(),
  endFrame: z.string().url().optional(),
});
