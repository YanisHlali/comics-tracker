import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface BurgerMenuProps {
  className?: string;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  const closeMenu = (): void => {
    setIsOpen(false);
  };

  return (
    <div className={`burger-menu ${className}`}>
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 text-white hover:text-red-400 transition-colors"
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        type="button"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold">Menu</h2>
          <button
            onClick={closeMenu}
            className="text-white hover:text-red-400 transition-colors"
            aria-label="Fermer le menu"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <Link
            href="/"
            onClick={closeMenu}
            className="block text-white hover:text-red-400 transition-colors py-2"
          >
            Accueil
          </Link>
          <Link
            href="/comic-viewer"
            onClick={closeMenu}
            className="block text-white hover:text-red-400 transition-colors py-2"
          >
            Lecteur de Comics
          </Link>
          <Link
            href="/contact"
            onClick={closeMenu}
            className="block text-white hover:text-red-400 transition-colors py-2"
          >
            Contact
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default BurgerMenu;