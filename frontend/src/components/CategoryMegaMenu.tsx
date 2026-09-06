import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { Footprints, Shirt } from 'lucide-react';
import { CATEGORY_TREE, type Gender } from '@/lib/categories';

function SubTile({ gender, department, sub }: { gender: Gender; department: 'clothing' | 'footwear'; sub: { slug: string; fa: string; en: string; key?: string } }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - .5) * 8);
    rx.set(((e.clientY - r.top) / r.height - .5) * -8);
  };
  return <motion.a ref={ref} href={`/shop?department=${department}&gender=${gender}&subcategory=${sub.slug}`} onMouseMove={onMove} onMouseLeave={() => { rx.set(0); ry.set(0); }} style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }} whileHover={reduceMotion ? undefined : { scale: 1.04, y: -3 }} className="glass rounded-2xl p-3 flex flex-col gap-2 group">
    <div className="aspect-[1.2] rounded-xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent grid place-items-center"><span className="text-xl font-black gold-text">{sub.fa.slice(0, 1)}</span></div>
    <span className="text-xs text-center font-medium group-hover:font-bold group-hover:text-primary transition-all">{sub.fa}</span>
  </motion.a>;
}

export default function CategoryMegaMenu({ gender }: { gender: Gender }) {
  const branches = CATEGORY_TREE.map((d) => ({ ...d, branch: d.branches.find((b) => b.gender === gender)! })).filter((d) => d.branch);
  return <motion.div initial={{ opacity: 0, y: 8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} transition={{ duration: .22, ease: [0.16, 1, 0.3, 1] }} className="glass-strong rounded-3xl p-5 w-[min(760px,92vw)] shadow-2xl">
    <div className="flex items-center justify-between mb-5"><div><p className="text-[10px] text-primary font-bold tracking-widest">ORIGINALY CATEGORY</p><h3 className="font-black text-xl mt-1">انتخاب {gender === 'men' ? 'مردانه' : 'زنانه'}</h3></div><Link to={`/shop?gender=${gender}`} className="text-xs text-primary">مشاهده همه ←</Link></div>
    <div className="grid md:grid-cols-2 gap-5">
      {branches.map((d) => <section key={d.department}><div className="flex items-center gap-2 mb-3">{d.department === 'clothing' ? <Shirt className="w-4 h-4 text-primary" /> : <Footprints className="w-4 h-4 text-primary" />}<span className="font-bold text-sm">{d.fa}</span></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{d.branch.subcategories.map((s) => <SubTile key={s.slug} gender={gender} department={d.department} sub={s} />)}</div></section>)}
    </div>
  </motion.div>;
}
