import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <NextUIProvider>
          <main className="light">
            {children}
          </main>
        </NextUIProvider>
      </body>
    </html>
  );
}
