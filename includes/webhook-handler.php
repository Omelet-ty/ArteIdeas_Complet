<?php
/**
 * Webhook Handler: Procesar notificaciones de Mercado Pago y Stripe
 */

if (!defined('ABSPATH')) exit;

// =========================================================
// WEBHOOK MERCADO PAGO
// =========================================================
add_action('wp_ajax_ai_webhook_mp', 'ai_handle_webhook_mp');
add_action('wp_ajax_nopriv_ai_webhook_mp', 'ai_handle_webhook_mp');

function ai_handle_webhook_mp() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Log
    $log_dir = wp_upload_dir()['basedir'] . '/ai_integracion';
    if (!file_exists($log_dir)) {
        wp_mkdir_p($log_dir);
    }
    @file_put_contents($log_dir . '/webhook_mp.log', date('Y-m-d H:i:s') . " - " . $input . "\n", FILE_APPEND);
    
    if (empty($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        exit;
    }
    
    // Procesar según el tipo de notificación
    if (isset($data['type']) && $data['type'] === 'payment') {
        // Notificación de pago
        $payment_id = $data['data']['id'] ?? null;
        if ($payment_id) {
            ai_process_mp_payment($payment_id);
        }
    } elseif (isset($data['topic']) && $data['topic'] === 'merchant_order') {
        // Notificación de merchant_order
        $resource = $data['resource'] ?? null;
        if ($resource) {
            ai_process_mp_merchant_order($resource);
        }
    }
    
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit;
}

function ai_process_mp_payment($payment_id) {
    if (!class_exists('MercadoPago\SDK')) return;
    
    try {
        \MercadoPago\SDK::setAccessToken(AI_MP_ACCESS_TOKEN);
        $payment = \MercadoPago\Payment::find_by_id($payment_id);
        
        if (!$payment || $payment->status !== 'approved') {
            return;
        }
        
        // Buscar pedido por preference_id en metadata
        $preference_id = $payment->preference_id ?? null;
        if ($preference_id) {
            $pedidos = get_posts([
                'post_type' => 'ai_pedido',
                'meta_key' => '_ai_mp_preference_id',
                'meta_value' => $preference_id,
                'posts_per_page' => 1,
            ]);
            
            if (!empty($pedidos)) {
                $pedido_id = $pedidos[0]->ID;
                ai_actualizar_pedido_pagado(
                    $pedido_id,
                    'mercado_pago',
                    $payment_id,
                    floatval($payment->transaction_amount),
                    strtoupper($payment->currency_id)
                );
            }
        }
    } catch (Exception $e) {
        error_log('Error procesando pago MP: ' . $e->getMessage());
    }
}

function ai_process_mp_merchant_order($resource) {
    if (!class_exists('MercadoPago\SDK')) return;
    
    try {
        \MercadoPago\SDK::setAccessToken(AI_MP_ACCESS_TOKEN);
        
        // Si $resource es una URL, extraer el ID
        if (is_string($resource) && strpos($resource, 'merchant_orders/') !== false) {
            $order_id = basename($resource);
            $merchant_order = \MercadoPago\MerchantOrder::find_by_id($order_id);
        } else {
            $merchant_order = $resource;
        }
        
        if (!$merchant_order || $merchant_order->status !== 'closed') {
            return;
        }
        
        // Buscar pedido por preference_id
        $preference_id = $merchant_order->preference_id ?? null;
        if ($preference_id) {
            $pedidos = get_posts([
                'post_type' => 'ai_pedido',
                'meta_key' => '_ai_mp_preference_id',
                'meta_value' => $preference_id,
                'posts_per_page' => 1,
            ]);
            
            if (!empty($pedidos)) {
                $pedido_id = $pedidos[0]->ID;
                $paid_amount = floatval($merchant_order->paid_amount ?? 0);
                $currency = strtoupper($merchant_order->currency_id ?? 'PEN');
                
                ai_actualizar_pedido_pagado(
                    $pedido_id,
                    'mercado_pago',
                    $merchant_order->id,
                    $paid_amount,
                    $currency
                );
            }
        }
    } catch (Exception $e) {
        error_log('Error procesando merchant_order MP: ' . $e->getMessage());
    }
}

// =========================================================
// WEBHOOK STRIPE (opcional, para futuro)
// =========================================================
add_action('wp_ajax_ai_webhook_stripe', 'ai_handle_webhook_stripe');
add_action('wp_ajax_nopriv_ai_webhook_stripe', 'ai_handle_webhook_stripe');

function ai_handle_webhook_stripe() {
    $payload = @file_get_contents('php://input');
    $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
    $webhook_secret = get_option('ai_stripe_webhook_secret', '');
    
    if (empty($webhook_secret)) {
        http_response_code(400);
        exit;
    }
    
    try {
        $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $webhook_secret);
        
        if ($event->type === 'payment_intent.succeeded') {
            $payment_intent = $event->data->object;
            $pedido_id = $payment_intent->metadata->pedido_id ?? null;
            
            if ($pedido_id) {
                ai_actualizar_pedido_pagado(
                    $pedido_id,
                    'stripe',
                    $payment_intent->id,
                    floatval($payment_intent->amount / 100), // Stripe usa centavos
                    strtoupper($payment_intent->currency)
                );
            }
        }
        
        http_response_code(200);
        echo json_encode(['status' => 'ok']);
    } catch (\Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    exit;
}

