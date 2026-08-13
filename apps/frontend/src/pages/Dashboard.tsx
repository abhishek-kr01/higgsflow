import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Avatar } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router";

export function Dashboard() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const avatars = useQuery({
    queryKey: ["avatars"],
    queryFn: async () => (await api.get<{ avatars: Avatar[] }>("/api/v1/avatars")).data.avatars,
  });

  const createAvatar = useMutation({
    mutationFn: async () => (await api.post("/api/v1/avatar", { name, image })).data,
    onSuccess: () => {
      setName("");
      setImage("");
      queryClient.invalidateQueries({ queryKey: ["avatars"] });
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm text-zinc-500">Workspace</p><h1 className="text-4xl font-semibold">Your avatars</h1></div>
          <Link to="/video-creator"><Button>Generate a video</Button></Link>
        </div>

        <Card className="mt-8 border-white/10 bg-zinc-950 p-6 text-white">
          <h2 className="text-xl font-semibold">Create avatar</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input placeholder="Avatar name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Public source image URL" value={image} onChange={(e) => setImage(e.target.value)} />
          </div>
          {createAvatar.isError && <p className="mt-3 text-sm text-red-400">{(createAvatar.error as any)?.response?.data?.message ?? "Could not create avatar"}</p>}
          <Button className="mt-4" disabled={createAvatar.isPending || !name || !image} onClick={() => createAvatar.mutate()}>
            {createAvatar.isPending ? "Generating..." : "Create avatar"}
          </Button>
        </Card>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Library</h2>
          {avatars.isLoading ? <p className="mt-4 text-zinc-500">Loading...</p> : null}
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {avatars.data?.map((avatar) => {
              const image = avatar.avatarImages.find((item) => item.type === "Model") ?? avatar.avatarImages[0];
              return <Card key={avatar.id} className="overflow-hidden border-white/10 bg-zinc-950 text-white">
                {image && <img src={image.url} alt={avatar.name} className="aspect-square w-full object-cover" />}
                <div className="p-4"><div className="font-medium">{avatar.name}</div><div className="mt-2 text-sm text-zinc-500">{avatar.avatarImages.length} image(s)</div></div>
              </Card>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
