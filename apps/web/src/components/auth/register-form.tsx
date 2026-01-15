"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export function RegisterForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  
  const { mutateAsync: register, isPending: isRegisterPending } = useMutation({
    ...orpc.public.auth.register.mutationOptions(),
    onSuccess: () => {
      toast.success("Account created successfully")
      // Redirect to login or perhaps auto-login if the API returns a session?
      // For now, redirect to login so they can sign in.
      router.push("/login")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Google Login (Same concept as LoginForm)
  const { mutateAsync: googleLogin, isPending: isGooglePending } = useMutation({
    ...orpc.public.auth.google.mutationOptions(),
    onSuccess: () => {
       // Handle success
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await register(value)
    },
  })

  const isLoading = isRegisterPending || isGooglePending

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
           <form.Field
            name="name"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={isLoading}
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
          <form.Field
            name="email"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
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
          <form.Field
            name="password"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
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
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Account
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading}>
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
       <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </div>
  )
}
