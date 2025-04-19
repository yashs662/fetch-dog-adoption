// src/context/FavoritesContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { Dog } from '../types';

interface FavoritesContextType {
  favorites: Dog[];
  addFavorite: (dog: Dog) => void;
  removeFavorite: (dogId: string) => void;
  isFavorite: (dogId: string) => boolean;
  clearFavorites: () => void;
  setFavorites: (dogs: Dog[]) => void; // Added setFavorites
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Dog[]>([]);

  const addFavorite = (dog: Dog) => {
    setFavorites((prev) => [...prev, dog]);
  };

  const removeFavorite = (dogId: string) => {
    setFavorites((prev) => prev.filter((dog) => dog.id !== dogId));
  };

  const isFavorite = (dogId: string) => {
    return favorites.some((dog) => dog.id === dogId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, clearFavorites, setFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};