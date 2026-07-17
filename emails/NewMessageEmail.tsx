import React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Preview,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';

interface NewMessageEmailProps {
  ownerName: string;
  portfolioUsername: string;
  senderName: string;
  senderEmail: string;
  messagePreview: string;
}

export default function NewMessageEmail({
  ownerName = 'User',
  portfolioUsername = 'username',
  senderName = 'Someone',
  senderEmail = 'someone@example.com',
  messagePreview = 'Hello, this is a message.',
}: NewMessageEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Pesan baru dari {senderName} di portofolio Anda</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Pesan Baru 📩</Heading>
          <Text style={text}>Halo {ownerName},</Text>
          <Text style={text}>
            Anda baru saja menerima pesan dari portofolio publik Anda (
            <strong>/{portfolioUsername}</strong>).
          </Text>

          <Section style={messageBox}>
            <Text style={messageDetail}>
              <strong>Dari:</strong> {senderName} ({senderEmail})
            </Text>
            <Hr style={hr} />
            <Text style={messageContent}>&quot;{messagePreview}&quot;</Text>
          </Section>

          <Section style={btnContainer}>
            <Link style={button} href={`https://hgzport.com/dashboard/portfolios`}>
              Buka Dashboard
            </Link>
          </Section>
          
          <Text style={footer}>
            Email ini dikirim secara otomatis. Anda bisa mematikan notifikasi ini di pengaturan akun.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
};

const messageBox = {
  padding: '24px',
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  margin: '20px 40px',
};

const messageDetail = {
  color: '#52525b',
  fontSize: '14px',
  margin: '0 0 12px',
};

const hr = {
  borderColor: '#e4e4e7',
  margin: '12px 0',
};

const messageContent = {
  color: '#18181b',
  fontSize: '15px',
  fontStyle: 'italic',
  margin: '0',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#06b6d4',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#a1a1aa',
  fontSize: '12px',
  lineHeight: '24px',
  padding: '0 40px',
  textAlign: 'center' as const,
};
