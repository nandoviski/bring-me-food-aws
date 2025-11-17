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
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </main>
  );
}
