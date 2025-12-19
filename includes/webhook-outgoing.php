<?php
/**
 * Webhook Saliente: Notificar a Django cuando un pedido se paga
 */

if (!defined('ABSPATH')) exit;

// =========================================================
// LISTENER: CUANDO UN PEDIDO SE PAGA
// =========================================================
function ai_notificar_django($pedido_id) {
    $settings = [
        'url' => get_option('ai_webhook_url', ''),
        'secret' => get_option('ai_webhook_secret', ''),
        'enabled' => get_option('ai_webhook_enabled', '0'),
    ];
    
    if (empty($settings['enabled']) || empty($settings['url'])) {
        return; // Webhook deshabilitado o sin URL
    }
    
    $payload = ai_build_pedido_payload($pedido_id);
    if (!$payload) {
        return;
    }
    
    $headers = [
        'Content-Type' => 'application/json',
        'X-Integration-Source' => 'wp_photo_plugin',
    ];
    
    if (!empty($settings['secret'])) {
        $headers['X-Integration-Secret'] = $settings['secret'];
    }
    
    $response = wp_remote_post($settings['url'], [
        'headers' => $headers,
        'body' => wp_json_encode($payload),
        'timeout' => 10,
        'blocking' => false, // No bloquear la ejecución
    ]);
    
    // Log opcional
    $log_dir = wp_upload_dir()['basedir'] . '/ai_integracion';
    if (!file_exists($log_dir)) {
        wp_mkdir_p($log_dir);
    }
    
    $log_file = $log_dir . '/integration.log';
    $log_entry = date('Y-m-d H:i:s') . " - Pedido #{$pedido_id} enviado a Django\n";
    if (is_wp_error($response)) {
        $log_entry .= "  Error: " . $response->get_error_message() . "\n";
    } else {
        $log_entry .= "  HTTP " . wp_remote_retrieve_response_code($response) . "\n";
    }
    $log_entry .= "\n";
    
    @file_put_contents($log_file, $log_entry, FILE_APPEND);
}
add_action('ai_pedido_pagado', 'ai_notificar_django', 10, 1);

