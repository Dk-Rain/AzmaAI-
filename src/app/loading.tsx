import { MountainIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-4">
        <MountainIcon className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold">AZMA AI</h1>
      </div>
      <p className="mt-2 text-muted-foreground">Effortless Academic Assistance, Powered by AI</p>
    </div>
  );
}
