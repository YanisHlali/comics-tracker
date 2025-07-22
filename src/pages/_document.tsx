import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document(): React.ReactElement {
  return (
    <Html lang="fr">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap" 
          rel="stylesheet" 
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Comics Tracker - Suivez vos comics Marvel préférés" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
             try {
               if (
                 localStorage.theme === 'dark' ||
                 (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
               ) {
                 document.documentElement.classList.add('dark');
               } else {
                 document.documentElement.classList.remove('dark');
               }
             } catch (_) {}
           `}
        </Script>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}