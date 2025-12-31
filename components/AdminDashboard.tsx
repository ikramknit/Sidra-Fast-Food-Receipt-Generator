
import React, { useMemo, useState } from 'react';
import { Trash2, TrendingUp, IndianRupee, ShoppingBag, Clock, FileText, Download, Search, Eye, Edit, ArrowUpDown, Calendar } from 'lucide-react';
import { SavedReceipt } from '../types.ts';

interface Props {
  history: SavedReceipt[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onView: (receipt: SavedReceipt) => void;
  onEdit: (receipt: SavedReceipt) => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const AdminDashboard: React.FC<Props> = ({ history, onDelete, onClearAll, onView, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // Default to start of current month
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof SavedReceipt | 'grandTotal'; direction: 'asc' | 'desc' } | null>(null);

  // Filter history by date range first
  const historyInRange = useMemo(() => {
    return history.filter(h => {
      const hDate = h.date; // YYYY-MM-DD
      const start = fromDate || '0000-00-00';
      const end = toDate || '9999-12-31';
      return hDate >= start && hDate <= end;
    });
  }, [history, fromDate, toDate]);

  const stats = useMemo(() => {
    const totalRevenue = historyInRange.reduce((sum, h) => sum + h.grandTotal, 0);
    const totalOrders = historyInRange.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const itemSales: Record<string, { qty: number; rev: number }> = {};
    historyInRange.forEach(bill => {
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
  }, [historyInRange]);

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...historyInRange];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(h => 
        h.billNo.toLowerCase().includes(lower) || 
        h.customerName.toLowerCase().includes(lower) ||
        (h.customerPhone && h.customerPhone.includes(lower))
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key as keyof SavedReceipt];
        const valB = b[sortConfig.key as keyof SavedReceipt];
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [historyInRange, searchTerm, sortConfig]);

  const requestSort = (key: keyof SavedReceipt | 'grandTotal') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    if (filteredAndSortedHistory.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Define CSV headers
    const headers = ["Bill No", "Date", "Customer Name", "Customer Phone", "Items Count", "SubTotal (INR)", "Tax (INR)", "Grand Total (INR)"];
    
    // Map data to rows
    const rows = filteredAndSortedHistory.map(h => [
      h.billNo,
      formatDate(h.date),
      h.customerName || "Cash Sale",
      h.customerPhone || "N/A",
      h.items.length,
      h.subTotal.toFixed(2),
      h.taxAmount.toFixed(2),
      h.grandTotal.toFixed(2)
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sidra_Report_${fromDate || 'all'}_to_${toDate || 'today'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Date Range Filter Header */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-red-900" size={18} />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Report Period</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">From:</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold focus:ring-1 focus:ring-red-900 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">To:</label>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold focus:ring-1 focus:ring-red-900 outline-none"
            />
          </div>
          <button 
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
            className="text-[10px] font-black text-slate-400 hover:text-red-900 uppercase"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</p>
            <h3 className="text-2xl font-black text-slate-800">₹{stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orders</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average</p>
            <h3 className="text-2xl font-black text-slate-800">₹{Math.round(stats.avgOrderValue)}</h3>
          </div>
        </div>
      </div>

      {/* Transaction Table Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="text-red-900" size={18} />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Period Records</h3>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search Bill #, Name or Phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-bold outline-none focus:ring-1 focus:ring-red-900"
              />
            </div>
            <button 
              onClick={onClearAll}
              className="text-[10px] font-black text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 uppercase"
            >
              Clear DB
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-4 py-3 cursor-pointer hover:text-red-900" onClick={() => requestSort('billNo')}>
                  <div className="flex items-center gap-1">Bill No <ArrowUpDown size={10} /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-red-900" onClick={() => requestSort('date')}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown size={10} /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-red-900" onClick={() => requestSort('customerName')}>
                  <div className="flex items-center gap-1">Customer <ArrowUpDown size={10} /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-red-900 text-right" onClick={() => requestSort('grandTotal')}>
                  <div className="flex items-center justify-end gap-1">Amount <ArrowUpDown size={10} /></div>
                </th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAndSortedHistory.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">#{h.billNo}</td>
                  <td className="px-4 py-3 text-slate-600 font-bold">{formatDate(h.date)}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">
                    <div className="flex flex-col">
                      <span>{h.customerName || 'Cash Sale'}</span>
                      {h.customerPhone && <span className="text-[10px] text-slate-400">{h.customerPhone}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">₹{h.grandTotal.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onView(h)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-all"
                        title="View Receipt"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => onEdit(h)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-md transition-all"
                        title="Edit Bill"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(h.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAndSortedHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-bold">No records found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analytics Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
            <Clock size={14} className="text-amber-500" /> Top Selling (Period)
          </h3>
          <div className="space-y-3">
            {stats.topItems.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-300">0{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="text-red-900">{item.qty} units</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-900/80 rounded-full" 
                      style={{ width: stats.topItems[0].qty > 0 ? `${(item.qty / stats.topItems[0].qty) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {stats.topItems.length === 0 && (
              <p className="text-center py-8 text-slate-400 text-[10px] font-bold uppercase">No items sold in this range</p>
            )}
          </div>
        </section>

        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center">
           <Download size={24} className="text-slate-300 mb-2" />
           <h4 className="text-[10px] font-black text-slate-800 uppercase">Export Period Report</h4>
           <p className="text-[9px] text-slate-400 mb-3 px-8">Export data for the selected date range ({formatDate(fromDate)} to {formatDate(toDate)}).</p>
           <button 
             onClick={handleExportCSV}
             className="bg-slate-900 text-white text-[10px] font-black px-6 py-2 rounded-lg hover:bg-slate-800 transition-all uppercase tracking-widest"
           >
             Download Excel
           </button>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
