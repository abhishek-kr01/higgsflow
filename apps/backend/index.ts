import express from "express";

const app = express();

app.post("/api/v1/signup", (req, res) => {

});

app.post("/api/v1/signin", (req, res) => {

});

app.post("/api/v1/avatar", (req, res) => {

});

app.post("/api/v1/video", (req, res) => {

});

app.get("/api/v1/video/:videoId", (req, res) => {

});

app.get("/api/v1/videos", (req, res) => {

});

app.get("/api/v1/me", (req, res) => {

});

app.get("/api/v1/models", (req, res) => {

});

app.get("/api/v1/avatar/:avatarId", (req, res) => {

});

app.get("/api/v1/avatars", (req, res) => {

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});