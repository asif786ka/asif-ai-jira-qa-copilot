import { useState, useEffect } from "react";
import { setApiPrefix, getApiPrefix } from "@workspace/api-client-react";
import { Server, Zap } from "lucide-react";

type BackendType = "node" | "python";

const STORAGE_KEY = "preferred-backend";

const BACKENDS: Record<BackendType, { label: string; prefix: string; tech: string; color: string }> = {
  node: {
    label: "Node.js",
    prefix: "/api",
    tech: "Express + Zod",
    color: "from-green-500 to-emerald-400",
  },
  python: {
    label: "Python",
    prefix: "/pyapi",
    tech: "FastAPI + Pydantic",
    color: "from-blue-500 to-cyan-400",
  },
};

function getStoredBackend(): BackendType {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "node" || stored === "python") return stored;
  } catch {}
  return "node";
}

export function BackendSwitcher() {
  const [active, setActive] = useState<BackendType>(getStoredBackend);

  useEffect(() => {
    setApiPrefix(BACKENDS[active].prefix);
  }, [active]);

  const toggle = () => {
    const next: BackendType = active === "node" ? "python" : "node";
    setActive(next);
    localStorage.setItem(STORAGE_KEY, next);
    setApiPrefix(BACKENDS[next].prefix);
  };

  const current = BACKENDS[active];

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 group"
      title={`Switch backend (currently: ${current.label} / ${current.tech})`}
    >
      <div className="flex items-center gap-1.5">
        {active === "node" ? (
          <Server className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Zap className="w-3.5 h-3.5 text-blue-400" />
        )}
        <span className={`text-xs font-semibold bg-gradient-to-r ${current.color} bg-clip-text text-transparent`}>
          {current.label}
        </span>
      </div>
      <span className="text-[10px] text-gray-500 hidden sm:inline">
        {current.tech}
      </span>
    </button>
  );
}
