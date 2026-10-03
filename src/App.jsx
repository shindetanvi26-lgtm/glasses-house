import { useEffect, useState } from 'react'
import { ArrowRight, Check, Copy, CreditCard, Heart, MapPin, Menu, MessageCircle, Minus, Phone, Plus, Search, ShoppingBag, Star, X } from 'lucide-react'
import './App.css'

const baseProducts = [
  { id: 1, slug: 'harper', name: 'The Harper', category: 'Women', kind: 'Optical', price: 10752, was: 13440, rating: '4.9', image: 'photo-1574258495973-f010dfbb5371', color: 'Tortoise / Champagne', description: 'A softly sculpted silhouette with just the right amount of presence. Made for long days, late dinners, and everything in between.' },
  { id: 2, slug: 'marlow', name: 'The Marlow', category: 'Men', kind: 'Optical', price: 12180, was: 15120, rating: '4.8', image: 'photo-1508296695146-257a814070b4', color: 'Dark Havana', description: 'A confident everyday frame with clean lines, a comfortable fit, and a little character.' },
  { id: 3, slug: 'sol', name: 'The Sol', category: 'Women', kind: 'Sunglasses', price: 9912, was: 12600, rating: '4.9', image: 'photo-1511499767150-a48a237f0083', color: 'Honey / Olive lens', description: 'A warm, sun-ready frame with UV400 lenses and a flattering lifted shape.' },
  { id: 4, slug: 'ellis', name: 'The Ellis', category: 'Men', kind: 'Optical', price: 11340, was: 14112, rating: '4.7', image: 'photo-1577803645773-f96470509666', color: 'Matte Black', description: 'Understated and easy to wear, with a modern profile from weekday to weekend.' },
  { id: 5, slug: 'remy', name: 'The Remy', category: 'Kids', kind: 'Optical', price: 6552, was: 8232, rating: '4.8', image: 'photo-1503919005314-30d93d07d823', color: 'Ocean Blue', description: 'A lightweight, flexible frame made for big days, little faces, and all the adventures between.' },
  { id: 6, slug: 'cleo', name: 'The Cleo', category: 'Women', kind: 'Sunglasses', price: 10500, was: 13272, rating: '4.9', image: 'photo-1473496169904-658ba7c44d8a', color: 'Soft black / Smoke', description: 'A modern cat-eye with crisp lines and polarized lenses for bright days.' },
  { id: 7, slug: 'porter', name: 'The Porter', category: 'Men', kind: 'Optical', price: 11928, was: 14784, rating: '4.8', image: 'photo-1500648767791-00dcc994a43e', color: 'Walnut', description: 'A timeless shape in rich walnut acetate, finished by hand for a considered feel.' },
  { id: 8, slug: 'june', name: 'The June', category: 'Kids', kind: 'Sunglasses', price: 5376, was: 6888, rating: '4.7', image: 'photo-1534452203293-494d7ddbf7e0', color: 'Coral / Amber lens', description: 'Bright, bendy, and ready for recess. UV400 protection comes standard.' },
]
const products = [
  ...baseProducts,
  ...(window.productsData || []).map((product) => ({
    ...product,
    was: product.originalPrice,
    kind: product.category,
    rating: String(product.rating ?? '5.0'),
    reviews: product.reviewsCount ?? 48,
    color: product.color ?? 'Black',
    description: product.description ?? 'A comfortable, lightweight frame for clear everyday style.',
  })),
]
const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
const shippingFee = 50
const photo = (id, width = 760) => id.startsWith('/') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`
const createOrderId = () => `GH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
const whatsappNumber = window.WHATSAPP_STORE_NUMBER
const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
const stored = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }

