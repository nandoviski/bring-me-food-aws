import ChefProfile from "@/features/chef/components/chef-profile";

type Props = {
  params: {
    username: string;
  };
};

export default async function ChefProfilePage({ params }: Props) {
  const { username } = await params;

  return <ChefProfile username={username} />;
}
