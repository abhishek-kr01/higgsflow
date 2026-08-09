import express from "express";
import { prisma } from "./db";
import z from "zod";
import { CreateAvatarSchema, CreateUserSchema } from "./types";
import { createImage } from "./image";
import { uuidv4 } from "uuidv4";

const app = express();

app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
  const { success, data } = CreateUserSchema.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Incorrect credentials",
    });
    return;
  }
  const user = await prisma.user.create({
    data: {
      username: req.body.username,
      password: req.body.password,
    },
  });
  res.json({
    id: user.id,
  });
});

app.post("/api/v1/signin", (req, res) => {});

app.post("/api/v1/avatar", async (req, res) => {
  const { success, data } = CreateAvatarSchema.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Incorrect",
    });
    return;
  }

  const leftProfileId = uuidv4();
  const rightProfileId = uuidv4();
  const frontProfileId = uuidv4();
  await Promise.all([
    createImage(
      "Create a side profile for the user for the left side. it should be a high quality profile shoot type photo",
      data.image,
      `./assets${leftProfileId}.png`,
    ),
    createImage(
      "Create a side profile for the user for the right side. it should be a high quality profile shoot type photo",
      data.image,
      `./assets${rightProfileId}.png`,
    ),
    createImage(
      "Create a side profile for the user for the front side. it should be a high quality profile shoot type photo",
      data.image,
      `./assets${frontProfileId}.png`,
    ),
  ]);
});

// put in s3 and  than put in db

app.post("/api/v1/video", (req, res) => {});

app.get("/api/v1/video/:videoId", (req, res) => {});

app.get("/api/v1/videos", (req, res) => {});

app.get("/api/v1/me", (req, res) => {});

app.get("/api/v1/models", (req, res) => {});

app.get("/api/v1/avatar/:avatarId", (req, res) => {});

app.get("/api/v1/avatars", (req, res) => {});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
