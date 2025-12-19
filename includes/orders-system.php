<?php
/**
 * Sistema de Pedidos Fotográficos
 * CPT, Admin, Estados, Archivos, REST API
 */

if (!defined('ABSPATH')) exit;

// =========================================================
// 1. REGISTRAR CPT "Pedidos Fotográficos"
// =========================================================
function ai_register_pedidos_cpt() {
    $labels = [
        'name' => 'Pedidos Fotográficos',
        'singular_name' => 'Pedido Fotográfico',
        'menu_name' => 'Pedidos Fotográficos',
        'add_new' => 'Nuevo Pedido',
        'add_new_item' => 'Añadir Nuevo Pedido',
        'edit_item' => 'Editar Pedido',
        'new_item' => 'Nuevo Pedido',
        'view_item' => 'Ver Pedido',
        'search_items' => 'Buscar Pedidos',
        'not_found' => 'No se encontraron pedidos',
        'not_found_in_trash' => 'No se encontraron pedidos en la papelera'
    ];

    $args = [
        'labels' => $labels,
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-camera',
        'capability_type' => 'post',
        'capabilities' => [
            'create_posts' => 'manage_options',
            'edit_posts' => 'manage_options',
            'edit_others_posts' => 'manage_options',
            'publish_posts' => 'manage_options',
            'read_private_posts' => 'manage_options',
            'delete_posts' => 'manage_options',
        ],
        'map_meta_cap' => true,
        'hierarchical' => false,
        'supports' => ['title', 'editor'],
        'has_archive' => false,
        'rewrite' => false,
        'query_var' => false,
    ];

    register_post_type('ai_pedido', $args);
}
add_action('init', 'ai_register_pedidos_cpt');

// =========================================================
// 2. CAMPOS PERSONALIZADOS (Meta Boxes)
// =========================================================
function ai_add_pedido_meta_boxes() {
    add_meta_box(
        'ai_pedido_info',
        'Información del Pedido',
        'ai_pedido_info_callback',
        'ai_pedido',
        'normal',
        'high'
    );
    
    add_meta_box(
        'ai_pedido_archivos',
        'Archivos del Pedido',
        'ai_pedido_archivos_callback',
        'ai_pedido',
        'normal',
        'high'
    );
    
    add_meta_box(
        'ai_pedido_estados',
        'Estados Operativos',
        'ai_pedido_estados_callback',
        'ai_pedido',
        'side',
        'default'
    );
}
add_action('add_meta_boxes', 'ai_add_pedido_meta_boxes');

