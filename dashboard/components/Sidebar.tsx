import Link from "next/link";

// Navegación del tablero ejecutivo único. Las entradas por agente se podrán
// generar desde el registro en una iteración posterior.
const NAV = [
  { href: "/", label: "Resumen" },
  { href: "/peticiones", label: "Peticiones Ciudadanas" },
];

export default function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-slate-100">
      <div className="border-b border-slate-700 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Núcleo Operativo
        </p>
        <p className="mt-1 text-sm text-slate-400">Tablero ejecutivo</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-slate-700 px-6 py-4 text-xs text-slate-500">
        Fase 1 · Claude · datos sintéticos
      </div>
    </aside>
  );
}
