import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { Layers, Server, Code2, ShieldCheck, Route } from "lucide-react";

export function ArchitecturePanel() {
  const notes = [
    {
      icon: <Layers className="h-5 w-5 text-indigo-400" />,
      title: "Frontend Layer",
      desc: "React 19 + Vite, TypeScript, Tailwind CSS v4, Framer Motion. Powered by generated API hooks with runtime backend switching.",
    },
    {
      icon: <Server className="h-5 w-5 text-blue-400" />,
      title: "API Layer",
      desc: "FastAPI + Python 3.12. Exposes POST /api/generate with strict Pydantic v2 request validation. Async OpenAI client.",
    },
    {
      icon: <Code2 className="h-5 w-5 text-amber-400" />,
      title: "Prompt Engineering",
      desc: "Modular prompt builders in Python. Structured coverage: positive, negative, and edge cases. Enforces rigid JSON format.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-rose-400" />,
      title: "Output Validation",
      desc: "Pydantic models validate all 9 test case fields. @model_validator enforces 3–6 count. Malformed LLM responses are rejected.",
    },
    {
      icon: <Route className="h-5 w-5 text-cyan-400" />,
      title: "Roadmap",
      desc: "Upcoming: Jira OAuth integration, export to XRAY/Zephyr, batch ticket processing.",
    },
  ];

  return (
    <Card className="bg-[#11131A] border-white/5 shadow-2xl sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Server className="h-5 w-5" />
          System Architecture
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {notes.map((note, i) => (
          <div key={i} className="flex gap-4 items-start group">
            <div className="mt-1 p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              {note.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-200">{note.title}</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{note.desc}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
