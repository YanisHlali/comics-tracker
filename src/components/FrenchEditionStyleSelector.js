import React from 'react';

const FrenchEditionStyleSelector = React.memo(({ frenchEditionStyle, setFrenchEditionStyle }) => (
  <div className="flex flex-col sm:flex-row sm:items-center mb-4">
    <label 
      htmlFor="frenchEditionStyle" 
      className="mb-2 sm:mb-0 sm:mr-4 font-semibold text-left w-full sm:w-40"
    >
      Affichage visuelle des issues sans édition française
    </label>
    <select
      id="frenchEditionStyle"
      value={frenchEditionStyle}
      onChange={e => setFrenchEditionStyle(e.target.value)}
      className="border-2 border-gray-600 bg-gray-800 text-white p-2 w-full sm:w-2/3 rounded-md outline-none"
      aria-label="Style d'affichage des issues non traduites"
    >
      <option value="color">Afficher en couleur</option>
      <option value="gray">Afficher en gris</option>
    </select>
  </div>
));

export default FrenchEditionStyleSelector;
