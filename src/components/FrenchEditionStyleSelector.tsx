import React from "react";

export type FrenchEditionStyle = "color" | "border" | "shadow" | "none";

interface FrenchEditionStyleSelectorProps {
  currentStyle: FrenchEditionStyle;
  onStyleChange: (style: FrenchEditionStyle) => void;
  className?: string;
}

interface StyleOption {
  value: FrenchEditionStyle;
  label: string;
  description: string;
}

const styleOptions: StyleOption[] = [
  {
    value: "color",
    label: "Couleur",
    description: "Bordure colorée pour les issues traduites"
  },
  {
    value: "border",
    label: "Bordure",
    description: "Bordure épaisse pour les issues traduites"
  },
  {
    value: "shadow",
    label: "Ombre",
    description: "Ombre colorée pour les issues traduites"
  },
  {
    value: "none",
    label: "Aucun",
    description: "Pas d'indication visuelle"
  }
];

const FrenchEditionStyleSelector: React.FC<FrenchEditionStyleSelectorProps> = ({
  currentStyle,
  onStyleChange,
  className = ""
}) => {
  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const newStyle = event.target.value as FrenchEditionStyle;
    onStyleChange(newStyle);
  };

  return (
    <div className={`french-edition-style-selector ${className}`}>
      <label 
        htmlFor="french-edition-style"
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        Style d&apos;indication des traductions françaises
      </label>
      
      <select
        id="french-edition-style"
        value={currentStyle}
        onChange={handleStyleChange}
        className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      >
        {styleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} - {option.description}
          </option>
        ))}
      </select>

      <div className="mt-3 p-3 bg-gray-800 rounded-md">
        <p className="text-xs text-gray-400 mb-2">Aperçu :</p>
        <div className="flex gap-2">
          <div
            className={`w-16 h-20 bg-gray-700 rounded ${
              currentStyle === "color" ? "border-2 border-green-500" :
              currentStyle === "border" ? "border-4 border-blue-500" :
              currentStyle === "shadow" ? "shadow-lg shadow-purple-500/50" :
              ""
            }`}
          >
            <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm flex items-center justify-center">
              <span className="text-xs text-white">FR</span>
            </div>
          </div>
          <div className="w-16 h-20 bg-gray-700 rounded">
            <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm flex items-center justify-center">
              <span className="text-xs text-gray-400">EN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrenchEditionStyleSelector;