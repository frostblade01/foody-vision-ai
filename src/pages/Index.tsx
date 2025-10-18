import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, TrendingUp, Clock, Heart } from "lucide-react";
import RecipeCard, { Recipe } from "@/components/RecipeCard";
import AdvancedFilterBar, { FilterOptions } from "@/components/AdvancedFilterBar";
import RecipeModal from "@/components/RecipeModal";
import TrendingCarousel from "@/components/TrendingCarousel";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-food.jpg";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Generate consistent random values using hash function
  const generateHashValue = (seed: string, min: number, max: number) => {
    let hash = 5381;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 33) ^ seed.charCodeAt(i);
    }
    hash = hash >>> 0;
    const normalized = hash / 4294967295;
    return min + (normalized * (max - min));
  };

  // Compute consistent metrics from recipe title with randomization per recipe
  const computeMetricsFromTitle = (title: string, recipeId?: string) => {
    const t = (title || '').toLowerCase();
    const isDessert = /cookie|cake|brownie|dessert|pie|ice cream|sweet/.test(t);
    const isFried = /fried|karaage|tempura|deep|crispy/.test(t);
    const isSeafood = /salmon|tuna|shrimp|prawn|fish|seafood/.test(t);
    const isVegan = /vegan|buddha|tofu|plant/.test(t);
    const isChicken = /chicken/.test(t);
    const isBeef = /beef|steak|burger/.test(t);
    const isSaladOrBowl = /salad|bowl|quinoa|grain/.test(t);

    const baseCalories = isDessert ? 520 : isFried ? 480 : isBeef ? 520 : isChicken ? 430 : isSeafood ? 360 : isVegan ? 340 : isSaladOrBowl ? 320 : 400;
    const protein = isBeef ? 32 : isChicken ? 30 : isSeafood ? 28 : isVegan ? 18 : isDessert ? 5 : 22;
    const fat = isDessert ? 24 : isFried ? 22 : isBeef ? 20 : isChicken ? 16 : isSeafood ? 12 : isVegan ? 10 : 14;
    const carbs = isDessert ? 60 : isSaladOrBowl ? 35 : isVegan ? 38 : isFried ? 30 : 28;
    const cost = isSeafood ? 11.5 : isBeef ? 9.5 : isChicken ? 6.5 : isVegan ? 5.0 : isDessert ? 4.0 : 7.0;
    const prep = isDessert ? 45 : isFried ? 35 : isChicken ? 30 : isSeafood ? 20 : isVegan ? 25 : isSaladOrBowl ? 20 : 30;
    const sustainability = Math.max(50, Math.min(95,
      (isVegan || isSaladOrBowl) ? 90 : isSeafood ? 75 : isChicken ? 70 : isBeef ? 55 : isDessert ? 65 : 72
    ));

    // Use hash-based randomization for rating and health score
    const seed = `${recipeId || ''}_${title}`;
    const rating = Number(generateHashValue(`rating_${seed}`, 3.5, 5.0).toFixed(1));
    const health = Math.round(generateHashValue(`health_${seed}`, 45, 98));

    return {
      calories: baseCalories,
      protein,
      carbs,
      fat,
      costPerServing: Number(cost.toFixed(2)),
      prepTime: prep,
      healthScore: health,
      sustainabilityScore: sustainability,
      rating: rating,
    };
  };

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

  const fetchDefaultRecipes = async () => {
    // Mix of broad queries to avoid only "chicken"
    const queries = ["chicken", "beef", "salad", "pasta", "rice", "tofu", "fish"];
    const responses = await Promise.all(
      queries.map(q => fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`))
    );
    const datas = await Promise.all(responses.map(r => r.json()));
    const meals = datas.flatMap(d => d.meals || []);
    // De-duplicate by idMeal
    const map: Record<string, any> = {};
    meals.forEach(m => { if (m?.idMeal) map[m.idMeal] = m; });
    return Object.values(map);
  };

  const fetchRecipes = async (query: string = "") => {
    setLoading(true);
    try {
      // Fetch both API recipes and user recipes
      const [apiMeals, userRecipesResponse] = await Promise.all([
        query
          ? fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`).then(r => r.json()).then(d => d.meals || [])
          : fetchDefaultRecipes(),
        supabase
          .from("user_recipes")
          .select("*")
          .eq("status", "approved")
          .ilike("title", `%${query || ''}%`)
      ]);

      const apiRecipes = apiMeals || [];
      const userRecipes = userRecipesResponse.data || [];

      // Convert user recipes to Recipe format (use DB nutrition, fallback to title-derived)
      const convertedUserRecipes = userRecipes.map(recipe => ({
        idMeal: recipe.id,
        strMeal: recipe.title,
        strMealThumb: recipe.image_url || "",
        strCategory: recipe.category || "",
        strArea: recipe.cuisine || "",
        strInstructions: recipe.instructions,
        strTags: recipe.tags?.join(", ") || "",
        // Add user recipe metadata
        isUserRecipe: true,
        ...(() => {
          const m = computeMetricsFromTitle(recipe.title || "", recipe.id);
          return {
            calories: recipe.calories ?? m.calories,
            protein: recipe.protein ?? m.protein,
            carbs: recipe.carbs ?? m.carbs,
            fat: recipe.fat ?? m.fat,
            costPerServing: recipe.cost_per_serving ?? m.costPerServing,
            sustainabilityScore: recipe.sustainability_score ?? m.sustainabilityScore,
            rating: m.rating,
            prepTime: m.prepTime,
            healthScore: m.healthScore,
          };
        })(),
        likeCount: recipe.like_count,
        viewCount: recipe.view_count
      }));

      // Convert API recipes and attach computed metrics for consistency
      const convertedApiRecipes = (apiRecipes || []).map((r: any) => {
        const m = computeMetricsFromTitle(r.strMeal, r.idMeal);
        return {
          ...r,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
          costPerServing: m.costPerServing,
          sustainabilityScore: m.sustainabilityScore,
          rating: m.rating,
          prepTime: m.prepTime,
          healthScore: m.healthScore,
        };
      });

      // Combine
      const allRecipes = [...convertedApiRecipes, ...convertedUserRecipes];
      setRecipes(allRecipes);
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

  const handleFilter = async (filters: FilterOptions) => {
    setLoading(true);
    try {
      let allRecipes: any[] = [];

      // Fetch API recipes broadly by query or defaults
      if (filters.query) {
        const apiResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${filters.query}`);
        const apiData = await apiResponse.json();
        allRecipes = [...(apiData.meals || [])];
      } else {
        allRecipes = await fetchDefaultRecipes();
      }

      // Fetch user recipes with filters
      let userQuery = supabase
        .from("user_recipes")
        .select("*")
        .eq("status", "approved");

      if (filters.query) {
        userQuery = userQuery.ilike("title", `%${filters.query}%`);
      }
      if (filters.category && filters.category !== "all") {
        userQuery = userQuery.eq("category", filters.category);
      }
      if (filters.area && filters.area !== "all") {
        userQuery = userQuery.eq("cuisine", filters.area);
      }

      const { data: userRecipes } = await userQuery;

      // Convert user recipes to Recipe format
      const convertedUserRecipes = (userRecipes || []).map(recipe => ({
        idMeal: recipe.id,
        strMeal: recipe.title,
        strMealThumb: recipe.image_url || "",
        strCategory: recipe.category || "",
        strArea: recipe.cuisine || "",
        strInstructions: recipe.instructions,
        strTags: recipe.tags?.join(", ") || "",
        isUserRecipe: true,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        costPerServing: recipe.cost_per_serving,
        sustainabilityScore: recipe.sustainability_score,
        likeCount: recipe.like_count,
        viewCount: recipe.view_count
      }));

      // Attach computed metrics to API recipes for consistency
      const convertedApi = (allRecipes || []).map((r: any) => ({
        ...r,
        ...computeMetricsFromTitle(r.strMeal, r.idMeal),
      }));

      // Combine recipes
      let combinedRecipes = [...convertedApi, ...convertedUserRecipes];

      // Apply client-side filters for nutrition and price
      if (filters.maxCalories) {
        combinedRecipes = combinedRecipes.filter(recipe => {
          const calories = recipe.calories || recipe.isUserRecipe ? recipe.calories : 400; // Default for API recipes
          return calories <= filters.maxCalories!;
        });
      }

      if (filters.minProtein) {
        combinedRecipes = combinedRecipes.filter(recipe => {
          const protein = recipe.protein || recipe.isUserRecipe ? recipe.protein : 20; // Default for API recipes
          return protein >= filters.minProtein!;
        });
      }

      if (filters.maxCarbs) {
        combinedRecipes = combinedRecipes.filter(recipe => {
          const carbs = recipe.carbs || recipe.isUserRecipe ? recipe.carbs : 30; // Default for API recipes
          return carbs <= filters.maxCarbs!;
        });
      }

      if (filters.maxFat) {
        combinedRecipes = combinedRecipes.filter(recipe => {
          const fat = recipe.fat || recipe.isUserRecipe ? recipe.fat : 15; // Default for API recipes
          return fat <= filters.maxFat!;
        });
      }

      if (filters.maxPrice) {
        combinedRecipes = combinedRecipes.filter(recipe => {
          const price = recipe.costPerServing || recipe.isUserRecipe ? recipe.costPerServing : 8; // Default for API recipes
          return price <= filters.maxPrice!;
        });
      }

      // Apply category/area filters strictly when provided
      if (filters.category && filters.category !== "all") {
        combinedRecipes = combinedRecipes.filter(r => (r.strCategory || '').toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.area && filters.area !== "all") {
        combinedRecipes = combinedRecipes.filter(r => (r.strArea || '').toLowerCase() === filters.area.toLowerCase());
      }

      // Apply dietary filters
      if (filters.dietary && filters.dietary !== "all") {
        combinedRecipes = combinedRecipes.filter(recipe => {
          const tags = recipe.strTags?.toLowerCase() || "";
          const category = recipe.strCategory?.toLowerCase() || "";
          
          switch (filters.dietary) {
            case "gluten-free":
              return tags.includes("gluten-free") || tags.includes("gluten free");
            case "dairy-free":
              return tags.includes("dairy-free") || tags.includes("dairy free");
            case "nut-free":
              return tags.includes("nut-free") || tags.includes("nut free");
            case "low-carb":
              return tags.includes("low-carb") || tags.includes("keto");
            case "high-protein":
              return tags.includes("high-protein") || tags.includes("protein");
            case "keto":
              return tags.includes("keto") || tags.includes("keto-friendly");
            case "paleo":
              return tags.includes("paleo");
            case "vegan":
              return (category === "vegan" || tags.includes("vegan")) && !["beef","pork","chicken","lamb","seafood","fish"].some(m => category.includes(m));
            case "vegetarian":
              return (category === "vegetarian" || tags.includes("vegetarian")) && !["beef","pork","chicken","lamb","seafood","fish"].some(m => category.includes(m));
            default:
              return true;
          }
        });
      }

      // If a meat category explicitly selected, exclude vegetarian/vegan
      if (filters.category && ["Beef","Pork","Chicken","Lamb","Seafood","Goat"].includes(filters.category)) {
        combinedRecipes = combinedRecipes.filter(r => {
          const c = (r.strCategory || "").toLowerCase();
          return !["vegetarian","vegan"].includes(c);
        });
      }

      setRecipes(combinedRecipes);
    } catch (error) {
      toast({
        title: "Error filtering recipes",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleRecipeClick = async (recipe: Recipe) => {
    try {
      // Create enriched recipe object using existing data and computed metrics
      const m = computeMetricsFromTitle(recipe.strMeal, recipe.idMeal);
      const enriched: any = {
        ...recipe,
        calories: (recipe as any).calories ?? m.calories,
        protein: (recipe as any).protein ?? m.protein,
        carbs: (recipe as any).carbs ?? m.carbs,
        fat: (recipe as any).fat ?? m.fat,
        costPerServing: (recipe as any).costPerServing ?? m.costPerServing,
        sustainabilityScore: (recipe as any).sustainabilityScore ?? m.sustainabilityScore,
        rating: (recipe as any).rating ?? m.rating,
        prepTime: (recipe as any).prepTime ?? m.prepTime,
        healthScore: (recipe as any).healthScore ?? m.healthScore,
      };

      // For API recipes, fetch full details for instructions/ingredients only
      if (!(recipe as any).isUserRecipe && !(recipe as any).ingredients) {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`
        );
        const data = await response.json();
        setSelectedRecipe({ ...data.meals[0], ...enriched } as any);
      } else {
        setSelectedRecipe(enriched);
      }
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: "Error loading recipe details",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleTrendingRecipeClick = async (recipe: any) => {
    // Handle trending recipe click - could open modal or navigate
    try {
      if (recipe.id.startsWith('demo-')) {
        // For demo recipes, create a mock recipe object
        const mockRecipe: Recipe = {
          idMeal: recipe.id,
          strMeal: recipe.title,
          strMealThumb: recipe.image_url,
          strCategory: recipe.category,
          strArea: recipe.cuisine,
          strInstructions: "Demo recipe instructions would go here.",
          strTags: recipe.category
        };
        setSelectedRecipe(mockRecipe);
        setIsModalOpen(true);
      } else {
        // For real user recipes, fetch full details
        const { data } = await supabase
          .from("user_recipes")
          .select("*")
          .eq("id", recipe.id)
          .single();
        
        if (data) {
          // Convert user recipe to Recipe format for modal
          const userRecipe: Recipe = {
            idMeal: data.id,
            strMeal: data.title,
            strMealThumb: data.image_url || "",
            strCategory: data.category || "",
            strArea: data.cuisine || "",
            strInstructions: data.instructions,
            strTags: data.tags?.join(", ") || ""
          };
          setSelectedRecipe(userRecipe);
          setIsModalOpen(true);
        }
      }
    } catch (error) {
      toast({
        title: "Error loading recipe",
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

    // Guard when DB disabled
    const { VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY } = import.meta.env as any;
    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_PUBLISHABLE_KEY) {
      toast({ title: "Database unavailable", description: "Supabase not configured.", variant: "destructive" });
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
      {/* Hero Section - Only show when not logged in */}
      {!user && (
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Delicious food"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ChefHat className="w-12 h-12 text-primary animate-glow" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Foodyfy
              </h1>
            </div>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover delicious recipes tailored to your taste, health goals, and ingredients.
              Powered by smart AI recommendations.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button variant="hero" size="lg" className="text-lg px-8" onClick={() => navigate('/auth')}>
                <ChefHat className="w-5 h-5 mr-2" />
                Start Cooking
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Stats Bar - Only show when not logged in */}
        {!user && (
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
        )}

        {/* Trending Today Section */}
        <TrendingCarousel onRecipeClick={handleTrendingRecipeClick} />

        {/* Advanced Filter Bar */}
        {user && (
          <div className="mb-8">
            <AdvancedFilterBar onFilter={handleFilter} />
          </div>
        )}

        {/* Recipes Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
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
              {recipes.map((recipe, idx) => {
                // Deterministic per-card metrics so featured tiles aren't identical
                const m = computeMetricsFromTitle(recipe.strMeal, recipe.idMeal);
                const rating = m.rating.toFixed(1);
                const prepTime = m.prepTime;
                const calories = m.calories;
                const cost = m.costPerServing.toFixed(2);
                const health = m.healthScore;
                return (
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
                    rating={Number(rating)}
                    prepTime={prepTime}
                    calories={calories}
                    costPerPortion={Number(cost)}
                    healthScore={health}
                    onClick={() => handleRecipeClick(recipe)}
                  />
                </div>
              );})}
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
        onSaveRecipe={handleSaveRecipe}
      />
    </div>
  );
};

export default Index;
