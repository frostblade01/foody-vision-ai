import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface FilterOptions {
  query: string;
  category?: string;
  area?: string;
  maxCalories?: number;
  minProtein?: number;
  maxCarbs?: number;
  maxFat?: number;
  maxPrice?: number;
  dietary?: string;
}

interface AdvancedFilterBarProps {
  onFilter: (filters: FilterOptions) => void;
}

const AdvancedFilterBar = ({ onFilter }: AdvancedFilterBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>();
  const [area, setArea] = useState<string>();
  const [maxCalories, setMaxCalories] = useState<number>(1000);
  const [minProtein, setMinProtein] = useState<number>(0);
  const [maxCarbs, setMaxCarbs] = useState<number>(100);
  const [maxFat, setMaxFat] = useState<number>(50);
  const [maxPrice, setMaxPrice] = useState<number>(20);
  const [dietary, setDietary] = useState<string>();

  const handleSearch = () => {
    onFilter({
      query: searchQuery,
      category,
      area,
      maxCalories,
      minProtein,
      maxCarbs,
      maxFat,
      maxPrice,
      dietary,
    });
  };

  const handleReset = () => {
    setSearchQuery("");
    setCategory(undefined);
    setArea(undefined);
    setMaxCalories(1000);
    setMinProtein(0);
    setMaxCarbs(100);
    setMaxFat(50);
    setMaxPrice(20);
    setDietary(undefined);
    onFilter({ query: "" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search recipes, ingredients, or cuisine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 bg-card/50 backdrop-blur-md border-border/50 focus:border-primary/50"
          />
        </div>
        <Button onClick={handleSearch} variant="hero" size="lg">
          Search
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="glass" size="lg">
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>
                Fine-tune your recipe search with detailed filters
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Beef">Beef</SelectItem>
                    <SelectItem value="Chicken">Chicken</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                    <SelectItem value="Lamb">Lamb</SelectItem>
                    <SelectItem value="Pasta">Pasta</SelectItem>
                    <SelectItem value="Pork">Pork</SelectItem>
                    <SelectItem value="Seafood">Seafood</SelectItem>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cuisine</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cuisines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cuisines</SelectItem>
                    <SelectItem value="American">American</SelectItem>
                    <SelectItem value="British">British</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Mexican">Mexican</SelectItem>
                    <SelectItem value="Thai">Thai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dietary Preferences</Label>
                <Select value={dietary} onValueChange={setDietary}>
                  <SelectTrigger>
                    <SelectValue placeholder="No restrictions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">No restrictions</SelectItem>
                    <SelectItem value="gluten-free">Gluten Free</SelectItem>
                    <SelectItem value="dairy-free">Dairy Free</SelectItem>
                    <SelectItem value="nut-free">Nut Free</SelectItem>
                    <SelectItem value="low-carb">Low Carb</SelectItem>
                    <SelectItem value="high-protein">High Protein</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Max Calories</Label>
                  <span className="text-sm text-muted-foreground">{maxCalories} cal</span>
                </div>
                <Slider
                  value={[maxCalories]}
                  onValueChange={([value]) => setMaxCalories(value)}
                  min={100}
                  max={1500}
                  step={50}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Min Protein</Label>
                  <span className="text-sm text-muted-foreground">{minProtein}g</span>
                </div>
                <Slider
                  value={[minProtein]}
                  onValueChange={([value]) => setMinProtein(value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Max Carbs</Label>
                  <span className="text-sm text-muted-foreground">{maxCarbs}g</span>
                </div>
                <Slider
                  value={[maxCarbs]}
                  onValueChange={([value]) => setMaxCarbs(value)}
                  min={10}
                  max={200}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Max Fat</Label>
                  <span className="text-sm text-muted-foreground">{maxFat}g</span>
                </div>
                <Slider
                  value={[maxFat]}
                  onValueChange={([value]) => setMaxFat(value)}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Max Price per Serving</Label>
                  <span className="text-sm text-muted-foreground">${maxPrice}</span>
                </div>
                <Slider
                  value={[maxPrice]}
                  onValueChange={([value]) => setMaxPrice(value)}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSearch} variant="hero" className="flex-1">
                  Apply Filters
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default AdvancedFilterBar;
