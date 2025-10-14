import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles, TrendingUp, Clock, Heart } from "lucide-react";
import RecipeCard, { Recipe } from "@/components/RecipeCard";
import AdvancedFilterBar, { FilterOptions } from "@/components/AdvancedFilterBar";
import RecipeModal from "@/components/RecipeModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-food.jpg";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSavedRecipes();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSavedRecipes();
      } else {
        setSavedRecipeIds(new Set());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSavedRecipes = async () => {
    const { data } = await supabase
      .from("saved_recipes")
      .select("recipe_id");
    
    if (data) {
      setSavedRecipeIds(new Set(data.map(r => r.recipe_id)));
    }
  };

  const fetchRecipes = async (query: string = "chicken") => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      const data = await response.json();
      setRecipes(data.meals || []);
    } catch (error) {
      toast({
        title: "Error fetching recipes",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchByCategory = async (category: string) => {
    if (category === "all") {
      fetchRecipes();
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
      );
      const data = await response.json();
      setRecipes(data.meals || []);
    } catch (error) {
      toast({
        title: "Error fetching recipes",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchByArea = async (area: string) => {
    if (area === "all") {
      fetchRecipes();
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`
      );
      const data = await response.json();
      setRecipes(data.meals || []);
    } catch (error) {
      toast({
        title: "Error fetching recipes",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: FilterOptions) => {
    if (filters.query) {
      fetchRecipes(filters.query);
    } else if (filters.category && filters.category !== "all") {
      fetchByCategory(filters.category);
    } else if (filters.area && filters.area !== "all") {
      fetchByArea(filters.area);
    } else {
      fetchRecipes();
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleRecipeClick = async (recipe: Recipe) => {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`
      );
      const data = await response.json();
      setSelectedRecipe(data.meals[0]);
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: "Error loading recipe details",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save recipes",
        variant: "destructive",
      });
      return;
    }

    const isSaved = savedRecipeIds.has(recipe.idMeal);

    if (isSaved) {
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .eq("recipe_id", recipe.idMeal)
        .eq("user_id", user.id);

      if (!error) {
        setSavedRecipeIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipe.idMeal);
          return newSet;
        });
        toast({
          title: "Recipe removed",
          description: "Recipe removed from your saved list",
        });
      }
    } else {
      const { error } = await supabase.from("saved_recipes").insert({
        user_id: user.id,
        recipe_id: recipe.idMeal,
        recipe_name: recipe.strMeal,
        recipe_image: recipe.strMealThumb,
        category: recipe.strCategory,
        area: recipe.strArea,
      });

      if (!error) {
        setSavedRecipeIds(prev => new Set(prev).add(recipe.idMeal));
        toast({
          title: "Recipe saved!",
          description: "Recipe added to your saved list",
        });
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Delicious food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 space-y-6 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="w-12 h-12 text-primary animate-glow" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Foodyfy
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover delicious recipes tailored to your taste, health goals, and ingredients.
            Powered by smart AI recommendations.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button variant="hero" size="lg" className="text-lg px-8">
              <Sparkles className="w-5 h-5 mr-2" />
              Get AI Suggestions
            </Button>
            <Button variant="glass" size="lg" className="text-lg px-8">
              <TrendingUp className="w-5 h-5 mr-2" />
              Trending Today
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-lg p-6 text-center hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-muted-foreground">Recipes Available</div>
          </div>
          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-lg p-6 text-center hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">Cuisines</div>
          </div>
          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-lg p-6 text-center hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-primary mb-2">
              <Clock className="w-10 h-10 mx-auto text-primary" />
            </div>
            <div className="text-muted-foreground">Quick & Easy</div>
          </div>
        </div>

        {/* Advanced Filter Bar */}
        <div className="mb-8">
          <AdvancedFilterBar onFilter={handleFilter} />
        </div>

        {/* Recipes Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            Featured Recipes
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-lg bg-card/40 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {recipes.map((recipe) => (
                <div key={recipe.idMeal} className="relative group">
                  {user && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveRecipe(recipe);
                      }}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          savedRecipeIds.has(recipe.idMeal)
                            ? "fill-primary text-primary"
                            : ""
                        }`}
                      />
                    </Button>
                  )}
                  <RecipeCard
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe)}
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && recipes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No recipes found. Try a different search!
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Index;
