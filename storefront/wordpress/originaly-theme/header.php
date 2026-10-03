<?php
/** Header template for the Originaly WooCommerce theme. */
defined( 'ABSPATH' ) || exit;
$shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
$cart_url = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/' );
$cart_count = function_exists( 'WC' ) && WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
?>
<!doctype html>
<html <?php language_attributes(); ?> dir="rtl">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'originaly-theme' ); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main-content"><?php esc_html_e( 'رفتن به محتوای اصلی', 'originaly' ); ?></a>
<div class="site-shell">
	<header class="site-header">
		<div class="header-inner">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php else : ?>
				<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
					<span class="brand-mark" aria-hidden="true">O</span>
					<span class="brand-word">ORIGINALY<small>فروشگاه کفش و پوشاک</small></span>
			</a>
			<?php endif; ?>
			<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="بازکردن منو"><span></span><span></span></button>
			<nav class="primary-navigation" id="primary-navigation" aria-label="ناوبری اصلی">
				<?php
				wp_nav_menu( array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => 'primary-menu',
					'fallback_cb'    => 'originaly_fallback_menu',
				) );
				?>
			</nav>
			<div class="header-actions">
				<form class="product-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
					<label class="screen-reader-text" for="originaly-search">جست‌وجوی محصول</label>
					<input id="originaly-search" type="search" name="s" placeholder="جست‌وجوی محصول" value="<?php echo esc_attr( get_search_query() ); ?>">
					<input type="hidden" name="post_type" value="product">
				</form>
				<a class="cart-link" href="<?php echo esc_url( $cart_url ); ?>" aria-label="سبد خرید، <?php echo esc_attr( (string) $cart_count ); ?> کالا">
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
					<span>سبد</span><b><?php echo esc_html( (string) $cart_count ); ?></b>
				</a>
			</div>
		</div>
		<div class="ticker" aria-label="اطلاعات فروشگاه"><span>ORIGINALY / DROP 04</span><i></i><span>قیمت روشن</span><i></i><span>سایز ثبت‌شدهٔ هر کالا</span><i></i><span>کفش و پوشاک</span></div>
	</header>
	<main id="main-content" class="site-main">
