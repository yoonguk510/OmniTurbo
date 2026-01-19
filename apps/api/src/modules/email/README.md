# Email Module

This module is responsible for sending transactional emails for the application.

## Features

- **JSX for Email Templates**: Uses [JSX Email](https://jsx.email/) to build email templates with React components. This allows for creating beautiful, maintainable, and type-safe emails.
- **Email Delivery**: Integrated with [Resend](https://resend.com/) for reliable email delivery.
- **Mocking**: During development, if a `RESEND_API_KEY` is not provided, the email service will log the email content to the console instead of sending a real email.

## Templates

Email templates are located in the `templates` directory. They are standard React components that can be styled and customized as needed.

- `verify-email.tsx`: Template for the email verification link.
- `reset-password.tsx`: Template for the password reset link.

## Usage

The `EmailService` is injected into other services (e.g., `AuthService`) to send emails when certain events occur, such as user registration or a password reset request.

To send an email, call the appropriate method on the `EmailService`:

```typescript
// Example from AuthService
await this.emailService.sendVerificationEmail(user.email, token);
```
