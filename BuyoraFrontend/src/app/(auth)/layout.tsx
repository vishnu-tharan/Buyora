import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-1/2 -right-1/4 h-[1000px] w-[1000px] rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute -bottom-1/2 -left-1/4 h-[1000px] w-[1000px] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="text-primary flex justify-center text-3xl font-bold">
          Buyora
        </Link>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-gray-100 bg-white px-4 py-8 shadow-sm sm:rounded-xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
