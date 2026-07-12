"use client";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="glass max-w-md rounded-lg p-8 text-center">
        <p className="text-sm text-rose-300">خطا</p>
        <h1 className="mt-3 text-2xl font-bold">مشکلی پیش آمد</h1>
        <p className="mt-3 text-sm text-slate-300">{error.message || "درخواست شما کامل نشد."}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-md bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#111318]"
        >
          تلاش دوباره
        </button>
      </div>
    </main>
  );
}
