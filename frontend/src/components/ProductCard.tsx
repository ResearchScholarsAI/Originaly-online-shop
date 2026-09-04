import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { formatToman, faDigits, discountPercent, type Product } from '@/lib/store';

export default function ProductCard({ product }: { product: Product }) {
  const off = discountPercent(product);
  return (
    <Link to={`/product/${product.slug}`} className="card-3d glass rounded-3xl overflow-hidden block group">
      <div className="relative h-56 overflow-hidden bg-black/40">
        <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover img-3d" />
        {off ? (
          <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-2.5 py-1">
            ٪{faDigits(off)} تخفیف
          </span>
        ) : null}
        {product.stock <= 0 && (
          <span className="absolute inset-0 grid place-items-center bg-black/60 text-sm font-bold">ناموجود</span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <p className="text-[11px] text-primary/80">{product.brand}</p>
        <h3 className="font-bold text-sm leading-6 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
          {faDigits(Number(product.rating || 0).toFixed(1))}
          <span className="mx-1">•</span>
          {faDigits(product.sold ?? 0)} فروش
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-black text-primary">{formatToman(product.price)}</span>
          {product.old_price ? <span className="text-xs text-muted-foreground line-through">{formatToman(product.old_price)}</span> : null}
        </div>
      </div>
    </Link>
  );
}