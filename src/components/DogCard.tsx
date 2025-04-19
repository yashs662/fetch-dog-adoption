import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFavorites } from '../context/FavoritesContext';
import { useLocation } from '../context/LocationContext';
import { Dog } from '../types';
import { Heart, MapPin } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

interface DogCardProps {
  dog: Dog;
  isMatch?: boolean;
}

const DogCard: React.FC<DogCardProps> = ({ dog, isMatch = false }) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { getLocationByZip, isLoading } = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const isFavorited = isFavorite(dog.id);
  const location = getLocationByZip(dog.zip_code);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorited) {
      removeFavorite(dog.id);
    } else {
      addFavorite(dog);
    }
  };

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
      >
        <Card
          className={`overflow-hidden border-orange-100 dark:border-orange-900/20 dark:bg-gray-900 transition-all duration-300 hover:shadow-lg py-0 ${isMatch ? 'border-2 border-rose-500 dark:border-orange-500' : ''}`}
          onClick={toggleDialog}
        >
          <CardHeader className='p-0'>
            <div className="relative aspect-square overflow-hidden">
              <img
                src={dog.img}
                alt={dog.name}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteToggle}
                className="absolute right-2 top-2 h-12 w-12 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-900/90"
              >
                <Heart className={`h-10 w-10 ${isFavorited ? "fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400" : "text-rose-800 dark:text-rose-200"}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-rose-900 dark:text-rose-200">{dog.name}</h3>
                <p className="text-rose-700 dark:text-rose-300 text-sm">{dog.breed}</p>
                <div className="mt-2 flex items-center text-xs text-rose-600 dark:text-rose-400">
                  <MapPin className="mr-1 h-3 w-3" />
                  {isLoading ? (
                    <Skeleton className="h-4 w-16" />
                  ) : location ? (
                    <span>{location.city}</span>
                  ) : (
                    <span>{dog.zip_code}</span>
                  )}
                </div>
              </div>
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-900/50">
                {dog.age} yr{dog.age !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              variant="outline"
              className="w-full border-orange-200 text-rose-800 hover:bg-orange-50 dark:border-orange-900/30 dark:text-rose-200 dark:hover:bg-orange-950/50"
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      </motion.div >

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-orange-900/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-rose-900 dark:text-rose-200">{dog.name}</DialogTitle>
            <DialogDescription className="text-rose-700 dark:text-rose-300">{dog.breed}</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-square overflow-hidden rounded-md">
            <img
              src={dog.img}
              alt={dog.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1 text-muted-foreground dark:text-gray-400">Age</div>
                <div className="text-rose-700 dark:text-rose-300">{dog.age} years</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1 text-muted-foreground dark:text-gray-400">Location</div>
                {isLoading ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : location ? (
                  <div className="text-rose-700 dark:text-rose-300">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-rose-500 dark:text-orange-500" />
                      <span>{location.city}, {location.state} {dog.zip_code}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      County: {location.county}
                    </div>
                  </div>
                ) : (
                  <div className="text-rose-700 dark:text-rose-300">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Zip Code: {dog.zip_code}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 border-orange-200 dark:border-orange-900/30 dark:text-rose-200"
            >
              Close
            </Button>
            <Button
              onClick={handleFavoriteToggle}
              className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 dark:from-orange-600 dark:to-rose-600 dark:hover:from-orange-500 dark:hover:to-rose-500"
            >
              <Heart className={isFavorited ? "fill-white" : ""} size={16} />
              {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DogCard;