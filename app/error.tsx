"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
      <div>
        <h1 className="text-3xl font-bold">Something went sideways</h1>
        <p className="mt-3 max-w-xl text-slate-400">{error.message}</p>
        <button onClick={reset} className="mt-6 rounded-md bg-rose-600 px-5 py-3 font-semibold text-white">
          Try again
        </button>
      </div>
    </main>
  );
}
