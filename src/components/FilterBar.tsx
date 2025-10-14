import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  onSearch: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  onAreaChange?: (area: string) => void;
}

const FilterBar = ({ onSearch, onCategoryChange, onAreaChange }: FilterBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery);
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
        <Button
          variant="glass"
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
          <Select onValueChange={onCategoryChange}>
            <SelectTrigger className="bg-card/50 backdrop-blur-md border-border/50">
              <SelectValue placeholder="Category" />
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

          <Select onValueChange={onAreaChange}>
            <SelectTrigger className="bg-card/50 backdrop-blur-md border-border/50">
              <SelectValue placeholder="Cuisine" />
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

          <Select>
            <SelectTrigger className="bg-card/50 backdrop-blur-md border-border/50">
              <SelectValue placeholder="Dietary" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dietary</SelectItem>
              <SelectItem value="gluten-free">Gluten Free</SelectItem>
              <SelectItem value="dairy-free">Dairy Free</SelectItem>
              <SelectItem value="nut-free">Nut Free</SelectItem>
              <SelectItem value="low-carb">Low Carb</SelectItem>
              <SelectItem value="high-protein">High Protein</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
