export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-7 w-52 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 bg-slate-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-100 rounded-xl" />
    </div>
  );
}
