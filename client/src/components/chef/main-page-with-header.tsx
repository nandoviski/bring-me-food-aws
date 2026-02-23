import React from "react";
import { Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
  title: string;
  description: string;
  backButton?: boolean;
};

export default function MainPageWithHeader({
  children,
  title,
  description,
  backButton = false,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-[#E5E7EB] px-6 py-6">
        <div className="flex items-center gap-3">
          <div>
            {backButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mb-4 text-black hover:bg-white/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <h1 className="text-2xl font-normal text-[#1F2937] sm:text-4xl">{title}</h1>
            <div className="text-admin-dark-gray flex items-center gap-2 text-sm">
              <span>{description}</span>
              <Info className="h-4 w-4 text-[#9CA3AF]" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-8 sm:px-8">{children}</div>
    </div>
  );
}

{
  /* <main className="container mx-auto flex-1 overflow-auto rounded-lg bg-white p-4 shadow-sm md:p-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </main> */
}