function ai_pedido_info_callback($post) {
    wp_nonce_field('ai_save_pedido_meta', 'ai_pedido_meta_nonce');
    
    $cliente_nombre = get_post_meta($post->ID, '_ai_cliente_nombre', true);
    $cliente_email = get_post_meta($post->ID, '_ai_cliente_email', true);
    $cliente_telefono = get_post_meta($post->ID, '_ai_cliente_telefono', true);
    $cliente_dni = get_post_meta($post->ID, '_ai_cliente_dni', true);
    
    $entrega_modo = get_post_meta($post->ID, '_ai_entrega_modo', true);
    $entrega_direccion = get_post_meta($post->ID, '_ai_entrega_direccion', true);
    $entrega_ciudad = get_post_meta($post->ID, '_ai_entrega_ciudad', true);
    $entrega_distrito = get_post_meta($post->ID, '_ai_entrega_distrito', true);
    $entrega_provincia = get_post_meta($post->ID, '_ai_entrega_provincia', true);
    $entrega_departamento = get_post_meta($post->ID, '_ai_entrega_departamento', true);
    $entrega_codigo_postal = get_post_meta($post->ID, '_ai_entrega_codigo_postal', true);
    
    $pago_metodo = get_post_meta($post->ID, '_ai_pago_metodo', true);
    $pago_monto = get_post_meta($post->ID, '_ai_pago_monto', true);
    $pago_moneda = get_post_meta($post->ID, '_ai_pago_moneda', true);
    $pago_transaccion_id = get_post_meta($post->ID, '_ai_pago_transaccion_id', true);
    
    $items = get_post_meta($post->ID, '_ai_items', true);
    if (!is_array($items)) $items = [];
    
    ?>
    <table class="form-table">
        <tr>
            <th><label>Cliente</label></th>
            <td>
                <input type="text" name="cliente_nombre" value="<?php echo esc_attr($cliente_nombre); ?>" class="regular-text" />
                <p class="description">Nombre completo</p>
            </td>
        </tr>
        <tr>
            <th><label>Email</label></th>
            <td>
                <input type="email" name="cliente_email" value="<?php echo esc_attr($cliente_email); ?>" class="regular-text" />
            </td>
        </tr>
        <tr>
            <th><label>Teléfono</label></th>
            <td>
                <input type="text" name="cliente_telefono" value="<?php echo esc_attr($cliente_telefono); ?>" class="regular-text" />
            </td>
        </tr>
        <tr>
            <th><label>DNI</label></th>
            <td>
                <input type="text" name="cliente_dni" value="<?php echo esc_attr($cliente_dni); ?>" class="regular-text" />
            </td>
        </tr>
        <tr>
            <th><label>Tipo de Entrega</label></th>
            <td>
                <select name="entrega_modo">
                    <option value="tienda" <?php selected($entrega_modo, 'tienda'); ?>>Recojo en Tienda</option>
                    <option value="domicilio" <?php selected($entrega_modo, 'domicilio'); ?>>Envío a Domicilio</option>
                </select>
            </td>
        </tr>
        <?php if ($entrega_modo === 'domicilio'): ?>
        <tr>
            <th><label>Dirección</label></th>
            <td>
                <input type="text" name="entrega_direccion" value="<?php echo esc_attr($entrega_direccion); ?>" class="regular-text" />
            </td>
        </tr>
        <tr>
            <th><label>Ciudad</label></th>
            <td>
                <input type="text" name="entrega_ciudad" value="<?php echo esc_attr($entrega_ciudad); ?>" class="regular-text" />
            </td>
        </tr>
        <tr>
            <th><label>Distrito</label></th>
            <td>
                <input type="text" name="entrega_distrito" value="<?php echo esc_attr($entrega_distrito); ?>" class="regular-text" />
            </td>
        </tr>
        <tr>
            <th><label>Provincia</label></th>
            <td>
                <input type="text" name="entrega_provincia" value="<?php echo esc_attr($entrega_provincia); ?>" class="regular-text" />
            </td>
        </tr>
        <tr>
            <th><label>Departamento</label></th>
            <td>
                <input type="text" name="entrega_departamento" value="<?php echo esc_attr($entrega_departamento); ?>" class="regular-text" />
            </td>
        </tr>
        <tr>
            <th><label>Código Postal</label></th>
            <td>
                <input type="text" name="entrega_codigo_postal" value="<?php echo esc_attr($entrega_codigo_postal); ?>" class="regular-text" />
            </td>
        </tr>
        <?php endif; ?>
        <tr>
            <th><label>Método de Pago</label></th>
            <td>
                <select name="pago_metodo">
                    <option value="">Seleccionar...</option>
                    <option value="stripe" <?php selected($pago_metodo, 'stripe'); ?>>Stripe</option>
                    <option value="mercado_pago" <?php selected($pago_metodo, 'mercado_pago'); ?>>Mercado Pago</option>
                    <option value="yape" <?php selected($pago_metodo, 'yape'); ?>>Yape</option>
                </select>
            </td>
        </tr>
        <tr>
            <th><label>Monto Total</label></th>
            <td>
                <input type="number" step="0.01" name="pago_monto" value="<?php echo esc_attr($pago_monto); ?>" class="small-text" />
                <select name="pago_moneda">
                    <option value="PEN" <?php selected($pago_moneda, 'PEN'); ?>>PEN (S/)</option>
                    <option value="EUR" <?php selected($pago_moneda, 'EUR'); ?>>EUR (€)</option>
                </select>
            </td>
        </tr>
        <tr>
            <th><label>ID Transacción</label></th>
            <td>
                <input type="text" name="pago_transaccion_id" value="<?php echo esc_attr($pago_transaccion_id); ?>" class="regular-text" />
                <p class="description">ID de la transacción en la pasarela de pago</p>
            </td>
        </tr>
    </table>
    
    <h3>Items del Pedido</h3>
    <div id="ai-items-container">
        <?php foreach ($items as $idx => $item): ?>
        <div class="ai-item-row" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px;">
            <p><strong>Item <?php echo $idx + 1; ?></strong></p>
            <p>Título: <?php echo esc_html($item['title'] ?? ''); ?></p>
            <p>Formato: <?php echo esc_html($item['format'] ?? ''); ?></p>
            <p>Cantidad: <?php echo esc_html($item['quantity'] ?? 1); ?></p>
            <p>Precio: <?php echo esc_html($item['price'] ?? ''); ?></p>
            <?php if (!empty($item['imgSrc'])): ?>
            <p>Imagen: <img src="<?php echo esc_url($item['imgSrc']); ?>" style="max-width: 100px; max-height: 100px;" /></p>
            <?php endif; ?>
        </div>
        <?php endforeach; ?>
    </div>
    <?php
}

