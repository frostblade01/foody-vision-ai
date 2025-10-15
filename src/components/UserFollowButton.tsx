import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserFollowButtonProps {
  targetUserId: string;
  showCounts?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const UserFollowButton = ({ 
  targetUserId, 
  showCounts = false, 
  variant = "default",
  size = "default"
}: UserFollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    if (user) {
      checkFollowStatus();
      fetchCounts();
    }
  }, [user, targetUserId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const checkFollowStatus = async () => {
    if (!user || user.id === targetUserId) return;

    try {
      const { data, error } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const fetchCounts = async () => {
    try {
      // Get followers count
      const { count: followers, error: followersError } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId);

      if (followersError) throw followersError;

      // Get following count
      const { count: following, error: followingError } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId);

      if (followingError) throw followingError;

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to follow users",
        variant: "destructive",
      });
      return;
    }

    if (user.id === targetUserId) {
      toast({
        title: "Cannot follow yourself",
        description: "You cannot follow your own profile",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: "Unfollowed",
          description: "You are no longer following this user",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from("user_follows")
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        
        toast({
          title: "Following",
          description: "You are now following this user",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show follow button for own profile
  if (!user || user.id === targetUserId) {
    return showCounts ? (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{followersCount} followers</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{followingCount} following</span>
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={handleFollow}
        disabled={loading}
        variant={isFollowing ? "outline" : variant}
        size={size}
      >
        {loading ? (
          "Loading..."
        ) : isFollowing ? (
          <>
            <UserMinus className="w-4 h-4 mr-2" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Follow
          </>
        )}
      </Button>
      
      {showCounts && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{followersCount} followers</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{followingCount} following</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFollowButton;
