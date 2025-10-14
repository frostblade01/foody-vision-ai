import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import RecipeCard from "@/components/RecipeCard";
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

  const handleRecipeClick = (recipeId: string) => {
    // Navigate to recipe detail or open modal
    console.log("Recipe clicked:", recipeId);
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
        </div>
      </div>
    </div>
  );
};

export default SavedRecipes;
