import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"
import { Header } from "@/components/header"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 w-full">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="flex max-w-7xl flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Monorepo Boilerplate
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              A production-ready full-stack boilerplate featuring NestJS, Next.js 14, standard authentication, and type-safe RPC with ORPC.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                 <Link href="https://github.com/yoonguk510/OmniTurbo" target="_blank">
                  GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        <section id="features" className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              This project includes everything you need to build a modern SaaS application.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-7xl md:grid-cols-3">
             <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                    <div className="space-y-2">
                        <h3 className="font-bold">Next.js 14</h3>
                        <p className="text-sm text-muted-foreground">App Router, Server Components, and Suspense.</p>
                    </div>
                </div>
             </div>
             <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                    <div className="space-y-2">
                        <h3 className="font-bold">NestJS</h3>
                        <p className="text-sm text-muted-foreground">Robust backend architecture with modules and dependency injection.</p>
                    </div>
                </div>
             </div>
             <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                    <div className="space-y-2">
                        <h3 className="font-bold">ORPC</h3>
                        <p className="text-sm text-muted-foreground">End-to-end type safety without code generation.</p>
                    </div>
                </div>
             </div>
             <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                    <div className="space-y-2">
                        <h3 className="font-bold">Authentication</h3>
                        <p className="text-sm text-muted-foreground">Secure auth with JWT, Refresh Tokens, and Google SSO.</p>
                    </div>
                </div>
             </div>
             <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                    <div className="space-y-2">
                        <h3 className="font-bold">Tailwind CSS</h3>
                        <p className="text-sm text-muted-foreground">Components built with Radix UI and Tailwind CSS.</p>
                    </div>
                </div>
             </div>
             <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                    <div className="space-y-2">
                        <h3 className="font-bold">Prisma</h3>
                        <p className="text-sm text-muted-foreground">Modern database toolkit for TypeScript and Node.js.</p>
                    </div>
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  )
}
