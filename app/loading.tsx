import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#050609] p-6 md:pl-30">
      <Skeleton className="h-[62vh] w-full rounded-xl" />
      <div className="mt-8 flex gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-48 shrink-0" />
        ))}
      </div>
    </main>
  );
}
