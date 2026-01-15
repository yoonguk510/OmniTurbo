"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Icons } from "@/components/icons"
import { cn } from "@repo/ui/lib/utils"
import { orpc } from "@/lib/orpc"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const { mutateAsync: login, isPending: isLoginPending } = useMutation({
    ...orpc.public.auth.login.mutationOptions(),
    onSuccess: () => {
      toast.success("Logged in successfully")
      queryClient.invalidateQueries(orpc.user.profile.me.queryOptions({ input: {} }))
      router.push("/") 
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Google Login Mutation (Placeholder)
  const { mutateAsync: googleLogin, isPending: isGooglePending } = useMutation({
      ...orpc.public.auth.google.mutationOptions(),
      onSuccess: () => {
          // Placeholder
      },
      onError: (error) => {
          toast.error(error.message)
      }
  })
  
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await login(value)
    },
  })

  const isLoading = isLoginPending || isGooglePending

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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="current-password"
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
            Sign In with Email
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
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  )
}
