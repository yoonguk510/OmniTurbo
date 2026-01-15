"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { orpc } from "@/lib/orpc"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { useMutation } from "@tanstack/react-query"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email...")

  const { mutate: verifyEmail } = useMutation({
    ...orpc.public.auth.verifyEmail.mutationOptions(),
    onSuccess: () => {
      setStatus("success")
      setMessage("Your email has been successfully verified.")
    },
    onError: (error) => {
      setStatus("error")
      setMessage(error.message || "Failed to verify email. The token may be invalid or expired.")
    },
  })

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token found.")
      return
    }
    verifyEmail({ token })
  }, [token, verifyEmail])

  return (
    <div className="flex w-full items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
            {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
          </div>
          <CardTitle className="text-center">
            {status === "loading" && "Verifying Email"}
            {status === "success" && "Email Verified"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          {status === "success" && (
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          )}
          {status === "error" && (
            <Button asChild variant="outline">
               <Link href="/login">Back to Login</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
