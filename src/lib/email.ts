import { Resend } from 'resend';

let resendClient: Resend | null = null;

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

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string,
  subject: string,
  text: string,
  html?: string,
}) {

  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: 'Review4Mastering <noreply@review4mastering.nekagentic.fr>',
    to: [to],
    subject,
    text,
    html: html || text,

  });

  if (error) {
    console.error('Email send error:', error);
    throw error
  }
  return data;

}
