"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Icons } from "@/components/icons"
import { cn } from "@repo/ui/lib/utils"
import { orpc } from "@/lib/orpc"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ResetPasswordForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const { mutateAsync: resetPassword, isPending, error: resetError } = useMutation({
    ...orpc.public.auth.resetPassword.mutationOptions(),
    onSuccess: () => {
      toast.success("Password has been reset successfully")
      router.push("/login")
    },
    onError: (error) => {
      // toast.error(error.message)
    },
  })

  // Basic validation to check token existence
  React.useEffect(() => {
    if (!token) {
        toast.error("Invalid or missing reset token.")
    }
  }, [token])

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: ({ value }) => {
        if (value.password !== value.confirmPassword) {
            return { fields: { confirmPassword: "Passwords do not match" } }
        }
        return undefined
      }
    },
    onSubmit: async ({ value }) => {
      if (!token) {
          toast.error("Missing reset token")
          return
      }
      await resetPassword({ token, password: value.password })
    },
  })

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="grid gap-4">
           {resetError && (
             <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-2 text-sm text-destructive font-medium">
                <Icons.warning className="h-4 w-4" />
                {resetError.message}
             </div>
          )}
          <form.Field
            name="password"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isPending}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                />
              </div>
            )}
           />
           <form.Field
            name="confirmPassword"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isPending}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                />
                 {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          />
         
          <Button disabled={isPending || !token}>
            {isPending && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Reset Password
          </Button>
        </div>
      </form>
      <div className="mt-4 text-center text-sm">
         <Link href="/login" className="underline underline-offset-4">
          Back to Login
        </Link>
      </div>
    </div>
  )
}