function App() {
  const [path, setPath] = useState(location.pathname)
  const [cart, setCart] = useState(() => stored('gh-cart').map((item) => {
    const currentProduct = products.find((product) => product.id === item.id)
    return currentProduct ? { ...currentProduct, qty: item.qty ?? item.quantity ?? 1 } : item
  }))
  const [saved, setSaved] = useState(stored('gh-saved'))
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const pop = () => setPath(location.pathname)
    addEventListener('popstate', pop)
    return () => removeEventListener('popstate', pop)
  }, [])
  useEffect(() => localStorage.setItem('gh-cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('gh-saved', JSON.stringify(saved)), [saved])

  const navigate = (href) => {
    history.pushState({}, '', href)
    setPath(location.pathname)
    setMenuOpen(false)
    setSearchOpen(false)
    scrollTo({ top: 0, behavior: 'smooth' })
  }
  const add = (product) => {
    setCart((items) => {
      const match = items.find((item) => item.id === product.id)
      return match ? items.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item) : [...items, { ...product, qty: 1 }]
    })
    setNotice(`${product.name} added to your bag`)
    setTimeout(() => setNotice(''), 2400)
  }
  const quantity = (id, amount) => setCart((items) => items.map((item) => item.id === id ? { ...item, qty: item.qty + amount } : item).filter((item) => item.qty > 0))
  const toggleSaved = (id) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  const totalItems = cart.reduce((total, item) => total + item.qty, 0)
  const currentProduct = products.find((item) => item.slug === path.split('/')[2])
  const category = { '/men': 'Men', '/women': 'Women', '/kids': 'Kids', '/sunglasses': 'Sunglasses' }[path]
  const matching = (path === '/wishlist' ? products.filter((item) => saved.includes(item.id)) : products.filter((item) => !category || (category === 'Sunglasses' ? item.kind === 'Sunglasses' : item.category === category))).filter((item) => !query || `${item.name} ${item.kind} ${item.category}`.toLowerCase().includes(query.toLowerCase()))
  const shown = [...matching].sort((a, b) => sortBy === 'low' ? a.price - b.price : sortBy === 'high' ? b.price - a.price : 0)

  return <div className="store">
    <div className="announcement"><a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={13} /> WhatsApp +91 7045609002</a><span>Flat ₹50 shipping on all orders</span></div>
    <header className="header">
      <button className="icon mobile-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <a className="wordmark" href="/" onClick={(event) => { event.preventDefault(); navigate('/') }}>glasses<span>house</span><i>.</i></a>
      <nav className={menuOpen ? 'nav open' : 'nav'}>{[['Shop all', '/shop'], ["Men's", '/men'], ["Women's", '/women'], ['Kids', '/kids'], ['Sunglasses', '/sunglasses']].map(([label, href]) => <a key={href} href={href} onClick={(event) => { event.preventDefault(); navigate(href) }}>{label}</a>)}</nav>
      <div className="header-tools"><button className="icon" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}>{searchOpen ? <X /> : <Search />}</button><button className="icon wishlist-top" aria-label="Wishlist" onClick={() => navigate('/wishlist')}><Heart /></button><button className="bag" onClick={() => navigate('/cart')}><ShoppingBag /><span>Bag</span><b>{totalItems}</b></button></div>
      {searchOpen && <form className="searchbar" onSubmit={(event) => { event.preventDefault(); navigate('/shop') }}><Search size={18} /><input autoFocus placeholder="Search frames" value={query} onChange={(event) => setQuery(event.target.value)} /><button>Search <ArrowRight size={15} /></button></form>}
    </header>
    <main>
      {path === '/' && <Home navigate={navigate} add={add} saved={saved} toggleSaved={toggleSaved} />}
      {(path === '/shop' || category || path === '/wishlist') && <section className="listing wrap"><p className="eyebrow">{path === '/wishlist' ? 'A LITTLE SOMETHING TO COME BACK TO' : 'GOOD THINGS, IN GOOD FRAMES'}</p><h1>{path === '/wishlist' ? 'Your saved ones' : category === 'Men' ? 'For him' : category === 'Women' ? 'For her' : category === 'Kids' ? 'For little eyes' : category === 'Sunglasses' ? 'Out in the sun' : 'The collection'}<i>.</i></h1><p className="listing-intro">Considered shapes, thoughtful details, and a fit that feels like yours.</p><div className="listing-tools"><span>{shown.length} frames</span><label>Sort by <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div><div className="grid">{shown.length ? shown.map((product) => <ProductCard key={product.id} product={product} navigate={navigate} add={add} saved={saved} toggleSaved={toggleSaved} />) : <p className="empty">No frames here yet. Explore the full collection to find your pair.</p>}</div></section>}
      {path.startsWith('/product/') && <ProductDetail product={currentProduct} navigate={navigate} add={add} saved={saved} toggleSaved={toggleSaved} />}
      {path === '/cart' && <Cart cart={cart} quantity={quantity} remove={(id) => setCart((items) => items.filter((item) => item.id !== id))} setCart={setCart} navigate={navigate} />}
      {path === '/contact' && <Contact />}
      {path === '/admin' && <AdminDashboard />}
    </main>
    <Footer navigate={navigate} />
    {notice && <div className="toast" role="status"><Check size={17} />{notice}<button aria-label="Dismiss" onClick={() => setNotice('')}><X size={16} /></button></div>}
  </div>
}

