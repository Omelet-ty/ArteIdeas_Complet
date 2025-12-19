<?php
/**
 * Pantalla de Administración: Sistema de Pedidos Fotográficos
 * Tabs: Listado, Claves de Pago, Gestionar Catálogo, Integración Externa
 */

if (!defined('ABSPATH')) exit;

// =========================================================
// 1. MENÚ ADMIN
// =========================================================
function ai_admin_menu() {
    add_menu_page(
        'Sistema de Pedidos Fotográficos',
        'Pedidos Fotográficos',
        'manage_options',
        'ai-pedidos-sistema',
        'ai_admin_page',
        'dashicons-camera',
        30
    );
}
add_action('admin_menu', 'ai_admin_menu');

// =========================================================
// 2. PANTALLA PRINCIPAL CON TABS
// =========================================================
function ai_admin_page() {
    $active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'listado';
    
    ?>
    <div class="wrap">
        <h1>Sistema de Pedidos Fotográficos</h1>
        
        <nav class="nav-tab-wrapper">
            <a href="?page=ai-pedidos-sistema&tab=listado" class="nav-tab <?php echo $active_tab === 'listado' ? 'nav-tab-active' : ''; ?>">
                Listado de Pedidos
            </a>
            <a href="?page=ai-pedidos-sistema&tab=claves" class="nav-tab <?php echo $active_tab === 'claves' ? 'nav-tab-active' : ''; ?>">
                Claves de Pago
            </a>
            <a href="?page=ai-pedidos-sistema&tab=catalogo" class="nav-tab <?php echo $active_tab === 'catalogo' ? 'nav-tab-active' : ''; ?>">
                Gestionar Catálogo
            </a>
            <a href="?page=ai-pedidos-sistema&tab=integracion" class="nav-tab <?php echo $active_tab === 'integracion' ? 'nav-tab-active' : ''; ?>">
                Integración Externa
            </a>
        </nav>
        
        <div class="tab-content" style="margin-top: 20px;">
            <?php
            switch ($active_tab) {
                case 'listado':
                    ai_tab_listado();
                    break;
                case 'claves':
                    ai_tab_claves();
                    break;
                case 'catalogo':
                    ai_tab_catalogo();
                    break;
                case 'integracion':
                    ai_tab_integracion();
                    break;
            }
            ?>
        </div>
    </div>
    <?php
}

// =========================================================
// TAB: LISTADO (redirige al CPT)
// =========================================================
function ai_tab_listado() {
    ?>
    <p>Para ver y gestionar los pedidos, ve a <a href="<?php echo admin_url('edit.php?post_type=ai_pedido'); ?>">Pedidos Fotográficos</a>.</p>
    <?php
}

// =========================================================
// TAB: CLAVES DE PAGO
// =========================================================
function ai_tab_claves() {
    // Guardar claves
    if (isset($_POST['save_claves']) && check_admin_referer('ai_save_claves')) {
        update_option('ai_stripe_public_key', sanitize_text_field($_POST['stripe_public_key']));
        update_option('ai_stripe_secret_key', sanitize_text_field($_POST['stripe_secret_key']));
        update_option('ai_stripe_webhook_secret', sanitize_text_field($_POST['stripe_webhook_secret']));
        
        update_option('ai_mp_public_key', sanitize_text_field($_POST['mp_public_key']));
        update_option('ai_mp_access_token', sanitize_text_field($_POST['mp_access_token']));
        update_option('ai_mp_webhook_secret', sanitize_text_field($_POST['mp_webhook_secret']));
        
        echo '<div class="notice notice-success"><p>Claves guardadas correctamente.</p></div>';
    }
    
    $stripe_public = get_option('ai_stripe_public_key', '');
    $stripe_secret = get_option('ai_stripe_secret_key', '');
    $stripe_webhook = get_option('ai_stripe_webhook_secret', '');
    
    $mp_public = get_option('ai_mp_public_key', '');
    $mp_token = get_option('ai_mp_access_token', '');
    $mp_webhook = get_option('ai_mp_webhook_secret', '');
    
    ?>
    <form method="post" action="">
        <?php wp_nonce_field('ai_save_claves'); ?>
        
        <h2>Stripe</h2>
        <table class="form-table">
            <tr>
                <th><label>Clave Pública</label></th>
                <td>
                    <input type="text" name="stripe_public_key" value="<?php echo esc_attr($stripe_public); ?>" class="regular-text" />
                    <p class="description">pk_test_... o pk_live_...</p>
                </td>
            </tr>
            <tr>
                <th><label>Clave Secreta</label></th>
                <td>
                    <input type="password" name="stripe_secret_key" value="<?php echo esc_attr($stripe_secret); ?>" class="regular-text" />
                    <p class="description">sk_test_... o sk_live_...</p>
                </td>
            </tr>
            <tr>
                <th><label>Webhook Secret</label></th>
                <td>
                    <input type="text" name="stripe_webhook_secret" value="<?php echo esc_attr($stripe_webhook); ?>" class="regular-text" />
                    <p class="description">whsec_...</p>
                </td>
            </tr>
        </table>
        
        <h2>Mercado Pago</h2>
        <table class="form-table">
            <tr>
                <th><label>Clave Pública</label></th>
                <td>
                    <input type="text" name="mp_public_key" value="<?php echo esc_attr($mp_public); ?>" class="regular-text" />
                    <p class="description">TEST-... o APP_USR-...</p>
                </td>
            </tr>
            <tr>
                <th><label>Access Token</label></th>
                <td>
                    <input type="password" name="mp_access_token" value="<?php echo esc_attr($mp_token); ?>" class="regular-text" />
                    <p class="description">APP_USR-... o TEST-...</p>
                </td>
            </tr>
            <tr>
                <th><label>Webhook Secret</label></th>
                <td>
                    <input type="text" name="mp_webhook_secret" value="<?php echo esc_attr($mp_webhook); ?>" class="regular-text" />
                    <p class="description">Secret para validar webhooks</p>
                </td>
            </tr>
        </table>
        
        <p class="submit">
            <input type="submit" name="save_claves" class="button button-primary" value="Guardar Claves" />
        </p>
    </form>
    <?php
}

