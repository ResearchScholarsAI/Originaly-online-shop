<?php
/** WooCommerce page wrapper. WooCommerce keeps ownership of cart, account, checkout, and order logic. */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<div class="wrap section-block woocommerce-shell">
	<?php woocommerce_content(); ?>
</div>
<?php get_footer(); ?>
