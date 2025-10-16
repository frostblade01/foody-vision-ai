import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, DollarSign, Star, Heart, Share2, TrendingUp, MessageCircle, Leaf, Zap } from "lucide-react";
import { Recipe } from "./RecipeCard";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RecipeComments from "./RecipeComments";
import RecipeReview from "./RecipeReview";
import { useMemo } from "react";
import { detectCountryCode, getPersistedCountry, persistCountry, isNoonCountry } from "@/lib/location";
import { buildGroceryUrls } from "@/lib/grocery";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRecipe?: (recipe: Recipe) => void;
}

const RecipeModal = ({ recipe, isOpen, onClose, onSaveRecipe }: RecipeModalProps) => {
  const [user, setUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<string>(getPersistedCountry() || detectCountryCode());
  const { toast } = useToast();
  
  // Derive ingredients list BEFORE conditional rendering
  const ingredients = useMemo(() => {
    if (!recipe) return [];
    const isUserRecipe = (recipe as any).isUserRecipe || (recipe as any).ingredients;
    return isUserRecipe 
      ? (recipe as any).ingredients?.map((ing: any) => `${ing.amount} ${ing.unit} ${ing.name}`) || []
      : Array.from({ length: 20 }, (_, i) => {
          const ingredient = (recipe as any)[`strIngredient${i + 1}`];
          const measure = (recipe as any)[`strMeasure${i + 1}`];
          return ingredient ? `${measure} ${ingredient}` : null;
        }).filter(Boolean);
  }, [recipe]);

  const ingredientList = useMemo(() => ingredients.map((i) => String(i)), [ingredients]);

  useEffect(() => {
    checkUser();
    if (recipe) {
      loadRecipeData();
    }
  }, [recipe]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadRecipeData = async () => {
    if (!recipe || !user) return;

    try {
      // Check if user has liked this recipe
      const { data: likeData } = await supabase
        .from("recipe_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("recipe_id", recipe.idMeal)
        .eq("recipe_type", ((recipe as any).isUserRecipe || (recipe as any).ingredients) ? "user" : "api")
        .maybeSingle();

      setIsLiked(!!likeData);

      // Get like count
      const { count } = await supabase
        .from("recipe_likes")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", recipe.idMeal)
        .eq("recipe_type", ((recipe as any).isUserRecipe || (recipe as any).ingredients) ? "user" : "api");

      setLikeCount(count || 0);
    } catch (error) {
      console.error("Error loading recipe data:", error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like recipes",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("recipe_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipe!.idMeal)
          .eq("recipe_type", ((recipe! as any).isUserRecipe || (recipe! as any).ingredients) ? "user" : "api");

        if (!error) {
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Like
        const { error } = await supabase
          .from("recipe_likes")
          .insert({
            user_id: user.id,
            recipe_id: recipe!.idMeal,
            recipe_type: ((recipe! as any).isUserRecipe || (recipe! as any).ingredients) ? "user" : "api"
          });

        if (!error) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe!.strMeal,
        text: `Check out this recipe: ${recipe!.strMeal}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Recipe link copied to clipboard",
      });
    }
  };

  if (!recipe) return null;

  // Get nutrition data
  const nutrition = {
    calories: (recipe as any).calories ?? 420,
    protein: (recipe as any).protein ?? 25,
    carbs: (recipe as any).carbs ?? 35,
    fat: (recipe as any).fat ?? 18,
    cost: (recipe as any).cost_per_serving ?? (recipe as any).costPerServing ?? 4.99,
    sustainability: (recipe as any).sustainability_score ?? (recipe as any).sustainabilityScore ?? 75
  };

  const partner = isNoonCountry(country as any) ? 'Noon' : 'Amazon';

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
          
          <div className="flex items-center gap-6 py-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-primary text-primary" />
              <span className="font-semibold">{(recipe as any).rating ?? 4.5}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>{(recipe as any).prepTime ?? 30} min</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <span>{nutrition.cost}</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              <span>{nutrition.sustainability}% Sustainable</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span>{likeCount} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Health {Math.min(100, Math.max(0, Math.round(((nutrition.protein || 0) * 2 - (nutrition.fat || 0)) + 50)))}%</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="hero" 
              className="flex-1"
              onClick={() => onSaveRecipe?.(recipe)}
            >
              <Heart className="w-4 h-4 mr-2" />
              Save Recipe
            </Button>
            <Button 
              variant={isLiked ? "default" : "glass"}
              onClick={handleLike}
              disabled={loading}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="glass" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <DialogDescription className="space-y-6 text-foreground">
          <Tabs defaultValue="recipe" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="recipe">Recipe</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="reels">Reels</TabsTrigger>
              <TabsTrigger value="grocery">Grocery</TabsTrigger>
            </TabsList>

            <TabsContent value="recipe" className="space-y-6">
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
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Nutrition Facts (per serving)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{nutrition.calories}</div>
                    <div className="text-xs text-muted-foreground">Calories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{nutrition.protein}g</div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{nutrition.carbs}g</div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{nutrition.fat}g</div>
                    <div className="text-xs text-muted-foreground">Fat</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  Sustainability Score
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-green-500">{nutrition.sustainability}%</div>
                  <div className="text-sm text-muted-foreground">
                    This recipe has a {nutrition.sustainability}% sustainability score based on ingredient sourcing and environmental impact.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Popularity
                </h3>
                <div className="text-sm text-muted-foreground">
                  Likes: {likeCount} • Views: {(recipe as any).viewCount || 0}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <RecipeComments 
                recipeId={recipe.idMeal} 
                recipeType={((recipe as any).isUserRecipe || (recipe as any).ingredients) ? "user" : "api"} 
              />
            </TabsContent>

            <TabsContent value="reviews">
              <RecipeReview 
                recipeId={recipe.idMeal} 
                recipeType={((recipe as any).isUserRecipe || (recipe as any).ingredients) ? "user" : "api"} 
              />
            </TabsContent>

            <TabsContent value="reels" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-3 text-sm text-muted-foreground">Uploaded by <span className="font-medium">Chef Demo</span></div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="grocery" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Select items to order via {partner}. Change country if needed.
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm">Country</label>
                <select
                  className="border rounded px-2 py-1 bg-background"
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); persistCountry(e.target.value as any); }}
                >
                  {['AE','SA','EG','JO','BH','OM','KW','US','GB','DE','FR','IN','CA','AU','SG','OTHER'].map((cc) => (
                    <option key={cc} value={cc}>{cc}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ingredientList.map((ing, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 rounded border bg-card/50">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">{ing}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    const container = document.activeElement?.closest('div');
                    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
                    const selected = ingredientList.filter((_, idx) => checkboxes[idx]?.checked);
                    const urls = buildGroceryUrls(country as any, selected);
                    urls.slice(0, 5).forEach(u => window.open(u, '_blank'));
                  }}
                >
                  Order Selected
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeModal;
