import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  interface ContactFormData {
    message: string;
  }

  interface ContactApiError {
    error?: string;
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data: ContactFormData = {
      message: (e.target as HTMLFormElement).message.value,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const r: ContactApiError = await res.json();
        setError(r?.error || "Erreur inconnue.");
      }
    } catch {
      setError("Impossible d'envoyer le message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact | Comics Tracker</title>
        <meta
          name="description"
          content="Contactez le créateur de Comics Tracker"
        />
      </Head>
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 mt-16">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Contact</h1>
          <p className="mb-8 text-gray-300">
            Une question, une suggestion, un bug ? N’hésitez pas à me contacter
            via ce formulaire.
          </p>

          {sent ? (
            <div className="text-green-400 font-semibold text-lg text-center py-8">
              Merci pour votre message !
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="message"
                  className="block mb-1 font-semibold text-gray-200"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Écrivez votre message ici..."
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm mb-4 text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-red-600 font-bold text-white hover:bg-red-700 transition-colors focus:outline-none disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer"}
              </button>
            </form>
          )}
          <div className="mt-8 text-center">
            <Link href="/" className="text-gray-400 hover:underline">
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