function Home({ navigate, add, saved, toggleSaved }) {
  return <>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">EVERYDAY EYEWEAR, THOUGHTFULLY MADE</p><h1>See better.<br /><em>Look better.</em></h1><p>Good frames do more than help you see. They make the everyday feel a little more like you.</p><button className="button dark" onClick={() => navigate('/shop')}>Shop the collection <ArrowRight size={17} /></button><small>DESIGNED TO BE WORN ON REPEAT</small></div><div className="hero-picture"><img src={photo('photo-1511499767150-a48a237f0083', 1500)} alt="Sunglasses in warm afternoon light" /><span className="hero-caption">01 / 04 <b>THE SUN EDIT</b></span><div className="hero-stamp">A better<br />point of view</div></div><div className="hero-bottom">INDEPENDENT EYEWEAR FOR EVERYDAY LIFE <span>SCROLL TO DISCOVER</span></div></section>
    <section className="feature wrap"><div className="section-head"><div><p className="eyebrow">A FEW GOOD FRAMES</p><h2>Meet the ones you’ll wear <em>on repeat.</em></h2></div><button className="underlink" onClick={() => navigate('/shop')}>Shop all frames <ArrowRight size={15} /></button></div><div className="grid four">{products.slice(0, 4).map((item) => <ProductCard key={item.id} product={item} navigate={navigate} add={add} saved={saved} toggleSaved={toggleSaved} />)}</div></section>
    <section className="categories wrap"><div className="section-head"><div><p className="eyebrow">FIND YOUR FIT</p><h2>Frames for <em>every you.</em></h2></div><p>A good pair should feel like it was always yours.</p></div><div className="category-grid">{[['For her', '/women', 'photo-1531123897727-8f129e1688ce'], ['For him', '/men', 'photo-1500648767791-00dcc994a43e'], ['For little eyes', '/kids', 'photo-1503919005314-30d93d07d823'], ['Sun, meet style', '/sunglasses', 'photo-1511499767150-a48a237f0083']].map(([label, href, img], index) => <button key={href} className="category" onClick={() => navigate(href)}><img src={photo(img, 700)} alt="" /><span><b>{label}</b><small>{[12, 10, 6, 8][index]} frames</small></span><ArrowRight /></button>)}</div></section>
    <section className="values"><div><p className="eyebrow">THE GLASSES HOUSE DIFFERENCE</p><h2>Good looks.<br /><em>Good sense.</em></h2><p>Thoughtful details make all the difference. That’s where we put our focus.</p><button className="underlink" onClick={() => navigate('/shop')}>Get to know our frames <ArrowRight size={15} /></button></div><div className="value-list">{[['01', 'Made to wear, not just look at', 'Comfortable shapes and considered materials feel good from morning on.'], ['02', 'A clearer kind of quality', 'Every frame is made to last, with a 12-month frame warranty.'], ['03', 'A little easier on the planet', 'Responsibly sourced materials and less packaging, without compromise.']].map(([num, title, text]) => <article key={num}><span>{num}</span><div><h3>{title}</h3><p>{text}</p></div><Check /></article>)}</div></section>
    <section className="review"><p className="eyebrow">KIND WORDS, CLEAR VISION</p><blockquote>“I put them on and immediately felt like <em>myself,</em> only a little more put together.”</blockquote><div className="review-by"><span>★★★★★</span> JAMIE R. · VERIFIED CUSTOMER</div><button className="underlink" onClick={() => navigate('/shop')}>Find your pair <ArrowRight size={15} /></button></section>
    <section className="newsletter"><div><p className="eyebrow">A GOOD THING IN YOUR INBOX</p><h2>Notes on good frames <em>& good days.</em></h2></div><button className="button dark" onClick={() => navigate('/contact')}>Say hello <ArrowRight size={16} /></button></section>
  </>
}

function ProductCard({ product, navigate, add, saved, toggleSaved }) {
  const isSaved = saved.includes(product.id)
  return <article className="product">
    <div className="product-photo" onClick={() => navigate(`/product/${product.slug}`)} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && navigate(`/product/${product.slug}`)}>
      <img src={photo(product.image)} alt={`${product.name} ${product.kind.toLowerCase()} glasses`} loading="lazy" />
      <span className="sale">{product.tag || `SAVE ${Math.round((1 - product.price / product.was) * 100)}%`}</span>
      <button className={isSaved ? 'heart saved' : 'heart'} aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'} onClick={(event) => { event.stopPropagation(); toggleSaved(product.id) }}><Heart fill={isSaved ? 'currentColor' : 'none'} size={17} /></button>
      <button className="quick" onClick={(event) => { event.stopPropagation(); add(product) }}>Add to bag <Plus size={15} /></button>
    </div>
    <button className="product-name" onClick={() => navigate(`/product/${product.slug}`)}>{product.name}</button>
    <div className="product-meta">{product.kind} / {product.category}<span><Star size={12} fill="currentColor" /> {product.rating}</span></div>
    <div className="price">{formatINR(product.price)}<del>{formatINR(product.was)}</del></div>
  </article>
}

