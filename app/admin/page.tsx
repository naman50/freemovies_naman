import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Admin"
};

export default function AdminPage() {
  return (
    <AppShell>
      <AdminPanel />
    </AppShell>
  );
}
