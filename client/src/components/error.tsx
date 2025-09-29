export default function Error({ message }: { message?: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <p className="text-center text-gray-500">
        <span className="inline-flex items-center gap-2 font-semibold text-red-600">
          <svg
            className="h-5 w-5 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01"
            />
          </svg>
          {message ?? "Error retrieving data"}
        </span>
      </p>
    </div>
  );
}