function ProductDetail({ product, navigate, add, saved, toggleSaved }) {
  const [added, setAdded] = useState(false)
  if (!product) return <section className="wrap empty-page"><h1>That frame wasn’t found.</h1><button className="button dark" onClick={() => navigate('/shop')}>Back to shop <ArrowRight /></button></section>
  const isSaved = saved.includes(product.id)
  return <section className="detail wrap">
    <button className="back" onClick={() => navigate('/shop')}>← &nbsp; Back to all frames</button>
    <div className="detail-layout">
      <div className="detail-photo"><img src={photo(product.image, 1300)} alt={product.name} /></div>
      <div className="detail-info">
        <p className="eyebrow">{product.kind.toUpperCase()} · {product.category.toUpperCase()}</p>
        <h1>{product.name}<i>.</i></h1>
        <div className="rating">★★★★★ <span>{product.rating} · {product.reviews ?? 48} reviews</span></div>
        <div className="detail-price">{formatINR(product.price)}<del>{formatINR(product.was)}</del><small>Save {formatINR(product.was - product.price)}</small></div>
        <p className="description">{product.description}</p>
        <div className="spec"><span>FRAME COLOR</span><b>{product.color}</b></div>
        {product.features?.length > 0 && <div className="spec"><span>FEATURES</span><b>{product.features.join(', ')}</b></div>}
        <div className="spec"><span>IN THE BOX</span><b>Frame, case & cleaning cloth</b></div>
        <div className="spec"><span>THE GOOD STUFF</span><b>12-month frame warranty</b></div>
        <div className="detail-actions"><button className="button dark" onClick={() => { add(product); setAdded(true) }}>{added ? <><Check size={16} /> Added to bag</> : <>Add to bag <ArrowRight size={16} /></>}</button><button className={isSaved ? 'detail-heart saved' : 'detail-heart'} aria-label="Toggle wishlist" onClick={() => toggleSaved(product.id)}><Heart fill={isSaved ? 'currentColor' : 'none'} /></button></div>
        <small className="ship-note"><Check size={14} /> Flat ₹50 shipping on all orders</small>
      </div>
    </div>
  </section>
}

