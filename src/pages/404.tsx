import Link from "next/link";
import MetaTitle from "@/components/MetaTitle";

export default function NotFoundPage() {
  return (
    <>
      <MetaTitle title="Page introuvable | Comics Tracker" />
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-extrabold text-red-500 mb-4 drop-shadow-lg">404</h1>
        <p className="text-2xl mb-2 font-semibold text-gray-300">Page introuvable</p>
        <p className="mb-6 text-gray-400">
          Oups ! La page que tu cherches n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block mt-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition-scale focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-400"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </>
  );
}