import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, ChefHat, Heart, Star, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { verifiedUsers } from "@/data/verifiedUsers";

const UserProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reels, setReels] = useState<any[]>([]);
  const verified = useMemo(() => verifiedUsers.find(u => u.username.toLowerCase() === String(username).toLowerCase()), [username]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Try Supabase profile by username
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', String(username))
        .maybeSingle();
      if (data) {
        setProfile(data);
        setUserId(data.id);
      } else if (verified) {
        setProfile({ username: verified.username, bio: verified.bio, avatar_url: verified.avatar });
        setUserId(null);
      }
      setLoading(false);
    })();
  }, [username]);

  useEffect(() => {
    (async () => {
      // Load reels authored by this user (match by creator_name for demo, creator_id when available)
      const name = verified?.username || profile?.username;
      if (!name) return;
      const { data } = await supabase
        .from('recipe_reels')
        .select('*')
        .ilike('creator_name', name);
      setReels(data || []);
    })();
  }, [profile?.username, verified?.username]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">User not found.</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <UserIcon className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">{profile.username}</h1>
            {verified && <span className="text-primary">✓</span>}
          </div>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">U</div>
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{profile.bio}</div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recipes">Recipes</TabsTrigger>
              <TabsTrigger value="reels">Reels</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {profile.bio || 'No bio yet.'}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ChefHat className="w-5 h-5" /> Recipes</CardTitle>
                </CardHeader>
                <CardContent>
                  {!userId ? 'No recipes available.' : 'Recipes list would appear here (guarded by DB availability).'}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reels">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5" /> Reels</CardTitle>
                </CardHeader>
                <CardContent>
                  {reels.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No reels available.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {reels.map((reel) => (
                        <div key={reel.id} className="border rounded-lg overflow-hidden">
                          <div className="aspect-[16/9] bg-muted">
                            <img src={reel.thumbnail_url} alt={reel.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3">
                            <div className="font-semibold text-sm line-clamp-2">{reel.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{reel.view_count} views</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5" /> Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  Visible to visitors. (Use same mapping logic as Profile when DB available.)
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  Visible to visitors.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;


