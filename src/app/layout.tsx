import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasks | TaskWarrior",
  description: "A clear view of your TaskWarrior tasks.",
  icons: { icon: "https://taskwarrior.org/images/tw.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
