/**
 * @module ArchitecturePanel
 * @description Sticky sidebar panel displaying the system architecture overview.
 *
 * Provides at-a-glance technical context for the QA Copilot stack:
 * - Frontend Layer: React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion
 * - API Layer: Express 5 with Zod request validation
 * - Prompt Engineering: Structured builder with coverage strategy
 * - Output Validation: Zod schema enforcement on all 9 test case fields
 * - Roadmap: Future integration plans (Jira OAuth, XRAY/Zephyr export)
 *
 * The panel is position: sticky to remain visible while scrolling through
 * generated test case results in the center column.
 *
 * @author Asif
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { Layers, Server, Code2, ShieldCheck, Route } from "lucide-react";

export function ArchitecturePanel() {
  /** Architecture notes — each entry maps to a visual card with icon + description */
  const notes = [
    {
      icon: <Layers className="h-5 w-5 text-indigo-400" />,
      title: "Frontend Layer",
      desc: "React 19 + Vite, TypeScript, Tailwind CSS v4, Framer Motion. Powered by generated API hooks.",
    },
    {
      icon: <Server className="h-5 w-5 text-emerald-400" />,
      title: "API Layer",
      desc: "Express 5 + TypeScript. Exposes POST /api/generate with strict Zod request validation.",
    },
    {
      icon: <Code2 className="h-5 w-5 text-amber-400" />,
      title: "Prompt Engineering",
      desc: "Structured prompt builder covering positive, negative, and edge cases. Enforces rigid JSON format.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-rose-400" />,
      title: "Output Validation",
      desc: "Zod schemas validate all 9 test case fields before returning to client, dropping malformed LLM responses.",
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
