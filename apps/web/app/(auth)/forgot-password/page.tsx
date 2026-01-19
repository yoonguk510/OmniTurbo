import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Enter your email to reset your password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
        <p className="text-sm text-muted-foreground">Enter your email address and we'll send you a link to reset your password</p>
      </div>
      <ForgotPasswordForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="hover:text-brand underline underline-offset-4"
        >
          Back to Login
        </Link>
      </p>
    </div>
  )
}
