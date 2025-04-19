export interface Dog {
    id: string;
    img: string;
    name: string;
    age: number;
    zip_code: string;
    breed: string;
  }
  
export interface Location {
    zip_code: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    county: string;
  }
  
export interface Coordinates {
    lat: number;
    lon: number;
  }
  
export interface SearchResponse {
    resultIds: string[];
    total: number;
    next: string | null;
    prev: string | null;
  }

export interface DogSearchParams {
    breeds?: string[];
    zipCodes?: string[];
    ageMin?: number;
    ageMax?: number;
    size?: number;
    from?: string;
    sort?: string;
  }