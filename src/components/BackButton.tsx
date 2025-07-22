'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
}

const BackButton: React.FC<BackButtonProps> = React.memo(({ href = '/' }) => {
  const router = useRouter();

  const onBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <div className="pt-4">
      <button
        onClick={onBack}
        type="button"
        className="
        flex items-center gap-2 px-4 py-2
        bg-gray-800 hover:bg-gray-700
        rounded-xl shadow-lg
        text-white font-semibold
        transition-colors duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600
        text-base
      "
        aria-label="Retour à la page précédente"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        Retour
      </button>
    </div>
  );
});

export default BackButton;