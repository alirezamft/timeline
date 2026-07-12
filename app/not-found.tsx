import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="glass max-w-md rounded-lg p-8 text-center">
        <p className="text-sm text-[#C9A84C]">۴۰۴</p>
        <h1 className="mt-3 text-2xl font-bold">صفحه پیدا نشد</h1>
        <p className="mt-3 text-sm text-slate-300">آدرس واردشده وجود ندارد یا به آن دسترسی ندارید.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#111318]"
        >
          بازگشت به داشبورد
        </Link>
      </div>
    </main>
  );
}
