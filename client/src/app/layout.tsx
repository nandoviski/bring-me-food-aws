import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import DashboardWrapper from "./dashboardWrapper";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Bring Me Food",
  description: "Created by Fernando Marostega",
  icons: [{ rel: "icon", url: "/logo-bmf.jpg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <AuthProvider>
          <DashboardWrapper>{children}</DashboardWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
