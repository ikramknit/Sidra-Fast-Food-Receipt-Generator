
import React, { useMemo } from 'react';
import { Trash2, TrendingUp, IndianRupee, ShoppingBag, Clock, FileText, Download } from 'lucide-react';
import { SavedReceipt } from '../types.ts';

interface Props {
  history: SavedReceipt[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const AdminDashboard: React.FC<Props> = ({ history, onDelete, onClearAll }) => {
  const stats = useMemo(() => {
    const totalRevenue = history.reduce((sum, h) => sum + h.grandTotal, 0);
    const totalOrders = history.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate top items
    const itemSales: Record<string, { qty: number; rev: number }> = {};
    history.forEach(bill => {
      bill.items.forEach(item => {
        if (!itemSales[item.description]) {
          itemSales[item.description] = { qty: 0, rev: 0 };
        }
        itemSales[item.description].qty += item.qty;
        itemSales[item.description].rev += (item.qty * item.rate);
      });
    });

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { totalRevenue, totalOrders, avgOrderValue, topItems };
  }, [history]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600">
            <IndianRupee size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
            <h3 className="text-3xl font-black text-slate-800">₹{stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Bills</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. Bill Value</p>
            <h3 className="text-3xl font-black text-slate-800">₹{Math.round(stats.avgOrderValue)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Items List */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-amber-500" size={20} />
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Most Popular Items</h3>
          </div>
          <div className="space-y-5">
            {stats.topItems.map((item, idx) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-700">{idx + 1}. {item.name}</span>
                  <span className="text-slate-400">{item.qty} units sold</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-900 transition-all duration-1000" 
                    style={{ width: `${(item.qty / stats.topItems[0].qty) * 100}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-right text-slate-400 font-bold uppercase">
                  Rev: ₹{item.rev.toLocaleString()}
                </div>
              </div>
            ))}
            {stats.topItems.length === 0 && (
              <p className="text-center py-12 text-slate-400 italic">No sales data yet.</p>
            )}
          </div>
        </section>

        {/* Action Panel */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
           <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Export & Utilities</h3>
            <p className="text-sm text-slate-500 mb-6">Download your business data for accounting.</p>
           </div>
           <div className="space-y-3">
              <button 
                onClick={() => alert("CSV Export feature coming soon!")}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all"
              >
                <Download size={18} /> Export Sales CSV
              </button>
              <button 
                onClick={onClearAll}
                className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold border border-red-100 transition-all"
              >
                <Trash2 size={18} /> Clear Data History
              </button>
           </div>
        </section>
      </div>

      {/* Recent Transactions Table */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-500" size={20} />
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Recent Transactions</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">Total {history.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Bill No</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">#{h.billNo}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(h.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{h.customerName || 'Cash Sale'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                      {h.items.length} items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">₹{h.grandTotal.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onDelete(h.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
