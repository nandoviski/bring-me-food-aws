import React from "react";

interface NotFoundProps {
  message: string;
}

export default function NotFound({ message }: NotFoundProps) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg bg-gray-50 p-8 text-gray-700 shadow-md">
      <svg
        width="64"
        height="64"
        fill="none"
        viewBox="0 0 24 24"
        className="mb-4 opacity-70"
      >
        <circle cx="12" cy="12" r="10" stroke="#bbb" strokeWidth="2" />
        <path
          d="M9 9l6 6M15 9l-6 6"
          stroke="#bbb"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <h2 className="m-0 font-medium">{message}</h2>
    </div>
  );
}
