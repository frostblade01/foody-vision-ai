import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Image, Lightbulb, Calendar, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AIKitchen = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [ingredients, setIngredients] = useState("");
  const { toast } = useToast();

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
      setResult(data);
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

            <Card className="cursor-pointer hover:scale-105 transition-transform">
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
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIKitchen;
