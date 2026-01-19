
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'jsx-email';
import * as React from 'react';

interface ResetPasswordTemplateProps {
  resetUrl: string;
}

export const ResetPasswordTemplate = ({ resetUrl }: ResetPasswordTemplateProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          Someone requested a password reset for your account. If this was you, click the link below to reset it.
        </Text>
        <Section style={btnContainer}>
          <Link href={resetUrl} style={btn}>
            Reset Password
          </Link>
        </Section>
        <Text style={text}>
          If you didn't request this, you can ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '560px',
};

const h1 = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginTop: '48px',
};

const text = {
  fontSize: '16px',
  margin: '24px 0',
  color: '#333',
};

const btnContainer = {
  textAlign: 'center' as const,
};

const btn = {
  backgroundColor: '#5F51E8',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};
