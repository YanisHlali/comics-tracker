import React, { useCallback } from 'react';

interface TextInputFilterProps {
  id: string;
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
}

const TextInputFilter: React.FC<TextInputFilterProps> = ({ 
  id, 
  label, 
  value, 
  setValue, 
  placeholder 
}) => {
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, [setValue]);

  const resetValue = useCallback(() => {
    setValue("");
  }, [setValue]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && value) {
      resetValue();
    }
  }, [value, resetValue]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center mb-4">
      <label
        htmlFor={id}
        className="mb-2 sm:mb-0 sm:mr-4 font-semibold text-left w-full sm:w-40"
      >
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder || `Rechercher par ${label.toLowerCase()}`}
        className="border-2 outline-none border-gray-600 bg-gray-800 text-white p-2 w-full sm:w-2/3 rounded-md"
        aria-label={`Champ de recherche pour ${label.toLowerCase()}`}
        autoComplete="off"
      />
      <button
        onClick={value ? resetValue : undefined}
        disabled={!value}
        className={`mt-2 sm:mt-0 sm:ml-4 p-2 rounded-md transition-colors duration-150 ${
          value
            ? "bg-marvelRed text-white hover:bg-red-700"
            : "bg-gray-500 text-gray-300 cursor-not-allowed"
        }`}
        aria-label={`Réinitialiser la recherche pour ${label.toLowerCase()}`}
        type="button"
      >
        Réinitialiser
      </button>
    </div>
  );
};

export default TextInputFilter;