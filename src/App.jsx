import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Import our cloud database
import { collection, addDoc, onSnapshot, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ShoppingCart, ChefHat, Trash2, Plus, Minus, CheckCircle, Clock, ArrowLeft, UtensilsCrossed, IndianRupee, Store } from 'lucide-react';

// --- MENU DATA (You can edit this later) ---
const MENU_ITEMS = [
  { id: 1, category: "Starters", name: "Chicken Tikka", price: 320, isVeg: false, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500" },
  { id: 2, category: "Starters", name: "Paneer Tikka", price: 280, isVeg: true, image: "https://images.unsplash.com/photo-1567188040754-b7955ab3752e?w=500" },
  { id: 3, category: "Main Course", name: "Butter Chicken", price: 450, isVeg: false, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500" },
  { id: 4, category: "Main Course", name: "Dal Makhani", price: 290, isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356f36?w=500" },
  { id: 5, category: "Breads", name: "Butter Naan", price: 60, isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500" },
  { id: 6, category: "Breads", name: "Garlic Naan", price: 75, isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500" }
];

// --- COMPONENTS ---

const Header = ({ view, setView, cartCount }) => (
  <header className="bg-orange-800 text-white p-4 shadow-lg sticky top-0 z-50">
    <div className="max-w-4xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('menu')}>
        <UtensilsCrossed className="h-6 w-6" />
        <h1 className="font-bold text-lg md:text-xl tracking-wide">PC's Kitchen</h1>
      </div>
      
      <div className="flex gap-4 items-center">
        {view === 'kitchen' ? (
          <button 
            onClick={() => setView('menu')}
            className="text-xs md:text-sm bg-white text-orange-800 px-4 py-2 rounded-full font-bold hover:bg-orange-50 transition shadow-sm"
          >
            Customer View
          </button>
        ) : (
          <div className="flex gap-3">
             <button 
              onClick={() => setView('kitchen')}
              className="text-xs md:text-sm bg-orange-900/50 text-white px-3 py-1 rounded-full border border-orange-700 hover:bg-orange-900 transition flex items-center gap-1 backdrop-blur-sm"
            >
              <ChefHat size={14} /> Kitchen
            </button>
            <button 
              onClick={() => setView('cart')}
              className="relative p-2 hover:bg-orange-700 rounded-full transition"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-orange-900 text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-orange-800">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  </header>
);

const KitchenDisplay = ({ activeOrders, markOrderPaid }) => {
  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Store className="text-orange-600" /> Kitchen Orders (Live)
        </h2>
        <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
          Pending Orders: {activeOrders.length}
        </span>
      </div>

      {activeOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300 shadow-sm">
          <ChefHat className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">All caught up! No pending orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg border-l-8 border-orange-500 overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
              <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">Table {order.tableNo}</h3>
                  <span className="text-sm text-gray-500 flex items-center gap-1 font-mono mt-1">
                    <Clock size={14} /> 
                    {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                  </span>
                </div>
                <div className="text-right">
                   <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded border border-yellow-200 uppercase tracking-wide">
                     {order.status}
                   </span>
                </div>
              </div>
              
              <div className="p-4 max-h-64 overflow-y-auto">
                <ul className="space-y-3">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b border-dashed border-gray-100 pb-2 last:border-0 last:pb-0">
                      <div className="flex gap-3 items-center">
                        <span className="font-bold text-gray-800 bg-gray-100 h-8 w-8 flex items-center justify-center rounded-lg text-sm border border-gray-200 shadow-sm">
                          {item.qty}
                        </span>
                        <div>
                          <p className={`font-medium ${item.isVeg ? 'text-green-700' : 'text-red-700'}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400">₹{item.price}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-600">₹{item.price * item.qty}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center font-bold text-gray-800">
                    <span>Total Bill:</span>
                    <span className="text-lg">₹{order.totalAmount}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t flex flex-col gap-2">
                <button 
                  onClick={() => markOrderPaid(order.id)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex justify-center items-center gap-2 shadow-md active:transform active:translate-y-1"
                >
                  <IndianRupee size={18} /> Payment Received & Done
                </button>
                <p className="text-center text-xs text-gray-400">Clicking this removes order from view</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [view, setView] = useState('menu'); 
  const [cart, setCart] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [currentTable, setCurrentTable] = useState(4); // Hardcoded for demo
  const [isOrdering, setIsOrdering] = useState(false);

  // 1. LISTEN TO FIRESTORE (Real-time connection)
  useEffect(() => {
    // We query the 'orders' collection, sorted by time
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    // onSnapshot runs every time the database changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Only show orders that are NOT completed
      setActiveOrders(orders.filter(o => o.status !== 'completed'));
    });

    return () => unsubscribe(); // Cleanup connection when app closes
  }, []);

  // Add Item to Cart
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, qty: Math.max(0, item.qty + delta) };
      return item;
    }).filter(item => item.qty > 0));
  };

  // 2. PLACE ORDER (Send to Cloud)
  const placeOrder = async () => {
    setIsOrdering(true);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    try {
      await addDoc(collection(db, "orders"), {
        tableNo: currentTable,
        items: cart,
        totalAmount: totalAmount,
        status: 'pending', // pending -> completed
        createdAt: serverTimestamp(), // Uses Google's Server Time
      });
      
      setCart([]);
      setView('success');
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
    setIsOrdering(false);
  };

  // 3. COMPLETE ORDER (Kitchen Action)
  const markOrderPaid = async (orderId) => {
    if(window.confirm("Confirm payment received and clear order?")) {
      try {
        const orderRef = doc(db, "orders", orderId);
        // We update status to 'completed' so it vanishes from the list (due to our filter above)
        await updateDoc(orderRef, {
          status: 'completed'
        });
      } catch (error) {
        console.error("Error updating order:", error);
      }
    }
  };

  // View Components
  const Menu = () => (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 flex items-start gap-4 mt-4 shadow-sm">
        <div className="bg-white p-3 rounded-full shadow-md text-orange-600">
           <Store size={24} />
        </div>
        <div>
           <h2 className="font-bold text-orange-900 text-lg">Welcome to PC's Kitchen</h2>
           <p className="text-sm text-orange-700">Table #{currentTable} • Digital Menu</p>
        </div>
      </div>

      {["Starters", "Main Course", "Breads"].map(cat => (
        <div key={cat} className="mb-8">
          <h2 className="text-xl font-extrabold mb-4 text-gray-800 flex items-center">
            <span className="w-2 h-8 bg-orange-600 rounded-r-lg mr-3"></span>
            {cat}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MENU_ITEMS.filter(item => item.category === cat).map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden">
                <div className="w-32 h-32 relative flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-800 leading-tight">{item.name}</h3>
                      <div className={`w-4 h-4 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} p-[2px] flex items-center justify-center flex-shrink-0 ml-2`}>
                        <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">₹{item.price}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(item)}
                    className="self-end bg-orange-100 text-orange-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-200 transition active:scale-95 flex items-center gap-1"
                  >
                    ADD <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {cart.length > 0 && (
         <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40">
            <button 
                onClick={() => setView('cart')}
                className="bg-orange-800 text-white px-8 py-3 rounded-full shadow-2xl font-bold flex items-center gap-3 animate-bounce hover:bg-orange-900 transition"
            >
                <span>{cart.reduce((a, b) => a + b.qty, 0)} Items</span>
                <span className="w-1 h-4 bg-orange-600/50 rounded-full"></span>
                <span>View Cart</span>
            </button>
        </div>
      )}
    </div>
  );

  const CartView = () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    return (
      <div className="max-w-xl mx-auto p-4 bg-gray-50 min-h-screen">
        <button onClick={() => setView('menu')} className="flex items-center text-gray-500 mb-6 hover:text-orange-600 font-medium">
          <ArrowLeft size={18} className="mr-1" /> Back to Menu
        </button>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">Your Order</h2>

        {cart.length === 0 ? (
            <p>Cart is empty</p>
        ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 space-y-6">
                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <p className="text-xs text-gray-400">₹{item.price}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600"><Minus size={14} /></button>
                                <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-green-600"><Plus size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                    <div className="flex justify-between text-xl font-bold text-gray-800 mb-6">
                        <span>Total Pay</span>
                        <span>₹{total}</span>
                    </div>
                    <button 
                        onClick={placeOrder}
                        disabled={isOrdering}
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {isOrdering ? 'Placing Order...' : 'Place Order'}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">Pay cash at counter after dining</p>
                </div>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Header view={view} setView={setView} cartCount={cart.reduce((a, b) => a + b.qty, 0)} />
      <main className="pt-2">
        {view === 'menu' && <Menu />}
        {view === 'cart' && <CartView />}
        {view === 'kitchen' && <KitchenDisplay activeOrders={activeOrders} markOrderPaid={markOrderPaid} />}
        {view === 'success' && (
          <div className="flex flex-col items-center justify-center pt-24 px-4 text-center">
            <div className="bg-green-100 p-6 rounded-full mb-6 animate-pulse">
                <CheckCircle className="text-green-600 w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Sent to Kitchen!</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">Sit back and relax. Your food will be served at Table #{currentTable}.</p>
            <button onClick={() => setView('menu')} className="text-orange-600 font-bold hover:underline">Order More Items</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;