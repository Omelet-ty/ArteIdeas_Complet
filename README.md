# Sistema de Pedidos Fotográficos - WordPress Plugin

Plugin completo para gestión de pedidos de fotos impresas con integración de pasarelas de pago (Mercado Pago, Stripe) y preparado para integración con sistema Django.

## Características

- ✅ **CPT "Pedidos Fotográficos"** con gestión completa de pedidos
- ✅ **Pantalla de administración** con tabs: Listado, Claves de Pago, Gestionar Catálogo, Integración Externa
- ✅ **Gestión de archivos por pedido** con miniaturas y descarga ZIP
- ✅ **Estados operativos** (archivos_listos, enviado_minilab, impreso, entregado)
- ✅ **Rol de operador de minilab** con permisos limitados
- ✅ **REST API** para consulta de pedidos desde Django
- ✅ **Webhook saliente** para notificar a Django cuando un pedido se paga

## Instalación

1. Subir la carpeta del plugin a `/wp-content/plugins/`
2. Activar el plugin desde el panel de WordPress
3. Configurar las claves de pago en **Pedidos Fotográficos → Claves de Pago**
4. Configurar el catálogo de productos en **Pedidos Fotográficos → Gestionar Catálogo**

## Configuración

### Claves de Pago

Ve a **Pedidos Fotográficos → Claves de Pago** y configura:

- **Stripe**: Clave pública, secreta y webhook secret
- **Mercado Pago**: Clave pública, access token y webhook secret

### Catálogo de Productos

En **Pedidos Fotográficos → Gestionar Catálogo** puedes agregar productos con:

- ID fijo (ej: `10x15`, `A4`)
- Título
- Precio en S/
- Descripción
- URL de imagen
- Ratio (ancho/alto)

### Integración Externa

En **Pedidos Fotográficos → Integración Externa** puedes configurar:

- **API Key**: Token para autenticar peticiones REST
- **URL Webhook Django**: URL donde se enviarán notificaciones
- **Shared Secret**: Secret compartido para validar webhooks
- **Habilitar Webhook**: Checkbox para activar/desactivar notificaciones automáticas

## Integración con Django

### Consultar Pedidos desde Django (Pull)

**Endpoint**: `GET /wp-json/ai/v1/pedidos`

**Autenticación**: Header `X-API-KEY: <TOKEN>`

**Parámetros**:
- `estado` (opcional): Filtrar por estado de pago (`pagado`, `pendiente_pago`, `pagado_parcial`)
- `desde` (opcional): Fecha ISO8601 para filtrar pedidos actualizados después de cierta fecha

**Ejemplo**:
```bash
curl -H "X-API-KEY: tu-api-key-aqui" \
  "https://tusitio.com/wp-json/ai/v1/pedidos?estado=pagado&desde=2025-11-01T00:00:00Z"
```

**Respuesta**:
```json
{
  "data": [
    {
      "id": 1763999603,
      "external_id": "WP-1763999603",
      "status_pago": "pagado",
      "status_produccion": "enviado_minilab",
      "created_at": "2025-11-24T15:53:00-05:00",
      "updated_at": "2025-11-24T16:10:00-05:00",
      "cliente": {
        "nombre": "Juan Pérez",
        "email": "juan@example.com",
        "telefono": "9XXXXXXXX"
      },
      "entrega": {
        "modo": "domicilio",
        "direccion": "Calle Principal 123",
        "distrito": "Tacna",
        "provincia": "Tacna",
        "departamento": "Tacna"
      },
      "pago": {
        "metodo": "mercado_pago",
        "monto_total": 6.40,
        "moneda": "PEN"
      },
      "items": [
        {
          "size_id": "10x15",
          "size_label": "10x15 cm - €0.75",
          "qty": 4
        },
        {
          "size_id": "20x30",
          "size_label": "20x30 cm - €1.00",
          "qty": 1
        }
      ]
    }
  ]
}
```

### Recibir Eventos desde WordPress (Push)

WordPress enviará un `POST` a la URL configurada cuando un pedido pase a estado `pagado`.

**Headers**:
- `Content-Type: application/json`
- `X-Integration-Source: wp_photo_plugin`
- `X-Integration-Secret: <SECRET_COMPARTIDO>`

**Body**: JSON con el mismo formato del endpoint GET `/pedidos`

**Ejemplo de implementación en Django**:
```python
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@csrf_exempt
def webhook_pedido(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Validar secret
    secret = request.headers.get('X-Integration-Secret')
    if secret != settings.WP_WEBHOOK_SECRET:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    # Procesar pedido
    data = json.loads(request.body)
    pedido_id = data.get('id')
    # ... guardar en tu sistema ...
    
    return JsonResponse({'status': 'ok'})
```

## Estados de Pago

- `pendiente_pago`: Pedido creado pero aún no pagado
- `pagado_parcial`: Pago parcial recibido
- `pagado`: Pago completo recibido

## Estados de Producción

- `archivos_listos`: Archivos listos para procesar
- `enviado_minilab`: Archivos enviados al minilab
- `impreso`: Fotos impresas
- `entregado`: Pedido entregado al cliente

## Webhooks de Pago

### Mercado Pago

Configura el webhook en Mercado Pago apuntando a:
```
https://tusitio.com/wp-admin/admin-ajax.php?action=ai_webhook_mp
```

### Stripe

Configura el webhook en Stripe apuntando a:
```
https://tusitio.com/wp-admin/admin-ajax.php?action=ai_webhook_stripe
```

## Rol de Operador de Minilab

El plugin crea automáticamente el rol `minilab_operator` con permisos limitados:

- Solo puede ver y editar "Pedidos Fotográficos"
- No puede acceder a configuración, catálogo ni claves de pago
- Puede cambiar estados operativos y descargar archivos

## Archivos del Pedido

Cada pedido incluye una sección "Archivos del Pedido" donde el operador puede:

- Ver miniaturas de todas las fotos
- Ver tamaño, cantidad y estado DPI
- Descargar fotos individuales
- Descargar todo el pedido en ZIP
- Marcar archivos como revisados
- Marcar archivos como enviados al minilab
- Agregar notas del operador

## Estructura del Plugin

```
pablo/
├── arte-ideas.php          # Archivo principal
├── assets/
│   ├── script.js           # Frontend React
│   └── style.css           # Estilos
├── includes/
│   ├── orders-system.php   # CPT y meta boxes
│   ├── admin-settings.php  # Pantalla de administración
│   ├── rest-api-endpoints.php  # REST API
│   ├── webhook-outgoing.php    # Webhook saliente
│   ├── webhook-handler.php     # Procesar webhooks de pago
│   ├── roles.php               # Rol de operador
│   └── download-zip.php        # Descarga ZIP
└── README.md                   # Este archivo
```

## Notas para el Equipo Django

1. **Contrato API**: El formato JSON del endpoint `/pedidos` está congelado. No cambiará sin aviso previo.

2. **Autenticación**: Siempre incluir el header `X-API-KEY` con el token configurado en WordPress.

3. **Webhook**: Si implementan el webhook receptor, deben validar el header `X-Integration-Secret`.

4. **Estados**: Los estados de pago y producción son strings predefinidos. No usar valores diferentes.

5. **Fechas**: Todas las fechas están en formato ISO8601 con timezone.

## Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.

