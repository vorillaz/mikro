"use client";
import "./styles.css";
import Script from "next/script";
import { Store } from "../ctx/store";

const env = process.env.NEXT_PUBLIC_ENV;
const version = process.env.NEXT_PUBLIC_VERSION;

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

        <Script
          src={`/scripts/accessibility-only-when-focused.js?nonce=${version}`}
          data-env={env}
        />
        <Script
          src={`/scripts/disable-zoom.js?nonce=${version}`}
          data-env={env}
        />
        <Script
          src={`/scripts/disable-reload.js?nonce=${version}`}
          data-env={env}
        />
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
