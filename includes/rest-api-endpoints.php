<?php
/**
 * REST API Endpoints para Django
 * GET /wp-json/ai/v1/pedidos
 */

if (!defined('ABSPATH')) exit;

// =========================================================
// REGISTRAR ENDPOINT REST
// =========================================================
function ai_register_rest_routes() {
    register_rest_route('ai/v1', '/pedidos', [
        'methods' => 'GET',
        'callback' => 'ai_rest_get_pedidos',
        'permission_callback' => 'ai_rest_check_auth',
    ]);
}
add_action('rest_api_init', 'ai_register_rest_routes');

// =========================================================
// VERIFICAR AUTENTICACIÓN
// =========================================================
function ai_rest_check_auth($request) {
    $api_key = $request->get_header('X-API-KEY');
    $stored_key = get_option('ai_api_key', '');
    
    if (empty($stored_key)) {
        return new WP_Error('no_api_key', 'API Key no configurada en WordPress', ['status' => 500]);
    }
    
    if (empty($api_key) || $api_key !== $stored_key) {
        return new WP_Error('unauthorized', 'API Key inválida', ['status' => 401]);
    }
    
    return true;
}

// =========================================================
// ENDPOINT: GET PEDIDOS
// =========================================================
function ai_rest_get_pedidos($request) {
    $estado = $request->get_param('estado');
    $desde = $request->get_param('desde');
    
    $args = [
        'post_type' => 'ai_pedido',
        'posts_per_page' => 100,
        'post_status' => 'publish',
        'orderby' => 'date',
        'order' => 'DESC',
    ];
    
    // Filtrar por estado de pago
    if ($estado) {
        $meta_query = [
            [
                'key' => '_ai_status_pago',
                'value' => $estado,
                'compare' => '='
            ]
        ];
        $args['meta_query'] = $meta_query;
    }
    
    // Filtrar por fecha
    if ($desde) {
        try {
            $desde_date = new DateTime($desde);
            $args['date_query'] = [
                [
                    'after' => $desde_date->format('Y-m-d H:i:s'),
                    'inclusive' => false,
                ]
            ];
        } catch (Exception $e) {
            return new WP_Error('invalid_date', 'Formato de fecha inválido. Use ISO8601.', ['status' => 400]);
        }
    }
    
    $posts = get_posts($args);
    $pedidos = [];
    
    foreach ($posts as $post) {
        $pedido = ai_build_pedido_payload($post->ID);
        $pedidos[] = $pedido;
    }
    
    return [
        'data' => $pedidos
    ];
}

// =========================================================
// CONSTRUIR PAYLOAD DE PEDIDO (usado también en webhook)
// =========================================================
function ai_build_pedido_payload($pedido_id) {
    $post = get_post($pedido_id);
    if (!$post || $post->post_type !== 'ai_pedido') {
        return null;
    }
    
    $cliente_nombre = get_post_meta($pedido_id, '_ai_cliente_nombre', true);
    $cliente_email = get_post_meta($pedido_id, '_ai_cliente_email', true);
    $cliente_telefono = get_post_meta($pedido_id, '_ai_cliente_telefono', true);
    
    $entrega_modo = get_post_meta($pedido_id, '_ai_entrega_modo', true);
    $entrega_direccion = get_post_meta($pedido_id, '_ai_entrega_direccion', true);
    $entrega_distrito = get_post_meta($pedido_id, '_ai_entrega_distrito', true);
    $entrega_provincia = get_post_meta($pedido_id, '_ai_entrega_provincia', true);
    $entrega_departamento = get_post_meta($pedido_id, '_ai_entrega_departamento', true);
    
    $pago_metodo = get_post_meta($pedido_id, '_ai_pago_metodo', true);
    $pago_monto = get_post_meta($pedido_id, '_ai_pago_monto', true);
    $pago_moneda = get_post_meta($pedido_id, '_ai_pago_moneda', true) ?: 'PEN';
    
    $status_pago = get_post_meta($pedido_id, '_ai_status_pago', true);
    $status_produccion = get_post_meta($pedido_id, '_ai_status_produccion', true);
    
    $items_raw = get_post_meta($pedido_id, '_ai_items', true);
    $items = [];
    
    if (is_array($items_raw)) {
        foreach ($items_raw as $item) {
            // Extraer size_id del format (ej: "10x15 cm - €0.75" -> "10x15")
            $format = $item['format'] ?? '';
            $size_id = '';
            if (preg_match('/(\d+x\d+)/', $format, $matches)) {
                $size_id = $matches[1];
            } elseif (preg_match('/([A-Z]\d+)/', $format, $matches)) {
                $size_id = $matches[1]; // A4, A3, etc.
            } else {
                $size_id = 'custom';
            }
            
            $items[] = [
                'size_id' => $size_id,
                'size_label' => $format,
                'qty' => intval($item['quantity'] ?? 1),
            ];
        }
    }
    
    // Formatear fechas en ISO8601
    $created_at = get_post_time('c', false, $pedido_id);
    $updated_at = get_post_modified_time('c', false, $pedido_id);
    
    return [
        'id' => intval($pedido_id),
        'external_id' => 'WP-' . $pedido_id,
        'status_pago' => $status_pago ?: 'pendiente_pago',
        'status_produccion' => $status_produccion ?: '',
        'created_at' => $created_at,
        'updated_at' => $updated_at,
        'cliente' => [
            'nombre' => $cliente_nombre ?: '',
            'email' => $cliente_email ?: '',
            'telefono' => $cliente_telefono ?: '',
        ],
        'entrega' => [
            'modo' => $entrega_modo ?: 'tienda',
            'direccion' => $entrega_direccion ?: '',
            'distrito' => $entrega_distrito ?: '',
            'provincia' => $entrega_provincia ?: '',
            'departamento' => $entrega_departamento ?: '',
        ],
        'pago' => [
            'metodo' => $pago_metodo ?: '',
            'monto_total' => floatval($pago_monto ?: 0),
            'moneda' => $pago_moneda,
        ],
        'items' => $items,
    ];
}

