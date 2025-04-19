import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { SearchProvider } from './context/SearchContext'
import { LocationProvider } from './context/LocationContext'
import Login from './pages/login'
import './index.css'

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './components/theme-provider'
const Search = lazy(() => import('./pages/Search'));
const Match = lazy(() => import('./pages/Match'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <SearchProvider>
              <LocationProvider>
                <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/search" element={
                      <ProtectedRoute>
                        <Search />
                      </ProtectedRoute>
                    } />
                    <Route path="/match" element={
                      <ProtectedRoute>
                        <Match />
                      </ProtectedRoute>
                    } />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                  </Routes>
                </Suspense>
              </LocationProvider>
            </SearchProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
