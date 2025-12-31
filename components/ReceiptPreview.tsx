
import React from 'react';
import { ReceiptData } from '../types.ts';

interface Props {
  data: ReceiptData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const ReceiptPreview: React.FC<Props> = ({ data }) => {
  const validItems = data.items.filter(item => item.description.trim() !== '');
  
  const subTotal = validItems.reduce((acc, item) => acc + item.qty * item.rate, 0);
  const taxAmount = (subTotal * data.taxRate) / 100;
  const grandTotal = subTotal + taxAmount;

  // Colors derived from the logo
  const sidraMaroon = "#7A1616";
  const sidraGold = "#C5A059";

  return (
    <div className="print-area w-full max-w-[420px] bg-[#FFFDF9] border border-gray-300 shadow-2xl p-8 rounded-sm receipt-font text-slate-900 mx-auto relative overflow-hidden">
      {/* Decorative Corner Accents (Optional for Print) */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#7A1616]/10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#7A1616]/10 pointer-events-none"></div>

      {/* Header Section with Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-28 h-28 mb-3 relative">
          <img 
            src="https://api.screenshotone.com/take?url=https%3A%2F%2Fstorage.googleapis.com%2Fstatic.smart-re.pro%2Fusers%2Flogo_sidra.png&viewport_width=1024&viewport_height=768&block_ads=true&block_cookie_banners=true&click_accept_cookies=true&delay=0&format=png" 
            alt="Sidra Logo" 
            className="w-full h-full object-contain filter drop-shadow-sm"
            onError={(e) => {
                // Fallback to text if image fails
                (e.target as any).style.display = 'none';
                (e.target as any).nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center border-4 border-[#7A1616] rounded-full">
             <span className="text-4xl font-black text-[#7A1616]">S</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter text-[#7A1616] mb-1">SIDRA FAST FOOD</h1>
        <div className="flex items-center gap-3 w-full mb-2">
            <div className="h-[1px] bg-[#C5A059] flex-1"></div>
            <p className="text-[10px] font-black tracking-[0.2em] text-[#C5A059] uppercase">Professional Billing</p>
            <div className="h-[1px] bg-[#C5A059] flex-1"></div>
        </div>
        
        <div className="text-center space-y-0.5 text-[10px] font-bold text-slate-600 px-4">
            <p className="leading-tight">Near Star Palace In Front of Eagle Eye Center,</p>
            <p>Behat road, Saharanpur, UP - 247001</p>
        </div>
      </div>

      {/* Bill Meta Data */}
      <div className="bg-[#7A1616]/5 border-y-2 border-[#7A1616]/20 p-3 mb-6 grid grid-cols-2 gap-y-2 text-[11px] font-bold">
        <div className="flex flex-col">
          <span className="text-[8px] text-[#C5A059] uppercase">Invoiced To</span>
          <span className="truncate">{data.customerName || 'Walk-in Customer'}</span>
          {data.customerPhone && <span className="text-[10px] text-slate-500">{data.customerPhone}</span>}
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-[8px] text-[#C5A059] uppercase">Bill Details</span>
          <span>No: #{data.billNo}</span>
          <span>Date: {formatDate(data.date)}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-[#7A1616] text-[9px] font-black text-[#7A1616] uppercase tracking-wider">
              <th className="py-2 text-left w-8">#</th>
              <th className="py-2 text-left px-2">Description</th>
              <th className="py-2 text-center w-10">Qty</th>
              <th className="py-2 text-center w-14">Rate</th>
              <th className="py-2 text-right w-20">Amount</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {validItems.length > 0 ? (
              validItems.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-2.5 text-slate-400 font-medium">{index + 1}</td>
                  <td className="py-2.5 px-2 font-bold text-slate-800 capitalize">{item.description}</td>
                  <td className="py-2.5 text-center font-bold">{item.qty}</td>
                  <td className="py-2.5 text-center text-slate-600">₹{item.rate.toFixed(0)}</td>
                  <td className="py-2.5 text-right font-black text-slate-900">₹{(item.qty * item.rate).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-300 italic">Add items to generate bill</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals & Tax */}
      <div className="flex justify-end mb-8">
        <div className="w-48 space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>SUBTOTAL</span>
                <span>₹{subTotal.toFixed(2)}</span>
            </div>
            {data.taxRate > 0 && (
              <div className="flex justify-between text-[11px] font-bold text-[#C5A059]">
                  <span>GST ({data.taxRate}%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#7A1616]/20">
                <div className="flex justify-between items-center bg-[#7A1616] text-white p-2 rounded-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest">NET TOTAL</span>
                    <span className="text-sm font-black">₹{grandTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 px-2 mb-8">
        <div className="text-center pt-8 border-t border-slate-200">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Customer Signature</span>
        </div>
        <div className="text-center pt-8 border-t-2 border-[#7A1616]">
            <span className="text-[8px] font-black text-[#7A1616] uppercase tracking-widest">Authorized Signatory</span>
        </div>
      </div>

      {/* Professional Footer */}
      <div className="text-center bg-slate-50 -mx-8 -mb-8 p-6 border-t border-slate-100">
        <div className="flex justify-center gap-4 mb-3">
             <div className="flex items-center gap-1 text-[9px] font-black text-[#7A1616]">
                 <span>TEL:</span> 9286670192
             </div>
             <div className="w-[1px] h-3 bg-slate-300"></div>
             <div className="flex items-center gap-1 text-[9px] font-black text-[#7A1616]">
                 <span>WEB:</span> www.sidrafastfood.com
             </div>
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Email: sidra.malik@gmail.com</p>
        <p className="text-[12px] font-black text-[#7A1616] italic tracking-tight">"Quality Food, Quality Service"</p>
        <div className="mt-4 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-[#C5A059]"></div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;
