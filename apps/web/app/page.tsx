import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function Page() {
  return (
    <>
    <div className="flex min-h-screen flex-col items-center justify-center">
      <main className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          Monorepo Boilerplate
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          A modern full-stack implementation with Next.js, NestJS, and shadcn/ui.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      </main>
    </div>
    </>
  )
}
