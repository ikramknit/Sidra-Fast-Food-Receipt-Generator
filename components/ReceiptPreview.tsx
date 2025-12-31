
import React from 'react';
import { ReceiptData } from '../types.ts';

interface Props {
  data: ReceiptData;
}

const ReceiptPreview: React.FC<Props> = ({ data }) => {
  const subTotal = data.items.reduce((acc, item) => acc + item.qty * item.rate, 0);
  const taxAmount = (subTotal * data.taxRate) / 100;
  const grandTotal = subTotal + taxAmount;

  // Standard row count for a professional look
  const MAX_ROWS = 10;
  const emptyRows = Array.from({ length: Math.max(0, MAX_ROWS - data.items.length) });

  return (
    <div className="print-area w-full max-w-[450px] bg-white border border-gray-300 shadow-xl p-8 rounded-sm receipt-font text-gray-800 mx-auto">
      {/* Logo and Header */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-24 h-24 mb-4">
          <div className="absolute inset-0 border-2 border-receipt-maroon rounded-full flex items-center justify-center p-1.5">
            <div className="w-full h-full border-double border-4 border-receipt-maroon rounded-full flex flex-col items-center justify-center text-center">
              <div className="flex gap-0.5 items-end mb-0.5">
                 <div className="w-2 h-4 bg-receipt-maroon rounded-t-sm"></div>
                 <div className="w-4 h-3 bg-receipt-maroon rounded-t-sm"></div>
                 <div className="w-3 h-3 bg-receipt-maroon rounded-sm"></div>
              </div>
              <span className="text-[8px] font-black text-receipt-maroon leading-tight uppercase">Sidra</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-receipt-maroon tracking-tight mb-0.5">SIDRA FAST FOOD</h1>
        <p className="text-lg italic font-semibold text-receipt-maroon mb-2">Fresh & Tasty</p>
        
        <div className="border-t border-receipt-maroon pt-1 px-8 w-full text-center">
            <h2 className="text-sm font-bold text-receipt-maroon tracking-[0.4em] uppercase">BILL BOOK</h2>
        </div>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5 text-sm font-semibold">
        <div className="flex border-b border-gray-300 pb-0.5">
          <span className="text-gray-500 mr-2 uppercase text-[10px] pt-1">Date:</span>
          <span className="flex-1 px-1 font-bold">{data.date}</span>
        </div>
        <div className="flex border-b border-gray-300 pb-0.5">
          <span className="text-gray-500 mr-2 uppercase text-[10px] pt-1">Bill:</span>
          <span className="flex-1 px-1 font-bold">#{data.billNo}</span>
        </div>
        <div className="col-span-2 flex border-b border-gray-300 pb-0.5">
          <span className="text-gray-500 mr-2 uppercase text-[10px] pt-1">Name:</span>
          <span className="flex-1 px-1 font-bold">{data.customerName || 'Cash Sale'}</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-receipt-maroon rounded-sm overflow-hidden mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-receipt-maroon text-white text-[10px] uppercase tracking-wider font-black">
              <th className="border-r border-white/20 py-2 w-8">S.No</th>
              <th className="border-r border-white/20 py-2 px-3 text-left">Description</th>
              <th className="border-r border-white/20 py-2 w-10 text-center">Qty</th>
              <th className="border-r border-white/20 py-2 w-14 text-center">Rate</th>
              <th className="py-2 px-3 w-20 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-bold">
            {data.items.map((item, index) => (
              <tr key={item.id} className="border-b border-receipt-maroon/20">
                <td className="border-r border-receipt-maroon/20 py-2 text-center text-gray-400">{index + 1}</td>
                <td className="border-r border-receipt-maroon/20 py-2 px-3 capitalize text-gray-700">{item.description || '---'}</td>
                <td className="border-r border-receipt-maroon/20 py-2 text-center">{item.qty}</td>
                <td className="border-r border-receipt-maroon/20 py-2 text-center">{item.rate.toFixed(2)}</td>
                <td className="py-2 px-3 text-right">{(item.qty * item.rate).toFixed(2)}</td>
              </tr>
            ))}
            {emptyRows.map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-receipt-maroon/5 h-8">
                <td className="border-r border-receipt-maroon/5"></td>
                <td className="border-r border-receipt-maroon/5"></td>
                <td className="border-r border-receipt-maroon/5"></td>
                <td className="border-r border-receipt-maroon/5"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="bg-gray-50/50">
            <div className="flex">
                <div className="flex-1 p-3 flex flex-col justify-end">
                    <span className="text-[9px] uppercase text-gray-400 block mb-3">Amount in words:</span>
                    <span className="border-b border-gray-200 w-full h-4 italic text-[9px]"></span>
                </div>
                <div className="w-40 border-l border-receipt-maroon">
                    <div className="flex justify-between px-3 py-1.5 border-b border-receipt-maroon/20">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Total</span>
                        <span className="text-xs">{subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5 border-b border-receipt-maroon/20">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">GST {data.taxRate}%</span>
                        <span className="text-xs">{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 bg-receipt-maroon text-white">
                        <span className="text-xs font-black uppercase">Net Total</span>
                        <span className="text-xs font-black">₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-6 flex justify-between items-end mb-8 px-2">
        <div className="text-center">
            <div className="w-24 border-b border-gray-300 h-8 mb-1"></div>
            <span className="text-[8px] font-bold uppercase text-gray-400">Customer Sig.</span>
        </div>
        <div className="text-center">
            <div className="w-24 border-b border-receipt-maroon h-8 mb-1"></div>
            <span className="text-[8px] font-black uppercase text-receipt-maroon">Authorised Signatory</span>
        </div>
      </div>

      {/* Info Footer */}
      <div className="text-center space-y-1.5 pt-4 border-t border-receipt-maroon/10">
        <p className="text-xl font-black text-receipt-maroon tracking-wider">THANK YOU!</p>
        <p className="text-[9px] leading-relaxed font-bold max-w-[300px] mx-auto text-gray-500">
          Near Star Palace In front of Eagle Eye center Behat Road Saharanpur UP-247001.
        </p>
        <div className="flex justify-center gap-4 text-[9px] font-black text-receipt-maroon uppercase tracking-tighter">
           <span>Mob: 9286670192</span>
           <span>sidrafastfood.com</span>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;
