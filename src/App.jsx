import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, setDoc, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ShoppingCart, ChefHat, Plus, Minus, CheckCircle, Clock, ArrowLeft, UtensilsCrossed, IndianRupee, Store, Lock, QrCode, Package, LogOut, ClipboardList, Receipt, Utensils, AlertTriangle, Ban, Info, Power, Trash2, Edit, X, XCircle, TrendingUp, Calendar, DollarSign, BarChart3 } from 'lucide-react';

// --- FIREBASE CONFIG ---
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
  { id: 105, category: "Starters", name: "Afghani Chicken Tikka", isVeg: false, image: "/dishes/afghani-tikka.avif", price: 130, variants: [{ name: "Half (6pcs)", price: 130 }, { name: "Full (12pcs)", price: 220 }] },
  { id: 107, category: "Starters", name: "Prawns Fry (12 pcs)", price: 270, isVeg: false, image: "/dishes/prawns.avif" },
  { id: 108, category: "Starters", name: "Mutton Kaleji Fry", isVeg: false, image: "/dishes/mutton-kaleji.avif", price: 150, variants: [{ name: "Half (4pcs)", price: 150 }, { name: "Full (8pcs)", price: 240 }] },

  // --- EGG SPECIALS ---
  { id: 201, category: "Egg Specials", name: "Omelette (2 Eggs)", price: 70, isVeg: false, image: "/dishes/omelette.avif" },
  { id: 202, category: "Egg Specials", name: "Chicken Rassa Omelette", price: 100, isVeg: false, image: "/dishes/chicken-rassa-omelette.avif" },
  { id: 203, category: "Egg Specials", name: "Mutton Rassa Omelette", price: 120, isVeg: false, image: "/dishes/mutton-rassa-omelette.avif" },
  { id: 204, category: "Egg Specials", name: "Egg Bhurji (2 Eggs)", price: 100, isVeg: false, image: "/dishes/egg-bhurji.avif" },
  { id: 208, category: "Egg Specials", name: "Boil Bhurji (2 Eggs)", price: 120, isVeg: false, image: "/dishes/boil-bhurji.avif" },
  { id: 205, category: "Egg Specials", name: "Egg Pulao", price: 120, isVeg: false, image: "/dishes/egg-pulao.avif" },
  { id: 206, category: "Egg Specials", name: "Boil Tikka Masala (2 Eggs)", price: 120, isVeg: false, image: "/dishes/boil-tikka.avif" },
  { id: 207, category: "Egg Specials", name: "Egg Curry (2 Eggs)", price: 160, isVeg: false, image: "/dishes/egg-curry.avif" },

  // --- THALI ---
  { id: 501, category: "Lunch Specials (Thali)", name: "Chicken Thali", price: 170, isVeg: false, image: "/dishes/chicken-thali.avif", isLunchOnly: true },
  { id: 502, category: "Lunch Specials (Thali)", name: "Egg Thali", price: 170, isVeg: false, image: "/dishes/egg-thali.avif", isLunchOnly: true },
  { id: 503, category: "Lunch Specials (Thali)", name: "Fish Thali", price: 200, isVeg: false, image: "/dishes/fish-thali.jpg", isLunchOnly: true },

  // --- MAIN COURSE ---
  { id: 301, category: "Main Course", name: "Chicken Masala", isVeg: false, image: "/dishes/chicken-masala.avif", price: 120, variants: [{ name: "Half", price: 120, desc: "2 thigh pc, thin gravy" }, { name: "Full", price: 220, desc: "1 leg, 2 thigh, thin gravy" }] },
  { id: 303, category: "Main Course", name: "Sp. Chicken Masala (Thick Gravy)", isVeg: false, image: "/dishes/sp-chicken.avif", price: 180, variants: [{ name: "Half", price: 180, desc: "2 thigh, thick gravy" }, { name: "Full", price: 270, desc: "1 leg, 2 thigh, thick gravy" }] },
  { id: 305, category: "Main Course", name: "Butter Chicken", price: 270, isVeg: false, image: "/dishes/butter-chicken.avif", description: "6 pc boneless, gravy" },
  { id: 306, category: "Main Course", name: "Fish Masala", price: 200, isVeg: false, image: "/dishes/fish-masala.avif", description: "2 pc, gravy" },
  { id: 307, category: "Main Course", name: "Prawns Masala", price: 300, isVeg: false, image: "/dishes/prawns-masala.avif", description: "12 pc, gravy" },
  { id: 308, category: "Main Course", name: "Mutton Kheema", isVeg: false, image: "/dishes/mutton-kheema.avif", price: 220, variants: [{ name: "Half", price: 220 }, { name: "Full", price: 350 }] },
  { id: 310, category: "Main Course", name: "Mutton Masala", isVeg: false, image: "/dishes/mutton-masala.avif", price: 260, variants: [{ name: "Half", price: 260, desc: "3 pc, gravy" }, { name: "Full", price: 410, desc: "6 pc, gravy" }] },

  // --- BREADS & RICE ---
  { id: 401, category: "Breads & Rice", name: "Roti (Plain)", price: 15, isVeg: true, image: "/dishes/roti.avif" },
  { id: 402, category: "Breads & Rice", name: "Roti (Butter)", price: 20, isVeg: true, image: "/dishes/butter-roti.avif" },
  { id: 403, category: "Breads & Rice", name: "Makai Rotlo", price: 40, isVeg: true, image: "/dishes/rotlo.avif" },
  { id: 404, category: "Breads & Rice", name: "Plain Rice", isVeg: true, image: "/dishes/rice.avif", price: 40, variants: [{ name: "Half", price: 40 }, { name: "Full", price: 60 }] },
  { id: 406, category: "Breads & Rice", name: "Jeera Rice", isVeg: true, image: "/dishes/jeera-rice.avif", price: 60, variants: [{ name: "Half", price: 60 }, { name: "Full", price: 90 }] },
  { id: 408, category: "Breads & Rice", name: "Roasted Papad", price: 10, isVeg: true, image: "/dishes/papad.avif" },
  
  // --- BEVERAGES ---
  { id: 601, category: "Beverages", name: "Mineral Water", price: 10, isVeg: true, image: "/dishes/water.avif" },
];

