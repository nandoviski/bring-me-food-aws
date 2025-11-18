"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Heart,
  Menu,
  User,
  ClipboardList,
  Globe,
  LogOut,
  ShoppingBag,
  ChefHatIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import LoginModal from "@/components/auth/login-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useShoppingCart } from "@/features/shopping-cart/context/shoppingCartContext";
import ShoppingCartSheet from "@/features/shopping-cart/components/shoppingCartSheet";
// import { useFavorites } from "@/hooks/use-favorites";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const { cartQuantity } = useShoppingCart();

  const nameForMenuIcon = user?.customer
    ? user.customer.firstName
    : (user?.chef?.username ?? "BF");

  // Check if we're on the homepage
  const isHomePage = true; //pathname === "/" || "/how-it-works";

  // Handle scroll to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        setIsScrolled(window.scrollY > 50);
      } else {
        setIsScrolled(true);
      }
    };

    // Set initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Navbar background and text colors based on scroll state
  const navBackground =
    isHomePage && !isScrolled
      ? "bg-primary backdrop-blur-md top-0 "
      : "bg-white top-2 container-custom";

  const navTextColor =
    isHomePage && !isScrolled ? "text-white" : "text-primary";

  const navBorder =
    isHomePage && !isScrolled
      ? "border-primary/20  border-y"
      : "border-primary/20  border rounded-lg";

  const navLinkClass =
    isHomePage && !isScrolled
      ? "text-white/90 hover:text-secondary"
      : "primary/90 hover:text-secondary";

  return (
    <nav
      className={`sticky z-50 w-full transition-all duration-500 ${navBackground} ${navBorder}`}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className={`flex items-center space-x-2 transition-colors ${navTextColor}`}
            >
              <ChefHat className="h-6 w-6" />
              <span className="text-xl font-bold">Bring me Food</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="/search"
              className={`font-medium transition-colors ${navLinkClass}`}
            >
              Explore
            </Link>
            <Link
              href="/how-it-works"
              className={`font-medium transition-colors ${navLinkClass}`}
            >
              How It Works
            </Link>
            {user ? (
              <>
                <ShoppingCartSheet>
                  <Button
                    variant="green"
                    size="icon"
                    className={`relative border-0 ${isScrolled && "text-primary hover:text-secondary bg-white"} hover:bg-white/10`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cartQuantity > 0 && (
                      <span className="bg-secondary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-white">
                        {cartQuantity}
                      </span>
                    )}
                  </Button>
                </ShoppingCartSheet>

                {/* Profile dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`relative h-8 w-8 rounded-full hover:bg-white/10 ${navTextColor}`}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-white/20">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${nameForMenuIcon}`}
                          alt={nameForMenuIcon}
                        />
                        <AvatarFallback>
                          {nameForMenuIcon.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {user.chef && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/account/chef/dashboard"
                            className="flex items-center"
                          >
                            <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/account/chef/profile"
                            className="flex items-center"
                          >
                            <ChefHatIcon className="mr-2 h-4 w-4" />
                            Chef Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/chef/${user.chef.username}`}
                            className="flex items-center"
                          >
                            <Globe className="mr-2 h-4 w-4" />
                            My Public Page
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/customer/profile"
                        className="flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" />
                        User Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/customer/orders"
                        className="flex items-center"
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        <span className="flex-1">Favorite Chefs</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-56">
                        {/* {favorites.length > 0 ? (
                          <>
                            {favorites.map((chef) => (
                              <DropdownMenuItem key={chef.id} asChild>
                                <Link href={`/chef/${chef.username}`} className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage 
                                      src={chef.image || `https://api.dicebear.com/7.x/initials/svg?seed=${chef.name}`}
                                      alt={chef.name}
                                    />
                                    <AvatarFallback>{chef.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="flex-1 truncate">{chef.name}</span>
                                </Link>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                          </>
                        ) : ( */}
                        <DropdownMenuItem
                          className="text-muted-foreground"
                          disabled
                        >
                          No favorite chefs yet
                        </DropdownMenuItem>
                        {/* )} */}
                        <DropdownMenuItem asChild>
                          <Link
                            href="/chef/sarah_kitchen"
                            className="flex items-center font-medium"
                          >
                            Sarah Kitchen
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/favorites"
                            className="flex items-center font-medium"
                          >
                            View All Favorites
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <LoginModal />
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            <Button
              variant="green"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`border-t py-4 md:hidden ${isHomePage && !isScrolled ? "border-white/20" : "border-primary/20"}`}
          >
            <div className="flex flex-col space-y-4">
              <Link
                href="/search"
                className={`font-medium transition-colors ${navLinkClass}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/how-it-works"
                className={`font-medium transition-colors ${navLinkClass}`}
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              {user && (
                <>
                  <ShoppingCartSheet>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${navLinkClass} hover:bg-white/10`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Cart
                      {cartQuantity > 0 && (
                        <span className="bg-secondary ml-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                          {cartQuantity}
                        </span>
                      )}
                    </Button>
                  </ShoppingCartSheet>
                  <Link
                    href="/account/customer/orders"
                    className={`font-medium transition-colors ${navLinkClass}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      My Orders
                    </span>
                  </Link>
                  <Link
                    href="/favorites"
                    className={`font-medium transition-colors ${navLinkClass}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      Favorite Chefs
                    </span>
                  </Link>
                </>
              )}
              <div className="flex items-center space-x-4">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`relative h-8 w-8 rounded-full hover:bg-white/10 ${navTextColor}`}
                      >
                        <Avatar className="h-8 w-8 ring-2 ring-white/20">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${nameForMenuIcon}`}
                            alt={nameForMenuIcon}
                          />
                          <AvatarFallback>
                            {nameForMenuIcon.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.chef && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/account/chef/dashboard"
                              className="flex items-center"
                            >
                              <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/account/chef/profile"
                              className="flex items-center"
                            >
                              <ChefHatIcon className="mr-2 h-4 w-4" />
                              Chef Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/chef/${user.chef.username}`}
                              className="flex items-center"
                            >
                              <Globe className="mr-2 h-4 w-4" />
                              My Public Page
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem asChild>
                        <Link
                          href="/account/customer/profile"
                          className="flex items-center"
                        >
                          <User className="mr-2 h-4 w-4" />
                          User Profile
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="flex items-center"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <LoginModal compact />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
