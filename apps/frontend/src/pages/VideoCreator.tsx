import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Avatar, VideoJob } from "@/lib/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router";

export function VideoCreator() {
  const [prompt, setPrompt] = useState("");
  const [avatarId, setAvatarId] = useState("");
  const [duration, setDuration] = useState("8");
  const [resolution, setResolution] = useState("720p");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [activeId, setActiveId] = useState<string | null>(null);

  const avatars = useQuery({
    queryKey: ["avatars"],
    queryFn: async () => (await api.get<{ avatars: Avatar[] }>("/api/v1/avatars")).data.avatars,
  });

  const videos = useQuery({
    queryKey: ["videos"],
    queryFn: async () => (await api.get<{ videos: VideoJob[] }>("/api/v1/videos")).data.videos,
    refetchInterval: 5000,
  });

  const createVideo = useMutation({
    mutationFn: async () => (await api.post<{ video: VideoJob }>("/api/v1/video", {
      prompt,
      avatarId: avatarId || undefined,
      duration: Number(duration),
      resolution,
      aspectRatio,
      generateAudio: false,
    })).data.video,
    onSuccess: (video) => {
      setActiveId(video.id);
      setPrompt("");
      videos.refetch();
    },
  });

  const activeVideo = videos.data?.find((video) => video.id === activeId);

  useEffect(() => {
    if (!activeId) return;
    const timer = window.setInterval(async () => {
      const response = await api.get<{ video: VideoJob }>(`/api/v1/video/${activeId}`);
      if (response.data.video.status === "Done" || response.data.video.status === "Error") {
        setActiveId(null);
        videos.refetch();
        window.clearInterval(timer);
      } else {
        videos.refetch();
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activeId]);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between"><div><p className="text-sm text-zinc-500">Studio</p><h1 className="text-4xl font-semibold">Video creator</h1></div><Link to="/dashboard"><Button variant="outline">Manage avatars</Button></Link></div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="border-white/10 bg-zinc-950 p-6 text-white">
            <h2 className="text-xl font-semibold">Prompt to video</h2>
            <Textarea className="mt-4 min-h-36" placeholder="Describe the scene, subject, camera movement, lighting and mood..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <select className="h-10 rounded-md border border-white/10 bg-black px-3" value={avatarId} onChange={(e) => setAvatarId(e.target.value)}><option value="">No avatar</option>{avatars.data?.map((avatar) => <option key={avatar.id} value={avatar.id}>{avatar.name}</option>)}</select>
              <select className="h-10 rounded-md border border-white/10 bg-black px-3" value={duration} onChange={(e) => setDuration(e.target.value)}><option value="4">4s</option><option value="6">6s</option><option value="8">8s</option><option value="10">10s</option><option value="12">12s</option><option value="15">15s</option></select>
              <select className="h-10 rounded-md border border-white/10 bg-black px-3" value={resolution} onChange={(e) => setResolution(e.target.value)}><option>480p</option><option>720p</option><option>1080p</option></select>
            </div>
            <div className="mt-3"><select className="h-10 rounded-md border border-white/10 bg-black px-3" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option><option>4:3</option><option>3:4</option></select></div>
            {createVideo.isError && <p className="mt-3 text-sm text-red-400">{(createVideo.error as any)?.response?.data?.message ?? "Video request failed"}</p>}
            <Button className="mt-5" disabled={createVideo.isPending || prompt.length < 5} onClick={() => createVideo.mutate()}>{createVideo.isPending ? "Submitting..." : "Generate video"}</Button>
          </Card>
          <Card className="border-white/10 bg-zinc-950 p-6 text-white"><h2 className="font-semibold">Current job</h2>{activeVideo ? <div className="mt-4 space-y-2 text-sm"><div>Status: <span className="text-white">{activeVideo.status}</span></div><p className="text-zinc-400">{activeVideo.prompt}</p>{activeVideo.outputUrl && <video className="mt-4 w-full rounded-lg" controls src={activeVideo.outputUrl} />}</div> : <p className="mt-4 text-sm text-zinc-500">Generate a video to see its status here.</p>}</Card>
        </div>
        <section className="mt-10"><h2 className="text-2xl font-semibold">Recent videos</h2><div className="mt-5 grid gap-5 md:grid-cols-2">{videos.data?.map((video) => <Card key={video.id} className="border-white/10 bg-zinc-950 p-4 text-white"><div className="flex items-center justify-between"><span className="font-medium">{video.status}</span><span className="text-xs text-zinc-500">{new Date(video.createdAt).toLocaleString()}</span></div><p className="mt-3 line-clamp-3 text-sm text-zinc-400">{video.prompt}</p>{video.outputUrl && <video className="mt-4 w-full rounded-lg" controls src={video.outputUrl} />}{video.error && <p className="mt-3 text-xs text-red-400">{video.error}</p>}</Card>)}</div></section>
      </div>
    </main>
  );
}
