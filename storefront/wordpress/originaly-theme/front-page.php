<?php
/** Homepage template. */
defined( 'ABSPATH' ) || exit;
get_header();
$hero = get_theme_file_uri( 'assets/images/hero-cinematic.jpg' );
$shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
?>
<section class="hero" style="--hero-image:url('<?php echo esc_url( $hero ); ?>')">
	<div class="hero-content wrap">
		<p class="eyebrow">ORIGINALY / CURATED GOODS</p>
		<h1>انتخاب روشن.<br><span>بدون ادعای اضافه.</span></h1>
		<p class="hero-copy">کالای تأییدشده با سایز و قیمت روشن؛ محصولات فهرست قبلی هم حذف نشده‌اند و تا بررسی مالک، ناموجود می‌مانند.</p>
		<div class="hero-actions"><a class="button button-primary" href="<?php echo esc_url( $shop_url ); ?>">ورود به فروشگاه <span aria-hidden="true">↙</span></a><a class="button button-quiet" href="#latest-products">محصولات موجود</a></div>
		<div class="hero-facts"><span>سایز مشخص برای کالای فعال</span><span>قیمت شفاف</span><span>پرداخت و ارسال طبق تنظیم فروشگاه</span></div>
	</div>
	<div class="hero-mark" aria-hidden="true">O</div>
</section>

<?php if ( class_exists( 'WooCommerce' ) ) : ?>
	<section id="latest-products" class="wrap section-block">
		<div class="section-heading"><div><p class="eyebrow">VERIFIED / IN STOCK</p><h2>انتخاب‌های موجود</h2><p>فقط محصولات تأییدشده و دارای موجودی ثبت‌شده در این قفسه نمایش داده می‌شوند.</p></div><a class="text-link" href="<?php echo esc_url( $shop_url ); ?>">مشاهدهٔ همه <span aria-hidden="true">←</span></a></div>
		<?php $products = wc_get_products( array( 'status' => 'publish', 'limit' => 8, 'stock_status' => 'instock', 'orderby' => 'date', 'order' => 'DESC' ) ); ?>
		<?php if ( $products ) : ?>
			<ul class="products columns-4 originaly-products">
				<?php foreach ( $products as $product ) : ?>
					<?php $GLOBALS['product'] = $product; ?>
					<?php wc_get_template_part( 'content', 'product' ); ?>
				<?php endforeach; ?>
			</ul>
		<?php else : ?>
			<div class="empty-state"><h3>هنوز کالای تأییدشده‌ای منتشر نشده است.</h3><p>پس از تنظیم درگاه و بازبینی پیش‌نویس‌ها، محصولات موجود در این بخش ظاهر می‌شوند.</p></div>
		<?php endif; ?>
	</section>

	<section id="catalog-review" class="wrap section-block">
		<div class="section-heading"><div><p class="eyebrow">ARCHIVE / OWNER REVIEW</p><h2>از کاتالوگ قبلی؛ فعلاً ناموجود</h2><p>محصولات پیشین حفظ شده‌اند؛ قیمت و سایز تأییدنشدهٔ آن‌ها به مشتری نشان داده نمی‌شود و خرید ممکن نیست.</p></div></div>
		<?php $review_products = wc_get_products( array( 'status' => 'publish', 'limit' => 8, 'stock_status' => 'outofstock', 'meta_key' => '_originaly_catalog_status', 'meta_value' => 'under_review', 'orderby' => 'date', 'order' => 'DESC' ) ); ?>
		<?php if ( $review_products ) : ?>
			<ul class="products columns-4 originaly-products">
				<?php foreach ( $review_products as $product ) : ?>
					<?php $GLOBALS['product'] = $product; ?>
					<?php wc_get_template_part( 'content', 'product' ); ?>
				<?php endforeach; ?>
			</ul>
		<?php else : ?>
			<div class="empty-state"><h3>صف محصولات در انتظار بررسی</h3><p>پس از اجرای import، محصولات قدیمی به‌صورت ناموجود در این بخش نمایش داده می‌شوند.</p></div>
		<?php endif; ?>
	</section>
<?php else : ?>
	<section class="wrap section-block"><div class="empty-state"><h3>برای فعال‌شدن فروشگاه، افزونهٔ WooCommerce را نصب کنید.</h3><p>تا آن زمان می‌توانید طراحی صفحهٔ اصلی و قالب را پیش‌نمایش کنید.</p></div></section>
<?php endif; ?>

<section class="wrap feature-strip">
	<div><span class="feature-index">01</span><div><h2>سایز ثبت‌شده</h2><p>محصولات فعال ساده و تک‌سایز هستند؛ کالاهای مبهم تا بررسی، خریدپذیر نمی‌شوند.</p></div></div>
	<div><span class="feature-index">02</span><div><h2>قیمت نهایی</h2><p>قیمت قدیمیِ تأییدنشده برای مشتری پنهان می‌ماند؛ تخفیف ساختگی وجود ندارد.</p></div></div>
	<div><span class="feature-index">03</span><div><h2>تصمیم روشن</h2><p>روش‌های پرداخت، ارسال و مرجوعی باید پیش از فروش در WooCommerce پیکربندی شوند.</p></div></div>
</section>
<?php get_footer(); ?>
