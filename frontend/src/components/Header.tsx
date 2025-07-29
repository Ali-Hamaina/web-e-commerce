import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getItemCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="glass-effect fixed top-0 right-0 left-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold gradient-text">
            يونا للعطور
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-reverse space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              الرئيسية
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              العطور
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              من نحن
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              تواصل معنا
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-reverse space-x-4">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <i className="fas fa-search text-lg"></i>
              </button>
              
              {isSearchOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 glass-effect rounded-lg shadow-xl p-4 animate-slideUp">
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      placeholder="ابحث عن عطرك المفضل..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <i className="fas fa-shopping-cart text-lg"></i>
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* WhatsApp */}
            <a
              href="https://wa.me/212713071000"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-green-600 hover:text-green-700 transition-colors"
            >
              <i className="fab fa-whatsapp text-lg"></i>
            </a>

            {/* Admin */}
            <Link
              to="/admin"
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <i className="fas fa-user-shield text-lg"></i>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