function ai_pedido_archivos_callback($post) {
    $archivos = get_post_meta($post->ID, '_ai_archivos', true);
    if (!is_array($archivos)) $archivos = [];
    
    ?>
    <div id="ai-archivos-container">
        <?php if (empty($archivos)): ?>
            <p>No hay archivos asociados a este pedido.</p>
        <?php else: ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Miniatura</th>
                        <th>Tamaño</th>
                        <th>Cantidad</th>
                        <th>DPI</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($archivos as $idx => $archivo): ?>
                    <tr>
                        <td>
                            <?php if (!empty($archivo['imagen'])): ?>
                            <img src="<?php echo esc_url($archivo['imagen']); ?>" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" />
                            <?php else: ?>
                            <span>Sin imagen</span>
                            <?php endif; ?>
                        </td>
                        <td><?php echo esc_html($archivo['size_id'] ?? 'N/A'); ?></td>
                        <td><?php echo esc_html($archivo['qty'] ?? 1); ?></td>
                        <td>
                            <?php 
                            $dpi_status = $archivo['dpi_status'] ?? 'unknown';
                            $dpi_class = $dpi_status === 'ok' ? 'green' : ($dpi_status === 'warning' ? 'orange' : 'red');
                            ?>
                            <span style="color: <?php echo $dpi_class; ?>; font-weight: bold;">
                                <?php echo strtoupper($dpi_status); ?>
                            </span>
                        </td>
                        <td>
                            <?php if (!empty($archivo['imagen'])): ?>
                            <a href="<?php echo esc_url($archivo['imagen']); ?>" download class="button button-small">Descargar</a>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <p style="margin-top: 15px;">
                <button type="button" class="button button-primary" onclick="aiDescargarZIP(<?php echo $post->ID; ?>)">
                    Descargar Todo en ZIP
                </button>
            </p>
        <?php endif; ?>
    </div>
    
    <script>
    function aiDescargarZIP(pedidoId) {
        window.location.href = ajaxurl + '?action=ai_descargar_zip&pedido_id=' + pedidoId + '&nonce=<?php echo wp_create_nonce("ai_descargar_zip"); ?>';
    }
    </script>
    <?php
}

