import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, setDoc, query, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';
import { ShoppingCart, ChefHat, Plus, Minus, CheckCircle, Clock, ArrowLeft, UtensilsCrossed, IndianRupee, Store, Lock, QrCode, Package, LogOut, ClipboardList, Receipt, Utensils, AlertTriangle, Ban, Info, XCircle } from 'lucide-react';

// --- FIREBASE CONFIGURATION ---

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- MENU DATA ---
const MENU_ITEMS = [
  // --- STARTERS ---
  { id: 101, category: "Starters", name: "Fish Fry (01 pc)", price: 90, isVeg: false, image: "/dishes/fish-fry.avif" },
  { id: 102, category: "Starters", name: "Egg Boil Fry (2 eggs)", price: 60, isVeg: false, image: "/dishes/egg-fry.avif" },
  { id: 103, category: "Starters", name: "Chicken Tikka", isVeg: false, image: "/dishes/chicken-tikka.avif", price: 130, variants: [{ name: "Half (6pcs)", price: 130 }, { name: "Full (12pcs)", price: 220 }] },
  { id: 105, category: "Starters", name: "Afghani Chicken Tikka", isVeg: false, image: "/dishes/afghani-tikka.avif", price: 130, variants: [{ name: "Half", price: 130 }, { name: "Full", price: 220 }] },
  { id: 107, category: "Starters", name: "Prawns Fry (12 pcs)", price: 270, isVeg: false, image: "/dishes/prawns.avif" },
  { id: 108, category: "Starters", name: "Mutton Kaleji Fry", isVeg: false, image: "/dishes/mutton-kaleji.avif", price: 150, variants: [{ name: "Half", price: 150 }, { name: "Full", price: 240 }] },

  // --- EGG SPECIALS ---
  { id: 201, category: "Egg Specials", name: "Omelette (2 Eggs)", price: 70, isVeg: false, image: "/dishes/omelette.avif" },
  { id: 202, category: "Egg Specials", name: "Egg Bhurji (2 Eggs)", price: 100, isVeg: false, image: "/dishes/egg-bhurji.avif" },
  { id: 203, category: "Egg Specials", name: "Egg Pulao", price: 120, isVeg: false, image: "/dishes/egg-pulao.avif" },
  { id: 204, category: "Egg Specials", name: "Boil Tikka Masala", price: 120, isVeg: false, image: "/dishes/boil-tikka.avif" },
  { id: 206, category: "Egg Specials", name: "Egg Curry", price: 160, isVeg: false, image: "/dishes/egg-curry.avif" },

  // --- MAIN COURSE ---
  { id: 301, category: "Main Course", name: "Chicken Masala", isVeg: false, image: "/dishes/chicken-masala.avif", price: 120, variants: [{ name: "Half", price: 120 }, { name: "Full", price: 220 }] },
  { id: 303, category: "Main Course", name: "Sp. Chicken Masala", isVeg: false, image: "/dishes/sp-chicken.avif", price: 160, variants: [{ name: "Half", price: 160 }, { name: "Full", price: 250 }] },
  { id: 305, category: "Main Course", name: "Butter Chicken", price: 270, isVeg: false, image: "/dishes/butter-chicken.avif" },
  { id: 306, category: "Main Course", name: "Fish Masala", price: 200, isVeg: false, image: "/dishes/fish-masala.avif" },
  { id: 307, category: "Main Course", name: "Prawns Masala", price: 300, isVeg: false, image: "/dishes/prawns-masala.avif" },
  { id: 308, category: "Main Course", name: "Mutton Kheema", isVeg: false, image: "/dishes/mutton-kheema.avif", price: 220, variants: [{ name: "Half", price: 220 }, { name: "Full", price: 350 }] },
  { id: 310, category: "Main Course", name: "Mutton Masala", isVeg: false, image: "/dishes/mutton-masala.avif", price: 260, variants: [{ name: "Half", price: 260 }, { name: "Full", price: 410 }] },

  // --- BREADS & RICE ---
  { id: 401, category: "Breads & Rice", name: "Roti (Plain)", price: 15, isVeg: true, image: "/dishes/roti.avif" },
  { id: 402, category: "Breads & Rice", name: "Roti (Butter)", price: 20, isVeg: true, image: "/dishes/butter-roti.avif" },
  { id: 403, category: "Breads & Rice", name: "Makai Rotlo", price: 40, isVeg: true, image: "/dishes/rotlo.avif" },
  { id: 404, category: "Breads & Rice", name: "Plain Rice", isVeg: true, image: "/dishes/rice.avif", price: 40, variants: [{ name: "Half", price: 40 }, { name: "Full", price: 60 }] },
  { id: 406, category: "Breads & Rice", name: "Jeera Rice", isVeg: true, image: "/dishes/jeera-rice.avif", price: 60, variants: [{ name: "Half", price: 60 }, { name: "Full", price: 90 }] },
  { id: 408, category: "Breads & Rice", name: "Roasted Papad", price: 10, isVeg: true, image: "/dishes/papad.avif" },
];

