<?php
/** Theme bootstrap and WooCommerce support. */
defined( 'ABSPATH' ) || exit;

define( 'ORIGINALY_THEME_VERSION', '1.0.0' );

function originaly_theme_setup() {
	load_theme_textdomain( 'originaly', get_template_directory() . '/languages' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'custom-logo', array( 'height' => 96, 'width' => 300, 'flex-height' => true, 'flex-width' => true ) );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
	register_nav_menus( array( 'primary' => 'منوی اصلی' ) );
}
add_action( 'after_setup_theme', 'originaly_theme_setup' );

function originaly_enqueue_assets() {
	$css_path = get_template_directory() . '/assets/css/theme.css';
	wp_enqueue_style( 'originaly-theme', get_stylesheet_uri(), array(), ORIGINALY_THEME_VERSION );
	wp_enqueue_style( 'originaly-components', get_template_directory_uri() . '/assets/css/theme.css', array( 'originaly-theme' ), file_exists( $css_path ) ? (string) filemtime( $css_path ) : ORIGINALY_THEME_VERSION );
	wp_enqueue_script( 'originaly-navigation', get_template_directory_uri() . '/assets/js/theme.js', array(), ORIGINALY_THEME_VERSION, true );
	if ( function_exists( 'is_product' ) && is_product() ) {
		wp_enqueue_script( 'originaly-product-lens', get_template_directory_uri() . '/assets/js/product-lens.js', array(), ORIGINALY_THEME_VERSION, true );
	}
}
add_action( 'wp_enqueue_scripts', 'originaly_enqueue_assets' );

function originaly_fallback_menu() {
	$shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
	echo '<ul class="primary-menu">';
	echo '<li><a href="' . esc_url( $shop_url ) . '">فروشگاه</a></li>';
	echo '<li><a href="' . esc_url( home_url( '/about/' ) ) . '">دربارهٔ ما</a></li>';
	echo '</ul>';
}

function originaly_mobile_body_class( $classes ) {
	$classes[] = 'theme-originaly';
	return $classes;
}
add_filter( 'body_class', 'originaly_mobile_body_class' );

/** Keep the imported one-size catalogue purchasable as simple products, never size variations. */
function originaly_block_variable_purchases( $purchasable, $product ) {
	if ( $product instanceof WC_Product && $product->is_type( 'variable' ) ) {
		return false;
	}
	return $purchasable;
}
add_filter( 'woocommerce_is_purchasable', 'originaly_block_variable_purchases', 10, 2 );

function originaly_simple_add_to_cart_text( $text, $product ) {
	return $product instanceof WC_Product && $product->is_in_stock() ? 'افزودن به سبد' : 'ناموجود';
}
add_filter( 'woocommerce_product_add_to_cart_text', 'originaly_simple_add_to_cart_text', 10, 2 );
add_filter( 'woocommerce_product_single_add_to_cart_text', function () { return 'افزودن به سبد'; } );

function originaly_product_card_size_attribute() {
	global $product;
	if ( ! $product instanceof WC_Product ) {
		return;
	}
	$size = $product->get_attribute( 'pa_size' );
	if ( '' === $size ) {
		$size = $product->get_attribute( 'سایز' );
	}
	if ( '' !== $size ) {
		echo '<p class="product-size-note"><span aria-hidden="true">↔</span> سایز ثبت‌شده: <strong>' . esc_html( $size ) . '</strong></p>';
	}
}
add_action( 'woocommerce_after_shop_loop_item_title', 'originaly_product_card_size_attribute', 8 );

function originaly_cart_count_fragment( $fragments ) {
	if ( function_exists( 'WC' ) && WC()->cart ) {
		$count = WC()->cart->get_cart_contents_count();
		$fragments['a.cart-link b'] = '<b>' . esc_html( (string) $count ) . '</b>';
	}
	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'originaly_cart_count_fragment' );