function ai_pedido_estados_callback($post) {
    wp_nonce_field('ai_save_pedido_meta', 'ai_pedido_meta_nonce');
    
    $status_pago = get_post_meta($post->ID, '_ai_status_pago', true);
    $status_produccion = get_post_meta($post->ID, '_ai_status_produccion', true);
    $archivos_revisados = get_post_meta($post->ID, '_ai_archivos_revisados', true);
    $archivos_enviados_minilab = get_post_meta($post->ID, '_ai_archivos_enviados_minilab', true);
    $nota_operador = get_post_meta($post->ID, '_ai_nota_operador', true);
    
    ?>
    <p>
        <label><strong>Estado de Pago:</strong></label><br/>
        <select name="status_pago" style="width: 100%;">
            <option value="pendiente_pago" <?php selected($status_pago, 'pendiente_pago'); ?>>Pendiente de Pago</option>
            <option value="pagado_parcial" <?php selected($status_pago, 'pagado_parcial'); ?>>Pagado Parcial</option>
            <option value="pagado" <?php selected($status_pago, 'pagado'); ?>>Pagado</option>
        </select>
    </p>
    
    <p>
        <label><strong>Estado de Producción:</strong></label><br/>
        <select name="status_produccion" style="width: 100%;">
            <option value="" <?php selected($status_produccion, ''); ?>>Sin estado</option>
            <option value="archivos_listos" <?php selected($status_produccion, 'archivos_listos'); ?>>Archivos Listos</option>
            <option value="enviado_minilab" <?php selected($status_produccion, 'enviado_minilab'); ?>>Enviado al Minilab</option>
            <option value="impreso" <?php selected($status_produccion, 'impreso'); ?>>Impreso</option>
            <option value="entregado" <?php selected($status_produccion, 'entregado'); ?>>Entregado</option>
        </select>
    </p>
    
    <p>
        <label>
            <input type="checkbox" name="archivos_revisados" value="1" <?php checked($archivos_revisados, '1'); ?> />
            Archivos Revisados
        </label>
    </p>
    
    <p>
        <label>
            <input type="checkbox" name="archivos_enviados_minilab" value="1" <?php checked($archivos_enviados_minilab, '1'); ?> />
            Archivos Enviados al Minilab
        </label>
    </p>
    
    <p>
        <label><strong>Nota del Operador:</strong></label><br/>
        <textarea name="nota_operador" rows="4" style="width: 100%;"><?php echo esc_textarea($nota_operador); ?></textarea>
    </p>
    <?php
}

// Guardar meta boxes
function ai_save_pedido_meta($post_id) {
    if (!isset($_POST['ai_pedido_meta_nonce']) || !wp_verify_nonce($_POST['ai_pedido_meta_nonce'], 'ai_save_pedido_meta')) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;
    
    // Guardar datos del cliente
    if (isset($_POST['cliente_nombre'])) update_post_meta($post_id, '_ai_cliente_nombre', sanitize_text_field($_POST['cliente_nombre']));
    if (isset($_POST['cliente_email'])) update_post_meta($post_id, '_ai_cliente_email', sanitize_email($_POST['cliente_email']));
    if (isset($_POST['cliente_telefono'])) update_post_meta($post_id, '_ai_cliente_telefono', sanitize_text_field($_POST['cliente_telefono']));
    if (isset($_POST['cliente_dni'])) update_post_meta($post_id, '_ai_cliente_dni', sanitize_text_field($_POST['cliente_dni']));
    
    // Guardar datos de entrega
    if (isset($_POST['entrega_modo'])) update_post_meta($post_id, '_ai_entrega_modo', sanitize_text_field($_POST['entrega_modo']));
    if (isset($_POST['entrega_direccion'])) update_post_meta($post_id, '_ai_entrega_direccion', sanitize_text_field($_POST['entrega_direccion']));
    if (isset($_POST['entrega_ciudad'])) update_post_meta($post_id, '_ai_entrega_ciudad', sanitize_text_field($_POST['entrega_ciudad']));
    if (isset($_POST['entrega_distrito'])) update_post_meta($post_id, '_ai_entrega_distrito', sanitize_text_field($_POST['entrega_distrito']));
    if (isset($_POST['entrega_provincia'])) update_post_meta($post_id, '_ai_entrega_provincia', sanitize_text_field($_POST['entrega_provincia']));
    if (isset($_POST['entrega_departamento'])) update_post_meta($post_id, '_ai_entrega_departamento', sanitize_text_field($_POST['entrega_departamento']));
    if (isset($_POST['entrega_codigo_postal'])) update_post_meta($post_id, '_ai_entrega_codigo_postal', sanitize_text_field($_POST['entrega_codigo_postal']));
    
    // Guardar datos de pago
    if (isset($_POST['pago_metodo'])) update_post_meta($post_id, '_ai_pago_metodo', sanitize_text_field($_POST['pago_metodo']));
    if (isset($_POST['pago_monto'])) update_post_meta($post_id, '_ai_pago_monto', floatval($_POST['pago_monto']));
    if (isset($_POST['pago_moneda'])) update_post_meta($post_id, '_ai_pago_moneda', sanitize_text_field($_POST['pago_moneda']));
    if (isset($_POST['pago_transaccion_id'])) update_post_meta($post_id, '_ai_pago_transaccion_id', sanitize_text_field($_POST['pago_transaccion_id']));
    
    // Guardar estados
    if (isset($_POST['status_pago'])) update_post_meta($post_id, '_ai_status_pago', sanitize_text_field($_POST['status_pago']));
    if (isset($_POST['status_produccion'])) update_post_meta($post_id, '_ai_status_produccion', sanitize_text_field($_POST['status_produccion']));
    if (isset($_POST['archivos_revisados'])) update_post_meta($post_id, '_ai_archivos_revisados', '1');
    else update_post_meta($post_id, '_ai_archivos_revisados', '0');
    if (isset($_POST['archivos_enviados_minilab'])) update_post_meta($post_id, '_ai_archivos_enviados_minilab', '1');
    else update_post_meta($post_id, '_ai_archivos_enviados_minilab', '0');
    if (isset($_POST['nota_operador'])) update_post_meta($post_id, '_ai_nota_operador', sanitize_textarea_field($_POST['nota_operador']));
    
    // Disparar acción cuando el pedido pasa a pagado
    $old_status = get_post_meta($post_id, '_ai_status_pago', true);
    if ($old_status !== 'pagado' && isset($_POST['status_pago']) && $_POST['status_pago'] === 'pagado') {
        do_action('ai_pedido_pagado', $post_id);
    }
}
add_action('save_post_ai_pedido', 'ai_save_pedido_meta');

