// src/pages/Match.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatch } from '../services/api';
import type { Dog } from '../types';
import Header from '../components/Header';
import DogCard from '../components/DogCard';
import { useFavorites } from '../context/FavoritesContext';
import { useLocation } from '../context/LocationContext';
import { motion } from 'framer-motion';
import { HeartHandshake, AlertCircle, ArrowLeft } from 'lucide-react';

// Shadcn UI components
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '../components/ui/dialog';

const Match: React.FC = () => {
    const navigate = useNavigate();
    const { favorites, setFavorites } = useFavorites();
    const { fetchLocations } = useLocation();
    const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);

    // Fetch location data for favorited dogs when component mounts or favorites change
    useEffect(() => {
        if (favorites.length > 0) {
            const zipCodes = favorites.map(dog => dog.zip_code);
            fetchLocations(zipCodes);
        }
    }, [favorites, fetchLocations]);

    const handleFindMatch = async () => {
        if (favorites.length === 0) {
            setError("Please add some dogs to your favorites first");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getMatch(favorites.map(dog => dog.id));

            if (response.data?.match) {
                // Find the dog object from our favorites that matches the returned ID
                const matchDog = favorites.find(dog => dog.id === response.data.match);

                if (matchDog) {
                    setMatchedDog(matchDog);
                    setShowSuccessDialog(true);
                } else {
                    setError("Matched dog not found in favorites");
                }
            } else {
                setError("No match found. Try adding more dogs to your favorites");
            }
        } catch (err) {
            setError("Failed to find a match. Please try again later.");
            console.error("Match error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearFavorites = () => {
        setFavorites([]);
        setMatchedDog(null);
    };

    if (favorites.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 dark:from-gray-950 dark:to-rose-950">
                <Header />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container mx-auto px-4 py-16 text-center"
                >
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100">
                        <AlertCircle className="h-12 w-12 text-orange-500" />
                    </div>
                    <h1 className="mb-4 text-3xl font-bold text-rose-900 dark:text-rose-200">No Favorites Yet</h1>
                    <p className="mb-8 text-rose-700 dark:text-rose-300">
                        You haven't added any dogs to your favorites yet. <br />
                        Browse dogs and add some to your favorites to find a match!
                    </p>
                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            onClick={() => navigate('/search')}
                            className='flex bg-orange-100 dark:bg-rose-700 hover:bg-orange-50 dark:hover:bg-rose-800 items-center justify-center gap-2 border-orange-200 dark:border-orange-900/30 dark:text-rose-200'
                        >
                            <span className='text-rose-500 dark:text-rose-200'>Find Dogs</span>
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 dark:from-gray-950 dark:to-rose-950">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button
                            variant="ghost"
                            className="mb-4 flex items-center text-rose-700 dark:text-rose-300"
                            onClick={() => navigate('/search')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Search
                        </Button>
                        <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-200">Your Favorites</h1>
                        <p className="text-rose-700 dark:text-rose-300">
                            {favorites.length} {favorites.length === 1 ? 'dog' : 'dogs'} in your favorites
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex flex-wrap gap-3"
                    >
                        <Button
                            variant="outline"
                            onClick={handleClearFavorites}
                            disabled={favorites.length === 0}
                        >
                            Clear All
                        </Button>
                        <Button

                            onClick={handleFindMatch}
                            disabled={isLoading || favorites.length === 0}
                        >
                            {isLoading ? 'Finding...' : 'Find Match'}
                            <HeartHandshake className="ml-2 h-4 w-4" />
                        </Button>
                    </motion.div>
                </div>

                {error && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="p-4 text-red-800">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                                <div className="ml-3">{error}</div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {favorites.map(dog => (
                        <motion.div
                            key={dog.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DogCard dog={dog} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Match Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-rose-900 dark:text-rose-200">
                            You've Been Matched!
                        </DialogTitle>
                        <DialogDescription className="text-rose-700 dark:text-rose-300">
                            Congratulations! We've found your perfect match.
                        </DialogDescription>
                    </DialogHeader>

                    {matchedDog && (
                        <div className="my-4 flex justify-center">
                            <div className="w-full max-w-xs">
                                <DogCard dog={matchedDog} isMatch />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button

                            onClick={() => setShowSuccessDialog(false)}
                            className="w-full"
                        >
                            Continue Browsing
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Match;