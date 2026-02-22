import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mb-8 text-7xl">🍽️</div>
      <h1 className="mb-2 text-4xl font-bold text-gray-900">404</h1>
      <p className="mb-2 text-lg font-semibold text-gray-700">Page not found</p>
      <p className="mb-8 text-sm text-gray-500">
        This page doesn't exist — or the chef packed up and moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-[#1a2e25] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Go home
        </Link>
        <Link
          href="/search"
          className="rounded-lg border border-orange-500 px-5 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
        >
          Browse chefs
        </Link>
      </div>
    </div>
  );
}
