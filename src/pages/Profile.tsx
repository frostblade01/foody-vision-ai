import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Loader2, Heart, Users, Star, ChefHat, CheckCircle } from "lucide-react";
import { verifiedUsers } from "@/data/verifiedUsers";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import UserFollowButton from "@/components/UserFollowButton";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    bio: "",
    diet_type: "",
    calorie_goal: "",
    allergies: [] as string[],
  });
  const [userRecipes, setUserRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [recipeNames, setRecipeNames] = useState<Record<string, string>>({});
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile.username) {
      loadUserData();
    }
  }, [profile.username]);

  const loadProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        username: data.username || "",
        bio: data.bio || "",
        diet_type: data.diet_type || "",
        calorie_goal: data.calorie_goal?.toString() || "",
        allergies: data.allergies || [],
      });
    }
    setLoading(false);
  };

  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Load user's recipes
      const { data: recipes } = await supabase
        .from("user_recipes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setUserRecipes(recipes || []);

      // Load saved recipes
      const { data: saved } = await supabase
        .from("saved_recipes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setSavedRecipes(saved || []);

      // Load user's reviews
      const { data: userReviews } = await supabase
        .from("recipe_reviews")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      const list = userReviews || [];
      setReviews(list);
      // Fetch recipe names for reviews
      const names: Record<string, string> = {};
      await Promise.all(
        list.map(async (r) => {
          if (r.recipe_id && !names[r.recipe_id]) {
            try {
              if (r.recipe_type === 'api') {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${r.recipe_id}`);
                const d = await res.json();
                if (d?.meals?.[0]?.strMeal) names[r.recipe_id] = d.meals[0].strMeal;
              } else {
                const { data: ur } = await supabase
                  .from('user_recipes')
                  .select('title')
                  .eq('id', r.recipe_id)
                  .maybeSingle();
                if (ur?.title) names[r.recipe_id] = ur.title;
              }
            } catch {}
          }
        })
      );
      setRecipeNames(names);

      // Load followers (commented out until user_follows table is created)
      setFollowers([]);
      // Load following (commented out until user_follows table is created)
      setFollowing([]);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: profile.username,
        bio: profile.bio,
        diet_type: profile.diet_type,
        calorie_goal: profile.calorie_goal ? parseInt(profile.calorie_goal) : null,
        allergies: profile.allergies,
      })
      .eq("id", session.user.id);

    if (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <User className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Profile</h1>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recipes">My Recipes</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      placeholder="chef123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dietary Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diet_type">Diet Type</Label>
                    <Input
                      id="diet_type"
                      value={profile.diet_type}
                      onChange={(e) => setProfile({ ...profile, diet_type: e.target.value })}
                      placeholder="e.g., Vegetarian, Keto, Paleo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calorie_goal">Daily Calorie Goal</Label>
                    <Input
                      id="calorie_goal"
                      type="number"
                      value={profile.calorie_goal}
                      onChange={(e) => setProfile({ ...profile, calorie_goal: e.target.value })}
                      placeholder="2000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                    <Input
                      id="allergies"
                      value={profile.allergies.join(", ")}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          allergies: e.target.value.split(",").map((a) => a.trim()).filter(Boolean),
                        })
                      }
                      placeholder="Nuts, Dairy, Gluten"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSave}
                variant="hero"
                className="w-full"
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Save Profile
              </Button>
            </TabsContent>

            <TabsContent value="recipes" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-primary" />
                  My Recipes ({userRecipes.length})
                </h2>
                <Button onClick={() => navigate("/create-recipe")} variant="hero">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Create Recipe
                </Button>
              </div>
              
              {userRecipes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No recipes yet. Create your first recipe!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userRecipes.map((recipe) => (
                    <Card key={recipe.id} className="cursor-pointer hover:scale-105 transition-transform">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={recipe.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{recipe.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{recipe.like_count} likes</span>
                          <span>{recipe.view_count} views</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Saved Recipes ({savedRecipes.length})
              </h2>
              
              {savedRecipes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No saved recipes yet. Start exploring!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedRecipes.map((recipe) => (
                    <Card key={recipe.id} className="cursor-pointer hover:scale-105 transition-transform">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={recipe.recipe_image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                          alt={recipe.recipe_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{recipe.recipe_name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {recipe.category} • {recipe.area}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                My Reviews ({reviews.length})
              </h2>
              
            {reviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No reviews yet. Start reviewing recipes!</p>
                  </CardContent>
                </Card>
              ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm">{review.comment}</p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        For recipe: <span className="font-medium">{recipeNames[review.recipe_id] || review.recipe_id}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )}
            </TabsContent>

            <TabsContent value="followers" className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Followers ({followers.length})
              </h2>
              
              {followers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No followers yet. Share your recipes to get followers!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {followers.map((follow) => (
                    <Card key={follow.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{follow.follower?.username || "Anonymous"}</p>
                              <p className="text-sm text-muted-foreground">
                                Following since {new Date(follow.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Following ({following.length})
              </h2>
              
              {following.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Not following anyone yet. Discover amazing chefs!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {following.map((follow) => (
                    <Card key={follow.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{follow.following?.username || "Anonymous"}</p>
                              <p className="text-sm text-muted-foreground">
                                Following since {new Date(follow.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" /> Verified Accounts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {verifiedUsers.map((u) => (
                    <Card key={u.username} className="cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                          <img src={u.avatar} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            {u.displayName}
                            <span className="text-primary">✓</span>
                          </div>
                          <div className="text-xs text-muted-foreground">@{u.username}</div>
                          <div className="text-xs text-muted-foreground mt-1">{u.bio}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
