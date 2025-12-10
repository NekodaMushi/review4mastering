import { Resend } from 'resend';


const resend = new Resend(process.env.RESEND_API_KEY)

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
  try {
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
  
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
