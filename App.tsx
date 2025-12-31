
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Printer, Trash2, Receipt, Settings, ShoppingCart, UserCheck, ChevronDown, BarChart3, ListChecks } from 'lucide-react';
import { ReceiptData, ReceiptItem, MenuItem, SavedReceipt } from './types.ts';
import ReceiptPreview from './components/ReceiptPreview.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'menu' | 'reports'>('reports');
  
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('sidra_menu');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Chicken Burger', rate: 120 },
      { id: '2', name: 'French Fries', rate: 80 },
      { id: '3', name: 'Cold Coffee', rate: 60 }
    ];
  });

  const [history, setHistory] = useState<SavedReceipt[]>(() => {
    const saved = localStorage.getItem('sidra_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [data, setData] = useState<ReceiptData>({
    date: new Date().toISOString().split('T')[0],
    billNo: (1001 + (history?.length || 0)).toString(),
    customerName: '',
    items: [{ id: '1', description: '', qty: 1, rate: 0 }],
    taxRate: 5,
  });

  useEffect(() => {
    localStorage.setItem('sidra_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('sidra_history', JSON.stringify(history));
    // Update next bill number based on history length
    setData(prev => ({ ...prev, billNo: (1001 + history.length).toString() }));
  }, [history]);

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

  const deleteFromHistory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  const clearHistory = () => {
    if (window.confirm('Warning: This will clear ALL sales data. Continue?')) {
      setHistory([]);
    }
  };

  // Billing Actions
  const addItem = useCallback(() => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Math.random().toString(36).substr(2, 9), description: '', qty: 1, rate: 0 },
      ],
    }));
  }, []);

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((item) => item.id !== id) : prev.items,
    }));
  };

  const updateBillItem = (id: string, field: keyof ReceiptItem, value: any) => {
    setData((prev) => {
      const isLastItem = prev.items[prev.items.length - 1].id === id;
      const newItems = prev.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'description') {
            const menuItem = menu.find(m => m.name === value);
            if (menuItem) updated.rate = menuItem.rate;
          }
          return updated;
        }
        return item;
      });

      // Auto-add new row if last item gets a description
      if (isLastItem && field === 'description' && value !== '') {
        setTimeout(() => addItem(), 0);
      }

      return { ...prev, items: newItems };
    });
  };

  const handlePrint = () => {
    // Calculate totals to save
    const subTotal = data.items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const taxAmount = (subTotal * data.taxRate) / 100;
    const grandTotal = subTotal + taxAmount;

    // Only save if there are items with descriptions
    const validItems = data.items.filter(i => i.description !== '');
    if (validItems.length === 0) {
      alert("Please add at least one item before printing.");
      return;
    }

    const savedRecord: SavedReceipt = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      items: validItems,
      subTotal,
      taxAmount,
      grandTotal
    };

    setHistory([savedRecord, ...history]);
    window.print();
    
    // Reset for next bill
    setData({
      date: new Date().toISOString().split('T')[0],
      billNo: (1001 + history.length + 1).toString(),
      customerName: '',
      items: [{ id: '1', description: '', qty: 1, rate: 0 }],
      taxRate: 5,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white shadow-sm border-b no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-900 p-1.5 rounded-lg">
              <Receipt className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sidra POS</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                isAdmin ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAdmin ? <ShoppingCart size={16} /> : <Settings size={16} />}
              {isAdmin ? 'Checkout View' : 'Admin Dashboard'}
            </button>
            {!isAdmin && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white px-5 py-2 rounded-lg shadow-sm transition-all font-semibold"
              >
                <Printer size={18} />
                Finalize & Print
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {isAdmin ? (
            /* Admin Panel with Tabs */
            <div className="space-y-6 no-print">
              <div className="flex gap-4 p-1 bg-slate-200 rounded-xl w-fit">
                <button 
                  onClick={() => setAdminTab('reports')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${adminTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <BarChart3 size={16} /> Reports & Sales
                </button>
                <button 
                  onClick={() => setAdminTab('menu')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${adminTab === 'menu' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <ListChecks size={16} /> Menu Management
                </button>
              </div>

              {adminTab === 'menu' ? (
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Menu Management</h2>
                      <p className="text-sm text-slate-500">Manage your product catalog</p>
                    </div>
                    <button
                      onClick={addMenuItem}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
                    >
                      <Plus size={16} /> Add Food Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {menu.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="col-span-7">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                            className="w-full bg-transparent border-b border-slate-200 focus:border-red-900 outline-none py-1 text-slate-700 font-bold"
                            placeholder="Item Name"
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="relative">
                            <span className="absolute left-0 top-1 text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateMenuItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent border-b border-slate-200 focus:border-red-900 outline-none py-1 pl-4 text-slate-700 font-bold"
                            />
                          </div>
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button onClick={() => removeMenuItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <AdminDashboard 
                  history={history} 
                  onDelete={deleteFromHistory} 
                  onClearAll={clearHistory}
                />
              )}
            </div>
          ) : (
            /* Billing Form */
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-8 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <UserCheck size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Quick Bill Entry</h2>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase">
                  Session: {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 transition-colors group-focus-within:text-red-900">Bill Date</label>
                  <input
                    type="date"
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-900 outline-none bg-slate-50 font-bold text-slate-700"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 transition-colors group-focus-within:text-red-900">Invoice #</label>
                  <input
                    type="text"
                    value={data.billNo}
                    onChange={(e) => setData({ ...data, billNo: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-900 outline-none bg-slate-50 font-mono font-bold text-slate-700"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 transition-colors group-focus-within:text-red-900">Customer</label>
                  <input
                    type="text"
                    placeholder="Walk-in Guest"
                    value={data.customerName}
                    onChange={(e) => setData({ ...data, customerName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-900 outline-none bg-slate-50 font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-3 px-4 text-[10px] font-black text-slate-400 uppercase mb-1">
                  <div className="col-span-1">No.</div>
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-center">Rate</div>
                  <div className="col-span-1"></div>
                </div>
                {data.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 transition-all">
                    <div className="col-span-1 text-center font-black text-slate-300">
                      {index + 1}
                    </div>
                    <div className="col-span-6 relative">
                      <select
                        value={item.description}
                        onChange={(e) => updateBillItem(item.id, 'description', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-900 outline-none appearance-none font-bold text-slate-700 text-sm"
                      >
                        <option value="">-- Choose Food Item --</option>
                        {menu.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateBillItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-900 outline-none font-bold text-slate-700 text-center text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateBillItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-900 outline-none font-bold text-slate-700 text-center text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 text-xs font-black text-red-900 hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
                >
                  <Plus size={16} /> ADD CUSTOM ROW
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Applied GST</span>
                  <input
                    type="number"
                    value={data.taxRate}
                    onChange={(e) => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-red-900 outline-none text-right font-black text-slate-700"
                  />
                  <span className="text-sm font-bold text-slate-400">%</span>
                </div>
              </div>
            </section>
          )}
        </div>

        <section className="w-full lg:w-[450px] shrink-0 sticky top-24 self-start">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print mb-4 flex justify-between items-center">
             <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase">Live Receipt Preview</h4>
              <p className="text-[10px] text-slate-500">Auto-saves locally on print</p>
             </div>
             <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
               System Active
             </div>
          </div>
          <ReceiptPreview data={data} />
        </section>
      </main>
    </div>
  );
};

export default App;
