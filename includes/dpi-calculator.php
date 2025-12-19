<?php
/**
 * Calculadora de DPI para imágenes
 */

if (!defined('ABSPATH')) exit;

// =========================================================
// CALCULAR DPI DE UNA IMAGEN
// =========================================================
function ai_calculate_dpi($image_data, $size_cm) {
    // $image_data puede ser base64 o URL
    // $size_cm es un array ['width' => 10, 'height' => 15] en centímetros
    
    try {
        // Si es base64, decodificar
        if (strpos($image_data, 'data:image') === 0) {
            $base64 = explode(',', $image_data)[1];
            $image_binary = base64_decode($base64);
        } else {
            // Si es URL, descargar
            $image_binary = @file_get_contents($image_data);
            if (!$image_binary) {
                return 'unknown';
            }
        }
        
        // Crear imagen desde binario
        $image = @imagecreatefromstring($image_binary);
        if (!$image) {
            return 'unknown';
        }
        
        // Obtener dimensiones en píxeles
        $width_px = imagesx($image);
        $height_px = imagesy($image);
        
        // Limpiar memoria
        imagedestroy($image);
        
        // Convertir cm a pulgadas (1 pulgada = 2.54 cm)
        $width_inches = $size_cm['width'] / 2.54;
        $height_inches = $size_cm['height'] / 2.54;
        
        // Calcular DPI (píxeles / pulgadas)
        $dpi_width = $width_px / $width_inches;
        $dpi_height = $height_px / $height_inches;
        
        // Usar el menor DPI (el más restrictivo)
        $dpi = min($dpi_width, $dpi_height);
        
        // Clasificar DPI
        if ($dpi >= 300) {
            return 'ok'; // Excelente calidad
        } elseif ($dpi >= 200) {
            return 'warning'; // Calidad aceptable pero no óptima
        } else {
            return 'low'; // Calidad baja
        }
        
    } catch (Exception $e) {
        error_log('Error calculando DPI: ' . $e->getMessage());
        return 'unknown';
    }
}

// =========================================================
// EXTRAER TAMAÑO EN CM DEL FORMATO
// =========================================================
function ai_extract_size_cm($format_string) {
    // Ejemplos: "10x15 cm", "20x30 cm", "A4", "Personalizado (35x8 cm)"
    
    // Buscar patrón "NxN cm" o "NxN"
    if (preg_match('/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*cm?/i', $format_string, $matches)) {
        return [
            'width' => floatval($matches[1]),
            'height' => floatval($matches[2])
        ];
    }
    
    // Formatos estándar
    $standard_sizes = [
        'A4' => ['width' => 21.0, 'height' => 29.7],
        'A3' => ['width' => 29.7, 'height' => 42.0],
        'A5' => ['width' => 14.8, 'height' => 21.0],
    ];
    
    foreach ($standard_sizes as $key => $size) {
        if (stripos($format_string, $key) !== false) {
            return $size;
        }
    }
    
    // Si no se encuentra, retornar null
    return null;
}

// =========================================================
// ACTUALIZAR DPI DE ARCHIVOS DE UN PEDIDO
// =========================================================
function ai_update_pedido_dpi($pedido_id) {
    $archivos = get_post_meta($pedido_id, '_ai_archivos', true);
    if (!is_array($archivos) || empty($archivos)) {
        return;
    }
    
    $updated = false;
    foreach ($archivos as $idx => &$archivo) {
        // Solo calcular si está en 'unknown'
        if (($archivo['dpi_status'] ?? 'unknown') === 'unknown' && !empty($archivo['imagen'])) {
            $size_cm = ai_extract_size_cm($archivo['size_id'] ?? '');
            
            if ($size_cm) {
                $dpi_status = ai_calculate_dpi($archivo['imagen'], $size_cm);
                $archivo['dpi_status'] = $dpi_status;
                $updated = true;
            }
        }
    }
    
    if ($updated) {
        update_post_meta($pedido_id, '_ai_archivos', $archivos);
    }
}

// Hook para calcular DPI cuando se guarda un pedido
add_action('save_post_ai_pedido', 'ai_calculate_dpi_on_save', 20);
function ai_calculate_dpi_on_save($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (get_post_type($post_id) !== 'ai_pedido') return;
    
    // Calcular DPI de los archivos
    ai_update_pedido_dpi($post_id);
}

