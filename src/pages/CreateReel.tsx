import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateReel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    recipeName: "",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to create reels",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Extract YouTube video ID from URL
      let videoId = "";
      const urlPatterns = [
        /(?:youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]+)/,
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      ];

      for (const pattern of urlPatterns) {
        const match = formData.videoUrl.match(pattern);
        if (match) {
          videoId = match[1];
          break;
        }
      }

      if (!videoId && formData.videoUrl) {
        // Assume it's already just the ID
        videoId = formData.videoUrl;
      }

      if (!videoId) {
        toast({
          title: "Invalid video URL",
          description: "Please provide a valid YouTube Shorts URL or video ID",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // For now, store in localStorage (can be moved to database later)
      const reels = JSON.parse(localStorage.getItem("userReels") || "[]");
      const newReel = {
        id: `user-reel-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        videoId,
        recipeName: formData.recipeName,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        createdBy: session.user.id,
        createdAt: new Date().toISOString(),
      };

      reels.push(newReel);
      localStorage.setItem("userReels", JSON.stringify(reels));

      toast({
        title: "Reel created!",
        description: "Your cooking reel has been published",
      });

      navigate("/reels");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create reel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="container max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Create a Reel</h1>
          </div>
          <p className="text-muted-foreground">
            Share your cooking videos with the community
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reel Details</CardTitle>
            <CardDescription>
              Add your YouTube Shorts video and describe your cooking creation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Perfect Pasta Carbonara"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL or Upload Video *</Label>
                <Input
                  id="videoUrl"
                  placeholder="e.g., https://www.youtube.com/shorts/zMUNG9KXmrE or video ID"
                  value={formData.videoUrl}
                  onChange={(e) => handleChange("videoUrl", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Paste a video URL or upload your own video
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipeName">Recipe Name</Label>
                <Input
                  id="recipeName"
                  placeholder="e.g., Chicken Alfredo, Beef Wellington"
                  value={formData.recipeName}
                  onChange={(e) => handleChange("recipeName", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Help viewers find your reel when searching for recipes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your cooking process, ingredients, or tips..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="e.g., italian, pasta, quick-meal, vegetarian"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/reels")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                  <Upload className="mr-2 w-4 h-4" />
                  Publish Reel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
          <h3 className="font-semibold mb-2">Tips for Great Reels</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Use clear, descriptive titles</li>
            <li>• Upload high-quality YouTube Shorts</li>
            <li>• Include relevant recipe names and tags</li>
            <li>• Add helpful descriptions with cooking tips</li>
            <li>• Keep videos engaging and under 60 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateReel;
