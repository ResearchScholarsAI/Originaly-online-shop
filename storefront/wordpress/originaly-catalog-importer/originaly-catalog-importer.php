<?php
/**
 * Plugin Name: Originaly Catalogue Importer
 * Description: Imports 29 confirmed products as drafts and preserves 43 legacy listings as published, unpriced and out of stock for owner review.
 * Version: 1.1.0
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * Requires Plugins: woocommerce
 * Author: Originaly
 * License: GPL-2.0-or-later
 * Text Domain: originaly-catalog-importer
 */
defined( 'ABSPATH' ) || exit;

add_action( 'admin_menu', function () {
	add_submenu_page(
		'woocommerce',
		'ورود کاتالوگ Originaly',
		'کاتالوگ Originaly',
		'manage_woocommerce',
		'originaly-catalog-importer',
		'originaly_catalog_importer_page'
	);
} );

/** Always show out-of-stock entries in this dedicated storefront. */
add_filter( 'pre_option_woocommerce_hide_out_of_stock_items', function () {
	return 'no';
} );

function originaly_catalog_entries() {
	$file = plugin_dir_path( __FILE__ ) . 'catalog.json';
	if ( ! is_readable( $file ) ) {
		return new WP_Error( 'catalog_missing', 'فایل catalog.json در بستهٔ افزونه موجود نیست.' );
	}
	$data = json_decode( file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	if ( ! is_array( $data ) ) {
		return new WP_Error( 'catalog_invalid', 'ساختار کاتالوگ معتبر نیست.' );
	}
	return array_values( array_filter( $data, function ( $row ) {
		if ( ! is_array( $row ) || empty( $row['sku'] ) || empty( $row['name_fa'] ) || empty( $row['image'] ) ) {
			return false;
		}
		if ( 'under_review' === ( $row['catalog_status'] ?? '' ) ) {
			return 0 === (int) ( $row['stock'] ?? -1 )
				&& null === ( $row['price_toman'] ?? null )
				&& 'در حال بررسی' === ( $row['size'] ?? '' );
		}
		return 'available' === ( $row['catalog_status'] ?? '' )
			&& isset( $row['price_toman'], $row['stock'], $row['size'] )
			&& (float) $row['price_toman'] > 0
			&& (int) $row['stock'] > 0
			&& '' !== trim( (string) $row['size'] )
			&& false === strpos( (string) $row['size'], ',' );
	} ) );
}

function originaly_catalog_category_id( $name ) {
	$name = sanitize_text_field( $name );
	$term = term_exists( $name, 'product_cat' );
	if ( ! $term ) {
		$term = wp_insert_term( $name, 'product_cat' );
	}
	if ( is_wp_error( $term ) ) {
		return 0;
	}
	return (int) ( is_array( $term ) ? $term['term_id'] : $term );
}

function originaly_catalog_attach_image( $relative_path, $product_id ) {
	$source = plugin_dir_path( __FILE__ ) . ltrim( (string) $relative_path, '/' );
	if ( ! is_file( $source ) || ! is_readable( $source ) ) {
		return new WP_Error( 'image_missing', 'تصویر محصول در بستهٔ افزونه پیدا نشد.' );
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$uploads = wp_upload_dir();
	if ( ! empty( $uploads['error'] ) ) {
		return new WP_Error( 'upload_unavailable', 'پوشهٔ بارگذاری WordPress در دسترس نیست.' );
	}
	$folder = trailingslashit( $uploads['basedir'] ) . 'originaly-products';
	if ( ! wp_mkdir_p( $folder ) ) {
		return new WP_Error( 'upload_folder', 'ساخت پوشهٔ تصویر محصول ممکن نشد.' );
	}
	$filename = sanitize_file_name( basename( $source ) );
	$target = trailingslashit( $folder ) . $filename;
	$hash = hash_file( 'sha256', $source );
	$existing = get_posts( array(
		'post_type'      => 'attachment',
		'post_status'    => 'inherit',
		'posts_per_page' => 1,
		'fields'         => 'ids',
		'meta_key'       => '_originaly_source_hash', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
		'meta_value'     => $hash, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
	) );
	if ( $existing ) {
		return (int) $existing[0];
	}
	if ( ! copy( $source, $target ) ) {
		return new WP_Error( 'image_copy', 'کپی تصویر محصول به کتابخانهٔ رسانه انجام نشد.' );
	}
	$filetype = wp_check_filetype( $filename, null );
	if ( empty( $filetype['type'] ) || 0 !== strpos( $filetype['type'], 'image/' ) ) {
		wp_delete_file( $target );
		return new WP_Error( 'image_type', 'نوع فایل تصویر پشتیبانی نمی‌شود.' );
	}
	$attachment_id = wp_insert_attachment(
		array(
			'post_mime_type' => $filetype['type'],
			'post_title'     => sanitize_text_field( get_post_field( 'post_title', $product_id ) . ' — تصویر کالا' ),
			'post_status'    => 'inherit',
		),
		$target,
		$product_id,
		true
	);
	if ( is_wp_error( $attachment_id ) ) {
		wp_delete_file( $target );
		return $attachment_id;
	}
	update_post_meta( $attachment_id, '_originaly_source_hash', $hash );
	$metadata = wp_generate_attachment_metadata( $attachment_id, $target );
	if ( is_array( $metadata ) ) {
		wp_update_attachment_metadata( $attachment_id, $metadata );
	}
	return (int) $attachment_id;
}

/**
 * A reviewed legacy listing becomes sale-eligible only after the owner enters a current positive price,
 * positive stock, and one non-empty visible size attribute in the WooCommerce editor.
 */
function originaly_catalog_needs_review( $product ) {
	if ( ! $product instanceof WC_Product || 'under_review' !== get_post_meta( $product->get_id(), '_originaly_catalog_status', true ) ) {
		return false;
	}
	$size = trim( (string) $product->get_attribute( 'سایز' ) );
	return (float) $product->get_price() <= 0
		|| (int) $product->get_stock_quantity() <= 0
		|| ! $product->is_in_stock()
		|| '' === $size
		|| false !== strpos( $size, ',' );
}

function originaly_mark_catalog_owner_edit( $product_id ) {
	if ( 'yes' === get_post_meta( $product_id, '_originaly_catalog_import', true ) ) {
		update_post_meta( $product_id, '_originaly_owner_managed', 'yes' );
	}
}
add_action( 'woocommerce_process_product_meta', 'originaly_mark_catalog_owner_edit' );

/** Keep imported products simple; never allow legacy items to be bought until explicitly completed by the owner. */
function originaly_block_variable_purchases( $purchasable, $product ) {
	if ( $product instanceof WC_Product && $product->is_type( 'variable' ) ) {
		return false;
	}
	if ( originaly_catalog_needs_review( $product ) ) {
		return false;
	}
	return $purchasable;
}
add_filter( 'woocommerce_is_purchasable', 'originaly_block_variable_purchases', 10, 2 );

function originaly_catalog_review_badge() {
	global $product;
	if ( originaly_catalog_needs_review( $product ) ) {
		echo '<span class="originaly-review-badge">ناموجود · اطلاعات در حال بازبینی</span>';
	}
}
add_action( 'woocommerce_before_shop_loop_item_title', 'originaly_catalog_review_badge', 8 );
add_action( 'woocommerce_before_single_product_summary', 'originaly_catalog_review_badge', 5 );

function originaly_catalog_import_entries( $rows ) {
	if ( ! class_exists( 'WooCommerce' ) || ! class_exists( 'WC_Product_Simple' ) ) {
		return new WP_Error( 'woocommerce_required', 'ابتدا افزونهٔ WooCommerce را فعال کنید.' );
	}
	$created = 0;
	$updated = 0;
	$skipped = array();
	$errors = array();
	foreach ( $rows as $row ) {
		$sku = sanitize_text_field( $row['sku'] );
		$under_review = 'under_review' === $row['catalog_status'];
		$existing_id = wc_get_product_id_by_sku( $sku );
		$owned = $existing_id && 'yes' === get_post_meta( $existing_id, '_originaly_catalog_import', true );
		if ( $existing_id && ! $owned ) {
			$skipped[] = $sku . ' (SKU قبلاً در WooCommerce استفاده شده است)';
			continue;
		}
		if ( $owned && 'yes' === get_post_meta( $existing_id, '_originaly_owner_managed', true ) ) {
			$skipped[] = $sku . ' (مدیر جزئیات این کالا را ویرایش کرده؛ برای جلوگیری از بازنویسی حفظ شد)';
			continue;
		}
		$product = $owned ? wc_get_product( $existing_id ) : new WC_Product_Simple();
		if ( ! $product ) {
			$errors[] = $sku . ' (خواندن رکورد قبلی ناموفق بود)';
			continue;
		}
		$product->set_name( sanitize_text_field( $row['name_fa'] ) );
		$product->set_slug( sanitize_title( $row['slug'] ?? $row['sku'] ) );
		$product->set_sku( $sku );
		if ( ! $owned ) {
			$product->set_status( $under_review ? 'publish' : 'draft' );
		}
		$product->set_catalog_visibility( 'visible' );
		$product->set_description( wp_kses_post( $row['description_fa'] ?? '' ) );
		$product->set_short_description( $under_review ? 'از کاتالوگ قبلی؛ ناموجود و در انتظار تکمیل اطلاعات توسط فروشگاه.' : sanitize_text_field( $row['brand'] ?? '' ) . ' — سایز ثابت: ' . sanitize_text_field( $row['size'] ) );
		if ( $under_review ) {
			$product->set_regular_price( '' );
			$product->set_sale_price( '' );
			$product->set_price( '' );
			$product->set_manage_stock( true );
			$product->set_stock_quantity( 0 );
			$product->set_stock_status( 'outofstock' );
			$product->set_attributes( array() );
		} else {
			$product->set_regular_price( wc_format_decimal( $row['price_toman'] ) );
			$product->set_price( wc_format_decimal( $row['price_toman'] ) );
			$product->set_manage_stock( true );
			$product->set_stock_quantity( absint( $row['stock'] ) );
			$product->set_stock_status( 'instock' );
			$product->set_sold_individually( false );
			$attributes = array();
			foreach ( array( 'برند' => sanitize_text_field( $row['brand'] ?? '' ), 'سایز' => sanitize_text_field( $row['size'] ) ) as $name => $value ) {
				if ( '' === $value ) {
					continue;
				}
				$attribute = new WC_Product_Attribute();
				$attribute->set_name( $name );
				$attribute->set_options( array( $value ) );
				$attribute->set_visible( true );
				$attribute->set_variation( false );
				$attributes[] = $attribute;
			}
			$product->set_attributes( $attributes );
		}
		$product->set_reviews_allowed( false );
		$category_name = 'footwear' === ( $row['department'] ?? '' ) ? 'کفش' : 'پوشاک';
		$category_id = originaly_catalog_category_id( $category_name );
		if ( $category_id ) {
			$product->set_category_ids( array( $category_id ) );
		}
		$product_id = $product->save();
		if ( ! $product_id ) {
			$errors[] = $sku . ' (ذخیرهٔ محصول ناموفق بود)';
			continue;
		}
		update_post_meta( $product_id, '_originaly_catalog_import', 'yes' );
		update_post_meta( $product_id, '_originaly_catalog_status', $under_review ? 'under_review' : 'available' );
		update_post_meta( $product_id, '_originaly_source_note', sanitize_text_field( $row['source_note'] ?? '' ) );
		if ( $under_review ) {
			update_post_meta( $product_id, '_originaly_source_price_toman', sanitize_text_field( (string) ( $row['recorded_old_price_toman'] ?? '' ) ) );
			update_post_meta( $product_id, '_originaly_source_size', sanitize_text_field( (string) ( $row['recorded_old_size'] ?? '' ) ) );
			update_post_meta( $product_id, '_originaly_source_brand', sanitize_text_field( (string) ( $row['recorded_old_brand'] ?? '' ) ) );
		} else {
			update_post_meta( $product_id, '_originaly_price_toman', wc_format_decimal( $row['price_toman'] ) );
		}
		if ( ! has_post_thumbnail( $product_id ) && ! empty( $row['image'] ) ) {
			$image_id = originaly_catalog_attach_image( $row['image'], $product_id );
			if ( is_wp_error( $image_id ) ) {
				$errors[] = $sku . ' (تصویر: ' . $image_id->get_error_message() . ')';
			} else {
				$product->set_image_id( $image_id );
				$product->save();
			}
		}
		if ( $owned ) {
			++$updated;
		} else {
			++$created;
		}
	}
	return array( 'created' => $created, 'updated' => $updated, 'skipped' => $skipped, 'errors' => $errors );
}

function originaly_catalog_importer_page() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_die( esc_html__( 'دسترسی کافی ندارید.', 'originaly-catalog-importer' ) );
	}
	$rows = originaly_catalog_entries();
	$result = null;
	if ( isset( $_POST['originaly_import_action'] ) && 'import-catalog' === sanitize_key( wp_unslash( $_POST['originaly_import_action'] ) ) ) {
		check_admin_referer( 'originaly_catalog_import' );
		$confirmed = isset( $_POST['confirm_toman'] ) && '1' === sanitize_text_field( wp_unslash( $_POST['confirm_toman'] ) );
		if ( ! $confirmed ) {
			$result = new WP_Error( 'unit_confirmation', 'برای جلوگیری از خطای مبلغ، تأیید واحد قیمت (تومان) الزامی است.' );
		} elseif ( is_wp_error( $rows ) ) {
			$result = $rows;
		} else {
			$result = originaly_catalog_import_entries( $rows );
		}
	}
	$currency = function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'WooCommerce نصب نیست';
	$available = is_array( $rows ) ? count( array_filter( $rows, function ( $row ) { return 'available' === $row['catalog_status']; } ) ) : 0;
	$review = is_array( $rows ) ? count( array_filter( $rows, function ( $row ) { return 'under_review' === $row['catalog_status']; } ) ) : 0;
	?>
	<div class="wrap">
		<h1>ورود کاتالوگ Originaly</h1>
		<p>همهٔ محصولات قدیمی حفظ می‌شوند: کالاهای درحال‌بازبینی به‌صورت <strong>منتشرشده، بدون قیمت و ناموجود</strong> می‌مانند تا مشتری آن‌ها را ببیند اما نتواند بخرد. کالاهای تأییدشده به‌صورت <strong>پیش‌نویس</strong> می‌آیند تا مالک پس از تنظیم/آزمون checkout آن‌ها را منتشر کند.</p>
		<?php if ( is_wp_error( $rows ) ) : ?>
			<div class="notice notice-error"><p><?php echo esc_html( $rows->get_error_message() ); ?></p></div>
		<?php else : ?>
			<div class="notice notice-info inline"><p>تأییدشده و آمادهٔ بازبینی انتشار: <strong><?php echo esc_html( (string) $available ); ?></strong> | قدیمی/نیازمند بررسی و ناموجود: <strong><?php echo esc_html( (string) $review ); ?></strong> | ارز WooCommerce: <strong><?php echo esc_html( $currency ); ?></strong>.</p></div>
			<p>مبالغ ۲۹ کالای تأییدشده برحسب <strong>تومان</strong> هستند. قیمت قدیمی ۴۳ کالا فقط در جدول زیر و با برچسب «تأییدنشده» برای مالک دیده می‌شود؛ در صفحهٔ عمومی قیمت/سایز آن‌ها پنهان می‌ماند.</p>
			<div class="notice notice-warning inline"><p>برای آنکه کاتالوگ حفظ شود، گزینهٔ WooCommerce «مخفی‌کردن محصولات ناموجود از کاتالوگ» هنگام فعال‌بودن این افزونه روی خاموش override می‌شود. برای فعال‌کردن کالای قدیمی، اطلاعات فعلی، یک سایز یکتا، قیمت واقعی و موجودی فیزیکی را در ویرایشگر محصول تکمیل کنید.</p></div>
			<?php if ( $result instanceof WP_Error ) : ?>
				<div class="notice notice-error"><p><?php echo esc_html( $result->get_error_message() ); ?></p></div>
			<?php elseif ( is_array( $result ) ) : ?>
				<div class="notice notice-success"><p><?php echo esc_html( sprintf( 'ایجاد: %1$d | به‌روزرسانی: %2$d | ردشده/ویرایش‌شده توسط مدیر: %3$d | خطاهای بررسی: %4$d', $result['created'], $result['updated'], count( $result['skipped'] ), count( $result['errors'] ) ) ); ?></p></div>
				<?php if ( $result['skipped'] || $result['errors'] ) : ?><details><summary>جزئیات موارد ردشده/خطادار</summary><ul><?php foreach ( array_merge( $result['skipped'], $result['errors'] ) as $item ) : ?><li><?php echo esc_html( $item ); ?></li><?php endforeach; ?></ul></details><?php endif; ?>
			<?php endif; ?>
			<table class="widefat striped" style="max-width:1200px;margin:18px 0"><thead><tr><th>SKU</th><th>نام</th><th>وضعیت</th><th>سایز فعلی</th><th>قیمت فعال (تومان)</th><th>قیمت قدیمی، تأییدنشده</th><th>سایز قدیمی، تأییدنشده</th></tr></thead><tbody>
			<?php foreach ( $rows as $row ) : ?><tr><td><?php echo esc_html( $row['sku'] ); ?></td><td><?php echo esc_html( $row['name_fa'] ); ?></td><td><?php echo 'available' === $row['catalog_status'] ? 'تأییدشده · پیش‌نویس' : 'درحال‌بازبینی · ناموجود'; ?></td><td><?php echo esc_html( 'available' === $row['catalog_status'] ? $row['size'] : 'در انتظار بازبینی' ); ?></td><td><?php echo esc_html( 'available' === $row['catalog_status'] ? number_format_i18n( (float) $row['price_toman'] ) : '—' ); ?></td><td><?php echo esc_html( null !== ( $row['recorded_old_price_toman'] ?? null ) ? number_format_i18n( (float) $row['recorded_old_price_toman'] ) . ' (قدیمی)' : '—' ); ?></td><td><?php echo esc_html( (string) ( $row['recorded_old_size'] ?? '—' ) ); ?></td></tr><?php endforeach; ?>
			</tbody></table>
			<form method="post">
				<?php wp_nonce_field( 'originaly_catalog_import' ); ?>
				<p><label><input type="checkbox" name="confirm_toman" value="1" required> تأیید می‌کنم قیمت کالاهای تأییدشده با واحد پول WooCommerce سازگار است. قیمت‌های قدیمی فقط جهت بررسی بوده و برای مشتری قیمت محسوب نمی‌شوند.</label></p>
				<input type="hidden" name="originaly_import_action" value="import-catalog">
				<?php submit_button( 'ورود محصولات و تصاویر (قدیمی‌ها ناموجود بمانند)', 'primary', 'submit', true, array( 'onclick' => "return confirm('کالاهای قدیمی با قیمت خالی و موجودی صفر منتشر می‌شوند؛ کالاهای تأییدشده Draft می‌مانند. ادامه می‌دهید؟');" ) ); ?>
			</form>
		<?php endif; ?>
		<p>پس از import، پیش‌نویس‌های تأییدشده را پیش از انتشار بررسی کنید. کالاهای قدیمی در Products باقی می‌مانند؛ هر کالا را پس از راستی‌آزمایی اطلاعات و عکس جداگانه ویرایش، قیمت و سایز واقعی را ثبت و موجودی را به‌روزرسانی کنید. import مجدد، محصولاتی را که مدیر ویرایش کرده دست‌نخورده می‌گذارد.</p>
	</div>
	<?php
}