function Cart({ cart, quantity, remove, setCart, navigate }) {
  const [complete, setComplete] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('whatsapp')
  const [isMobile, setIsMobile] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({ fullName: '', phone: '', street: '', city: '', pincode: '', landmark: '' })
  const [customerDetailsComplete, setCustomerDetailsComplete] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState('standard')
  const [orderConfirmation, setOrderConfirmation] = useState(null)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = cart.length > 0 ? shippingFee : 0
  const total = subtotal + shipping
  const storeUpiId = window.OWNER_UPI_ID
  const businessName = window.OWNER_NAME
  const deliveryMethodLabel = deliveryMethod === 'local-express' ? 'Local Express Delivery (Dunzo / Porter)' : 'Standard Shipping'
  const paymentStatusFor = (method) => method === 'Direct UPI' ? 'Awaiting Verification' : method === 'Card Payment' ? 'Not Connected' : 'Pending'
  const paymentNotesFor = (method) => method === 'Direct UPI' ? 'Verify the UPI payment in the bank app before dispatch.' : method === 'Card Payment' ? 'Card payment is not connected; confirm payment with the customer.' : 'Customer requested order confirmation on WhatsApp.'
  const createWhatsAppOrderUrl = (method) => {
    const fullAddress = `${customerDetails.street.trim()}, ${customerDetails.city.trim()}`
    const address = `${fullAddress}, ${customerDetails.pincode.trim()}`
    const items = cart.map((item) => `${item.name} x${item.qty}`).join(', ')
    const message = [
      '*New Order - Glasses House*',
      '*Customer Details:*',
      `- Name: ${customerDetails.fullName.trim()}`,
      `- Phone: ${customerDetails.phone.trim()}`,
      `- Address: ${address}`,
      `- Landmark: ${customerDetails.landmark.trim()}`,
      '',
      '*Delivery Request:*',
      `- Delivery Option: ${deliveryMethodLabel}`,
      `- Name: ${customerDetails.fullName.trim()}`,
      `- Phone Number: ${customerDetails.phone.trim()}`,
      `- Full Address: ${fullAddress}`,
      `- Pincode: ${customerDetails.pincode.trim()}`,
      `- Landmark: ${customerDetails.landmark.trim()}`,
      ...(deliveryMethod === 'local-express' ? ['- Courier Fare: Confirm with customer before booking'] : []),
      '',
      '*Order Details:*',
      `- Items: ${items}`,
      `- Subtotal: ${formatINR(subtotal)}`,
      `- Shipping: ${formatINR(shipping)}`,
      `- Total Amount: ${formatINR(total)}`,
      `- Payment Method: ${method}`,
      `- Payment Status: ${paymentStatusFor(method)}`,
      `- Payment Notes: ${paymentNotesFor(method)}`,
    ].join('\n')
    return `${whatsappUrl}?text=${encodeURIComponent(message)}`
  }

  const updateCustomerDetail = (event) => {
    const { name, value } = event.target
    setCustomerDetails((details) => ({ ...details, [name]: value }))
    setCustomerDetailsComplete(false)
  }

  const confirmCustomerDetails = (event) => {
    event.preventDefault()
    setCustomerDetailsComplete(true)
  }

  const sendWhatsAppOrder = (method) => {
    window.open(createWhatsAppOrderUrl(method), '_blank', 'noopener,noreferrer')
    finishOrder(method)
  }

  useEffect(() => {
    if (!checkoutOpen) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') setCheckoutOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [checkoutOpen])

  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 767px)')
    const updateDevice = () => setIsMobile(mobileViewport.matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
    updateDevice()
    mobileViewport.addEventListener('change', updateDevice)
    return () => mobileViewport.removeEventListener('change', updateDevice)
  }, [])

  const finishOrder = (method = 'WhatsApp') => {
    const order = {
      id: createOrderId(),
      customerInfo: {
        fullName: customerDetails.fullName.trim(),
        phone: customerDetails.phone.trim(),
      },
      address: {
        street: customerDetails.street.trim(),
        city: customerDetails.city.trim(),
        pincode: customerDetails.pincode.trim(),
        landmark: customerDetails.landmark.trim(),
      },
      paymentMethod: method,
      paymentStatus: paymentStatusFor(method),
      paymentNotes: paymentNotesFor(method),
      items: cart.map((item) => ({ id: item.id, name: item.name, quantity: item.qty, unitPrice: item.price })),
      subtotal,
      shipping,
      total,
      orderDate: new Date().toISOString(),
      deliveryStatus: 'Pending',
      deliveryMethod: deliveryMethodLabel,
      trackingId: '',
    }
    localStorage.setItem('gh-orders', JSON.stringify([order, ...stored('gh-orders')]))
    setOrderConfirmation({
      customerDetails: { ...customerDetails },
      deliveryMethod: deliveryMethodLabel,
      subtotal,
      shipping,
      total,
    })
    setCart([])
    setCheckoutOpen(false)
    setComplete(true)
  }

  if (complete) return <section className="confirmation"><span><Check /></span><p className="eyebrow">THAT’S A GOOD CHOICE</p><h1>Your order is on its way<i>.</i></h1><p>Thanks for choosing Glasses House. We’ll be in touch with the details shortly.</p>{orderConfirmation && <div className="confirmation-delivery"><p className="eyebrow">LOCAL DELIVERY</p><h2>Delivery request</h2><dl><div><dt>Delivery option</dt><dd>{orderConfirmation.deliveryMethod}</dd></div><div><dt>Name</dt><dd>{orderConfirmation.customerDetails.fullName}</dd></div><div><dt>Phone Number</dt><dd>{orderConfirmation.customerDetails.phone}</dd></div><div><dt>Full Address</dt><dd>{orderConfirmation.customerDetails.street}, {orderConfirmation.customerDetails.city}</dd></div><div><dt>Pincode</dt><dd>{orderConfirmation.customerDetails.pincode}</dd></div><div><dt>Landmark</dt><dd>{orderConfirmation.customerDetails.landmark}</dd></div><div><dt>Shipping Fee</dt><dd>{formatINR(orderConfirmation.shipping)}</dd></div><div><dt>Total</dt><dd>{formatINR(orderConfirmation.total)}</dd></div></dl></div>}<button className="button dark" onClick={() => navigate('/shop')}>Back to the good stuff <ArrowRight size={16} /></button></section>
  return <section className="cart-page wrap">
    <p className="eyebrow">A FEW GOOD THINGS</p>
    <h1>Your bag<i>.</i></h1>
    {cart.length ? <div className="cart-layout">
      <div>{cart.map((item) => <article className="cart-row" key={item.id}>
        <img src={photo(item.image, 300)} alt={item.name} />
        <div><p className="eyebrow">{item.kind} / {item.category}</p><h2>{item.name}</h2><small>{item.color}</small><div className="quantity"><button aria-label="Decrease quantity" onClick={() => quantity(item.id, -1)}><Minus size={14} /></button><span>{item.qty}</span><button aria-label="Increase quantity" onClick={() => quantity(item.id, 1)}><Plus size={14} /></button></div></div>
        <div className="cart-end"><b>{formatINR(item.price * item.qty)}</b><button onClick={() => remove(item.id)}>Remove</button></div>
      </article>)}</div>
      <aside className="summary">
        <h2>Order summary</h2>
        <p><span>Subtotal</span><b>{formatINR(subtotal)}</b></p>
        <p><span>Shipping Fee</span><b>{formatINR(shipping)}</b></p>
        <p className="total"><strong>Total</strong><strong>{formatINR(total)}</strong></p>
        <button className="button dark" onClick={() => setCheckoutOpen(true)}>Continue to checkout <ArrowRight size={16} /></button>
        <small className="secure"><Check size={14} /> Secure checkout, always</small>
      </aside>
    </div> : <div className="cart-empty"><ShoppingBag /><h2>Your bag is taking a little breather.</h2><p>When you find a frame you love, it’ll be right here.</p><button className="button dark" onClick={() => navigate('/shop')}>Find your frames <ArrowRight size={16} /></button></div>}
    {checkoutOpen && <div className="checkout-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckoutOpen(false) }}>
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div className="checkout-heading"><div><p className="eyebrow">ALMOST YOURS</p><h2 id="checkout-title">Choose how to pay</h2></div><button className="checkout-close" aria-label="Close checkout" onClick={() => setCheckoutOpen(false)}><X size={20} /></button></div>
        <div className="customer-checkout">
          <div className="customer-heading"><h3>Delivery details</h3>{customerDetailsComplete && <button type="button" className="customer-edit" onClick={() => setCustomerDetailsComplete(false)}>Edit</button>}</div>
          {customerDetailsComplete ? <div className="customer-confirmed"><strong>{customerDetails.fullName}</strong><span>{customerDetails.phone}</span><span>{customerDetails.street}, {customerDetails.city}, {customerDetails.pincode}</span><span>Landmark: {customerDetails.landmark}</span></div> : <form className="customer-details-form" onSubmit={confirmCustomerDetails}>
            <label className="field-label">Full Name<input required name="fullName" autoComplete="name" minLength={2} value={customerDetails.fullName} onChange={updateCustomerDetail} placeholder="Your full name" /></label>
            <label className="field-label">Phone Number<input required name="phone" type="tel" inputMode="numeric" autoComplete="tel" pattern="[0-9]{10,13}" maxLength={13} value={customerDetails.phone} onChange={(event) => setCustomerDetails((details) => ({ ...details, phone: event.target.value.replace(/\D/g, '').slice(0, 13) }))} placeholder="10–13 digit phone number" title="Enter a 10–13 digit phone number" /></label>
            <label className="field-label">Street Address<input required name="street" autoComplete="street-address" value={customerDetails.street} onChange={updateCustomerDetail} placeholder="House / building, street, area" /></label>
            <div className="delivery-city-row"><label className="field-label">City<input required name="city" autoComplete="address-level2" value={customerDetails.city} onChange={updateCustomerDetail} placeholder="City" /></label><label className="field-label">Pincode<input required name="pincode" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{6}" maxLength={6} value={customerDetails.pincode} onChange={updateCustomerDetail} placeholder="6-digit pincode" title="Enter a 6-digit pincode" /></label></div>
            <label className="field-label">Landmark<input required name="landmark" value={customerDetails.landmark} onChange={updateCustomerDetail} placeholder="Nearby landmark" /></label>
            <button className="button dark" type="submit">Continue to payment <ArrowRight size={16} /></button>
          </form>}
        </div>
        {customerDetailsComplete && <>
          <fieldset className="delivery-method-options">
            <legend>Local Delivery</legend>
            <label className={deliveryMethod === 'standard' ? 'delivery-method selected' : 'delivery-method'}><input type="radio" name="deliveryMethod" value="standard" checked={deliveryMethod === 'standard'} onChange={() => setDeliveryMethod('standard')} /><span><strong>Standard Shipping</strong><small>Flat ₹50 shipping fee</small></span></label>
            <label className={deliveryMethod === 'local-express' ? 'delivery-method selected' : 'delivery-method'}><input type="radio" name="deliveryMethod" value="local-express" checked={deliveryMethod === 'local-express'} onChange={() => setDeliveryMethod('local-express')} /><span><strong>Local Express Delivery (Dunzo / Porter)</strong><small>Courier fare confirmed with you before booking</small></span></label>
          </fieldset>
          <p className="checkout-total">Order total <strong>{formatINR(total)}</strong></p>
          <div className="payment-options" role="radiogroup" aria-label="Payment method">
            <label className={paymentMethod === 'whatsapp' ? 'payment-option selected' : 'payment-option'}><input type="radio" name="paymentMethod" value="whatsapp" checked={paymentMethod === 'whatsapp'} onChange={() => setPaymentMethod('whatsapp')} /><MessageCircle size={18} /><span><strong>WhatsApp Order</strong><small>Confirm your order with our team</small></span></label>
            <label className={paymentMethod === 'upi' ? 'payment-option selected' : 'payment-option'}><input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /><span className="upi-glyph">U</span><span><strong>UPI</strong><small>Google Pay, PhonePe, Paytm or BHIM</small></span></label>
            <label className={paymentMethod === 'card' ? 'payment-option selected' : 'payment-option'}><input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /><CreditCard size={18} /><span><strong>Credit / Debit Card</strong><small>Visa, Mastercard and RuPay</small></span></label>
          </div>
          {paymentMethod === 'whatsapp' && <div className="payment-fields whatsapp-fields"><p>Your order summary will be sent to Glasses House on WhatsApp.</p><a className="button dark" href={createWhatsAppOrderUrl('WhatsApp')} target="_blank" rel="noreferrer" onClick={() => finishOrder('WhatsApp')}>Order via WhatsApp <ArrowRight size={16} /></a></div>}
          {paymentMethod === 'upi' && <div className="payment-fields direct-upi">
            <div className="upi-payment-info">
              <div className="upi-qr"><p>Scan with any UPI app</p><img src={window.getUpiQrCodeUrl(total)} width="176" height="176" alt="UPI payment QR code" /></div>
              <div className="upi-payee"><span>PAY TO</span><strong>{businessName}</strong><span>UPI ID</span><strong className="upi-id-value">{storeUpiId}</strong><span>AMOUNT</span><strong>{formatINR(total)}</strong></div>
            </div>
            <button className="button dark mobile-upi-pay" type="button" onClick={() => window.openMobileUpi(total)}>Pay via UPI <ArrowRight size={16} /></button>
            <p className="upi-help">{isMobile ? 'Complete payment in your UPI app, then return here to confirm your order.' : 'Scan the QR using your UPI app, complete payment, then confirm your order here.'}</p>
            <button className="button dark" type="button" onClick={() => sendWhatsAppOrder('Direct UPI')}>Payment complete — confirm order <ArrowRight size={16} /></button>
          </div>}
          {paymentMethod === 'card' && <form className="payment-fields" onSubmit={(event) => { event.preventDefault(); sendWhatsAppOrder('Card Payment') }}>
            <label className="field-label">Card Number<input required inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" pattern="[0-9 ]{12,23}" title="Enter a valid card number" /></label>
            <div className="card-fields"><label className="field-label">Expiry<input required autoComplete="cc-exp" placeholder="MM/YY" pattern="(0[1-9]|1[0-2])/[0-9]{2}" title="Use MM/YY format" /></label><label className="field-label">CVV<input required type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="123" pattern="[0-9]{3,4}" title="Enter the 3 or 4 digit security code" /></label></div>
            <button className="button dark" type="submit">Send order via WhatsApp <ArrowRight size={16} /></button>
          </form>}
          <p className="checkout-disclaimer">Online card payment is not connected yet. UPI and card submissions are order requests for the store to confirm.</p>
        </>}
        <CancellationPolicy placement="checkout-policy" />
      </section>
    </div>}
  </section>
}

