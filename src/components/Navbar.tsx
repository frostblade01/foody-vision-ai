import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, User, Heart, LogOut, Home, Sparkles, Plus, Video, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const Navbar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ChefHat className="w-8 h-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold">Foodyfy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/reels")}>
                  <Video className="w-4 h-4 mr-2" />
                  Reels
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/users")}>
                  <User className="w-4 h-4 mr-2" />
                  Users
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/saved")}>
                  <Heart className="w-4 h-4 mr-2" />
                  Saved
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="glass" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/create-recipe")}>
                      <ChefHat className="w-4 h-4 mr-2" />
                      Create Recipe
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/create-reel")}>
                      <Video className="w-4 h-4 mr-2" />
                      Create Reel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="hero" size="sm" onClick={() => navigate("/ai-kitchen")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Kitchen
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="hero" onClick={() => navigate("/auth")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  {user ? (
                    <>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={() => { navigate("/"); setMobileMenuOpen(false); }}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Home
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={() => { navigate("/reels"); setMobileMenuOpen(false); }}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Reels
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={() => { navigate("/users"); setMobileMenuOpen(false); }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Users
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={() => { navigate("/saved"); setMobileMenuOpen(false); }}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Saved
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={() => { navigate("/create-recipe"); setMobileMenuOpen(false); }}
                      >
                        <ChefHat className="w-4 h-4 mr-2" />
                        Create Recipe
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={() => { navigate("/create-reel"); setMobileMenuOpen(false); }}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Create Reel
                      </Button>
                      <Button 
                        variant="hero" 
                        className="justify-start" 
                        onClick={() => { navigate("/ai-kitchen"); setMobileMenuOpen(false); }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Kitchen
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        className="justify-start" 
                        onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
                      >
                        Sign In
                      </Button>
                      <Button 
                        variant="hero" 
                        className="justify-start" 
                        onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
