
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
interface VerifyEmailTemplateProps {
  verifyUrl: string;
}

export const VerifyEmailTemplate = ({ verifyUrl }: VerifyEmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verify your email address</Heading>
        <Text style={text}>
          Please click the link below to verify your email address and activate your account.
        </Text>
        <Section style={btnContainer}>
          <Link href={verifyUrl} style={btn}>
            Verify Email
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
