import { Button } from "@repo/ui/components/ui/button";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-500">Monorepo Boilerplate</h1>
        <p className="text-gray-600">Frontend is ready.</p>
        <Button className="mt-5">Button</Button>
      </main>
    </div>
  );
}
