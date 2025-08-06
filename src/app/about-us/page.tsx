
import AppHeader from "@/components/app-header";
import AboutUsPage from "@/components/about-us-page";
import AppFooter from "@/components/app-footer";

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1">
        <AboutUsPage />
      </main>
      <AppFooter />
    </div>
  );
}
