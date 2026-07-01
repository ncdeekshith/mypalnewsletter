import { queueEmail } from "@/lib/store";

type MailInput = {
  to: string;
  subject: string;
  body: string;
};

export async function sendMail(input: MailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "myPAL Newsletter <newsletter@mypal.in>";

  if (!apiKey) {
    return queueEmail({
      ...input,
      status: "queued",
      provider: "outbox"
    });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        text: input.body
      })
    });

    if (!response.ok) {
      const message = await response.text();
      return queueEmail({
        ...input,
        status: "failed",
        provider: "resend",
        error: message
      });
    }

    return queueEmail({
      ...input,
      status: "sent",
      provider: "resend"
    });
  } catch (error) {
    return queueEmail({
      ...input,
      status: "failed",
      provider: "resend",
      error: error instanceof Error ? error.message : "Unknown mail error"
    });
  }
}
