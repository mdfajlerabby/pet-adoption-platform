import "./globals.css";
import Providers from "@/components/Providers";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: {
    default: "Pawfect Home — Find your new best friend",
    template: "%s | Pawfect Home",
  },
  description: "Meet wonderful pets looking for a loving home. Find your new best friend with Pawfect Home.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          <div className="site-content">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
