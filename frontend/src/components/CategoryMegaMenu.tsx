import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Shirt, Footprints } from 'lucide-react';
import { CATEGORY_TREE, type Department } from '@/lib/categories';

function SubTile({ deptSlug, gender, sub }: { deptSlug: Department; gender: string; sub: { slug: string; fa: string; en: string; thumbnail?: string } }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 10);
    rx.set(py * -10);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={`/shop?department=${deptSlug}&gender=${gender}&sub=${sub.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="glass rounded-2xl p-3 flex flex-col gap-2 group"
    >
      <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/25 via-accent/15 to-transparent grid place-items-center overflow-hidden">
        {sub.thumbnail ? (
          <img src={sub.thumbnail} alt={sub.fa} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-black gold-text">{sub.fa.slice(0, 1)}</span>
        )}
      </div>
      <span className="text-xs text-center font-medium transition-all group-hover:font-bold group-hover:gold-text">
        {sub.fa}
      </span>
    </motion.a>
  );
}

export default function CategoryMegaMenu({ department }: { department: Department }) {
  const tree = CATEGORY_TREE.find((d) => d.department === department);
  const [activeGender, setActiveGender] = useState(tree?.branches[0]?.gender ?? 'men');
  if (!tree) return null;
  const branch = tree.branches.find((b) => b.gender === activeGender) ?? tree.branches[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong rounded-3xl p-5 w-[min(680px,90vw)]"
    >
      <div className="flex items-center gap-2 mb-4">
        {tree.icon === 'shirt' ? <Shirt className="w-4 h-4 text-primary" /> : <Footprints className="w-4 h-4 text-primary" />}
        <h3 className="font-bold gold-text">{tree.fa}</h3>
        <div className="flex-1" />
        <div className="flex gap-1">
          {tree.branches.map((b) => (
            <button
              key={b.gender}
              onClick={() => setActiveGender(b.gender)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                activeGender === b.gender ? 'active-chip' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {b.fa}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeGender}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18 }}
          className="grid grid-cols-3 sm:grid-cols-4 gap-3"
        >
          {branch?.subcategories.map((sub) => (
            <SubTile key={sub.slug} deptSlug={tree.department} gender={branch.gender} sub={sub} />
          ))}
        </motion.div>
      </AnimatePresence>

      <Link
        to={`/shop?department=${tree.department}&gender=${activeGender}`}
        className="mt-4 block text-center text-xs text-primary hover:underline"
      >
        مشاهده همه {tree.fa} {branch?.fa} ←
      </Link>
    </motion.div>
  );
}