function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState(() => {
    const savedOrders = stored('gh-orders')
    return Array.isArray(savedOrders) ? savedOrders : []
  })
  const [copiedOrderId, setCopiedOrderId] = useState('')

  const updateOrder = (orderId, updates) => setOrders((currentOrders) => {
    const nextOrders = currentOrders.map((order) => order.id === orderId ? { ...order, ...updates } : order)
    localStorage.setItem('gh-orders', JSON.stringify(nextOrders))
    return nextOrders
  })

  const copyOrderAddress = async (order) => {
    const { street = '', city = '', pincode = '', landmark = '' } = order.address || {}
    const address = `${street}, ${city}, ${pincode}${landmark ? `, Landmark: ${landmark}` : ''}`
    try {
      await navigator.clipboard.writeText(address)
      setCopiedOrderId(order.id)
      window.setTimeout(() => setCopiedOrderId(''), 1800)
    } catch {
      setCopiedOrderId('')
    }
  }

  const visibleOrders = [...orders]
    .sort((first, second) => new Date(second.orderDate) - new Date(first.orderDate))
    .filter((order) => `${order.id} ${order.customerInfo?.phone || ''}`.toLowerCase().includes(search.trim().toLowerCase()))

  if (!authenticated) return <section className="admin-lock wrap">
    <form onSubmit={(event) => { event.preventDefault(); if (pin === '1214') { setAuthenticated(true); setPinError('') } else setPinError('That PIN didn’t match.') }}>
      <p className="eyebrow">GLASSES HOUSE / PRIVATE</p>
      <h1>Admin sign in<i>.</i></h1>
      <label className="field-label">Admin PIN<input required type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="Enter PIN" /></label>
      {pinError && <p className="admin-error" role="alert">{pinError}</p>}
      <button className="button dark" type="submit">Unlock dashboard <ArrowRight size={16} /></button>
    </form>
  </section>

  return <section className="admin-dashboard wrap">
    <div className="admin-heading"><div><p className="eyebrow">GLASSES HOUSE / PRIVATE</p><h1>Orders<i>.</i></h1></div><span>{orders.length} total</span></div>
    <label className="admin-search"><Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by customer phone or order ID" aria-label="Search by customer phone or order ID" /></label>
    {visibleOrders.length === 0 ? <div className="admin-empty">{orders.length ? 'No orders match that search.' : 'Orders will appear here when customers place them.'}</div> : <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Order</th><th>Customer</th><th>Delivery Request</th><th>Items</th><th>Payment</th><th>Delivery Status</th><th>Tracking / Partner</th></tr></thead>
      <tbody>{visibleOrders.map((order) => {
        const customer = order.customerInfo || {}
        const address = order.address || {}
        const fullAddress = `${address.street || ''}, ${address.city || ''}, ${address.pincode || ''}`
        return <tr key={order.id}>
          <td><strong className="admin-order-id">{order.id}</strong><small>{new Date(order.orderDate).toLocaleString('en-IN')}</small><b>{formatINR(order.total || 0)}</b></td>
          <td><strong>{customer.fullName || '—'}</strong><small>{customer.phone || '—'}</small><small>{order.deliveryMethod || 'Standard Shipping'}</small></td>
          <td><span className="admin-address">{fullAddress}</span><small>Landmark: {address.landmark || '—'}</small><button className="copy-address" type="button" onClick={() => copyOrderAddress(order)}><Copy size={13} /> {copiedOrderId === order.id ? 'Address copied' : 'Copy Address for Porter/Dunzo'}</button></td>
          <td><div className="admin-items">{(order.items || []).map((item) => <span key={`${order.id}-${item.id}`}>{item.name} × {item.quantity}</span>)}</div><small>Subtotal {formatINR(order.subtotal || 0)} · Shipping {formatINR(order.shipping || 0)}</small></td>
          <td><strong>{order.paymentMethod || '—'}</strong><small>{order.paymentStatus || 'Pending'}</small><small>{order.paymentNotes || 'No payment notes'}</small></td>
          <td><select aria-label={`Delivery status for ${order.id}`} value={order.deliveryStatus || 'Pending'} onChange={(event) => updateOrder(order.id, { deliveryStatus: event.target.value })}><option>Pending</option><option>Packed</option><option>Dispatched</option><option>Delivered</option></select></td>
          <td>{order.deliveryStatus === 'Dispatched' ? <input className="tracking-input" aria-label={`Tracking ID or delivery partner for ${order.id}`} value={order.trackingId || ''} onChange={(event) => updateOrder(order.id, { trackingId: event.target.value })} placeholder="Tracking ID / Porter" /> : <span className="tracking-placeholder">Available when dispatched</span>}</td>
        </tr>
      })}</tbody>
    </table></div>}
  </section>
}

