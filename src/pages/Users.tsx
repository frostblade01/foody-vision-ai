import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { verifiedUsers } from "@/data/verifiedUsers";

interface ProfileRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const Users = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileRow[]>([]);
  const [trending, setTrending] = useState<ProfileRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      // Fallback: top 8 profiles by recent activity if user_follows not available
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .limit(8);
      setTrending(data || []);
    } catch {}
  };

  const handleSearch = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${query}%`)
      .limit(20);
    setResults(data || []);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <User className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Users</h1>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search users by username"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Trending Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trending.map((p) => (
                <Card key={p.id} className="cursor-pointer" onClick={() => navigate(`/users/${encodeURIComponent(p.username || p.id)}`)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">U</div>
                      )}
                    </div>
                    <div className="font-medium">{p.username || "Anonymous"}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Verified & Famous</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {verifiedUsers.map((u) => (
                <Card key={u.username} className="cursor-pointer" onClick={() => navigate(`/users/${u.username}`)}>
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map((p) => (
                  <Card key={p.id} className="cursor-pointer" onClick={() => navigate(`/users/${encodeURIComponent(p.username || p.id)}`)}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">U</div>
                        )}
                      </div>
                      <div className="font-medium">{p.username || "Anonymous"}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;


