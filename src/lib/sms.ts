// ── SMS Provider (Infobip) ──────────────────────────────────
// Used for phone verification.
// Set INFOBIP_API_KEY and INFOBIP_BASE_URL in .env.local
// Alternatively supports Twilio via TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

export async function sendSMS(to: string, message: string): Promise<void> {
  const provider = process.env.SMS_PROVIDER || 'infobip';

  if (provider === 'twilio') {
    await sendViaTwilio(to, message);
  } else {
    await sendViaInfobip(to, message);
  }
}

async function sendViaInfobip(to: string, message: string): Promise<void> {
  const apiKey = process.env.INFOBIP_API_KEY;
  const baseUrl = process.env.INFOBIP_BASE_URL;

  if (!apiKey || !baseUrl) {
    throw new Error('INFOBIP_API_KEY and INFOBIP_BASE_URL must be set');
  }

  const res = await fetch(`${baseUrl}/sms/2/text/advanced`, {
    method: 'POST',
    headers: {
      Authorization: `App ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          from: 'NudiNadi',
          destinations: [{ to: to.replace(/\s+/g, '') }],
          text: message,
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Infobip SMS failed (${res.status}): ${body}`);
  }
}

async function sendViaTwilio(to: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER must be set');
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to.replace(/\s+/g, ''),
        From: fromNumber,
        Body: message,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twilio SMS failed (${res.status}): ${body}`);
  }
}
