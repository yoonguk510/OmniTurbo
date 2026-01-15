import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Login"
      description="Enter your email below to login to your account"
      backButton={{ label: "Back to Home", href: "/" }}
    >
      <LoginForm />
    </AuthLayout>
  )
}
