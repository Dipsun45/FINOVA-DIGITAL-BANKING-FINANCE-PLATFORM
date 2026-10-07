import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Lock,
  DollarSign,
  CheckCircle2,
  Printer,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';

export default function ATMSimulatorModal({ isOpen, onClose, cards = [], accounts = [], onWithdrawSuccess }) {
  const [step, setStep] = useState(1); // 1: Select Card, 2: Enter PIN, 3: Amount, 4: Receipt
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0]);
    }
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [cards, accounts]);

  if (!isOpen) return null;

  const handleKeypadPress = (val) => {
    if (val === 'CLEAR') {
      setPin('');
    } else if (val === 'BACK') {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < 4) {
      setPin((prev) => prev + val);
    }
  };

  const handleVerifyPin = () => {
    if (pin.length !== 4) {
      toast.error('Please enter 4-digit PIN');
      return;
    }
    setStep(3);
  };

  const handleWithdrawCash = async () => {
    const withdrawAmt = parseFloat(customAmount || amount);
    if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
      toast.error('Please select or enter a valid cash withdrawal amount');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/cards/atm-withdraw', {
        cardId: selectedCard._id,
        pin,
        amount: withdrawAmt,
        accountId: selectedAccount?._id || selectedCard.account
      });

      if (res.data.success) {
        toast.success('Cash Dispensed Successfully!');
        setReceiptData({
          amount: withdrawAmt,
          cardNumber: selectedCard.cardNumber,
          accountNumber: selectedAccount?.accountNumber || 'Primary Account',
          refNo: res.data.transaction?.referenceNumber || ('ATM-' + Math.floor(10000000 + Math.random() * 90000000)),
          remainingBalance: res.data.remainingBalance,
          date: new Date()
        });
        setStep(4);
        if (onWithdrawSuccess) onWithdrawSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ATM Cash Withdrawal Failed');
      if (err.response?.status === 401) {
        setPin('');
        setStep(2);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAtm = () => {
    setStep(1);
    setPin('');
    setAmount('100');
    setCustomAmount('');
    setReceiptData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      {/* ATM Machine Body Container */}
      <div className="w-full max-w-xl rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* ATM Top Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-cyan-300" />
            <span className="font-extrabold text-lg tracking-wider text-white">FINOVA 24/7 ATM</span>
          </div>
          <button
            onClick={() => {
              resetAtm();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ATM Screen Container */}
        <div className="p-6 space-y-6">
          {/* Virtual ATM Green CRT / Cyan Display Screen */}
          <div className="bg-[#05131D] border-2 border-cyan-500/40 rounded-2xl p-6 shadow-inner min-h-[300px] flex flex-col justify-between relative overflow-hidden">
            {/* Screen Watermark */}
            <div className="absolute top-2 right-3 text-[10px] font-mono text-cyan-500/40 uppercase tracking-widest">
              TERMINAL #FN-ATM-049
            </div>

            {/* STEP 1: Select Card */}
            {step === 1 && (
              <div className="space-y-4 my-auto">
                <h3 className="text-center text-cyan-400 font-mono font-bold text-sm tracking-wider uppercase">
                  INSERT / SELECT ATM CARD
                </h3>

                {cards.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 italic">No ATM Cards found on your account.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cards.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => setSelectedCard(c)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          selectedCard?._id === c._id
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-xs font-mono font-bold">{c.cardNumber}</p>
                            <p className="text-[10px] text-slate-400">{c.cardHolderName} ({c.cardType})</p>
                          </div>
                        </div>
                        {selectedCard?._id === c._id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedCard}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  INSERT CARD & PROCEED ➔
                </button>
              </div>
            )}

            {/* STEP 2: Enter PIN Keypad */}
            {step === 2 && (
              <div className="space-y-4 my-auto">
                <div className="text-center space-y-1">
                  <h3 className="text-cyan-400 font-mono font-bold text-sm tracking-wider uppercase">
                    ENTER 4-DIGIT ATM PIN
                  </h3>
                  <p className="text-[11px] text-slate-400">Card ending in {selectedCard?.cardNumber?.slice(-4)}</p>
                </div>

                {/* Masked PIN Box */}
                <div className="flex justify-center space-x-3 my-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="w-10 h-12 rounded-xl border-2 border-cyan-500/60 bg-slate-900 flex items-center justify-center text-xl font-bold font-mono text-cyan-400 shadow-inner"
                    >
                      {pin[idx] ? '●' : ''}
                    </div>
                  ))}
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeypadPress(key)}
                      className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 font-mono text-xs font-bold text-cyan-300 hover:text-white transition-colors"
                    >
                      {key}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleVerifyPin}
                    disabled={pin.length !== 4}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold disabled:opacity-50"
                  >
                    CONFIRM PIN
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Select Cash Amount */}
            {step === 3 && (
              <div className="space-y-4 my-auto">
                <h3 className="text-center text-cyan-400 font-mono font-bold text-sm tracking-wider uppercase">
                  SELECT CASH WITHDRAWAL AMOUNT
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {['20', '50', '100', '200', '500'].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-3 rounded-xl font-mono text-xs font-bold border transition-all ${
                        amount === amt && !customAmount
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Or Enter Custom Cash Amount ($)</label>
                  <input
                    type="number"
                    placeholder="Custom Amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={handleWithdrawCash}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? 'DISPENSING CASH...' : 'DISPENSE CASH ➔'}
                </button>
              </div>
            )}

            {/* STEP 4: Cash Dispensed & Printable ATM Receipt */}
            {step === 4 && receiptData && (
              <div className="space-y-4 my-auto text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-emerald-400 font-mono font-bold text-base tracking-wider uppercase">
                  CASH DISPENSED: ${receiptData.amount.toLocaleString()}
                </h3>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left font-mono text-[11px] space-y-1.5 text-slate-300">
                  <p><span className="text-slate-500">ATM TRANS REF:</span> {receiptData.refNo}</p>
                  <p><span className="text-slate-500">CARD ENDING:</span> **** {receiptData.cardNumber?.slice(-4)}</p>
                  <p><span className="text-slate-500">REMAINING BALANCE:</span> ${receiptData.remainingBalance?.toLocaleString()}</p>
                  <p><span className="text-slate-500">DATE:</span> {new Date(receiptData.date).toLocaleString()}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PRINT RECEIPT</span>
                  </button>
                  <button
                    onClick={resetAtm}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>ANOTHER TRANS</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
