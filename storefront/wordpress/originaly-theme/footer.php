<?php
/** Footer template for the Originaly WooCommerce theme. */
defined( 'ABSPATH' ) || exit;
$shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
$about_page = get_page_by_path( 'about' );
$privacy_url = function_exists( 'get_privacy_policy_url' ) ? get_privacy_policy_url() : '';
$terms_page_id = function_exists( 'wc_get_page_id' ) ? wc_get_page_id( 'terms' ) : 0;
?>
		</main>
		<footer class="site-footer">
			<div class="footer-grid">
				<div>
					<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>"><span class="brand-mark" aria-hidden="true">O</span><span class="brand-word">ORIGINALY<small>فروشگاه کفش و پوشاک</small></span></a>
					<p class="footer-note">تجربهٔ خرید ساده با قیمت و سایز ثبت‌شده برای هر کالا.</p>
				</div>
				<div><h2>فروشگاه</h2><a href="<?php echo esc_url( $shop_url ); ?>">مشاهدهٔ محصولات</a><?php if ( function_exists( 'wc_get_page_permalink' ) ) : ?><a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>">حساب کاربری</a><?php endif; ?></div>
				<div><h2>اطلاعات</h2><?php if ( $about_page instanceof WP_Post ) : ?><a href="<?php echo esc_url( get_permalink( $about_page ) ); ?>">دربارهٔ ما</a><?php endif; ?><?php if ( $privacy_url ) : ?><a href="<?php echo esc_url( $privacy_url ); ?>">حریم خصوصی</a><?php endif; ?><?php if ( $terms_page_id > 0 ) : ?><a href="<?php echo esc_url( get_permalink( $terms_page_id ) ); ?>">شرایط فروش</a><?php endif; ?></div>
			</div>
			<div class="footer-bottom"><span>© <?php echo esc_html( current_time( 'Y' ) ); ?> <?php echo esc_html( get_bloginfo( 'name' ) ); ?></span><span>شرایط پرداخت و ارسال در صفحهٔ تسویه نمایش داده می‌شود.</span></div>
		</footer>
	</div>
	<?php wp_footer(); ?>
	</body>
</html>
