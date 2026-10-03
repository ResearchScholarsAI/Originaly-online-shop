<?php
defined( 'ABSPATH' ) || exit;
get_header();
?>
<div class="wrap section-block content-layout">
	<?php if ( have_posts() ) : ?>
		<?php while ( have_posts() ) : the_post(); ?>
			<article <?php post_class( 'content-card' ); ?>>
				<?php if ( has_post_thumbnail() ) : ?><a href="<?php the_permalink(); ?>" class="content-card-image"><?php the_post_thumbnail( 'large' ); ?></a><?php endif; ?>
				<p class="eyebrow"><?php echo esc_html( get_post_type() ); ?></p>
				<h1><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
				<div class="entry-content"><?php the_excerpt(); ?></div>
			</article>
		<?php endwhile; ?>
		<?php the_posts_pagination(); ?>
	<?php else : ?>
		<div class="empty-state"><h1>موردی پیدا نشد.</h1><p>نام محصول یا دسته‌بندی دیگری را جست‌وجو کنید.</p></div>
	<?php endif; ?>
</div>
<?php get_footer(); ?>