// =========================================================
// 3. COLUMNAS PERSONALIZADAS EN LISTADO
// =========================================================
function ai_pedidos_columns($columns) {
    $new_columns = [];
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = 'Pedido';
    $new_columns['cliente'] = 'Cliente';
    $new_columns['entrega'] = 'Entrega';
    $new_columns['pago'] = 'Info Pago';
    $new_columns['total'] = 'Total';
    $new_columns['estado_produccion'] = 'Estado Producción';
    $new_columns['date'] = 'Fecha';
    return $new_columns;
}
add_filter('manage_ai_pedido_posts_columns', 'ai_pedidos_columns');

function ai_pedidos_column_content($column, $post_id) {
    switch ($column) {
        case 'cliente':
            $nombre = get_post_meta($post_id, '_ai_cliente_nombre', true);
            $email = get_post_meta($post_id, '_ai_cliente_email', true);
            echo esc_html($nombre ?: 'N/A');
            if ($email) echo '<br/><small>' . esc_html($email) . '</small>';
            break;
            
        case 'entrega':
            $modo = get_post_meta($post_id, '_ai_entrega_modo', true);
            if ($modo === 'domicilio') {
                $direccion = get_post_meta($post_id, '_ai_entrega_direccion', true);
                echo 'Domicilio';
                if ($direccion) echo '<br/><small>' . esc_html($direccion) . '</small>';
            } else {
                echo 'Tienda';
            }
            break;
            
        case 'pago':
            $metodo = get_post_meta($post_id, '_ai_pago_metodo', true);
            $transaccion = get_post_meta($post_id, '_ai_pago_transaccion_id', true);
            $status = get_post_meta($post_id, '_ai_status_pago', true);
            
            $metodo_label = [
                'stripe' => 'Stripe',
                'mercado_pago' => 'Mercado Pago',
                'yape' => 'Yape'
            ];
            
            echo esc_html($metodo_label[$metodo] ?? $metodo ?: 'N/A');
            if ($transaccion) echo '<br/><small>ID: ' . esc_html(substr($transaccion, 0, 20)) . '...</small>';
            if ($status) echo '<br/><small style="color: ' . ($status === 'pagado' ? 'green' : 'orange') . ';">' . esc_html(ucfirst(str_replace('_', ' ', $status))) . '</small>';
            break;
            
        case 'total':
            $monto = get_post_meta($post_id, '_ai_pago_monto', true);
            $moneda = get_post_meta($post_id, '_ai_pago_moneda', true);
            if ($monto) {
                $symbol = $moneda === 'PEN' ? 'S/' : '€';
                echo $symbol . ' ' . number_format($monto, 2);
            } else {
                echo 'N/A';
            }
            break;
            
        case 'estado_produccion':
            $status = get_post_meta($post_id, '_ai_status_produccion', true);
            if ($status) {
                $labels = [
                    'archivos_listos' => 'Archivos Listos',
                    'enviado_minilab' => 'Enviado al Minilab',
                    'impreso' => 'Impreso',
                    'entregado' => 'Entregado'
                ];
                echo '<span style="background: #2271b1; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">' . esc_html($labels[$status] ?? $status) . '</span>';
            } else {
                echo '<span style="color: #999;">Sin estado</span>';
            }
            break;
    }
}
add_action('manage_ai_pedido_posts_custom_column', 'ai_pedidos_column_content', 10, 2);

