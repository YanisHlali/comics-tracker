import React from 'react';
import { useState, useEffect } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";

const ReadingNumberFilter = React.memo(({ id, label, value, setValue }) => {
  const [inputValue, setInputValue] = useState(value ?? "");

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  const debounced = useDebouncedValue(inputValue, 300);

  useEffect(() => {
    setValue(debounced ? Number(debounced) : null);
  }, [debounced, setValue]);

  const resetValue = () => {
    setInputValue("");
    setValue(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && inputValue) {
      resetValue();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center mb-4">
      <label
        htmlFor={id}
        className="mb-2 sm:mb-0 sm:mr-4 font-semibold text-left w-full sm:w-40"
      >
        {label}
      </label>
      <input
        type="number"
        id={id}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={label}
        className="border-2 outline-none border-gray-600 bg-gray-800 text-white p-2 w-full sm:w-2/3 rounded-md"
        min="1"
        aria-label={label}
        autoComplete="off"
      />
      <button
        onClick={value !== null ? resetValue : null}
        disabled={value === null}
        className={`mt-2 sm:mt-0 sm:ml-4 p-2 rounded-md transition-colors duration-150 ${value !== null
            ? "bg-marvelRed text-white hover:bg-red-700"
            : "bg-gray-500 text-gray-300 cursor-not-allowed"
          }`}
        aria-label={`Réinitialiser ${label.toLowerCase()}`}
        type="button"
      >
        Réinitialiser
      </button>
    </div>
  );
});

export default ReadingNumberFilter;
