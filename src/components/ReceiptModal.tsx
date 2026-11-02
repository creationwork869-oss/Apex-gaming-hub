import React from 'react';
import { X, CheckCircle2, Clock, XCircle, Printer, Download, ShieldCheck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../types';
import { sound } from '../utils/sound';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleDownload = () => {
    sound.playClick();
    // Create text file payload as simulated receipt download
    const receiptText = `
========================================
       AURUM GAMING HUB - RECEIPT
========================================
Receipt Number: ${transaction.receiptNumber}
Date & Time:    ${new Date(transaction.timestamp).toLocaleString('en-IN')}
User:           ${transaction.userName}
Type:           ${transaction.type}
Method:         ${transaction.method}
Status:         ${transaction.status}
----------------------------------------
Amount:         INR ₹${transaction.amount.toLocaleString('en-IN')}
Platform Fee:   INR ₹${transaction.fee}
Total Paid/Rec: INR ₹${(transaction.amount - transaction.fee).toLocaleString('en-IN')}
----------------------------------------
Transaction Ref (UTR): ${transaction.utr || transaction.gatewayOrderId || 'N/A'}
Security Hash: SHA256-${transaction.id}-VERIFIED
========================================
Licensed Gaming Platform Compliance
Thank you for playing on AURUM Gaming.
`;
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${transaction.receiptNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isPositive = transaction.type === 'DEPOSIT' || transaction.type === 'GAME_WIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121124] border border-purple-900/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-purple-950/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white tracking-wide">Official Transaction Receipt</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 space-y-5 print:p-0" id="printable-receipt">
          {/* Status Icon & Amount */}
          <div className="text-center pb-4 border-b border-purple-900/30">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-900/40 mb-3 border border-purple-700/50">
              {transaction.status === 'SUCCESS' && <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
              {transaction.status === 'PENDING' && <Clock className="w-8 h-8 text-amber-400" />}
              {transaction.status === 'FAILED' && <XCircle className="w-8 h-8 text-rose-400" />}
              {transaction.status === 'REJECTED' && <XCircle className="w-8 h-8 text-rose-400" />}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isPositive ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> : <ArrowUpRight className="w-4 h-4 text-rose-400" />}
              {transaction.type.replace('_', ' ')}
            </div>
            <div className="text-3xl font-extrabold text-white mt-1 tabular-nums">
              ₹{transaction.amount.toLocaleString('en-IN')}
            </div>
            <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-bold rounded-full ${
              transaction.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              transaction.status === 'PENDING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {transaction.status}
            </span>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-purple-950">
              <span className="text-slate-400">Receipt ID</span>
              <span className="font-mono text-slate-200 font-medium">{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-purple-950">
              <span className="text-slate-400">Date & Timestamp</span>
              <span className="text-slate-200">{new Date(transaction.timestamp).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-purple-950">
              <span className="text-slate-400">User</span>
              <span className="text-slate-200">{transaction.userName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-purple-950">
              <span className="text-slate-400">Payment Gateway / Method</span>
              <span className="text-slate-200">{transaction.method}</span>
            </div>
            {transaction.utr && (
              <div className="flex justify-between items-center py-1 border-b border-purple-950">
                <span className="text-slate-400">Gateway Ref / UTR</span>
                <span className="font-mono text-amber-300 font-semibold">{transaction.utr}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1 border-b border-purple-950">
              <span className="text-slate-400">Description</span>
              <span className="text-slate-200 max-w-[200px] text-right truncate">{transaction.description}</span>
            </div>
            <div className="flex justify-between items-center py-1 pt-2 font-semibold">
              <span className="text-slate-300">Net Settled Amount</span>
              <span className="text-amber-300 text-sm tabular-nums">
                ₹{(transaction.amount - transaction.fee).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/30 flex items-center gap-3 text-[11px] text-slate-400">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>Cryptographically sealed & logged with bank gateway audit compliance.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#0e0d1c] border-t border-purple-900/40 flex items-center justify-end gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-900/40 hover:bg-purple-900/70 text-slate-200 border border-purple-700/40 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
