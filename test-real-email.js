require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('Sending email using key:', process.env.RESEND_API_KEY.substring(0, 8) + '...');
  
  // We will try sending to the two possible real emails in DB
  const emails = ['ilhammusyaffa56@gmail.com', 'aryawijaya123@gmail.com'];
  
  for (const toEmail of emails) {
    try {
      console.log(`\nAttempting to send to: ${toEmail}`);
      const data = await resend.emails.send({
        from: `HgzPort Notifikasi <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: toEmail,
        subject: '🚀 Test Langsung dari Resend API',
        html: '<p>Halo! Ini adalah email test langsung dari sistem backend ke akun Anda.</p>'
      });
      console.log('Success response:', data);
    } catch (err) {
      console.error('Failed to send to', toEmail, 'Error:', err);
    }
  }
}

testEmail();
