import React, { useState, useEffect } from 'react';
import { BsQuestionCircle } from "react-icons/bs";

interface KeyboardShortcutsProps {}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = () => {
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [justTriggered, setJustTriggered] = useState<boolean>(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setShowShortcuts(!showShortcuts);
        setJustTriggered(true);
        setTimeout(() => setJustTriggered(false), 100);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showShortcuts]);

  if (!showShortcuts) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowShortcuts(true)}
          className="bg-gray-800/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm border border-gray-600 hover:bg-gray-700 transition-colors"
          title="Afficher les raccourcis clavier"
        >
          <BsQuestionCircle />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-xl p-4 shadow-2xl max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Raccourcis clavier</h3>
          <button
            onClick={() => setShowShortcuts(false)}
            className="pl-4 text-gray-400 hover:text-white transition-colors"
          >
            <BsQuestionCircle />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Page précédente</span>
            <kbd className="bg-gray-700 text-white px-2 py-1 rounded text-xs">←</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Page suivante</span>
            <kbd className="bg-gray-700 text-white px-2 py-1 rounded text-xs">→</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Plein écran</span>
            <kbd className="bg-gray-700 text-white px-2 py-1 rounded text-xs">F11</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Raccourcis</span>
            <kbd className="bg-gray-700 text-white px-2 py-1 rounded text-xs">?</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;