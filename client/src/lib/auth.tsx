"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, Chef } from "@/schema";

type UserComplete = User & { customer?: any; chef?: any; isChef?: boolean };

type AuthContextType = {
  user: UserComplete | null;
  login: (userId: string) => void;
  logout: () => void;
  availableUsers: UserComplete[];
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUsers(): UserComplete[] {
  const chefUser: UserComplete = {
    id: "879c31a3-5354-49ed-be60-8ab4b00c9537",
    email: "sarah@example.com",
    status: "CREATED",
    deletedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    isChef: true, // chef !== null
    chef: {
      id: "d6a8e654-a4ee-4c45-8f3b-11f037981496",
      username: "sarah_kitchen",
      name: "My Home Kitchen",
      location: "Burwood, NSW",
      bio: "I am a chef with 10 years of experience in the kitchen. I love to cook and share my passion for food with others.",
      specialties: "Italian, French, Asian",
      phoneNumber: "0466666666",
      userId: "879c31a3-5354-49ed-be60-8ab4b00c9537",
      deletedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const customerUser: UserComplete = {
    id: "eacc7be0-860d-450e-a4d4-4b069fb9cd47",
    email: "fmarostega@gmail.com",
    status: "CREATED",
    deletedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    isChef: false, // chef === null
    customer: {
      id: "873d1e0e-16e0-49f9-a0a5-c1947cf0e272",
      firstName: "Fernando",
      lastName: "Marostega",
      address: "123 Main St",
      city: "Rhodes",
      state: "NSW",
      country: "AU",
      postalCode: "2000",
      phoneNumber: "0455555555",
      company: null,
      userId: "eacc7be0-860d-450e-a4d4-4b069fb9cd47",
      deletedAt: undefined,
    },
  };

  //   firstName: z.string({ message: "First name is required" }).max(150),
  //     lastName: z.string({ message: "Last name is required" }).max(150),
  //     phoneNumber: z.string().min(10).max(10),
  //     address: z.string({ message: "Address is required" }).max(250),
  //     city: z.string({ message: "City is required" }).max(100),
  //     state: z.string().min(2).max(3),
  //     country: z.string().max(3),
  //     postalCode: z.string().min(4).max(4),
  //     company: z.string().max(150).optional().nullable(),

  const guestUser: UserComplete = {
    id: "guest-1",
    email: "guest@example.com",
    status: "INACTIVE",
    deletedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    isChef: false, // chef === null
  };

  const users: UserComplete[] = [];
  users.push(chefUser);
  users.push(customerUser);
  users.push(guestUser);
  return users;
}

const SESSION_KEY = "bmf_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserComplete | null>(null);
  const [availableUsers] = useState<UserComplete[]>(() => buildUsers());
  const [isLoading, setIsLoading] = useState(true);

  // Load user from sessionStorage on mount (client-side hydration)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Failed to parse session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync user state to both sessionStorage and cookie
  useEffect(() => {
    try {
      if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        // Set cookie for middleware to read (expires in 24 hours)
        const expiresIn = new Date();
        expiresIn.setHours(expiresIn.getHours() + 24);
        document.cookie = `session=${encodeURIComponent(JSON.stringify(user))}; path=/; expires=${expiresIn.toUTCString()}; SameSite=Strict`;
      } else {
        sessionStorage.removeItem(SESSION_KEY);
        // Clear cookie
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
      }
    } catch (e) {
      console.error("Failed to update session:", e);
    }
  }, [user]);

  function login(userId: string) {
    const found = availableUsers.find((u) => u.id === userId) ?? null;
    setUser(found);
  }

  function logout() {
    setUser(null);
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    availableUsers,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
