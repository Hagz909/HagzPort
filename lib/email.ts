import { Resend } from 'resend';
import NewMessageEmail from '@/emails/NewMessageEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

interface NewMessageParams {
  ownerEmail: string;
  ownerName: string;
  portfolioUsername: string;
  senderName: string;
  senderEmail: string;
  messagePreview: string;
}

export async function sendNewMessageNotification(params: NewMessageParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: params.ownerEmail,
      subject: `📨 Pesan baru di portofolio /${params.portfolioUsername}`,
      react: NewMessageEmail(params),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception in sendNewMessageNotification:', error);
    return { success: false, error };
  }
}
