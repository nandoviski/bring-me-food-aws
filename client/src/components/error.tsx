import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export default function Error({
  message,
  fetchingError,
}: {
  message?: string;
  fetchingError?: FetchBaseQueryError | SerializedError;
}) {
  let displayMessage = message;
  const err: any = fetchingError;
  if (err?.data?.message) displayMessage = String(err.data.message);
  else if (err?.error) displayMessage = String(err.error);
  else if (err?.message) displayMessage = String(err.message);

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
          {displayMessage ?? "Error retrieving data"}
        </span>
      </p>
    </div>
  );
}
