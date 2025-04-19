// src/context/SearchContext.tsx
import React, { createContext, useState } from 'react';
import { Dog, SearchResponse, DogSearchParams } from '../types';

interface SearchContextType {
  breeds: string[];
  setBreeds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedBreeds: string[];
  setSelectedBreeds: React.Dispatch<React.SetStateAction<string[]>>;
  ageMin: string;
  setAgeMin: React.Dispatch<React.SetStateAction<string>>;
  ageMax: string;
  setAgeMax: React.Dispatch<React.SetStateAction<string>>;
  sortOrder: string;
  setSortOrder: React.Dispatch<React.SetStateAction<string>>;
  dogs: Dog[];
  setDogs: React.Dispatch<React.SetStateAction<Dog[]>>;
  searchResponse: SearchResponse | null;
  setSearchResponse: React.Dispatch<React.SetStateAction<SearchResponse | null>>;
  searchPerformed: boolean;
  setSearchPerformed: React.Dispatch<React.SetStateAction<boolean>>;
  currentSearchParams: DogSearchParams | null;
  setCurrentSearchParams: React.Dispatch<React.SetStateAction<DogSearchParams | null>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState<string>('');
  const [ageMax, setAgeMax] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('breed:asc');
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [currentSearchParams, setCurrentSearchParams] = useState<DogSearchParams | null>(null);
  const [pageSize, setPageSize] = useState<number>(24);
  const [currentPage, setCurrentPage] = useState<number>(1);

  return (
    <SearchContext.Provider value={{
      breeds,
      setBreeds,
      selectedBreeds,
      setSelectedBreeds,
      ageMin,
      setAgeMin,
      ageMax,
      setAgeMax,
      sortOrder,
      setSortOrder,
      dogs,
      setDogs,
      searchResponse,
      setSearchResponse,
      searchPerformed,
      setSearchPerformed,
      currentSearchParams,
      setCurrentSearchParams,
      pageSize,
      setPageSize,
      currentPage,
      setCurrentPage,
    }}>
      {children}
    </SearchContext.Provider>
  );
};