import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_comment_id?: string;
  user?: {
    username?: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

interface RecipeCommentsProps {
  recipeId: string;
  recipeType: 'api' | 'user';
}

const RecipeComments = ({ recipeId, recipeType }: RecipeCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchComments();
  }, [recipeId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("recipe_comments")
        .select(`
          *,
          user:profiles!recipe_comments_user_id_fkey(username, avatar_url)
        `)
        .eq("recipe_id", recipeId)
        .eq("recipe_type", recipeType)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from("recipe_comments")
            .select(`
              *,
              user:profiles!recipe_comments_user_id_fkey(username, avatar_url)
            `)
            .eq("parent_comment_id", comment.id)
            .order("created_at", { ascending: true });

          return {
            ...comment,
            replies: replies || []
          };
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmitComment = async (parentId?: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write a comment before submitting",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("recipe_comments")
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
          recipe_type: recipeType,
          content: newComment.trim(),
          parent_comment_id: parentId || null
        });

      if (error) throw error;

      setNewComment("");
      fetchComments(); // Refresh comments
      
      toast({
        title: "Comment posted!",
        description: "Your comment has been added",
      });
    } catch (error: any) {
      toast({
        title: "Error posting comment",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment */}
        {user && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>{getInitials(user.user_metadata?.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Share your thoughts about this recipe..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSubmitComment()}
                    disabled={loading || !newComment.trim()}
                    size="sm"
                  >
                    {loading ? "Posting..." : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Main Comment */}
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user?.avatar_url} />
                    <AvatarFallback>{getInitials(comment.user?.username)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {comment.user?.username || "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    
                    {/* Reply Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => {
                        const replyText = prompt("Write your reply:");
                        if (replyText?.trim()) {
                          setNewComment(replyText);
                          handleSubmitComment(comment.id);
                        }
                      }}
                    >
                      Reply
                    </Button>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={reply.user?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {getInitials(reply.user?.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted/50 rounded-lg p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs">
                                {reply.user?.username || "Anonymous"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-xs">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeComments;
