export function Video({ url, title }: { url: string; title: string }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
      <video src={url} className="aspect-video w-full object-cover" controls playsInline preload="metadata" />
      <div className="p-4 text-sm text-zinc-300">{title}</div>
    </article>
  );
}
