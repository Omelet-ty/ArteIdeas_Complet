// --- SISTEMA DE ARRANQUE ---
console.log("Iniciando script de ArteIdeas...");

(function() {
    function init() {
        if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
            console.warn("React no está listo, reintentando...");
            setTimeout(init, 100);
            return;
        }
        try { 
            console.log("React listo, montando App...");
            startApp(); 
        } catch (e) { 
            console.error(e);
            document.getElementById('root').innerHTML = '<div style="color:red; padding:20px">Error JS: ' + e.message + '</div>'; 
        }
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') init();
    else window.addEventListener('DOMContentLoaded', init);
})();

function startApp() {
    const { useState, useEffect, useRef } = React;
    const { createRoot } = ReactDOM;

    // --- ICONOS SVG ---
    const Icons = {
        ArrowLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
        Cart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
        Loader: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF7F40" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>,
        Gift: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>,
        ShoppingBag: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
        Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
        Crop: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>,
        Trash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
        Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
        Minus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>,
        Wand2: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.5 1.5 0 0 0-2.12 0L2.36 18.36a1.5 1.5 0 0 0 0 2.12l1.28 1.28a1.5 1.5 0 0 0 2.12 0L21.64 5.76a1.5 1.5 0 0 0 0-2.12z"/><path d="m14 7 3 3"/><path d="m5 6v4"/><path d="m19 14v4"/><path d="M10 2v2"/><path d="m7 8H3"/><path d="m21 16h-4"/><path d="M11 3H9"/></svg>,
        Sparkles: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
        Save: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
        RotateCcw: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
        History: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 3"/></svg>,
        Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
        Bot: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>,
        User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
        Send: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
    };

    // --- DATOS ---
    const PRODUCTS = [
        { 
            id: 1, title: "MARCO BÁSICO PERSONALIZADO CON FOTO", description: "Resistente, bonito, colorido y muy personal.", 
            price: "11.96€", oldPrice: "10.00€", bgColor: "bg-pink", imgSrc: "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?q=80&w=400" 
        },
        { 
            id: 2, title: "Marcos Personalizados con Fotos - Collage", description: "Crea un hermoso collage con tus mejores momentos", 
            price: "39.99€", oldPrice: "49.99€", badge: "NUEVO", bgColor: "bg-pink", 
            imgSrc: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=400",
            thumbnails: ["https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=150","https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=150"],
            promotions: ["Compra 3+ unidades: 10% descuento", "Compra 5+ unidades: 15% descuento", "Compra 10+ unidades: 25% descuento"]
        },
        { 
            id: 3, title: "MARCO PERSONALIZADO CON FOTOS - ELEGANTE", description: "Marcos de alta calidad con diseño elegante.", 
            price: "24.95€", bgColor: "bg-rose", imgSrc: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400" 
        },
        { 
            id: 4, title: "IMPRESIONES DE FOTOS - REVELADO", description: "Impresión profesional de fotos en varios tamaños.", 
            price: "19.96€", oldPrice: "9.70€", bgColor: "bg-cyan", imgSrc: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=400" 
        }
    ];

    function App() {
        const [view, setView] = useState('home');
        const [selectedProduct, setSelectedProduct] = useState(null);
        const [cart, setCart] = useState([]);
        const [isProcessing, setIsProcessing] = useState(false);

        const addToCart = (item) => {
            setCart([...cart, { ...item, id: Date.now() }]);
            setView('cart');
        };

        const updateQty = (id, delta) => {
            setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item));
        };

        const removeItem = (id) => setCart(prev => prev.filter(item => item.id !== id));

        // --- CORRECCIÓN AQUÍ: Pasamos el nonce en la URL ---
        const handlePayment = async (userData) => {
            setIsProcessing(true);
            try {
                // AGREGADO: &nonce=${ArteData.nonce} en la URL
                const response = await fetch(`${ArteData.ajax_url}?action=cristopher_crear_preferencia&nonce=${ArteData.nonce}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: cart, deliveryType: userData.deliveryType, userData })
                });
                const result = await response.json();
                
                if (result.success) {
                    window.location.href = result.data.init_point;
                } else {
                    alert('Error MP: ' + (result.data || 'Revise consola'));
                    console.log(result);
                    setIsProcessing(false);
                }
            } catch (e) {
                console.error(e);
                alert("Error de red: " + e.message);
                setIsProcessing(false);
            }
        };

        return (
            <div className="arte-ideas-root">
                {isProcessing && (
                    <div style={{position:'fixed', inset:0, background:'rgba(255,255,255,0.9)', zIndex:999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <div style={{width:'50px', height:'50px', marginBottom:'20px'}}><Icons.Loader /></div>
                        <h2 style={{color:'#FF7F40', fontSize:'1.5rem'}}>Procesando pago con Mercado Pago...</h2>
                        <p style={{color:'#666'}}>Por favor espera un momento.</p>
                    </div>
                )}
                {view === 'home' && <LandingPage onSelect={(p) => { setSelectedProduct(p); setView('product'); window.scrollTo(0,0); }} />}
                {view === 'product' && selectedProduct && <ProductDetail product={selectedProduct} onBack={() => setView('home')} onCustomize={() => setView('customizer')} />}
                {view === 'customizer' && selectedProduct && <Customizer product={selectedProduct} onBack={() => setView('product')} onAdd={addToCart} />}
                {view === 'cart' && <CartView cart={cart} onBack={() => setView('home')} onUpdateQty={updateQty} onRemove={removeItem} onCheckout={() => setView('checkout')} />}
                {view === 'checkout' && <CheckoutView cart={cart} onBack={() => setView('cart')} onPay={handlePayment} />}
            </div>
        );
    }

    // --- VISTAS ---
    function LandingPage({ onSelect }) {
        return (
            <div className="fade-in">
                <div className="main-title-container">
                    <h1 className="main-title"><span style={{color:'#FF7F40'}}>¡Crea Regalos </span><span style={{color:'#00A9C3'}}>Memorables!</span></h1>
                    <p className="subtitle">Productos personalizados que convierten tus momentos en arte</p>
                </div>
                <div className="container">
                    <div className="grid-products">
                        {PRODUCTS.map(p => (
                            <div key={p.id} className="product-card" onClick={() => onSelect(p)}>
                                <div className={`card-image-bg ${p.bgColor}`}>
                                    <div className="card-image-wrapper"><img src={p.imgSrc} className="card-image" /></div>
                                </div>
                                <div className="card-info">
                                    <div><h3 className="card-title">{p.title}</h3><p className="card-desc">{p.description}</p></div>
                                    <div className="price-container">{p.oldPrice && <span className="old-price">desde {p.oldPrice}</span>}<span className="current-price">{p.price}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="footer-action"><button className="btn-outline-orange">Ver todos los productos</button></div>
                </div>
            </div>
        );
    }

    function ProductDetail({ product, onBack, onCustomize }) {
        const [activeThumb, setActiveThumb] = useState(0);
        const images = product.thumbnails || [product.imgSrc, product.imgSrc];

        return (
            <div className="detail-view">
                <button onClick={onBack} className="btn-back"><Icons.ArrowLeft /> Volver a productos</button>
                <div className="detail-grid">
                    <div className="detail-gallery">
                        <div className={`main-image-container ${product.bgColor}`}>
                            <div style={{position:'relative', width:'100%', height:'100%', padding:'10px', background:'white', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', transform:'rotate(-1deg)'}}>
                                <img src={images[activeThumb]} style={{width:'100%', height:'100%', objectFit:'cover', border:'4px solid #333'}} />
                            </div>
                        </div>
                        <div className="thumbnail-row">
                            {images.map((img, idx) => (
                                <div key={idx} className={`thumb-item ${activeThumb === idx ? 'active' : ''}`} onClick={() => setActiveThumb(idx)}><img src={img} /></div>
                            ))}
                        </div>
                    </div>
                    <div className="detail-info">
                        {product.badge && <span className="badge-new">{product.badge}</span>}
                        <h1 className="detail-title">{product.title}</h1>
                        <p className="detail-desc">{product.description}</p>
                        <div className="detail-price-row"><span className="detail-price">{product.price}</span>{product.oldPrice && <span className="detail-old-price">{product.oldPrice}</span>}</div>
                        {product.promotions && (
                            <div style={{marginBottom:'2.5rem'}}><h4 className="promo-title">¡Promociones especiales!</h4><ul className="promo-list">{product.promotions.map((promo, idx) => (<li key={idx} className="promo-item"><span style={{color:'#FF7F40'}}><Icons.Gift /></span> {promo}</li>))}</ul></div>
                        )}
                        <button onClick={onCustomize} className="btn-create-gradient"><Icons.ShoppingBag /> Empezar a Crear Online</button>
                    </div>
                </div>
            </div>
        );
    }

    function Customizer({ product, onBack, onAdd }) {
        const [imgSrc, setImgSrc] = useState(null);
        const [format, setFormat] = useState('10x15');
        const [paper, setPaper] = useState('Brillante');
        const [projectName, setProjectName] = useState('');
        const [customWidth, setCustomWidth] = useState('');
        const [customHeight, setCustomHeight] = useState('');
        const [cropStyle, setCropStyle] = useState({}); 
        const [isDragging, setIsDragging] = useState(false);
        const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
        const [isCropped, setIsCropped] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [isAIEditing, setIsAIEditing] = useState(false);
        const [imgLoaded, setImgLoaded] = useState(false);
        const imgRef = useRef(null);
        const canvasRef = useRef(null);

        const formats = [
            { id: '9x13', label: '9x13 cm - €0.70', ratio: 9/13 },
            { id: '10x15', label: '10x15 cm - €0.75', ratio: 10/15 },
            { id: '11x15', label: '11x15 cm - €0.80', ratio: 11/15 },
            { id: '13x13', label: '13x13 cm - €0.85', ratio: 1 },
            { id: '13x18', label: '13x18 cm - €0.90', ratio: 13/18 },
            { id: '15x15', label: '15x15 cm - €0.95', ratio: 1 },
            { id: '15x20', label: '15x20 cm - €1.00', ratio: 15/20 },
            { id: '20x20', label: '20x20 cm - €1.20', ratio: 1 },
            { id: 'custom', label: 'Personalizado - €1.50', ratio: null },
        ];

        const getFormatLabel = (formatId) => {
            if (formatId === 'custom') {
                return `Personalizado (${customWidth}x${customHeight} cm)`;
            }
            return formats.find(f => f.id === formatId)?.label || formatId;
        };

        const handleFile = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setImgSrc(ev.target.result);
                    setIsCropped(false);
                    setCropStyle({});
                    setImgLoaded(false);
                };
                reader.readAsDataURL(file);
            }
        };

        useEffect(() => {
            if (!imgSrc || !imgRef.current) return;
            const selectedFormat = formats.find(f => f.id === format);
            const img = imgRef.current;
            
            let targetRatio;
            
            // Si es formato personalizado, usar customWidth y customHeight
            if (format === 'custom') {
                const cw = parseFloat(customWidth);
                const ch = parseFloat(customHeight);
                if (!cw || !ch || cw <= 0 || ch <= 0) {
                    // Si no hay dimensiones válidas, no mostrar recorte
                    return;
                }
                targetRatio = cw / ch;
            } else if (!selectedFormat || !selectedFormat.ratio) {
                return;
            } else {
                targetRatio = selectedFormat.ratio;
            }
            
            const imgRatio = img.naturalWidth / img.naturalHeight;
            let cropW, cropH, cropTop, cropLeft;

            if (imgRatio > targetRatio) {
                cropH = img.naturalHeight; 
                cropW = cropH * targetRatio; 
                cropTop = 0; 
                cropLeft = (img.naturalWidth - cropW) / 2;
            } else {
                cropW = img.naturalWidth; 
                cropH = cropW / targetRatio; 
                cropLeft = 0; 
                cropTop = (img.naturalHeight - cropH) / 2;
            }
            setCropStyle({ top: cropTop, left: cropLeft, width: cropW, height: cropH });
        }, [imgSrc, format, customWidth, customHeight]);

        const handleMouseDown = (e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            if (!cropStyle.width || typeof cropStyle.width === 'string') return;
            setIsDragging(true); 
            setDragStart({ x: e.clientX, y: e.clientY }); 
        };

        useEffect(() => {
            if (!isDragging) return;
            
            const handleMove = (e) => {
                if (!imgRef.current || !cropStyle.width || typeof cropStyle.width === 'string') return;
                e.preventDefault();
                const img = imgRef.current;
                const scaleX = img.width / img.naturalWidth;
                const scaleY = img.height / img.naturalHeight;
                const deltaX = (e.clientX - dragStart.x) / scaleX;
                const deltaY = (e.clientY - dragStart.y) / scaleY;
                let newLeft = Math.max(0, Math.min(cropStyle.left + deltaX, img.naturalWidth - cropStyle.width));
                let newTop = Math.max(0, Math.min(cropStyle.top + deltaY, img.naturalHeight - cropStyle.height));
                setCropStyle(prev => ({ ...prev, left: newLeft, top: newTop }));
                setDragStart({ x: e.clientX, y: e.clientY });
            };
            
            const handleUp = () => setIsDragging(false);
            
            document.addEventListener('mousemove', handleMove); 
            document.addEventListener('mouseup', handleUp);
            
            return () => { 
                document.removeEventListener('mousemove', handleMove); 
                document.removeEventListener('mouseup', handleUp); 
            };
        }, [isDragging, cropStyle.width, cropStyle.left, cropStyle.top, cropStyle.height, dragStart.x, dragStart.y]);

        const handleApplyCrop = () => {
            if (!imgSrc || !imgRef.current || !canvasRef.current) return;
            if (!cropStyle.width || typeof cropStyle.width === 'string') return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = imgRef.current;
            canvas.width = cropStyle.width;
            canvas.height = cropStyle.height;
            ctx.drawImage(img, cropStyle.left, cropStyle.top, cropStyle.width, cropStyle.height, 0, 0, canvas.width, canvas.height);
            setImgSrc(canvas.toDataURL('image/jpeg', 0.95));
            setIsCropped(true);
        };

        const handleSaveEdits = (newImage) => {
            setImgSrc(newImage);
            setIsEditing(false);
        };

        const handleSaveAI = (newImage) => {
            setImgSrc(newImage);
            setIsAIEditing(false);
        };

        const handleAddToCart = () => {
            if (!imgSrc) return alert("Por favor sube una foto primero.");
            if (format === 'custom' && (!customWidth || !customHeight)) {
                return alert("Por favor ingresa las dimensiones personalizadas (ancho y largo).");
            }
            const formatLabel = getFormatLabel(format);
            onAdd({ ...product, imgSrc, quantity: 1, format: formatLabel, paper, projectName });
        };

        const getVisualCropStyle = () => {
            if (!imgRef.current || !cropStyle.width || typeof cropStyle.width === 'string') return {};
            const img = imgRef.current;
            
            // Esperar a que la imagen tenga dimensiones naturales
            if (!img.naturalWidth || !img.naturalHeight) return {};
            
            // Calcular la escala entre la imagen renderizada y la imagen natural
            const scaleX = img.width / img.naturalWidth;
            const scaleY = img.height / img.naturalHeight;
            
            // Calcular el offset de la imagen dentro del contenedor (si está centrada con flex)
            const container = img.parentElement;
            let offsetX = 0;
            let offsetY = 0;
            
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const imgRect = img.getBoundingClientRect();
                offsetX = imgRect.left - containerRect.left;
                offsetY = imgRect.top - containerRect.top;
            }
            
            return { 
                top: (cropStyle.top * scaleY) + offsetY, 
                left: (cropStyle.left * scaleX) + offsetX, 
                width: cropStyle.width * scaleX, 
                height: cropStyle.height * scaleY,
                cursor: 'move'
            };
        };

        if (isAIEditing && imgSrc) {
            return <AIEditor imageSrc={imgSrc} onSave={handleSaveAI} onCancel={() => setIsAIEditing(false)} />;
        }

        if (isEditing && imgSrc) {
            return <PhotoEditor imageSrc={imgSrc} onSave={handleSaveEdits} onCancel={() => setIsEditing(false)} onRequestAI={() => { setIsEditing(false); setIsAIEditing(true); }} />;
        }

        return (
            <div className="fade-in" style={{ padding: '2rem 1rem' }}>
                <button onClick={onBack} className="btn-back"><Icons.ArrowLeft /> Volver</button>
                <h1 className="customizer-title">Personaliza tu Foto</h1>
                <div className="customizer-grid">
                    <div className="left-panel">
                        <div className="custom-card">
                            <div className="card-heading"><span style={{color: '#FF7F40'}}><Icons.Upload /></span> Subir Foto</div>
                            <div className="upload-btn-wrapper">
                                <button className="btn-upload-file">Elegir archivo</button>
                                <input type="file" onChange={handleFile} accept="image/*" />
                            </div>
                            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                            <div className="crop-container" style={{position: 'relative'}}>
                                {imgSrc ? (
                                    <>
                                        <button 
                                            onClick={() => { setImgSrc(null); setIsCropped(false); setCropStyle({}); }}
                                            style={{position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}
                                            title="Eliminar imagen"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                        <img 
                                            ref={imgRef} 
                                            src={imgSrc} 
                                            className="source-image" 
                                            onLoad={() => {
                                                setImgLoaded(true);
                                            }} 
                                        />
                                        {!isCropped && imgLoaded && cropStyle.width && typeof cropStyle.width === 'number' && (
                                            <div className="crop-overlay-box" style={getVisualCropStyle()} onMouseDown={handleMouseDown}></div>
                                        )}
                                    </>
                                ) : <div style={{color:'#888', textAlign:'center'}}><p>Sube una foto</p></div>}
                            </div>
                            {!isCropped && imgSrc && (
                                <button className="btn-apply-crop" onClick={handleApplyCrop}>
                                    <Icons.Crop /> Aplicar Recorte
                                </button>
                            )}
                            {isCropped && (
                                <div style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                                    <button 
                                        onClick={() => setIsCropped(false)}
                                        style={{width: '100%', background: 'white', border: '1px solid #e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}
                                    >
                                        Hacer Nuevo Recorte
                                    </button>
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        style={{width: '100%', background: '#00A9C3', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
                                    >
                                        <Icons.Wand2 /> Editar Foto
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="right-panel">
                        <div className="custom-card">
                            <div className="card-heading">Configuración</div>
                            <div className="config-section-title">Formatos</div>
                            <div className="radio-list">
                                {formats.map(f => (
                                    <label key={f.id} className="radio-item"><input type="radio" name="format" checked={format === f.id} onChange={() => setFormat(f.id)} /> {f.label}</label>
                                ))}
                            </div>
                            {format === 'custom' && (
                                <div style={{marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                    <div>
                                        <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '0.25rem'}}>Ancho (cm)</label>
                                        <input 
                                            type="number" 
                                            placeholder="Ej: 15"
                                            value={customWidth}
                                            onChange={(e) => setCustomWidth(e.target.value)}
                                            style={{width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none'}}
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '0.25rem'}}>Largo (cm)</label>
                                        <input 
                                            type="number" 
                                            placeholder="Ej: 20"
                                            value={customHeight}
                                            onChange={(e) => setCustomHeight(e.target.value)}
                                            style={{width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none'}}
                                            min="1"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="custom-card">
                            <div className="card-heading">Detalles</div>
                            <div className="config-section-title">Papel</div>
                            <div className="radio-list" style={{marginBottom: '1.5rem'}}>
                                <label className="radio-item"><input type="radio" name="paper" checked={paper === 'Mate'} onChange={() => setPaper('Mate')} /> Mate</label>
                                <label className="radio-item"><input type="radio" name="paper" checked={paper === 'Brillante'} onChange={() => setPaper('Brillante')} /> Brillante</label>
                            </div>
                            <div className="config-section-title">Proyecto</div>
                            <input type="text" className="input-project" placeholder="Ej: Vacaciones 2024" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                        </div>
                        <button onClick={handleAddToCart} className="btn-add-cart-cyan"><Icons.Cart /> Agregar al Carrito</button>
                    </div>
                </div>
            </div>
        );
    }

    function CartView({ cart, onUpdateQty, onRemove, onBack, onCheckout }) {
        const subtotal = cart.reduce((acc, item) => {
            const priceNum = parseFloat(item.price.toString().replace(/[^0-9.]/g, '')); 
            return acc + (priceNum * (item.quantity || 1));
        }, 0);
        const shipping = 3.99;
        const total = subtotal + shipping;
        const currency = "€";

        return (
            <div className="cart-view-container fade-in">
                <h1 className="cart-page-title">Carrito de Compras</h1>
                {cart.length === 0 ? (
                    <div style={{textAlign:'center', padding:'4rem', background:'white', borderRadius:'12px'}}>
                        <p style={{marginBottom:'20px', color:'#666'}}>Tu carrito está vacío.</p>
                        <button onClick={onBack} className="btn-continue-outline" style={{maxWidth:'200px'}}>Volver a la tienda</button>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items-list">
                            {cart.map(item => {
                                const itemPrice = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
                                return (
                                    <div key={item.id} className="cart-item-card">
                                        <img src={item.imgSrc} className="cart-item-img" alt="Producto" />
                                        <div className="cart-item-details">
                                            <div className="cart-item-title">{item.projectName || item.title}</div>
                                            <div className="cart-item-meta">Formato: {item.format ? (typeof item.format === 'string' ? item.format : 'Estándar') : 'Estándar'}</div>
                                            <div className="cart-item-meta">Tipo de Papel: {item.paper || 'Estándar'}</div>
                                            <div className="qty-wrapper">
                                                <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}><Icons.Minus/></button>
                                                <span className="qty-val">{item.quantity || 1}</span>
                                                <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}><Icons.Plus/></button>
                                            </div>
                                        </div>
                                        <div className="cart-item-price">{currency}{itemPrice.toFixed(2)}</div>
                                        <button className="cart-item-delete" onClick={() => onRemove(item.id)}><Icons.Trash /></button>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="summary-card">
                            <h2 className="summary-title">Resumen del Pedido</h2>
                            <div className="summary-row"><span>Productos ({cart.length})</span><span>{currency}{subtotal.toFixed(2)}</span></div>
                            <div className="summary-row"><span>Envío</span><span>{currency}{shipping.toFixed(2)}</span></div>
                            <div className="summary-divider"></div>
                            <div className="summary-total-row"><span>Total</span><span className="summary-total-price">{currency}{total.toFixed(2)}</span></div>
                            <button onClick={onCheckout} className="btn-checkout-gradient">Proceder al Pago</button>
                            <button onClick={onBack} className="btn-continue-outline">Seguir Comprando</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    function CheckoutView({ cart, onBack, onPay }) {
        const [formData, setFormData] = useState({ name: '', phone: '', dni: '', email: '', address: '', city: '', zip: '', notes: '' });
        const [deliveryType, setDeliveryType] = useState('delivery'); 
        
        const subtotal = cart.reduce((acc, item) => {
            const priceNum = parseFloat(item.price.toString().replace(/[^0-9.]/g, '')); 
            return acc + (priceNum * (item.quantity || 1));
        }, 0);
        const shippingCost = deliveryType === 'delivery' ? 5.00 : 0.00;
        const total = subtotal + shippingCost;
        const currency = "€";

        const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
        const handleSubmit = () => {
            if (!formData.name || !formData.phone || !formData.dni) return alert("Por favor completa los campos obligatorios (*)");
            if (deliveryType === 'delivery' && (!formData.address || !formData.city)) return alert("Por favor completa la dirección de envío");
            onPay({ ...formData, deliveryType });
        };

        return (
            <div className="checkout-container fade-in">
                <h1 className="checkout-title">Finalizar Compra</h1>
                <div className="checkout-layout">
                    <div className="checkout-forms">
                        <div className="checkout-card">
                            <h2 className="section-header">Tipo de Entrega</h2>
                            <div className="delivery-options">
                                <label className="delivery-radio"><input type="radio" name="delivery" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} /> Envío a Domicilio ({currency}5.00)</label>
                                <label className="delivery-radio"><input type="radio" name="delivery" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} /> Recojo en Tienda (Gratis)</label>
                            </div>
                        </div>
                        <div className="checkout-card">
                            <h2 className="section-header">Información Personal</h2>
                            <div className="form-grid">
                                <div className="form-group"><label className="form-label">Nombre Completo <span className="required-star">*</span></label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} /></div>
                                <div className="form-group"><label className="form-label">Teléfono/Celular <span className="required-star">*</span></label><input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} /></div>
                                <div className="form-group"><label className="form-label">DNI <span className="required-star">*</span></label><input type="text" name="dni" className="form-input" value={formData.dni} onChange={handleChange} /></div>
                                <div className="form-group"><label className="form-label">Email</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} /></div>
                            </div>
                        </div>
                        {deliveryType === 'delivery' && (
                            <div className="checkout-card fade-in">
                                <h2 className="section-header">Dirección de Envío</h2>
                                <div className="form-grid">
                                    <div className="form-group form-full"><label className="form-label">Dirección <span className="required-star">*</span></label><input type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} /></div>
                                    <div className="form-group"><label className="form-label">Ciudad <span className="required-star">*</span></label><input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} /></div>
                                    <div className="form-group"><label className="form-label">Código Postal</label><input type="text" name="zip" className="form-input" value={formData.zip} onChange={handleChange} /></div>
                                    <div className="form-group form-full"><label className="form-label">Notas de Entrega (opcional)</label><textarea name="notes" className="form-textarea" placeholder="Referencias adicionales..." value={formData.notes} onChange={handleChange}></textarea></div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="checkout-summary">
                        <div className="summary-checkout">
                            <h2 className="section-header">Resumen</h2>
                            <div className="summary-row"><span>Subtotal</span><span>{currency}{subtotal.toFixed(2)}</span></div>
                            <div className="summary-row"><span>Envío</span><span>{currency}{shippingCost.toFixed(2)}</span></div>
                            <div className="summary-divider"></div>
                            <div className="total-row"><span>Total</span><span className="summary-total-price">{currency}{total.toFixed(2)}</span></div>
                            <button onClick={handleSubmit} className="btn-pay-gradient">Continuar al Pago</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- COMPONENTE: PHOTO EDITOR ---
    function PhotoEditor({ imageSrc, onSave, onCancel, onRequestAI }) {
        const [settings, setSettings] = useState({
            brightness: 100,
            contrast: 100,
            saturation: 100
        });

        const updateSetting = (key, value) => {
            setSettings(prev => ({ ...prev, [key]: value }));
        };

        const getFilterString = () => {
            return `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
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
            <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
                <button onClick={onCancel} className="btn-back"><Icons.ArrowLeft /> Volver</button>
                <h1 style={{fontSize: '2rem', fontWeight: '800', textAlign: 'center', color: '#00A9C3', marginBottom: '2rem'}}>Editar Foto</h1>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        <div className="custom-card">
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#FF7F40', fontWeight: '700'}}>
                                <Icons.Sparkles /> <h3>Vista Previa</h3>
                            </div>
                            <div style={{background: '#f3f4f6', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '4/5', minHeight: '400px'}}>
                                <img 
                                    src={imageSrc} 
                                    alt="Editing" 
                                    style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'all 0.2s', filter: getFilterString()}}
                                />
                            </div>
                        </div>
                        <div style={{display: 'flex', gap: '1rem'}}>
                            <button 
                                onClick={handleSave}
                                style={{flex: 1, background: '#FF7F40', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
                            >
                                <Icons.Save /> Guardar Cambios
                            </button>
                            <button 
                                onClick={() => setSettings({ brightness: 100, contrast: 100, saturation: 100 })}
                                style={{width: '64px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer'}}
                            >
                                <Icons.RotateCcw />
                            </button>
                        </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        <div className="custom-card">
                            <h3 style={{fontWeight: '700', color: '#111', marginBottom: '1rem'}}>Edición Inteligente</h3>
                            <button 
                                onClick={onRequestAI}
                                style={{width: '100%', background: '#00A9C3', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}
                            >
                                <Icons.Sparkles /> Editar con IA
                            </button>
                        </div>
                        <div className="custom-card" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
                            <CustomSlider label="Brillo" value={settings.brightness} min={0} max={200} unit="%" onChange={(v) => updateSetting('brightness', v)} />
                            <CustomSlider label="Contraste" value={settings.contrast} min={0} max={200} unit="%" onChange={(v) => updateSetting('contrast', v)} />
                            <CustomSlider label="Saturación" value={settings.saturation} min={0} max={200} unit="%" onChange={(v) => updateSetting('saturation', v)} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function CustomSlider({ label, value, min, max, unit, onChange }) {
        const percentage = ((value - min) / (max - min)) * 100;
        return (
            <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <label style={{fontWeight: '700', color: '#374151', fontSize: '0.875rem'}}>{label}: {value}{unit}</label>
                </div>
                <div style={{position: 'relative', width: '100%', height: '8px', borderRadius: '999px', background: '#e5e7eb'}}>
                    <input 
                        type="range" 
                        min={min} 
                        max={max} 
                        step={1}
                        value={value} 
                        onChange={(e) => onChange(Number(e.target.value))}
                        style={{position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 20}}
                    />
                    <div 
                        style={{position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: '999px', pointerEvents: 'none', zIndex: 10, width: '100%', background: '#FF7F40'}}
                    ></div>
                    <div 
                        style={{position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', background: 'white', border: '2px solid #FF7F40', borderRadius: '999px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10, pointerEvents: 'none', left: `calc(${percentage}% - 10px)`}}
                    ></div>
                </div>
            </div>
        );
    }

    // --- COMPONENTE: AI EDITOR (Completo con chat e historial) ---
    function AIEditor({ imageSrc, onSave, onCancel }) {
        const [messages, setMessages] = useState([]);
        const [input, setInput] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [currentImage, setCurrentImage] = useState(imageSrc);
        const [history, setHistory] = useState([imageSrc]);
        const messagesEndRef = useRef(null);

        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        };

        useEffect(() => {
            scrollToBottom();
        }, [messages]);

        const handleSend = async () => {
            const trimmedInput = input.trim();
            if (!trimmedInput || isLoading) return;
            
            // Validar longitud de instrucción
            if (trimmedInput.length < 3) {
                setMessages(prev => [...prev, { role: 'model', text: "Por favor escribe una instrucción más detallada (mínimo 3 caracteres)." }]);
                return;
            }
            
            if (trimmedInput.length > 500) {
                setMessages(prev => [...prev, { role: 'model', text: "La instrucción es demasiado larga. Por favor usa máximo 500 caracteres." }]);
                return;
            }

            const userMessage = trimmedInput;
            setInput('');
            setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
            setIsLoading(true);

            try {
                const response = await fetch(`${ArteData.ajax_url}?action=cristopher_editar_imagen_ia&nonce=${ArteData.nonce}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        image: currentImage, 
                        instruction: userMessage 
                    }),
                    timeout: 60000 // 60 segundos
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success && result.data && result.data.image) {
                    setCurrentImage(result.data.image);
                    setHistory(prev => [...prev, result.data.image]);
                    setMessages(prev => [...prev, { role: 'model', text: "¡He actualizado la imagen según tus instrucciones!" }]);
                } else {
                    const errorMsg = result.data || "Lo siento, no pude generar la imagen. Intenta con otra instrucción.";
                    setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
                }
            } catch (error) {
                console.error("Error generating AI image:", error);
                let errorMsg = "Ocurrió un error al procesar tu solicitud.";
                
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMsg = "Error de conexión. Verifica tu conexión a internet e intenta de nuevo.";
                } else if (error.message.includes('timeout')) {
                    errorMsg = "La solicitud tardó demasiado. Por favor intenta con una instrucción más simple.";
                } else {
                    errorMsg = "Error al procesar la solicitud. Por favor intenta de nuevo.";
                }
                
                setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <div className="fade-in" style={{ position: 'fixed', inset: 0, background: '#f9fafb', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <header style={{background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{background: '#FF7F40', borderRadius: '8px', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Icons.Sparkles style={{width: '20px', height: '20px', color: 'white'}} />
                        </div>
                        <h1 style={{fontSize: '1.25rem', fontWeight: '700', color: '#111'}}>Editor con IA</h1>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                        <button 
                            onClick={onCancel}
                            style={{color: '#6b7280', fontWeight: '500', padding: '0.5rem 1rem', cursor: 'pointer', background: 'transparent', border: 'none'}}
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={() => onSave(currentImage)}
                            style={{background: '#00A9C3', color: 'white', fontWeight: '700', borderRadius: '999px', padding: '0.5rem 1.5rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}
                        >
                            <Icons.Save style={{width: '16px', height: '16px'}} />
                            Guardar y Usar
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                    {/* Image View & History */}
                    <div style={{flex: 1, background: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '2rem', overflow: 'hidden'}}>
                        {/* Main Image */}
                        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 0, marginBottom: '5rem'}}>
                            <div style={{background: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden', width: '100%', height: '100%', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <img 
                                    src={currentImage} 
                                    alt="Current AI Edit" 
                                    style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}
                                />
                            </div>
                        </div>

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10}}>
                                <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
                                    <Icons.Loader style={{width: '40px', height: '40px', color: '#FF7F40'}} />
                                    <p style={{fontWeight: '700', color: '#374151'}}>La IA está trabajando...</p>
                                </div>
                            </div>
                        )}

                        {/* History Strip */}
                        <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderTop: '1px solid #e5e7eb', padding: '1rem', zIndex: 20}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                                <Icons.History style={{width: '12px', height: '12px'}} />
                                Historial
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem'}}>
                                {history.map((histImg, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentImage(histImg)}
                                        style={{
                                            height: '64px', 
                                            width: '64px', 
                                            flexShrink: 0, 
                                            borderRadius: '8px', 
                                            overflow: 'hidden', 
                                            border: currentImage === histImg ? '2px solid #FF7F40' : '2px solid #e5e7eb',
                                            boxShadow: currentImage === histImg ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                                            transform: currentImage === histImg ? 'scale(1.05)' : 'scale(1)',
                                            opacity: currentImage === histImg ? 1 : 0.7,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                    >
                                        <img src={histImg} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt={`Version ${idx}`} />
                                        {idx === 0 && (
                                            <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '9px', textAlign: 'center', padding: '2px'}}>Original</div>
                                        )}
                                        {idx === history.length - 1 && history.length > 1 && (
                                            <div style={{position: 'absolute', top: 0, right: 0, padding: '2px', background: '#00A9C3', borderRadius: '0 0 0 4px'}}>
                                                <Icons.Clock style={{width: '8px', height: '8px', color: 'white'}} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chat Interface */}
                    <div style={{background: 'white', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '0 -4px 6px rgba(0,0,0,0.05)', zIndex: 20, flexShrink: 0, height: '350px'}}>
                        {/* Chat History */}
                        <div style={{flex: 1, overflowY: 'auto', padding: '1rem', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div style={{display: 'flex', gap: '0.75rem'}}>
                                <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#00A9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                                    <Icons.Bot style={{width: '16px', height: '16px', color: 'white'}} />
                                </div>
                                <div style={{background: 'white', padding: '0.75rem', borderRadius: '16px', borderRadiusTopLeft: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', fontSize: '0.875rem', color: '#374151'}}>
                                    Hola, soy tu asistente creativo. Dime qué quieres cambiar de la foto (ej: "Ponle un sombrero", "Cambia el fondo a una playa").
                                </div>
                            </div>

                            {messages.map((msg, idx) => (
                                <div key={idx} style={{display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'}}>
                                    <div style={{width: '32px', height: '32px', borderRadius: '50%', background: msg.role === 'user' ? '#374151' : '#00A9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                                        {msg.role === 'user' ? <Icons.User style={{width: '16px', height: '16px', color: 'white'}} /> : <Icons.Bot style={{width: '16px', height: '16px', color: 'white'}} />}
                                    </div>
                                    <div style={{
                                        padding: '0.75rem', 
                                        borderRadius: '16px', 
                                        borderRadiusTopRight: msg.role === 'user' ? 0 : '16px',
                                        borderRadiusTopLeft: msg.role === 'user' ? '16px' : 0,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
                                        border: '1px solid ' + (msg.role === 'user' ? '#dbeafe' : '#f3f4f6'),
                                        fontSize: '0.875rem', 
                                        maxWidth: '80%',
                                        background: msg.role === 'user' ? '#eff6ff' : 'white',
                                        color: msg.role === 'user' ? '#1e40af' : '#374151'
                                    }}>
                                        {msg.text && <p style={{margin: 0}}>{msg.text}</p>}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{padding: '1rem', background: 'white', borderTop: '1px solid #e5e7eb'}}>
                            <div style={{position: 'relative', display: 'flex', gap: '0.5rem'}}>
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.length <= 500) {
                                            setInput(val);
                                        }
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    placeholder="Escribe tu instrucción... (ej: Ponle un sombrero, Cambia el fondo a una playa)"
                                    disabled={isLoading}
                                    maxLength={500}
                                    style={{
                                        flex: 1, 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '999px', 
                                        padding: '0.75rem 1rem', 
                                        fontSize: '0.875rem', 
                                        outline: 'none',
                                        background: isLoading ? '#f9fafb' : 'white'
                                    }}
                                />
                                {input.length > 0 && (
                                    <span style={{position: 'absolute', right: '50px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: input.length > 450 ? '#ef4444' : '#9ca3af'}}>
                                        {input.length}/500
                                    </span>
                                )}
                                <button 
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    style={{
                                        background: isLoading || !input.trim() ? '#d1d5db' : '#00A9C3', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '50%', 
                                        width: '40px', 
                                        height: '40px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                                        flexShrink: 0
                                    }}
                                >
                                    <Icons.Send style={{width: '18px', height: '18px'}} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const root = createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
}