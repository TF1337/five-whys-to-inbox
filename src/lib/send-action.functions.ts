import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Placeholder: vervang door het echte ontvangstadres. */
export const ACTION_RECIPIENT = "acties@voorbeeld.nl";

const t = (max: number) => z.string().max(max);

export const actionEmailSchema = z.object({
  submissionId: z.string().uuid(),
  onderwerp: t(100),
  indicatoren: z.array(t(200)).max(30),
  wie: t(200),
  wanneer: t(100),
  waar: t(200),
  wat: t(1500).min(1),
  waarom: t(1500),
  whys: z.array(z.object({ question: t(500), answer: t(1500) })).max(10),
  hoe: t(1500),
  eigenaar: t(200),
  termijn: t(50),
  aanpak: t(100),
  koppeling: t(300),
  score: z.number().nullable(),
});

export type ActionEmail = z.infer<typeof actionEmailSchema>;

export const sendActionEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => actionEmailSchema.parse(input))
  .handler(async () => {
    // Mail versturen wordt actief zodra een e-maildomein is gekoppeld en geverifieerd.
    throw new Error(
      `Mail versturen is nog niet ingesteld. Koppel eerst een e-maildomein; daarna gaat deze actie naar ${ACTION_RECIPIENT}.`,
    );
  });
