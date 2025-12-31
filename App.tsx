
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Printer, Trash2, Receipt, Settings, ShoppingCart, UserCheck, ChevronDown, BarChart3, ListChecks, MessageSquare, Phone } from 'lucide-react';
import { ReceiptData, ReceiptItem, MenuItem, SavedReceipt } from './types.ts';
import ReceiptPreview from './components/ReceiptPreview.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'menu' | 'reports'>('reports');
  const [editingId, setEditingId] = useState<string | null>(null);
  
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
    customerPhone: '',
    items: [{ id: '1', description: '', qty: 1, rate: 0 }],
    taxRate: 5,
  });

  useEffect(() => {
    localStorage.setItem('sidra_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('sidra_history', JSON.stringify(history));
    if (!editingId) {
      setData(prev => ({ ...prev, billNo: (1001 + history.length).toString() }));
    }
  }, [history, editingId]);

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
    if (window.confirm('Delete this record?')) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  const clearHistory = () => {
    if (window.confirm('Clear ALL sales data?')) {
      setHistory([]);
    }
  };

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

      if (isLastItem && field === 'description' && value !== '') {
        setTimeout(() => addItem(), 0);
      }

      return { ...prev, items: newItems };
    });
  };

  const calculateTotals = () => {
    const validItems = data.items.filter(i => i.description.trim() !== '');
    const subTotal = validItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const taxAmount = (subTotal * data.taxRate) / 100;
    const grandTotal = subTotal + taxAmount;
    return { validItems, subTotal, taxAmount, grandTotal };
  };

  const handlePrint = () => {
    const { validItems, subTotal, taxAmount, grandTotal } = calculateTotals();
    if (validItems.length === 0) {
      alert("Add items first.");
      return;
    }

    const savedRecord: SavedReceipt = {
      ...data,
      id: editingId || Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      items: validItems,
      subTotal,
      taxAmount,
      grandTotal
    };

    if (editingId) {
      setHistory(history.map(h => h.id === editingId ? savedRecord : h));
      setEditingId(null);
    } else {
      setHistory([savedRecord, ...history]);
    }

    window.print();
    
    setData({
      date: new Date().toISOString().split('T')[0],
      billNo: (1001 + history.length + 1).toString(),
      customerName: '',
      customerPhone: '',
      items: [{ id: '1', description: '', qty: 1, rate: 0 }],
      taxRate: 5,
    });
  };

  const handleWhatsAppShare = () => {
    const { validItems, grandTotal } = calculateTotals();
    if (validItems.length === 0) {
      alert("Please add items to the bill first.");
      return;
    }
    if (!data.customerPhone) {
      alert("Please enter a customer phone number.");
      return;
    }

    // Prepare message
    const itemDetails = validItems.map(item => `${item.description} x ${item.qty} = ₹${(item.qty * item.rate).toFixed(2)}`).join('\n');
    const message = `*SIDRA FAST FOOD*\n\n` +
                    `Hello ${data.customerName || 'Customer'},\n` +
                    `Here is your bill summary:\n\n` +
                    `Bill No: #${data.billNo}\n` +
                    `Date: ${data.date}\n\n` +
                    `${itemDetails}\n\n` +
                    `*Total Amount: ₹${grandTotal.toFixed(2)}*\n\n` +
                    `Thank you for visiting!`;

    const encodedMessage = encodeURIComponent(message);
    const phone = data.customerPhone.replace(/\D/g, ''); // Remove non-numeric characters
    window.open(`https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${encodedMessage}`, '_blank');
  };

  const handleEditBill = (receipt: SavedReceipt) => {
    setData({
      date: receipt.date,
      billNo: receipt.billNo,
      customerName: receipt.customerName,
      customerPhone: receipt.customerPhone || '',
      items: [...receipt.items, { id: Math.random().toString(36).substr(2, 9), description: '', qty: 1, rate: 0 }],
      taxRate: receipt.taxRate,
    });
    setEditingId(receipt.id);
    setIsAdmin(false);
  };

  const handleViewBill = (receipt: SavedReceipt) => {
    setData({
      date: receipt.date,
      billNo: receipt.billNo,
      customerName: receipt.customerName,
      customerPhone: receipt.customerPhone || '',
      items: receipt.items,
      taxRate: receipt.taxRate,
    });
    setEditingId(null);
    setIsAdmin(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white shadow-sm border-b no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-900 p-1.5 rounded-lg">
              <Receipt className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Sidra Billing</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {editingId && (
              <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase">
                Editing Bill #{data.billNo}
              </span>
            )}
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all font-bold text-xs ${
                isAdmin ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isAdmin ? <ShoppingCart size={14} /> : <Settings size={14} />}
              {isAdmin ? 'Checkout' : 'Admin'}
            </button>
            {!isAdmin && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white px-5 py-1.5 rounded-lg font-bold text-xs shadow-sm"
              >
                <Printer size={16} />
                {editingId ? 'Update & Print' : 'Print Bill'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 no-print">
          {isAdmin ? (
            <div className="space-y-6">
              <div className="flex gap-2 p-1 bg-slate-200 rounded-lg w-fit">
                <button 
                  onClick={() => setAdminTab('reports')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${adminTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  <BarChart3 size={14} /> Reports
                </button>
                <button 
                  onClick={() => setAdminTab('menu')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${adminTab === 'menu' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  <ListChecks size={14} /> Menu
                </button>
              </div>

              {adminTab === 'menu' ? (
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Food Menu</h2>
                    <button
                      onClick={addMenuItem}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      <Plus size={14} /> New Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {menu.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                          className="flex-1 bg-transparent border-b border-slate-200 focus:border-red-900 outline-none py-1 text-sm font-bold"
                          placeholder="Item Name"
                        />
                        <div className="w-24 relative">
                          <span className="absolute left-0 top-1 text-slate-400 font-bold text-sm">₹</span>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateMenuItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border-b border-slate-200 focus:border-red-900 outline-none py-1 pl-4 text-sm font-bold"
                          />
                        </div>
                        <button onClick={() => removeMenuItem(item.id)} className="p-2 text-slate-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <AdminDashboard 
                  history={history} 
                  onDelete={deleteFromHistory} 
                  onClearAll={clearHistory}
                  onView={handleViewBill}
                  onEdit={handleEditBill}
                />
              )}
            </div>
          ) : (
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-red-900 outline-none bg-slate-50 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Bill #</label>
                  <input
                    type="text"
                    value={data.billNo}
                    onChange={(e) => setData({ ...data, billNo: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-red-900 outline-none bg-slate-50 font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Walk-in"
                    value={data.customerName}
                    onChange={(e) => setData({ ...data, customerName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-red-900 outline-none bg-slate-50 font-bold text-sm"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Phone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={data.customerPhone}
                      onChange={(e) => setData({ ...data, customerPhone: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-red-900 outline-none bg-slate-50 font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-3 px-2 text-[9px] font-black text-slate-400 uppercase">
                  <div className="col-span-7">Select Item</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-center">Rate</div>
                  <div className="col-span-1"></div>
                </div>
                {data.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="col-span-7 relative">
                      <select
                        value={item.description}
                        onChange={(e) => updateBillItem(item.id, 'description', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-red-900 outline-none appearance-none font-bold text-xs"
                      >
                        <option value="">-- Choose Item --</option>
                        {menu.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2 text-slate-400" size={12} />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateBillItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-md py-1.5 text-center font-bold text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateBillItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-md py-1.5 text-center font-bold text-xs"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center text-xs font-bold text-slate-500">
                <div className="flex gap-4 items-center">
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1 hover:text-red-900 px-2 py-1"
                  >
                    <Plus size={14} /> New Row
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1 rounded-md transition-all border border-emerald-100"
                  >
                    <MessageSquare size={14} /> 
                    <span className="font-black text-[10px] uppercase">WhatsApp Bill</span>
                  </button>
                  {editingId && (
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setData({
                          date: new Date().toISOString().split('T')[0],
                          billNo: (1001 + history.length).toString(),
                          customerName: '',
                          customerPhone: '',
                          items: [{ id: '1', description: '', qty: 1, rate: 0 }],
                          taxRate: 5,
                        });
                      }}
                      className="text-red-600 hover:text-red-800 text-[10px] font-black uppercase px-2 py-1"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>GST %</span>
                  <input
                    type="number"
                    value={data.taxRate}
                    onChange={(e) => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-12 bg-white border border-slate-200 rounded px-1.5 py-1 text-center font-black"
                  />
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar/Receipt Section */}
        <section className="w-full lg:w-[400px] shrink-0">
          <div className="no-print">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4 flex justify-between items-center">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase">Receipt Preview</h4>
                <p className="text-[9px] text-slate-500">Visible on bill print</p>
              </div>
              <div className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                Live
              </div>
            </div>
          </div>
          <ReceiptPreview data={data} />
        </section>
      </main>
    </div>
  );
};

export default App;
