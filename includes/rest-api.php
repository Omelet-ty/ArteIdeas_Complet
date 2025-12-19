<?php
/*
Plugin Name: ArteIDEAS (Cristopher)
Description: Sistema Completo React (V21.0 - Diseño Final Integrado)
Version: 21.0
Author: Cesar Domínguez
*/

if (!defined('ABSPATH')) exit;

// =========================================================
// 🔑 CLAVES (Pega tus claves reales aquí)
// =========================================================
define('AI_MP_ACCESS_TOKEN', 'TEST-TU-ACCESS-TOKEN-AQUI'); 
define('AI_GEMINI_API_KEY', 'TU-API-KEY-GEMINI-AQUI'); 

// =========================================================
// 📦 CARGA DE RECURSOS
// =========================================================
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

function cristopher_enqueue_scripts() {
    // 1. React & Babel (CDNs)
    wp_enqueue_script('react', 'https://unpkg.com/react@18.2.0/umd/react.production.min.js', [], null, false);
    wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js', ['react'], null, false);
    wp_enqueue_script('babel', 'https://unpkg.com/@babel/standalone/babel.min.js', [], null, false);
}
add_action('wp_enqueue_scripts', 'cristopher_enqueue_scripts');

// === INYECCIÓN DIRECTA DE CSS ===
function cristopher_inject_styles() {
    $css_path = plugin_dir_path(__FILE__) . 'assets/style.css';
    if (file_exists($css_path)) {
        echo '<style type="text/css">';
        echo file_get_contents($css_path);
        echo '</style>';
    }
}
add_action('wp_head', 'cristopher_inject_styles', 999);

// === INYECCIÓN DIRECTA DE JS ===
function cristopher_inject_app_script() {
    $script_path = plugin_dir_path(__FILE__) . 'assets/script.js';
    
    if (file_exists($script_path)) {
        echo '<script>
            var ArteData = {
                "ajax_url": "' . admin_url('admin-ajax.php') . '",
                "nonce": "' . wp_create_nonce('cristopher_nonce') . '",
                "gemini_key": "' . AI_GEMINI_API_KEY . '"
            };
        </script>';
        echo '<script type="text/babel">';
        echo file_get_contents($script_path);
        echo '</script>';
    }
}
add_action('wp_footer', 'cristopher_inject_app_script', 999);

// SHORTCODE
function cristopher_shortcode() {
    return '<div id="root" class="arte-ideas-root"><div style="text-align:center; padding:50px;">Cargando...</div></div>';
}
add_shortcode('arte_ideas_app', 'cristopher_shortcode');

// BACKEND PAGO
add_action('wp_ajax_cristopher_crear_preferencia', 'cristopher_crear_preferencia');
add_action('wp_ajax_nopriv_cristopher_crear_preferencia', 'cristopher_crear_preferencia');

function cristopher_crear_preferencia() {
    check_ajax_referer('cristopher_nonce', 'nonce');
    if (!class_exists('MercadoPago\SDK')) { wp_send_json_error('Librería MP no cargada'); return; }
    $datos = json_decode(file_get_contents('php://input'), true);
    
    try {
        \MercadoPago\SDK::setAccessToken(AI_MP_ACCESS_TOKEN);
        $preference = new \MercadoPago\Preference();
        $items_mp = [];

        if (!empty($datos['items'])) {
            foreach ($datos['items'] as $prod) {
                $item = new \MercadoPago\Item();
                $item->title = $prod['title'];
                $item->quantity = $prod['quantity'];
                $precio = floatval(str_replace(['€', 'S/', ','], ['', '', '.'], $prod['price']));
                $item->unit_price = $precio;
                $item->currency_id = 'PEN'; // Cambiar a EUR si es necesario
                $items_mp[] = $item;
            }
        }
        if (isset($datos['deliveryType']) && $datos['deliveryType'] === 'delivery') {
            $envio = new \MercadoPago\Item();
            $envio->title = "Envío";
            $envio->quantity = 1;
            $envio->unit_price = 5.00;
            $envio->currency_id = 'PEN';
            $items_mp[] = $envio;
        }
        $preference->items = $items_mp;
        $dummy_url = 'https://www.google.com'; 
        $preference->back_urls = [ 'success' => $dummy_url, 'failure' => $dummy_url ];
        $preference->auto_return = "approved";
        $preference->save();

        if ($preference->init_point) wp_send_json_success(['init_point' => $preference->init_point]);
        else wp_send_json_error('Error generando link MP');
    } catch (Exception $e) {
        wp_send_json_error($e->getMessage());
    }
}