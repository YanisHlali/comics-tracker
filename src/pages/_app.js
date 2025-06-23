import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="h-24 px-6 flex items-center justify-between border-b border-gray-700">
        <Link href="/" className="h-full flex items-center">
          <Image
            src="/logo.png"
            alt="Logo Comics Tracker"
            width={240}
            height={96}
            className="h-full w-auto object-contain"
            priority
          />
        </Link>
      </header>
      <main className="w-full h-full p-0 m-0">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </main>
    </div>
  );
}

export default MyApp;
