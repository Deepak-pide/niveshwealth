
import AdminFooter from "@/components/admin-footer";
import AppHeader from "@/components/app-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <AdminFooter />
    </div>
  );
}
