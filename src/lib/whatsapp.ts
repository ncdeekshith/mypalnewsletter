type WhatsAppReminderInput = {
  to: string;
  month: string;
  date: string;
};

export async function sendWhatsAppReminder(input: WhatsAppReminderInput) {
  const apiKey = process.env.MSGKART_API_KEY;
  const phoneNumberId = process.env.MSGKART_PHONE_NUMBER_ID;
  const apiUrl = process.env.MSGKART_API_URL;

  if (!apiKey || !phoneNumberId || !apiUrl) {
    return { ok: false, status: "not_configured" };
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-api-key": apiKey
    },
    body: JSON.stringify({
      message: {
        messageType: "template",
        name: "newsletter_reminder",
        language: "en_US",
        components: [
          {
            componentType: "body",
            parameters: [
              { type: "text", text: input.month },
              { type: "text", text: input.date }
            ]
          }
        ]
      },
      to: input.to,
      phoneNumberId
    })
  });

  return { ok: response.ok, status: response.status, body: await response.text().catch(() => "") };
}
