// src/context/LocationContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { Location } from '../types';
import { getLocations } from '../services/api';

interface LocationContextType {
    locations: Record<string, Location>;
    fetchLocations: (zipCodes: string[]) => Promise<void>;
    getLocationByZip: (zipCode: string) => Location | undefined;
    isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locations, setLocations] = useState<Record<string, Location>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Fetch locations for multiple zip codes, but only those we don't already have
    const fetchLocations = async (zipCodes: string[]) => {
        // Filter out zip codes we already have
        const newZipCodes = zipCodes.filter(zip => !locations[zip]);

        if (newZipCodes.length === 0) return;

        setIsLoading(true);
        try {
            const response = await getLocations(newZipCodes);
            const newLocations = { ...locations };

            response.data.forEach(location => {
                newLocations[location.zip_code] = location;
            });

            setLocations(newLocations);
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getLocationByZip = (zipCode: string): Location | undefined => {
        return locations[zipCode];
    };

    return (
        <LocationContext.Provider value={{ locations, fetchLocations, getLocationByZip, isLoading }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};