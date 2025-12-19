<?php
/**
 * Descargar archivos del pedido en ZIP
 */

if (!defined('ABSPATH')) exit;

// =========================================================
// AJAX: DESCARGAR ZIP
// =========================================================
add_action('wp_ajax_ai_descargar_zip', 'ai_handle_descargar_zip');
add_action('wp_ajax_nopriv_ai_descargar_zip', 'ai_handle_descargar_zip');

function ai_handle_descargar_zip() {
    if (!check_ajax_referer('ai_descargar_zip', 'nonce', false)) {
        wp_die('Acceso no autorizado');
    }
    
    $pedido_id = intval($_GET['pedido_id'] ?? 0);
    if (!$pedido_id) {
        wp_die('ID de pedido inválido');
    }
    
    if (!current_user_can('read_ai_pedido', $pedido_id)) {
        wp_die('No tienes permisos para ver este pedido');
    }
    
    $archivos = get_post_meta($pedido_id, '_ai_archivos', true);
    if (!is_array($archivos) || empty($archivos)) {
        wp_die('No hay archivos para descargar');
    }
    
    // Crear ZIP
    $zip = new ZipArchive();
    $zip_filename = wp_upload_dir()['basedir'] . '/ai_pedidos/pedido_' . $pedido_id . '_' . time() . '.zip';
    $zip_dir = dirname($zip_filename);
    
    if (!file_exists($zip_dir)) {
        wp_mkdir_p($zip_dir);
    }
    
    if ($zip->open($zip_filename, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
        wp_die('No se pudo crear el archivo ZIP');
    }
    
    foreach ($archivos as $idx => $archivo) {
        if (empty($archivo['imagen'])) continue;
        
        $image_url = $archivo['imagen'];
        
        // Si es base64, guardarlo temporalmente
        if (strpos($image_url, 'data:image') === 0) {
            $image_data = explode(',', $image_url)[1];
            $image_decoded = base64_decode($image_data);
            $ext = 'png';
            if (strpos($image_url, 'image/jpeg') !== false) $ext = 'jpg';
            elseif (strpos($image_url, 'image/webp') !== false) $ext = 'webp';
            
            $zip->addFromString('foto_' . ($idx + 1) . '.' . $ext, $image_decoded);
        } else {
            // Si es URL, descargarla
            $image_content = @file_get_contents($image_url);
            if ($image_content) {
                $ext = pathinfo(parse_url($image_url, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                $zip->addFromString('foto_' . ($idx + 1) . '.' . $ext, $image_content);
            }
        }
    }
    
    $zip->close();
    
    // Enviar archivo
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="pedido_' . $pedido_id . '.zip"');
    header('Content-Length: ' . filesize($zip_filename));
    readfile($zip_filename);
    
    // Eliminar archivo temporal
    @unlink($zip_filename);
    
    exit;
}

