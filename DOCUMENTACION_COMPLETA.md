# 🎨 ArteIDEAS - Documentación Completa del Proyecto

**Plataforma de Personalización Fotográfica con Inteligencia Artificial**

---

## 👥 Equipo de Desarrollo

- **Thory** - Frontend Developer (React, TypeScript, Tailwind CSS)
- **Cristopher** - Backend Developer (PHP, WordPress, APIs)

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Características Principales](#características-principales)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitectura del Sistema](#arquitectura-del-sistema)
5. [Flujo Completo de Usuario](#flujo-completo-de-usuario)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Instalación y Configuración](#instalación-y-configuración)
8. [Guías de Desarrollo](#guías-de-desarrollo)
9. [Integración con Sistemas Externos](#integración-con-sistemas-externos)

---

## 🎯 Visión General

**ArteIDEAS** es una aplicación de comercio electrónico moderna diseñada para la venta de productos fotográficos personalizados. El sistema combina una interfaz de usuario intuitiva y moderna (desarrollada en React) con un backend robusto y escalable (desarrollado en WordPress/PHP), integrando potentes herramientas de edición de imágenes mediante Inteligencia Artificial.

### ¿Qué hace ArteIDEAS?

Permite a los usuarios:

- 🛍️ Navegar un catálogo de productos fotográficos
- 🎨 Personalizar sus fotos con herramientas de recorte y edición
- ✨ Editar imágenes usando lenguaje natural con IA (Google Gemini)
- 🛒 Gestionar un carrito de compras
- 💳 Completar compras mediante pasarelas de pago (Mercado Pago, Stripe)
- 📦 Hacer seguimiento de sus pedidos

Y a los administradores:

- 📊 Gestionar pedidos desde un panel completo
- 👥 Asignar tareas a operadores de minilab
- 🔌 Integrar con sistemas externos (Django) mediante REST API
- 📡 Recibir notificaciones automáticas de pedidos pagados

---

## 🌟 Características Principales

### 1. 🛍️ Catálogo y Navegación (Frontend - Thory)

**Experiencia de Usuario Moderna**:

- **Diseño Responsivo**: Interfaz perfectamente adaptada a Escritorio y Móviles
- **Transiciones Suaves**: Efectos hover, animaciones y feedback visual inmediato
- **Búsqueda Integrada**: Barra de búsqueda en la cabecera para encontrar productos rápidamente
- **Vista de Detalle**: Páginas de producto con galería de imágenes, descripción, precios y promociones

**Componentes Principales**:

- `LandingPage`: Escaparate inicial con grid de productos
- `ProductDetailView`: Vista detallada con galería y opciones
- `ProductCustomizer`: Herramienta de personalización (ver sección 2)

### 2. 🎨 Personalizador de Productos (Frontend + Backend)

**Flujo Completo de Personalización**:

#### Frontend (Thory):

- **Carga de Imágenes**: Soporte para arrastrar y soltar (Drag & Drop)
- **Recorte Inteligente (Cropping)**:
  - Relaciones de aspecto predefinidas (9x13, 10x15, 20x30, etc.)
  - Dimensiones Personalizadas: El usuario puede definir ancho y alto exactos en centímetros
  - Recuadro de recorte arrastrable y redimensionable
  - Vista previa en tiempo real
- **Lógica Canvas**: El recorte se procesa en el cliente utilizando la API Canvas de HTML5
- **Configuración de Producto**: Selección de acabados (Mate/Brillante) y nombrado de proyectos

#### Backend (Cristopher):

- **Almacenamiento de Archivos**: Las imágenes recortadas se guardan en WordPress
- **Metadatos**: Se almacenan dimensiones, formato, y configuración del producto
- **Validación**: Verificación de formatos y tamaños de archivo

### 3. ✨ Edición con Inteligencia Artificial (Frontend + Backend)

**Integración Completa con Google Gemini**:

#### Frontend (Thory):

- **Chat Interface**: Interfaz de chat donde el usuario escribe comandos en lenguaje natural
  - Ejemplos: "Quita el fondo", "Haz que parezca un dibujo al óleo", "Mejora la iluminación"
- **Historial de Versiones**: Tira de imágenes navegable que guarda cada iteración de la edición
  - El usuario puede hacer clic en cualquier versión anterior para restaurarla
- **Optimización Móvil**: Layout ajustado para editar cómodamente desde el celular
  - Imagen arriba, chat abajo en dispositivos móviles
- **Componentes**: `AIEditor` con estado de carga, mensajes de error, y feedback visual

#### Backend (Cristopher):

- **Endpoint Seguro**: `cristopher_editar_imagen_ia` - AJAX handler que protege la API key
  - La API key nunca se expone al frontend
- **Validación Robusta**:
  - Tamaño de imagen: máximo 4MB en base64
  - Longitud de instrucción: 3-500 caracteres
  - Sanitización de inputs para prevenir inyección
- **Manejo de Errores**: Gestión completa de errores de red, HTTP, bloqueos de seguridad
- **Modelo Estable**: Uso de `gemini-1.5-flash` para producción (rápido y confiable)
- **Timeout Configurado**: 60 segundos para evitar bloqueos

**Flujo de Edición con IA**:

```
Usuario escribe instrucción → Frontend envía AJAX → Backend valida →
Backend llama a Gemini API → Backend procesa respuesta →
Frontend recibe imagen editada → Frontend actualiza UI y historial
```

### 4. 🛒 Carrito y Checkout (Frontend - Thory)

**Gestión de Carrito**:

- Ajuste de cantidades en tiempo real
- Eliminación de ítems
- Cálculo automático de totales
- Vista previa de productos con miniaturas

**Lógica de Entrega**:

- **Envío a Domicilio**:
  - Cálculo automático de envío (+5.00€)
  - Despliegue de formulario completo de dirección
  - Validación de campos (teléfono, DNI, email)
- **Recojo en Tienda**:
  - Coste de envío gratuito (0€)
  - Visualización de datos de la tienda física (Dirección, horarios)

**Validaciones del Frontend**:

- Teléfono: Solo números, 9 dígitos exactos
- DNI: Validación de formato
- Email: Validación de formato con regex
- Campos requeridos: Indicadores visuales (bordes rojos)

### 5. 💳 Pasarela de Pago (Frontend + Backend)

#### Frontend (Thory):

- **Formulario de Tarjeta Interactivo**:
  - Input Masking automático
  - Número de tarjeta: Formato automático (1234 5678 1234 5678)
  - Titular: Conversión automática a mayúsculas
  - Vencimiento: Formato automático (12/25)
- **Simulación de Pago**: Interfaz completa de tarjeta de crédito
- **Pantalla de Confirmación**: Resumen financiero y generación de ID de pedido único

#### Backend (Cristopher):

- **Creación de Preferencias**:
  - Generación automática de links de pago mediante SDK de Mercado Pago
  - Vinculación bidireccional entre preferencias y pedidos WordPress
- **Webhook Receptor**:
  - Endpoint AJAX que procesa notificaciones de pago en tiempo real
  - Validación automática del estado de pago
  - Actualización automática del pedido
- **Soporte Multi-Pasarela**:
  - Mercado Pago (implementado)
  - Stripe (preparado, misma estructura)

**Flujo de Pago**:

```
Usuario completa checkout → Frontend envía datos → Backend crea pedido →
Backend crea preferencia MP → Frontend redirige a MP → Usuario paga →
MP envía webhook → Backend actualiza pedido → Backend notifica a Django (opcional)
```

### 6. 📊 Sistema de Gestión de Pedidos (Backend - Cristopher)

**Custom Post Type "Pedidos Fotográficos"**:

- **Creación Automática**: Los pedidos se crean cuando el usuario inicia el pago
- **Metadatos Completos**:
  - Información del cliente (nombre, email, teléfono, DNI)
  - Dirección de entrega completa
  - Método de pago y detalles de transacción
  - Array de ítems con imágenes asociadas
- **Estados Duales**:
  - **Pago**: `pendiente_pago`, `pagado_parcial`, `pagado`
  - **Producción**: `archivos_listos`, `enviado_minilab`, `impreso`, `entregado`
- **Gestión de Archivos**:
  - Miniaturas de todas las imágenes
  - Información de DPI (OK/Warning/Low)
  - Descarga individual o masiva (ZIP)
  - Checkboxes operativos (Revisado, Enviado al minilab)
  - Notas internas del operador

### 7. 👥 Panel de Administración (Backend - Cristopher)

**Pantalla Principal "Sistema de Pedidos Fotográficos"** con 4 secciones:

#### Tab 1: Listado de Pedidos

- Redirección al CPT estándar de WordPress
- Columnas personalizadas: información de pago, total, estado operativo
- Filtros y búsqueda nativos

#### Tab 2: Claves de Pago

- **Stripe**: Public Key, Secret Key, Webhook Secret
- **Mercado Pago**: Public Key, Access Token, Webhook Secret
- Almacenamiento seguro en opciones de WordPress

#### Tab 3: Gestionar Catálogo

- CRUD completo de productos fotográficos
- Campos: ID fijo, Título, Precio (S/), Descripción, URL de imagen, Ratio
- Almacenamiento en opciones de WordPress

#### Tab 4: Integración Externa

- API Key para autenticar peticiones REST
- URL Webhook Django
- Shared Secret para validar webhooks
- Checkbox de habilitación

### 8. 🔌 REST API para Integración Externa (Backend - Cristopher)

**Endpoint Estable**: `GET /wp-json/ai/v1/pedidos`

- **Autenticación**: Header `X-API-KEY`
- **Filtros Opcionales**:
  - `estado`: Filtrar por estado de pago
  - `desde`: Fecha ISO8601 para filtrar por fecha
- **Formato JSON Estable**: Contrato congelado
- **Estructura Completa**: Cliente, entrega, pago, ítems

### 9. 📡 Sistema de Webhooks (Backend - Cristopher)

**Notificación Automática a Django**:

- Se dispara cuando un pedido pasa a estado `pagado`
- Headers de seguridad: `X-Integration-Source`, `X-Integration-Secret`
- Payload JSON con mismo formato que REST API
- Logging de intentos en `/uploads/ai_integracion/integration.log`

### 10. 👤 Sistema de Roles (Backend - Cristopher)

**Rol "Operador de Minilab"** (`minilab_operator`):

- Permisos limitados: Solo ver y editar pedidos
- Sin acceso a configuración, claves, ni catálogo
- Puede cambiar estados operativos y descargar archivos

---

## 🛠️ Stack Tecnológico

### Frontend (Thory)

- **Framework**: React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS (Diseño utility-first)
- **Iconos**: Lucide React
- **Manipulación de Imagen**: HTML5 Canvas API
- **Build Tool**: Babel Standalone (para desarrollo)

### Backend (Cristopher)

- **Lenguaje**: PHP 7.4+
- **CMS**: WordPress 5.0+
- **Base de Datos**: MySQL (a través de WordPress)
- **SDK de Pago**: Mercado Pago PHP SDK (Composer)
- **IA**: Google Gemini API (REST via cURL)
- **API**: WordPress REST API (nativa)
- **Seguridad**: WordPress Nonces, sanitización, validación de permisos

### Integraciones Externas

- **Google Gemini**: `gemini-1.5-flash` para edición de imágenes
- **Mercado Pago**: SDK oficial para procesamiento de pagos
- **Stripe**: Preparado para integración futura
- **Django**: REST API y webhooks para sincronización

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO (Navegador)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React - Thory)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │  Detail │  │Customizer│  │   Cart   │   │
│  │   Page   │→ │   View  │→ │          │→ │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌──────────┐  ┌──────────┐                               │
│  │Checkout  │  │ AIEditor │                               │
│  │   View   │  │          │                               │
│  └──────────┘  └──────────┘                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ AJAX / REST
                        ▼
┌─────────────────────────────────────────────────────────────┐
│           BACKEND (WordPress/PHP - Cristopher)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   AJAX       │  │   REST API   │  │   Webhooks   │    │
│  │  Handlers    │  │   Endpoints  │  │   (Saliente) │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Mercado     │  │   Google     │  │   WordPress  │    │
│  │    Pago      │  │   Gemini     │  │     CPT       │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Webhooks
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         SISTEMAS EXTERNOS                                    │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Mercado    │  │    Django    │                        │
│  │    Pago      │  │   (Sistema   │                        │
│  │  (Webhook)   │  │  Externo)   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Comunicación Frontend ↔ Backend

**AJAX Endpoints**:

- `cristopher_crear_preferencia`: Crear pedido y preferencia de pago
- `cristopher_editar_imagen_ia`: Editar imagen con Gemini AI

**REST API Endpoints**:

- `GET /wp-json/ai/v1/pedidos`: Consultar pedidos (para Django)

**Webhooks**:

- `ai_webhook_mp`: Recibir notificaciones de Mercado Pago
- `ai_webhook_stripe`: Recibir notificaciones de Stripe (preparado)
- Webhook saliente a Django cuando pedido se paga

---

## 📖 Flujo Completo de Usuario: Paso a Paso

### Escenario: Usuario compra un marco personalizado

#### **Paso 1: Navegación y Selección** (Frontend - Thory)

1. **Usuario entra a la aplicación**

   - Ve el `LandingPage` con grid de productos
   - Navega por las cards de productos con efectos hover
   - Hace clic en "Marco Básico Personalizado"

2. **Vista de Detalle**
   - Ve `ProductDetailView` con galería de imágenes
   - Revisa precio y promociones por volumen
   - Hace clic en "Empezar a Crear Online"

#### **Paso 2: Personalización** (Frontend - Thory + Backend - Cristopher)

3. **Subida de Imagen**

   - En `ProductCustomizer`, arrastra una foto familiar
   - El archivo se carga en el navegador (Frontend)

4. **Recorte (Cropping)**

   - Selecciona formato "10x15 cm"
   - Aparece recuadro de recorte bloqueado a esa proporción
   - Arrastra el recuadro para centrar las caras
   - Hace clic en "Aplicar Recorte"
   - **Frontend**: Procesa recorte con Canvas API
   - **Frontend**: Actualiza vista previa instantáneamente

5. **Opciones de Producto**
   - Selecciona papel "Mate"
   - Nombra el proyecto: "Regalo Mamá"
   - Hace clic en "Agregar al Carrito"
   - **Frontend**: Agrega ítem al estado del carrito

#### **Paso 3: Edición con IA (Opcional)** (Frontend - Thory + Backend - Cristopher)

6. **Usuario decide editar con IA**

   - Hace clic en "Editar con IA" en el `PhotoEditor`
   - Se abre `AIEditor` con chat interface

7. **Instrucción de Edición**

   - Escribe: "Quita el fondo y haz que parezca un dibujo al óleo"
   - Hace clic en "Enviar"
   - **Frontend**: Envía AJAX a `cristopher_editar_imagen_ia`
   - **Backend**: Valida instrucción y tamaño de imagen
   - **Backend**: Llama a Google Gemini API con imagen e instrucción
   - **Backend**: Procesa respuesta y retorna imagen editada
   - **Frontend**: Actualiza imagen en el editor
   - **Frontend**: Agrega versión al historial

8. **Iteración**
   - Usuario escribe: "Mejora la iluminación"
   - Se repite el proceso
   - Usuario puede hacer clic en versión anterior del historial para restaurarla

#### **Paso 4: Carrito de Compras** (Frontend - Thory)

9. **Gestión del Carrito**
   - Ve el ítem con su miniatura recortada/editada
   - Decide llevar 2 copias, presiona el botón `+`
   - **Frontend**: Actualiza cantidad y precio total en tiempo real
   - Hace clic en "Proceder al Pago"

#### **Paso 5: Checkout** (Frontend - Thory)

10. **Datos de Entrega**
    - Selecciona "Envío a Domicilio"
    - **Frontend**: Calcula automáticamente +5€ de envío
    - Rellena formulario:
      - Nombre: "Juan Pérez"
      - Teléfono: Intenta escribir letras, pero el campo lo bloquea → escribe "612345678"
      - DNI: El sistema valida formato
      - Email: "juan@gmail.com" (si olvida "@", borde rojo al intentar avanzar)
      - Dirección: "Calle Falsa 123", Ciudad, etc.
    - **Frontend**: Validaciones en tiempo real
    - Ve resumen a la derecha: Subtotal + Envío desglosado
    - Hace clic en "Continuar al Pago"

#### **Paso 6: Pago** (Frontend - Thory + Backend - Cristopher)

11. **Formulario de Pago**

    - Ve formulario de tarjeta con formato automático
    - Número: Escribe `1234567812345678` → se formatea a `1234 5678 1234 5678`
    - Titular: Escribe "Juan Perez" → se convierte a "JUAN PEREZ"
    - Vencimiento: Escribe `1225` → se formatea a `12/25`
    - Ve fecha estimada de entrega (calculada a 7 días desde hoy)
    - Hace clic en "Confirmar Pago"

12. **Procesamiento del Pago**

    - **Frontend**: Envía datos del checkout a `cristopher_crear_preferencia`
    - **Backend**: Valida nonce de WordPress
    - **Backend**: Crea pedido en WordPress mediante `ai_crear_pedido()`
      - Crea post tipo `ai_pedido`
      - Guarda metadatos: cliente, dirección, ítems, imágenes
      - Estado inicial: `pendiente_pago`
    - **Backend**: Crea preferencia en Mercado Pago
      - Vincula ítems del carrito
      - Añade costo de envío
      - Guarda `pedido_id` en metadata
    - **Backend**: Retorna `init_point` (URL de pago) y `pedido_id`
    - **Frontend**: Redirige a Mercado Pago

13. **Pago en Mercado Pago**
    - Usuario completa pago en Mercado Pago
    - Mercado Pago procesa transacción

#### **Paso 7: Confirmación y Actualización** (Backend - Cristopher)

14. **Webhook de Mercado Pago**

    - Mercado Pago envía webhook a `ai_webhook_mp`
    - **Backend**: Valida webhook secret
    - **Backend**: Verifica estado del pago en Mercado Pago
    - Si pago es aprobado:
      - **Backend**: Actualiza pedido mediante `ai_actualizar_pedido_pagado()`
        - Estado de pago: `pagado`
        - Guarda información de transacción
      - **Backend**: Dispara hook `ai_pedido_pagado`
      - **Backend**: Webhook saliente (`ai_notificar_django`) envía notificación a Django (si está habilitado)

15. **Redirección y Confirmación**
    - Usuario es redirigido de vuelta a WordPress
    - **Frontend**: Muestra pantalla "¡Pedido Confirmado!"
    - Se genera ID de pedido único (ej: #YBZ4921)
    - Usuario puede hacer clic en "Ver Mis Pedidos"

#### **Paso 8: Seguimiento** (Frontend - Thory)

16. **Historial de Pedidos**
    - Ve su nuevo pedido en la lista con estado "En Procesamiento"
    - Puede expandirlo para ver detalle de ítems comprados
    - Ve fecha estimada de entrega

---

## 📂 Estructura del Proyecto

### Organización General

```
pablo/
├── arte-ideas.php              # Archivo principal del plugin (Cristopher)
│   ├── Definición de constantes (API keys)
│   ├── Enqueue de scripts (React, ReactDOM, Babel)
│   ├── Inyección de CSS y JS
│   ├── Shortcode principal
│   ├── AJAX: cristopher_crear_preferencia (Mercado Pago)
│   └── AJAX: cristopher_editar_imagen_ia (Google Gemini)
│
├── assets/
│   ├── script.js              # Frontend React completo (Thory)
│   │   ├── App.tsx (Orquestador principal)
│   │   ├── LandingPage
│   │   ├── ProductDetailView
│   │   ├── ProductCustomizer (con Canvas API)
│   │   ├── PhotoEditor
│   │   ├── AIEditor (con chat e historial)
│   │   ├── CartView
│   │   ├── CheckoutView
│   │   ├── PaymentView
│   │   └── OrdersView
│   └── style.css              # Estilos CSS (Thory + Responsive)
│
└── includes/                   # Módulos Backend (Cristopher)
    ├── orders-system.php       # CPT "Pedidos Fotográficos"
    │   ├── Registro del CPT
    │   ├── Meta boxes (Info, Archivos, Estados)
    │   ├── Función: ai_crear_pedido()
    │   └── Función: ai_actualizar_pedido_pagado()
    │
    ├── admin-settings.php      # Panel de administración
    │   ├── Menú principal "Sistema de Pedidos Fotográficos"
    │   ├── Tab: Listado
    │   ├── Tab: Claves de Pago
    │   ├── Tab: Gestionar Catálogo
    │   └── Tab: Integración Externa
    │
    ├── rest-api-endpoints.php  # REST API para Django
    │   └── GET /wp-json/ai/v1/pedidos
    │
    ├── webhook-outgoing.php    # Webhook saliente a Django
    │   ├── Función: ai_notificar_django()
    │   └── Hook: ai_pedido_pagado
    │
    ├── webhook-handler.php     # Procesar webhooks de pago
    │   ├── AJAX: ai_webhook_mp
    │   └── AJAX: ai_webhook_stripe
    │
    ├── roles.php               # Rol de operador
    │   └── Registro de rol "minilab_operator"
    │
    ├── download-zip.php        # Descarga de archivos
    │   └── AJAX: ai_descargar_zip
    │
    └── dpi-calculator.php      # Cálculo de DPI
        └── Función: ai_calculate_dpi_status()
```

### Componentes Frontend (Thory)

**App.tsx** - Orquestador Principal:

- Estado global: `cart`, `orders`, `currentView`
- Switch de vistas según `currentView`
- Funciones de navegación

**Componentes de Vista**:

- `LandingPage`: Grid de productos con cards
- `ProductDetailView`: Galería, información, botón "Empezar a Crear"
- `ProductCustomizer`:
  - Subida de archivos
  - Lógica de recorte con Canvas
  - Selector de formato y opciones
- `PhotoEditor`: Sliders de brillo, contraste, saturación
- `AIEditor`: Chat interface, historial de imágenes
- `CartView`: Listado de ítems, ajuste de cantidades
- `CheckoutView`: Formularios de datos y entrega
- `PaymentView`: Formulario de tarjeta con input masking
- `OrdersView`: Historial de pedidos del usuario

### Módulos Backend (Cristopher)

**orders-system.php**:

- Registro del Custom Post Type `ai_pedido`
- Meta boxes para información, archivos, y estados
- Funciones de creación y actualización de pedidos

**admin-settings.php**:

- Menú de administración con tabs
- Formularios de configuración
- Guardado de opciones en WordPress

**rest-api-endpoints.php**:

- Registro de ruta REST personalizada
- Autenticación por API key
- Formateo de respuesta JSON

**webhook-outgoing.php**:

- Función de notificación a Django
- Preparación de payload
- Envío con headers de seguridad

**webhook-handler.php**:

- Procesamiento de webhooks de Mercado Pago
- Procesamiento de webhooks de Stripe
- Validación y actualización de pedidos

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- WordPress 5.0 o superior
- PHP 7.4 o superior
- MySQL 5.6 o superior
- Composer (para dependencias de Mercado Pago)
- Node.js (opcional, para desarrollo frontend)

### Pasos de Instalación

#### 1. Instalación del Plugin

```bash
# Copiar carpeta del plugin
cp -r pablo/ /ruta/a/wordpress/wp-content/plugins/

# Instalar dependencias de Composer
cd /ruta/a/wordpress/wp-content/plugins/pablo
composer install
```

#### 2. Activar el Plugin

- Ir a **Plugins → Plugins Instalados** en WordPress
- Buscar "ArteIDEAS (Cristopher)" y hacer clic en "Activar"

#### 3. Configurar API Keys

Editar `arte-ideas.php` y actualizar las constantes:

```php
define('AI_MP_ACCESS_TOKEN', 'TU-ACCESS-TOKEN-MERCADO-PAGO');
define('AI_GEMINI_API_KEY', 'TU-API-KEY-GOOGLE-GEMINI');
```

#### 4. Configurar Panel de Administración

**Claves de Pago**:

- Ir a **Sistema de Pedidos Fotográficos → Claves de Pago**
- Configurar claves de Stripe y Mercado Pago

**Catálogo de Productos**:

- Ir a **Sistema de Pedidos Fotográficos → Gestionar Catálogo**
- Agregar productos con ID, título, precio, descripción, URL de imagen, ratio

**Integración Externa**:

- Ir a **Sistema de Pedidos Fotográficos → Integración Externa**
- Configurar API Key, URL de webhook Django, y Shared Secret

#### 5. Configurar Webhooks de Pago

**Mercado Pago**:

- En el panel de Mercado Pago, configurar webhook apuntando a:
  ```
  https://tusitio.com/wp-admin/admin-ajax.php?action=ai_webhook_mp
  ```

**Stripe**:

- En el panel de Stripe, configurar webhook apuntando a:
  ```
  https://tusitio.com/wp-admin/admin-ajax.php?action=ai_webhook_stripe
  ```

#### 6. Verificar Funcionamiento

1. Crear una página en WordPress con el shortcode `[arte_ideas_app]`
2. Visitar la página y verificar que la aplicación React se carga
3. Probar flujo completo: seleccionar producto → personalizar → agregar al carrito → checkout → pago

---

## 💻 Guías de Desarrollo

### Desarrollo Frontend (Thory)

**Estructura de Componentes**:

- Cada vista es un componente funcional de React
- Estado local con `useState`
- Efectos con `useEffect`
- Referencias con `useRef` cuando es necesario

**Manejo de Estado**:

- Estado global en `App.tsx` (carrito, pedidos, vista actual)
- Estado local en componentes específicos (formularios, editores)

**Comunicación con Backend**:

- AJAX mediante `fetch()` a endpoints de WordPress
- Datos pasados como JSON en el body
- Nonces de WordPress para seguridad

**Ejemplo de Llamada AJAX**:

```javascript
const response = await fetch(
  `${ArteData.ajax_url}?action=cristopher_crear_preferencia&nonce=${ArteData.nonce}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: cart, cliente: formData }),
  }
);
```

### Desarrollo Backend (Cristopher)

**Estructura Modular**:

- Cada funcionalidad en su propio archivo en `includes/`
- Funciones con prefijo `ai_` para evitar conflictos
- Hooks de WordPress para integración

**Creación de Endpoints AJAX**:

```php
add_action('wp_ajax_cristopher_crear_preferencia', 'cristopher_crear_preferencia');
add_action('wp_ajax_nopriv_cristopher_crear_preferencia', 'cristopher_crear_preferencia');

