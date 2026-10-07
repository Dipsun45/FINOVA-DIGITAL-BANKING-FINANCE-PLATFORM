import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { maskCardNumber } from '../utils/formatters';

export default function Card3D({ card, showDetails = false }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [revealNumber, setRevealNumber] = useState(false);

  if (!card) return null;

  const bgGradient = card.cardColor || 'from-cyan-600 via-blue-600 to-indigo-900';

  return (
    <div className="perspective-1000 w-full max-w-sm h-56 cursor-pointer select-none">
      <motion.div
        className="w-full h-full relative duration-500 transform-style-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT SIDE */}
        <div
          className={`absolute inset-0 rounded-2xl p-6 bg-gradient-to-br ${bgGradient} text-white shadow-2xl border border-white/20 flex flex-col justify-between overflow-hidden backface-hidden glow-cyan`}
        >
          {/* Subtle overlay texture */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header: Logo & Contactless */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-wider text-white">FINOVA</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md font-semibold tracking-widest uppercase">
                {card.cardType || 'Debit'}
              </span>
            </div>
            <Wifi className="w-6 h-6 text-white/80 rotate-90" />
          </div>

          {/* EMV Chip */}
          <div className="w-11 h-8 bg-gradient-to-r from-amber-300 to-amber-500 rounded-md flex items-center justify-center shadow-inner z-10">
            <div className="w-full h-px bg-amber-700/40 my-1" />
          </div>

          {/* Card Number */}
          <div className="z-10 flex items-center justify-between">
            <span className="font-mono text-xl tracking-widest drop-shadow-md">
              {revealNumber ? card.cardNumber : maskCardNumber(card.cardNumber)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRevealNumber(!revealNumber);
              }}
              className="p-1 rounded bg-black/20 hover:bg-black/40 transition-colors"
            >
              {revealNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Footer: Cardholder & Expiry */}
          <div className="flex justify-between items-end z-10">
            <div>
              <p className="text-[10px] uppercase text-white/70 tracking-wider">CARD HOLDER</p>
              <p className="font-semibold text-sm tracking-wide">{card.cardHolderName || 'DIPSUN PATEL'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/70 tracking-wider">VALID THRU</p>
              <p className="font-semibold text-sm font-mono">{card.validThru || '12/29'}</p>
            </div>
            <div className="font-black italic text-lg opacity-90">
              {card.brand || 'VISA'}
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl border border-white/10 flex flex-col justify-between py-6 overflow-hidden backface-hidden rotate-y-180`}
        >
          {/* Magnetic Stripe */}
          <div className="w-full h-10 bg-black" />

          {/* Signature Strip & CVV */}
          <div className="px-6 space-y-1">
            <p className="text-[10px] text-slate-400 text-right uppercase tracking-wider">AUTHORIZED SIGNATURE / CVV</p>
            <div className="w-full h-9 bg-slate-200 rounded flex items-center justify-end px-3">
              <span className="font-mono text-slate-900 font-bold tracking-widest">{card.cvv || '849'}</span>
            </div>
          </div>

          {/* Customer Service notice */}
          <div className="px-6 text-[9px] text-slate-400 leading-tight">
            This demo card is issued for educational testing on FINOVA platform. If found, return to Finova Global Services.
          </div>
        </div >
      </motion.div>
    </div>
  );
}
