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
  const [pincode, setPincode] = useState('');
  const [result, setResult]   = useState<ServiceabilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
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
      setResult(res.data.data);
    } catch {
      setError('Unable to check serviceability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') check(); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (result) setResult(null);
    if (error) setError('');
  };

  const formatETD = (etd: string | null): string => {
    if (!etd) return '3–5 business days';
    if (/^\d{4}-\d{2}-\d{2}/.test(etd)) {
      const date = new Date(etd);
      if (!isNaN(date.getTime())) {
        const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) return 'Tomorrow';
        if (diffDays <= 7) return `${diffDays} days`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      }
    }
    return etd;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={11} className="text-brand-muted flex-shrink-0" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-brand-muted">
          Check delivery
        </span>
      </div>

      <div className="flex gap-0">
        <input
          ref={inputRef}
          type="text"
          value={pincode}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="6-digit pincode"
          maxLength={6}
          className="flex-1 px-3 py-2.5 text-sm border border-brand-border border-r-0 bg-white text-brand-text placeholder:text-brand-muted font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal outline-none focus:border-brand-text transition-colors"
        />
        <button
          onClick={check}
          disabled={loading || pincode.length < 6}
          className="btn-brand px-5 h-auto text-[10px] disabled:opacity-40"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : 'Check'}
        </button>
      </div>

      {error && (
        <p className="text-xs mt-2 flex items-center gap-1.5 text-red-600">
          <XCircle size={12} /> {error}
        </p>
      )}

      {result && !loading && (
        <div
          className="mt-3 p-3 text-xs"
          style={{
            border: `1px solid ${result.is_serviceable ? '#d4e3cb' : '#f5c6c6'}`,
            backgroundColor: result.is_serviceable ? 'rgba(212,227,203,0.3)' : '#fff0f0',
          }}
        >
          {result.is_serviceable ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-700 flex-shrink-0" />
                <span className="font-medium text-brand-text">Delivery available to {pincode}</span>
              </div>
              {result.estimated_delivery && (
                <div className="flex items-center gap-2 ml-5">
                  <Clock size={11} className="text-green-700 flex-shrink-0" />
                  <span className="text-brand-secondary">
                    Expected by: <strong className="text-brand-text">{formatETD(result.estimated_delivery)}</strong>
                  </span>
                </div>
              )}
              {result.cheapest_rate !== null && (
                <div className="flex items-center gap-2 ml-5">
                  <Truck size={11} className="text-green-700 flex-shrink-0" />
                  <span className="text-brand-secondary">
                    {result.cheapest_rate === 0 ? (
                      <strong className="text-green-700">Free shipping on this order</strong>
                    ) : (
                      <>Shipping from <strong className="text-brand-text">₹{result.cheapest_rate}</strong></>
                    )}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle size={12} className="text-red-600 flex-shrink-0" />
              <span className="text-red-600">
                Sorry, we don't deliver to <strong>{pincode}</strong> yet.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
