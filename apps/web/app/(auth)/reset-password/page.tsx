import { Suspense } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Enter your new password to reset",
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      description="Enter your new password below"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
