'use client';

// A non-interactive ghost item shown during tutorial step 'inventory-sell'
// when the user has no real items yet. Not persisted to DB.

export function GhostItemCard() {
  return (
    <li
      data-tutorial="ghost-item"
      className="relative group px-5 py-4 opacity-60 pointer-events-none select-none"
    >
      {/* Tutorial badge */}
      <div className="absolute top-2 right-3 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
        Beispiel
      </div>

      <div className="flex items-center gap-4">
        {/* Platform badge */}
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700 shrink-0">
          Kleinanzeigen
        </span>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">Vintage Kamera</p>
          <p className="text-xs text-gray-400 mt-0.5">Gekauft für 15,00 €</p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-gray-500 font-medium">Auf Lager</span>
        </div>

        {/* Ghost sell button */}
        <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Verkaufen
        </div>
      </div>
    </li>
  );
}
