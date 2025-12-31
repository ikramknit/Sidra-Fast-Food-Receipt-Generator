
import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Printer, Trash2, Receipt } from 'lucide-react';
import { ReceiptData, ReceiptItem } from './types';
import ReceiptPreview from './components/ReceiptPreview';

const App: React.FC = () => {
  const [data, setData] = useState<ReceiptData>({
    date: new Date().toISOString().split('T')[0],
    billNo: '1001',
    customerName: '',
    items: [{ id: '1', description: '', qty: 1, rate: 0 }],
    taxRate: 5,
  });

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

  const updateItem = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b no-print">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="text-red-900 w-8 h-8" />
            <h1 className="text-xl font-bold text-gray-800">Sidra Billing System</h1>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
          >
            <Printer size={18} />
            Print Receipt
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <section className="flex-1 bg-white p-6 rounded-xl shadow-md border border-gray-100 no-print">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-700 border-b pb-2">
            Billing Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Bill Date</label>
              <input
                type="date"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Bill Number</label>
              <input
                type="text"
                value={data.billNo}
                onChange={(e) => setData({ ...data, billNo: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-900 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
              <input
                type="text"
                placeholder="Enter customer name"
                value={data.customerName}
                onChange={(e) => setData({ ...data, customerName: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-900 outline-none"
              />
            </div>
          </div>

          <h3 className="text-md font-semibold mb-4 flex justify-between items-center text-gray-700">
            Order Items
            <button
              onClick={addItem}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md flex items-center gap-1 transition-all"
            >
              <Plus size={16} /> Add Item
            </button>
          </h3>

          <div className="space-y-4">
            {data.items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="col-span-1 text-center text-xs text-gray-400 pb-2">{index + 1}</div>
                <div className="col-span-5">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Chicken Burger, Fries, etc."
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full border-b bg-transparent border-gray-300 py-1 focus:border-red-900 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                    className="w-full border-b bg-transparent border-gray-300 py-1 focus:border-red-900 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Rate</label>
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full border-b bg-transparent border-gray-300 py-1 focus:border-red-900 outline-none"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 p-1.5"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="flex items-center gap-2 max-w-xs ml-auto">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Tax (%)</label>
              <input
                type="number"
                value={data.taxRate}
                onChange={(e) => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-20 border rounded-lg px-2 py-1 focus:ring-2 focus:ring-red-900 outline-none text-right"
              />
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="w-full lg:w-[450px] flex justify-center lg:block">
          <ReceiptPreview data={data} />
        </section>
      </main>
    </div>
  );
};

export default App;
