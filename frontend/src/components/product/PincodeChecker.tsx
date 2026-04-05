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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') check();
  };

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
    <div className="p-4" style={{ border: '1px solid #EBEBCA', backgroundColor: '#FAF9EE' }}>

      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={13} style={{ color: '#B68868', flexShrink: 0 }} />
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: '#642308' }}>
          Check Delivery Availability
        </span>
      </div>

      {/* Input row */}
      <div className="flex gap-0">
        <input
          ref={inputRef}
          type="text"
          value={pincode}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter 6-digit pincode"
          maxLength={6}
          className="flex-1 px-3 py-2.5 text-sm outline-none transition-colors font-mono tracking-widest bg-white"
          style={{
            border: '1px solid #EBEBCA',
            borderRight: 'none',
            color: '#642308',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
          onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
        />
        <button
          onClick={check}
          disabled={loading || pincode.length < 6}
          className="px-5 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 flex-shrink-0 transition-colors disabled:opacity-40"
          style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
          onMouseEnter={e => { if (pincode.length >= 6 && !loading) (e.currentTarget.style.backgroundColor = '#903E1D'); }}
          onMouseLeave={e => { (e.currentTarget.style.backgroundColor = '#642308'); }}>
          {loading
            ? <Loader2 size={13} className="animate-spin" />
            : 'Check'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs mt-2.5 flex items-center gap-1.5" style={{ color: '#b91c1c' }}>
          <XCircle size={12} /> {error}
        </p>
      )}

      {/* Result */}
      {result && !loading && (
        <div
          className="mt-3 p-3"
          style={{
            border: `1px solid ${result.is_serviceable ? '#EBEBCA' : '#f5c6c6'}`,
            backgroundColor: result.is_serviceable ? '#EBEBCA' : '#fdf2f2',
          }}>
          {result.is_serviceable ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={13} style={{ color: '#642308', flexShrink: 0 }} />
                <span className="text-xs font-semibold" style={{ color: '#642308' }}>
                  Delivery available to {pincode}
                </span>
              </div>
              {result.estimated_delivery && (
                <div className="flex items-center gap-2 ml-5">
                  <Clock size={11} style={{ color: '#903E1D', flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: '#903E1D' }}>
                    Expected by:{' '}
                    <strong style={{ color: '#642308' }}>{formatETD(result.estimated_delivery)}</strong>
                  </span>
                </div>
              )}
              {result.cheapest_rate !== null && (
                <div className="flex items-center gap-2 ml-5">
                  <Truck size={11} style={{ color: '#903E1D', flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: '#903E1D' }}>
                    {result.cheapest_rate === 0 ? (
                      <strong style={{ color: '#642308' }}>Free shipping on this order</strong>
                    ) : (
                      <>Shipping from <strong style={{ color: '#642308' }}>₹{result.cheapest_rate}</strong></>
                    )}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle size={13} style={{ color: '#b91c1c', flexShrink: 0 }} />
              <span className="text-xs" style={{ color: '#b91c1c' }}>
                Sorry, we don't deliver to <strong>{pincode}</strong> yet.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
