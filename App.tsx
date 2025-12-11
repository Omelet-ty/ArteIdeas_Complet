
import React, { useState, useRef, useEffect } from 'react';
import { Search, Box, ShoppingCart, Gift, ShoppingBag, ArrowLeft, Upload, Check, Crop, Wand2, Sparkles, Save, RotateCcw, Send, Bot, User, Loader2, X, CheckCircle, AlertCircle, History, Clock, Trash2, Plus, Minus, MapPin, CreditCard, Calendar } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- DATA TYPES ---
interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  oldPrice?: string;
  imgSrc: string;
  bgColor: string;
  badge?: string;
  promotions?: string[];
  thumbnails?: string[];
}

interface CartItem {
  id: string;
  productId: number;
  imgSrc: string;
  projectName: string;
  format: string;
  paperType: string;
  price: number;
  quantity: number;
}

interface CheckoutData {
  deliveryType: 'delivery' | 'pickup';
  name: string;
  phone: string;
  dni: string;
  email: string;
  address?: string;
  city?: string;
  zip?: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  estimatedDate: string;
  deliveryType: 'delivery' | 'pickup';
  items: CartItem[];
  total: number;
}

// --- MOCK DATA ---
const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Marco Básico Personalizado con Foto",
    description: "Marco elegante perfecto para cualquier foto especial. Resistente, bonito, colorido y muy personal.",
    price: "24.99€",
    oldPrice: "34.99€",
    badge: "OFERTA",
    bgColor: "bg-pink-100",
    imgSrc: "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?q=80&w=600&auto=format&fit=crop", // Graduate
    promotions: [
      "Compra 3+ unidades: 10% descuento",
      "Compra 5+ unidades: 15% descuento",
      "Compra 10+ unidades: 25% descuento"
    ],
    thumbnails: [
      "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=200&auto=format&fit=crop" 
    ]
  },
  {
    id: 2,
    title: "Marcos Personalizados con Fotos - Collage",
    description: "Convierte tus mejores fotos en piezas de arte únicas. Varios tamaños y diseños disponibles.",
    price: "29.95€",
    bgColor: "bg-yellow-100",
    imgSrc: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop", // Wall art / Collage frames
  },
  {
    id: 3,
    title: "Marco Personalizado con Fotos - Elegante",
    description: "Marcos de alta calidad con diseño elegante. Ideal para decorar tu hogar con tus mejores recuerdos.",
    price: "24.95€",
    bgColor: "bg-pink-100",
    imgSrc: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop", // Wedding
  },
  {
    id: 4,
    title: "Impresiones de Fotos - Revelado",
    description: "Impresión profesional de fotos en varios tamaños. Calidad premium para tus mejores momentos.",
    price: "19.96€",
    oldPrice: "9.70€", 
    bgColor: "bg-cyan-50",
    imgSrc: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop", // Prints/Polaroids
  }
];

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'customizer' | 'cart' | 'checkout' | 'payment' | 'confirmation' | 'orders'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (currentView === 'customizer') {
      setCurrentView('product');
    } else if (currentView === 'product') {
      setSelectedProduct(null);
      setCurrentView('home');
    } else if (currentView === 'cart') {
      setCurrentView('home');
      setSelectedProduct(null);
    } else if (currentView === 'checkout') {
      setCurrentView('cart');
    } else if (currentView === 'payment') {
      setCurrentView('checkout');
    } else if (currentView === 'orders') {
      setCurrentView('home');
    } else if (currentView === 'confirmation') {
        if (viewingOrder && orders.find(o => o.id === viewingOrder.id)) {
            setCurrentView('orders');
        } else {
            setCurrentView('home');
        }
    }
    window.scrollTo(0, 0);
  };

  const handleStartCustomizing = () => {
    setCurrentView('customizer');
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setCart(prev => [...prev, newItem]);
    setCurrentView('cart');
    window.scrollTo(0, 0);
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleProceedToCheckout = () => {
    setCurrentView('checkout');
    window.scrollTo(0, 0);
  };

  const handleProceedToPayment = (data: CheckoutData) => {
    setCheckoutData(data);
    setCurrentView('payment');
    window.scrollTo(0, 0);
  };

  const handleConfirmPayment = () => {
    if (!checkoutData) return;

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = checkoutData.deliveryType === 'delivery' ? 5.00 : 0.00;
    const total = subtotal + shippingCost;
    
    // Create new order
    const newOrder: Order = {
      id: "#YBZ" + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'En Procesamiento',
      estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), // 7 days later
      deliveryType: checkoutData.deliveryType,
      items: [...cart],
      total: total
    };

    setOrders(prev => [newOrder, ...prev]);
    setViewingOrder(newOrder);
    setCart([]); // Clear cart
    setCheckoutData(null); // Clear checkout
    setCurrentView('confirmation');
    window.scrollTo(0, 0);
  };

  const handleReturnToHome = () => {
    setCart([]);
    setSelectedProduct(null);
    setCheckoutData(null);
    setViewingOrder(null);
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  const handleViewOrderDetails = (order: Order) => {
    setViewingOrder(order);
    setCurrentView('confirmation');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-orange-50/30 font-sans text-gray-800">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo / Home Link */}
            <div className="cursor-pointer" onClick={() => { setSelectedProduct(null); setCurrentView('home'); }}>
               <div className="font-bold text-xl md:text-2xl">
                  <span className="text-[#FF7F40]">Arte</span><span className="text-[#00A9C3]">IDEAS</span>
               </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 w-full md:max-w-md relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar productos"
                  className="w-full bg-gray-100 text-sm text-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-8 text-gray-600">
              <button 
                className="hover:text-orange-500 transition-colors"
                onClick={() => setCurrentView('orders')}
              >
                <Box className="w-5 h-5" />
              </button>
              <button 
                className="hover:text-orange-500 transition-colors relative"
                onClick={() => setCurrentView('cart')}
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
      </header>

      {/* --- MAIN CONTENT SWITCHER --- */}
      <main>
        {currentView === 'customizer' && selectedProduct ? (
          <ProductCustomizer 
            product={selectedProduct} 
            onBack={handleBack} 
            onAddToCart={handleAddToCart}
          />
        ) : currentView === 'product' && selectedProduct ? (
          <ProductDetailView 
            product={selectedProduct} 
            onBack={handleBack} 
            onCustomize={handleStartCustomizing} 
          />
        ) : currentView === 'cart' ? (
          <CartView 
            cart={cart} 
            onUpdateQty={handleUpdateCartQty} 
            onRemove={handleRemoveFromCart}
            onContinueShopping={() => { setSelectedProduct(null); setCurrentView('home'); }}
            onProceedToCheckout={handleProceedToCheckout}
          />
        ) : currentView === 'checkout' ? (
          <CheckoutView 
            cart={cart}
            onBack={handleBack}
            onNext={handleProceedToPayment}
          />
        ) : currentView === 'payment' && checkoutData ? (
          <PaymentView 
            cart={cart}
            checkoutData={checkoutData}
            onBack={handleBack}
            onConfirmPayment={handleConfirmPayment}
          />
        ) : currentView === 'confirmation' && viewingOrder ? (
          <OrderConfirmationView 
            order={viewingOrder}
            onHome={handleReturnToHome}
            onViewOrders={() => setCurrentView('orders')}
          />
        ) : currentView === 'orders' ? (
          <OrdersView 
            orders={orders}
            onBack={() => setCurrentView('home')}
            onViewDetails={handleViewOrderDetails}
          />
        ) : (
          <LandingPage onProductClick={handleProductClick} />
        )}
      </main>

    </div>
  );
}

