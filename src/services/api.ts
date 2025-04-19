import axios from 'axios';
import type { Dog, Location, SearchResponse, DogSearchParams } from '../types/index';

const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

// Configure axios to include credentials
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const loginUser = async (name: string, email: string) => {
  return apiClient.post('/auth/login', { name, email });
};

export const logoutUser = async () => {
  return apiClient.post('/auth/logout');
};

export const getBreeds = async () => {
  return apiClient.get<string[]>('/dogs/breeds');
};

export const searchDogs = async (params: DogSearchParams) => {
  return apiClient.get<SearchResponse>('/dogs/search', { params });
};

export const getDogs = async (dogIds: string[]) => {
  return apiClient.post<Dog[]>('/dogs', dogIds);
};

export const getMatch = async (dogIds: string[]) => {
  return apiClient.post<{ match: string }>('/dogs/match', dogIds);
};

export const getLocations = async (zipCodes: string[]) => {
  return apiClient.post<Location[]>('/locations', zipCodes);
};