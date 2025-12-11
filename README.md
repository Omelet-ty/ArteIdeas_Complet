# 🎨 ArteIDEAS - Plataforma de Personalización con IA

Una aplicación de comercio electrónico moderna construida con React, diseñada para la venta de productos fotográficos personalizados. Integra potentes herramientas de edición de imágenes, incluyendo recorte dinámico y manipulación generativa mediante la API de Google Gemini.

## 🌟 Características Principales

### 1. 🛍️ Catálogo y Navegación
- **Diseño Responsivo:** Interfaz adaptada perfectamente a Escritorio y Móviles.
- **Experiencia de Usuario:** Transiciones suaves, efectos hover y feedback visual inmediato.
- **Búsqueda y Filtrado:** Barra de búsqueda integrada en la cabecera.

### 2. 🎨 Personalizador de Productos (Core)
El flujo de personalización permite a los usuarios adaptar sus fotos antes de la compra:
- **Carga de Imágenes:** Soporte para arrastrar y soltar (Drag & Drop).
- **Recorte Inteligente (Cropping):**
  - Relaciones de aspecto predefinidas (9x13, 10x15, etc.) que fuerzan la proporción del recorte.
  - **Dimensiones Personalizadas:** El usuario puede definir ancho y alto exactos en centímetros.
  - **Lógica Canvas:** El recorte se procesa en el cliente utilizando la API Canvas de HTML5.
- **Configuración de Producto:** Selección de acabados (Mate/Brillante) y nombrado de proyectos.

### 3. ✨ Edición con Inteligencia Artificial (Gemini)
Integración directa con Google Gemini (`gemini-2.5-flash-image`) para edición de fotos mediante lenguaje natural:
- **Chat Interface:** El usuario escribe comandos como "Quita el fondo", "Haz que parezca un dibujo al óleo", "Mejora la iluminación".
- **Historial de Versiones:** Tira de imágenes navegable que guarda cada iteración de la edición. El usuario puede hacer clic en cualquier versión anterior para restaurarla.
- **Optimización Móvil:** Layout ajustado para editar cómodamente desde el celular (Imagen arriba, chat abajo).

### 4. 🛒 Carrito y Checkout Avanzado
- **Gestión de Carrito:** Ajuste de cantidades y eliminación de ítems en tiempo real.
- **Lógica de Entrega:**
  - **Envío a Domicilio:** Calculo automático de envío (+5.00€) y despliegue de formulario de dirección.
  - **Recojo en Tienda:** Coste de envío gratuito (0€) y visualización de datos de la tienda física (Dirección, horarios).

### 5. 💳 Pasarela de Pago y Pedidos
- **Simulación de Pago:** Formulario de tarjeta de crédito interactivo.
- **Historial de Pedidos:** Sección "Mis Pedidos" para ver el estado, fecha estimada y detalle de compras pasadas.
- **Confirmación:** Pantalla de éxito con resumen financiero y generación de ID de pedido único.

---

## 📖 Ejemplo de Flujo de Compra: Paso a Paso

A continuación, se detalla un escenario completo de uso ("Happy Path") desde que un usuario entra hasta que finaliza su compra.

### Paso 1: Selección y Personalización
1.  **Inicio:** El usuario selecciona el producto "Marco Básico Personalizado".
2.  **Vista de Detalle:** Revisa el precio y las promociones por volumen. Hace clic en **"Empezar a Crear Online"**.
3.  **Subida:** En el personalizador, arrastra una foto familiar.
4.  **Recorte (Cropping):**
    *   Selecciona el formato "10x15 cm".
    *   Un recuadro de recorte aparece sobre la imagen bloqueado a esa proporción. El usuario mueve el recuadro para centrar las caras.
    *   Hace clic en **"Aplicar Recorte"**. La imagen se recorta instantáneamente.
5.  **Opciones:**
    *   Selecciona papel "Mate".
    *   Nombra el proyecto: "Regalo Mamá".
