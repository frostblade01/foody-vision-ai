// Gemini AI Service for Foodyfy
// Handles nutrition analysis, ingredient recognition, and sustainability scoring

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface IngredientSubstitute {
  original: string;
  substitute: string;
  reason: string;
  healthBenefit?: string;
}

export interface SustainabilityScore {
  score: number; // 0-100
  factors: string[];
  suggestions: string[];
}

export interface DetectedIngredient {
  name: string;
  confidence: number;
  quantity?: string;
}

class GeminiService {
  private async makeRequest(endpoint: string, data: any) {
    const response = await fetch(`${GEMINI_BASE_URL}${endpoint}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Analyze nutrition from recipe ingredients
  async analyzeNutrition(ingredients: string[], servings: number = 1): Promise<NutritionAnalysis> {
    const prompt = `Analyze the nutritional content of this recipe for ${servings} serving(s). 
    Ingredients: ${ingredients.join(', ')}
    
    Return ONLY a JSON object with these exact fields:
    {
      "calories": number,
      "protein": number (in grams),
      "carbs": number (in grams),
      "fat": number (in grams),
      "fiber": number (in grams, optional),
      "sugar": number (in grams, optional),
      "sodium": number (in mg, optional)
    }
    
    Base your analysis on standard nutritional values for these ingredients.`;

    try {
      const response = await this.makeRequest('/models/gemini-pro:generateContent', {
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from Gemini');

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Nutrition analysis error:', error);
      // Return default values if API fails
      return {
        calories: 300,
        protein: 15,
        carbs: 30,
        fat: 12,
        fiber: 5,
        sugar: 8,
        sodium: 400
      };
    }
  }

  // Get ingredient substitutes for healthier options
  async getIngredientSubstitutes(ingredients: string[]): Promise<IngredientSubstitute[]> {
    const prompt = `Suggest healthier substitutes for these ingredients: ${ingredients.join(', ')}
    
    Return ONLY a JSON array of objects with these exact fields:
    [
      {
        "original": "ingredient name",
        "substitute": "healthier alternative",
        "reason": "why it's better",
        "healthBenefit": "specific health benefit (optional)"
      }
    ]
    
    Focus on reducing calories, sugar, sodium, or increasing protein/fiber.`;

    try {
      const response = await this.makeRequest('/models/gemini-pro:generateContent', {
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from Gemini');

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Substitute analysis error:', error);
      return [];
    }
  }

  // Calculate sustainability score
  async calculateSustainabilityScore(ingredients: string[]): Promise<SustainabilityScore> {
    const prompt = `Calculate a sustainability score (0-100) for this recipe based on these ingredients: ${ingredients.join(', ')}
    
    Consider:
    - Environmental impact of production
    - Transportation distance
    - Seasonality
    - Water usage
    - Carbon footprint
    - Packaging waste
    
    Return ONLY a JSON object with these exact fields:
    {
      "score": number (0-100),
      "factors": ["factor1", "factor2", "factor3"],
      "suggestions": ["suggestion1", "suggestion2"]
    }
    
    Higher scores = more sustainable.`;

    try {
      const response = await this.makeRequest('/models/gemini-pro:generateContent', {
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from Gemini');

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Sustainability analysis error:', error);
      return {
        score: 75,
        factors: ['Local ingredients', 'Minimal processing', 'Plant-based options'],
        suggestions: ['Use seasonal vegetables', 'Choose organic when possible', 'Reduce meat consumption']
      };
    }
  }

  // Detect ingredients from uploaded image
  async detectIngredientsFromImage(imageBase64: string): Promise<DetectedIngredient[]> {
    const prompt = `Identify all food ingredients visible in this image. 
    
    Return ONLY a JSON array of objects with these exact fields:
    [
      {
        "name": "ingredient name",
        "confidence": number (0-1),
        "quantity": "estimated amount (optional)"
      }
    ]
    
    Be specific about ingredients (e.g., "fresh basil" not just "herbs").`;

    try {
      const response = await this.makeRequest('/models/gemini-pro-vision:generateContent', {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64
              }
            }
          ]
        }]
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from Gemini');

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Image recognition error:', error);
      return [];
    }
  }

  // Generate recipe suggestions from ingredients
  async suggestRecipesFromIngredients(ingredients: string[], dietaryRestrictions: string[] = []): Promise<string[]> {
    const restrictions = dietaryRestrictions.length > 0 ? ` Dietary restrictions: ${dietaryRestrictions.join(', ')}.` : '';
    
    const prompt = `Suggest 3 creative recipes using these ingredients: ${ingredients.join(', ')}${restrictions}
    
    Return ONLY a JSON array of recipe names:
    ["Recipe 1 Name", "Recipe 2 Name", "Recipe 3 Name"]
    
    Make the recipes creative and practical.`;

    try {
      const response = await this.makeRequest('/models/gemini-pro:generateContent', {
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from Gemini');

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Recipe suggestion error:', error);
      return ['Quick Stir Fry', 'Healthy Salad Bowl', 'Simple Pasta Dish'];
    }
  }

  // Generate meal plan
  async generateMealPlan(dietType: string, calorieGoal: number, allergies: string[] = []): Promise<any> {
    const allergyInfo = allergies.length > 0 ? ` Avoid these allergens: ${allergies.join(', ')}.` : '';
    
    const prompt = `Create a 3-day meal plan for someone following a ${dietType} diet with a daily calorie goal of ${calorieGoal} calories.${allergyInfo}
    
    Return ONLY a JSON object with this structure:
    {
      "day1": {
        "breakfast": {"name": "meal name", "calories": number},
        "lunch": {"name": "meal name", "calories": number},
        "dinner": {"name": "meal name", "calories": number},
        "snack": {"name": "meal name", "calories": number}
      },
      "day2": { ... },
      "day3": { ... }
    }
    
    Ensure total daily calories are close to the goal.`;

    try {
      const response = await this.makeRequest('/models/gemini-pro:generateContent', {
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from Gemini');

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Meal plan generation error:', error);
      return {
        day1: {
          breakfast: { name: 'Oatmeal with Berries', calories: 300 },
          lunch: { name: 'Grilled Chicken Salad', calories: 450 },
          dinner: { name: 'Salmon with Vegetables', calories: 500 },
          snack: { name: 'Greek Yogurt', calories: 150 }
        }
      };
    }
  }
}

export const geminiService = new GeminiService();
