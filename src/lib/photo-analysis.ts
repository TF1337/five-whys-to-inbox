import { z } from "zod";
import type { CoachForm } from "@/data/examples";

export const ZONES = ["Inbound", "Opslag", "Orderpick", "Pakstraat", "Outbound", "Retouren"] as const;
export const analysisSchema = z.object({
  what: z.string(),
  who: z.string(),
  when: z.string(),
  location: z.string(),
  problemWhy: z.string(),
  extent: z.string(),
  why: z.string(),
  how: z.string(),
  whys: z.array(z.object({ question: z.string(), answer: z.string() }).strict()),
}).strict();
export type PhotoAnalysis = z.infer<typeof analysisSchema>;

export function isCompletelyFilled(form: CoachForm): boolean {
  const answers = form.whys.filter((w) => w.question.trim().length > 0);
  return (
    [form.who, form.when, form.location, form.problemWhy, form.extent].every(value => Boolean(value?.trim())) &&
    form.what.trim().length > 0 &&
    form.why.trim().length > 0 &&
    form.how.trim().length > 0 &&
    answers.length === 5 &&
    answers.every((w) => w.answer.trim().length > 0)
  );
}

export function applyPhotoAnalysis(form: CoachForm, analysis: PhotoAnalysis): CoachForm {
  if ([analysis.who, analysis.when, analysis.location, analysis.problemWhy, analysis.extent].some(value => !value.trim()) || analysis.whys.length !== 5 || !analysis.what.trim() || !analysis.why.trim() || !analysis.how.trim() || analysis.whys.some(w => !w.question.trim() || !w.answer.trim())) {
    throw new Error("De fotoanalyse is onvolledig; je bestaande invoer is behouden.");
  }
  return { ...form, who: form.who?.trim() ? form.who : analysis.who, when: form.when?.trim() ? form.when : analysis.when, location: form.location?.trim() ? form.location : analysis.location, problemWhy: form.problemWhy?.trim() ? form.problemWhy : analysis.problemWhy, extent: form.extent?.trim() ? form.extent : analysis.extent, what: analysis.what, why: analysis.why, how: analysis.how, description: analysis.what, whys: analysis.whys };
}