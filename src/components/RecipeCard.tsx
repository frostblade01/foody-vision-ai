import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Star, TrendingUp } from "lucide-react";

export interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strTags?: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  calories?: number;
  costPerPortion?: number;
  prepTime?: number;
  rating?: number;
  healthScore?: number;
  onClick?: () => void;
}

const RecipeCard = ({
  recipe,
  calories = 420,
  costPerPortion = 4.99,
  prepTime = 30,
  rating = 4.5,
  healthScore = 85,
  onClick,
}: RecipeCardProps) => {
  return (
    <Card
      className="overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className="bg-primary/90 backdrop-blur-sm border-none">
            {recipe.strCategory}
          </Badge>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <Star className="w-4 h-4 fill-primary text-primary" />
          <span className="text-sm font-semibold text-foreground">{rating}</span>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {recipe.strMeal}
        </h3>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{prepTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">${costPerPortion}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{healthScore}% Healthy</span>
        </div>
        <div className="text-sm text-muted-foreground">{calories} cal</div>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
