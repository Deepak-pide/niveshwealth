
import AppHeader from "@/components/app-header";
import AboutUsPage from "@/components/about-us-page";
import AppFooter from "@/components/app-footer";

export default function AboutUs() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <AboutUsPage />
      </main>
      <AppFooter />
    </div>
  );
}