function cristopher_crear_preferencia() {
    check_ajax_referer('cristopher_nonce', 'nonce');
    // ... lógica ...
    wp_send_json_success($data);
}
```

**Creación de REST API**:

```php
add_action('rest_api_init', function() {
    register_rest_route('ai/v1', '/pedidos', [
        'methods' => 'GET',
        'callback' => 'ai_get_pedidos_rest_callback',
        'permission_callback' => '__return_true'
    ]);
});
```

**Manejo de Errores**:

- Try-catch en operaciones que pueden fallar
- Logging con `error_log()` para debugging
- Respuestas JSON consistentes: `wp_send_json_success()` o `wp_send_json_error()`

### Trabajo en Equipo

**Flujo de Trabajo**:

1. Thory desarrolla componentes frontend
2. Cristopher crea endpoints AJAX según necesidades del frontend
3. Ambos prueban integración en desarrollo local
4. Se despliega en staging para pruebas
5. Se despliega en producción

**Comunicación**:

- Endpoints AJAX documentados con parámetros esperados
- Formato de respuestas JSON acordado
- Errores con mensajes descriptivos para debugging

---

## 🔌 Integración con Sistemas Externos

### Integración con Django

#### Consultar Pedidos desde Django (Pull)

**Endpoint**: `GET /wp-json/ai/v1/pedidos`

**Autenticación**: Header `X-API-KEY: <TOKEN>`

**Parámetros**:

- `estado` (opcional): `pagado`, `pendiente_pago`, `pagado_parcial`
- `desde` (opcional): Fecha ISO8601

**Ejemplo en Python**:

```python
import requests

