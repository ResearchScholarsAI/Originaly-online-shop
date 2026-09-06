import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] grid place-items-center px-6 py-20 text-center">
      <div className="max-w-xl">
        <p className="text-sm tracking-[0.35em] uppercase text-primary">ORIGINALY</p>
        <h1 className="mt-4 text-6xl md:text-8xl font-black tracking-tight">404</h1>
        <p className="mt-5 text-muted-foreground">این صفحه پیدا نشد؛ اما مسیر بعدی شما همین‌جاست.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full px-6 py-3 bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          بازگشت به فروشگاه
        </Link>
      </div>
    </main>
  );
}
