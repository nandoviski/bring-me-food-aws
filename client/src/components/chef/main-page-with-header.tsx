import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";

type Props = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export default function MainPageWithHeader({
  children,
  title,
  description,
}: Props) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      {/* Enhanced Card Header with Green Gradient and Pattern */}
      <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 px-6 py-8">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-white">{title}</CardTitle>
            <CardDescription className="mt-1 text-emerald-50">
              {description}
            </CardDescription>
          </div>
        </div>
      </div>
      <CardContent className="p-2">{children}</CardContent>
    </Card>
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
