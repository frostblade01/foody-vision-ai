import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Star, Heart, Share2, TrendingUp } from "lucide-react";
import { Recipe } from "./RecipeCard";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeModal = ({ recipe, isOpen, onClose }: RecipeModalProps) => {
  if (!recipe) return null;

  const ingredients = Array.from({ length: 20 }, (_, i) => {
    const ingredient = (recipe as any)[`strIngredient${i + 1}`];
    const measure = (recipe as any)[`strMeasure${i + 1}`];
    return ingredient ? `${measure} ${ingredient}` : null;
  }).filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <div className="relative h-64 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex gap-2 mb-3">
                {recipe.strCategory && (
                  <Badge className="bg-primary/90 backdrop-blur-sm">
                    {recipe.strCategory}
                  </Badge>
                )}
                {recipe.strArea && (
                  <Badge variant="secondary" className="backdrop-blur-sm">
                    {recipe.strArea}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DialogTitle className="text-3xl font-bold">{recipe.strMeal}</DialogTitle>
          
          <div className="flex items-center gap-6 py-4 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-primary text-primary" />
              <span className="font-semibold">4.5</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>30 min</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <span>$4.99</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>85% Healthy</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="hero" className="flex-1">
              <Heart className="w-4 h-4 mr-2" />
              Save Recipe
            </Button>
            <Button variant="glass">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <DialogDescription className="space-y-6 text-foreground">
          <div>
            <h3 className="text-xl font-bold mb-3">Ingredients</h3>
            <ul className="grid grid-cols-2 gap-2">
              {ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/30"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {recipe.strInstructions && (
            <div>
              <h3 className="text-xl font-bold mb-3">Instructions</h3>
              <div className="space-y-3 text-muted-foreground">
                {recipe.strInstructions.split('\n').filter(Boolean).map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <h3 className="text-lg font-bold mb-2">Nutrition Facts (per serving)</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">420</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">25g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">35g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">18g</div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeModal;