// --- COMPONENTS ---

const Header = ({ view, setView, cartCount, currentTable, isStaff, logout, storeSettings }) => (
  <header className="bg-teal-800 text-white shadow-lg sticky top-0 z-50">
    {/* RUSH MODE BANNER */}
    {storeSettings?.rushMode && (
        <div className="bg-red-600 text-white text-xs md:text-sm font-bold p-2 text-center flex items-center justify-center gap-2 animate-pulse">
            <AlertTriangle size={16} /> 
            Restaurant is in RUSH MODE. Orders may take longer than usual.
        </div>
    )}
    
    <div className="p-4 max-w-4xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => isStaff ? setView('staff-dashboard') : setView('menu')}>
        <UtensilsCrossed className="h-6 w-6" />
        <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-tight tracking-wide font-serif">PC's Kitchen</h1>
            {currentTable && view === 'menu' && (
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${currentTable.toString().startsWith('PARCEL') ? 'bg-yellow-400 text-teal-900' : 'text-teal-200'}`}>
                  {isStaff ? `Staff Mode: ${currentTable}` : (currentTable.toString().startsWith('PARCEL') ? '📦 Takeaway' : `Table ${currentTable}`)}
                </span>
            )}
        </div>
      </div>
      
      <div className="flex gap-3 items-center">
        {isStaff ? (
             <>
               {view !== 'staff-dashboard' && (
                 <button onClick={() => setView('staff-dashboard')} className="text-xs bg-teal-900 px-3 py-1.5 rounded border border-teal-600">
                    Dashboard
                 </button>
               )}
               <button onClick={logout} className="p-2 bg-red-800/80 rounded hover:bg-red-700">
                  <LogOut size={16} />
               </button>
             </>
        ) : (
          <button 
            onClick={() => setView('cart')}
            className="relative p-2 hover:bg-teal-700 rounded-full transition"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-teal-900 text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-teal-800">
                {cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  </header>
);

const StaffDashboard = ({ setView, setCurrentTable, storeSettings, toggleRushMode }) => {
    const [manualTable, setManualTable] = useState('');

    const startManualOrder = () => {
        if(!manualTable) return alert("Enter Table Number");
        setCurrentTable(manualTable);
        setView('menu');
    };

    const startParcelOrder = () => {
        const uniqueId = `PARCEL-${Math.floor(1000 + Math.random() * 9000)}`;
        setCurrentTable(uniqueId);
        setView('menu');
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ChefHat className="text-teal-600" /> Staff Dashboard
            </h2>

            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Live Controls</h3>
                <div className="flex gap-4">
                    <button 
                        onClick={toggleRushMode}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm ${storeSettings.rushMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                        <AlertTriangle size={18} /> {storeSettings.rushMode ? 'Rush Mode ON' : 'Rush Mode OFF'}
                    </button>
                    <button 
                        onClick={() => setView('manage-menu')}
                        className="flex-1 py-3 px-4 rounded-lg font-bold bg-teal-100 text-teal-800 flex items-center justify-center gap-2 hover:bg-teal-200 shadow-sm"
                    >
                        <Ban size={18} /> Out of Stock
                    </button>
                </div>
            </div>

            <div className="grid gap-4 max-w-md mx-auto">
                <button 
                    onClick={() => setView('kitchen')}
                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-teal-600 flex items-center justify-between group hover:bg-teal-50 transition"
                >
                    <div className="text-left">
                        <h3 className="font-bold text-xl text-gray-800">Kitchen Display</h3>
                        <p className="text-sm text-gray-500">Live KDS System</p>
                    </div>
                    <Store className="text-teal-600" size={32} />
                </button>

                <button 
                    onClick={() => setView('bills')}
                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600 flex items-center justify-between group hover:bg-blue-50 transition"
                >
                    <div className="text-left">
                        <h3 className="font-bold text-xl text-gray-800">Active Bills</h3>
                        <p className="text-sm text-gray-500">Settle & Clear Tables</p>
                    </div>
                    <Receipt className="text-blue-600" size={32} />
                </button>

                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                        <ClipboardList className="text-orange-500" /> Manual Order
                    </h3>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Table No" 
                            className="flex-1 border p-3 rounded-lg text-lg outline-none focus:border-orange-500"
                            value={manualTable}
                            onChange={(e) => setManualTable(e.target.value)}
                        />
                        <button onClick={startManualOrder} className="bg-orange-600 text-white px-6 rounded-lg font-bold hover:bg-orange-700">GO</button>
                    </div>
                </div>
                
                 <button 
                    onClick={startParcelOrder}
                    className="bg-yellow-400 p-4 rounded-xl shadow-md flex items-center justify-center gap-2 font-bold text-teal-900 hover:bg-yellow-500"
                >
                    <Package /> New Parcel / Takeaway
                </button>
            </div>
        </div>
    );
};

// --- STOCK MANAGEMENT VIEW ---
const ManageMenuView = ({ setView, storeSettings, toggleStock }) => {
    return (
        <div className="max-w-2xl mx-auto p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('staff-dashboard')} className="p-2 bg-gray-200 rounded-full"><ArrowLeft size={20}/></button>
                <h2 className="text-2xl font-bold text-gray-800">Manage Stock (86 List)</h2>
            </div>
            <p className="mb-4 text-sm text-gray-500">Tap items to mark them as Out of Stock.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MENU_ITEMS.map(item => {
                    const isUnavailable = storeSettings.unavailable?.includes(item.id);
                    return (
                        <div 
                            key={item.id} 
                            onClick={() => toggleStock(item.id)}
                            className={`p-4 rounded-lg border flex justify-between items-center cursor-pointer transition ${isUnavailable ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}`}
                        >
                            <span className={`font-bold ${isUnavailable ? 'text-red-700 line-through' : 'text-gray-800'}`}>{item.name}</span>
                            {isUnavailable ? <Ban className="text-red-600" size={20} /> : <CheckCircle className="text-green-400" size={20} />}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// --- BILL VIEW ---
const BillView = ({ activeOrders, settleTable }) => {
    const tables = {};
    activeOrders.forEach(order => {
        const table = order.tableNo;
        if (!tables[table]) tables[table] = { tableNo: table, totalAmount: 0, orders: [] };
        tables[table].totalAmount += order.totalAmount;
        tables[table].orders.push(order);
    });

    const sortedTables = Object.values(tables).sort((a,b) => {
        return String(a.tableNo).localeCompare(String(b.tableNo), undefined, { numeric: true });
    });

    return (
        <div className="max-w-4xl mx-auto p-4 pb-24">
             <div className="flex items-center gap-2 mb-6">
                <Receipt className="text-blue-600" size={28} /> 
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Active Bills</h2>
                    <p className="text-sm text-gray-500">Settle a table to clear it.</p>
                </div>
            </div>

            {sortedTables.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl">No active bills.</div>
            ) : (
                <div className="grid gap-6">
                    {sortedTables.map((t) => (
                        <div key={t.tableNo} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col ${t.tableNo.toString().startsWith('PARCEL') ? 'border-yellow-400' : 'border-gray-200'}`}>
                            <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-800">
                                        {t.tableNo.toString().startsWith('PARCEL') ? t.tableNo : `Table ${t.tableNo}`}
                                    </h3>
                                    <p className="text-xs text-gray-500">{t.orders.length} Tickets</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-green-700">₹{t.totalAmount}</div>
                                </div>
                            </div>
                            
                            <div className="p-4 flex-grow space-y-2">
                                {t.orders.map((order, i) => (
                                    // RESTORED GREEN GLOW LOGIC HERE
                                    <div key={order.id} className={`border-b pb-2 last:border-0 p-2 rounded ${order.status === 'served' ? 'bg-green-50 border border-green-200 shadow-sm' : ''}`}>
                                        <div className="font-bold text-[10px] text-gray-400 flex justify-between items-center">
                                            <span>TICKET #{order.id.slice(-4)}</span>
                                            {order.status === 'served' ? (
                                                <span className="text-green-700 flex items-center gap-1"><CheckCircle size={10}/> SERVED</span>
                                            ) : (
                                                <span className="text-orange-500 flex items-center gap-1"><Clock size={10}/> COOKING</span>
                                            )}
                                        </div>
                                        {order.note && <div className="text-red-500 text-xs font-bold mt-1">NOTE: {order.note}</div>}
                                        
                                        <div className="mt-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm text-gray-700">
                                                    <span>{item.qty} x {item.name} {item.variant && `(${item.variant})`}</span>
                                                    <span>₹{item.price * item.qty}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-gray-50 border-t mt-auto">
                                <button 
                                    onClick={() => settleTable(t.orders)}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-md flex justify-center items-center gap-2"
                                >
                                    <IndianRupee size={20} /> Settle Bill
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- KITCHEN DISPLAY ---
const KitchenDisplay = ({ activeOrders, updateOrderStatus }) => {
  const kitchenOrders = activeOrders.filter(o => o.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Store className="text-teal-600" /> Kitchen Display
        </h2>
        <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
          To Cook: {kitchenOrders.length}
        </span>
      </div>

      {kitchenOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300 shadow-sm">
          <ChefHat className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Kitchen is clear!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenOrders.map((order) => (
            <div key={order.id} className={`bg-white rounded-xl shadow-lg border-l-8 overflow-hidden relative ${order.tableNo.toString().startsWith('PARCEL') ? 'border-yellow-400' : 'border-teal-500'}`}>
              
              {order.tableNo.toString().startsWith('PARCEL') && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-teal-900 text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                  <Package size={12} /> {order.tableNo}
                </div>
              )}

              <div className="bg-gray-50 p-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-xl text-gray-800">
                    {order.tableNo.toString().startsWith('PARCEL') ? '📦 Takeaway' : `Table ${order.tableNo}`}
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">
                    <Clock size={12} className="inline mr-1"/> 
                    {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                  </span>
                </div>
                {order.note && (
                    <div className="bg-red-50 text-red-700 p-2 rounded text-sm font-bold border border-red-200">
                        NOTE: {order.note}
                    </div>
                )}
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
                          <p className={`font-medium ${item.isVeg !== false ? 'text-green-700' : 'text-red-700'}`}>
                            {item.name}
                            {item.variant && <span className="ml-1 text-xs text-gray-500 font-normal">({item.variant})</span>}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-gray-50 border-t">
                <button 
                  onClick={() => updateOrderStatus(order.id, 'served')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex justify-center items-center gap-2 shadow-md active:scale-95"
                >
                  <Utensils size={18} /> Mark Served
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MenuCard = ({ item, addToCart, unavailable }) => {
  const [selectedVariant, setSelectedVariant] = useState(item.variants ? item.variants[0] : null);

  const handleAdd = () => {
    if(unavailable) return;
    if (selectedVariant) {
        const variantItem = {
            ...item,
            id: `${item.id}-${selectedVariant.name}`,
            name: `${item.name} (${selectedVariant.name})`,
            price: selectedVariant.price,
            variant: selectedVariant.name
        };
        addToCart(variantItem);
    } else {
        addToCart(item);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden relative ${unavailable ? 'opacity-60 grayscale' : ''}`}>
        
        {unavailable && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded shadow-lg transform -rotate-12">OUT OF STOCK</span>
            </div>
        )}

        <div className="w-28 h-auto md:w-32 md:h-auto relative flex-shrink-0 bg-gray-100">
            <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover"
                onError={(e) => {e.target.src = 'https://placehold.co/100x100?text=PC'}} 
            />
        </div>
        <div className="p-3 flex flex-col flex-grow justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 leading-tight text-sm md:text-base">{item.name}</h3>
                    <div className={`w-4 h-4 border ${item.isVeg !== false ? 'border-green-600' : 'border-red-600'} p-[2px] flex items-center justify-center flex-shrink-0 ml-2`}>
                        <div className={`w-full h-full rounded-full ${item.isVeg !== false ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    </div>
                </div>
                
                {item.variants ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {item.variants.map((v) => (
                            <button 
                                key={v.name}
                                onClick={() => setSelectedVariant(v)}
                                className={`text-[10px] px-2 py-1 rounded border ${selectedVariant.name === v.name ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300'}`}
                            >
                                {v.name}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-xs mt-1 font-bold">₹{item.price}</p>
                )}
            </div>
            
            <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-teal-800">
                    ₹{selectedVariant ? selectedVariant.price : item.price}
                </span>
                <button 
                    onClick={handleAdd}
                    disabled={unavailable}
                    className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-100 transition active:scale-95 flex items-center gap-1 border border-teal-200"
                >
                    ADD <Plus size={12} />
                </button>
            </div>
        </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [view, setView] = useState('loading'); 
  const [cart, setCart] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]); 
  const [currentTable, setCurrentTable] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [kitchenPassword, setKitchenPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  
  // STORE SETTINGS STATE
  const [storeSettings, setStoreSettings] = useState({ rushMode: false, unavailable: [] });

  const audioRef = useRef(null);
  const prevPendingCount = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
        if(tableParam === 'PARCEL') {
             const uniqueId = `PARCEL-${Math.floor(1000 + Math.random() * 9000)}`;
             setCurrentTable(uniqueId);
        } else {
             setCurrentTable(tableParam);
        }
        setIsStaff(false);
        setView('menu');
    } else {
        setIsStaff(false);
        setView('login');
    }
  }, []);

  // LISTEN TO SETTINGS - NOW WITH INSTANT UPDATES
  useEffect(() => {
      const unsub = onSnapshot(doc(db, "settings", "store"), (doc) => {
          if (doc.exists()) {
              setStoreSettings(doc.data());
          } else {
              setDoc(doc.ref, { rushMode: false, unavailable: [] });
          }
      });
      return () => unsub();
  }, []);

  // LISTEN TO ORDERS
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const liveOrders = orders.filter(o => o.status !== 'paid');
      setActiveOrders(liveOrders);

      const pendingCount = liveOrders.filter(o => o.status === 'pending').length;
      if (pendingCount > prevPendingCount.current) {
          if(audioRef.current) audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      prevPendingCount.current = pendingCount;
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, qty: Math.max(0, item.qty + delta) };
      return item;
    }).filter(item => item.qty > 0));
  };

  const placeOrder = async () => {
    if (!currentTable) return;
    setIsOrdering(true);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    try {
      await addDoc(collection(db, "orders"), {
        tableNo: currentTable, 
        items: cart,
        totalAmount: totalAmount,
        status: 'pending',
        note: orderNote, 
        createdAt: serverTimestamp(),
      });
      setCart([]);
      setOrderNote('');
      setView('success');
      
      if(isStaff) {
          setTimeout(() => {
              setView('staff-dashboard');
              setCurrentTable(null);
          }, 2000);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order.");
    }
    setIsOrdering(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
      try {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      } catch (error) {
        console.error("Error:", error);
      }
  };

  const settleTable = async (tableOrders) => {
      const total = tableOrders.reduce((acc, order) => acc + order.totalAmount, 0);
      if(!window.confirm(`Settle bill? Total: ₹${total}`)) return;

      try {
          await Promise.all(tableOrders.map(order => 
              updateDoc(doc(db, "orders", order.id), { status: 'paid' })
          ));
      } catch(error) {
          console.error("Error settling table:", error);
          alert("Failed to settle table.");
      }
  };

  // ADMIN CONTROLS
  const toggleRushMode = async () => {
      const newMode = !storeSettings.rushMode;
      // Optimistic Update
      setStoreSettings(prev => ({...prev, rushMode: newMode}));
      await updateDoc(doc(db, "settings", "store"), { rushMode: newMode });
  };

  const toggleStock = async (itemId) => {
      let list = storeSettings.unavailable || [];
      if(list.includes(itemId)) {
          list = list.filter(id => id !== itemId);
      } else {
          list.push(itemId);
      }
      // Optimistic Update
      setStoreSettings(prev => ({...prev, unavailable: list}));
      await updateDoc(doc(db, "settings", "store"), { unavailable: list });
  };

  const handleLogin = () => {
      if(kitchenPassword === '1234') { 
          setIsStaff(true);
          setView('staff-dashboard');
          setKitchenPassword('');
      } else {
          alert("Wrong Password!");
      }
  };

  const handleLogout = () => {
      setIsStaff(false);
      setView('login');
      setCurrentTable(null);
  };

  // --- VIEWS ---
  if (view === 'loading') return <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold">Loading PC's Kitchen...</div>;

  if (view === 'login') return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
          <audio ref={audioRef} src="/bell.mp3" preload="auto" />
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
              <div className="flex justify-center mb-4">
                  <div className="bg-teal-100 p-3 rounded-full">
                      <Lock className="text-teal-700" size={24} />
                  </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-1 text-gray-800">Staff Login</h2>
              <input 
                type="password" 
                placeholder="PIN" 
                className="w-full border-2 border-gray-200 p-3 rounded-lg text-center text-2xl tracking-widest mb-6 focus:border-teal-500 focus:outline-none"
                value={kitchenPassword}
                onChange={(e) => setKitchenPassword(e.target.value)}
              />
              <button onClick={handleLogin} className="w-full bg-teal-800 text-white py-3 rounded-lg font-bold hover:bg-teal-900 transition shadow-lg">
                  Access Dashboard
              </button>
          </div>
      </div>
  );

  if (view === 'staff-dashboard') return (
      <>
        <audio ref={audioRef} src="/bell.mp3" preload="auto" />
        <Header view={view} setView={setView} cartCount={0} currentTable={null} isStaff={true} logout={handleLogout} storeSettings={storeSettings} />
        <StaffDashboard setView={setView} setCurrentTable={setCurrentTable} storeSettings={storeSettings} toggleRushMode={toggleRushMode} />
      </>
  );

  if (view === 'manage-menu') return (
      <>
        <Header view={view} setView={setView} cartCount={0} currentTable={null} isStaff={true} logout={handleLogout} storeSettings={storeSettings} />
        <ManageMenuView setView={setView} storeSettings={storeSettings} toggleStock={toggleStock} />
      </>
  );

  if (view === 'bills') return (
      <>
        <Header view={view} setView={setView} cartCount={0} currentTable={null} isStaff={true} logout={handleLogout} storeSettings={storeSettings} />
        <BillView activeOrders={activeOrders} settleTable={settleTable} />
      </>
  );

  if (view === 'kitchen') return (
     <>
        <audio ref={audioRef} src="/bell.mp3" preload="auto" />
        <Header view={view} setView={setView} cartCount={0} currentTable={null} isStaff={true} logout={handleLogout} storeSettings={storeSettings} />
        <KitchenDisplay activeOrders={activeOrders} updateOrderStatus={updateOrderStatus} />
     </>
  );

  // MENU
  if (view === 'menu') return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Header view={view} setView={setView} cartCount={cart.reduce((a, b) => a + b.qty, 0)} currentTable={currentTable} isStaff={isStaff} logout={handleLogout} storeSettings={storeSettings} />
      <main className="pt-4 max-w-4xl mx-auto px-4 pb-20">
        {isStaff && (
            <div className="bg-orange-100 border-l-4 border-orange-500 p-3 mb-4 rounded shadow-sm flex justify-between items-center">
                <div>
                    <p className="font-bold text-orange-800 text-sm">Waiter Mode Active</p>
                    <p className="text-xs text-orange-700">Taking order for {currentTable}</p>
                </div>
                <button onClick={() => setView('staff-dashboard')} className="text-xs bg-white px-3 py-1 rounded border border-orange-200">Cancel</button>
            </div>
        )}
        {["Starters", "Egg Specials", "Main Course", "Breads & Rice"].map(cat => (
            <div key={cat} className="mb-8">
            <h2 className="text-xl font-extrabold mb-4 text-gray-800 flex items-center">
                <span className="w-2 h-8 bg-teal-600 rounded-r-lg mr-3"></span>
                {cat}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MENU_ITEMS.filter(item => item.category === cat).map(item => (
                <MenuCard 
                    key={item.id} 
                    item={item} 
                    addToCart={addToCart} 
                    unavailable={storeSettings.unavailable?.includes(item.id)} 
                />
                ))}
            </div>
            </div>
        ))}
        {cart.length > 0 && (
            <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40">
                <button 
                    onClick={() => setView('cart')}
                    className="bg-teal-800 text-white px-8 py-3 rounded-full shadow-2xl font-bold flex items-center gap-3 animate-bounce hover:bg-teal-900 transition border-2 border-white"
                >
                    <span>{cart.reduce((a, b) => a + b.qty, 0)} Items</span>
                    <span className="w-1 h-4 bg-teal-600/50 rounded-full"></span>
                    <span>View Cart</span>
                </button>
            </div>
        )}
      </main>
    </div>
  );

  if (view === 'cart') {
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      return (
        <div className="min-h-screen bg-gray-50">
           <Header view={view} setView={setView} cartCount={cart.reduce((a, b) => a + b.qty, 0)} currentTable={currentTable} isStaff={isStaff} logout={handleLogout} storeSettings={storeSettings} />
           <div className="max-w-xl mx-auto p-4">
                <button onClick={() => setView('menu')} className="flex items-center text-gray-500 mb-6 hover:text-teal-600 font-medium">
                <ArrowLeft size={18} className="mr-1" /> Back to Menu
                </button>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                    {currentTable.toString().startsWith('PARCEL') ? '📦 Parcel Order' : `Table ${currentTable} Order`}
                </h2>
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
                        
                        {/* COOKING INSTRUCTIONS */}
                        <div className="p-4 bg-yellow-50 border-t border-yellow-100">
                            <label className="text-xs font-bold text-yellow-800 uppercase mb-2 block flex items-center gap-1">
                                <Info size={12}/> Cooking Instructions
                            </label>
                            <textarea 
                                placeholder="E.g. Less spicy, No onion, Extra lemon..." 
                                className="w-full p-2 border border-yellow-300 rounded text-sm focus:outline-none focus:border-yellow-500 bg-white"
                                rows="2"
                                value={orderNote}
                                onChange={(e) => setOrderNote(e.target.value)}
                            ></textarea>
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
                                {isOrdering ? 'Placing...' : (isStaff ? 'Create Ticket' : 'Confirm Order')}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3">{isStaff ? 'Creates a new KOT ticket' : 'Payment at Counter'}</p>
                        </div>
                    </div>
                )}
           </div>
        </div>
      );
  }

  if (view === 'success') return (
      <div className="flex flex-col items-center justify-center pt-24 px-4 text-center min-h-screen bg-gray-50">
        <div className="bg-green-100 p-6 rounded-full mb-6 animate-pulse">
            <CheckCircle className="text-green-600 w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Created!</h2>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            {isStaff 
                ? "New ticket added to Kitchen Display." 
                : "Sit back! Food is coming."}
        </p>
        <button onClick={() => isStaff ? setView('staff-dashboard') : setView('menu')} className="text-teal-600 font-bold hover:underline">
            {isStaff ? 'Back to Dashboard' : 'Order More Items'}
        </button>
      </div>
  );

  return null;
};

export default App;