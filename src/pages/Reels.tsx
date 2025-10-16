import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Reel {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  recipe_id?: string;
  recipe_type?: string;
  creator_name: string;
  creator_avatar?: string;
  duration_seconds?: number;
  view_count: number;
  like_count: number;
  is_liked?: boolean;
}

const Reels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const { data, error } = await supabase
        .from("recipe_reels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Use demo data if no reels exist
        setReels(getDemoReels());
      } else {
        setReels(data);
      }
    } catch (error) {
      console.error("Error fetching reels:", error);
      setReels(getDemoReels());
    } finally {
      setLoading(false);
    }
  };

  const getDemoReels = (): Reel[] => {
    // Food-focused demo video IDs
    const primaryIds = [
      "x8Y7v1s0l9U", // pasta carbonara (demo)
      "tNq8mGQ9r1k", // vegan bowl (demo)
      "8hKc5Ylq2fA", // scrambled eggs (demo)
      "H1m3qVwQZl4", // cookies (demo)
      "0qN2QzUeB3k"  // salmon (demo)
    ];
    const altIds = [
      "Q1p0sY8Lm2E",
      "W5t9bR3Xk0M",
      "A7y2Nc6Pd4S",
      "Z3v8Tq1Jk9L",
      "M6c4Rb8Yp2N"
    ];
    const makeUrl = (id: string) => `https://www.youtube.com/embed/${id}`;
    return [
    {
      id: "demo-1",
      title: "Quick Pasta Carbonara",
      description: "Learn to make authentic Italian carbonara in just 15 minutes!",
      video_url: makeUrl(primaryIds[0]),
      // @ts-ignore
      alt_video_url: makeUrl(altIds[0]),
      thumbnail_url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400",
      recipe_id: "52772",
      recipe_type: "api",
      creator_name: "Chef Marco",
      creator_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      duration_seconds: 60,
      view_count: 1250,
      like_count: 89
    },
    {
      id: "demo-2",
      title: "Vegan Buddha Bowl",
      description: "Colorful and nutritious bowl packed with superfoods",
      video_url: makeUrl(primaryIds[1]),
      // @ts-ignore
      alt_video_url: makeUrl(altIds[1]),
      thumbnail_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
      recipe_id: "demo-1",
      recipe_type: "user",
      creator_name: "Green Chef Sarah",
      creator_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      duration_seconds: 45,
      view_count: 890,
      like_count: 67
    },
    {
      id: "demo-3",
      title: "Perfect Scrambled Eggs",
      description: "The secret to restaurant-quality scrambled eggs",
      video_url: makeUrl(primaryIds[2]),
      // @ts-ignore
      alt_video_url: makeUrl(altIds[2]),
      thumbnail_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400",
      recipe_id: "demo-2",
      recipe_type: "user",
      creator_name: "Breakfast King",
      creator_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      duration_seconds: 30,
      view_count: 2100,
      like_count: 156
    },
    {
      id: "demo-4",
      title: "Chocolate Chip Cookies",
      description: "Soft and chewy cookies that melt in your mouth",
      video_url: makeUrl(primaryIds[3]),
      // @ts-ignore
      alt_video_url: makeUrl(altIds[3]),
      thumbnail_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
      recipe_id: "demo-3",
      recipe_type: "user",
      creator_name: "Sweet Baker",
      creator_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      duration_seconds: 90,
      view_count: 3400,
      like_count: 234
    },
    {
      id: "demo-5",
      title: "Grilled Salmon",
      description: "Perfectly grilled salmon with herbs and lemon",
      video_url: makeUrl(primaryIds[4]),
      // @ts-ignore
      alt_video_url: makeUrl(altIds[4]),
      thumbnail_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
      recipe_id: "demo-4",
      recipe_type: "user",
      creator_name: "Seafood Master",
      creator_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      duration_seconds: 75,
      view_count: 1800,
      like_count: 123
    }
  ];
  };

  // Per-recipe playlists of food-related shorts
  const recipePlaylists: Record<string, string[]> = useMemo(() => ({
    "52772": ["x8Y7v1s0l9U", "Q1p0sY8Lm2E", "k9z2Xc7LmQw", "p1L3Mn8QaZr"], // Carbonara related
    "demo-1": ["tNq8mGQ9r1k", "W5t9bR3Xk0M", "v7K9Lp2QsTe"], // Vegan bowl related
    "demo-2": ["8hKc5Ylq2fA", "A7y2Nc6Pd4S", "s9T2Lp0QwEr"], // Eggs related
    "demo-3": ["H1m3qVwQZl4", "Z3v8Tq1Jk9L", "n4B7Qp2TxLm"], // Cookies related
    "demo-4": ["0qN2QzUeB3k", "M6c4Rb8Yp2N", "c8R1Vx5LmQp"], // Salmon related
  }), []);

  const slugForUser = (name: string) => encodeURIComponent(name);

  const handleLike = async (reelId: string) => {
    try {
      const reel = reels.find(r => r.id === reelId);
      if (!reel) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to like reels",
          variant: "destructive",
        });
        return;
      }

      if (reel.is_liked) {
        // Unlike
        const { error } = await supabase
          .from("reel_likes")
          .delete()
          .eq("reel_id", reelId)
          .eq("user_id", session.user.id);

        if (!error) {
          setReels(prev => prev.map(r => 
            r.id === reelId 
              ? { ...r, like_count: r.like_count - 1, is_liked: false }
              : r
          ));
        }
      } else {
        // Like
        const { error } = await supabase
          .from("reel_likes")
          .insert({
            reel_id: reelId,
            user_id: session.user.id
          });

        if (!error) {
          setReels(prev => prev.map(r => 
            r.id === reelId 
              ? { ...r, like_count: r.like_count + 1, is_liked: true }
              : r
          ));
        }
      }
    } catch (error) {
      console.error("Error liking reel:", error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: reels[currentIndex]?.title,
        text: reels[currentIndex]?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  const nextReel = () => {
    setCurrentIndex(prev => (prev + 1) % reels.length);
    setIsPlaying(false);
  };

  const prevReel = () => {
    setCurrentIndex(prev => (prev - 1 + reels.length) % reels.length);
    setIsPlaying(false);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") prevReel();
    if (e.key === "ArrowDown") nextReel();
    if (e.key === " ") {
      e.preventDefault();
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying]);

  // When focusing on a reel, toggle alternate video for variety
  const [flipAlt, setFlipAlt] = useState(false);
  useEffect(() => {
    setFlipAlt(prev => !prev);
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No reels available</h2>
          <p className="text-muted-foreground">Check back later for cooking videos!</p>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative w-full max-w-md h-screen flex flex-col">
        {/* Video Container */}
        <div className="flex-1 relative bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <iframe
              // @ts-ignore alt field exists for demo reels
              src={(flipAlt && (currentReel as any).alt_video_url) ? (currentReel as any).alt_video_url : currentReel.video_url}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Recipe Title Overlay */}
          <div className="absolute bottom-20 left-4 right-20 pointer-events-none">
            <h2 className="text-white text-xl font-bold mb-2">{currentReel.title}</h2>
            <p className="text-white/80 text-sm mb-2">{currentReel.description}</p>
            <div className="flex items-center gap-2">
              <Link to={`/users/${slugForUser(currentReel.creator_name)}`} className="pointer-events-auto flex items-center gap-2">
                <img
                  src={currentReel.creator_avatar}
                  alt={currentReel.creator_name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white/90 text-sm underline">{currentReel.creator_name}</span>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute right-4 bottom-20 flex flex-col gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white"
              onClick={() => handleLike(currentReel.id)}
            >
              <Heart className={`w-6 h-6 ${currentReel.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <div className="text-center text-white text-sm">
              {currentReel.like_count}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <div className="text-center text-white text-sm">
              24
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white"
              onClick={handleShare}
            >
              <Share className="w-6 h-6" />
            </Button>
            <div className="text-center text-white text-sm">
              Share
            </div>
          </div>

          {/* Navigation */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white"
              onClick={prevReel}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white"
              onClick={nextReel}
            >
              ↓
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {reels.map((_, index) => (
              <div
                key={index}
                className={`w-1 h-8 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="bg-background/95 backdrop-blur-sm border-t border-border p-4">
          <div className="flex items-center justify-between">
            <Link to={`/users/${slugForUser(currentReel.creator_name)}`} className="flex items-center gap-3">
              <img
                src={currentReel.creator_avatar}
                alt={currentReel.creator_name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{currentReel.creator_name}</p>
                <p className="text-sm text-muted-foreground">{currentReel.view_count} views</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentReel.duration_seconds}s</Badge>
            </div>
          </div>
          {/* Recipe playlist scroller */}
          {currentReel.recipe_id && recipePlaylists[currentReel.recipe_id] && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2 text-muted-foreground">More for this recipe</div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {recipePlaylists[currentReel.recipe_id].map((vid) => (
                  <a
                    key={vid}
                    href={`https://www.youtube.com/watch?v=${vid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block flex-shrink-0"
                    aria-label="Open related recipe video"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
                      className="w-32 h-20 object-cover rounded-md border"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reels;

