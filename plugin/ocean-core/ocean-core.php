<?php
/**
 * Plugin Name: Ocean Cement Tanks – Core
 * Description: Projects portfolio (photos + YouTube videos, search and filters), team directory with departments and contact details, and the completed-sites counter. Bilingual English / Arabic.
 * Version: 1.3.1
 * Author: Ocean Cement Tanks
 * License: GPL-2.0-or-later
 * Text Domain: ocean-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* =====================================================================
 * Helpers
 * ===================================================================== */

/** Split "English | عربي" into its two halves. */
function occ_split( $s ) {
	$p  = preg_split( '/\s*\|\s*/u', (string) $s, 2 );
	$en = trim( $p[0] );
	$ar = ( isset( $p[1] ) && '' !== trim( $p[1] ) ) ? trim( $p[1] ) : $en;
	return array( 'en' => $en, 'ar' => $ar );
}

function occ_pick( $s, $ar ) {
	$x = occ_split( $s );
	return $ar ? $x['ar'] : $x['en'];
}

function occ_meta( $id, $k ) {
	return (string) get_post_meta( $id, $k, true );
}

/** Language-aware meta: prefer the requested language, fall back to the other. */
function occ_meta_lang( $id, $en_key, $ar_key, $ar ) {
	$a = occ_meta( $id, $ar ? $ar_key : $en_key );
	return '' !== $a ? $a : occ_meta( $id, $ar ? $en_key : $ar_key );
}

function occ_yt( $u ) {
	return preg_match( '~(?:youtu\.be/|[?&]v=|/embed/|/shorts/|/live/)([A-Za-z0-9_-]{11})~', (string) $u, $m ) ? $m[1] : '';
}

