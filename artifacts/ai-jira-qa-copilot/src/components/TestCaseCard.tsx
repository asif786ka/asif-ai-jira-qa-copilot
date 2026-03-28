/**
 * @module TestCaseCard
 * @description Renders a single AI-generated QA test case as an expandable card.
 *
 * Visual Architecture:
 * - Header: Test case ID badge, priority badge (color-coded), automation candidacy pill
 * - Body: Scenario title and tag chips
 * - Collapsible sections: Preconditions, Test Steps, Test Data, Expected Result
 *   (each with Framer Motion height animations)
 *
 * The card uses staggered entry animations (delay based on index) for a
 * cascading reveal effect when multiple cards render simultaneously.
 *
 * All data is typed via the generated TestCase interface from the OpenAPI spec,
 * ensuring compile-time safety across the full stack.
 *
 * @author Asif
 */

import { useState } from "react";
import { Badge, Card } from "@/components/ui/primitives";
import { ChevronDown, Beaker, CheckCircle2, ListChecks, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TestCase } from "@workspace/api-client-react";

/**
 * TestCaseCard — Displays a single test case with collapsible detail sections.
 *
 * @param data - The TestCase object from the API response
 * @param index - Position in the list, used for staggered animation delay
 */
export function TestCaseCard({ data, index }: { data: TestCase; index: number }) {
  /**
   * Maps priority levels to badge color variants.
   * Critical/high priorities use warm colors for visual urgency.
   */
  const getPriorityColor = (priority?: string | null) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "warning";
      case "medium": return "success";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  /**
   * Reusable accordion section component for test case detail fields.
   * Supports both list-based (items[]) and text-based (text) content.
   * Returns null when no content is provided — clean conditional rendering.
   */
  const AccordionSection = ({ title, icon, items, text }: { title: string; icon: React.ReactNode; items?: string[]; text?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    if ((!items || items.length === 0) && !text) return null;

    return (
      <div className="border-t border-white/5 overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-black/10 hover:bg-white/5 transition-colors focus:outline-none"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
            {icon}
            {title}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4 text-sm text-gray-400 bg-black/10"
            >
              {items ? (
                <ul className="list-disc list-outside ml-5 space-y-1.5 pt-2 marker:text-gray-600">
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <div className="pt-2 pl-2 border-l-2 border-primary/50 text-gray-300">
                  {text}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-white/10 bg-[#1A1D24] shadow-xl hover:border-white/20 transition-all duration-300">
        <div className="p-5 flex flex-col gap-4">
          
          {/* Card header: ID badge, priority badge, automation status */}
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-[10px] uppercase bg-black/30">
                {data.test_case_id}
              </Badge>
              {data.priority && (
                <Badge variant={getPriorityColor(data.priority)} className="capitalize">
                  {data.priority}
                </Badge>
              )}
            </div>
            {data.automation_candidate ? (
              <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                Auto Candidate
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                Manual
              </Badge>
            )}
          </div>

          {/* Test scenario title */}
          <h3 className="text-lg font-display font-medium text-white leading-snug">
            {data.test_scenario}
          </h3>

          {/* Tag chips for categorization (smoke, regression, etc.) */}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Collapsible detail sections — each with its own expand/collapse state */}
        <div className="flex flex-col">
          <AccordionSection
            title="Preconditions"
            icon={<ListChecks className="w-4 h-4 text-amber-500" />}
            items={data.preconditions}
          />
          <AccordionSection
            title="Test Steps"
            icon={<Beaker className="w-4 h-4 text-cyan-500" />}
            items={data.test_steps}
          />
          <AccordionSection
            title="Test Data"
            icon={<Database className="w-4 h-4 text-purple-500" />}
            items={data.test_data}
          />
          <AccordionSection
            title="Expected Result"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            text={data.expected_result}
          />
        </div>
      </Card>
    </motion.div>
  );
}
