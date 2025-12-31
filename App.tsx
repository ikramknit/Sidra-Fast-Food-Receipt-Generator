
import React, { useState, useEffect } from 'react';
import { Plus, Printer, Trash2, Receipt, Settings, ShoppingCart, UserCheck, ChevronDown } from 'lucide-react';
import { ReceiptData, ReceiptItem, MenuItem } from './types.ts';
import ReceiptPreview from './components/ReceiptPreview.tsx';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('sidra_menu');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Chicken Burger', rate: 120 },
      { id: '2', name: 'French Fries', rate: 80 },
      { id: '3', name: 'Cold Coffee', rate: 60 }
    ];
  });

  const [data, setData] = useState<ReceiptData>({
    date: new Date().toISOString().split('T')[0],
    billNo: '1001',
    customerName: '',
    items: [{ id: '1', description: '', qty: 1, rate: 0 }],
    taxRate: 5,
  });

  useEffect(() => {
    localStorage.setItem('sidra_menu', JSON.stringify(menu));
  }, [menu]);

  // Admin Actions
  const addMenuItem = () => {
    setMenu([...menu, { id: Math.random().toString(36).substr(2, 9), name: '', rate: 0 }]);
  };

  const updateMenuItem = (id: string, field: keyof MenuItem, value: string | number) => {
    setMenu(menu.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeMenuItem = (id: string) => {
    setMenu(menu.filter(item => item.id !== id));
  };

  // Billing Actions
  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Math.random().toString(36).substr(2, 9), description: '', qty: 1, rate: 0 },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((item) => item.id !== id) : prev.items,
    }));
  };

  const updateBillItem = (id: string, field: keyof ReceiptItem, value: any) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // If description changed via dropdown, update rate automatically
          if (field === 'description') {
            const menuItem = menu.find(m => m.name === value);
            if (menuItem) updated.rate = menuItem.rate;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-900 p-1.5 rounded-lg">
              <Receipt className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sidra Billing</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                isAdmin ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAdmin ? <ShoppingCart size={16} /> : <Settings size={16} />}
              {isAdmin ? 'Back to Billing' : 'Admin: Manage Menu'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white px-5 py-2 rounded-lg shadow-sm transition-all font-semibold"
            >
              <Printer size={18} />
              Print Bill
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {isAdmin ? (
            /* Admin Panel */
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Menu Management</h2>
                  <p className="text-sm text-slate-500">Add or edit items available for billing</p>
                </div>
                <button
                  onClick={addMenuItem}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                >
                  <Plus size={16} /> Add New Food Item
                </button>
              </div>

              <div className="space-y-3">
                {menu.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="col-span-7">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Item Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-red-900 outline-none py-1 text-slate-700 font-medium"
                        placeholder="e.g. Cheese Burger"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Default Rate</label>
                      <div className="relative">
                        <span className="absolute left-0 top-1 text-slate-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateMenuItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent border-b border-slate-200 focus:border-red-900 outline-none py-1 pl-4 text-slate-700 font-medium"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => removeMenuItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
                {menu.length === 0 && (
                  <div className="text-center py-12 text-slate-400 italic">No items in menu. Add some to start billing!</div>
                )}
              </div>
            </section>
          ) : (
            /* Billing Form */
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <UserCheck className="text-blue-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">New Bill Entry</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Bill Date</label>
                  <input
                    type="date"
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none bg-slate-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Bill Number</label>
                  <input
                    type="text"
                    value={data.billNo}
                    onChange={(e) => setData({ ...data, billNo: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none bg-slate-50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={data.customerName}
                    onChange={(e) => setData({ ...data, customerName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none bg-slate-50 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Order Items</h3>
                <button
                  onClick={addItem}
                  className="text-xs bg-red-50 text-red-900 hover:bg-red-100 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all font-bold shadow-sm"
                >
                  <Plus size={14} /> Add Item Row
                </button>
              </div>

              <div className="space-y-3">
                {data.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
                    <div className="col-span-1 text-center font-bold text-slate-300">
                      {index + 1}
                    </div>
                    <div className="col-span-5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Item</label>
                      <div className="relative">
                        <select
                          value={item.description}
                          onChange={(e) => updateBillItem(item.id, 'description', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-900 outline-none appearance-none font-medium text-slate-700"
                        >
                          <option value="">-- Choose Item --</option>
                          {menu.map(m => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateBillItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-900 outline-none font-medium text-slate-700"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rate (Each)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateBillItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-900 outline-none font-medium text-slate-700"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase">G.S.T. / Tax (%)</label>
                  <input
                    type="number"
                    value={data.taxRate}
                    onChange={(e) => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-16 bg-white border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-red-900 outline-none text-right font-bold text-slate-700"
                  />
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Receipt Sidebar Preview */}
        <section className="w-full lg:w-[450px] shrink-0 sticky top-24 self-start">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print mb-4">
             <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Live Preview</h4>
             <p className="text-[10px] text-slate-500">This matches exactly what will be printed.</p>
          </div>
          <ReceiptPreview data={data} />
        </section>
      </main>
    </div>
  );
};

export default App;