headers = {
    'X-API-KEY': 'tu-api-key-aqui'
}

params = {
    'estado': 'pagado',
    'desde': '2025-11-01T00:00:00Z'
}

response = requests.get(
    'https://tusitio.com/wp-json/ai/v1/pedidos',
    headers=headers,
    params=params
)

pedidos = response.json()['data']
```

#### Recibir Notificaciones desde WordPress (Push)

**Webhook Endpoint en Django**:

```python
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.conf import settings

@csrf_exempt
def webhook_pedido(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # Validar secret
    secret = request.headers.get('X-Integration-Secret')
    if secret != settings.WP_WEBHOOK_SECRET:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    # Validar source
    source = request.headers.get('X-Integration-Source')
    if source != 'wp_photo_plugin':
        return JsonResponse({'error': 'Invalid source'}, status=400)

    # Procesar pedido
    data = json.loads(request.body)
    pedido_id = data.get('id')
    # ... guardar en tu sistema ...

    return JsonResponse({'status': 'ok'})
```

**Configuración en WordPress**:

- Ir a **Sistema de Pedidos Fotográficos → Integración Externa**
- Configurar URL: `https://tu-django.com/api/webhook/pedido`
- Configurar Shared Secret
- Marcar checkbox "Habilitar Webhook"

### Contrato API Estable

El formato JSON del endpoint `/wp-json/ai/v1/pedidos` está **congelado**. No cambiará sin aviso previo.

**Formato de Respuesta**:

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
        "monto_total": 6.4,
        "moneda": "PEN"
      },
      "items": [
        {
          "size_id": "10x15",
          "size_label": "10x15 cm - €0.75",
          "qty": 4
        }
      ]
    }
  ]
}
```

---

## 🔐 Seguridad

### Medidas Implementadas

**Frontend (Thory)**:

- Validación de formularios en el cliente
- Sanitización de inputs antes de enviar
- Nonces de WordPress en peticiones AJAX

**Backend (Cristopher)**:

- Validación de nonces en todos los endpoints AJAX
- Sanitización de todos los inputs con funciones de WordPress
- Validación de permisos antes de operaciones sensibles
- Validación de API keys en REST API
- Validación de secrets en webhooks
- Escape de outputs antes de mostrar en HTML

### Mejores Prácticas

- **Principio de Menor Privilegio**: Rol de operador con permisos mínimos
- **Separación de Responsabilidades**: Módulos separados por funcionalidad
- **Logging**: Registro de operaciones críticas
- **Manejo de Errores**: Try-catch en operaciones que pueden fallar
- **Timeouts**: Configuración de timeouts en peticiones externas

---

## 🐛 Debugging

### Logs Disponibles

1. **Log de Integración**: `/wp-content/uploads/ai_integracion/integration.log`

   - Registra intentos de envío de webhooks a Django

2. **Log de WordPress**: Habilitar `WP_DEBUG_LOG` en `wp-config.php`
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

### Puntos de Debug Comunes

**Frontend no carga**:

- Verificar que React, ReactDOM y Babel se carguen correctamente
- Revisar consola del navegador para errores JavaScript
- Verificar que el shortcode esté en la página

**AJAX no funciona**:

- Verificar que el nonce sea correcto
- Revisar Network tab en DevTools
- Verificar que el endpoint AJAX esté registrado

**Pago no se procesa**:

- Verificar que las claves de Mercado Pago estén correctas
- Revisar logs de WordPress
- Verificar que el webhook esté configurado en Mercado Pago

**Edición con IA no funciona**:

- Verificar que `AI_GEMINI_API_KEY` esté configurada
- Verificar que la API key sea válida
- Revisar logs de WordPress para errores de cURL

**REST API retorna 401**:

- Verificar que el header `X-API-KEY` esté presente
- Verificar que el API key coincida con el configurado

---

## 📊 Base de Datos

### Estructura de Datos

**Custom Post Type**: `ai_pedido`

**Metadatos Principales**:

- `_ai_cliente_nombre`, `_ai_cliente_email`, `_ai_cliente_telefono`, `_ai_cliente_dni`
- `_ai_entrega_modo`, `_ai_entrega_direccion`, `_ai_entrega_distrito`, etc.
- `_ai_pago_metodo`, `_ai_pago_monto_total`, `_ai_pago_moneda`, `_ai_pago_status`
- `_ai_produccion_status`
- `_ai_items`: Array serializado de ítems
- `_ai_archivos`: Array serializado de archivos/imágenes
- `_ai_mp_preference_id`: ID de preferencia de Mercado Pago

**Opciones de WordPress**:

- `ai_stripe_*`: Configuración de Stripe
- `ai_mp_*`: Configuración de Mercado Pago
- `ai_catalogo_productos`: Array serializado de productos
- `ai_integracion_*`: Configuración de integración externa

---

## 🚀 Próximas Mejoras

### Frontend (Thory)

- [ ] Optimización de imágenes con lazy loading
- [ ] PWA (Progressive Web App) para instalación en móviles
- [ ] Mejoras en accesibilidad (ARIA labels, navegación por teclado)
- [ ] Internacionalización (i18n) para múltiples idiomas

### Backend (Cristopher)

- [ ] Cache de respuestas REST para mejorar rendimiento
- [ ] Retry logic en webhooks salientes
- [ ] Dashboard de estadísticas con métricas
- [ ] Notificaciones por email al cliente
- [ ] Exportación de reportes en Excel/PDF
- [ ] API de webhooks más robusta con firma HMAC

### Integración

- [ ] Sincronización bidireccional con Django
- [ ] Webhook para actualizar estados desde Django
- [ ] API para consultar catálogo desde Django

---

## 📞 Soporte y Contacto

**Equipo de Desarrollo**:

- **Thory** - Frontend Developer
- **Cristopher** - Backend Developer

Para problemas o preguntas, contactar al equipo de desarrollo.

---

**Versión del Plugin**: 20.0  
**Última Actualización**: Diciembre 2025  
**Desarrollado por**: Thory (Frontend) & Cristopher (Backend)

---

## 📝 Notas Finales

Esta documentación describe el sistema completo de ArteIDEAS, integrando tanto la parte frontend desarrollada por Thory como la parte backend desarrollada por Cristopher. El sistema está diseñado para ser escalable, mantenible y fácil de extender.

**Características Clave del Sistema**:

- ✅ Arquitectura modular y separación de responsabilidades
- ✅ Integración segura con APIs externas
- ✅ Experiencia de usuario moderna y responsive
- ✅ Sistema de gestión completo para administradores
- ✅ API REST estable para integración con sistemas externos
- ✅ Webhooks bidireccionales para sincronización en tiempo real

El trabajo conjunto de Thory y Cristopher ha resultado en una plataforma robusta y completa para la venta de productos fotográficos personalizados con capacidades de IA.
