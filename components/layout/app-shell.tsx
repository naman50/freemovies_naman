import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen pb-24 md:pb-0 md:pl-24">{children}</main>
    </>
  );
}
