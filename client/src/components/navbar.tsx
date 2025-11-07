"use client";

import { useState } from "react";
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
  const { user, logout } = useAuth();

  const { cartQuantity } = useShoppingCart();

  const nameForMenuIcon = user?.customer
    ? user.customer.firstName
    : (user?.chef?.username ?? "BF");

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-6 w-6" />
              <span className="text-xl font-bold">Bring me Food</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/search" className="text-gray-600 hover:text-gray-900">
              Explore
            </Link>
            <Link
              href="/how-it-works"
              className="text-gray-600 hover:text-gray-900"
            >
              How It Works
            </Link>
            {user ? (
              <>
                <ShoppingCartSheet>
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {cartQuantity > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
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
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
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
                      <Link href="/orders" className="flex items-center">
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
              <>
                <LoginModal />
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              <Link
                href="/explore"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/chefs"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Chefs
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/search"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Search
              </Link>
              {user && (
                <>
                  <Link
                    href="/orders"
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      My Orders
                    </span>
                  </Link>
                  <Link
                    href="/favorites"
                    className="text-gray-600 hover:text-gray-900"
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
                {/* {user && (
                  <CartSheet>
                    <Button variant="ghost" size="icon" className="relative">
                      <ShoppingBag className="h-5 w-5" />
                      {cartItemsCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                          {cartItemsCount}
                        </span>
                      )}
                    </Button>
                  </CartSheet>
                )} */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
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
              {user ? (
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full">Dashboard</Button>
                </Link>
              ) : (
                <Button className="w-full">Get Started</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
