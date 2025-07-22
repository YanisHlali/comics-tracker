import { AppProps } from "next/app";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";
import BurgerMenu from "@/components/BurgerMenu";
import { AppProvider } from "@/contexts/AppContext";
import "@/styles/globals.css";

interface MyAppProps extends AppProps {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
}

function MyApp({ Component, pageProps }: MyAppProps): React.ReactElement {
  return (
    <AppProvider>
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

          <Link
            href="/contact"
            className="ml-4 px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors hidden sm:block"
            aria-label="Contact"
          >
            Contact
          </Link>
          <div className="sm:hidden">
            <BurgerMenu />
          </div>
        </header>

        <main className="w-full h-full p-0 m-0">
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </main>
        <br />
        <br />
      </div>
    </AppProvider>
  );
}

export default MyApp;