// =========================================================
// TAB: GESTIONAR CATÁLOGO
// =========================================================
function ai_tab_catalogo() {
    // Guardar producto
    if (isset($_POST['save_producto']) && check_admin_referer('ai_save_producto')) {
        $productos = get_option('ai_catalogo_productos', []);
        
        $producto = [
            'id' => sanitize_text_field($_POST['producto_id']),
            'titulo' => sanitize_text_field($_POST['producto_titulo']),
            'precio' => floatval($_POST['producto_precio']),
            'descripcion' => sanitize_textarea_field($_POST['producto_descripcion']),
            'imagen_url' => esc_url_raw($_POST['producto_imagen']),
            'ratio' => floatval($_POST['producto_ratio']),
        ];
        
        $productos[$producto['id']] = $producto;
        update_option('ai_catalogo_productos', $productos);
        
        echo '<div class="notice notice-success"><p>Producto guardado correctamente.</p></div>';
    }
    
    // Eliminar producto
    if (isset($_GET['delete']) && check_admin_referer('ai_delete_producto')) {
        $productos = get_option('ai_catalogo_productos', []);
        unset($productos[$_GET['delete']]);
        update_option('ai_catalogo_productos', $productos);
        echo '<div class="notice notice-success"><p>Producto eliminado.</p></div>';
    }
    
    $productos = get_option('ai_catalogo_productos', []);
    
    ?>
    <h2>Agregar/Editar Producto</h2>
    <form method="post" action="" style="background: #fff; padding: 20px; border: 1px solid #ccc; margin-bottom: 30px;">
        <?php wp_nonce_field('ai_save_producto'); ?>
        <table class="form-table">
            <tr>
                <th><label>ID Fijo</label></th>
                <td>
                    <input type="text" name="producto_id" required class="regular-text" placeholder="Ej: 10x15" />
                    <p class="description">ID único (10x10, 10x15, A4, etc.)</p>
                </td>
            </tr>
            <tr>
                <th><label>Título</label></th>
                <td>
                    <input type="text" name="producto_titulo" required class="regular-text" placeholder="Ej: 10x15 cm" />
                </td>
            </tr>
            <tr>
                <th><label>Precio (S/)</label></th>
                <td>
                    <input type="number" step="0.01" name="producto_precio" required class="small-text" placeholder="0.75" />
                </td>
            </tr>
            <tr>
                <th><label>Descripción</label></th>
                <td>
                    <textarea name="producto_descripcion" rows="3" class="large-text"></textarea>
                </td>
            </tr>
            <tr>
                <th><label>URL de Imagen</label></th>
                <td>
                    <input type="url" name="producto_imagen" class="regular-text" placeholder="https://..." />
                </td>
            </tr>
            <tr>
                <th><label>Ratio (ancho/alto)</label></th>
                <td>
                    <input type="number" step="0.01" name="producto_ratio" required class="small-text" placeholder="0.67" />
                    <p class="description">Ej: 10/15 = 0.67, 1:1 = 1.0</p>
                </td>
            </tr>
        </table>
        <p class="submit">
            <input type="submit" name="save_producto" class="button button-primary" value="Guardar Producto" />
        </p>
    </form>
    
    <h2>Productos Existentes</h2>
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Precio</th>
                <th>Ratio</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($productos)): ?>
            <tr>
                <td colspan="5">No hay productos en el catálogo.</td>
            </tr>
            <?php else: ?>
            <?php foreach ($productos as $id => $prod): ?>
            <tr>
                <td><strong><?php echo esc_html($id); ?></strong></td>
                <td><?php echo esc_html($prod['titulo']); ?></td>
                <td>S/ <?php echo number_format($prod['precio'], 2); ?></td>
                <td><?php echo esc_html($prod['ratio']); ?></td>
                <td>
                    <a href="?page=ai-pedidos-sistema&tab=catalogo&delete=<?php echo esc_attr($id); ?>&_wpnonce=<?php echo wp_create_nonce('ai_delete_producto'); ?>" 
                       onclick="return confirm('¿Eliminar este producto?');" 
                       class="button button-small">Eliminar</a>
                </td>
            </tr>
            <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
    <?php
}

