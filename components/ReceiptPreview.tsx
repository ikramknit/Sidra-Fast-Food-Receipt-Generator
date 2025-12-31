
import React from 'react';
import { ReceiptData } from '../types';

interface Props {
  data: ReceiptData;
}

const ReceiptPreview: React.FC<Props> = ({ data }) => {
  const subTotal = data.items.reduce((acc, item) => acc + item.qty * item.rate, 0);
  const taxAmount = (subTotal * data.taxRate) / 100;
  const grandTotal = subTotal + taxAmount;

  // Fill up empty rows to match the reference image's look
  const MAX_ROWS = 10;
  const emptyRows = Array.from({ length: Math.max(0, MAX_ROWS - data.items.length) });

  return (
    <div className="print-area w-full max-w-[450px] bg-white border border-gray-300 shadow-2xl p-8 rounded-sm receipt-font text-gray-800">
      {/* Logo and Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 mb-4">
          {/* Simulated Circular Logo */}
          <div className="absolute inset-0 border-2 border-receipt-maroon rounded-full flex items-center justify-center p-2">
            <div className="w-full h-full border-double border-4 border-receipt-maroon rounded-full flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-receipt-maroon">★★★</span>
              <div className="flex gap-1 items-end my-1">
                 <div className="w-4 h-6 bg-receipt-maroon rounded-t-sm"></div>
                 <div className="w-6 h-4 bg-receipt-maroon rounded-t-lg"></div>
                 <div className="w-5 h-5 bg-receipt-maroon rounded-md"></div>
              </div>
              <span className="text-[10px] leading-tight font-bold text-receipt-maroon uppercase">Sidra Fast Food</span>
              <span className="text-[6px] text-receipt-maroon uppercase">Fresh & Tasty</span>
              <span className="text-[10px] font-bold text-receipt-maroon">★</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-receipt-maroon tracking-tight mb-1">SIDRA FAST FOOD</h1>
        <p className="text-xl italic font-semibold text-receipt-maroon">Fresh & Tasty</p>
        <div className="mt-1 border-y border-receipt-maroon py-0.5 px-4">
            <h2 className="text-lg font-bold text-receipt-maroon tracking-[0.2em]">BILL BOOK</h2>
        </div>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4 text-sm font-semibold">
        <div className="flex border-b border-gray-400">
          <span className="mr-1">Date:</span>
          <span className="flex-1 px-1 font-normal">{data.date}</span>
        </div>
        <div className="flex border-b border-gray-400">
          <span className="mr-1">Bill No.:</span>
          <span className="flex-1 px-1 font-normal">{data.billNo}</span>
        </div>
        <div className="col-span-2 flex border-b border-gray-400">
          <span className="mr-1">Customer Name:</span>
          <span className="flex-1 px-1 font-normal">{data.customerName || '_______________________'}</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-receipt-maroon overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-receipt-maroon text-white text-xs">
              <th className="border-r border-white/30 py-1.5 px-1 w-10">S.No.</th>
              <th className="border-r border-white/30 py-1.5 px-2 text-left">Item Description</th>
              <th className="border-r border-white/30 py-1.5 px-1 w-12 text-center">Qty</th>
              <th className="border-r border-white/30 py-1.5 px-1 w-16 text-center">Rate</th>
              <th className="py-1.5 px-2 w-20 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-xs font-semibold">
            {data.items.map((item, index) => (
              <tr key={item.id} className="border-b border-receipt-maroon/20">
                <td className="border-r border-receipt-maroon/20 py-2 text-center">{index + 1}</td>
                <td className="border-r border-receipt-maroon/20 py-2 px-2 capitalize">{item.description}</td>
                <td className="border-r border-receipt-maroon/20 py-2 text-center">{item.qty}</td>
                <td className="border-r border-receipt-maroon/20 py-2 text-center">{item.rate.toFixed(2)}</td>
                <td className="py-2 px-2 text-right">{(item.qty * item.rate).toFixed(2)}</td>
              </tr>
            ))}
            {emptyRows.map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-receipt-maroon/10 h-8">
                <td className="border-r border-receipt-maroon/10"></td>
                <td className="border-r border-receipt-maroon/10"></td>
                <td className="border-r border-receipt-maroon/10"></td>
                <td className="border-r border-receipt-maroon/10"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex flex-col items-end border-t border-receipt-maroon">
            <div className="flex w-full">
                <div className="flex-1"></div>
                <div className="w-36 border-l border-receipt-maroon">
                    <div className="flex justify-between px-2 py-1 border-b border-receipt-maroon/30">
                        <span className="text-xs font-bold">Total</span>
                        <span className="text-xs">{subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 border-b border-receipt-maroon/30">
                        <span className="text-xs font-bold">Tax ({data.taxRate}%)</span>
                        <span className="text-xs">{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1.5 bg-receipt-maroon text-white font-black">
                        <span className="text-sm">Grand Total</span>
                        <span className="text-sm">{grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-between items-end mb-8">
        <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Signature:</span>
                <span className="border-b border-gray-400 flex-1 h-6"></span>
            </div>
        </div>
        <div className="w-1/4"></div>
      </div>

      <div className="text-center space-y-1 mt-6 pt-4 border-t border-receipt-maroon/20">
        <p className="text-xl font-bold text-receipt-maroon italic">Thank You For Your Business!</p>
        <p className="text-[10px] leading-tight font-semibold">
          <span className="font-bold">Address:</span> Near Star Palace In front of Eagle Eye center Behat Road Saharanpur UP-247001.
        </p>
        <div className="flex flex-wrap justify-center gap-x-4 text-[10px] font-semibold">
           <p><span className="font-bold">Contact No.:</span> 9286670192</p>
           <p><span className="font-bold">Email:</span> sidra.malik@gmail.com</p>
        </div>
        <p className="text-[10px] font-bold">Website: <span className="font-normal">www.sidrafastfood.com</span></p>
      </div>
    </div>
  );
};

export default ReceiptPreview;
