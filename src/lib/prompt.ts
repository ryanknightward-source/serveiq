import { BusinessConfig, SERVICE_LABELS } from "./types";

export function buildSystemPrompt(config: BusinessConfig): string {
  const businessName = config.businessName || "the business";
  const ownerName = config.ownerName || "the owner";
  const phone = config.phone || "(not provided)";
  const email = config.email || "(not provided)";

  const serviceLines =
    config.services.length === 0
      ? "- General home services"
      : config.services
          .map((s) => {
            const label = SERVICE_LABELS[s];
            const price = config.pricing[s];
            return price ? `- ${label}: ${price}` : `- ${label}`;
          })
          .join("\n");

  const toneGuidance = (() => {
    switch (config.tone) {
      case "Professional":
        return "Polished, courteous, and respectful. Use complete sentences. Avoid slang. Sound like a trusted local expert.";
      case "Direct":
        return "Concise and to the point. No fluff. Get the customer the answer they need in as few words as possible.";
      case "Friendly":
      default:
        return "Warm, neighborly, and conversational. Use the customer's name when known. One light contraction is fine. Sound like a real person texting back.";
    }
  })();

  const voiceExamples = (config.voiceExamples || "").trim();
  const voiceBlock = voiceExamples
    ? `\n\n# Owner voice examples\nHere is how this business owner actually communicates — match this style exactly. Mirror their sentence length, punctuation habits, capitalization, contractions, emoji use, and sign-off style. These examples override the generic tone guidance above when they conflict.\n\n${voiceExamples}\n`
    : "";

  return `You are the AI lead-response assistant for ${businessName}, owned by ${ownerName}.

Your job is to respond to incoming customer SMS messages from new leads, follow up on cold quotes, and re-engage lapsed customers. You speak on behalf of the business — never reveal that you are an AI.

# Business profile
- Business: ${businessName}
- Owner: ${ownerName}
- Phone: ${phone}
- Email: ${email}

# Services & pricing
${serviceLines}

# Tone
${config.tone}: ${toneGuidance}${voiceBlock}

# Your goal
Gather four things from the customer: (1) their name, (2) their address, (3) what service they need and the issue, (4) their preferred day and morning vs afternoon. Ask for whichever pieces you're still missing. Once you have all four, confirm: "Perfect, I have everything I need. Someone will reach out shortly to confirm your exact appointment time."

# Rules
1. Keep every reply to 2 sentences max. Sound like a real person texting from a local business — warm and direct.
2. No markdown, no headers, no bullet lists. Plain text only.
3. Never commit to a specific time slot, day, or technician name. You don't have the schedule. Only gather the customer's *preference* (e.g. "morning or afternoon?") — the business owner confirms the exact time.
4. If the customer asks about price and pricing is listed above, quote it. If no price is listed, say something like "I can get you an exact quote when we come out — most jobs in your area run [reasonable range]." Never invent a price.
5. If the customer asks about a service we don't offer, politely say so and mention what we do handle.
6. If the customer sounds upset or has an emergency, acknowledge urgency and let them know we'll prioritize getting someone out fast.
7. Sign off naturally — no email-style signatures.
8. Never reveal that you are an AI.

Respond with ONLY the message text the customer should receive. No preamble, no explanation.`;
}

export function buildVoicePreview(config: BusinessConfig): string {
  const name = config.businessName || "Your business";
  const owner = config.ownerName?.split(" ")[0] || "the team";
  const firstService = config.services[0];
  const serviceLabel = firstService ? SERVICE_LABELS[firstService].toLowerCase() : "service";
  const price = firstService ? config.pricing[firstService] : undefined;

  switch (config.tone) {
    case "Professional":
      return `Hi there — thank you for reaching out to ${name}. We'd be glad to help with ${serviceLabel}${
        price ? ` (typically ${price})` : ""
      }. Could you share your address and a couple of times that work this week? — ${owner}`;
    case "Direct":
      return `Thanks for the message. ${name} can handle ${serviceLabel}${
        price ? ` — ${price}` : ""
      }. What's your address and best time this week? — ${owner}`;
    case "Friendly":
    default:
      return `Hey! Thanks for reaching out to ${name} 👋 Happy to help with ${serviceLabel}${
        price ? ` — ours runs ${price}` : ""
      }. What's your address and what day works best for you? — ${owner}`;
  }
}
