<?php
/*
Plugin Name: ArteIDEAS (Cristopher)
Description: Sistema React (V20.0 - CSS y JS Inyectados)
Version: 20.0
Author: Cesar Domínguez
*/

if (!defined('ABSPATH')) exit;

// 🔑 CLAVES
define('AI_MP_ACCESS_TOKEN', 'APP_USR-6633021281239327-110612-0c6c1a41d8d0b860d5539ebf39eb8fed-2967395874'); 
define('AI_GEMINI_API_KEY', 'TU-API-KEY-GEMINI-AQUI'); 

// 📦 VENDOR
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

// 📦 SISTEMA DE PEDIDOS
require_once __DIR__ . '/includes/orders-system.php';
require_once __DIR__ . '/includes/admin-settings.php';
require_once __DIR__ . '/includes/rest-api-endpoints.php';
require_once __DIR__ . '/includes/webhook-outgoing.php';
require_once __DIR__ . '/includes/webhook-handler.php';
require_once __DIR__ . '/includes/roles.php';
require_once __DIR__ . '/includes/download-zip.php';
require_once __DIR__ . '/includes/dpi-calculator.php';

function cristopher_enqueue_scripts() {
    // 1. Librerías Base (React, ReactDOM, Babel)
    wp_enqueue_script('react', 'https://unpkg.com/react@18.2.0/umd/react.production.min.js', [], null, false);
    wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js', ['react'], null, false);
    wp_enqueue_script('babel', 'https://unpkg.com/@babel/standalone/babel.min.js', [], null, false);
}
add_action('wp_enqueue_scripts', 'cristopher_enqueue_scripts');

// === 1. INYECCIÓN DIRECTA DE CSS (SOLUCIÓN A "SIN DISEÑO") ===
function cristopher_inject_styles() {
    $css_path = plugin_dir_path(__FILE__) . 'assets/style.css';
    if (file_exists($css_path)) {
        echo '<style type="text/css">';
        echo file_get_contents($css_path);
        echo '</style>';
    } else {
        echo '';
    }
}
add_action('wp_head', 'cristopher_inject_styles', 999);

// === 2. INYECCIÓN DIRECTA DE JS (SOLUCIÓN A "CARGANDO...") ===
function cristopher_inject_app_script() {
    $script_path = plugin_dir_path(__FILE__) . 'assets/script.js';
    
    if (file_exists($script_path)) {
        // Datos para JS
        echo '<script>
            var ArteData = {
                "ajax_url": "' . admin_url('admin-ajax.php') . '",
                "nonce": "' . wp_create_nonce('cristopher_nonce') . '",
                "gemini_key": "' . AI_GEMINI_API_KEY . '"
            };
        </script>';

        // El código de la App
        echo '<script type="text/babel">';
        echo file_get_contents($script_path);
        echo '</script>';
    }
}
add_action('wp_footer', 'cristopher_inject_app_script', 999);

