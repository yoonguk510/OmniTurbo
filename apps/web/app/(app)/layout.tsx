import { Header } from "@/components/header"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-7xl pt-4">
        {children}
      </main>
      {/* Footer can go here */}
    </div>
  )
}
