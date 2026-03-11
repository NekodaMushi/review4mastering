import { Resend } from 'resend';

let resendClient: Resend | null = null;

const DEFAULT_FROM_EMAIL = 'noreply@review4mastering.nekagentic.fr';
const DEFAULT_FROM_NAME = 'Review4Mastering';

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is not defined. Check your environment variables.'
      );
    }

    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

function getFromAddress() {
  const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const fromName = process.env.RESEND_FROM_NAME || DEFAULT_FROM_NAME;

  return `${fromName} <${fromEmail}>`;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: [to],
    subject,
    text,
    html: html || text,
    replyTo,
  });

  if (error) {
    console.error('Email send error:', error);
    throw error;
  }

  return data;
}
