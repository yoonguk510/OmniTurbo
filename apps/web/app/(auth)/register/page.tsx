import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account to get started",
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Enter your email below to create your account"
      backButton={{ label: "Back to Home", href: "/" }}
    >
      <RegisterForm />
    </AuthLayout>
  )
}