// =========================================================
// TAB: INTEGRACIÓN EXTERNA
// =========================================================
function ai_tab_integracion() {
    // Guardar configuración
    if (isset($_POST['save_integracion']) && check_admin_referer('ai_save_integracion')) {
        update_option('ai_webhook_url', esc_url_raw($_POST['webhook_url']));
        update_option('ai_webhook_secret', sanitize_text_field($_POST['webhook_secret']));
        update_option('ai_webhook_enabled', isset($_POST['webhook_enabled']) ? '1' : '0');
        update_option('ai_api_key', sanitize_text_field($_POST['api_key']));
        
        echo '<div class="notice notice-success"><p>Configuración guardada.</p></div>';
    }
    
    $webhook_url = get_option('ai_webhook_url', '');
    $webhook_secret = get_option('ai_webhook_secret', '');
    $webhook_enabled = get_option('ai_webhook_enabled', '0');
    $api_key = get_option('ai_api_key', wp_generate_password(32, false));
    
    ?>
    <form method="post" action="">
        <?php wp_nonce_field('ai_save_integracion'); ?>
        
        <h2>API REST para Django</h2>
        <table class="form-table">
            <tr>
                <th><label>API Key</label></th>
                <td>
                    <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" readonly />
                    <p class="description">Usa este token en el header <code>X-API-KEY</code> para autenticar las peticiones.</p>
                </td>
            </tr>
            <tr>
                <th><label>Endpoint</label></th>
                <td>
                    <code><?php echo rest_url('ai/v1/pedidos'); ?></code>
                    <p class="description">Endpoint para que Django consulte pedidos.</p>
                </td>
            </tr>
        </table>
        
        <h2>Webhook Saliente (Push a Django)</h2>
        <table class="form-table">
            <tr>
                <th><label>URL Webhook Django</label></th>
                <td>
                    <input type="url" name="webhook_url" value="<?php echo esc_attr($webhook_url); ?>" class="regular-text" placeholder="https://django-app.com/api/photo-orders/webhook/" />
                    <p class="description">URL donde WordPress enviará notificaciones cuando un pedido se pague.</p>
                </td>
            </tr>
            <tr>
                <th><label>Shared Secret</label></th>
                <td>
                    <input type="text" name="webhook_secret" value="<?php echo esc_attr($webhook_secret); ?>" class="regular-text" />
                    <p class="description">Secret compartido para validar las peticiones (debe coincidir con Django).</p>
                </td>
            </tr>
            <tr>
                <th><label>Habilitar Webhook</label></th>
                <td>
                    <label>
                        <input type="checkbox" name="webhook_enabled" value="1" <?php checked($webhook_enabled, '1'); ?> />
                        Enviar pedidos pagados automáticamente
                    </label>
                </td>
            </tr>
        </table>
        
        <p class="submit">
            <input type="submit" name="save_integracion" class="button button-primary" value="Guardar Configuración" />
        </p>
    </form>
    
    <div style="background: #fff; padding: 20px; border: 1px solid #ccc; margin-top: 30px;">
        <h3>Documentación de Integración</h3>
        <p>Consulta el archivo <code>README.md</code> del plugin para ver la documentación completa de la API y ejemplos de uso.</p>
    </div>
    <?php
}

