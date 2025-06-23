import React from "react";

const DisplayModeToggle = React.memo(({ displayMode, onToggle }) => (
  <div className="p-4 flex justify-end">
    <button
      onClick={onToggle}
      className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
      type="button"
      aria-label={`Basculer en mode ${displayMode === "text" ? "images" : "texte"}`}
    >
      Basculer en mode {displayMode === "text" ? "images" : "texte"}
    </button>
  </div>
));

export default DisplayModeToggle;