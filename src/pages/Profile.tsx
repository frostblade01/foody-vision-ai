import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

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
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <User className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Profile Settings</h1>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default Profile;