// SHORTCODE
function cristopher_shortcode() {
    // Envolvemos la app React existente en un "marco de celular" al estilo del MobileSimulatorWrapper,
    // pero construido sólo con HTML/CSS (PHP) y añadimos un switch simple PC / Móvil.
    ob_start();
    ?>
    <!-- Vista de escritorio: sin simulador, solo la app directamente -->
    <div class="arte-ideas-wrapper">
        <div id="root" class="arte-ideas-root">
            <div style="padding: 40px 20px; text-align: center;">
                <h2>Iniciando Aplicación...</h2>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('arte_ideas_app', 'cristopher_shortcode');

// BACKEND PAGO
add_action('wp_ajax_cristopher_crear_preferencia', 'cristopher_crear_preferencia');
add_action('wp_ajax_nopriv_cristopher_crear_preferencia', 'cristopher_crear_preferencia');

// BACKEND GEMINI AI
add_action('wp_ajax_cristopher_editar_imagen_ia', 'cristopher_editar_imagen_ia');
add_action('wp_ajax_nopriv_cristopher_editar_imagen_ia', 'cristopher_editar_imagen_ia');

function cristopher_crear_preferencia() {
    check_ajax_referer('cristopher_nonce', 'nonce');
    if (!class_exists('MercadoPago\SDK')) { wp_send_json_error('Librería MP no cargada'); return; }
    $datos = json_decode(file_get_contents('php://input'), true);
    
    try {
        // 1. CREAR PEDIDO EN WORDPRESS ANTES DE CREAR LA PREFERENCIA
        $pedido_id = ai_crear_pedido($datos);
        if (!$pedido_id) {
            wp_send_json_error('Error al crear el pedido');
            return;
        }
        
        // 2. CREAR PREFERENCIA EN MERCADO PAGO
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
                $item->currency_id = 'PEN';
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
        
        // Guardar ID del pedido en metadata de la preferencia
        $preference->metadata = ['pedido_id' => $pedido_id];
        
        $dummy_url = 'https://www.google.com'; 
        $preference->back_urls = [ 'success' => $dummy_url, 'failure' => $dummy_url ];
        $preference->auto_return = "approved";
        $preference->save();

        if ($preference->init_point) {
            // Guardar ID de preferencia en el pedido
            update_post_meta($pedido_id, '_ai_mp_preference_id', $preference->id);
            wp_send_json_success(['init_point' => $preference->init_point, 'pedido_id' => $pedido_id]);
        } else {
            wp_send_json_error('Error generando link MP');
        }
    } catch (Exception $e) {
        wp_send_json_error($e->getMessage());
    }
}

function cristopher_editar_imagen_ia() {
    check_ajax_referer('cristopher_nonce', 'nonce');
    
    // Validar API Key
    if (AI_GEMINI_API_KEY === 'TU-API-KEY-GEMINI-AQUI' || empty(AI_GEMINI_API_KEY)) {
        wp_send_json_error('API Key de Gemini no configurada. Por favor configura tu API key en el archivo del plugin.');
        return;
    }
    
    $datos = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos de entrada
    if (empty($datos['image']) || empty($datos['instruction'])) {
        wp_send_json_error('Faltan datos requeridos: imagen o instrucción');
        return;
    }
    
    // Validar tamaño de instrucción (máximo 500 caracteres)
    $instruction = trim($datos['instruction']);
    if (strlen($instruction) > 500) {
        wp_send_json_error('La instrucción es demasiado larga. Máximo 500 caracteres.');
        return;
    }
    
    if (strlen($instruction) < 3) {
        wp_send_json_error('La instrucción es demasiado corta. Por favor describe mejor qué quieres cambiar.');
        return;
    }
    
    // Sanitizar instrucción (evitar inyección)
    $instruction = sanitize_text_field($instruction);
    
    try {
        // Extraer base64 de la imagen
        $base64Data = $datos['image'];
        if (strpos($base64Data, ',') !== false) {
            $base64Data = explode(',', $base64Data)[1];
        }
        
        // Validar tamaño de imagen (máximo ~4MB en base64)
        $imageSize = strlen($base64Data);
        $maxSize = 4 * 1024 * 1024; // 4MB
        if ($imageSize > $maxSize) {
            wp_send_json_error('La imagen es demasiado grande. Por favor usa una imagen menor a 4MB.');
            return;
        }
        
        // Determinar mime type
        $mimeType = 'image/png';
        if (strpos($datos['image'], 'image/jpeg') !== false || strpos($datos['image'], 'image/jpg') !== false) {
            $mimeType = 'image/jpeg';
        } elseif (strpos($datos['image'], 'image/webp') !== false) {
            $mimeType = 'image/webp';
        } elseif (strpos($datos['image'], 'image/png') !== false) {
            $mimeType = 'image/png';
        }
        
        // Validar que el base64 sea válido
        if (!preg_match('/^[a-zA-Z0-9\/\r\n+]*={0,2}$/', $base64Data)) {
            wp_send_json_error('Formato de imagen inválido');
            return;
        }
        
        // Usar modelo estable para producción (no experimental)
        $model = 'gemini-1.5-flash'; // Modelo estable y rápido
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $model . ':generateContent?key=' . AI_GEMINI_API_KEY;
        
        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => $base64Data
                            ]
                        ],
                        [
                            'text' => 'Edit this image based on the following instruction: ' . $instruction . '. Return only the edited image as base64 encoded data.'
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.4,
                'topK' => 32,
                'topP' => 1,
                'maxOutputTokens' => 4096,
            ]
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60); // Timeout de 60 segundos
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10); // Timeout de conexión
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        // Manejo de errores de cURL
        if ($response === false || !empty($curlError)) {
            error_log('Gemini API cURL Error: ' . $curlError);
            wp_send_json_error('Error de conexión con el servicio de IA. Por favor intenta de nuevo.');
            return;
        }
        
        if ($httpCode !== 200) {
            $errorData = json_decode($response, true);
            $errorMsg = 'Error en el servicio de IA';
            if (isset($errorData['error']['message'])) {
                $errorMsg = $errorData['error']['message'];
            } elseif (isset($errorData['error'])) {
                $errorMsg = is_string($errorData['error']) ? $errorData['error'] : 'Error desconocido';
            }
            error_log('Gemini API Error (HTTP ' . $httpCode . '): ' . $response);
            wp_send_json_error($errorMsg);
            return;
        }
        
        $result = json_decode($response, true);
        
        // Validar estructura de respuesta
        if (!isset($result['candidates']) || empty($result['candidates'])) {
            error_log('Gemini API: Respuesta sin candidatos. Response: ' . $response);
            wp_send_json_error('El servicio de IA no pudo procesar la imagen. Intenta con otra instrucción.');
            return;
        }
        
        // Verificar si hay bloqueos de seguridad
        if (isset($result['candidates'][0]['finishReason']) && $result['candidates'][0]['finishReason'] !== 'STOP') {
            $reason = $result['candidates'][0]['finishReason'];
            if ($reason === 'SAFETY') {
                wp_send_json_error('La solicitud fue bloqueada por políticas de seguridad. Por favor intenta con otra instrucción.');
            } else {
                wp_send_json_error('El servicio no pudo completar la solicitud. Intenta de nuevo.');
            }
            return;
        }
        
        // Extraer imagen de la respuesta
        $newImageBase64 = null;
        if (isset($result['candidates'][0]['content']['parts'])) {
            foreach ($result['candidates'][0]['content']['parts'] as $part) {
                if (isset($part['inline_data']) && isset($part['inline_data']['data'])) {
                    $newImageBase64 = 'data:' . $part['inline_data']['mime_type'] . ';base64,' . $part['inline_data']['data'];
                    break;
                }
            }
        }
        
        if ($newImageBase64) {
            wp_send_json_success(['image' => $newImageBase64]);
        } else {
            error_log('Gemini API: No se encontró imagen en la respuesta. Response: ' . substr($response, 0, 500));
            wp_send_json_error('No se pudo generar la imagen editada. Por favor intenta con otra instrucción.');
        }
        
    } catch (Exception $e) {
        error_log('Gemini API Exception: ' . $e->getMessage());
        wp_send_json_error('Ocurrió un error inesperado. Por favor intenta de nuevo.');
    }
}