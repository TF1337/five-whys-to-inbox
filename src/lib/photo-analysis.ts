import { z } from "zod";
import type { CoachForm } from "@/data/examples";

export const ZONES = ["Inbound", "Opslag", "Orderpick", "Pakstraat", "Outbound", "Retouren"] as const;
export const analysisSchema = z.object({
  what: z.string(),
  why: z.string(),
  how: z.string(),
  whys: z.array(z.object({ question: z.string(), answer: z.string() }).strict()),
}).strict();
export type PhotoAnalysis = z.infer<typeof analysisSchema>;

export function isCompletelyFilled(form: CoachForm): boolean {
  const answers = form.whys.filter((w) => w.question.trim().length > 0);
  return (
    form.what.trim().length > 0 &&
    form.why.trim().length > 0 &&
    form.how.trim().length > 0 &&
    answers.length === 5 &&
    answers.every((w) => w.answer.trim().length > 0)
  );
}

export function applyPhotoAnalysis(form: CoachForm, analysis: PhotoAnalysis): CoachForm {
  if (analysis.whys.length !== 5 || !analysis.what.trim() || !analysis.why.trim() || !analysis.how.trim() || analysis.whys.some(w => !w.question.trim() || !w.answer.trim())) {
    throw new Error("De fotoanalyse is onvolledig; je bestaande invoer is behouden.");
  }
  return { ...form, what: analysis.what, why: analysis.why, how: analysis.how, description: analysis.what, whys: analysis.whys };
}