function CancellationPolicy({ placement }) {
  return <section className={`policy-section ${placement}`} aria-labelledby={`policy-title-${placement}`}>
    <p className="eyebrow">PLEASE READ BEFORE ORDERING</p>
    <h2 id={`policy-title-${placement}`}>Cancellation &amp; Return Policy</h2>
    <ul>
      <li><strong>Cancellation:</strong> Free cancellation is allowed before your order is dispatched.</li>
      <li><strong>After delivery:</strong> Returns or replacements are accepted within 7 days of delivery for damaged items, wrong prescription, or manufacturing defects.</li>
      <li><strong>Non-returnable:</strong> Used glasses and change-of-mind requests after delivery are non-returnable.</li>
      <li><strong>Return process:</strong> Message <a href="tel:+917045609002">+91 7045609002</a> with an unboxing video or photo to process a return.</li>
    </ul>
  </section>
}

function Contact() {
  const [sent, setSent] = useState(false)
  return <section className="contact wrap">
    <div>
      <p className="eyebrow">WE’RE ALL EARS</p>
      <h1>Let’s talk<br /><em>good frames.</em></h1>
      <p>Questions about fit, lenses, or that pair you can’t stop thinking about? We’re here for it.</p>
      <small>CALL OR WHATSAPP</small>
      <a className="contact-method" href={`tel:${whatsappNumber.replace(/\s/g, '')}`}><Phone size={14} /> +91 7045609002</a>
      <a className="whatsapp-method" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={14} /> Message us on WhatsApp</a>
      <small>EMAIL US</small>
      <a className="contact-method" href="mailto:glasseshouse1502@gmail.com">glasseshouse1502@gmail.com</a>
      <small>VISIT US</small>
      <address><MapPin size={14} /> <span>Platform No. 1, Shop No. 7,<br />Bandhan Sweet, Badlapur (W)</span></address>
      <small>OUR HOURS</small>
      <p>Monday–Friday, 9am–5pm ET</p>
    </div>
    {sent ? <div className="sent"><Check /><h2>Message received.</h2><p>Thanks for reaching out. We’ll be in touch soon.</p></div> : <form onSubmit={(event) => { event.preventDefault(); setSent(true) }}><h2>Send us a note</h2><label>Your name<input required placeholder="First and last" /></label><label>Email address<input type="email" required placeholder="you@example.com" /></label><label>What’s on your mind?<select><option>Choosing a frame</option><option>Order question</option><option>Returns & exchanges</option><option>Something else</option></select></label><label>Your message<textarea required rows="4" placeholder="Tell us a little more..." /></label><button className="button dark">Send your note <ArrowRight size={16} /></button></form>}
  </section>
}

