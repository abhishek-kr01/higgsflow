import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Video } from "@/components/Video";

const demos = [
  { title: "Cinematic portrait", url: "https://cdn.higgsfield.ai/card/e74330e3-39d7-470b-817a-483cce45c255.mp4" },
  { title: "Fashion motion study", url: "https://cdn.higgsfield.ai/card/7f5704c9-77bd-416a-8d7f-8f7e8baf6a21.mp4" },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-24 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-zinc-500">AI creative studio</p>
        <h1 className="mx-auto max-w-5xl text-5xl font-semibold tracking-tight sm:text-7xl">Create cinematic AI images and videos from one workflow.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">Build reusable avatars, generate profile imagery, and turn your creative direction into short-form video.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/signup"><Button size="lg">Start creating</Button></Link>
          <Link to="/video-creator"><Button size="lg" variant="outline">Explore creator</Button></Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 md:grid-cols-2">
        {demos.map((demo) => <Video key={demo.url} {...demo} />)}
      </section>
    </main>
  );
}
