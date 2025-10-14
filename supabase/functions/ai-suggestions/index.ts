import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userData, ingredients } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt = "";
    if (type === "meal-plan") {
      prompt = `Create a 3-day meal plan for someone with:
      - Diet type: ${userData?.dietType || "balanced"}
      - Calorie goal: ${userData?.calorieGoal || "2000"} calories per day
      - Allergies: ${userData?.allergies?.join(", ") || "none"}
      
      Provide 3 meals per day with approximate calories for each meal. Format as JSON with structure:
      {
        "days": [
          {
            "day": 1,
            "meals": [
              {"name": "Breakfast Name", "calories": 400},
              {"name": "Lunch Name", "calories": 600},
              {"name": "Dinner Name", "calories": 700}
            ]
          }
        ]
      }`;
    } else if (type === "substitutes") {
      prompt = `Suggest 3 healthier ingredient substitutes for common unhealthy ingredients in recipes. Focus on:
      - Lower calorie alternatives
      - Higher protein options
      - Better nutritional value
      Format as JSON: {"substitutes": [{"original": "ingredient", "substitute": "healthier option", "benefit": "why it's better"}]}`;
    } else if (type === "from-ingredients") {
      prompt = `Based on these available ingredients: ${ingredients?.join(", ")}
      Suggest 5 recipe ideas that can be made primarily with these ingredients. 
      Format as JSON: {"recipes": [{"name": "recipe name", "mainIngredients": ["ing1", "ing2"], "missingIngredients": ["ing1"], "difficulty": "easy|medium|hard"}]}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a nutrition and recipe expert. Always respond with valid JSON.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Try to parse as JSON, fallback to text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      parsedResponse = { text: aiResponse };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-suggestions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
