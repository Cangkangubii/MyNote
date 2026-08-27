import { Press_Start_2P, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const pixelFont = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans-body",
  subsets: ["latin"],
});

export const metadata = {
  title: "MyNote - Retro Pastel Pixel OS",
  description: "Cozy 90s Pixel OS for capturing thoughts, organizing tasks, and tracking daily logs.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${pixelFont.variable} ${sansFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Navigation />
        <main className="flex-1 pb-16">{children}</main>
      </body>
    </html>
  );
}
