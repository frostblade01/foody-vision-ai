import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Heart, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrendingRecipe {
  id: string;
  title: string;
  image_url: string;
  category: string;
  cuisine: string;
  like_count: number;
  view_count: number;
  rating?: number;
  prep_time?: number;
  calories?: number;
}

interface TrendingCarouselProps {
  onRecipeClick?: (recipe: TrendingRecipe) => void;
}

const TrendingCarousel = ({ onRecipeClick }: TrendingCarouselProps) => {
  const [recipes, setRecipes] = useState<TrendingRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrendingRecipes();
  }, []);

  const fetchTrendingRecipes = async () => {
    try {
      // Fetch approved user recipes sorted by likes and views
      const { data: userRecipes, error } = await supabase
        .from("user_recipes")
        .select("*")
        .eq("status", "approved")
        .order("like_count", { ascending: false })
        .order("view_count", { ascending: false })
        .limit(10);

      if (error) throw error;

      // If no user recipes, use demo data
      if (!userRecipes || userRecipes.length === 0) {
        setRecipes(getDemoTrendingRecipes());
      } else {
        setRecipes(userRecipes);
      }
    } catch (error) {
      console.error("Error fetching trending recipes:", error);
      // Fallback to demo data
      setRecipes(getDemoTrendingRecipes());
    } finally {
      setLoading(false);
    }
  };

  const getDemoTrendingRecipes = (): TrendingRecipe[] => [
    {
      id: "demo-1",
      title: "Vegan Buddha Bowl",
      image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
      category: "Vegetarian",
      cuisine: "International",
      like_count: 24,
      view_count: 156,
      rating: 4.8,
      prep_time: 15,
      calories: 350
    },
    {
      id: "demo-2",
      title: "Perfect Scrambled Eggs",
      image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400",
      category: "Breakfast",
      cuisine: "American",
      like_count: 18,
      view_count: 89,
      rating: 4.6,
      prep_time: 5,
      calories: 180
    },
    {
      id: "demo-3",
      title: "Chocolate Chip Cookies",
      image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
      category: "Dessert",
      cuisine: "American",
      like_count: 42,
      view_count: 203,
      rating: 4.9,
      prep_time: 15,
      calories: 95
    },
    {
      id: "demo-4",
      title: "Grilled Salmon with Herbs",
      image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
      category: "Seafood",
      cuisine: "Mediterranean",
      like_count: 31,
      view_count: 127,
      rating: 4.7,
      prep_time: 10,
      calories: 280
    },
    {
      id: "demo-5",
      title: "Mediterranean Quinoa Salad",
      image_url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
      category: "Salad",
      cuisine: "Mediterranean",
      like_count: 19,
      view_count: 98,
      rating: 4.5,
      prep_time: 20,
      calories: 320
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, recipes.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, recipes.length - 2)) % Math.max(1, recipes.length - 2));
  };

  const handleRecipeClick = (recipe: TrendingRecipe) => {
    if (onRecipeClick) {
      onRecipeClick(recipe);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-primary" />
          Trending Today
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 h-48 bg-card/40 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-primary" />
          Trending Today
        </h2>
        {recipes.length > 3 && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex gap-4 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 272}px)` }}
        >
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="flex-shrink-0 w-64 cursor-pointer group hover:scale-105 transition-transform duration-300"
              onClick={() => handleRecipeClick(recipe)}
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary/90 backdrop-blur-sm border-none text-xs">
                    {recipe.category}
                  </Badge>
                </div>

                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-xs font-semibold text-white">
                    {recipe.rating || 4.5}
                  </span>
                </div>
              </div>

              <CardContent className="p-3">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {recipe.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{recipe.like_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{recipe.view_count}</span>
                    </div>
                  </div>
                  {recipe.prep_time && (
                    <span>{recipe.prep_time} min</span>
                  )}
                </div>

                {recipe.calories && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {recipe.calories} cal
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingCarousel;
