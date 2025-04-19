import React, { useEffect, useState, useCallback } from 'react';
import { getBreeds, searchDogs, getDogs } from '../services/api';
import type { DogSearchParams } from '../types';
import DogCard from '../components/DogCard';
import Header from '../components/Header';
import RangeSlider from '../components/RangeSlider';
import { useSearch } from '../hooks/useSearch';
import { useLocation } from '../context/LocationContext';
import { Search as SearchIcon, PawPrint, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';

const SORT_OPTIONS = [
  { value: 'breed:asc', label: 'Breed: A-Z' },
  { value: 'breed:desc', label: 'Breed: Z-A' },
  { value: 'name:asc', label: 'Name: A-Z' },
  { value: 'name:desc', label: 'Name: Z-A' },
  { value: 'age:asc', label: 'Age: Youngest First' },
  { value: 'age:desc', label: 'Age: Oldest First' },
];

const PAGE_SIZE_OPTIONS = [
  { value: 12, label: '12 per page' },
  { value: 24, label: '24 per page' },
  { value: 48, label: '48 per page' },
  { value: 100, label: '100 per page' },
];

const Search: React.FC = () => {
  // Use global state from contexts
  const {
    breeds, setBreeds,
    selectedBreeds, setSelectedBreeds,
    ageMin, setAgeMin,
    ageMax, setAgeMax,
    sortOrder, setSortOrder,
    dogs, setDogs,
    searchResponse, setSearchResponse,
    searchPerformed, setSearchPerformed,
    currentSearchParams, setCurrentSearchParams,
    pageSize, setPageSize,
    currentPage, setCurrentPage
  } = useSearch();

  const { fetchLocations } = useLocation();

  // Age range state for the slider
  const [ageRange, setAgeRange] = useState<[number, number]>([
    parseInt(ageMin || '0', 10) || 0,
    parseInt(ageMax || '15', 10) || 15
  ]);

  // Local state for loading, errors and mobile filters
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [breedSearchQuery, setBreedSearchQuery] = useState<string>('');
  const [localSelectedBreeds, setLocalSelectedBreeds] = useState<string[]>(selectedBreeds);
  const [localAgeRange, setLocalAgeRange] = useState<[number, number]>(ageRange);

  // Update local filters when global filters change
  useEffect(() => {
    setLocalSelectedBreeds(selectedBreeds);
    setLocalAgeRange([
      parseInt(ageMin || '0', 10) || 0,
      parseInt(ageMax || '15', 10) || 15
    ]);
  }, [selectedBreeds, ageMin, ageMax]);

  // Filter breeds based on search query
  const filteredBreeds = breeds.filter(breed =>
    breed.toLowerCase().includes(breedSearchQuery.toLowerCase())
  );

  // Function to handle dog search with useCallback to avoid dependency issues
  const handleSearch = useCallback(async (fromCursor?: string | null, savedParams?: DogSearchParams | null) => {
    setLoading(true);
    setError(null);

    try {
      const params: DogSearchParams = savedParams || {
        size: pageSize,
        sort: sortOrder,
      };

      // If this is a new search (not pagination), reset to page 1
      if (!fromCursor) {
        setCurrentPage(1);
      }

      if (!savedParams) {
        if (localSelectedBreeds.length > 0) {
          params.breeds = localSelectedBreeds;
          // Update global selected breeds
          setSelectedBreeds(localSelectedBreeds);
        }

        if (localAgeRange[0] > 0) {
          setAgeMin(localAgeRange[0].toString());
          params.ageMin = localAgeRange[0];
        } else {
          setAgeMin('');
        }

        if (localAgeRange[1] < 15) {
          setAgeMax(localAgeRange[1].toString());
          params.ageMax = localAgeRange[1];
        } else {
          setAgeMax('');
        }

        // Save current search params
        setCurrentSearchParams(params);
      }

      if (fromCursor) {
        params.from = fromCursor;
      }

      const searchResult = await searchDogs(params);
      setSearchResponse(searchResult.data);

      if (searchResult.data.resultIds.length > 0) {
        const dogsResult = await getDogs(searchResult.data.resultIds);
        setDogs(dogsResult.data);

        // Fetch location data for all dogs
        const zipCodes = dogsResult.data.map(dog => dog.zip_code);
        fetchLocations(zipCodes);
      } else {
        setDogs([]);
      }

      setSearchPerformed(true);
    } catch (err) {
      setError('Failed to fetch dogs. Please try again later.');
      console.error('Error searching dogs:', err);
    } finally {
      setLoading(false);
    }
  }, [localSelectedBreeds, localAgeRange, setAgeMax, setAgeMin, setCurrentSearchParams, setDogs, setSearchPerformed, setSearchResponse, sortOrder, setSelectedBreeds, fetchLocations, pageSize, setCurrentPage]);

  // Apply sorting and trigger a new search when sortOrder changes
  const handleSortChange = (newSortOrder: string) => {
    setSortOrder(newSortOrder);
    
    // Create a params object for immediate search with new sort order
    const params: DogSearchParams = {
      size: pageSize,
      sort: newSortOrder,
    };

    // Add existing filters to the search
    if (localSelectedBreeds.length > 0) {
      params.breeds = localSelectedBreeds;
    }

    if (localAgeRange[0] > 0) {
      params.ageMin = localAgeRange[0];
    }

    if (localAgeRange[1] < 15) {
      params.ageMax = localAgeRange[1];
    }

    // Set loading state and trigger search immediately
    setLoading(true);
    setError(null);

    // Execute the search with the new sort order
    searchDogs(params)
      .then((searchResult) => {
        setSearchResponse(searchResult.data);

        if (searchResult.data.resultIds.length > 0) {
          return getDogs(searchResult.data.resultIds)
            .then((dogsResult) => {
              setDogs(dogsResult.data);

              // Fetch location data for all dogs
              const zipCodes = dogsResult.data.map(dog => dog.zip_code);
              fetchLocations(zipCodes);
            });
        } else {
          setDogs([]);
        }
      })
      .catch((err) => {
        setError('Failed to fetch dogs. Please try again later.');
        console.error('Error searching dogs:', err);
      })
      .finally(() => {
        setLoading(false);
        setSearchPerformed(true);
        
        // Update current search params
        setCurrentSearchParams({...params});
      });
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    // Reset to page 1 when changing page size
    setCurrentPage(1);
    setPageSize(newPageSize);
    
    // Create params object with new page size
    const params: DogSearchParams = {
      size: newPageSize,
      sort: sortOrder,
    };
    
    // Add existing filters to the search
    if (localSelectedBreeds.length > 0) {
      params.breeds = localSelectedBreeds;
    }
    
    if (localAgeRange[0] > 0) {
      params.ageMin = localAgeRange[0];
    }
    
    if (localAgeRange[1] < 15) {
      params.ageMax = localAgeRange[1];
    }
    
    // Set loading state and trigger search immediately
    setLoading(true);
    setError(null);
    
    // Execute the search with the new page size
    searchDogs(params)
      .then((searchResult) => {
        setSearchResponse(searchResult.data);
        
        if (searchResult.data.resultIds.length > 0) {
          return getDogs(searchResult.data.resultIds)
            .then((dogsResult) => {
              setDogs(dogsResult.data);
              
              // Fetch location data for all dogs
              const zipCodes = dogsResult.data.map(dog => dog.zip_code);
              fetchLocations(zipCodes);
            });
        } else {
          setDogs([]);
        }
      })
      .catch((err) => {
        setError('Failed to fetch dogs. Please try again later.');
        console.error('Error searching dogs:', err);
      })
      .finally(() => {
        setLoading(false);
        setSearchPerformed(true);
        
        // Update current search params
        setCurrentSearchParams({...params});
      });
  };

  // Handle breed selection
  const handleBreedToggle = (breed: string) => {
    setLocalSelectedBreeds(prev =>
      prev.includes(breed)
        ? prev.filter(b => b !== breed)
        : [...prev, breed]
    );
  };

  // Fetch all available breeds on component mount if not already loaded
  useEffect(() => {
    const fetchBreeds = async () => {
      if (breeds.length === 0) {
        try {
          const response = await getBreeds();
          setBreeds(response.data);
        } catch (err) {
          setError('Failed to load breed options. Please try again later.');
          console.error('Error fetching breeds:', err);
        }
      }
    };

    fetchBreeds();

    // If we have current search params and results, no need to search again
    if (currentSearchParams && searchPerformed && dogs.length > 0) {
      return;
    }

    // If we have current search params but no results (e.g., after a page refresh),
    // perform the search again
    if (currentSearchParams && (!dogs.length || !searchPerformed)) {
      handleSearch(undefined, currentSearchParams);
    }
  }, [breeds.length, currentSearchParams, dogs.length, handleSearch, searchPerformed, setBreeds]);

  // Extract cursor from next/prev strings
  const getCursorFromQueryString = (queryString: string | null) => {
    if (!queryString) return null;
    const match = queryString.match(/from=([^&]*)/);
    return match ? match[1] : null;
  };

  // Calculate pagination information
  const calculatePaginationInfo = () => {
    if (!searchResponse) return null;
    
    // Calculate total pages based on total results and page size
    const totalPages = Math.ceil(searchResponse.total / pageSize);
    
    return {
      currentPage,
      totalPages,
      totalResults: searchResponse.total,
      hasNext: !!searchResponse.next,
      hasPrev: !!searchResponse.prev
    };
  };
  
  // Handle direct page navigation
  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && searchResponse?.next) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      handleSearch(getCursorFromQueryString(searchResponse.next));
    } else if (direction === 'prev' && searchResponse?.prev) {
      const prevPage = Math.max(1, currentPage - 1);
      setCurrentPage(prevPage);
      handleSearch(getCursorFromQueryString(searchResponse.prev));
    }
  };

  // Get pagination info object
  const paginationInfo = calculatePaginationInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 dark:from-gray-950 dark:to-rose-950">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-200">Find Your Perfect Match</h1>
            <p className="text-rose-700 dark:text-rose-300">Browse our adorable dogs looking for a loving home</p>
          </motion.div>
        </div>

        {/* Search and filters layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar - desktop only */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block w-64 shrink-0"
          >
            <Card className="sticky top-20 p-0">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-rose-900 dark:text-rose-200">Breeds</h3>
                    {localSelectedBreeds.length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setLocalSelectedBreeds([])}
                        className="h-auto p-0 text-xs text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Breed search input */}
                  <div className="mb-3">
                    <div className="relative">
                      <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={breedSearchQuery}
                        onChange={(e) => setBreedSearchQuery(e.target.value)}
                        placeholder="Search breeds..."
                        className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 dark:border-orange-900/30 dark:bg-gray-800 dark:text-rose-100 dark:focus:border-orange-700 dark:focus:ring-orange-700"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    {filteredBreeds.map((breed) => (
                      <div key={breed} className="flex items-center space-x-2">
                        <Checkbox
                          id={`breed-${breed}`}
                          checked={localSelectedBreeds.includes(breed)}
                          onCheckedChange={() => handleBreedToggle(breed)}
                        />
                        <Label
                          htmlFor={`breed-${breed}`}
                          className="text-sm font-medium text-rose-800 dark:text-rose-200 cursor-pointer"
                        >
                          {breed}
                        </Label>
                      </div>
                    ))}
                    {filteredBreeds.length === 0 && (
                      <p className="text-sm text-muted-foreground py-2 italic">No breeds found matching "{breedSearchQuery}"</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-rose-900 dark:text-rose-200 mb-3">Age Range</h3>
                  <RangeSlider
                    min={0}
                    max={15}
                    value={localAgeRange}
                    onChange={setLocalAgeRange}
                  />
                </div>

                <div className="mt-6 w-full">
                  <Button
                    onClick={() => handleSearch()}
                    className="flex w-full bg-orange-100 dark:bg-rose-700 hover:bg-orange-50 dark:hover:bg-rose-800 items-center justify-center gap-2 border-orange-200 dark:border-orange-900/30 dark:text-rose-200"
                    disabled={loading}
                  >
                    <span className="text-rose-500 dark:text-rose-200">{loading ? 'Searching...' : 'Apply Filters'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mobile filters button - only visible on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mb-4"
          >
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center"
            >
              <SearchIcon className="mr-2 h-4 w-4" />
              Filters
              {localSelectedBreeds.length > 0 && (
                <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">
                  {localSelectedBreeds.length}
                </span>
              )}
            </Button>
          </motion.div>

          {/* Mobile filters dialog */}
          <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
              </DialogHeader>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-rose-900 dark:text-rose-200">Breeds</h3>
                  {localSelectedBreeds.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setLocalSelectedBreeds([])}
                      className="h-auto p-0 text-xs text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Breed search input in mobile dialog */}
                <div className="mb-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={breedSearchQuery}
                      onChange={(e) => setBreedSearchQuery(e.target.value)}
                      placeholder="Search breeds..."
                      className="w-full pl-8 text-sm"
                    />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto pr-2 space-y-2 border border-input rounded-md p-2 mb-4">
                  {filteredBreeds.map((breed) => (
                    <div key={breed} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-breed-${breed}`}
                        checked={localSelectedBreeds.includes(breed)}
                        onCheckedChange={() => handleBreedToggle(breed)}
                        className="h-4 w-4 rounded border-orange-300 text-orange-500 focus:ring-orange-500 dark:border-orange-800 dark:bg-gray-800 dark:text-orange-600 dark:focus:ring-orange-600"
                      />
                      <Label
                        htmlFor={`mobile-breed-${breed}`}
                        className="text-sm font-medium text-rose-800 dark:text-rose-200 cursor-pointer"
                      >
                        {breed}
                      </Label>
                    </div>
                  ))}
                  {filteredBreeds.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2 italic">No breeds found matching "{breedSearchQuery}"</p>
                  )}
                </div>
              </div>

              <div className="mb-9">
                <h3 className="font-semibold mb-5 text-rose-900 dark:text-rose-200">Age Range</h3>
                <div className="px-2 pt-5 pb-1">
                  <RangeSlider
                    min={0}
                    max={15}
                    value={localAgeRange}
                    onChange={setLocalAgeRange}
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-3 sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleSearch();
                    setShowMobileFilters(false);
                  }}
                  className='flex bg-orange-100 dark:bg-rose-700 hover:bg-orange-50 dark:hover:bg-rose-800 items-center justify-center gap-2 border-orange-200 dark:border-orange-900/30 dark:text-rose-200'
                  disabled={loading}
                >
                  <span className="text-rose-500 dark:text-rose-200">
                    {loading ? 'Searching...' : 'Apply Filters'}
                  </span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Search results main content */}
          <div className="flex-1">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* No search performed yet state */}
            {!searchPerformed && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="mb-6 rounded-full bg-orange-100 p-6">
                  <PawPrint className="h-12 w-12 text-orange-500" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-rose-900 dark:text-rose-200">Start Your Search</h2>
                <p className="mb-6 max-w-md text-rose-700 dark:text-rose-300">
                  Use the filters to find the perfect dog companion for your home.
                </p>
                <Button
                  onClick={() => handleSearch()}
                  className="flex bg-orange-100 dark:bg-rose-700 hover:bg-orange-50 dark:hover:bg-rose-800 items-center justify-center gap-2 border-orange-200 dark:border-orange-900/30 dark:text-rose-200"
                >
                  <span className="text-rose-500 dark:text-rose-200">Find Dogs</span>
                </Button>
              </motion.div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
              </div>
            )}

            {/* No results state */}
            {searchPerformed && !loading && dogs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="mb-6 rounded-full bg-orange-100 p-6">
                  <SearchIcon className="h-12 w-12 text-orange-500" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-rose-900 dark:text-rose-200">No Dogs Found</h2>
                <p className="mb-6 max-w-md text-rose-700 dark:text-rose-300">
                  Try adjusting your filters to find more dogs.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBreeds([]);
                    setAgeRange([0, 15]);
                    setAgeMin('');
                    setAgeMax('');
                    handleSearch();
                  }}
                >
                  Reset Filters
                </Button>
              </motion.div>
            )}

            {/* Search results */}
            {searchPerformed && !loading && dogs.length > 0 && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-rose-700 dark:text-rose-300">
                    Showing <span className="font-medium">{dogs.length}</span> dogs
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-muted-foreground">Sort by:</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex justify-between border-orange-200 dark:border-orange-900/30 dark:text-rose-200">
                            {SORT_OPTIONS.find(option => option.value === sortOrder)?.label}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {SORT_OPTIONS.map((option) => (
                            <DropdownMenuItem 
                              key={option.value} 
                              onClick={() => handleSortChange(option.value)}
                              className={sortOrder === option.value ? "bg-orange-100 dark:bg-orange-900/20" : ""}
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-muted-foreground">Page size:</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex justify-between border-orange-200 dark:border-orange-900/30 dark:text-rose-200">
                            {PAGE_SIZE_OPTIONS.find(option => option.value === pageSize)?.label}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {PAGE_SIZE_OPTIONS.map((option) => (
                            <DropdownMenuItem 
                              key={option.value} 
                              onClick={() => handlePageSizeChange(option.value)}
                              className={pageSize === option.value ? "bg-orange-100 dark:bg-orange-900/20" : ""}
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {dogs.map((dog) => (
                    <DogCard key={dog.id} dog={dog} />
                  ))}
                </div>

                {/* Pagination */}
                {paginationInfo && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Page {paginationInfo.currentPage} of {paginationInfo.totalPages} | Total Results: {paginationInfo.totalResults}
                    </p>
                    <div className="flex gap-4">
                      {paginationInfo.hasPrev && (
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange('prev')}
                          disabled={loading}
                        >
                          Previous
                        </Button>
                      )}

                      {paginationInfo.hasNext && (
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange('next')}
                          disabled={loading}
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;