import { describe, expect, it } from 'vitest';
import { discountPercent, formatPrice, getProduct, products } from '../client/src/lib/catalog';

describe('Originaly catalog', () => {
  it('ships with a curated multi-category catalog', () => {
    expect(products.length).toBeGreaterThanOrEqual(8);
    expect(new Set(products.map((product) => product.category))).toEqual(new Set(['کفش', 'پوشاک', 'اکسسوری']));
  });

  it('resolves product slugs and formats Persian prices', () => {
    const product = getProduct('adidas-ultraboost-20-orange');
    expect(product?.brand).toBe('adidas');
    expect(formatPrice(6890000)).toContain('۶٬۸۹۰٬۰۰۰');
  });

  it('calculates sale percentages only for discounted products', () => {
    expect(discountPercent(products[0])).toBe(14);
    expect(discountPercent(products[2])).toBe(0);
  });
});