6.  **Acción:** Hace clic en **"Agregar al Carrito"**.

### Paso 2: Carrito de Compras
1.  El usuario ve el ítem con su miniatura recortada.
2.  Decide llevar 2 copias, así que presiona el botón `+`. El precio total se actualiza.
3.  Hace clic en **"Proceder al Pago"**.

### Paso 3: Checkout (Datos de Envío)
Aquí ocurren validaciones críticas para asegurar la calidad de los datos:

1.  **Selección de Entrega:** El usuario elige **"Envío a Domicilio"**. El sistema añade 5€ al total.
2.  **Formulario de Datos:**
    *   **Nombre:** Escribe "Juan Pérez".
    *   **Teléfono:** Intenta escribir letras, pero el campo lo bloquea. Escribe "612345678" (9 dígitos exactos).
    *   **DNI:** El sistema valida que tenga 9 dígitos.
    *   **Email:** Escribe "juan@gmail.com". Si olvida el "@", el borde se pone rojo al intentar avanzar.
    *   **Dirección:** Rellena Calle Falsa 123 y su Ciudad.
3.  **Resumen:** A la derecha, ve el Subtotal + Envío desglosado.
4.  Hace clic en **"Continuar al Pago"**.

### Paso 4: Pago (Simulación)
El usuario se encuentra con un formulario de tarjeta de crédito con formato automático ("Input Masking"):

1.  **Número de Tarjeta:** Escribe `1234567812345678`. El input automáticamente lo formatea a `1234 5678 1234 5678`.
2.  **Titular:** Escribe "Juan Perez", y el input lo convierte automáticamente a mayúsculas: `JUAN PEREZ`.
3.  **Vencimiento:** Escribe `1225`. El input añade la barra: `12/25`.
4.  **Confirmación:** Ve la fecha estimada de entrega (calculada automáticamente a 7 días desde hoy).
5.  Hace clic en **"Confirmar Pago"**.

### Paso 5: Confirmación y Post-Venta
1.  **Éxito:** Aparece la pantalla "¡Pedido Confirmado!".
2.  **Datos:** Se genera un ID de pedido aleatorio (ej. `#YBZ4921`).
3.  **Seguimiento:** El usuario hace clic en "Ver Mis Pedidos".
4.  **Historial:** Ve su nuevo pedido en la lista con estado "En Procesamiento". Puede expandirlo para ver el detalle de los ítems comprados.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS (Diseño utility-first para rapidez y consistencia).
- **Iconos:** Lucide React (Iconografía limpia y vectorizada).
- **IA / Backend-as-a-Service:** Google GenAI SDK (`@google/genai`).
- **Manipulación de Imagen:** HTML5 Canvas API (Para recortar y aplicar filtros sin necesidad de backend).

## 📂 Estructura del Proyecto

- `App.tsx`: Orquestador principal. Contiene el `switch` de vistas (`currentView`) y el estado global (`cart`, `orders`, `user`).
- **Componentes de Vista (Dentro de App.tsx):**
  - `LandingPage`: Escaparate inicial.
  - `ProductDetailView`: Información del producto.
  - `ProductCustomizer`: Lógica compleja de Canvas y subida de archivos.
  - `PhotoEditor` / `AIEditor`: Sub-componentes para manipulación de imagen.
  - `CartView`: Listado de compra.
  - `CheckoutView`: Formularios de datos y envío.
  - `PaymentView`: Pasarela de pago simulada.
  - `OrdersView`: Historial de usuario.

## 🚀 Instalación y Uso

1. **Requisitos:** Necesitas una API KEY de Google Gemini para las funciones de IA.
2. **Configuración:** La API KEY se inyecta automáticamente a través de `process.env.API_KEY` en el entorno de ejecución de AI Studio.
3. **Ejecución:** La aplicación se monta en el elemento `#root` del `index.html`.

---
*Desarrollado como demostración de un flujo E-commerce moderno, robusto y potenciado por IA Generativa.*