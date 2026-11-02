import React, { useState } from 'react';
import { X, Smartphone, KeyRound, CheckCircle2, Shield, ArrowRight, User } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/sound';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, loginWithPhone, allUsers, setCurrentUser, showToast } = useGame();
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (phone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
      setOtp('7788');
      showToast('Demo OTP sent to ' + phone + ' (Code: 7788)', 'info');
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginWithPhone(`+91 ${phone}`, otp);
    }, 600);
  };

  const handleQuickSwitch = (user: typeof allUsers[0]) => {
    sound.playClick();
    setCurrentUser(user);
    setAuthModalOpen(false);
    showToast(`Switched account to ${user.name} (${user.vipTier} VIP)`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121124] border border-purple-900/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-purple-950/30">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white tracking-wide">
              {step === 'PHONE' ? 'Player Sign In / Register' : 'Verify Mobile OTP'}
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setAuthModalOpen(false);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-xl bg-purple-950/40 border border-purple-800/40 px-3.5 py-2.5 focus-within:border-amber-400 transition-colors">
                  <span className="text-sm font-semibold text-amber-400 mr-2 shrink-0">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500 font-medium"
                    required
                  />
                  <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant OTP verification. Demo OTP: 7788</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Sending SMS Code...' : 'Get OTP Code'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center pb-2">
                <p className="text-xs text-slate-400">
                  Enter 4-digit code sent to <span className="text-white font-semibold">+91 {phone}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Verification Code
                </label>
                <div className="flex justify-center items-center rounded-xl bg-purple-950/40 border border-purple-800/40 px-4 py-3 focus-within:border-amber-400 transition-colors">
                  <KeyRound className="w-4 h-4 text-amber-400 mr-2" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="7788"
                    className="bg-transparent text-center text-lg tracking-widest text-amber-300 font-bold focus:outline-none w-32"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Change number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtp('7788');
                    showToast('Demo OTP auto-filled: 7788', 'info');
                  }}
                  className="text-amber-400 hover:text-amber-300 cursor-pointer font-medium"
                >
                  Auto-fill demo (7788)
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          )}

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-purple-900/30">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Test Profiles
            </span>
            <div className="grid grid-cols-2 gap-2">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickSwitch(u)}
                  className="p-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/30 text-left text-xs transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-white truncate flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-400" />
                    {u.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>{u.vipTier}</span>
                    <span>·</span>
                    <span>₹{u.balance}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
