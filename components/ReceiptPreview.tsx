
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
  // Only display items that have a description to keep the bill compact
  const validItems = data.items.filter(item => item.description.trim() !== '');
  
  const subTotal = validItems.reduce((acc, item) => acc + item.qty * item.rate, 0);
  const taxAmount = (subTotal * data.taxRate) / 100;
  const grandTotal = subTotal + taxAmount;

  return (
    <div className="print-area w-full max-w-[400px] bg-white border border-gray-200 shadow-xl p-6 rounded-sm receipt-font text-gray-800 mx-auto">
      {/* Compact Logo and Header */}
      <div className="flex flex-col items-center mb-3">
        <div className="relative w-16 h-16 mb-2">
          <div className="absolute inset-0 border border-receipt-maroon rounded-full flex items-center justify-center p-1">
            <div className="w-full h-full border-double border-2 border-receipt-maroon rounded-full flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black text-receipt-maroon leading-tight uppercase">S</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-receipt-maroon tracking-tight mb-0">SIDRA FAST FOOD</h1>
        <p className="text-xs italic font-semibold text-receipt-maroon mb-1">Fresh & Tasty</p>
        
        <div className="border-t border-receipt-maroon pt-0.5 px-4 w-full text-center">
            <h2 className="text-[10px] font-bold text-receipt-maroon tracking-[0.3em] uppercase">CASH MEMO</h2>
        </div>
      </div>

      {/* Meta Info - More Compact */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-[11px] font-semibold">
        <div className="flex border-b border-gray-200 pb-0.5">
          <span className="text-gray-400 mr-1 uppercase text-[8px]">Date:</span>
          <span className="flex-1 font-bold">{formatDate(data.date)}</span>
        </div>
        <div className="flex border-b border-gray-200 pb-0.5">
          <span className="text-gray-400 mr-1 uppercase text-[8px]">Bill:</span>
          <span className="flex-1 font-bold">#{data.billNo}</span>
        </div>
        <div className="col-span-2 flex border-b border-gray-200 pb-0.5">
          <span className="text-gray-400 mr-1 uppercase text-[8px]">Cust:</span>
          <span className="flex-1 font-bold truncate">
            {data.customerName || 'Cash Sale'}
            {data.customerPhone && <span className="text-[9px] ml-1 text-gray-500">({data.customerPhone})</span>}
          </span>
        </div>
      </div>

      {/* Dynamic Table - No fixed height/rows */}
      <div className="border border-receipt-maroon rounded-sm overflow-hidden mb-3">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-receipt-maroon text-white text-[9px] uppercase tracking-wider font-bold">
              <th className="border-r border-white/20 py-1 w-6">#</th>
              <th className="border-r border-white/20 py-1 px-2 text-left">Item</th>
              <th className="border-r border-white/20 py-1 w-8 text-center">Qty</th>
              <th className="border-r border-white/20 py-1 w-12 text-center">Rate</th>
              <th className="py-1 px-2 w-16 text-right">Amt</th>
            </tr>
          </thead>
          <tbody className="text-[10px] font-bold">
            {validItems.length > 0 ? (
              validItems.map((item, index) => (
                <tr key={item.id} className="border-b border-receipt-maroon/10">
                  <td className="border-r border-receipt-maroon/10 py-1 text-center text-gray-400">{index + 1}</td>
                  <td className="border-r border-receipt-maroon/10 py-1 px-2 capitalize text-gray-700">{item.description}</td>
                  <td className="border-r border-receipt-maroon/10 py-1 text-center">{item.qty}</td>
                  <td className="border-r border-receipt-maroon/10 py-1 text-center">{item.rate.toFixed(0)}</td>
                  <td className="py-1 px-2 text-right">{(item.qty * item.rate).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr className="h-6">
                <td colSpan={5} className="text-center text-[8px] text-gray-300 italic">No items added</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Compact Totals Section */}
        <div className="bg-gray-50/30">
            <div className="flex">
                <div className="flex-1 px-2 py-1 flex items-end">
                    <span className="text-[7px] text-gray-400 italic">E.&O.E.</span>
                </div>
                <div className="w-32 border-l border-receipt-maroon">
                    <div className="flex justify-between px-2 py-0.5 border-b border-receipt-maroon/10">
                        <span className="text-[8px] font-bold text-gray-500 uppercase">SubTotal</span>
                        <span className="text-[9px]">{subTotal.toFixed(2)}</span>
                    </div>
                    {data.taxRate > 0 && (
                      <div className="flex justify-between px-2 py-0.5 border-b border-receipt-maroon/10">
                          <span className="text-[8px] font-bold text-gray-500 uppercase">Tax {data.taxRate}%</span>
                          <span className="text-[9px]">{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-2 py-1 bg-receipt-maroon text-white">
                        <span className="text-[9px] font-black uppercase tracking-tighter">Total</span>
                        <span className="text-[10px] font-black">₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Signature Section - Compact */}
      <div className="mt-4 flex justify-between items-end px-1 mb-4">
        <div className="text-center">
            <div className="w-16 border-b border-gray-200 h-4 mb-0.5"></div>
            <span className="text-[7px] font-bold uppercase text-gray-400">Customer</span>
        </div>
        <div className="text-center">
            <div className="w-20 border-b border-receipt-maroon h-4 mb-0.5"></div>
            <span className="text-[7px] font-black uppercase text-receipt-maroon">Signature</span>
        </div>
      </div>

      {/* Small Footer */}
      <div className="text-center space-y-0.5 pt-2 border-t border-receipt-maroon/10">
        <p className="text-sm font-black text-receipt-maroon tracking-wider">THANK YOU!</p>
        <p className="text-[8px] font-bold text-gray-500 leading-tight">
          Behat Road, Saharanpur, UP-247001
        </p>
        <div className="flex justify-center gap-2 text-[8px] font-black text-receipt-maroon uppercase">
           <span>9286670192</span>
           <span>sidrafastfood.com</span>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;
