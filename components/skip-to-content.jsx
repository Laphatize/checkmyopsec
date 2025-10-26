'use client';

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white dark:focus:bg-white dark:focus:text-zinc-900 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
    >
      Skip to main content
    </a>
  );
}