function occ_date( $ts, $ar ) {
	if ( ! $ar ) {
		return gmdate( 'j M Y', $ts );
	}
	$m = array( 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر' );
	return (int) gmdate( 'j', $ts ) . ' ' . $m[ (int) gmdate( 'n', $ts ) - 1 ] . ' ' . gmdate( 'Y', $ts );
}

function occ_img( $id, $size = 'large' ) {
	return wp_get_attachment_image(
		$id,
		$size,
		false,
		array(
			'loading'  => 'lazy',
			'decoding' => 'async',
		)
	);
}

function occ_can_edit() {
	return current_user_can( 'edit_posts' );
}

/* =====================================================================
 * Content types
 * ===================================================================== */

add_action( 'init', 'occ_register' );
function occ_register() {
	$hint_project = '📸 أضف صور المشروع بالمعرض تحت • 🎬 الصق روابط يوتيوب (كل رابط بسطر لحالو، العدد غير محدود) • 🖼️ صورة الغلاف من Featured image على اليمين • 📍 الموقع من Locations • 📅 التاريخ من Publish • ✏️ الاسم بالعربي والوصف بمربع "Project details" تحت.';
	$hint_member  = '📸 الصورة الرئيسية من Featured image على اليمين، والصور الإضافية بالمعرض تحت • 🏷️ القسم من Departments • ✏️ المنصب والهاتف والإيميل والنبذة بمربع "Employee details" تحت.';

	register_post_type(
		'oc_project',
		array(
			'labels'              => array(
				'name'               => 'Projects | المشاريع',
				'singular_name'      => 'Project | مشروع',
				'menu_name'          => 'Projects | المشاريع',
				'add_new'            => 'Add project | أضف مشروع',
				'add_new_item'       => 'New project | مشروع جديد',
				'edit_item'          => 'Edit project | تعديل المشروع',
				'new_item'           => 'New project',
				'all_items'          => 'All projects | كل المشاريع',
				'search_items'       => 'Search projects',
				'not_found'          => 'No projects yet',
				'featured_image'     => 'Cover photo | صورة الغلاف',
				'set_featured_image' => 'Set cover photo | اختر صورة الغلاف',
			),
			'public'              => true,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'menu_position'       => 4,
			'menu_icon'           => 'dashicons-portfolio',
			'has_archive'         => false,
			'rewrite'             => false,
			'supports'            => array( 'title', 'editor', 'thumbnail', 'custom-fields' ),
			'template'            => array(
				array( 'core/paragraph', array( 'className' => 'oc-editor-hint', 'content' => $hint_project ) ),
				array( 'core/gallery', array( 'linkTo' => 'none' ) ),
				array(
					'core/embed',
					array(
						'providerNameSlug' => 'youtube',
						'type'             => 'video',
						'responsive'       => true,
					),
				),
			),
		)
	);

	register_taxonomy(
		'oc_location',
		array( 'oc_project' ),
		array(
			'labels'            => array(
				'name'          => 'Locations | المواقع',
				'singular_name' => 'Location',
				'menu_name'     => 'Locations | المواقع',
				'add_new_item'  => 'Add location (English | عربي)',
				'search_items'  => 'Search locations',
			),
			'description'       => 'Write the name as: English | عربي',
			'hierarchical'      => true,
			'public'            => false,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'rewrite'           => false,
		)
	);

	register_post_type(
		'oc_member',
		array(
			'labels'              => array(
				'name'               => 'Team | الفريق',
				'singular_name'      => 'Employee | موظف',
				'menu_name'          => 'Team | الفريق',
				'add_new'            => 'Add employee | أضف موظف',
				'add_new_item'       => 'New employee | موظف جديد',
				'edit_item'          => 'Edit employee | تعديل الموظف',
				'new_item'           => 'New employee',
				'all_items'          => 'All employees | كل الموظفين',
				'search_items'       => 'Search employees',
				'not_found'          => 'No employees yet',
				'featured_image'     => 'Main photo | الصورة الرئيسية',
				'set_featured_image' => 'Set main photo | اختر الصورة الرئيسية',
			),
			'public'              => true,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'menu_position'       => 5,
			'menu_icon'           => 'dashicons-groups',
			'has_archive'         => false,
			'rewrite'             => false,
			'supports'            => array( 'title', 'editor', 'thumbnail', 'page-attributes', 'custom-fields' ),
			'template'            => array(
				array( 'core/paragraph', array( 'className' => 'oc-editor-hint', 'content' => $hint_member ) ),
				array( 'core/gallery', array( 'linkTo' => 'none' ) ),
			),
		)
	);

	register_taxonomy(
		'oc_department',
		array( 'oc_member' ),
		array(
			'labels'            => array(
				'name'          => 'Departments | الأقسام',
				'singular_name' => 'Department',
				'menu_name'     => 'Departments | الأقسام',
				'add_new_item'  => 'Add department (English | عربي)',
				'search_items'  => 'Search departments',
			),
			'description'       => 'Write the name as: English | عربي',
			'hierarchical'      => true,
			'public'            => false,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'rewrite'           => false,
		)
	);

	register_post_type(
		'oc_cert',
		array(
			'labels'              => array(
				'name'               => 'Certificates | الشهادات',
				'singular_name'      => 'Certificate | شهادة',
				'menu_name'          => 'Certificates | الشهادات',
				'add_new'            => 'Add certificate | أضف شهادة',
				'add_new_item'       => 'New certificate | شهادة جديدة',
				'edit_item'          => 'Edit certificate | تعديل الشهادة',
				'all_items'          => 'All certificates | كل الشهادات',
				'not_found'          => 'No certificates yet',
				'featured_image'     => 'Certificate image | صورة الشهادة',
				'set_featured_image' => 'Set certificate image | اختر صورة الشهادة',
			),
			'public'              => true,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'menu_position'       => 6,
			'menu_icon'           => 'dashicons-awards',
			'has_archive'         => false,
			'rewrite'             => false,
			'supports'            => array( 'title', 'thumbnail', 'page-attributes', 'custom-fields' ),
		)
	);
	add_post_type_support( 'page', 'excerpt' );

	$meta = array(
		'oc_cert'    => array( '_oc_cert_ar', '_oc_issuer_en', '_oc_issuer_ar', '_oc_year' ),
		'oc_project' => array( '_oc_title_ar', '_oc_desc_en', '_oc_desc_ar' ),
		'oc_member'  => array( '_oc_name_ar', '_oc_role_en', '_oc_role_ar', '_oc_phone', '_oc_email', '_oc_bio_en', '_oc_bio_ar' ),
	);
	foreach ( $meta as $type => $keys ) {
		foreach ( $keys as $k ) {
			register_post_meta(
				$type,
				$k,
				array(
					'type'              => 'string',
					'single'            => true,
					'show_in_rest'      => true,
					'auth_callback'     => 'occ_can_edit',
					'sanitize_callback' => ( '_oc_email' === $k ) ? 'sanitize_email' : 'sanitize_textarea_field',
				)
			);
		}
	}
	register_term_meta(
		'oc_department',
		'oc_order',
		array(
			'type'          => 'integer',
			'single'        => true,
			'show_in_rest'  => true,
			'auth_callback' => 'occ_can_edit',
		)
	);
}

/* =====================================================================
 * Admin: detail boxes, department order, settings page
 * ===================================================================== */

add_action( 'add_meta_boxes', 'occ_boxes' );
function occ_boxes() {
	add_meta_box( 'occ_project', 'Project details | تفاصيل المشروع', 'occ_project_box', 'oc_project', 'normal', 'high' );
	add_meta_box( 'occ_member', 'Employee details | بيانات الموظف', 'occ_member_box', 'oc_member', 'normal', 'high' );
	add_meta_box( 'occ_cert', 'Certificate details | تفاصيل الشهادة', 'occ_cert_box', 'oc_cert', 'normal', 'high' );
}

function occ_field( $id, $key, $label, $type = 'text', $dir = 'ltr', $ph = '' ) {
	$v = occ_meta( $id, $key );
	echo '<p style="margin:0 0 14px"><label style="display:block;font-weight:600;margin-bottom:5px" for="' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label>';
	if ( 'textarea' === $type ) {
		echo '<textarea class="widefat" rows="3" dir="' . esc_attr( $dir ) . '" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '" placeholder="' . esc_attr( $ph ) . '">' . esc_textarea( $v ) . '</textarea>';
	} else {
		echo '<input class="widefat" dir="' . esc_attr( $dir ) . '" type="' . esc_attr( $type ) . '" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '" value="' . esc_attr( $v ) . '" placeholder="' . esc_attr( $ph ) . '">';
	}
	echo '</p>';
}

function occ_project_box( $post ) {
	wp_nonce_field( 'occ_save', 'occ_nonce' );
	echo '<p style="background:#f0f6fc;padding:10px 12px;border-radius:6px">The title at the top is the project name in English. | العنوان فوق هو اسم المشروع بالإنكليزي.</p>';
	occ_field( $post->ID, '_oc_title_ar', 'Project name in Arabic | اسم المشروع بالعربي', 'text', 'rtl' );
	occ_field( $post->ID, '_oc_desc_en', 'Short description (English)', 'textarea' );
	occ_field( $post->ID, '_oc_desc_ar', 'وصف قصير (عربي)', 'textarea', 'rtl' );
}

function occ_member_box( $post ) {
	wp_nonce_field( 'occ_save', 'occ_nonce' );
	echo '<p style="background:#f0f6fc;padding:10px 12px;border-radius:6px">The title at the top is the employee name in English. | العنوان فوق هو اسم الموظف بالإنكليزي. Order (الترتيب) is in the side panel.</p>';
	occ_field( $post->ID, '_oc_name_ar', 'Name in Arabic | الاسم بالعربي', 'text', 'rtl' );
	occ_field( $post->ID, '_oc_role_en', 'Job title (English)', 'text', 'ltr', 'Sales Manager' );
	occ_field( $post->ID, '_oc_role_ar', 'المسمى الوظيفي (عربي)', 'text', 'rtl', 'مدير المبيعات' );
	occ_field( $post->ID, '_oc_phone', 'Phone | رقم الهاتف (optional)', 'tel', 'ltr', '+971 50 000 0000' );
	occ_field( $post->ID, '_oc_email', 'Email | الإيميل (optional)', 'email', 'ltr', 'name@example.com' );
	occ_field( $post->ID, '_oc_bio_en', 'Short bio (English, optional)', 'textarea' );
	occ_field( $post->ID, '_oc_bio_ar', 'نبذة قصيرة (عربي، اختياري)', 'textarea', 'rtl' );
}

function occ_cert_box( $post ) {
	wp_nonce_field( 'occ_save', 'occ_nonce' );
	echo '<p style="background:#f0f6fc;padding:10px 12px;border-radius:6px">The title at the top is the certificate name in English. Upload the certificate photo or the issuer logo as <b>Certificate image</b> on the right. | العنوان فوق هو اسم الشهادة بالإنكليزي، وصورة الشهادة أو شعار الجهة من <b>Certificate image</b> على اليمين.</p>';
	occ_field( $post->ID, '_oc_cert_ar', 'Certificate name in Arabic | اسم الشهادة بالعربي', 'text', 'rtl', 'شهادة الجودة ISO 9001' );
	occ_field( $post->ID, '_oc_issuer_en', 'Issued by (English)', 'text', 'ltr', 'Dubai Municipality' );
	occ_field( $post->ID, '_oc_issuer_ar', 'الجهة المانحة (عربي)', 'text', 'rtl', 'بلدية دبي' );
	occ_field( $post->ID, '_oc_year', 'Year | السنة (optional)', 'text', 'ltr', '2026' );
}

add_action( 'save_post', 'occ_save', 10, 2 );
function occ_save( $id, $post ) {
	if ( ! in_array( $post->post_type, array( 'oc_project', 'oc_member', 'oc_cert' ), true ) ) {
		return;
	}
	if ( ! isset( $_POST['occ_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['occ_nonce'] ) ), 'occ_save' ) ) {
		return;
	}
	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $id ) ) {
		return;
	}
	$all  = array(
		'oc_project' => array( '_oc_title_ar', '_oc_desc_en', '_oc_desc_ar' ),
		'oc_member'  => array( '_oc_name_ar', '_oc_role_en', '_oc_role_ar', '_oc_phone', '_oc_email', '_oc_bio_en', '_oc_bio_ar' ),
		'oc_cert'    => array( '_oc_cert_ar', '_oc_issuer_en', '_oc_issuer_ar', '_oc_year' ),
	);
	$keys = $all[ $post->post_type ];
	foreach ( $keys as $k ) {
		if ( ! isset( $_POST[ $k ] ) ) {
			continue;
		}
		$raw = wp_unslash( $_POST[ $k ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		if ( '_oc_email' === $k ) {
			$val = sanitize_email( $raw );
		} elseif ( false !== strpos( $k, '_desc' ) || false !== strpos( $k, '_bio' ) ) {
			$val = sanitize_textarea_field( $raw );
		} else {
			$val = sanitize_text_field( $raw );
		}
		update_post_meta( $id, $k, $val );
	}
}

add_action( 'oc_department_add_form_fields', 'occ_dept_add_field' );
function occ_dept_add_field() {
	echo '<div class="form-field"><label for="oc_order">Order | الترتيب</label><input type="number" name="oc_order" id="oc_order" value="10"><p>Smaller numbers appear first on the Team page. | الرقم الأصغر بيظهر أول.</p></div>';
}
add_action( 'oc_department_edit_form_fields', 'occ_dept_edit_field' );
function occ_dept_edit_field( $t ) {
	$v = (int) get_term_meta( $t->term_id, 'oc_order', true );
	echo '<tr class="form-field"><th scope="row"><label for="oc_order">Order | الترتيب</label></th><td><input type="number" name="oc_order" id="oc_order" value="' . esc_attr( $v ) . '"><p class="description">Smaller numbers appear first. | الرقم الأصغر بيظهر أول.</p></td></tr>';
}
add_action( 'created_oc_department', 'occ_dept_save' );
add_action( 'edited_oc_department', 'occ_dept_save' );
function occ_dept_save( $tid ) {
	// Core verifies the term form nonce before these hooks run.
	if ( isset( $_POST['oc_order'] ) && current_user_can( 'manage_categories' ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		update_term_meta( $tid, 'oc_order', (int) $_POST['oc_order'] ); // phpcs:ignore WordPress.Security.NonceVerification
	}
}

add_action( 'admin_init', 'occ_settings_register' );
add_action( 'rest_api_init', 'occ_settings_register' );
function occ_settings_register() {
	register_setting(
		'occ',
		'occ_sites',
		array(
			'type'              => 'integer',
			'sanitize_callback' => 'absint',
			'default'           => 7453,
			'show_in_rest'      => true,
		)
	);
	foreach ( array( 'occ_og_image', 'occ_logo_url' ) as $o ) {
		register_setting(
			'occ_media',
			$o,
			array(
				'type'              => 'string',
				'sanitize_callback' => 'esc_url_raw',
				'default'           => '',
				'show_in_rest'      => true,
			)
		);
	}
	register_setting(
		'occ',
		'occ_gsc',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'occ_clean_gsc',
			'default'           => '',
			'show_in_rest'      => true,
		)
	);
}

/** Accept either the bare token or the whole <meta> tag Google gives. */
function occ_clean_gsc( $v ) {
	$v = (string) $v;
	if ( preg_match( '/content=["\']([^"\']+)["\']/', $v, $m ) ) {
		$v = $m[1];
	}
	return preg_replace( '/[^A-Za-z0-9_\-]/', '', $v );
}

add_action( 'admin_menu', 'occ_menu' );
function occ_menu() {
	add_menu_page( 'Ocean Settings', 'Ocean Settings | الإعدادات', 'manage_options', 'occ-settings', 'occ_settings_page', 'dashicons-chart-bar', 3 );
}

function occ_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$n = (int) get_option( 'occ_sites', 7453 );
	echo '<div class="wrap"><h1>Ocean Settings | إعدادات الموقع</h1>';
	echo '<form method="post" action="options.php">';
	settings_fields( 'occ' );
	echo '<table class="form-table" role="presentation"><tr><th scope="row"><label for="occ_sites">Completed sites<br>عدد المواقع المنجزة</label></th><td>';
	echo '<input type="number" min="0" id="occ_sites" name="occ_sites" value="' . esc_attr( $n ) . '" class="regular-text" style="font-size:20px;padding:6px 10px">';
	echo '<p class="description">Shown with an animated counter on the Home and About pages. | بيظهر بعدّاد متحرك بالصفحة الرئيسية وصفحة من نحن.</p></td></tr>';
	echo '<tr><th scope="row"><label for="occ_gsc">Google Search Console<br>رمز التحقق من غوغل</label></th><td><input type="text" id="occ_gsc" name="occ_gsc" value="' . esc_attr( get_option( 'occ_gsc', '' ) ) . '" class="large-text" placeholder="&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt;">';
	echo '<p class="description">Paste the HTML-tag code from Google Search Console here. | الصق هون كود "HTML tag" يلي بيعطيك ياه Google Search Console. Sitemap: <code>' . esc_html( home_url( '/wp-sitemap.xml' ) ) . '</code></p></td></tr></table>';
	submit_button( 'Save | حفظ' );
	echo '</form><hr><h2>Quick actions | اختصارات</h2><p style="display:flex;gap:8px;flex-wrap:wrap">';
	$links = array(
		array( 'post-new.php?post_type=oc_project', '+ Add project | أضف مشروع', 'button-primary' ),
		array( 'post-new.php?post_type=oc_member', '+ Add employee | أضف موظف', 'button-primary' ),
		array( 'post-new.php?post_type=oc_cert', '+ Add certificate | أضف شهادة', 'button-primary' ),
		array( 'edit.php?post_type=oc_project', 'All projects | كل المشاريع', '' ),
		array( 'edit.php?post_type=oc_member', 'All employees | كل الموظفين', '' ),
		array( 'edit-tags.php?taxonomy=oc_department&post_type=oc_member', 'Departments | الأقسام', '' ),
		array( 'edit-tags.php?taxonomy=oc_location&post_type=oc_project', 'Locations | المواقع', '' ),
	);
	foreach ( $links as $l ) {
		echo '<a class="button ' . esc_attr( $l[2] ) . '" href="' . esc_url( admin_url( $l[0] ) ) . '">' . esc_html( $l[1] ) . '</a>';
	}
	echo '</p></div>';
}

/* =====================================================================
 * Media extraction (photos + YouTube videos from the block content)
 * ===================================================================== */

function occ_post_images( $p ) {
	$ids = array();
	$th  = (int) get_post_thumbnail_id( $p );
	if ( $th ) {
		$ids[] = $th;
	}
	$walk = function ( $blocks ) use ( &$walk, &$ids ) {
		foreach ( $blocks as $b ) {
			if ( 'core/image' === $b['blockName'] && ! empty( $b['attrs']['id'] ) ) {
				$ids[] = (int) $b['attrs']['id'];
			}
			if ( 'core/gallery' === $b['blockName'] && ! empty( $b['attrs']['ids'] ) ) {
				foreach ( (array) $b['attrs']['ids'] as $i ) {
					$ids[] = (int) $i;
				}
			}
			if ( ! empty( $b['innerBlocks'] ) ) {
				$walk( $b['innerBlocks'] );
			}
		}
	};
	$walk( parse_blocks( $p->post_content ) );
	return array_values( array_unique( array_filter( $ids ) ) );
}

function occ_yt_title( $id ) {
	$k = 'occ_yt_' . $id;
	$t = get_transient( $k );
	if ( false !== $t ) {
		return $t;
	}
	$t = '';
	$r = wp_remote_get( 'https://www.youtube.com/oembed?format=json&url=' . rawurlencode( 'https://www.youtube.com/watch?v=' . $id ), array( 'timeout' => 4 ) );
	if ( ! is_wp_error( $r ) && 200 === wp_remote_retrieve_response_code( $r ) ) {
		$j = json_decode( wp_remote_retrieve_body( $r ), true );
		if ( ! empty( $j['title'] ) ) {
			$t = sanitize_text_field( $j['title'] );
		}
	}
	set_transient( $k, $t, $t ? MONTH_IN_SECONDS : DAY_IN_SECONDS );
	return $t;
}

function occ_post_videos( $p, $titles = false ) {
	$out  = array();
	$seen = array();
	$add  = function ( $url, $cap ) use ( &$out, &$seen, $titles ) {
		$id = occ_yt( $url );
		if ( ! $id || ! empty( $seen[ $id ] ) ) {
			return;
		}
		$seen[ $id ] = 1;
		$out[]       = array(
			'id'    => $id,
			'title' => $cap ? $cap : ( $titles ? occ_yt_title( $id ) : '' ),
		);
	};
	$walk = function ( $blocks ) use ( &$walk, $add ) {
		foreach ( $blocks as $b ) {
			if ( in_array( $b['blockName'], array( 'core/embed', 'core-embed/youtube' ), true ) ) {
				if ( ! empty( $b['attrs']['url'] ) ) {
					$cap = '';
					if ( preg_match( '~<figcaption[^>]*>(.*?)</figcaption>~s', (string) $b['innerHTML'], $c ) ) {
						$cap = trim( wp_strip_all_tags( $c[1] ) );
					}
					$add( $b['attrs']['url'], $cap );
				}
			} elseif ( ! empty( $b['innerHTML'] ) && preg_match_all( '~https?://(?:www\.|m\.)?(?:youtube\.com|youtu\.be)/[^\s"<\']+~i', $b['innerHTML'], $mm ) ) {
				foreach ( $mm[0] as $u ) {
					$add( $u, '' );
				}
			}
			if ( ! empty( $b['innerBlocks'] ) ) {
				$walk( $b['innerBlocks'] );
			}
		}
	};
	$walk( parse_blocks( $p->post_content ) );
	return $out;
}

add_action( 'rest_api_init', 'occ_rest' );
function occ_rest() {
	register_rest_route(
		'oc/v1',
		'/project/(?P<id>\d+)',
		array(
			'methods'             => 'GET',
			'permission_callback' => '__return_true',
			'callback'            => 'occ_rest_project',
		)
	);
	register_rest_route(
		'oc/v1',
		'/projects',
		array(
			'methods'             => 'GET',
			'permission_callback' => '__return_true',
			'callback'            => 'occ_rest_projects',
		)
	);
}

function occ_rest_project( $r ) {
	$p = get_post( (int) $r['id'] );
	if ( ! $p || 'oc_project' !== $p->post_type || 'publish' !== $p->post_status ) {
		return new WP_Error( 'occ_not_found', 'Not found', array( 'status' => 404 ) );
	}
	$photos = array();
	foreach ( occ_post_images( $p ) as $i ) {
		$s = wp_get_attachment_image_src( $i, 'large' );
		if ( ! $s ) {
			continue;
		}
		$f        = wp_get_attachment_image_src( $i, '2048x2048' );
		$photos[] = array(
			'src'  => $s[0],
			'full' => $f ? $f[0] : $s[0],
			'alt'  => (string) get_post_meta( $i, '_wp_attachment_image_alt', true ),
		);
	}
	return rest_ensure_response(
		array(
			'photos' => $photos,
			'videos' => occ_post_videos( $p, true ),
		)
	);
}

/* =====================================================================
 * Shortcodes
 * ===================================================================== */

/** [oc_stat] – completed sites number, animated by the site script. */
add_shortcode( 'oc_stat', 'occ_stat_sc' );
function occ_stat_sc() {
	$n = (int) get_option( 'occ_sites', 7453 );
	return '<span data-count="' . esc_attr( $n ) . '">' . esc_html( number_format( $n ) ) . '</span>';
}

function occ_icon( $k ) {
	$i = array(
		'tel'    => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h3.6l1.8 4.6-2.3 1.4a11.5 11.5 0 0 0 6.4 6.4l1.4-2.3 4.6 1.8V19a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.7 2 2 0 0 1 5 3.5z" fill="currentColor"/></svg>',
		'wa'     => '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.5 5 5.2-1.4A9.9 9.9 0 1 0 12.04 2zm4.5 12c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>',
		'mail'   => '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
		'search' => '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
		'cal'    => '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
	);
	return isset( $i[ $k ] ) ? $i[ $k ] : '';
}

function occ_contact( $phone, $email, $big, $ar ) {
	$o = '';
	if ( $phone ) {
		$d  = preg_replace( '/[^0-9+]/', '', $phone );
		$w  = ltrim( $d, '+' );
		$o .= '<a class="oc-cl oc-cl-tel" href="tel:' . esc_attr( $d ) . '" aria-label="' . esc_attr( ( $ar ? 'اتصال ' : 'Call ' ) . $phone ) . '">' . occ_icon( 'tel' ) . ( $big ? '<span dir="ltr">' . esc_html( $phone ) . '</span>' : '' ) . '</a>';
		$o .= '<a class="oc-cl oc-cl-wa" href="https://wa.me/' . esc_attr( $w ) . '" target="_blank" rel="noopener" aria-label="WhatsApp">' . occ_icon( 'wa' ) . ( $big ? '<span>WhatsApp</span>' : '' ) . '</a>';
	}
	if ( $email ) {
		$e  = antispambot( $email );
		$o .= '<a class="oc-cl oc-cl-mail" href="mailto:' . esc_attr( $e ) . '" aria-label="Email">' . occ_icon( 'mail' ) . ( $big ? '<span dir="ltr">' . esc_html( $e ) . '</span>' : '' ) . '</a>';
	}
	return $o;
}

function occ_member_card( $p, $ar ) {
	$name  = ( $ar && '' !== occ_meta( $p->ID, '_oc_name_ar' ) ) ? occ_meta( $p->ID, '_oc_name_ar' ) : get_the_title( $p );
	$role  = occ_meta_lang( $p->ID, '_oc_role_en', '_oc_role_ar', $ar );
	$bio   = occ_meta_lang( $p->ID, '_oc_bio_en', '_oc_bio_ar', $ar );
	$phone = occ_meta( $p->ID, '_oc_phone' );
	$email = occ_meta( $p->ID, '_oc_email' );
	$ids   = occ_post_images( $p );
	$srch  = function_exists( 'mb_strtolower' ) ? mb_strtolower( $name . ' ' . $role . ' ' . get_the_title( $p ) ) : strtolower( $name . ' ' . $role );

	$o = '<article class="oc-member" data-search="' . esc_attr( $srch ) . '"><figure class="wp-block-gallery has-nested-images oc-member-photos">';
	foreach ( $ids as $i ) {
		$o .= '<figure class="wp-block-image">' . occ_img( $i ) . '</figure>';
	}
	if ( ! $ids ) {
		$o .= '<figure class="wp-block-image oc-m-noimg"><span>' . esc_html( function_exists( 'mb_substr' ) ? mb_substr( $name, 0, 1 ) : substr( $name, 0, 1 ) ) . '</span></figure>';
	}
	$o .= '</figure><div class="oc-member-body"><h3 class="wp-block-heading oc-m-name">' . esc_html( $name ) . '</h3>';
	if ( $role ) {
		$o .= '<p class="oc-m-role oc-role">' . esc_html( $role ) . '</p>';
	}
	$small = occ_contact( $phone, $email, false, $ar );
	if ( $small ) {
		$o .= '<div class="oc-m-contact">' . $small . '</div>';
	}
	$o .= '<div class="oc-member-more">';
	if ( $bio ) {
		$o .= wpautop( esc_html( $bio ) );
	}
	if ( $small ) {
		$o .= '<div class="oc-m-btns">' . occ_contact( $phone, $email, true, $ar ) . '</div>';
	}
	$o .= '</div></div></article>';
	return $o;
}

/** [oc_team lang="en|ar"] – departments with employee cards. */
add_shortcode( 'oc_team', 'occ_team_sc' );
function occ_team_sc( $atts ) {
	$a     = shortcode_atts( array( 'lang' => 'en' ), $atts );
	$ar    = 'ar' === $a['lang'];
	$terms = get_terms(
		array(
			'taxonomy'   => 'oc_department',
			'hide_empty' => false,
		)
	);
	if ( is_wp_error( $terms ) ) {
		$terms = array();
	}
	usort(
		$terms,
		function ( $x, $y ) {
			$ox = (int) get_term_meta( $x->term_id, 'oc_order', true );
			$oy = (int) get_term_meta( $y->term_id, 'oc_order', true );
			return $ox === $oy ? strcmp( $x->name, $y->name ) : $ox - $oy;
		}
	);
	$base   = array(
		'post_type'   => 'oc_member',
		'post_status' => 'publish',
		'numberposts' => -1,
		'orderby'     => array(
			'menu_order' => 'ASC',
			'title'      => 'ASC',
		),
	);
	$groups = array();
	foreach ( $terms as $t ) {
		$m = get_posts(
			$base + array(
				'tax_query' => array( // phpcs:ignore WordPress.DB.SlowDBQuery
					array(
						'taxonomy'         => 'oc_department',
						'terms'            => $t->term_id,
						'include_children' => false,
					),
				),
			)
		);
		if ( $m ) {
			$groups[] = array( occ_pick( $t->name, $ar ), $m );
		}
	}
	$none = get_posts(
		$base + array(
			'tax_query' => array( // phpcs:ignore WordPress.DB.SlowDBQuery
				array(
					'taxonomy' => 'oc_department',
					'operator' => 'NOT EXISTS',
				),
			),
		)
	);
	if ( $none ) {
		$groups[] = array( $ar ? 'فريق العمل' : 'Our team', $none );
	}
	if ( ! $groups ) {
		return '<p class="oc-empty-note">' . esc_html( $ar ? 'سيتم إضافة أعضاء الفريق قريباً.' : 'Team members will be added soon.' ) . '</p>';
	}
	$o = '<div class="oc-team-wrap oc-team-dyn">';
	foreach ( $groups as $g ) {
		$o .= '<section class="oc-dept"><h2 class="wp-block-heading oc-dept-title">' . esc_html( $g[0] ) . '</h2><div class="oc-team oc-stagger">';
		foreach ( $g[1] as $p ) {
			$o .= occ_member_card( $p, $ar );
		}
		$o .= '</div></section>';
	}
	return $o . '</div>';
}

/** [oc_projects lang="en|ar" layout="grid|mosaic" limit="0"] – the portfolio. */
add_shortcode( 'oc_projects', 'occ_projects_sc' );
function occ_projects_sc( $atts ) {
	$a  = shortcode_atts(
		array(
			'lang'   => 'en',
			'layout' => 'grid',
			'limit'  => 0,
		),
		$atts
	);
	$ar = 'ar' === $a['lang'];

	if ( 'mosaic' === $a['layout'] ) {
		$lim = (int) $a['limit'];
		$ps  = get_posts(
			array(
				'post_type'   => 'oc_project',
				'post_status' => 'publish',
				'numberposts' => $lim > 0 ? $lim : 5,
				'orderby'     => 'date',
				'order'       => 'DESC',
			)
		);
		if ( ! $ps ) {
			return '';
		}
		$o = '<div class="oc-mosaic oc-pj-mosaic oc-stagger">';
		foreach ( $ps as $p ) {
			$ids   = occ_post_images( $p );
			$title = ( $ar && '' !== occ_meta( $p->ID, '_oc_title_ar' ) ) ? occ_meta( $p->ID, '_oc_title_ar' ) : get_the_title( $p );
			$o    .= '<figure class="wp-block-image oc-pj-mini" data-id="' . esc_attr( $p->ID ) . '" data-photos="' . count( $ids ) . '" data-videos="' . count( occ_post_videos( $p ) ) . '" data-place="' . esc_attr( implode( $ar ? '، ' : ', ', occ_project_locs( $p, $ar ) ) ) . '" data-desc="' . esc_attr( occ_meta_lang( $p->ID, '_oc_desc_en', '_oc_desc_ar', $ar ) ) . '">' . ( $ids ? occ_img( $ids[0] ) : '' ) . '<figcaption class="oc-p-name">' . esc_html( $title ) . '</figcaption></figure>';
		}
		return $o . '</div>';
	}

	$index = occ_project_index();
	if ( ! $index ) {
		return '<p class="oc-empty-note">' . esc_html( $ar ? 'سيتم إضافة المشاريع قريباً.' : 'Projects will be added soon.' ) . '</p>';
	}
	$T = occ_pf_text( $ar );

	$locs  = array();
	$terms = get_terms(
		array(
			'taxonomy'   => 'oc_location',
			'hide_empty' => true,
		)
	);
	if ( ! is_wp_error( $terms ) ) {
		foreach ( $terms as $t ) {
			$locs[ $t->slug ] = occ_pick( $t->name, $ar );
		}
	}
	asort( $locs );
	$years = array();
	foreach ( $index as $row ) {
		$years[ $row['y'] ] = 1;
	}
	krsort( $years );

	$f  = '<div class="oc-pfilter" role="search">';
	$f .= '<label class="oc-pf-search">' . occ_icon( 'search' ) . '<input type="search" placeholder="' . esc_attr( $T['search'] ) . '" aria-label="' . esc_attr( $T['search'] ) . '"></label>';
	if ( $locs ) {
		$f .= '<select data-f="loc" aria-label="' . esc_attr( $T['loc'] ) . '"><option value="">' . esc_html( $T['loc'] ) . '</option>';
		foreach ( $locs as $sl => $n ) {
			$f .= '<option value="' . esc_attr( $sl ) . '">' . esc_html( $n ) . '</option>';
		}
		$f .= '</select>';
	}
	$f .= '<select data-f="year" aria-label="' . esc_attr( $T['year'] ) . '"><option value="">' . esc_html( $T['year'] ) . '</option>';
	foreach ( array_keys( $years ) as $y ) {
		$f .= '<option value="' . esc_attr( $y ) . '">' . esc_html( $y ) . '</option>';
	}
	$f .= '</select><select data-f="month" aria-label="' . esc_attr( $T['month'] ) . '"><option value="">' . esc_html( $T['month'] ) . '</option>';
	foreach ( $T['months'] as $i => $mn ) {
		$f .= '<option value="' . ( $i + 1 ) . '">' . esc_html( $mn ) . '</option>';
	}
	$f .= '</select><select data-f="sort" aria-label="' . esc_attr( $T['new'] ) . '"><option value="new">' . esc_html( $T['new'] ) . '</option><option value="old">' . esc_html( $T['old'] ) . '</option><option value="az">' . esc_html( $T['az'] ) . '</option></select></div>';

	$per   = 6;
	$res   = occ_project_query( array(), $per, 1, $ar );
	$cards = '';
	foreach ( $res['ids'] as $id ) {
		$cards .= occ_project_card( get_post( $id ), $ar );
	}
	$count = str_replace( array( '{n}', '{t}' ), array( '<b>' . $res['total'] . '</b>', count( $index ) ), $T['count'] );

	$o  = '<div class="oc-pf-wrap" data-lang="' . ( $ar ? 'ar' : 'en' ) . '" data-per="' . $per . '" data-total="' . count( $index ) . '" data-api="' . esc_url( rest_url( 'oc/v1/projects' ) ) . '">' . $f;
	$o .= '<p class="oc-pf-count" aria-live="polite" data-tpl="' . esc_attr( $T['count'] ) . '">' . $count . '</p>';
	$o .= '<div class="oc-projects oc-pj-grid">' . $cards . '</div>';
	$o .= '<p class="oc-pf-empty" hidden>' . esc_html( $T['none'] ) . '</p>';
	$o .= '<div class="oc-pf-more-wrap"' . ( $res['total'] > $per ? '' : ' hidden' ) . '><button type="button" class="oc-pf-more"><span>' . esc_html( $T['more'] ) . '</span> <small>(' . esc_html( max( 0, $res['total'] - $per ) ) . ')</small></button></div></div>';
	return $o;
}

function occ_pf_text( $ar ) {
	return $ar
		? array(
			'search' => 'ابحث باسم المشروع أو الموقع',
			'loc'    => 'كل المواقع',
			'year'   => 'كل السنوات',
			'month'  => 'كل الأشهر',
			'new'    => 'الأحدث أولاً',
			'old'    => 'الأقدم أولاً',
			'az'     => 'حسب الاسم',
			'count'  => '{n} من أصل {t} مشروع',
			'none'   => 'لا توجد مشاريع مطابقة لبحثك.',
			'more'   => 'عرض المزيد',
			'months' => array( 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر' ),
		)
		: array(
			'search' => 'Search by project name or location',
			'loc'    => 'All locations',
			'year'   => 'All years',
			'month'  => 'All months',
			'new'    => 'Newest first',
			'old'    => 'Oldest first',
			'az'     => 'Name A–Z',
			'count'  => '{n} of {t} projects',
			'none'   => 'No projects match your search.',
			'more'   => 'Show more',
			'months' => array( 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ),
		);
}

function occ_project_locs( $p, $ar, $slugs = false ) {
	$out   = array();
	$terms = get_the_terms( $p, 'oc_location' );
	if ( $terms && ! is_wp_error( $terms ) ) {
		foreach ( $terms as $t ) {
			$out[] = $slugs ? $t->slug : occ_pick( $t->name, $ar );
		}
	}
	return $out;
}

/** Lower-case + unify Arabic letter forms so search is forgiving. */
function occ_norm( $s ) {
	$s = function_exists( 'mb_strtolower' ) ? mb_strtolower( (string) $s, 'UTF-8' ) : strtolower( (string) $s );
	$s = preg_replace( '/[\x{064B}-\x{0652}\x{0640}]/u', '', $s );
	$s = str_replace( array( 'أ', 'إ', 'آ', 'ة', 'ى' ), array( 'ا', 'ا', 'ا', 'ه', 'ي' ), $s );
	return trim( preg_replace( '/\s+/u', ' ', $s ) );
}

/** Light index of every published project, cached until content changes. */
function occ_project_index() {
	$idx = get_transient( 'occ_pj_index' );
	if ( is_array( $idx ) ) {
		return $idx;
	}
	$idx = array();
	$ids = get_posts(
		array(
			'post_type'   => 'oc_project',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => 'date',
			'order'       => 'DESC',
			'fields'      => 'ids',
		)
	);
	if ( $ids ) {
		update_meta_cache( 'post', $ids );
		update_object_term_cache( $ids, 'oc_project' );
	}
	foreach ( $ids as $id ) {
		$p        = get_post( $id );
		$ts       = (int) get_post_time( 'U', false, $p );
		$en       = get_the_title( $p );
		$arT      = occ_meta( $id, '_oc_title_ar' );
		$names    = array();
		$terms    = get_the_terms( $p, 'oc_location' );
		$slugs    = array();
		if ( $terms && ! is_wp_error( $terms ) ) {
			foreach ( $terms as $t ) {
				$slugs[] = $t->slug;
				$names[] = $t->name;
			}
		}
		$idx[] = array(
			'id'  => $id,
			'ts'  => $ts,
			'y'   => gmdate( 'Y', $ts ),
			'm'   => (int) gmdate( 'n', $ts ),
			'loc' => $slugs,
			's'   => occ_norm( $en . ' ' . $arT . ' ' . implode( ' ', $names ) . ' ' . occ_meta( $id, '_oc_desc_en' ) . ' ' . occ_meta( $id, '_oc_desc_ar' ) ),
			'en'  => occ_norm( $en ),
			'ar'  => occ_norm( '' !== $arT ? $arT : $en ),
		);
	}
	set_transient( 'occ_pj_index', $idx, DAY_IN_SECONDS );
	return $idx;
}

function occ_project_query( $f, $per, $page, $ar ) {
	$rows  = occ_project_index();
	$q     = isset( $f['q'] ) ? occ_norm( $f['q'] ) : '';
	$words = '' === $q ? array() : explode( ' ', $q );
	$out   = array();
	foreach ( $rows as $r ) {
		if ( ! empty( $f['loc'] ) && ! in_array( $f['loc'], $r['loc'], true ) ) {
			continue;
		}
		if ( ! empty( $f['y'] ) && (string) $f['y'] !== (string) $r['y'] ) {
			continue;
		}
		if ( ! empty( $f['m'] ) && (int) $f['m'] !== (int) $r['m'] ) {
			continue;
		}
		$ok = true;
		foreach ( $words as $w ) {
			if ( false === strpos( $r['s'], $w ) ) {
				$ok = false;
				break;
			}
		}
		if ( $ok ) {
			$out[] = $r;
		}
	}
	$sort = isset( $f['sort'] ) ? $f['sort'] : 'new';
	if ( 'old' === $sort ) {
		usort(
			$out,
			function ( $x, $y ) {
				return $x['ts'] - $y['ts'];
			}
		);
	} elseif ( 'az' === $sort ) {
		$k = $ar ? 'ar' : 'en';
		usort(
			$out,
			function ( $x, $y ) use ( $k ) {
				return strcmp( $x[ $k ], $y[ $k ] );
			}
		);
	}
	$total = count( $out );
	$slice = array_slice( $out, max( 0, ( $page - 1 ) * $per ), $per );
	return array(
		'total' => $total,
		'ids'   => wp_list_pluck( $slice, 'id' ),
	);
}

function occ_project_card( $p, $ar ) {
	$ts    = (int) get_post_time( 'U', false, $p );
	$title = ( $ar && '' !== occ_meta( $p->ID, '_oc_title_ar' ) ) ? occ_meta( $p->ID, '_oc_title_ar' ) : get_the_title( $p );
	$desc  = occ_meta_lang( $p->ID, '_oc_desc_en', '_oc_desc_ar', $ar );
	$ln    = occ_project_locs( $p, $ar );
	$ids   = occ_post_images( $p );
	$fan   = array();
	foreach ( array_slice( $ids, 1, 3 ) as $i ) {
		$u = wp_get_attachment_image_url( $i, 'medium' );
		if ( $u ) {
			$fan[] = $u;
		}
	}
	$c  = '<article class="oc-project oc-pj" id="project-' . esc_attr( $p->ID ) . '" data-id="' . esc_attr( $p->ID ) . '" data-photos="' . count( $ids ) . '" data-videos="' . count( occ_post_videos( $p ) ) . '" data-fan="' . esc_attr( implode( '|', $fan ) ) . '">';
	$c .= '<figure class="wp-block-image oc-project-cover">' . ( $ids ? occ_img( $ids[0] ) : '<span class="oc-pj-noimg"></span>' ) . '</figure>';
	$c .= '<div class="oc-project-body"><h3 class="wp-block-heading oc-p-name">' . esc_html( $title ) . '</h3>';
	if ( $ln ) {
		$c .= '<p class="oc-p-loc">' . esc_html( implode( $ar ? '، ' : ', ', $ln ) ) . '</p>';
	}
	$c .= '<p class="oc-p-date">' . occ_icon( 'cal' ) . '<time datetime="' . esc_attr( gmdate( 'Y-m-d', $ts ) ) . '">' . esc_html( occ_date( $ts, $ar ) ) . '</time></p>';
	if ( $desc ) {
		$c .= '<p class="oc-p-desc">' . esc_html( $desc ) . '</p>';
	}
	return $c . '</div></article>';
}

/** GET /wp-json/oc/v1/projects?lang=&q=&loc=&y=&m=&sort=&page= */
function occ_rest_projects( $r ) {
	$ar   = 'ar' === $r->get_param( 'lang' );
	$per  = min( 24, max( 1, (int) ( $r->get_param( 'per' ) ? $r->get_param( 'per' ) : 6 ) ) );
	$page = max( 1, (int) $r->get_param( 'page' ) );
	$f    = array(
		'q'    => sanitize_text_field( (string) $r->get_param( 'q' ) ),
		'loc'  => sanitize_title( (string) $r->get_param( 'loc' ) ),
		'y'    => preg_replace( '/\D/', '', (string) $r->get_param( 'y' ) ),
		'm'    => (int) $r->get_param( 'm' ),
		'sort' => in_array( $r->get_param( 'sort' ), array( 'new', 'old', 'az' ), true ) ? $r->get_param( 'sort' ) : 'new',
	);
	$res  = occ_project_query( $f, $per, $page, $ar );
	$html = '';
	foreach ( $res['ids'] as $id ) {
		$html .= occ_project_card( get_post( $id ), $ar );
	}
	return rest_ensure_response(
		array(
			'html'  => $html,
			'total' => $res['total'],
			'all'   => count( occ_project_index() ),
			'page'  => $page,
			'more'  => max( 0, $res['total'] - $page * $per ),
		)
	);
}

/* =====================================================================
 * Certificates strip  [oc_certs lang="en|ar"]
 * ===================================================================== */

add_shortcode( 'oc_certs', 'occ_certs_sc' );
function occ_certs_sc( $atts ) {
	$a  = shortcode_atts( array( 'lang' => 'en' ), $atts );
	$ar = 'ar' === $a['lang'];
	$ps = get_posts(
		array(
			'post_type'   => 'oc_cert',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => array(
				'menu_order' => 'ASC',
				'date'       => 'DESC',
			),
		)
	);
	if ( ! $ps ) {
		return '';
	}
	$shield = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l7.5 3v6c0 4.6-3.2 8.6-7.5 10-4.3-1.4-7.5-5.4-7.5-10v-6z" fill="currentColor" opacity=".18"/><path d="M12 2.5l7.5 3v6c0 4.6-3.2 8.6-7.5 10-4.3-1.4-7.5-5.4-7.5-10v-6z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.3 12.2l2.5 2.5 4.9-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	$cards  = '';
	foreach ( $ps as $p ) {
		$name   = ( $ar && '' !== occ_meta( $p->ID, '_oc_cert_ar' ) ) ? occ_meta( $p->ID, '_oc_cert_ar' ) : get_the_title( $p );
		$issuer = occ_meta_lang( $p->ID, '_oc_issuer_en', '_oc_issuer_ar', $ar );
		$year   = occ_meta( $p->ID, '_oc_year' );
		$tid    = get_post_thumbnail_id( $p );
		$full   = $tid ? wp_get_attachment_image_url( $tid, '2048x2048' ) : '';
		$img    = $tid ? wp_get_attachment_image( $tid, 'medium_large', false, array( 'loading' => 'lazy', 'decoding' => 'async', 'alt' => $name ) ) : '<span class="oc-cert-noimg">' . $shield . '</span>';
		$meta   = trim( $issuer . ( $issuer && $year ? ' · ' : '' ) . $year );
		$cards .= '<li class="oc-cert"><button type="button" class="oc-cert-in" data-full="' . esc_url( $full ) . '" data-name="' . esc_attr( $name ) . '"><span class="oc-cert-img">' . $img . '</span><span class="oc-cert-txt"><span class="oc-cert-badge">' . $shield . '<span>' . esc_html( $ar ? 'معتمد' : 'Certified' ) . '</span></span><strong class="oc-cert-name">' . esc_html( $name ) . '</strong>' . ( $meta ? '<span class="oc-cert-meta">' . esc_html( $meta ) . '</span>' : '' ) . '</span></button></li>';
	}
	$T = $ar
		? array( 'k' => 'ثقة وجودة', 'h' => 'الشهادات والاعتمادات', 'l' => 'شهادات واعتمادات رسمية تثبت جودة منتجاتنا والتزامنا بأعلى المعايير.' )
		: array( 'k' => 'Trust & quality', 'h' => 'Certificates & accreditations', 'l' => 'Official certificates and approvals that prove the quality of our products and our commitment to the highest standards.' );
	$o  = '<section class="oc-certs-sec" aria-label="' . esc_attr( $T['h'] ) . '"><div class="oc-inner oc-head oc-narrow"><p class="oc-kicker">' . esc_html( $T['k'] ) . '</p><h2 class="wp-block-heading oc-h2 oc-split">' . esc_html( $T['h'] ) . '</h2><p class="oc-lead oc-reveal">' . esc_html( $T['l'] ) . '</p></div>';
	$o .= '<div class="oc-certs" style="--n:' . count( $ps ) . '"><ul class="oc-certs-track">' . $cards . '</ul></div></section>';
	return $o;
}

/* =====================================================================
 * SEO: language, descriptions, social cards, hreflang, structured data
 * ===================================================================== */

function occ_is_ar_page() {
	if ( is_admin() ) {
		return false;
	}
	$p = get_queried_object();
	return ( $p instanceof WP_Post && 'page' === $p->post_type && ( 'ar' === $p->post_name || 0 === strpos( $p->post_name, 'ar-' ) ) );
}

add_filter( 'language_attributes', 'occ_lang_attr', 20 );
function occ_lang_attr( $out ) {
	if ( occ_is_ar_page() ) {
		return 'lang="ar" dir="rtl"';
	}
	return $out;
}

/** URL of the other-language version of the current page. */
function occ_counterpart() {
	$p = get_queried_object();
	if ( ! ( $p instanceof WP_Post ) || 'page' !== $p->post_type ) {
		return array();
	}
	$front = (int) get_option( 'page_on_front' );
	if ( $p->ID === $front ) {
		$o = get_page_by_path( 'ar' );
		return $o ? array( 'en' => home_url( '/' ), 'ar' => get_permalink( $o ) ) : array();
	}
	if ( 'ar' === $p->post_name ) {
		return array( 'en' => home_url( '/' ), 'ar' => get_permalink( $p ) );
	}
	if ( 0 === strpos( $p->post_name, 'ar-' ) ) {
		$o = get_page_by_path( substr( $p->post_name, 3 ) );
		return $o ? array( 'en' => get_permalink( $o ), 'ar' => get_permalink( $p ) ) : array();
	}
	$o = get_page_by_path( 'ar-' . $p->post_name );
	return $o ? array( 'en' => get_permalink( $p ), 'ar' => get_permalink( $o ) ) : array();
}

add_filter( 'document_title_parts', 'occ_title_parts' );
function occ_title_parts( $t ) {
	$p = get_queried_object();
	if ( ! ( $p instanceof WP_Post ) ) {
		return $t;
	}
	if ( (int) get_option( 'page_on_front' ) === $p->ID ) {
		return array( 'title' => 'Ocean Cement Tanks', 'tagline' => 'Precast Concrete Water & Septic Tanks in UAE' );
	}
	if ( 'ar' === $p->post_name ) {
		return array( 'title' => 'المحيط لصناعة الخزانات الإسمنتية ذ.م.م', 'tagline' => 'خزانات خرسانية مسبقة الصب للمياه والصرف الصحي في الإمارات' );
	}
	$t['site'] = occ_is_ar_page() ? 'المحيط لصناعة الخزانات الإسمنتية ذ.م.م' : 'Ocean Cement Tanks';
	return $t;
}

add_action( 'wp_head', 'occ_seo_head', 1 );
function occ_seo_head() {
	if ( is_admin() ) {
		return;
	}
	$ar   = occ_is_ar_page();
	$p    = get_queried_object();
	$desc = '';
	if ( $p instanceof WP_Post && has_excerpt( $p ) ) {
		$desc = $p->post_excerpt;
	}
	if ( '' === $desc ) {
		$desc = $ar
			? 'المحيط لصناعة الخزانات الإسمنتية ذ.م.م – تصنيع وتوريد وتركيب خزانات خرسانية مسبقة الصب: خزانات مياه، صرف صحي، غرف مضخات وخزانات تجميع في الشارقة ودبي وكل الإمارات. اتصل: 0525050340'
			: 'Ocean Cement Tanks – manufacture, supply and installation of precast concrete water tanks, septic tanks, pump rooms and holding tanks in Sharjah, Dubai and across the UAE. Call +971 52 505 0340.';
	}
	$desc  = wp_strip_all_tags( $desc );
	$url   = ( $p instanceof WP_Post ) ? get_permalink( $p ) : home_url( add_query_arg( array() ) );
	$title = wp_get_document_title();
	$img   = '';
	if ( $p instanceof WP_Post && has_post_thumbnail( $p ) ) {
		$img = get_the_post_thumbnail_url( $p, 'large' );
	}
	if ( ! $img ) {
		$img = (string) get_option( 'occ_og_image', '' );
	}
	$gsc = get_option( 'occ_gsc', '' );
	if ( $gsc ) {
		echo '<meta name="google-site-verification" content="' . esc_attr( $gsc ) . '">' . "\n";
	}
	echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
	echo '<meta name="robots" content="index, follow, max-image-preview:large">' . "\n";
	echo '<meta property="og:type" content="website">' . "\n";
	echo '<meta property="og:site_name" content="Ocean Cement Tanks">' . "\n";
	echo '<meta property="og:title" content="' . esc_attr( $title ) . '">' . "\n";
	echo '<meta property="og:description" content="' . esc_attr( $desc ) . '">' . "\n";
	echo '<meta property="og:url" content="' . esc_url( $url ) . '">' . "\n";
	echo '<meta property="og:locale" content="' . ( $ar ? 'ar_AE' : 'en_US' ) . '">' . "\n";
	echo '<meta property="og:locale:alternate" content="' . ( $ar ? 'en_US' : 'ar_AE' ) . '">' . "\n";
	if ( $img ) {
		echo '<meta property="og:image" content="' . esc_url( $img ) . '">' . "\n";
	}
	echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
	foreach ( occ_counterpart() as $lang => $u ) {
		echo '<link rel="alternate" hreflang="' . esc_attr( $lang ) . '" href="' . esc_url( $u ) . '">' . "\n";
		if ( 'en' === $lang ) {
			echo '<link rel="alternate" hreflang="x-default" href="' . esc_url( $u ) . '">' . "\n";
		}
	}
	if ( is_front_page() || ( $p instanceof WP_Post && 'ar' === $p->post_name ) ) {
		$logo = get_option( 'occ_logo_url', '' );
		$ld   = array(
			'@context'     => 'https://schema.org',
			'@type'        => 'HomeAndConstructionBusiness',
			'@id'          => home_url( '/#business' ),
			'name'         => 'Ocean Cement Tanks IND L.L.C.SP',
			'alternateName' => array( 'Ocean Precast', 'المحيط لصناعة الخزانات الإسمنتية ذ.م.م', 'المحيط' ),
			'description'  => $desc,
			'url'          => home_url( '/' ),
			'telephone'    => '+971525050340',
			'email'        => 'oceanprecast@gmail.com',
			'image'        => $img ? $img : $logo,
			'logo'         => $logo,
			'priceRange'   => '$$',
			'address'      => array(
				'@type'           => 'PostalAddress',
				'streetAddress'   => 'Al Sajaa Industrial Area',
				'addressLocality' => 'Sharjah',
				'addressRegion'   => 'Sharjah',
				'addressCountry'  => 'AE',
			),
			'geo'          => array(
				'@type'     => 'GeoCoordinates',
				'latitude'  => 25.3304375,
				'longitude' => 55.6193125,
			),
			'hasMap'       => 'https://maps.app.goo.gl/CGaNsxo9Mcccby1A9',
			'areaServed'   => array( 'Sharjah', 'Dubai', 'Ajman', 'Abu Dhabi', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah' ),
			'knowsAbout'   => array( 'Precast concrete water tanks', 'Septic tanks', 'Pump rooms', 'Holding tanks', 'Soakaway tanks', 'Manholes' ),
			'sameAs'       => array( 'https://www.facebook.com/profile.php?id=61595353110521', 'https://www.instagram.com/oceanprecast/' ),
		);
		echo '<script type="application/ld+json">' . wp_json_encode( array_filter( $ld ), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
	}
}

/* Keep author names out of the public sitemap. */
add_filter(
	'wp_sitemaps_add_provider',
	function ( $provider, $name ) {
		return 'users' === $name ? false : $provider;
	},
	10,
	2
);

/* =====================================================================
 * Page cache: purge everything when site content changes, so visitors
 * always see new projects / employees / certificates immediately.
 * ===================================================================== */
function occ_purge_all() {
	delete_transient( 'occ_pj_index' );
	if ( function_exists( 'w3tc_flush_all' ) ) {
		w3tc_flush_all();
	}
}
add_action(
	'save_post',
	function ( $id, $p ) {
		if ( wp_is_post_revision( $id ) || wp_is_post_autosave( $id ) || 'auto-draft' === $p->post_status ) {
			return;
		}
		occ_purge_all();
	},
	99,
	2
);
add_action( 'deleted_post', 'occ_purge_all' );
add_action( 'trashed_post', 'occ_purge_all' );
add_action( 'untrashed_post', 'occ_purge_all' );
add_action( 'edited_term', 'occ_purge_all' );
add_action( 'created_term', 'occ_purge_all' );
add_action( 'delete_term', 'occ_purge_all' );
add_action( 'update_option_occ_sites', 'occ_purge_all' );
add_action( 'update_option_occ_gsc', 'occ_purge_all' );
add_action( 'customize_save_after', 'occ_purge_all' );
