import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
export default function NotFound() { return <div className="container py-32 text-center"><p className="eyebrow">404 / NOT FOUND</p><h1 className="display mt-4 text-6xl font-black">این مسیر<br/><span className="text-[var(--acid)]">اصل نیست.</span></h1><p className="mx-auto mt-5 max-w-md text-sm leading-8 text-white/45">صفحه‌ای که دنبالش بودی پیدا نشد؛ اما چیزهای خوبی برای کشف داریم.</p><Link href="/" className="btn-primary mt-8 inline-flex items-center gap-2">بازگشت به خانه <ArrowRight size={16}/></Link></div>; }
