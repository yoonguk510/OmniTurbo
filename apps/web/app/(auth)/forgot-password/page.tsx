import { AuthLayout } from "@/components/auth/auth-layout"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Enter your email to reset your password",
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email address and we'll send you a link to reset your password"
      backButton={{ label: "Back to Login", href: "/login" }}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
