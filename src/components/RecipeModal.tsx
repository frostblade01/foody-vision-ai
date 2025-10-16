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
import { Clock, DollarSign, Star, Heart, Share2, TrendingUp, Leaf, Zap } from "lucide-react";
import { Recipe } from "./RecipeCard";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

  // Generate consistent random values based on recipe ID
  const generateConsistentValue = (id: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    const normalized = Math.abs(hash % 1000) / 1000;
    return min + normalized * (max - min);
  };

  const rating = (recipe as any).rating ?? parseFloat(generateConsistentValue(recipe.idMeal, 3.5, 5.0).toFixed(1));
  const healthScore = (recipe as any).healthScore ?? Math.round(generateConsistentValue(recipe.idMeal + recipe.strMeal, 45, 98));

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
              <span className="font-semibold">{rating}</span>
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
              <span>Health {healthScore}%</span>
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="recipe">Recipe</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
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

            <TabsContent value="reviews">
              <RecipeReview 
                recipeId={recipe.idMeal} 
                recipeType={((recipe as any).isUserRecipe || (recipe as any).ingredients) ? "user" : "api"} 
              />
            </TabsContent>

            <TabsContent value="reels" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Watch cooking videos and tutorials for this recipe
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  // Comprehensive map of recipe names to YouTube Shorts IDs
                  const recipeShorts: Record<string, string[]> = {
                    // Original shorts
                    "carbonara": ["zMUNG9KXmrE"],
                    "buddha bowl": ["Oqf3wxJHhUo"],
                    "scrambled eggs": ["oICDPEXS168"],
                    "chocolate cookies": ["NOjLrN_QktM"],
                    "grilled salmon": ["scfDraXaqb8"],
                    
                    // Chicken dishes
                    "chicken enchilada": ["jz930GvzH5k", "lx0DsMOhhXY", "FMCox4lj_kE", "UhOm0v-zHYU"],
                    "teriyaki chicken": ["Ml-EhD9AbMk", "suw5gn7kFuI", "JMbEiWeMRZE"],
                    "mediterranean pasta salad": ["NaSOIw8qm28", "wW6k6STuv5Q", "xCby4BMmCT4", "lJjdaMnVv2M"],
                    "potato gratin": ["4-lBvQ0yOyU", "o8x3X0LgQCs", "0uLrA8qyA-g", "hxpXjVktaac"],
                    "chicken handi": ["T4jg8Q-0pb4", "E_QHjm-hdEw", "TaqYPsVz8ZQ", "8Zt6UlGLBBs"],
                    "chicken alfredo": ["W2X1zPPiqVA", "_gs7c819uG0", "EU3MpMxvH7Y", "tYgl-tjkzi4"],
                    "tandoori chicken": ["T-G4I_G4EQ0", "MN9BKYDtbr8", "LyPUBn0W4YQ", "JTWlmNJyvkQ"],
                    "kentucky fried chicken": ["U9UgM0O3u6M", "-sF6Sjpbxf8", "OY-0r0r4NWE", "UIcC4qLGFgM"],
                    "kfc": ["U9UgM0O3u6M", "-sF6Sjpbxf8", "OY-0r0r4NWE"],
                    "chicken fajita": ["Bi1Pwt5Zv4I", "bBSn3TW3Vuo", "7alkmKeFc1I", "-lp1ulynHpE"],
                    "katsu chicken": ["uabDOBfKCuQ", "dslQVahrw3E", "YiHoErYeaVg", "w7rd3FuXfF4"],
                    "chicken baked tacos": ["WG6z97uN7EM", "3mEhV8dEsxE", "qPS73dZ38Ms", "Lk69BVpbeQI"],
                    "chicken karaage": ["Ix9nSVvfc8U", "o0hY7_6rIgU", "rtCMw8Xwgsc", "iGdOzXTsrdo"],
                    "chicken mushroom hotpot": ["bXKWu4GojNI", "KPC0YQP4eAA", "l5eKI5jfclw", "QUjn63kzbeg"],
                    "chicken couscous": ["T_yA4dv643o", "8ZWfbfoMeSU"],
                    "chicken ham leek pie": ["8oLl3fB7rL0", "rYOJ-vJiLk4", "TmPGIZaktiI", "JaYwK3aPFoY"],
                    "chicken marengo": ["Whtd9IRUrnI", "O-hTFeAoZH4", "h7GyFjr2GGQ"],
                    "chicken basquaise": ["Xw5VadqcWIQ", "1VQMTSZ2Lgw", "kq3AD7NYwgg", "1iox_nZpsZY"],
                    "jerk chicken": ["v43rlmEbrxE", "WWdyxlVzlko", "n-wxTdmeWVs", "7GpkzfSYrtw"],
                    "brown stew chicken": ["SDd2SIwQEY8", "QvT91vrXtAk", "N0OLy6ykqH8", "VjfSi1TC_uI"],
                    "kung pao chicken": ["eHn-ChsjlUc", "xXFOu3CJ0RY", "Bp7QiUsr1Io", "8o07koYoZ2U"],
                    "general tso": ["MzEELyVOlvk", "rCt1QU6dGJI", "tvQZWl3My-U", "OKXVHeV3850"],
                    "chicken congee": ["c5h4ByKjIgE", "wchrChGcV0M", "N4YNQrAqf4c", "GEHZW9wSLSQ"],
                    "chicken quinoa": ["9qSsOpH9hn8", "eulPj8HpaG8"],
                    "rosol": ["DXbKBtPWN1k", "Gcx8ZuQ-wvs", "aC3qpKYopG8", "lRcBtAxA0qw"],
                    "piri piri chicken": ["MNsbToXDAnU", "NMjRt2qUhxQ", "yDQtNsODNOg", "zYjFB6T3a7s"],
                    
                    // Beef dishes
                    "beef wellington": ["4Ay5a8uJP3s", "osLX2KqRbbs", "-a2eaIK0Tn8", "vqkKX6RU2og"],
                    "beef sunday roast": ["MjXXs44I2oE", "Y6LFXzYKo6c", "j_qCkYT5VHw", "SwKoRsUxurQ"],
                    "braised beef chilli": ["07JsVxTZqZI", "_ZCNIb2I9tk", "FJxXnAWHiqU"],
                    "massaman beef": ["kVVup8oDSHQ", "UcAX-Ep6sLM", "j0tjWt9thcI", "j17op4Fds88"],
                    "beef stroganoff": ["0zx4Azmtf_U", "NF3cOo6DdVU", "npauZJFykEs", "uUzd8zqPAec"],
                    "beef dumpling": ["AOLE6lRVFrs", "HNb71wZsQx0", "LCrVDikV0_c", "stMD7Z3Q1QU"],
                    "beef mustard pie": ["LrQVdnCYKRg", "R3huvvMuSzE", "JMPD9UmjeVs", "FjGV8BBSYp4"],
                    "minced beef pie": ["Bc9yPMicc1g", "_a5jV7-XFrw", "SKVjt3LjFW4", "0ds9iedQHTc"],
                    "beef oyster pie": ["0C9SMRVKVR4"],
                    "beef bourguignon": ["C4HPRQVQMNs", "7Tu00snhYGQ", "Ov0agc_oJBQ", "H0j1Yl5iqts"],
                    "jamaican beef patties": ["S9AT7eVbdnw", "A5YQjk-Zyls", "GBDK57b9Srk", "oZB0EhuXM3U"],
                    "szechuan beef": ["1QWIZ-cjm0E", "z4-x9So5GtY", "oHI81YxbCwI", "uPqpb7K_5aw"],
                    "beef lo mein": ["9K3p9pkOwLE", "ebhP6me7PGQ", "GsnMyoFVgd8", "9qnBmzvAMRk"],
                    "beef rendang": ["K4v2Rg2ZTUY", "pb4JKIISdDQ", "Cq6o7kjb8F4", "jKQgeqSH3FA"],
                    "beef mechado": ["Dnib_BKCI2U", "iv2G1SFGK7I", "LV8ZLfE1XCg", "u2UaIY-rMpU"],
                    "beef caldereta": ["NMPEmMGrmg4", "vPd4lWerlI4", "HRBZaVUavmU", "NcTboMIjitk"],
                    "beef asado": ["djPOlvUYgVI", "FTR13GlEwbI", "R9Br6utNJyI", "muG4z9JgxOc"],
                    "beef banh mi": ["SaBrqH9JWKY", "zbDQtRQWN8g", "wTQ6m7GJZEY"],
                    "corned beef cabbage": ["VBNtkX_xJTI", "wPKTuTfQlms", "VjUG1nydSRc", "St6-eInpAOw"],
                    "corned beef hash": ["chXSyqfbYXw", "DnxI0XU-JsM", "g0kElrBHFDU", "zAPzMt9-5hE"],
                    
                    // Fish & Seafood
                    "fish pie": ["M3bf94uAYuk", "WLy_L0FexpY", "qRhk60NUPjo", "btmFYROH9nU"],
                    "three fish pie": ["fB4K76vWT94", "Ckl7cKdtNO8"],
                    "cajun fish tacos": ["_B2Kiw2FHLw", "O6b3Ox9iw4Y", "cUIJaMs2860"],
                    "saltfish ackee": ["UPsSUuMlO8I", "Z_bIw7Padyk", "rn-I4fxSLdA", "_iVburo23eg"],
                    "escovitch fish": ["fwUVFWiahMA", "KVBgdk4zZwg", "w24vJK8uK24", "lFo5eAD7fo0"],
                    "salmon avocado": ["3M1ObwGd9js", "Jp_4M-e5NWQ", "vdPo8HcfXIY", "BFB1EqVvXos"],
                    "portuguese fish stew": ["T9xLmaha0Qs", "MMwrSV6svgU", "OXaRGMd6hjY"],
                    "fish soup": ["aSGpSuOURsc"],
                    "recheado masala fish": ["nhu4Ck21EXw", "d0_CxOKQjqA"],
                    
                    // Other dishes
                    "ma po tofu": ["JF_Whk6sgTE", "ogMVh4_LkYQ", "OLXutUOo17g", "j_jQUz6aOkg"],
                    "potato salad": ["xKi3vG8U51I", "zRzN63rv3ao", "Tjf2LlXwF0U", "8xQ42dRO05U"],
                    "north african potato": ["7oxlkK1LbAE", "wbzHQhCHyb0", "OGUiyR8TNNM", "SOT_lYpwkKE"],
                  };
                  
                  const recipeName = recipe.strMeal.toLowerCase();
                  let shortIds: string[] = [];
                  
                  // Find matching shorts based on recipe name
                  for (const [key, ids] of Object.entries(recipeShorts)) {
                    if (recipeName.includes(key)) {
                      shortIds = ids;
                      break;
                    }
                  }
                  
                  // If no specific match, show default
                  if (shortIds.length === 0) {
                    shortIds = ["zMUNG9KXmrE"];
                  }
                  
                  return shortIds.slice(0, 4).map((id, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${id}?autoplay=0&controls=1&rel=0&modestbranding=1&playsinline=1`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-semibold">👨‍🍳</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Creator</p>
                          <p className="text-xs text-muted-foreground">Recipe tutorial #{i + 1}</p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
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
