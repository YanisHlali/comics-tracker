import React from 'react';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Comics Tracker',
  description = 'Suivez vos comics Marvel préférés et leurs traductions françaises'
}) => {
  const fullTitle = title === 'Comics Tracker' ? title : `${title} | Comics Tracker`;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
    </>
  );
};

export default Layout;