import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Image, Lightbulb, Calendar, Loader2, Upload, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { geminiService, DetectedIngredient } from "@/services/geminiService";

const AIKitchen = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [ingredients, setIngredients] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const { toast } = useToast();

  const stripCodeFences = (text: string): string => {
    // remove ```json ... ``` or ``` ... ``` wrappers
    return text.replace(/^```[a-zA-Z]*\n?/,'').replace(/\n?```$/,'');
  };

  const tryParseJson = (text: string): any | null => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const handleAISuggestion = async (type: string) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type,
            userData: {
              dietType: "balanced",
              calorieGoal: 2000,
              allergies: [],
            },
            ingredients: ingredients.split(",").map(i => i.trim()).filter(Boolean),
          }),
        }
      );

      const data = await response.json();
      // Normalize: if AI returned markdown fenced JSON inside text, extract & parse
      if (typeof data === 'string') {
        const cleaned = stripCodeFences(data);
        const parsed = tryParseJson(cleaned);
        setResult(parsed || cleaned);
      } else if (data && typeof data.text === 'string') {
        const cleaned = stripCodeFences(data.text);
        const parsed = tryParseJson(cleaned);
        setResult(parsed || cleaned);
      } else {
        setResult(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const detectIngredients = async () => {
    if (!imageFile) return;

    setImageLoading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix

        const detected = await geminiService.detectIngredientsFromImage(base64Data);
        setDetectedIngredients(detected);
        
        toast({
          title: "Ingredients detected!",
          description: `Found ${detected.length} ingredients in your image`,
        });
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      toast({
        title: "Error analyzing image",
        description: "Please try again with a clearer image",
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <Sparkles className="w-10 h-10 text-primary" />
              AI Kitchen Assistant
            </h1>
            <p className="text-muted-foreground text-lg">
              Get personalized meal suggestions, ingredient substitutes, and recipe ideas powered by AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handleAISuggestion("meal-plan")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Meal Plan
                </CardTitle>
                <CardDescription>
                  Get a personalized 3-day meal plan based on your dietary goals
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handleAISuggestion("substitutes")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Smart Swaps
                </CardTitle>
                <CardDescription>
                  Discover healthier ingredient alternatives for your recipes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:scale-105 transition-transform" onClick={() => document.getElementById('image-upload')?.click()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />
                  Photo Scan
                </CardTitle>
                <CardDescription>
                  Upload a photo to detect ingredients automatically
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Ingredient Photo
              </CardTitle>
              <CardDescription>
                Take a photo of your ingredients and let AI identify them automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose Image
                </Button>
                {imageFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      setDetectedIngredients([]);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {imagePreview && (
                <div className="space-y-4">
                  <div className="w-full max-w-md mx-auto">
                    <img
                      src={imagePreview}
                      alt="Uploaded ingredients"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  
                  <Button
                    onClick={detectIngredients}
                    variant="hero"
                    className="w-full"
                    disabled={imageLoading}
                  >
                    {imageLoading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Analyzing Image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 w-4 h-4" />
                        Detect Ingredients
                      </>
                    )}
                  </Button>
                  
                  {detectedIngredients.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Detected Ingredients:</h4>
                      <div className="flex flex-wrap gap-2">
                        {detectedIngredients.map((ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm"
                          >
                            <span>{ingredient.name}</span>
                            {ingredient.quantity && (
                              <span className="text-muted-foreground">({ingredient.quantity})</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {Math.round(ingredient.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => {
                          const ingredientNames = detectedIngredients.map(ing => ing.name);
                          setIngredients(ingredientNames.join(", "));
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Use These Ingredients
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recipe Ideas from Your Ingredients</CardTitle>
              <CardDescription>
                List your available ingredients and get recipe suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter ingredients separated by commas (e.g., chicken, rice, tomatoes, garlic)"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                rows={4}
              />
              <Button
                onClick={() => handleAISuggestion("from-ingredients")}
                variant="hero"
                className="w-full"
                disabled={!ingredients.trim() || loading}
              >
                {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Get Recipe Ideas
              </Button>
            </CardContent>
          </Card>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          )}

          {result && !loading && (
            <Card>
              <CardHeader>
                <CardTitle>AI Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {typeof result === 'string' ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm">{result}</div>
                  </div>
                ) : result.recipes ? (
                  <div className="space-y-3">
                    {result.recipes.map((recipe: any, i: number) => (
                      <div key={i} className="p-4 rounded-lg border bg-card/50">
                        <h4 className="font-semibold mb-2">{recipe.name}</h4>
                        {recipe.mainIngredients && (
                          <div className="mt-1 text-xs text-muted-foreground">Main: {recipe.mainIngredients.join(', ')}</div>
                        )}
                        {recipe.missingIngredients && (
                          <div className="mt-1 text-xs text-muted-foreground">Missing: {recipe.missingIngredients.join(', ')}</div>
                        )}
                        {recipe.difficulty && (
                          <div className="mt-1 text-xs text-muted-foreground capitalize">Difficulty: {recipe.difficulty}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : result.suggestions ? (
                  <div className="space-y-3">
                    {result.suggestions.map((suggestion: any, i: number) => (
                      <div key={i} className="p-4 rounded-lg border bg-card/50">
                        <h4 className="font-semibold mb-2">{suggestion.title || suggestion.name || `Suggestion ${i + 1}`}</h4>
                        {suggestion.description && <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>}
                        {suggestion.ingredients && (
                          <div className="mt-2">
                            <span className="text-xs font-medium">Ingredients: </span>
                            <span className="text-xs text-muted-foreground">{suggestion.ingredients.join(', ')}</span>
                          </div>
                        )}
                        {suggestion.benefits && <p className="text-xs text-muted-foreground mt-1">✓ {suggestion.benefits}</p>}
                      </div>
                    ))}
                  </div>
                ) : result.days ? (
                  <div className="space-y-4">
                    {result.days.map((day: any, i: number) => (
                      <div key={i} className="p-4 rounded-lg border bg-card/50">
                        <h4 className="font-semibold mb-3">Day {day.day}</h4>
                        <div className="space-y-2">
                          {day.meals?.map((m: any, idx: number) => (
                            <div key={idx} className="pl-3 border-l-2 border-primary/30">
                              <span className="text-sm font-medium">{m.name}</span>
                              {m.calories && (
                                <span className="text-sm text-muted-foreground"> — {m.calories} cal</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : result.substitutes ? (
                  <div className="space-y-3">
                    {result.substitutes.map((s: any, i: number) => (
                      <div key={i} className="p-4 rounded-lg border bg-card/50">
                        <div className="text-sm"><span className="font-medium">{s.original}</span> → {s.substitute}</div>
                        {s.benefit && <div className="text-xs text-muted-foreground mt-1">{s.benefit}</div>}
                      </div>
                    ))}
                  </div>
                ) : result.meals ? (
                  <div className="space-y-4">
                    {Object.entries(result.meals).map(([day, meals]: [string, any], i) => (
                      <div key={i} className="p-4 rounded-lg border bg-card/50">
                        <h4 className="font-semibold mb-3 capitalize">{day}</h4>
                        <div className="space-y-2">
                          {Object.entries(meals).map(([meal, details]: [string, any]) => (
                            <div key={meal} className="pl-3 border-l-2 border-primary/30">
                              <span className="text-sm font-medium capitalize">{meal}: </span>
                              <span className="text-sm text-muted-foreground">{typeof details === 'string' ? details : details.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : result.recipes ? (
                  <div className="space-y-3">
                    {result.recipes.map((recipe: any, i: number) => (
                      <div key={i} className="p-4 rounded-lg border bg-card/50">
                        <h4 className="font-semibold mb-2">{recipe.name}</h4>
                        {recipe.description && <p className="text-sm text-muted-foreground mb-2">{recipe.description}</p>}
                        {recipe.ingredients && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Ingredients: </span>
                            <span className="text-muted-foreground">{recipe.ingredients.join(', ')}</span>
                          </div>
                        )}
                        {recipe.instructions && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Instructions: </span>
                            <span className="text-muted-foreground">{recipe.instructions}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Robust fallback renderer for unknown shapes */}
                    {Array.isArray(result) ? (
                      <ul className="list-disc pl-6 text-sm text-muted-foreground">
                        {result.map((item: any, i: number) => (
                          <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                        ))}
                      </ul>
                    ) : result.text ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-sm">{String(result.text)}</div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIKitchen;
