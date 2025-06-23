'use client';

import React from 'react';
import Link from 'next/link';

const BackButton = React.memo(({ href }) => (
  <div className="mb-8">
    <Link
      href={href}
      className="text-blue-300 hover:underline inline-flex items-center rounded focus:outline-none"
      aria-label="Retour à la page précédente"
      title="Retour"
      tabIndex={0}
    >
      <span className="mr-2" aria-hidden="true">&larr;</span>
      Retour
    </Link>
  </div>
));

export default BackButton;