import express from "express";
import { prisma } from "./db";
import { CreateAvatarSchema, CreateUserSchema } from "./types";
import { createImage } from "./image";
import { generateVideo } from "./video";
import { uuid } from "uuidv4";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

// Auth
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

// Avatar
app.post("/api/v1/avatar", async (req, res) => {
  const { success, data } = CreateAvatarSchema.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Incorrect",
    });
    return;
  }

  const leftProfileId = uuid();
  const rightProfileId = uuid();
  const frontProfileId = uuid();
  // await Promise.all([
  //   createImage(
  //     "Create a side profile for the user for the left side. it should be a high quality profile shoot type photo",
  //     data.image,
  //     `./assets${leftProfileId}.png`,
  //   ),
  //   createImage(
  //     "Create a side profile for the user for the right side. it should be a high quality profile shoot type photo",
  //     data.image,
  //     `./assets${rightProfileId}.png`,
  //   ),
  //   createImage(
  //     "Create a side profile for the user for the front side. it should be a high quality profile shoot type photo",
  //     data.image,
  //     `./assets${frontProfileId}.png`,
  //   ),
  // ]);

  // put in s3 and  than put in db
  await prisma.avatar.create({
    data: {
      userId: "1",
      name: req.body.name
    }
  })
});



// Video
app.post("/api/v1/video", async (req, res) => {
  await generateVideo(
    "The video opens with a medium, eye-level shot of a beautiful man with dark hair and warm brown eyes. She wears a magnificent, high-fashion flamingo dress with layers of pink and fuchsia feathers, complemented by whimsical pink, heart-shaped sunglasses. She walks with serene confidence through the crystal-clear, shallow turquoise water of a sun-drenched lagoon. The camera slowly pulls back to a medium-wide shot, revealing the breathtaking scene as the dress's long train glides and floats gracefully on the water's surface behind her. The cinematic, dreamlike atmosphere is enhanced by the vibrant colors of the dress against the serene, minimalist landscape, capturing a moment of pure elegance and high-fashion fantasy.",
    [
      "https://media.licdn.com/dms/image/v2/D5603AQGqElTtIq2vUA/profile-displayphoto-scale_400_400/B56Z4GHLOeGsAg-/0/1778219019610?e=1787788800&v=beta&t=-fjhq6bopf7ybHJl8fHo5Ho5O2jZlUwdqKFE_WxFwvQ",
      "https://media.licdn.com/dms/image/v2/D5603AQGqElTtIq2vUA/profile-displayphoto-scale_400_400/B56Z4GHLOeGsAg-/0/1778219019610?e=1787788800&v=beta&t=-fjhq6bopf7ybHJl8fHo5Ho5O2jZlUwdqKFE_WxFwvQ",
    ],
    "./output/video.mp4",
  );
  res.json({});
});

app.get("/api/v1/video/:videoId", (req, res) => {});

app.get("/api/v1/videos", (req, res) => {});

app.get("/api/v1/me", (req, res) => {});

app.get("/api/v1/models", (req, res) => {});

app.get("/api/v1/avatar/:avatarId", (req, res) => {});

app.get("/api/v1/avatars", (req, res) => {});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
