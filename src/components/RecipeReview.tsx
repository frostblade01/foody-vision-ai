import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user_id: string;
  user?: {
    username?: string;
    avatar_url?: string;
  };
}

interface RecipeReviewProps {
  recipeId: string;
  recipeType: 'api' | 'user';
}

const RecipeReview = ({ recipeId, recipeType }: RecipeReviewProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchReviews();
  }, [recipeId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("recipe_reviews")
        .select(`
          *,
          user:profiles!recipe_reviews_user_id_fkey(username, avatar_url)
        `)
        .eq("recipe_id", recipeId)
        .eq("recipe_type", recipeType)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews(data || []);

      // Calculate average rating
      if (data && data.length > 0) {
        const total = data.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(total / data.length);
        setTotalReviews(data.length);
      }

      // Find user's review if logged in
      if (user) {
        const userReviewData = data?.find(review => review.user_id === user.id);
        if (userReviewData) {
          setUserReview(userReviewData);
          setNewRating(userReviewData.rating);
          setNewComment(userReviewData.comment || "");
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to review recipes",
        variant: "destructive",
      });
      return;
    }

    if (newRating === 0) {
      toast({
        title: "Please select a rating",
        description: "Choose a star rating before submitting",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from("recipe_reviews")
          .update({
            rating: newRating,
            comment: newComment.trim() || null
          })
          .eq("id", userReview.id);

        if (error) throw error;
      } else {
        // Create new review
        const { error } = await supabase
          .from("recipe_reviews")
          .insert({
            user_id: user.id,
            recipe_id: recipeId,
            recipe_type: recipeType,
            rating: newRating,
            comment: newComment.trim() || null
          });

        if (error) throw error;
      }

      fetchReviews(); // Refresh reviews
      
      toast({
        title: userReview ? "Review updated!" : "Review posted!",
        description: "Thank you for your feedback",
      });
    } catch (error: any) {
      toast({
        title: "Error posting review",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (username?: string) => {
    if (!username) return "U";
    return username.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setNewRating(star)}
            className={`transition-colors ${
              interactive ? 'hover:scale-110' : ''
            }`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Reviews ({totalReviews})
        </CardTitle>
        {totalReviews > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Review */}
        {user && (
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>{getInitials(user.user_metadata?.username)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.user_metadata?.username || "You"}</p>
                <p className="text-sm text-muted-foreground">
                  {userReview ? "Update your review" : "Write a review"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                {renderStars(newRating, true)}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
                <Textarea
                  placeholder="Share your experience with this recipe..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={loading || newRating === 0}
                className="w-full"
              >
                {loading ? "Submitting..." : (userReview ? "Update Review" : "Submit Review")}
              </Button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.user?.avatar_url} />
                  <AvatarFallback>{getInitials(review.user?.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {review.user?.username || "Anonymous"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      {review.rating}/5
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm">{review.comment}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeReview;
