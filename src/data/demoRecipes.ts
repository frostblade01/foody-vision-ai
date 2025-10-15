// Demo recipe data for Foodyfy
// Used as fallback when database is empty or for testing

export interface DemoRecipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  cuisine: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost_per_serving: number;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions: string;
  tags: string[];
  sustainability_score: number;
  like_count: number;
  view_count: number;
  rating: number;
}

export const demoRecipes: DemoRecipe[] = [
  {
    id: "demo-1",
    title: "Vegan Buddha Bowl",
    description: "A colorful and nutritious bowl packed with quinoa, roasted vegetables, and tahini dressing",
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
    category: "Vegetarian",
    cuisine: "International",
    prep_time: 15,
    cook_time: 25,
    servings: 2,
    calories: 350,
    protein: 12,
    carbs: 45,
    fat: 15,
    cost_per_serving: 8.50,
    ingredients: [
      { name: "Quinoa", amount: "1", unit: "cup" },
      { name: "Sweet Potato", amount: "1", unit: "medium" },
      { name: "Chickpeas", amount: "1", unit: "can" },
      { name: "Kale", amount: "2", unit: "cups" },
      { name: "Avocado", amount: "1", unit: "medium" },
      { name: "Tahini", amount: "2", unit: "tbsp" },
      { name: "Lemon", amount: "1", unit: "medium" }
    ],
    instructions: "1. Cook quinoa according to package instructions\n2. Roast sweet potato cubes at 400°F for 20 minutes\n3. Massage kale with lemon juice\n4. Mix tahini with water and lemon for dressing\n5. Assemble bowl with all ingredients\n6. Drizzle with tahini dressing",
    tags: ["vegan", "healthy", "gluten-free", "high-protein"],
    sustainability_score: 85,
    like_count: 24,
    view_count: 156,
    rating: 4.8
  },
  {
    id: "demo-2",
    title: "Perfect Scrambled Eggs",
    description: "Creamy, restaurant-quality scrambled eggs with the perfect texture",
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600",
    category: "Breakfast",
    cuisine: "American",
    prep_time: 5,
    cook_time: 10,
    servings: 2,
    calories: 180,
    protein: 14,
    carbs: 2,
    fat: 12,
    cost_per_serving: 4.00,
    ingredients: [
      { name: "Eggs", amount: "4", unit: "large" },
      { name: "Butter", amount: "2", unit: "tbsp" },
      { name: "Heavy Cream", amount: "2", unit: "tbsp" },
      { name: "Salt", amount: "1/4", unit: "tsp" },
      { name: "Black Pepper", amount: "1/8", unit: "tsp" },
      { name: "Chives", amount: "1", unit: "tbsp" }
    ],
    instructions: "1. Whisk eggs with cream, salt, and pepper\n2. Heat butter in non-stick pan over low heat\n3. Add eggs and stir constantly with rubber spatula\n4. Remove from heat when still slightly wet\n5. Garnish with chives and serve immediately",
    tags: ["breakfast", "quick", "protein-rich", "keto-friendly"],
    sustainability_score: 70,
    like_count: 18,
    view_count: 89,
    rating: 4.6
  },
  {
    id: "demo-3",
    title: "Chocolate Chip Cookies",
    description: "Soft and chewy chocolate chip cookies that stay fresh for days",
    image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600",
    category: "Dessert",
    cuisine: "American",
    prep_time: 15,
    cook_time: 12,
    servings: 24,
    calories: 95,
    protein: 1,
    carbs: 12,
    fat: 4,
    cost_per_serving: 3.25,
    ingredients: [
      { name: "All-Purpose Flour", amount: "2 1/4", unit: "cups" },
      { name: "Baking Soda", amount: "1", unit: "tsp" },
      { name: "Salt", amount: "1", unit: "tsp" },
      { name: "Butter", amount: "1", unit: "cup" },
      { name: "Brown Sugar", amount: "3/4", unit: "cup" },
      { name: "White Sugar", amount: "1/4", unit: "cup" },
      { name: "Vanilla Extract", amount: "1", unit: "tsp" },
      { name: "Eggs", amount: "2", unit: "large" },
      { name: "Chocolate Chips", amount: "2", unit: "cups" }
    ],
    instructions: "1. Preheat oven to 375°F\n2. Mix flour, baking soda, and salt in bowl\n3. Cream butter and sugars until fluffy\n4. Beat in vanilla and eggs\n5. Gradually mix in flour mixture\n6. Fold in chocolate chips\n7. Drop rounded tablespoons onto baking sheet\n8. Bake 9-11 minutes until golden",
    tags: ["dessert", "baking", "chocolate", "family-favorite"],
    sustainability_score: 60,
    like_count: 42,
    view_count: 203,
    rating: 4.9
  },
  {
    id: "demo-4",
    title: "Grilled Salmon with Herbs",
    description: "Perfectly grilled salmon with fresh herbs and lemon butter sauce",
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
    category: "Seafood",
    cuisine: "Mediterranean",
    prep_time: 10,
    cook_time: 15,
    servings: 4,
    calories: 280,
    protein: 35,
    carbs: 2,
    fat: 15,
    cost_per_serving: 12.00,
    ingredients: [
      { name: "Salmon Fillet", amount: "1.5", unit: "lbs" },
      { name: "Olive Oil", amount: "2", unit: "tbsp" },
      { name: "Lemon", amount: "1", unit: "medium" },
      { name: "Dill", amount: "2", unit: "tbsp" },
      { name: "Parsley", amount: "2", unit: "tbsp" },
      { name: "Garlic", amount: "2", unit: "cloves" },
      { name: "Butter", amount: "3", unit: "tbsp" },
      { name: "Salt", amount: "1", unit: "tsp" },
      { name: "Black Pepper", amount: "1/2", unit: "tsp" }
    ],
    instructions: "1. Preheat grill to medium-high heat\n2. Pat salmon dry and season with salt and pepper\n3. Mix olive oil, garlic, and herbs\n4. Brush herb mixture on salmon\n5. Grill skin-side down for 6-7 minutes\n6. Flip and grill 4-5 minutes more\n7. Make lemon butter sauce\n8. Serve with sauce and lemon wedges",
    tags: ["seafood", "grilled", "healthy", "omega-3", "gluten-free"],
    sustainability_score: 90,
    like_count: 31,
    view_count: 127,
    rating: 4.7
  },
  {
    id: "demo-5",
    title: "Mediterranean Quinoa Salad",
    description: "Fresh and vibrant salad with quinoa, vegetables, and Mediterranean flavors",
    image_url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
    category: "Salad",
    cuisine: "Mediterranean",
    prep_time: 20,
    cook_time: 15,
    servings: 4,
    calories: 320,
    protein: 10,
    carbs: 38,
    fat: 16,
    cost_per_serving: 6.75,
    ingredients: [
      { name: "Quinoa", amount: "1", unit: "cup" },
      { name: "Cherry Tomatoes", amount: "1", unit: "cup" },
      { name: "Cucumber", amount: "1", unit: "medium" },
      { name: "Red Onion", amount: "1/4", unit: "cup" },
      { name: "Kalamata Olives", amount: "1/2", unit: "cup" },
      { name: "Feta Cheese", amount: "4", unit: "oz" },
      { name: "Olive Oil", amount: "3", unit: "tbsp" },
      { name: "Lemon Juice", amount: "2", unit: "tbsp" },
      { name: "Oregano", amount: "1", unit: "tsp" }
    ],
    instructions: "1. Cook quinoa according to package instructions and let cool\n2. Dice cucumber and halve cherry tomatoes\n3. Thinly slice red onion\n4. Mix olive oil, lemon juice, and oregano for dressing\n5. Combine all ingredients in large bowl\n6. Toss with dressing and season with salt and pepper\n7. Crumble feta cheese on top\n8. Serve chilled or at room temperature",
    tags: ["vegetarian", "healthy", "gluten-free", "meal-prep"],
    sustainability_score: 80,
    like_count: 19,
    view_count: 98,
    rating: 4.5
  },
  {
    id: "demo-6",
    title: "Thai Green Curry",
    description: "Aromatic and spicy Thai green curry with coconut milk and fresh vegetables",
    image_url: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600",
    category: "Main Course",
    cuisine: "Thai",
    prep_time: 20,
    cook_time: 25,
    servings: 4,
    calories: 420,
    protein: 18,
    carbs: 28,
    fat: 28,
    cost_per_serving: 9.50,
    ingredients: [
      { name: "Green Curry Paste", amount: "3", unit: "tbsp" },
      { name: "Coconut Milk", amount: "1", unit: "can" },
      { name: "Chicken Breast", amount: "1", unit: "lb" },
      { name: "Bell Peppers", amount: "2", unit: "medium" },
      { name: "Bamboo Shoots", amount: "1", unit: "can" },
      { name: "Thai Basil", amount: "1/2", unit: "cup" },
      { name: "Fish Sauce", amount: "2", unit: "tbsp" },
      { name: "Brown Sugar", amount: "1", unit: "tbsp" },
      { name: "Jasmine Rice", amount: "2", unit: "cups" }
    ],
    instructions: "1. Cook jasmine rice according to package instructions\n2. Cut chicken into bite-sized pieces\n3. Slice bell peppers into strips\n4. Heat half the coconut milk in a large pot\n5. Add curry paste and cook until fragrant\n6. Add chicken and cook until almost done\n7. Add remaining coconut milk, vegetables, and seasonings\n8. Simmer 10-15 minutes until chicken is cooked\n9. Stir in Thai basil and serve over rice",
    tags: ["spicy", "thai", "coconut", "gluten-free"],
    sustainability_score: 75,
    like_count: 28,
    view_count: 145,
    rating: 4.6
  },
  {
    id: "demo-7",
    title: "Classic Margherita Pizza",
    description: "Traditional Italian pizza with fresh mozzarella, tomatoes, and basil",
    image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
    category: "Main Course",
    cuisine: "Italian",
    prep_time: 30,
    cook_time: 15,
    servings: 4,
    calories: 380,
    protein: 16,
    carbs: 45,
    fat: 16,
    cost_per_serving: 7.25,
    ingredients: [
      { name: "Pizza Dough", amount: "1", unit: "lb" },
      { name: "San Marzano Tomatoes", amount: "1", unit: "can" },
      { name: "Fresh Mozzarella", amount: "8", unit: "oz" },
      { name: "Fresh Basil", amount: "1/2", unit: "cup" },
      { name: "Olive Oil", amount: "2", unit: "tbsp" },
      { name: "Garlic", amount: "2", unit: "cloves" },
      { name: "Salt", amount: "1", unit: "tsp" },
      { name: "Black Pepper", amount: "1/2", unit: "tsp" }
    ],
    instructions: "1. Preheat oven to 500°F with pizza stone\n2. Stretch dough into 12-inch circle\n3. Crush tomatoes with garlic, salt, and pepper\n4. Spread tomato sauce on dough\n5. Tear mozzarella into pieces and distribute\n6. Drizzle with olive oil\n7. Bake 12-15 minutes until crust is golden\n8. Remove from oven and top with fresh basil\n9. Slice and serve immediately",
    tags: ["italian", "vegetarian", "classic", "comfort-food"],
    sustainability_score: 65,
    like_count: 35,
    view_count: 189,
    rating: 4.8
  },
  {
    id: "demo-8",
    title: "Beef Stir Fry",
    description: "Quick and flavorful beef stir fry with vegetables and savory sauce",
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
    category: "Main Course",
    cuisine: "Asian",
    prep_time: 15,
    cook_time: 10,
    servings: 3,
    calories: 350,
    protein: 28,
    carbs: 18,
    fat: 20,
    cost_per_serving: 11.00,
    ingredients: [
      { name: "Beef Sirloin", amount: "1", unit: "lb" },
      { name: "Broccoli", amount: "2", unit: "cups" },
      { name: "Bell Peppers", amount: "2", unit: "medium" },
      { name: "Carrots", amount: "2", unit: "medium" },
      { name: "Garlic", amount: "3", unit: "cloves" },
      { name: "Ginger", amount: "1", unit: "tbsp" },
      { name: "Soy Sauce", amount: "3", unit: "tbsp" },
      { name: "Sesame Oil", amount: "1", unit: "tbsp" },
      { name: "Cornstarch", amount: "1", unit: "tbsp" }
    ],
    instructions: "1. Slice beef into thin strips\n2. Cut vegetables into bite-sized pieces\n3. Mix soy sauce, sesame oil, and cornstarch for sauce\n4. Heat oil in wok or large pan over high heat\n5. Stir-fry beef until browned, remove and set aside\n6. Add vegetables and stir-fry 3-4 minutes\n7. Return beef to pan with sauce\n8. Toss everything together and cook 1-2 minutes\n9. Serve over rice or noodles",
    tags: ["quick", "asian", "high-protein", "gluten-free-option"],
    sustainability_score: 70,
    like_count: 22,
    view_count: 112,
    rating: 4.4
  }
];

export const getTrendingRecipes = (): DemoRecipe[] => {
  return demoRecipes
    .sort((a, b) => (b.like_count + b.view_count) - (a.like_count + a.view_count))
    .slice(0, 5);
};

export const getRecipeById = (id: string): DemoRecipe | undefined => {
  return demoRecipes.find(recipe => recipe.id === id);
};

export const getRecipesByCategory = (category: string): DemoRecipe[] => {
  return demoRecipes.filter(recipe => 
    recipe.category.toLowerCase() === category.toLowerCase()
  );
};

export const getRecipesByCuisine = (cuisine: string): DemoRecipe[] => {
  return demoRecipes.filter(recipe => 
    recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
  );
};


