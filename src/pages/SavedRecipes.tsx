import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import RecipeCard, { Recipe } from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal";
import { Heart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SavedRecipe {
  id: string;
  recipe_id: string;
  recipe_name: string;
  recipe_image: string;
  category: string;
  area: string;
}

const SavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("saved_recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading saved recipes",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSavedRecipes(data || []);
    }
    setLoading(false);
  };

  const handleRecipeClick = async (recipeId: string) => {
    try {
      // Attempt TheMealDB first (API recipe)
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
      const data = await response.json();
      if (data?.meals && data.meals[0]) {
        setSelectedRecipe(data.meals[0]);
        setIsModalOpen(true);
        return;
      }
      // Fallback to user_recipes
      const { data: userRecipe } = await supabase
        .from("user_recipes")
        .select("*")
        .eq("id", recipeId)
        .maybeSingle();
      if (userRecipe) {
        const recipe: Recipe = {
          idMeal: userRecipe.id,
          strMeal: userRecipe.title,
          strMealThumb: userRecipe.image_url || "",
          strCategory: userRecipe.category || "",
          strArea: userRecipe.cuisine || "",
          strInstructions: userRecipe.instructions,
          strTags: userRecipe.tags?.join(", ") || "",
        } as any;
        (recipe as any).isUserRecipe = true;
        setSelectedRecipe(recipe);
        setIsModalOpen(true);
      }
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <Heart className="w-10 h-10 text-primary fill-primary" />
            <h1 className="text-4xl font-bold">Saved Recipes</h1>
          </div>

          {savedRecipes.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No saved recipes yet</h2>
              <p className="text-muted-foreground">
                Start exploring and save your favorite recipes!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedRecipes.map((saved) => (
                <RecipeCard
                  key={saved.id}
                  recipe={{
                    idMeal: saved.recipe_id,
                    strMeal: saved.recipe_name,
                    strMealThumb: saved.recipe_image,
                    strCategory: saved.category,
                    strArea: saved.area,
                  }}
                  onClick={() => handleRecipeClick(saved.recipe_id)}
                />
              ))}
            </div>
          )}
          <RecipeModal
            recipe={selectedRecipe}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default SavedRecipes;