// --- VIEW COMPONENT: ORDERS LIST ---
function OrdersView({ orders, onBack, onViewDetails }: { orders: Order[], onBack: () => void, onViewDetails: (order: Order) => void }) {
  return (
    <div className="mx-auto px-4 py-8 fade-in max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No tienes pedidos recientes</h2>
          <p className="text-gray-500 mb-8">Tus pedidos confirmados aparecerán aquí.</p>
          <button 
            onClick={onBack}
            className="bg-[#FF7F40] text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-[#e06a30] transition-colors"
          >
            Ir a la Tienda
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Pedido {order.id}</h3>
                    <p className="text-sm text-gray-500">{order.date}</p>
                 </div>
                 <div>
                    <span className="bg-[#3B82F6] text-white text-sm font-bold px-4 py-1.5 rounded-full inline-block">
                       {order.status}
                    </span>
                 </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                
                {/* Meta Info */}
                <div className="grid gap-6 mb-6 grid-cols-1 sm:grid-cols-3">
                   <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#FF7F40]" />
                      <div>
                         <p className="text-xs text-gray-500 font-semibold uppercase">Fecha Estimada</p>
                         <p className="font-bold text-gray-800">{order.estimatedDate}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#FF7F40]" />
                      <div>
                         <p className="text-xs text-gray-500 font-semibold uppercase">Tipo de Entrega</p>
                         <p className="font-bold text-gray-800 capitalize">{order.deliveryType === 'pickup' ? 'Recojo' : 'Envío'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <Box className="w-5 h-5 text-[#FF7F40]" />
                      <div>
                         <p className="text-xs text-gray-500 font-semibold uppercase">Productos</p>
                         <p className="font-bold text-gray-800">{order.items.length} item(s)</p>
                      </div>
                   </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                   {order.items.map((item, idx) => (
                     <div key={idx} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                           <img src={item.imgSrc} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                           <div>
                              <h4 className="font-bold text-gray-900 text-sm md:text-base">{item.projectName || 'Producto Personalizado'}</h4>
                              <p className="text-sm text-gray-500">{item.format} • {item.paperType}</p>
                              <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                           </div>
                           <div className="text-right">
                              <span className="font-bold text-[#FF7F40]">€{item.price.toFixed(2)}</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

              </div>

              {/* Card Footer */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
                 <div>
                    <span className="text-sm text-gray-600 mr-2">Total Pagado</span>
                    <span className="text-xl font-bold text-[#FF7F40]">€{order.total.toFixed(2)}</span>
                 </div>
                 <button 
                    onClick={() => onViewDetails(order)}
                    className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors shadow-sm w-full sm:w-auto"
                 >
                    Ver Detalles
                 </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- VIEW COMPONENT: ORDER CONFIRMATION ---
function OrderConfirmationView({ order, onHome, onViewOrders }: { order: Order, onHome: () => void, onViewOrders: () => void }) {
  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = order.total - subtotal;
  
  return (
    <div className="mx-auto px-4 py-12 fade-in max-w-4xl">
       
       <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#00A9C3] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-white">
             <Check className="w-10 h-10" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
          <p className="text-gray-500 mb-2">Gracias por tu compra</p>
          <p className="text-[#FF7F40] font-bold text-sm">Número de pedido: {order.id}</p>
       </div>

       {/* Status Cards */}
       <div className="grid gap-4 mb-8 grid-cols-1 sm:grid-cols-3">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
             <Calendar className="w-8 h-8 text-[#FF7F40] mb-3" />
             <h3 className="font-bold text-gray-800 text-sm mb-1">Fecha Estimada</h3>
             <p className="text-gray-500 text-sm capitalize">{order.estimatedDate}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
             <Box className="w-8 h-8 text-[#FF7F40] mb-3" />
             <h3 className="font-bold text-gray-800 text-sm mb-1">Estado</h3>
             <p className="text-gray-500 text-sm">{order.status}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
             <MapPin className="w-8 h-8 text-[#FF7F40] mb-3" />
             <h3 className="font-bold text-gray-800 text-sm mb-1">Entrega</h3>
             <p className="text-gray-500 text-sm">{order.deliveryType === 'pickup' ? 'Recojo en Tienda' : 'Envío a Domicilio'}</p>
          </div>
       </div>

       {/* Order Details */}
       <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Detalles del Pedido</h2>
          
          <div className="space-y-6 mb-8">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                 <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.imgSrc} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <h4 className="font-bold text-gray-800">{item.projectName || 'Producto'}</h4>
                       <span className="font-bold text-[#FF7F40]">€{item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{item.format}</p>
                    <p className="text-sm text-gray-500">Papel: {item.paperType}</p>
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                 </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-3">
             <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal ({order.items.length} producto{order.items.length !== 1 ? 's' : ''})</span>
                <span className="font-medium text-gray-900">€{subtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-gray-600 text-sm">
                <span>Envío</span>
                <span className="font-medium text-gray-900">€{shippingCost.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-gray-900 text-lg pt-2">
                <span className="font-bold">Total Pagado</span>
                <span className="font-bold text-[#FF7F40]">€{order.total.toFixed(2)}</span>
             </div>
          </div>
       </div>

       {/* Next Steps Card */}
       <div className="bg-pink-50 border border-pink-100 rounded-2xl p-6 md:p-8 mb-10">
          <h3 className="font-bold text-gray-900 mb-4">¿Qué sigue?</h3>
          <ul className="space-y-3">
             <li className="flex items-start gap-3">
                <div className="min-w-4 mt-1"><Check className="w-4 h-4 text-[#FF7F40]" /></div>
                <p className="text-sm text-gray-600">Recibirás un email de confirmación con los detalles de tu pedido</p>
             </li>
             <li className="flex items-start gap-3">
                <div className="min-w-4 mt-1"><Check className="w-4 h-4 text-[#FF7F40]" /></div>
                <p className="text-sm text-gray-600">Tu pedido será procesado y preparado en las próximas 24-48 horas</p>
             </li>
             <li className="flex items-start gap-3">
                <div className="min-w-4 mt-1"><Check className="w-4 h-4 text-[#FF7F40]" /></div>
                <p className="text-sm text-gray-600">Te notificaremos cuando tu pedido esté en camino</p>
             </li>
          </ul>
       </div>

       {/* Action Buttons */}
       <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
             onClick={onHome}
             className="bg-white border border-gray-200 text-gray-700 font-bold py-3 px-8 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
             Volver a la Tienda
          </button>
          <button 
            onClick={onViewOrders}
            className="bg-[#3AB0B6] hover:bg-[#2c9aa0] text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors"
          >
             Ver Mis Pedidos
          </button>
       </div>

    </div>
  );
}

// --- VIEW COMPONENT: PAYMENT ---
function PaymentView({ cart, checkoutData, onBack, onConfirmPayment }: { cart: CartItem[], checkoutData: CheckoutData, onBack: () => void, onConfirmPayment: () => void }) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = checkoutData.deliveryType === 'delivery' ? 5.00 : 0.00;
  const total = subtotal + shippingCost;
  
  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      // Remove non-digits, limit to 16
      const numbers = value.replace(/\D/g, '').substring(0, 16);
      // Group by 4 with spaces: 1234 5678 ...
      // Using Lookahead Regex to insert space after every 4th digit, but not at the end
      formattedValue = numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (name === 'expiry') {
      // Remove non-digits, limit to 4
      const numbers = value.replace(/\D/g, '').substring(0, 4);
      if (numbers.length >= 2) {
         formattedValue = `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
      } else {
         formattedValue = numbers;
      }
    } else if (name === 'cvv') {
       // Numbers only, max 4
       formattedValue = value.replace(/\D/g, '').substring(0, 4);
    } else if (name === 'cardName') {
       formattedValue = value.toUpperCase();
    }

    setPaymentForm(prev => ({ ...prev, [name]: formattedValue }));
  };
  
  // Calculate fake delivery date (7 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const formattedDate = deliveryDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="mx-auto px-4 py-8 fade-in max-w-6xl">
       <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-[#FF7F40] mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Realizar Pago</h1>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        
        {/* Left: Payment Form */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-[#FF7F40]" />
                <h2 className="text-xl font-bold text-gray-900">Información de Pago</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Tarjeta</label>
                  <input 
                    type="text" 
                    name="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={handlePaymentChange}
                    placeholder="1234 5678 9012 3456" 
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-all text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre en la Tarjeta</label>
                  <input 
                    type="text" 
                    name="cardName"
                    value={paymentForm.cardName}
                    onChange={handlePaymentChange}
                    placeholder="JUAN PEREZ" 
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-all text-sm uppercase" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Vencimiento</label>
                     <input 
                        type="text" 
                        name="expiry"
                        value={paymentForm.expiry}
                        onChange={handlePaymentChange}
                        placeholder="MM/AA" 
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-all text-sm" 
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                     <input 
                        type="text" 
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={handlePaymentChange}
                        placeholder="123" 
                        maxLength={3} 
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-all text-sm" 
                     />
                   </div>
                </div>
              </div>

              {/* Estimated Date */}
              <div className="mt-8 bg-cyan-50/50 rounded-xl p-4 flex items-start gap-3 border border-cyan-100">
                 <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                 <div>
                    <h4 className="text-sm font-bold text-gray-600">Fecha Estimada de Entrega</h4>
                    <p className="font-bold text-gray-800 text-lg mt-1">{formattedDate}</p>
                    <p className="text-xs text-gray-500 mt-1">(Aproximadamente 7-10 días hábiles)</p>
                 </div>
              </div>

              <button 
                onClick={onConfirmPayment}
                className="w-full mt-8 bg-[#3AB0B6] hover:bg-[#2c9aa0] text-white font-bold py-4 px-4 rounded-lg shadow-md transition-colors"
              >
                Confirmar Pago - €{total.toFixed(2)}
              </button>
           </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>
              
              {cart.map((item) => (
                 <div key={item.id} className="flex gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                       <img src={item.imgSrc} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-sm text-gray-800">{item.projectName || 'Producto'}</h4>
                       <p className="text-xs text-gray-500">{item.format}</p>
                       <p className="text-xs font-bold text-[#FF7F40] mt-0.5">€{item.price.toFixed(2)}</p>
                    </div>
                 </div>
              ))}
              
              <div className="border-t border-gray-100 my-4"></div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600 text-sm">
                   <span>Subtotal</span>
                   <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                   <span>Envío</span>
                   <span>{shippingCost === 0 ? 'Gratis' : `€${shippingCost.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                   <span className="font-bold text-gray-900">Total</span>
                   <span className="font-bold text-[#FF7F40] text-xl">€{total.toFixed(2)}</span>
                </div>
              </div>
           </div>

           {/* Pickup Data - Only show if pickup */}
           {checkoutData.deliveryType === 'pickup' && (
             <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Datos de Recojo</h3>
                <div className="space-y-2 text-sm">
                   <p><span className="font-semibold text-gray-600">Nombre:</span> <span className="text-gray-500">{checkoutData.name}</span></p>
                   <p><span className="font-semibold text-gray-600">Teléfono:</span> <span className="text-gray-500">{checkoutData.phone}</span></p>
                   <p><span className="font-semibold text-gray-600">DNI:</span> <span className="text-gray-500">{checkoutData.dni}</span></p>
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}

// --- VIEW COMPONENT: CHECKOUT ---
function CheckoutView({ cart, onBack, onNext }: { cart: CartItem[], onBack: () => void, onNext: (data: CheckoutData) => void }) {
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dni: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phone' || name === 'dni') {
      // Only numbers
      const numericValue = value.replace(/[^0-9]/g, '');
      // Max length 9
      if (numericValue.length <= 9) {
         setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateAndProceed = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (!formData.name) newErrors.name = true;
    
    // Validate Phone length
    if (!formData.phone || formData.phone.length !== 9) newErrors.phone = true;
    
    // Validate DNI length
    if (!formData.dni || formData.dni.length !== 9) newErrors.dni = true;

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.com$/i; 
    if (!formData.email || !emailPattern.test(formData.email)) {
         newErrors.email = true;
    }
    
    if (deliveryType === 'delivery') {
      if (!formData.address) newErrors.address = true;
      if (!formData.city) newErrors.city = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext({
        deliveryType,
        ...formData
      });
    }
  };
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = deliveryType === 'delivery' ? 5.00 : 0.00;
  const total = subtotal + shippingCost;

  return (
    <div className="mx-auto px-4 py-8 fade-in max-w-6xl">
       {/* Breadcrumb-ish back button */}
       <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-[#FF7F40] mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver al Carrito
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Delivery Type */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
             <h2 className="text-xl font-bold text-gray-900 mb-4">Tipo de Entrega</h2>
             <div className="space-y-3 mb-6">
               <label className="flex items-center cursor-pointer">
                 <input 
                   type="radio" 
                   name="delivery" 
                   className="w-5 h-5 text-[#FF7F40] focus:ring-[#FF7F40] border-gray-300" 
                   checked={deliveryType === 'delivery'}
                   onChange={() => setDeliveryType('delivery')}
                 />
                 <span className="ml-3 font-medium text-gray-700">Envío a Domicilio (€5.00)</span>
               </label>
               <label className="flex items-center cursor-pointer">
                 <input 
                   type="radio" 
                   name="delivery" 
                   className="w-5 h-5 text-[#FF7F40] focus:ring-[#FF7F40] border-gray-300"
                   checked={deliveryType === 'pickup'}
                   onChange={() => setDeliveryType('pickup')}
                 />
                 <span className="ml-3 font-medium text-gray-700">Recojo en Tienda (Gratis)</span>
               </label>
             </div>

             {/* Store Info Box - Only visible when Pickup is selected */}
             {deliveryType === 'pickup' && (
               <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 fade-in">
                  <h3 className="font-bold text-gray-800 mb-2">Dirección de la Tienda</h3>
                  <p className="text-[#00A9C3] font-bold mb-1">ArteIDEAS</p>
                  <p className="text-gray-600 text-sm">Calle Principal 123, Local 5</p>
                  <p className="text-gray-600 text-sm mb-2">28001 Madrid, España</p>
                  <p className="text-gray-500 text-xs">Horario: Lunes a Viernes 9:00 - 18:00</p>
               </div>
             )}
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
             <h2 className="text-xl font-bold text-gray-900 mb-6">Información Personal</h2>
             <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-100 transition-all ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-400'}`} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono/Celular <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-100 transition-all ${errors.phone ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-400'}`} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">DNI <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-100 transition-all ${errors.dni ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-400'}`} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-100 transition-all ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-400'}`} 
                  />
                </div>
             </div>
          </div>

          {/* Shipping Address - Only visible for Delivery */}
          {deliveryType === 'delivery' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 fade-in">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Dirección de Envío</h2>
               <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-100 transition-all ${errors.address ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-400'}`} 
                    />
                  </div>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-100 transition-all ${errors.city ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-400'}`} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Código Postal</label>
                      <input 
                        type="text" 
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-all" 
                      />
                    </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Notas de Entrega (opcional)</label>
                     <textarea 
                       name="notes"
                       value={formData.notes}
                       onChange={handleInputChange}
                       className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-all h-24 resize-none" 
                       placeholder="Referencias adicionales..."
                     ></textarea>
                  </div>
               </div>
            </div>
          )}

        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
           <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                   <span>Subtotal</span>
                   <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                   <span>Envío</span>
                   <span>{shippingCost === 0 ? 'Gratis' : `€${shippingCost.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center">
                   <span className="font-bold text-gray-900">Total</span>
                   <span className="font-bold text-[#FF7F40] text-2xl">€{total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={validateAndProceed}
                className="w-full bg-[#3AB0B6] hover:bg-[#2c9aa0] text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors"
              >
                Continuar al Pago
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}

// --- VIEW COMPONENT: CART ---
function CartView({ 
  cart, 
  onUpdateQty, 
  onRemove,
  onContinueShopping,
  onProceedToCheckout
}: { 
  cart: CartItem[], 
  onUpdateQty: (id: string, delta: number) => void,
  onRemove: (id: string) => void,
  onContinueShopping: () => void,
  onProceedToCheckout: () => void
}) {
  const shippingCost = 3.99; // Estimated for cart view, checkout view is specific
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + (cart.length > 0 ? shippingCost : 0);

  return (
    <div className="mx-auto px-4 py-8 fade-in max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8">Parece que aún no has personalizado ningún producto.</p>
          <button 
            onClick={onContinueShopping}
            className="bg-[#FF7F40] text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-[#e06a30] transition-colors"
          >
            Empezar a Crear
          </button>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 md:p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                
                {/* Image */}
                <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                  <img src={item.imgSrc} alt="Preview" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 w-full">
                   <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-gray-900">{item.projectName || "Sin nombre"}</h3>
                      <span className="font-bold text-[#FF7F40] sm:hidden">€{item.price.toFixed(2)}</span>
                   </div>
                   <p className="text-sm text-gray-500">Formato: {item.format}</p>
                   <p className="text-sm text-gray-500 mb-4">Tipo de Papel: {item.paperType}</p>
                   
                   <div className="flex items-center justify-between">
                      {/* Qty Control */}
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button 
                          onClick={() => onUpdateQty(item.id, -1)}
                          className="p-2 text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-medium text-gray-700 w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="p-2 text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => onRemove(item.id)}
                        className="text-red-400 hover:text-red-600 p-2 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                {/* Price Desktop */}
                <div className="hidden sm:block text-right self-start">
                   <span className="font-bold text-[#FF7F40] text-xl">€{item.price.toFixed(2)}</span>
                </div>

              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>
               
               <div className="space-y-3 mb-6">
                 <div className="flex justify-between text-gray-600 text-sm">
                    <span>Productos ({cart.length})</span>
                    <span>€{subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-gray-600 text-sm">
                    <span>Envío</span>
                    <span>€{shippingCost.toFixed(2)}</span>
                 </div>
               </div>

               <div className="border-t border-gray-100 pt-4 mb-8">
                 <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-[#FF7F40] text-2xl">€{total.toFixed(2)}</span>
                 </div>
               </div>

               <button 
                 onClick={onProceedToCheckout}
                 className="w-full bg-[#3AB0B6] hover:bg-[#2c9aa0] text-white font-bold py-3 px-4 rounded-lg shadow-md transition-opacity mb-3"
               >
                 Proceder al Pago
               </button>
               
               <button 
                 onClick={onContinueShopping}
                 className="w-full bg-white border border-gray-200 text-gray-600 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
               >
                 Seguir Comprando
               </button>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// --- VIEW COMPONENT: CUSTOMIZER ---
function ProductCustomizer({ 
  product, 
  onBack,
  onAddToCart
}: { 
  product: Product; 
  onBack: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
}) {
  const [selectedFormat, setSelectedFormat] = useState('11x15');
  const [paperType, setPaperType] = useState(''); // Default empty to force selection
  const [projectName, setProjectName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isCropped, setIsCropped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAIEditing, setIsAIEditing] = useState(false);
  
  // Custom Dimensions State
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');

  // Validation State
  const [errors, setErrors] = useState<{ image?: boolean, paper?: boolean, project?: boolean }>({});
  
  // Dragging & Crop State
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const formats = [
    { id: '9x13', label: '9x13 cm', price: 0.70 },
    { id: '10x15', label: '10x15 cm', price: 0.75 },
    { id: '11x15', label: '11x15 cm', price: 0.80 },
    { id: '13x13', label: '13x13 cm', price: 0.85 },
    { id: '13x18', label: '13x18 cm', price: 0.90 },
    { id: '15x15', label: '15x15 cm', price: 0.95 },
    { id: '15x20', label: '15x20 cm', price: 1.00 },
    { id: '20x20', label: '20x20 cm', price: 1.20 },
    { id: 'custom', label: 'Personalizado', price: 1.50 },
  ];

  const getFormatLabel = (id: string) => {
    if (id === 'custom') {
        return `Personalizado (${customWidth}x${customHeight} cm)`;
    }
    return formats.find(f => f.id === id)?.label || id;
  };

  const getFormatPrice = (id: string) => formats.find(f => f.id === id)?.price || 0;

  // Initialize crop rect when image loads or format changes
  const initCropRect = () => {
    if (!imageRef.current || !uploadedImage) return;

    const img = imageRef.current;
    let w, h;

    if (selectedFormat === 'custom') {
        // If custom, use customWidth and customHeight
        // Ensure they are valid numbers
        const cw = parseFloat(customWidth);
        const ch = parseFloat(customHeight);
        if (!cw || !ch || cw <= 0 || ch <= 0) return; // Wait for valid input
        w = cw;
        h = ch;
    } else {
        [w, h] = selectedFormat.split('x').map(Number);
    }
    
    const targetRatio = w / h;
    const imgRatio = img.width / img.height;

    let rectW, rectH;

    if (imgRatio > targetRatio) {
      rectH = img.height;
      rectW = rectH * targetRatio;
    } else {
      rectW = img.width;
      rectH = rectW / targetRatio;
    }

    const startX = (img.width - rectW) / 2;
    const startY = (img.height - rectH) / 2;

    setCropRect({ x: startX, y: startY, width: rectW, height: rectH });
  };

  useEffect(() => {
    if (uploadedImage && !isCropped && !isEditing && !isAIEditing) {
      const timer = setTimeout(initCropRect, 100);
      return () => clearTimeout(timer);
    }
  }, [uploadedImage, selectedFormat, customWidth, customHeight, isCropped, isEditing, isAIEditing]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setIsCropped(false);
        setErrors(prev => ({ ...prev, image: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- DRAGGING HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCropped) return; // Allow drag for custom format too, just not after crop applied
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropRect.x, y: e.clientY - cropRect.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    e.preventDefault();

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    const maxX = imageRef.current.width - cropRect.width;
    const maxY = imageRef.current.height - cropRect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setCropRect(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    if (!uploadedImage || !imageRef.current) return;
    
    // Ensure custom dimensions are valid if custom is selected
    if (selectedFormat === 'custom') {
         const cw = parseFloat(customWidth);
         const ch = parseFloat(customHeight);
         if (!cw || !ch) return;
    }

    const imgElement = imageRef.current;
    const img = new Image();
    img.src = uploadedImage;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scaleX = img.naturalWidth / imgElement.width;
      const scaleY = img.naturalHeight / imgElement.height;

      const sourceX = cropRect.x * scaleX;
      const sourceY = cropRect.y * scaleY;
      const sourceW = cropRect.width * scaleX;
      const sourceH = cropRect.height * scaleY;

      canvas.width = sourceW;
      canvas.height = sourceH;

      ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
      
      setUploadedImage(canvas.toDataURL());
      setIsCropped(true);
    };
  };

  // Handle saving the edited photo from PhotoEditor
  const handleSaveEdits = (newImage: string) => {
    setUploadedImage(newImage);
    setIsEditing(false);
  };

  // Handle saving from AI Editor
  const handleSaveAI = (newImage: string) => {
    setUploadedImage(newImage);
    setIsAIEditing(false);
  }

  const handleAddToCartClick = () => {
    const newErrors = {
      image: !uploadedImage,
      paper: !paperType,
      project: !projectName.trim()
    };

    setErrors(newErrors);

    if (newErrors.image || newErrors.paper || newErrors.project) {
      return;
    }
    
    // Validate custom dimensions if selected
    if (selectedFormat === 'custom' && (!customWidth || !customHeight)) {
        // Could add specific error highlighting for dimensions here
        return; 
    }
    
    onAddToCart({
      productId: product.id,
      imgSrc: uploadedImage!,
      projectName: projectName,
      format: getFormatLabel(selectedFormat),
      paperType: paperType,
      price: getFormatPrice(selectedFormat),
      quantity: 1
    });
  };

  if (isAIEditing && uploadedImage) {
    return (
      <AIEditor 
        imageSrc={uploadedImage}
        onSave={handleSaveAI}
        onCancel={() => setIsAIEditing(false)}
      />
    )
  }

  if (isEditing && uploadedImage) {
    return (
      <PhotoEditor 
        imageSrc={uploadedImage} 
        onSave={handleSaveEdits} 
        onCancel={() => setIsEditing(false)} 
        onRequestAI={() => { setIsEditing(false); setIsAIEditing(true); }}
      />
    );
  }

  return (
    <div className="mx-auto px-4 py-8 fade-in max-w-6xl">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-[#FF7F40] mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver
      </button>

      <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Personaliza tu Foto</h1>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* --- LEFT COLUMN: UPLOAD --- */}
        <div className="flex flex-col">
          <div className={`bg-white rounded-2xl shadow-sm p-6 md:p-8 h-full ${errors.image ? 'ring-2 ring-red-400' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Upload className={`w-5 h-5 ${errors.image ? 'text-red-500' : 'text-[#FF7F40]'}`} />
                <h2 className={`text-lg font-bold ${errors.image ? 'text-red-500' : 'text-gray-800'}`}>
                  {errors.image ? 'Debes subir una foto' : 'Subir Foto'}
                </h2>
              </div>
            </div>

            <div 
              className={`rounded-xl flex flex-col items-center justify-center transition-all relative select-none ${
                uploadedImage 
                  ? 'h-auto bg-transparent border-none' 
                  : `h-64 md:h-96 bg-gray-50 border-2 border-dashed p-8 hover:bg-gray-100 ${errors.image ? 'border-red-300' : 'border-gray-200'}`
              }`}
              onMouseLeave={handleMouseUp}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              {uploadedImage ? (
                <div 
                  ref={containerRef}
                  className="w-full h-full flex items-center justify-center relative select-none"
                >
                   {/* Container for Image & Overlay */}
                   <div className="relative inline-block max-w-full max-h-full">
                      <img 
                        ref={imageRef}
                        src={uploadedImage} 
                        onLoad={initCropRect}
                        alt="Preview" 
                        className="max-w-full max-h-[65vh] object-contain block pointer-events-none select-none shadow-sm rounded-sm" 
                        draggable={false}
                      />
                      
                      {/* Crop Overlay - Draggable */}
                      {!isCropped && cropRect.width > 0 && (
                        <div 
                           className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] cursor-move hover:border-orange-400 z-10 box-content"
                           onMouseDown={handleMouseDown}
                           style={{ 
                             left: cropRect.x,
                             top: cropRect.y,
                             width: cropRect.width,
                             height: cropRect.height
                           }}
                        >
                           <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-white/30 pointer-events-none">
                             <div className="border-r border-b border-white/30"></div>
                             <div className="border-r border-b border-white/30"></div>
                             <div className="border-b border-white/30"></div>
                             <div className="border-r border-b border-white/30"></div>
                             <div className="border-r border-b border-white/30"></div>
                             <div className="border-b border-white/30"></div>
                             <div className="border-r border-white/30"></div>
                             <div className="border-r border-white/30"></div>
                             <div></div>
                           </div>
                        </div>
                      )}

                       <button 
                        onClick={() => { setUploadedImage(null); setIsCropped(false); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-20 shadow-sm pointer-events-auto"
                       >
                         <div className="w-4 h-4 flex items-center justify-center text-xs">x</div>
                       </button>
                   </div>
                </div>
              ) : (
                <>
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                  <div className={`w-full bg-white border text-gray-700 py-3 px-6 rounded-lg text-center shadow-sm cursor-pointer hover:border-orange-300 transition-colors max-w-xs z-10 pointer-events-none ${errors.image ? 'border-red-400' : 'border-gray-200'}`}>
                    Elegir archivo
                  </div>
                </>
              )}
            </div>

            {uploadedImage && !isCropped && (
              <button 
                onClick={handleApplyCrop}
                className="mt-4 w-full bg-[#FF7F40] hover:bg-[#ff6a20] text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                 <Crop className="w-5 h-5" />
                 Aplicar Recorte
              </button>
            )}

            {isCropped && (
               <div className="mt-4 flex flex-col gap-3">
                   <button 
                     onClick={() => setIsCropped(false)}
                     className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                   >
                     Hacer Nuevo Recorte
                   </button>
                   <button 
                     onClick={() => setIsEditing(true)}
                     className="w-full bg-[#00A9C3] text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                   >
                     <Wand2 className="w-5 h-5" />
                     Editar Foto
                   </button>
               </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: OPTIONS --- */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Configuración de Recorte</h2>
            <div className="mb-2 font-medium text-gray-600 text-sm">Formatos</div>
            
            <div className="space-y-3">
              {formats.map((format) => (
                <div key={format.id}>
                    <label className="flex items-center cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                        <input 
                        type="radio" 
                        name="format" 
                        value={format.id}
                        checked={selectedFormat === format.id}
                        onChange={() => { setSelectedFormat(format.id); setIsCropped(false); }}
                        className="peer appearance-none w-5 h-5 border border-orange-400 rounded-full checked:bg-orange-500 checked:border-orange-500"
                        />
                        <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="text-gray-700 text-sm group-hover:text-gray-900">{format.label} - €{format.price.toFixed(2)}</span>
                    </label>
                    
                    {/* Custom Inputs Logic */}
                    {format.id === 'custom' && selectedFormat === 'custom' && (
                        <div className="mt-3 ml-8 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Ancho (cm)</label>
                                <input 
                                    type="number" 
                                    placeholder="Ej: 15"
                                    value={customWidth}
                                    onChange={(e) => { setCustomWidth(e.target.value); setIsCropped(false); }}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Largo (cm)</label>
                                <input 
                                    type="number" 
                                    placeholder="Ej: 20"
                                    value={customHeight}
                                    onChange={(e) => { setCustomHeight(e.target.value); setIsCropped(false); }}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-200"
                                />
                            </div>
                        </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          <div className={`bg-white rounded-2xl shadow-sm p-6 md:p-8 ${errors.paper || errors.project ? 'ring-2 ring-red-400' : ''}`}>
            <h2 className="text-lg font-bold text-gray-800 mb-6">Detalles del Producto</h2>
            
            <div className="mb-4">
              <div className={`font-medium text-sm mb-3 flex items-center justify-between ${errors.paper ? 'text-red-500' : 'text-gray-600'}`}>
                 Tipo de Papel {errors.paper && <span className="text-xs text-red-500 font-bold">* Requerido</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center cursor-pointer">
                  <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                    <input 
                      type="radio" 
                      name="paper" 
                      value="Mate"
                      checked={paperType === 'Mate'}
                      onChange={() => { setPaperType('Mate'); setErrors(prev => ({...prev, paper: false})); }}
                      className="peer appearance-none w-5 h-5 border border-orange-400 rounded-full checked:bg-orange-500 checked:border-orange-500"
                    />
                    <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-sm text-gray-700">Mate</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                    <input 
                      type="radio" 
                      name="paper" 
                      value="Brillante"
                      checked={paperType === 'Brillante'}
                      onChange={() => { setPaperType('Brillante'); setErrors(prev => ({...prev, paper: false})); }}
                      className="peer appearance-none w-5 h-5 border border-orange-400 rounded-full checked:bg-orange-500 checked:border-orange-500"
                    />
                    <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-sm text-gray-700">Brillante</span>
                </label>
              </div>
            </div>

            <div className="mt-6">
               <div className={`font-medium text-sm mb-2 flex items-center justify-between ${errors.project ? 'text-red-500' : 'text-gray-600'}`}>
                 Nombre del Proyecto {errors.project && <span className="text-xs text-red-500 font-bold">* Requerido</span>}
               </div>
               <input 
                type="text" 
                placeholder="Ej: Vacaciones 2024" 
                value={projectName}
                onChange={(e) => { setProjectName(e.target.value); setErrors(prev => ({...prev, project: false})); }}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-100 ${errors.project ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-400'}`}
               />
            </div>
          </div>

          <button 
            onClick={handleAddToCartClick}
            className="w-full bg-[#3AB0B6] hover:bg-[#2c9aa0] text-white font-bold py-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Agregar al Carrito
          </button>

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: AI EDITOR ---
function AIEditor({ imageSrc, onSave, onCancel }: { imageSrc: string, onSave: (src: string) => void, onCancel: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text?: string, image?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageSrc);
  const [history, setHistory] = useState<string[]>([imageSrc]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare image data (strip data:image/png;base64, prefix)
      const base64Data = currentImage.split(',')[1];
      const mimeType = currentImage.split(';')[0].split(':')[1] || 'image/png';

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: `Edit this image based on the following instruction: ${userMessage}. Return only the edited image.`
            }
          ]
        }
      });

      let newImageSrc = null;
      // Extract image from response
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
             newImageSrc = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
             break;
          }
        }
      }

      if (newImageSrc) {
        setCurrentImage(newImageSrc);
        setHistory(prev => [...prev, newImageSrc!]);
        // Updated: Do NOT include image in message, text only
        setMessages(prev => [...prev, { role: 'model', text: "¡He actualizado la imagen según tus instrucciones!" }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "Lo siento, no pude generar la imagen. Intenta con otra instrucción." }]);
      }

    } catch (error) {
      console.error("Error generating AI image:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Ocurrió un error al procesar tu solicitud." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-[100] flex flex-col">
       {/* Header */}
       <header className="bg-white border-b border-gray-200 flex items-center justify-between shadow-sm flex-shrink-0 px-6 py-4">
          <div className="flex items-center gap-2">
             <div className="rounded-lg text-white bg-[#FF7F40] p-2">
                <Sparkles className="w-5 h-5" />
             </div>
             <h1 className="font-bold text-gray-800 text-xl">Editor con IA</h1>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 font-medium transition-colors px-4 py-2"
             >
               Cancelar
             </button>
             <button 
                onClick={() => onSave(currentImage)}
                className="bg-[#00A9C3] hover:bg-[#008e9b] text-white font-bold rounded-full shadow-md transition-colors flex items-center gap-2 px-6 py-2"
             >
               <Save className="w-4 h-4" />
               <span className="">Guardar y Usar</span>
               <span className="hidden">Guardar</span>
             </button>
          </div>
       </header>

       {/* Main Content: Vertical Layout */}
       <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top: Image View & History (Flex-1 to take available space) */}
          <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center relative overflow-hidden p-2 md:p-8">
             
             {/* Main Image Container */}
             <div className="flex-1 flex items-center justify-center w-full min-h-0 mb-20">
               <div className="bg-white shadow-lg rounded-xl overflow-hidden w-full h-full border border-gray-200 relative flex items-center justify-center">
                  <img 
                    src={currentImage} 
                    alt="Current AI Edit" 
                    className="max-w-full max-h-full object-contain"
                  />
               </div>
             </div>

             {isLoading && (
               <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center gap-4">
                     <Loader2 className="w-10 h-10 text-[#FF7F40] animate-spin" />
                     <p className="font-bold text-gray-700">La IA está trabajando...</p>
                  </div>
               </div>
             )}

             {/* History Strip */}
             <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-20">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                   <History className="w-3 h-3" />
                   Historial
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                   {history.map((histImg, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentImage(histImg)}
                        className={`relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${currentImage === histImg ? 'border-[#FF7F40] shadow-md scale-105' : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'}`}
                      >
                         <img src={histImg} className="w-full h-full object-cover" alt={`Version ${idx}`} />
                         {idx === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">Original</div>
                         )}
                         {idx === history.length - 1 && history.length > 1 && (
                            <div className="absolute top-0 right-0 p-0.5 bg-[#00A9C3] rounded-bl-md">
                               <Clock className="w-2 h-2 text-white" />
                            </div>
                         )}
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Bottom: Chat Interface (Fixed Height) */}
          <div className="bg-white border-t border-gray-200 flex flex-col shadow-xl z-20 flex-shrink-0 w-full h-[300px] md:h-[350px]">
             
             {/* Chat History */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-[#00A9C3] flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                      <Bot className="w-4 h-4" />
                   </div>
                   <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-700">
                      Hola, soy tu asistente creativo. Dime qué quieres cambiar de la foto (ej: "Ponle un sombrero", "Cambia el fondo a una playa").
                   </div>
                </div>

                {messages.map((msg, idx) => (
                   <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm ${msg.role === 'user' ? 'bg-gray-700' : 'bg-[#00A9C3]'}`}>
                         {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-2xl shadow-sm border text-sm max-w-[80%] ${
                         msg.role === 'user' 
                           ? 'bg-blue-50 border-blue-100 text-gray-800 rounded-tr-none' 
                           : 'bg-white border-gray-100 text-gray-700 rounded-tl-none'
                      }`}>
                         {msg.text && <p>{msg.text}</p>}
                         {/* Removed Image rendering in chat bubble */}
                      </div>
                   </div>
                ))}
                <div ref={messagesEndRef} />
             </div>

             {/* Input Area */}
             <div className="p-4 bg-white border-t border-gray-200">
                <div className="relative">
                   <input 
                     type="text" 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder="Escribe tu instrucción..."
                     className="w-full bg-gray-100 border-0 rounded-full py-3 pl-4 pr-12 focus:ring-2 focus:ring-[#00A9C3] focus:bg-white transition-all text-sm"
                     disabled={isLoading}
                   />
                   <button 
                     onClick={handleSend}
                     disabled={!input.trim() || isLoading}
                     className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-[#00A9C3] text-white rounded-full hover:bg-[#008e9b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                     <Send className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>

       </div>
    </div>
  );
}

// --- SUB-COMPONENT: PHOTO EDITOR ---
function PhotoEditor({ imageSrc, onSave, onCancel, onRequestAI }: { imageSrc: string, onSave: (src: string) => void, onCancel: () => void, onRequestAI: () => void }) {
  const [settings, setSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateSetting = (key: string, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getFilterString = () => {
    return `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) sepia(${settings.sepia}%) grayscale(${settings.grayscale}%) hue-rotate(${settings.hueRotate}deg)`;
  };

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (!ctx) return;
      
      ctx.filter = getFilterString();
      ctx.drawImage(img, 0, 0);
      onSave(canvas.toDataURL());
    };
  };

  return (
    <div className="mx-auto px-4 py-8 fade-in max-w-6xl">
       <h1 className="font-bold text-center text-[#00A9C3] text-3xl mb-10">Editar Foto</h1>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Preview */}
          <div className="flex flex-col gap-4">
             <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4 text-[#FF7F40] font-bold">
                   <Sparkles className="w-5 h-5" />
                   <h3>Vista Previa</h3>
                </div>
                
                <div className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center aspect-[4/5]">
                   <img 
                    src={imageSrc} 
                    alt="Editing" 
                    className="max-w-full max-h-full object-contain transition-all duration-200"
                    style={{ 
                      filter: getFilterString()
                    }}
                   />
                </div>
             </div>

             <div className="flex gap-4">
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-[#FF7F40] hover:bg-[#ff6a20] text-white font-bold py-4 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                   <Save className="w-5 h-5" />
                   Guardar Cambios
                </button>
                <button 
                   onClick={() => {
                     setSettings({ brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, hueRotate: 0 });
                   }}
                   className="w-16 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800"
                >
                   <RotateCcw className="w-5 h-5" />
                </button>
             </div>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-col gap-6">
             {/* AI Edit Button (Replaces Filters) */}
             <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">Edición Inteligente</h3>
                <button 
                  onClick={onRequestAI}
                  className="w-full bg-[#00A9C3] hover:bg-[#008e9b] text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
                >
                   <Sparkles className="w-6 h-6 text-white group-hover:animate-pulse" />
                   <span>Editar con IA</span>
                </button>
             </div>

             {/* Sliders */}
             <div className="bg-white rounded-2xl shadow-sm space-y-8 p-6">
                {/* Brightness */}
                <CustomSlider 
                  label="Brillo" 
                  value={settings.brightness} 
                  min={0} 
                  max={200} 
                  unit="%" 
                  onChange={(v) => updateSetting('brightness', v)} 
                />
                
                {/* Contrast */}
                <CustomSlider 
                  label="Contraste" 
                  value={settings.contrast} 
                  min={0} 
                  max={200} 
                  unit="%" 
                  onChange={(v) => updateSetting('contrast', v)} 
                />

                {/* Saturation */}
                <CustomSlider 
                  label="Saturación" 
                  value={settings.saturation} 
                  min={0} 
                  max={200} 
                  unit="%" 
                  onChange={(v) => updateSetting('saturation', v)} 
                />
             </div>
          </div>
       </div>
    </div>
  );
}

function CustomSlider({ label, value, min, max, unit, onChange, step = 1 }: { label: string, value: number, min: number, max: number, unit: string, onChange: (val: number) => void, step?: number }) {
  // Calculate percentage for gradient
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="font-bold text-gray-700 text-sm">{label}: {value}{unit}</label>
      </div>
      <div className="relative w-full h-2 rounded-full bg-gray-200">
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step}
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
        />
        {/* Custom Track */}
        <div 
          className="absolute top-0 left-0 h-full rounded-full pointer-events-none z-10"
          style={{ 
             width: '100%', 
             background: '#FF7F40'
          }}
        ></div>
        {/* Custom Thumb (Visual Only - follows percentage) */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-[#FF7F40] rounded-full shadow-md z-10 pointer-events-none transition-transform"
          style={{ left: `calc(${percentage}% - 10px)` }}
        ></div>
      </div>
    </div>
  );
}

// --- VIEW COMPONENT: LANDING PAGE ---
function LandingPage({ onProductClick }: { onProductClick: (p: Product) => void }) {
  return (
    <>
      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-r from-cyan-50 to-orange-50 flex items-center justify-center py-20 min-h-[600px] px-4">
        <div className="bg-white rounded-3xl shadow-xl text-center w-full z-10 transform hover:scale-[1.01] transition-transform duration-500 border border-gray-50 p-10 md:p-16 max-w-2xl">
          
          <h1 className="font-bold mb-2 tracking-tight text-5xl md:text-6xl">
            <span className="text-[#FF7F40]">Arte</span>
            <span className="text-[#00A9C3]">IDEAS</span>
          </h1>
          
          <h2 className="text-gray-600 tracking-widest text-sm font-semibold mb-8 uppercase">
            DISEÑO CREATIVO
          </h2>

          <div className="flex flex-col gap-4">
            <button className="bg-[#FF7F40] text-white font-medium py-3 px-8 rounded-full hover:bg-[#ff6a20] transition-colors shadow-sm">
              Explorar nuestros cuadros/marcos
            </button>
            <button className="bg-white text-[#FF7F40] border border-[#FF7F40] font-medium py-3 px-8 rounded-full hover:bg-orange-50 transition-colors">
              Ver servicios
            </button>
          </div>

          <p className="mt-8 text-xs text-gray-400 max-w-md mx-auto">
            Imprime todas tus fotos favoritas con entrega en tienda gratis en 48 horas hábiles
          </p>
        </div>
      </section>

      {/* --- PRODUCTS SECTION --- */}
      <section className="py-20 px-4 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">
              <span className="text-[#FF7F40]">¡Crea Regalos </span>
              <span className="text-[#00A9C3]">Memorables!</span>
            </h2>
            <p className="text-gray-500">
              Productos personalizados que convierten tus momentos en arte
            </p>
          </div>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                onClick={() => onProductClick(product)}
              />
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="bg-white text-[#FF7F40] border border-[#FF7F40] font-medium py-3 px-10 rounded-full hover:bg-orange-50 transition-colors">
              Ver todos los productos
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

// --- VIEW COMPONENT: PRODUCT DETAIL ---
function ProductDetailView({ product, onBack, onCustomize }: { product: Product; onBack: () => void, onCustomize: () => void }) {
  const thumbnails = product.thumbnails || [product.imgSrc, product.imgSrc];

  return (
    <div className="mx-auto px-4 md:px-12 py-8 fade-in bg-white min-h-[80vh] max-w-7xl">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-[#FF7F40] mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver a productos
      </button>

      <div className="grid gap-12 lg:gap-20 grid-cols-1 md:grid-cols-2">
        
        {/* LEFT COLUMN: IMAGES */}
        <div className="flex flex-col gap-6">
          {/* Main Image Container */}
          <div className={`aspect-square w-full ${product.bgColor} rounded-3xl p-6 md:p-8 flex items-center justify-center`}>
             <div className="relative w-full h-full bg-white shadow-2xl p-3 rotate-0 transition-all duration-500">
                <div className="w-full h-full bg-gray-100 overflow-hidden">
                  <img 
                    src={product.imgSrc} 
                    alt={product.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
             </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4">
             {thumbnails.map((thumb, idx) => (
               <div 
                key={idx} 
                className={`w-24 h-24 ${product.bgColor} rounded-xl p-2 cursor-pointer border-2 ${idx === 0 ? 'border-[#FF7F40]' : 'border-transparent hover:border-gray-200'}`}
               >
                 <div className="w-full h-full bg-white shadow-sm p-1">
                   <img src={thumb} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* RIGHT COLUMN: INFO */}
        <div className="flex flex-col justify-center">
          
          {product.badge && (
            <span className="bg-[#EF4444] text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">
              {product.badge}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {product.title}
          </h1>

          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-bold text-[#FF7F40]">{product.price}</span>
            {product.oldPrice && (
              <span className="text-xl text-gray-400 line-through decoration-1">{product.oldPrice}</span>
            )}
          </div>

          {/* Promotions */}
          {product.promotions && (
            <div className="space-y-3 mb-10">
              <h4 className="text-[#FF7F40] font-bold mb-2">¡Promociones especiales!</h4>
              {product.promotions.map((promo, idx) => (
                <div key={idx} className="flex items-center text-gray-700 text-sm">
                  <Gift className="w-5 h-5 text-[#FF7F40] mr-3" />
                  {promo}
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={onCustomize}
            className="bg-[#E48B57] text-white text-lg font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-[#d67a46] transition-all flex items-center justify-center gap-3 w-full md:w-auto"
          >
             <ShoppingBag className="w-6 h-6" />
             Empezar a Crear Online
          </button>
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENT: PRODUCT CARD ---
interface ProductCardProps {
  product: Product;
  onClick: () => void;
  key?: React.Key;
}

function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col h-full bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group"
    >
      {/* Image Area */}
      <div className={`h-80 p-5 ${product.bgColor} flex items-center justify-center`}>
        {/* Frame Effect Container */}
        <div className="relative w-full h-full shadow-lg rotate-1 group-hover:rotate-0 transition-transform duration-300 bg-white shadow-gray-400/30 p-2">
          <div className="w-full h-full bg-gray-100 overflow-hidden relative">
             <img 
              src={product.imgSrc} 
              alt={product.title} 
              loading="eager"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover block"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 text-center p-6">
        <h3 className="font-bold text-gray-900 uppercase mb-3 leading-tight group-hover:text-[#FF7F40] transition-colors text-sm">
          {product.title}
        </h3>
        
        <div className="flex items-end justify-center gap-2 mt-auto">
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through mb-1">
              desde {product.oldPrice}
            </span>
          )}
          <span className="font-bold text-[#FF7F40] text-xl">
            {product.price}
          </span>
        </div>
      </div>
    </div>
  );
}
