"use client";
import "./styles.css";
import { Store } from "../ctx/store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="Mikro Desktop App" />
        <meta
          property="og:description"
          content="Mikro is an open source and privacy focused video compression app. It's a video messaging tool that allows you to compress, edit and share videos in seconds."
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <title>Mikro</title>
      </head>
      <body className="relative h-full">
        <Store>
          <div className="p-5 h-full">
            <div className="flex h-full">{children}</div>
          </div>
        </Store>
      </body>
    </html>
  );
}
