import ChefProfile from "@/features/chef/components/chef-profile";
import type { Metadata } from "next";

type Props = {
  params: {
    username: string;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  try {
    const res = await fetch(`${API_BASE}/chefs/${username}/profile`, {
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) throw new Error("Not found");

    const chef = await res.json();

    const title = `${chef.name} — Bring Me Food`;
    const description = chef.bio
      ? `${chef.bio.slice(0, 150)}…`
      : `Order home-cooked meals from ${chef.name} in ${chef.location ?? "your area"}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        siteName: "Bring Me Food",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Chef Profile — Bring Me Food",
      description: "Order home-cooked meals from local chefs.",
    };
  }
}

export default async function ChefProfilePage({ params }: Props) {
  const { username } = await params;

  return <ChefProfile username={username} />;
}
