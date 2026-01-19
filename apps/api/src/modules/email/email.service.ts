
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { render } from 'jsx-email';
import { VerifyEmailTemplate } from './templates/verify-email';
import { ResetPasswordTemplate } from './templates/reset-password';


@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly webUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not set. Email sending will be disabled or mocked.');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';
    this.webUrl = this.configService.get<string>('WEB_URL') || 'http://localhost:3001';
  }

  async sendVerificationEmail(email: string, token: string) {
    if (!this.resend.key) {
        this.logger.log(`[MOCK EMAIL] To: ${email}, Link: ${this.webUrl}/verify-email?token=${token}`);
        return;
    }

    const html = await render(VerifyEmailTemplate({ verifyUrl: `${this.webUrl}/verify-email?token=${token}` }));

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify your email address',
        html,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    if (!this.resend.key) {
        this.logger.log(`[MOCK EMAIL] To: ${email}, Link: ${this.webUrl}/reset-password?token=${token}`);
        return;
    }

    const html = await render(ResetPasswordTemplate({ resetUrl: `${this.webUrl}/reset-password?token=${token}` }));

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset your password',
        html,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }
}