// --- COMPONENTS ---

const Header = ({ view, setView, cartCount, currentTable, isStaff, logout, storeSettings }) => (
  <header className="bg-teal-800 text-white shadow-lg sticky top-0 z-50">
    {!storeSettings?.isOpen ? (
        <div className="bg-gray-800 text-white text-xs md:text-sm font-bold p-3 text-center flex items-center justify-center gap-2">
            <Ban size={16} /> RESTAURANT IS CLOSED
        </div>
    ) : storeSettings?.rushMode && (
        <div className="bg-red-600 text-white text-xs md:text-sm font-bold p-2 text-center flex items-center justify-center gap-2 animate-pulse">
            <AlertTriangle size={16} /> 
            RUSH MODE: Orders may take longer than usual.
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
                 <button onClick={() => setView('staff-dashboard')} className="text-xs bg-teal-900 px-3 py-1.5 rounded border border-teal-600 font-bold hover:bg-teal-700">
                    Dashboard
                 </button>
               )}
               <button onClick={logout} className="p-2 bg-red-800/80 rounded hover:bg-red-700">
                  <LogOut size={16} />
               </button>
             </>
        ) : (
          <button onClick={() => setView('cart')} className="relative p-2 hover:bg-teal-700 rounded-full transition">
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

const StaffDashboard = ({ setView, setCurrentTable, storeSettings, updateSettings }) => {
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
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Restaurant Controls</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button 
                        onClick={() => updateSettings('isOpen', !storeSettings.isOpen)}
                        className={`py-3 px-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition shadow-sm ${storeSettings.isOpen ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-800 text-white'}`}
                    >
                        <Power size={20} /> {storeSettings.isOpen ? 'Restaurant ONLINE' : 'Restaurant OFFLINE'}
                    </button>
                    
                    <button 
                        onClick={() => updateSettings('rushMode', !storeSettings.rushMode)}
                        className={`py-3 px-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition shadow-sm ${storeSettings.rushMode ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        <AlertTriangle size={20} /> {storeSettings.rushMode ? 'Rush Mode ON' : 'Rush Mode OFF'}
                    </button>
                    
                    <button 
                        onClick={() => setView('manage-menu')}
                        className="py-3 px-2 rounded-lg font-bold bg-teal-100 text-teal-800 flex flex-col items-center justify-center gap-1 hover:bg-teal-200 shadow-sm col-span-2 md:col-span-1"
                    >
                        <Ban size={20} /> Manage Stock (86)
                    </button>
                </div>
            </div>

            <div className="grid gap-4 max-w-md mx-auto">
                {/* NEW REPORTS BUTTON */}
                <button onClick={() => setView('reports')} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-600 flex items-center justify-between hover:bg-purple-50">
                    <div className="text-left"><h3 className="font-bold text-xl text-gray-800">Analytics & Reports</h3><p className="text-sm text-gray-500">Revenue & Order History</p></div>
                    <TrendingUp className="text-purple-600" size={32} />
                </button>

                <button onClick={() => setView('kitchen')} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-teal-600 flex items-center justify-between hover:bg-teal-50">
                    <div className="text-left"><h3 className="font-bold text-xl text-gray-800">Kitchen Display</h3><p className="text-sm text-gray-500">Live KDS & Edits</p></div>
                    <Store className="text-teal-600" size={32} />
                </button>

                <button onClick={() => setView('bills')} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600 flex items-center justify-between hover:bg-blue-50">
                    <div className="text-left"><h3 className="font-bold text-xl text-gray-800">Active Bills</h3><p className="text-sm text-gray-500">Settle Bills</p></div>
                    <Receipt className="text-blue-600" size={32} />
                </button>

                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2"><ClipboardList className="text-orange-500" /> Manual Order</h3>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Table No" className="flex-1 border p-3 rounded-lg text-lg outline-none focus:border-orange-500" value={manualTable} onChange={(e) => setManualTable(e.target.value)} />
                        <button onClick={startManualOrder} className="bg-orange-600 text-white px-6 rounded-lg font-bold hover:bg-orange-700">GO</button>
                    </div>
                </div>
                
                 <button onClick={startParcelOrder} className="bg-yellow-400 p-4 rounded-xl shadow-md flex items-center justify-center gap-2 font-bold text-teal-900 hover:bg-yellow-500">
                    <Package /> New Parcel / Takeaway
                </button>
            </div>
        </div>
    );
};

// --- REPORTS DASHBOARD ---
const ReportView = ({ allOrders, setView }) => {
    const [filter, setFilter] = useState('today'); // today, week, month
    const [stats, setStats] = useState({ revenue: 0, orderCount: 0, pendingValue: 0, itemsSold: 0 });
    const [filteredOrders, setFilteredOrders] = useState([]);

    useEffect(() => {
        const now = new Date();
        let startTime = 0;

        if (filter === 'today') {
            startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        } else if (filter === 'week') {
            const firstDay = now.getDate() - now.getDay(); 
            startTime = new Date(now.getFullYear(), now.getMonth(), firstDay).getTime();
        } else if (filter === 'month') {
            startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        }

        // Filter orders based on timestamp
        const relevantOrders = allOrders.filter(order => {
            const orderTime = order.createdAt?.seconds ? order.createdAt.seconds * 1000 : Date.now();
            return orderTime >= startTime;
        });

        // Calculate Stats
        let rev = 0;
        let pValue = 0;
        let iSold = 0;
        
        relevantOrders.forEach(order => {
            if (order.status === 'paid') {
                rev += order.totalAmount;
                order.items.forEach(i => iSold += i.qty);
            } else {
                pValue += order.totalAmount;
            }
        });

        // Sort for table display (newest first), but only show settled bills
        const settled = relevantOrders.filter(o => o.status === 'paid').sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds);

        setStats({ revenue: rev, orderCount: relevantOrders.length, pendingValue: pValue, itemsSold: iSold });
        setFilteredOrders(settled);

    }, [filter, allOrders]);

    return (
        <div className="max-w-4xl mx-auto p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('staff-dashboard')} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"><ArrowLeft size={20}/></button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><TrendingUp className="text-purple-600"/> Analytics Dashboard</h2>
                    <p className="text-sm text-gray-500">Track revenue and order history</p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex bg-gray-200 p-1 rounded-lg mb-6">
                {['today', 'week', 'month'].map(f => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f)} 
                        className={`flex-1 py-2 text-sm font-bold rounded-md capitalize transition ${filter === f ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:bg-gray-300'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* KEY METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-purple-600 text-white p-4 rounded-xl shadow-md">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1"><DollarSign size={14}/> Settled Revenue</p>
                    <h3 className="text-3xl font-extrabold">₹{stats.revenue}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><BarChart3 size={14}/> Total Orders</p>
                    <h3 className="text-2xl font-extrabold text-gray-800">{stats.orderCount}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Package size={14}/> Items Sold</p>
                    <h3 className="text-2xl font-extrabold text-gray-800">{stats.itemsSold}</h3>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-200">
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={14}/> Pending Value</p>
                    <h3 className="text-2xl font-extrabold text-orange-800">₹{stats.pendingValue}</h3>
                    <p className="text-[10px] text-orange-600 mt-1">From un-settled tables</p>
                </div>
            </div>

            {/* ORDER HISTORY TABLE */}
            <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2 flex items-center gap-2"><Receipt size={18}/> Settled Bills History ({filteredOrders.length})</h3>
            
            {filteredOrders.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-400 border border-dashed border-gray-200">
                    No settled bills found for this time period.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 text-sm">
                                    <th className="p-3 border-b">Time</th>
                                    <th className="p-3 border-b">Order ID</th>
                                    <th className="p-3 border-b">Table</th>
                                    <th className="p-3 border-b">Items</th>
                                    <th className="p-3 border-b text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                        <td className="p-3 text-sm text-gray-600">
                                            {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString([], {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'}) : '-'}
                                        </td>
                                        <td className="p-3 font-mono text-xs text-gray-500">#{order.id.slice(-5)}</td>
                                        <td className="p-3 font-bold text-gray-800">{order.tableNo}</td>
                                        <td className="p-3 text-xs text-gray-500 max-w-[200px] truncate">
                                            {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                        </td>
                                        <td className="p-3 font-bold text-green-700 text-right">₹{order.totalAmount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const ManageMenuView = ({ setView, storeSettings, toggleStock }) => {
    return (
        <div className="max-w-2xl mx-auto p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('staff-dashboard')} className="p-2 bg-gray-200 rounded-full"><ArrowLeft size={20}/></button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manage Stock (86 List)</h2>
                    <p className="text-xs text-gray-500">Tap to toggle availability. Red = Out of Stock.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
                {MENU_ITEMS.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-800">{item.name}</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {item.variants ? (
                                item.variants.map(v => {
                                    const variantId = `${item.id}-${v.name}`; 
                                    const isUnavailable = storeSettings.unavailable?.includes(variantId);
                                    return (
                                        <button 
                                            key={variantId}
                                            onClick={() => toggleStock(variantId)}
                                            className={`px-4 py-2 rounded text-sm font-bold border transition flex items-center gap-2 ${isUnavailable ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'}`}
                                        >
                                            {isUnavailable ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                            {v.name}
                                        </button>
                                    )
                                })
                            ) : (
                                (() => {
                                    const isUnavailable = storeSettings.unavailable?.includes(item.id.toString());
                                    return (
                                        <button 
                                            onClick={() => toggleStock(item.id.toString())}
                                            className={`w-full px-4 py-2 rounded text-sm font-bold border transition flex items-center justify-center gap-2 ${isUnavailable ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'}`}
                                        >
                                            {isUnavailable ? <><XCircle size={16} /> Out of Stock</> : <><CheckCircle size={16} /> Available</>}
                                        </button>
                                    )
                                })()
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BillView = ({ activeOrders, settleTable }) => {
    const tables = {};
    
    // Group active orders by table
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
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Receipt className="text-blue-600" size={28} /> 
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Active Bills</h2>
                        <p className="text-sm text-gray-500">Manage ongoing tables.</p>
                    </div>
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
                                    <p className="text-xs text-gray-500">{t.orders.length} Tickets Merged</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-green-700">₹{t.totalAmount}</div>
                                </div>
                            </div>
                            
                            <div className="p-4 flex-grow space-y-3">
                                {t.orders.map((order, i) => (
                                    <div key={order.id} className={`border rounded p-3 text-sm relative ${order.status === 'served' ? 'bg-green-50 border-green-200 shadow-sm' : ''}`}>
                                        <div className="font-bold text-[10px] text-gray-400 flex justify-between items-center mb-2">
                                            <span className="flex items-center gap-2">
                                                TICKET #{order.id.slice(-4)}
                                            </span>
                                            {order.status === 'served' ? (
                                                <span className="text-green-800 bg-green-200 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle size={10}/> SERVED</span>
                                            ) : (
                                                <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded flex items-center gap-1"><Clock size={10}/> COOKING</span>
                                            )}
                                        </div>
                                        
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm text-gray-700 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span>{item.qty} x {item.name}</span>
                                                </div>
                                                <span>₹{item.price * item.qty}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-gray-50 border-t mt-auto">
                                <button 
                                    onClick={() => settleTable(t.orders)}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-md flex justify-center items-center gap-2 bg-blue-600 text-white hover:bg-blue-700`}
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

const KitchenDisplay = ({ activeOrders, updateOrderStatus, deleteOrder, deleteItemFromOrder, editTableNumber }) => {
  const [editMode, setEditMode] = useState(false);
  const kitchenOrders = activeOrders.filter(o => o.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
            <Store className="text-teal-600" size={28} /> 
            <h2 className="text-2xl font-bold text-gray-800">Kitchen Display</h2>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <button 
                onClick={() => setEditMode(!editMode)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${editMode ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                {editMode ? <><X size={16}/> DONE EDITING</> : <><Edit size={16}/> EDIT / CANCEL</>}
            </button>
            <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center">
                Count: {kitchenOrders.length}
            </span>
        </div>
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
              
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  {/* EDIT TABLE BUTTON IMPLEMENTED HERE */}
                  <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                    {order.tableNo.toString().startsWith('PARCEL') ? '📦 Takeaway' : `Table ${order.tableNo}`}
                    <button 
                        onClick={() => editTableNumber(order.id, order.tableNo)} 
                        className="text-gray-400 hover:text-blue-600 p-1 bg-white rounded shadow-sm border border-gray-200"
                        title="Edit Table Number"
                    >
                        <Edit size={14} />
                    </button>
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">
                    #{order.id.slice(-4)}
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
                        {editMode && (
                            <button 
                                onClick={() => deleteItemFromOrder(order, idx)} 
                                className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-600 hover:text-white transition"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <span className="font-bold text-gray-800 bg-gray-100 h-8 w-8 flex items-center justify-center rounded-lg text-sm border border-gray-200 shadow-sm">
                          {item.qty}
                        </span>
                        <div>
                          <p className={`font-medium ${item.isVeg !== false ? 'text-green-700' : 'text-red-700'}`}>
                            {item.name}
                          </p>
                          {item.variant && <p className="text-[10px] text-gray-500">({item.variant})</p>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-gray-50 border-t">
                {editMode ? (
                    <button 
                        onClick={() => deleteOrder(order.id)}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition flex justify-center items-center gap-2 shadow-md"
                    >
                        <Trash2 size={20} /> CANCEL ENTIRE TICKET
                    </button>
                ) : (
                    <button 
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex justify-center items-center gap-2 shadow-md active:scale-95"
                    >
                        <Utensils size={18} /> Mark Served
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MenuCard = ({ item, cart, addToCart, updateQuantity, unavailable, unavailableVariants }) => {
  const [selectedVariant, setSelectedVariant] = useState(item.variants ? item.variants[0] : null);

  const getCurrentId = () => {
      if (selectedVariant) return `${item.id}-${selectedVariant.name}`;
      return item.id.toString();
  }

  const currentId = getCurrentId();
  const cartItem = cart.find(cartItem => cartItem.id === currentId);
  const qty = cartItem ? cartItem.qty : 0;

  const isVariantUnavailable = selectedVariant && unavailableVariants?.includes(currentId);
  const isTrulyUnavailable = unavailable || isVariantUnavailable;

  const handleAdd = () => {
    if(isTrulyUnavailable) return;
    
    let itemToAdd = item;
    if (selectedVariant) {
        itemToAdd = {
            ...item,
            id: currentId,
            name: `${item.name} (${selectedVariant.name})`,
            price: selectedVariant.price,
            variant: selectedVariant.name
        };
    }
    if (!item.variants) {
        itemToAdd = { ...item, id: item.id.toString() };
    }

    addToCart(itemToAdd);
  };

  const handleIncrement = () => updateQuantity(currentId, 1);
  const handleDecrement = () => updateQuantity(currentId, -1);

  const currentDescription = selectedVariant ? selectedVariant.desc : item.description;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden relative ${isTrulyUnavailable ? 'opacity-75' : ''}`}>
        {isTrulyUnavailable && (
            <div className="absolute inset-0 bg-white/40 z-10 flex items-center justify-center pointer-events-none">
                <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded shadow-lg transform -rotate-12">OUT OF STOCK</span>
            </div>
        )}

        <div className="w-28 h-auto md:w-32 md:h-auto relative flex-shrink-0 bg-gray-100">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => {e.target.src = 'https://placehold.co/100x100?text=PC'}} />
        </div>
        <div className="p-3 flex flex-col flex-grow justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 leading-tight text-sm md:text-base">{item.name}</h3>
                    <div className={`w-4 h-4 border ${item.isVeg !== false ? 'border-green-600' : 'border-red-600'} p-[2px] flex items-center justify-center flex-shrink-0 ml-2`}>
                        <div className={`w-full h-full rounded-full ${item.isVeg !== false ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    </div>
                </div>
                {currentDescription && <p className="text-[10px] text-gray-500 mt-1 leading-tight">{currentDescription}</p>}
                
                {item.variants ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {item.variants.map((v) => {
                            const vId = `${item.id}-${v.name}`;
                            const vUnavailable = unavailableVariants?.includes(vId);
                            return (
                                <button 
                                    key={v.name}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`text-[10px] px-2 py-1 rounded border transition ${selectedVariant.name === v.name ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300'} ${vUnavailable ? 'opacity-50 decoration-slate-500 line-through' : ''}`}
                                >
                                    {v.name}
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500 text-xs mt-1 font-bold">₹{item.price}</p>
                )}
            </div>
            
            <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-teal-800">₹{selectedVariant ? selectedVariant.price : item.price}</span>
                {qty === 0 ? (
                    <button onClick={handleAdd} disabled={isTrulyUnavailable} className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-100 transition active:scale-95 flex items-center gap-1 border border-teal-200 shadow-sm">
                        ADD <Plus size={12} />
                    </button>
                ) : (
                    <div className="flex items-center bg-teal-600 rounded-lg text-white font-bold text-xs shadow-md">
                        <button onClick={handleDecrement} className="px-3 py-1.5 hover:bg-teal-700 rounded-l-lg transition active:bg-teal-800"><Minus size={12} /></button>
                        <span className="px-1">{qty}</span>
                        <button onClick={handleIncrement} className="px-3 py-1.5 hover:bg-teal-700 rounded-r-lg transition active:bg-teal-800"><Plus size={12} /></button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [view, setView] = useState('loading'); 
  const [cart, setCart] = useState([]);
  
  // Now stores ALL orders to calculate reports, activeOrders is derived below
  const [allOrders, setAllOrders] = useState([]); 
  
  const [currentTable, setCurrentTable] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [kitchenPassword, setKitchenPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [storeSettings, setStoreSettings] = useState({ rushMode: false, isOpen: true, unavailable: [] });

  const audioRef = useRef(null);
  const prevPendingCount = useRef(0);

  // Derive active orders from all orders (filters out 'paid')
  const activeOrders = allOrders.filter(o => o.status !== 'paid');

  const changeView = (newView) => {
      window.history.pushState({ view: newView }, '');
      setView(newView);
  };

  useEffect(() => {
      const handlePopState = (event) => {
          if (event.state && event.state.view) setView(event.state.view);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
        window.history.replaceState({ view: 'menu' }, '');
    } else {
        setIsStaff(false);
        setView('login');
        window.history.replaceState({ view: 'login' }, '');
    }
  }, []);

  useEffect(() => {
      const unsub = onSnapshot(doc(db, "settings", "store"), (doc) => {
          if (doc.exists()) setStoreSettings(doc.data());
          else setDoc(doc.ref, { rushMode: false, isOpen: true, unavailable: [] });
      });
      return () => unsub();
  }, []);

  useEffect(() => {
    // Listen to ALL orders, sorted newest first
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAllOrders(orders);

      const liveOrders = orders.filter(o => o.status !== 'paid');
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
      changeView('success');
      
      if(isStaff) {
          setTimeout(() => {
              changeView('staff-dashboard');
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

  // NEW FEATURE: Edit Table Number
  const editTableNumber = async (orderId, currentTableVal) => {
      const newTable = window.prompt("Change table number to:", currentTableVal);
      // Ensure they didn't hit cancel, and they actually typed a new number
      if (newTable && newTable.trim() !== "" && newTable.trim() !== currentTableVal) {
          try {
              await updateDoc(doc(db, "orders", orderId), { tableNo: newTable.trim() });
          } catch (error) {
              console.error("Error updating table number:", error);
              alert("Failed to update table number.");
          }
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

  const deleteOrder = async (orderId) => {
      if(!window.confirm("CANCEL THIS ENTIRE TICKET?")) return;
      try {
          await deleteDoc(doc(db, "orders", orderId));
      } catch (error) {
          console.error("Error deleting order:", error);
          alert("Could not delete. Check database permissions.");
      }
  };

  const deleteItemFromOrder = async (order, itemIndex) => {
      if(!window.confirm(`Remove ${order.items[itemIndex].name}?`)) return;
      
      const newItems = [...order.items];
      newItems.splice(itemIndex, 1);
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

      try {
          if(newItems.length === 0) {
              await deleteDoc(doc(db, "orders", order.id));
          } else {
              await updateDoc(doc(db, "orders", order.id), { items: newItems, totalAmount: newTotal });
          }
      } catch (error) {
          console.error("Error updating order:", error);
      }
  };

  const updateSettings = async (key, value) => {
      setStoreSettings(prev => ({...prev, [key]: value})); 
      await updateDoc(doc(db, "settings", "store"), { [key]: value });
  };

  const toggleStock = async (id) => {
      let list = storeSettings.unavailable || [];
      if(list.includes(id)) {
          list = list.filter(itemId => itemId !== id);
      } else {
          list.push(id);
      }
      setStoreSettings(prev => ({...prev, unavailable: list}));
      await updateDoc(doc(db, "settings", "store"), { unavailable: list });
  };

  const handleLogin = () => {
      if(kitchenPassword === '1234') { 
          setIsStaff(true);
          changeView('staff-dashboard');
          setKitchenPassword('');
      } else {
          alert("Wrong Password!");
      }
  };

  const handleLogout = () => {
      setIsStaff(false);
      changeView('login');
      setCurrentTable(null);
  };

  // --- VIEWS ROUTING ---
  if (view === 'loading') return <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold">Loading PC's Kitchen...</div>;

  if (view === 'login') return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
          <audio ref={audioRef} src="/bell.wav" preload="auto" />
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
        <audio ref={audioRef} src="/bell.wav" preload="auto" />
        <Header view={view} setView={changeView} cartCount={0} currentTable={null} isStaff={true} logout={handleLogout} storeSettings={storeSettings} />
        <StaffDashboard setView={changeView} setCurrentTable={setCurrentTable} storeSettings={storeSettings} updateSettings={updateSettings} />
      </>
  );

  if (view === 'reports') return (
      <>
        <Header view={view} setView={changeView} cartCount={0} currentTable={null} isStaff={true} logout={handleLogout} storeSettings={storeSettings} />
        <ReportView allOrders={allOrders} setView={changeView} />
      </>
  );

  if (view === 'manage-menu') return (
      <>
        <Header view={view} setView={changeView} cartCount={0} currentTable={null} isStaff={true} logout={handleLogout} storeSettings={storeSettings} />
        <ManageMenuView setView={changeView} storeSettings={storeSettings} toggleStock={toggleStock} />
      </>
  );

  if (view === 'bills') return (
      <>
        <Header view={view} setView={changeView} cartCount={0} currentTable={null} isStaff={true} logout={handleLogout} storeSettings={storeSettings} />
        <BillView activeOrders={activeOrders} settleTable={settleTable} deleteOrder={deleteOrder} deleteItemFromOrder={deleteItemFromOrder} />
      </>
  );

  if (view === 'kitchen') return (
     <>
        <audio ref={audioRef} src="/bell.wav" preload="auto" />
        <Header view={view} setView={changeView} cartCount={0} currentTable={null} isStaff={true} logout={handleLogout} storeSettings={storeSettings} />
        <KitchenDisplay activeOrders={activeOrders} updateOrderStatus={updateOrderStatus} deleteOrder={deleteOrder} deleteItemFromOrder={deleteItemFromOrder} editTableNumber={editTableNumber} />
     </>
  );

  if (!isStaff && storeSettings?.isOpen === false) return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 text-center text-white">
          <Ban size={64} className="text-red-500 mb-6" />
          <h1 className="text-3xl font-bold mb-2">Restaurant Offline</h1>
          <p className="text-gray-400">PC's Kitchen is currently closed. <br/>Please check back during operating hours.</p>
          <div className="mt-8 p-4 bg-gray-800 rounded-lg text-sm text-gray-300">
              <p>Lunch: 12:30 PM - 2:30 PM</p>
              <p>Dinner: 7:30 PM - 11:00 PM</p>
          </div>
      </div>
  );

  if (view === 'menu') return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Header view={view} setView={changeView} cartCount={cart.reduce((a, b) => a + b.qty, 0)} currentTable={currentTable} isStaff={isStaff} logout={handleLogout} storeSettings={storeSettings} />
      <main className="pt-4 max-w-4xl mx-auto px-4 pb-20">
        {isStaff && (
            <div className="bg-orange-100 border-l-4 border-orange-500 p-3 mb-4 rounded shadow-sm flex justify-between items-center">
                <div>
                    <p className="font-bold text-orange-800 text-sm">Waiter Mode Active</p>
                    <p className="text-xs text-orange-700">Taking order for {currentTable}</p>
                </div>
                <button onClick={() => changeView('staff-dashboard')} className="text-xs bg-white px-3 py-1 rounded border border-orange-200">Cancel</button>
            </div>
        )}
        
        {["Lunch Specials (Thali)", "Starters", "Egg Specials", "Main Course", "Breads & Rice", "Beverages"].map(cat => {
            if (cat === "Lunch Specials (Thali)") {
                const now = new Date();
                const minutes = now.getHours() * 60 + now.getMinutes();
                const isLunchTime = minutes >= 750 && minutes <= 900;
                if (!isLunchTime && !isStaff) return null;
            }

            const items = MENU_ITEMS.filter(item => item.category === cat);
            if (items.length === 0) return null;

            return (
                <div key={cat} className="mb-8">
                <h2 className="text-xl font-extrabold mb-4 text-gray-800 flex items-center">
                    <span className="w-2 h-8 bg-teal-600 rounded-r-lg mr-3"></span>
                    {cat}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map(item => {
                        const isMainUnavailable = storeSettings.unavailable?.includes(item.id.toString());
                        return (
                            <MenuCard 
                                key={item.id} 
                                item={item} 
                                cart={cart}
                                addToCart={addToCart}
                                updateQuantity={updateQuantity}
                                unavailable={isMainUnavailable}
                                unavailableVariants={storeSettings.unavailable || []}
                            />
                        );
                    })}
                </div>
                </div>
            );
        })}
        
        {cart.length > 0 && (
            <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40">
                <button 
                    onClick={() => changeView('cart')}
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
           <Header view={view} setView={changeView} cartCount={cart.reduce((a, b) => a + b.qty, 0)} currentTable={currentTable} isStaff={isStaff} logout={handleLogout} storeSettings={storeSettings} />
           <div className="max-w-xl mx-auto p-4">
                <button onClick={() => changeView('menu')} className="flex items-center text-gray-500 mb-6 hover:text-teal-600 font-medium">
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
        <button onClick={() => isStaff ? changeView('staff-dashboard') : changeView('menu')} className="text-teal-600 font-bold hover:underline">
            {isStaff ? 'Back to Dashboard' : 'Order More Items'}
        </button>
      </div>
  );

  return null;
};

export default App;