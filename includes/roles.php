<?php
/**
 * Rol de Operador de Minilab
 */

if (!defined('ABSPATH')) exit;

// =========================================================
// CREAR ROL DE OPERADOR
// =========================================================
function ai_create_minilab_operator_role() {
    add_role(
        'minilab_operator',
        'Operador de Minilab',
        [
            'read' => true,
            'edit_ai_pedido' => true,
            'read_ai_pedido' => true,
            'edit_ai_pedidos' => true,
            'read_ai_pedidos' => true,
        ]
    );
}
add_action('init', 'ai_create_minilab_operator_role');

// =========================================================
// CAPABILITIES PARA EL CPT
// =========================================================
function ai_add_pedido_caps() {
    $role = get_role('minilab_operator');
    if ($role) {
        $role->add_cap('read');
        $role->add_cap('edit_ai_pedido');
        $role->add_cap('read_ai_pedido');
        $role->add_cap('edit_ai_pedidos');
        $role->add_cap('read_ai_pedidos');
    }
    
    // Asegurar que admin tenga todas las capacidades
    $admin = get_role('administrator');
    if ($admin) {
        $admin->add_cap('edit_ai_pedido');
        $admin->add_cap('read_ai_pedido');
        $admin->add_cap('edit_ai_pedidos');
        $admin->add_cap('read_ai_pedidos');
        $admin->add_cap('delete_ai_pedidos');
        $admin->add_cap('publish_ai_pedidos');
    }
}
add_action('admin_init', 'ai_add_pedido_caps');

// =========================================================
// RESTRINGIR ACCESO: Operador solo ve pedidos
// =========================================================
function ai_restrict_admin_menu() {
    $user = wp_get_current_user();
    if (in_array('minilab_operator', $user->roles)) {
        // Ocultar otros menús, solo mostrar Pedidos Fotográficos
        remove_menu_page('edit.php');
        remove_menu_page('upload.php');
        remove_menu_page('edit.php?post_type=page');
        remove_menu_page('edit-comments.php');
        remove_menu_page('themes.php');
        remove_menu_page('plugins.php');
        remove_menu_page('tools.php');
        remove_menu_page('options-general.php');
        remove_menu_page('users.php');
        
        // Cambiar el nombre del menú para que sea más claro
        global $menu;
        foreach ($menu as $key => $item) {
            if ($item[2] === 'ai-pedidos-sistema') {
                $menu[$key][0] = 'Pedidos Fotográficos';
            }
        }
    }
}
add_action('admin_menu', 'ai_restrict_admin_menu', 999);