function Footer({ navigate }) {
  return <footer className="footer">
    <div className="footer-main">
      <div><a className="wordmark" href="/" onClick={(event) => { event.preventDefault(); navigate('/') }}>glasses<span>house</span><i>.</i></a><p>A clearer kind of everyday.<br />Independent eyewear, thoughtfully made.</p><a className="footer-contact" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={14} /> +91 7045609002</a></div>
      <div><b>THE FRAMES</b>{[['Shop all', '/shop'], ['For him', '/men'], ['For her', '/women'], ['For little eyes', '/kids'], ['Sunglasses', '/sunglasses']].map(([label, href]) => <button key={href} onClick={() => navigate(href)}>{label}</button>)}</div>
      <div><b>HERE TO HELP</b><button onClick={() => navigate('/contact')}>Contact us</button><a href="mailto:glasseshouse1502@gmail.com">glasseshouse1502@gmail.com</a><a href="mailto:glasseshouse1502@gmail.com">Shipping & returns</a><a href="mailto:glasseshouse1502@gmail.com">Care guide</a></div>
      <div className="footer-address"><b>VISIT US</b><p>Platform No. 1, Shop No. 7,<br />Bandhan Sweet, Badlapur (W)</p><a href="tel:+917045609002">+91 7045609002</a></div>
    </div>
    <CancellationPolicy placement="footer-policy" />
    <div className="footer-bottom"><span>© 2026 GLASSES HOUSE</span><span>MADE FOR YOUR EVERYDAY</span><button onClick={() => navigate('/contact')}>Get in touch <ArrowRight size={14} /></button></div>
  </footer>
}

export default App
