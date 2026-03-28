'use client';
import { useState, useRef } from 'react';
import { MapPin, Truck, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface ServiceabilityResult {
  is_serviceable: boolean;
  estimated_delivery: string | null;
  cheapest_rate: number | null;
  courier_name?: string;
}

export default function PincodeChecker() {
  const [pincode, setPincode]   = useState('');
  const [result, setResult]     = useState<ServiceabilityResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const check = async () => {
    const pin = pincode.trim();
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.get(`/shiprocket/serviceability?pincode=${pin}`);
      const data = res.data.data;
      setResult(data);
    } catch {
      setError('Unable to check serviceability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') check();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (result) setResult(null);
    if (error) setError('');
  };

  // Format ETD from Shiprocket — could be "2-3 Days", "2026-04-05", etc.
  const formatETD = (etd: string | null): string => {
    if (!etd) return '3–5 business days';
    // If it's a date string like "2026-04-05"
    if (/^\d{4}-\d{2}-\d{2}/.test(etd)) {
      const date = new Date(etd);
      if (!isNaN(date.getTime())) {
        const today = new Date();
        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) return 'Tomorrow';
        if (diffDays <= 7) return `${diffDays} days`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      }
    }
    // Already a string like "2-3 Days"
    return etd;
  };

  return (
    <div className="border border-[#E8E0D4] bg-[#FDFBF8] p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={14} className="text-[#B8892A] flex-shrink-0" />
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#3D2E1E]">
          Check Delivery Availability
        </span>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={pincode}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter 6-digit pincode"
          maxLength={6}
          className="flex-1 border border-[#D8C8B8] focus:border-[#B8892A] bg-white px-3 py-2.5 text-sm text-[#1A1410] placeholder-[#C8B8A8] outline-none transition-colors font-mono tracking-widest"
        />
        <button
          onClick={check}
          disabled={loading || pincode.length < 6}
          className="px-5 bg-[#1A1410] hover:bg-[#2D2018] disabled:bg-[#C8B8A8] disabled:cursor-not-allowed text-white text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors flex items-center gap-2 flex-shrink-0">
          {loading ? <Loader2 size={13} className="animate-spin" /> : 'Check'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5">
          <XCircle size={12} /> {error}
        </p>
      )}

      {/* Result */}
      {result && !loading && (
        <div className={`mt-3 p-3 border ${result.is_serviceable ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          {result.is_serviceable ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-emerald-800">Delivery available to {pincode}</span>
              </div>
              {result.estimated_delivery && (
                <div className="flex items-center gap-2 ml-5">
                  <Clock size={11} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-xs text-emerald-700">
                    Expected by: <strong>{formatETD(result.estimated_delivery)}</strong>
                  </span>
                </div>
              )}
              {result.cheapest_rate !== null && (
                <div className="flex items-center gap-2 ml-5">
                  <Truck size={11} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-xs text-emerald-700">
                    {result.cheapest_rate === 0 ? (
                      <strong>Free shipping on this order</strong>
                    ) : (
                      <>Shipping from <strong>₹{result.cheapest_rate}</strong></>
                    )}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle size={14} className="text-red-500 flex-shrink-0" />
              <span className="text-xs text-red-700">
                Sorry, we don't deliver to <strong>{pincode}</strong> yet.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
