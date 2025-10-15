import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Upload, Sparkles, Loader2, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { geminiService, NutritionAnalysis, SustainabilityScore } from "@/services/geminiService";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

const CreateRecipe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    cuisine: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    costPerServing: "",
    tags: [] as string[],
    allergens: [] as string[],
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", unit: "" }
  ]);
  const [instructions, setInstructions] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [nutrition, setNutrition] = useState<NutritionAnalysis | null>(null);
  const [sustainability, setSustainability] = useState<SustainabilityScore | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    setIngredients(prev => [...prev, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    setIngredients(prev => prev.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateNutrition = async () => {
    const ingredientNames = ingredients
      .filter(ing => ing.name.trim())
      .map(ing => `${ing.amount} ${ing.unit} ${ing.name}`.trim());
    
    if (ingredientNames.length === 0) {
      toast({
        title: "Add ingredients first",
        description: "Please add at least one ingredient before calculating nutrition",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);
    try {
      const servings = parseInt(formData.servings) || 1;
      const nutritionData = await geminiService.analyzeNutrition(ingredientNames, servings);
      setNutrition(nutritionData);
      toast({
        title: "Nutrition calculated!",
        description: "AI has analyzed your recipe's nutritional content",
      });
    } catch (error) {
      toast({
        title: "Error calculating nutrition",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const calculateSustainability = async () => {
    const ingredientNames = ingredients
      .filter(ing => ing.name.trim())
      .map(ing => ing.name);
    
    if (ingredientNames.length === 0) {
      toast({
        title: "Add ingredients first",
        description: "Please add at least one ingredient before calculating sustainability",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);
    try {
      const sustainabilityData = await geminiService.calculateSustainabilityScore(ingredientNames);
      setSustainability(sustainabilityData);
      toast({
        title: "Sustainability score calculated!",
        description: "AI has analyzed your recipe's environmental impact",
      });
    } catch (error) {
      toast({
        title: "Error calculating sustainability",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to create recipes",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!formData.title.trim() || !instructions.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the title and instructions",
        variant: "destructive",
      });
      return;
    }

    const validIngredients = ingredients.filter(ing => ing.name.trim());
    if (validIngredients.length === 0) {
      toast({
        title: "Add ingredients",
        description: "Please add at least one ingredient",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";
      
      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName);
        
        imageUrl = data.publicUrl;
      }

      // Prepare recipe data
      const recipeData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        category: formData.category,
        cuisine: formData.cuisine,
        prep_time: parseInt(formData.prepTime) || null,
        cook_time: parseInt(formData.cookTime) || null,
        servings: parseInt(formData.servings) || null,
        calories: nutrition?.calories || null,
        protein: nutrition?.protein || null,
        carbs: nutrition?.carbs || null,
        fat: nutrition?.fat || null,
        cost_per_serving: parseFloat(formData.costPerServing) || null,
        ingredients: validIngredients,
        instructions: instructions,
        tags: formData.tags,
        sustainability_score: sustainability?.score || null,
        status: 'pending' // Requires approval
      };

      const { error } = await supabase
        .from('user_recipes')
        .insert(recipeData);

      if (error) throw error;

      toast({
        title: "Recipe submitted!",
        description: "Your recipe has been submitted for review and will appear once approved",
      });

      navigate("/");
    } catch (error: any) {
      console.error('Error creating recipe:', error);
      toast({
        title: "Error creating recipe",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <ChefHat className="w-10 h-10 text-primary" />
              Create New Recipe
            </h1>
            <p className="text-muted-foreground text-lg">
              Share your culinary creations with the Foodyfy community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Recipe Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., Grandma's Chocolate Chip Cookies"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Appetizer">Appetizer</SelectItem>
                        <SelectItem value="Breakfast">Breakfast</SelectItem>
                        <SelectItem value="Lunch">Lunch</SelectItem>
                        <SelectItem value="Dinner">Dinner</SelectItem>
                        <SelectItem value="Dessert">Dessert</SelectItem>
                        <SelectItem value="Snack">Snack</SelectItem>
                        <SelectItem value="Beverage">Beverage</SelectItem>
                        <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="Vegan">Vegan</SelectItem>
                        <SelectItem value="Seafood">Seafood</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your recipe, its origins, or what makes it special..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cuisine">Cuisine</Label>
                    <Select value={formData.cuisine} onValueChange={(value) => handleInputChange("cuisine", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cuisine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="American">American</SelectItem>
                        <SelectItem value="Italian">Italian</SelectItem>
                        <SelectItem value="Mexican">Mexican</SelectItem>
                        <SelectItem value="Asian">Asian</SelectItem>
                        <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="Indian">Indian</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Thai">Thai</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      value={formData.prepTime}
                      onChange={(e) => handleInputChange("prepTime", e.target.value)}
                      placeholder="15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                    <Input
                      id="cookTime"
                      type="number"
                      value={formData.cookTime}
                      onChange={(e) => handleInputChange("cookTime", e.target.value)}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      type="number"
                      value={formData.servings}
                      onChange={(e) => handleInputChange("servings", e.target.value)}
                      placeholder="4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPerServing">Cost per Serving ($)</Label>
                    <Input
                      id="costPerServing"
                      type="number"
                      step="0.01"
                      value={formData.costPerServing}
                      onChange={(e) => handleInputChange("costPerServing", e.target.value)}
                      placeholder="5.99"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Recipe Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="image" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <Upload className="w-4 h-4" />
                        Choose Image
                      </div>
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {imageFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="w-48 h-32 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Recipe preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Amount"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                    />
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIngredient}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions *</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Write step-by-step instructions for your recipe..."
                  rows={8}
                  required
                />
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={calculateNutrition}
                    disabled={aiLoading}
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Calculate Nutrition
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={calculateSustainability}
                    disabled={aiLoading}
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Calculate Sustainability
                  </Button>
                </div>

                {nutrition && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{nutrition.calories}</div>
                      <div className="text-sm text-muted-foreground">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{nutrition.protein}g</div>
                      <div className="text-sm text-muted-foreground">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{nutrition.carbs}g</div>
                      <div className="text-sm text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{nutrition.fat}g</div>
                      <div className="text-sm text-muted-foreground">Fat</div>
                    </div>
                  </div>
                )}

                {sustainability && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Sustainability Score</span>
                      <Badge variant="secondary">{sustainability.score}/100</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="mb-2">
                        <strong>Factors:</strong> {sustainability.factors.join(", ")}
                      </div>
                      <div>
                        <strong>Suggestions:</strong> {sustainability.suggestions.join(", ")}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="hero"
                disabled={loading}
                className="flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ChefHat className="w-4 h-4 mr-2" />}
                Submit Recipe
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipe;

