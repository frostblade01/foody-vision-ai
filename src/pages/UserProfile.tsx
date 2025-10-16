import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, ChefHat, Heart, Star, MessageCircle, Video } from "lucide-react";
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
      // Load reels authored by this user from localStorage
      const name = verified?.username || profile?.username;
      if (!name) return;
      
      const storedReels = localStorage.getItem('userReels');
      if (storedReels) {
        const allReels = JSON.parse(storedReels);
        // Filter reels by username or userId
        const userReels = allReels.filter((reel: any) => 
          reel.creator_name?.toLowerCase() === name.toLowerCase() ||
          (userId && reel.userId === userId)
        );
        setReels(userReels);
      } else {
        setReels([]);
      }
    })();
  }, [profile?.username, verified?.username, userId]);

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
                  <CardTitle className="flex items-center gap-2"><Video className="w-5 h-5" /> Reels ({reels.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {reels.length === 0 ? (
                    <div className="text-center py-8">
                      <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No reels available.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {reels.map((reel) => (
                        <div key={reel.id} className="border rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                          <div className="relative aspect-[9/16] bg-black">
                            <iframe
                              src={reel.video_url}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                          <div className="p-3">
                            <div className="font-semibold text-sm line-clamp-2">{reel.title}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" /> {reel.likes || 0}
                              </span>
                              {reel.recipe_name && (
                                <span>• {reel.recipe_name}</span>
                              )}
                            </div>
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