// =========================================================
// 4. FUNCIÓN PARA CREAR PEDIDO DESDE EL FRONTEND
// =========================================================
function ai_crear_pedido($datos) {
    $post_data = [
        'post_title' => 'Pedido Web #' . time(),
        'post_status' => 'publish',
        'post_type' => 'ai_pedido',
    ];
    
    $post_id = wp_insert_post($post_data);
    
    if (is_wp_error($post_id)) {
        return false;
    }
    
    // Guardar datos del cliente
    if (!empty($datos['userData']['name'])) update_post_meta($post_id, '_ai_cliente_nombre', sanitize_text_field($datos['userData']['name']));
    if (!empty($datos['userData']['email'])) update_post_meta($post_id, '_ai_cliente_email', sanitize_email($datos['userData']['email']));
    if (!empty($datos['userData']['phone'])) update_post_meta($post_id, '_ai_cliente_telefono', sanitize_text_field($datos['userData']['phone']));
    if (!empty($datos['userData']['dni'])) update_post_meta($post_id, '_ai_cliente_dni', sanitize_text_field($datos['userData']['dni']));
    
    // Guardar datos de entrega
    $deliveryType = $datos['deliveryType'] ?? 'pickup';
    update_post_meta($post_id, '_ai_entrega_modo', $deliveryType === 'delivery' ? 'domicilio' : 'tienda');
    
    if ($deliveryType === 'delivery' && !empty($datos['userData'])) {
        if (!empty($datos['userData']['address'])) update_post_meta($post_id, '_ai_entrega_direccion', sanitize_text_field($datos['userData']['address']));
        if (!empty($datos['userData']['city'])) update_post_meta($post_id, '_ai_entrega_ciudad', sanitize_text_field($datos['userData']['city']));
        if (!empty($datos['userData']['zip'])) update_post_meta($post_id, '_ai_entrega_codigo_postal', sanitize_text_field($datos['userData']['zip']));
    }
    
    // Guardar items y archivos
    if (!empty($datos['items']) && is_array($datos['items'])) {
        update_post_meta($post_id, '_ai_items', $datos['items']);
        
        // Extraer archivos de los items
        $archivos = [];
        foreach ($datos['items'] as $item) {
            if (!empty($item['imgSrc'])) {
                $archivos[] = [
                    'imagen' => $item['imgSrc'],
                    'size_id' => $item['format'] ?? 'N/A',
                    'qty' => $item['quantity'] ?? 1,
                    'dpi_status' => 'unknown' // Se calculará después
                ];
            }
        }
        if (!empty($archivos)) {
            update_post_meta($post_id, '_ai_archivos', $archivos);
        }
    }
    
    // Estado inicial
    update_post_meta($post_id, '_ai_status_pago', 'pendiente_pago');
    update_post_meta($post_id, '_ai_status_produccion', '');
    
    return $post_id;
}

// =========================================================
// 5. ACTUALIZAR PEDIDO CUANDO SE COMPLETA EL PAGO
// =========================================================
function ai_actualizar_pedido_pagado($pedido_id, $metodo_pago, $transaccion_id, $monto, $moneda = 'PEN') {
    update_post_meta($pedido_id, '_ai_status_pago', 'pagado');
    update_post_meta($pedido_id, '_ai_pago_metodo', $metodo_pago);
    update_post_meta($pedido_id, '_ai_pago_transaccion_id', $transaccion_id);
    update_post_meta($pedido_id, '_ai_pago_monto', $monto);
    update_post_meta($pedido_id, '_ai_pago_moneda', $moneda);
    
    // Disparar acción para webhook
    do_action('ai_pedido_pagado', $pedido_id);
}

