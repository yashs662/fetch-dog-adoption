// src/components/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { PawPrint, Heart, LogOut, Menu, X, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion } from 'framer-motion';
import { ModeToggle } from './theme-toggle';

const Header: React.FC = () => {
  const { isAuthenticated, userName, logout } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100 dark:border-rose-900/20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PawPrint className="h-8 w-8 text-orange-500 dark:text-orange-400" />
          <Link to="/search" className="text-xl font-bold text-rose-900 dark:text-rose-200">
            Fetch Dog Adoption
          </Link>
        </motion.div>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-rose-800 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Desktop menu */}
        <motion.nav
          className="hidden md:flex items-center justify-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/search"
            className={`text-rose-800 dark:text-rose-200 hover:text-rose-600 dark:hover:text-rose-300 ${location.pathname === '/search' ? 'font-semibold' : ''
              }`}
          >
            Search
          </Link>

          <Link
            to="/match"
            className="flex items-center text-rose-800 dark:text-rose-200 hover:text-rose-600 dark:hover:text-rose-300"
          >
            <span className={location.pathname === '/match' ? 'font-semibold' : ''}>Favorites</span>
            {favorites.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white">
                {favorites.length}
              </span>
            )}
          </Link>

          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border-2 border-orange-200 dark:border-orange-900/30">
                  <AvatarFallback className="bg-orange-100 text-rose-800 dark:bg-orange-950 dark:text-rose-200">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleLogout} className="text-rose-800 dark:text-rose-200">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.nav>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-orange-100 dark:border-gray-800 bg-white dark:bg-gray-900 md:hidden"
        >
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Link
              to="/search"
              className={`px-3 py-2 rounded-md ${location.pathname === '/search'
                ? 'bg-orange-50 dark:bg-gray-800 text-rose-800 dark:text-orange-300 font-medium'
                : 'text-rose-700 dark:text-rose-300 hover:bg-orange-50 dark:hover:bg-gray-800'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4 text-rose-500" />
                Search
              </div>
            </Link>
            <Link
              to="/match"
              className={`px-3 py-2 rounded-md flex justify-between items-center ${location.pathname === '/match'
                ? 'bg-orange-50 dark:bg-gray-800 text-rose-800 dark:text-orange-300 font-medium'
                : 'text-rose-700 dark:text-rose-30 hover:bg-orange-50 dark:hover:bg-gray-800'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <Heart className="mr-2 h-4 w-4 text-rose-500" />
                Favorites
              </div>
              {favorites.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white">
                  {favorites.length}
                </span>
              )}
            </Link>
            <div className="px-3 py-2 flex flex-col">
              <span className="text-sm text-rose-700 dark:text-rose-300 pb-4">
                Signed in as <span className="font-medium">{userName}</span>
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="mt-2 flex items-center text-rose-800 dark:text-orange-300 hover:text-rose-600 dark:hover:text-orange-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;