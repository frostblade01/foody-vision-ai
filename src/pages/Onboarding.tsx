import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Filter preferences
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [maxCalories, setMaxCalories] = useState<number>(1000);
  const [minProtein, setMinProtein] = useState<number>(0);
  const [maxCarbs, setMaxCarbs] = useState<number>(100);
  const [maxFat, setMaxFat] = useState<number>(50);
  const [maxPrice, setMaxPrice] = useState<number>(20);

  const categories = ["Beef", "Chicken", "Dessert", "Lamb", "Pasta", "Pork", "Seafood", "Vegetarian", "Vegan"];
  const cuisines = ["American", "British", "Chinese", "French", "Indian", "Italian", "Japanese", "Mexican", "Thai"];
  const dietaryOptions = ["Gluten Free", "Dairy Free", "Nut Free", "Low Carb", "High Protein", "Keto", "Paleo"];

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Welcome!",
      description: "You can set your preferences later in settings",
    });
    navigate("/");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Save preferences to user metadata or a preferences table
      const preferences = {
        categories: selectedCategories,
        cuisines: selectedCuisines,
        dietary: selectedDietary,
        maxCalories,
        minProtein,
        maxCarbs,
        maxFat,
        maxPrice,
      };

      // Store in localStorage for now (can be moved to database)
      localStorage.setItem("userPreferences", JSON.stringify(preferences));

      // You can also update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { preferences }
      });

      if (error) throw error;

      toast({
        title: "Preferences saved!",
        description: "Your recipe feed will be personalized",
      });

      // Navigate to home with filters applied
      const queryParams = new URLSearchParams();
      if (selectedCategories.length > 0) queryParams.set("category", selectedCategories[0]);
      if (selectedCuisines.length > 0) queryParams.set("cuisine", selectedCuisines[0]);
      if (selectedDietary.length > 0) queryParams.set("dietary", selectedDietary[0]);
      
      navigate(`/?${queryParams.toString()}`);
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ChefHat className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Welcome to Foodyfy!</h1>
          </div>
          <p className="text-muted-foreground">Let's personalize your recipe experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set Your Preferences</CardTitle>
            <CardDescription>
              Select your favorite categories, cuisines, and dietary preferences. You can always change these later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Favorite Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleSelection(category, selectedCategories, setSelectedCategories)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Cuisines */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Favorite Cuisines</Label>
              <div className="flex flex-wrap gap-2">
                {cuisines.map((cuisine) => (
                  <Badge
                    key={cuisine}
                    variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleSelection(cuisine, selectedCuisines, setSelectedCuisines)}
                  >
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Dietary Preferences</Label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((dietary) => (
                  <Badge
                    key={dietary}
                    variant={selectedDietary.includes(dietary) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleSelection(dietary, selectedDietary, setSelectedDietary)}
                  >
                    {dietary}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Nutrition Sliders */}
            <div className="space-y-4 pt-4 border-t">
              <Label className="text-lg font-semibold">Nutrition Preferences</Label>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm">Max Calories</Label>
                  <span className="text-sm text-muted-foreground">{maxCalories} cal</span>
                </div>
                <Slider
                  value={[maxCalories]}
                  onValueChange={([value]) => setMaxCalories(value)}
                  min={100}
                  max={1500}
                  step={50}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm">Min Protein</Label>
                  <span className="text-sm text-muted-foreground">{minProtein}g</span>
                </div>
                <Slider
                  value={[minProtein]}
                  onValueChange={([value]) => setMinProtein(value)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm">Max Carbs</Label>
                  <span className="text-sm text-muted-foreground">{maxCarbs}g</span>
                </div>
                <Slider
                  value={[maxCarbs]}
                  onValueChange={([value]) => setMaxCarbs(value)}
                  min={10}
                  max={200}
                  step={10}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm">Max Fat</Label>
                  <span className="text-sm text-muted-foreground">{maxFat}g</span>
                </div>
                <Slider
                  value={[maxFat]}
                  onValueChange={([value]) => setMaxFat(value)}
                  min={5}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm">Max Price per Serving</Label>
                  <span className="text-sm text-muted-foreground">${maxPrice}</span>
                </div>
                <Slider
                  value={[maxPrice]}
                  onValueChange={([value]) => setMaxPrice(value)}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Skip for Now
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Save & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
