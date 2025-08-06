
import AdminFooter from "@/components/admin-footer";
import AppHeader from "@/components/app-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <AdminFooter />
    </div>
  );
}
