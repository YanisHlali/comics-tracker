import React, { ReactNode } from 'react';

interface FilterSectionProps {
  title?: string;
  children: ReactNode;
}

export default function FilterSection({ title, children }: FilterSectionProps): React.ReactElement {
  return (
    <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {title && (
        <legend className="sr-only">{title}</legend>
      )}
      {children}
    </fieldset>
  );
}