export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-40 bg-slate-200 rounded-lg" />
      <div className="h-10 bg-slate-100 rounded-xl" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl" />
      ))}
    </div>
  );
}
