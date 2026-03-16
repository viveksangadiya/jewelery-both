'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw, Package, CheckCircle, XCircle, Clock,
  Truck, ArrowRight, AlertCircle, ChevronDown, X, ArrowLeft
} from 'lucide-react';
import { returnsApi, ordersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const RETURN_REASONS = [
  'Item received damaged or defective',
  'Wrong item delivered',
  'Item does not match description',
  'Size issue',
  'Changed my mind',
  'Quality not as expected',
  'Other',
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; desc: string }> = {
  pending:    { label: 'Request Submitted',  color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: Clock,        desc: 'We are reviewing your request within 24 hours.' },
  approved:   { label: 'Approved',           color: 'text-blue-700 bg-blue-50 border-blue-200',       icon: CheckCircle,  desc: 'Our courier will schedule pickup within 24–48 hours.' },
  rejected:   { label: 'Rejected',           color: 'text-red-700 bg-red-50 border-red-200',          icon: XCircle,      desc: 'Your return request was not approved.' },
  picked_up:  { label: 'Item Picked Up',     color: 'text-purple-700 bg-purple-50 border-purple-200', icon: Truck,        desc: 'Item is on its way back to us.' },
  received:   { label: 'Item Received',      color: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: Package,      desc: 'We received your item and are processing the refund.' },
  refunded:   { label: 'Refunded',           color: 'text-green-700 bg-green-50 border-green-200',    icon: CheckCircle,  desc: 'Your refund has been processed successfully.' },
  exchanged:  { label: 'Exchanged',          color: 'text-green-700 bg-green-50 border-green-200',    icon: RefreshCw,    desc: 'Exchange completed successfully.' },
};

const STEPS = ['pending', 'approved', 'picked_up', 'received', 'refunded'];

function MyReturns({ onInitiate }: { onInitiate: () => void }) {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    returnsApi.getAll()
      .then((r: any) => setReturns(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this return request?')) return;
    try {
      await returnsApi.cancel(id);
      toast.success('Return cancelled');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return <div className="space-y-4">{[1,2].map(i => <div key={i} className="skeleton h-28 rounded" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-gray-900">My Returns</h2>
        <button onClick={onInitiate}
          className="bg-gray-900 text-white px-5 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-700 transition-colors">
          + New Request
        </button>
      </div>

      {returns.length === 0 ? (
        <div className="text-center py-16 border border-gray-100">
          <RefreshCw size={36} className="mx-auto text-gray-300 mb-4" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-gray-700 mb-1">No return requests yet</p>
          <p className="text-xs text-gray-400 mb-6">Initiate a return from a recent order</p>
          <button onClick={onInitiate}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-700 transition-colors">
            Initiate Return <ArrowRight size={13} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret: any) => {
            const cfg = STATUS_CONFIG[ret.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            const currentStep = STEPS.indexOf(ret.status);
            return (
              <div key={ret.id} className="border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between px-5 py-4 border-b border-gray-50">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-mono text-sm font-bold text-gray-900">{ret.return_number}</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 border rounded-full flex items-center gap-1.5 ${cfg.color}`}>
                        <Icon size={11} /> {cfg.label}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{ret.type}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Order: <span className="font-semibold text-gray-600">{ret.order_number}</span>
                      {' · '}{new Date(ret.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {ret.refund_amount && <p className="font-bold text-gray-900">₹{parseFloat(ret.refund_amount).toLocaleString()}</p>}
                    {ret.status === 'pending' && (
                      <button onClick={() => handleCancel(ret.id)}
                        className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors flex items-center gap-1 ml-auto">
                        <X size={11} /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {ret.status !== 'rejected' && (
                  <div className="px-5 py-3 border-b border-gray-50">
                    <div className="flex items-center mb-2">
                      {STEPS.map((step, i) => {
                        const done = currentStep >= i;
                        return (
                          <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${done ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {done ? '✓' : i + 1}
                            </div>
                            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${currentStep > i ? 'bg-gray-900' : 'bg-gray-200'}`} />}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500">{cfg.desc}</p>
                  </div>
                )}

                {ret.status === 'rejected' && ret.rejection_reason && (
                  <div className="px-5 py-3 bg-red-50 border-b border-red-100">
                    <p className="text-xs text-red-700"><strong>Reason:</strong> {ret.rejection_reason}</p>
                  </div>
                )}

                <div className="px-5 py-3">
                  <p className="text-xs text-gray-500"><strong>Reason:</strong> {ret.reason}</p>
                  {ret.admin_notes && <p className="text-xs text-blue-600 mt-1"><strong>Note:</strong> {ret.admin_notes}</p>}
                  {ret.return_awb && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded flex items-center gap-2">
                        <Truck size={12} className="text-blue-500" />
                        <span className="text-xs text-blue-700 font-mono font-semibold">AWB: {ret.return_awb}</span>
                      </div>
                      <a href={`https://shiprocket.co/tracking/${ret.return_awb}`} target="_blank" rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline font-semibold">
                        Track Pickup →
                      </a>
                    </div>
                  )}
                  {ret.shiprocket_return_id && !ret.return_awb && ret.status === 'approved' && (
                    <p className="text-xs text-gray-400 mt-1.5">📦 Reverse pickup scheduled · AWB will be assigned shortly</p>
                  )}
                  {ret.items?.filter((i: any) => i.product_name).length > 0 && (
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {ret.items.filter((i: any) => i.product_name).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          {item.product_image && <img src={item.product_image} alt="" className="w-8 h-8 object-cover rounded" />}
                          <p className="text-xs text-gray-600">{item.product_name} × {item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InitiateReturn({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Record<number, { selected: boolean; quantity: number }>>({});
  const [type, setType] = useState<'return' | 'exchange'>('return');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [refundMethod, setRefundMethod] = useState('original_payment');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ordersApi.getAll()
      .then((r: any) => {
        const returnable = r.data.data.filter((o: any) =>
          ['delivered', 'confirmed', 'processing', 'shipped'].includes(o.status)
        );
        setOrders(returnable);
      })
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleSelectOrder = async (order: any) => {
    setLoadingOrder(true);
    try {
      const res = await ordersApi.getById(order.id);
      const full = res.data.data;
      setSelectedOrder(full);
      const init: Record<number, { selected: boolean; quantity: number }> = {};
      full.items?.forEach((item: any) => { init[item.id] = { selected: false, quantity: 1 }; });
      setSelectedItems(init);
      setStep(2);
    } catch { toast.error('Failed to load order'); }
    finally { setLoadingOrder(false); }
  };

  const toggleItem = (id: number) => {
    setSelectedItems(prev => ({ ...prev, [id]: { ...prev[id], selected: !prev[id].selected } }));
  };

  const handleSubmit = async () => {
    if (!reason) { toast.error('Please select a reason'); return; }
    const items = Object.entries(selectedItems)
      .filter(([, v]) => v.selected)
      .map(([id, v]) => ({ order_item_id: parseInt(id), quantity: v.quantity }));
    if (!items.length) { toast.error('Please select at least one item'); return; }
    setSubmitting(true);
    try {
      await returnsApi.create({ order_id: selectedOrder.id, type, reason, description, refund_method: refundMethod, items });
      toast.success('Return request submitted!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const selectedCount = Object.values(selectedItems).filter(v => v.selected).length;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to My Returns
      </button>
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Initiate Return / Exchange</h2>
      <p className="text-sm text-gray-500 mb-8">Select your order and items you'd like to return or exchange.</p>

      {step === 1 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Step 1 — Select Order</p>
          {loadingOrders ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-14 border border-gray-100">
              <Package size={32} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
              <p className="text-sm text-gray-600 mb-1">No eligible orders found</p>
              <p className="text-xs text-gray-400">Only delivered or confirmed orders within 30 days are eligible.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <button key={order.id} onClick={() => handleSelectOrder(order)}
                  disabled={loadingOrder}
                  className="w-full text-left border border-gray-200 hover:border-gray-900 p-5 transition-colors group disabled:opacity-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-bold text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}{order.item_count} item{order.item_count > 1 ? 's' : ''}
                        {' · '}₹{parseFloat(order.total).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {order.status}
                      </span>
                      <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedOrder && (
        <div className="space-y-7">
          <div className="bg-gray-50 border border-gray-200 px-5 py-3 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700">Order: <span className="font-mono">{selectedOrder.order_number}</span> · ₹{parseFloat(selectedOrder.total).toLocaleString()}</p>
            <button onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Change</button>
          </div>

          {/* Type */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Request Type</p>
            <div className="flex gap-3">
              {(['return', 'exchange'] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex-1 py-3 border text-sm font-semibold transition-colors ${type === t ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-900'}`}>
                  {t === 'return' ? '↩ Return & Refund' : '↔ Exchange'}
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Select Items</p>
            <div className="space-y-3">
              {selectedOrder.items?.map((item: any) => {
                const sel = selectedItems[item.id];
                return (
                  <div key={item.id}
                    className={`border p-4 cursor-pointer transition-colors ${sel?.selected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
                    onClick={() => toggleItem(item.id)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sel?.selected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                        {sel?.selected && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      {item.product_image && <img src={item.product_image} alt="" className="w-12 h-12 object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{parseFloat(item.price).toLocaleString()} each</p>
                      </div>
                    </div>
                    {sel?.selected && (
                      <div className="mt-3 ml-9 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <p className="text-[10px] text-gray-500">Qty to return:</p>
                        <div className="flex items-center border border-gray-300">
                          <button onClick={() => setSelectedItems(prev => ({ ...prev, [item.id]: { ...prev[item.id], quantity: Math.max(1, prev[item.id].quantity - 1) } }))}
                            className="px-2.5 py-1 hover:bg-gray-100 text-gray-600">−</button>
                          <span className="px-3 py-1 text-sm font-semibold">{sel.quantity}</span>
                          <button onClick={() => setSelectedItems(prev => ({ ...prev, [item.id]: { ...prev[item.id], quantity: Math.min(item.quantity, prev[item.id].quantity + 1) } }))}
                            className="px-2.5 py-1 hover:bg-gray-100 text-gray-600">+</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Reason *</p>
            <div className="relative">
              <select value={reason} onChange={e => setReason(e.target.value)}
                className="w-full border border-gray-200 focus:border-gray-900 px-4 py-3 text-sm outline-none bg-white appearance-none transition-colors">
                <option value="">Select a reason</option>
                {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Additional Details <span className="text-gray-300 normal-case font-normal">(optional)</span></p>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue in more detail..."
              rows={3}
              className="w-full border border-gray-200 focus:border-gray-900 px-4 py-3 text-sm outline-none resize-none transition-colors"
            />
          </div>

          {/* Refund method */}
          {type === 'return' && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Refund Method</p>
              <div className="space-y-2">
                {[
                  { value: 'original_payment', label: 'Original Payment Method', desc: 'Back to card/UPI used at purchase' },
                  { value: 'bank_transfer',    label: 'Bank Transfer',            desc: 'NEFT/IMPS to your bank account' },
                  { value: 'store_credit',     label: 'Store Credit',             desc: 'Added to wallet — processed faster' },
                ].map(opt => (
                  <label key={opt.value}
                    className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${refundMethod === opt.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                    <input type="radio" name="refund_method" value={opt.value} checked={refundMethod === opt.value}
                      onChange={() => setRefundMethod(opt.value)} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 p-4 flex gap-3">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Pack the item in its original box with all certificates and tags. Our courier will schedule free pickup within 24–48 hours of approval.
            </p>
          </div>

          <button onClick={handleSubmit} disabled={submitting || selectedCount === 0 || !reason}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-4 text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2">
            {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Submit {type === 'return' ? 'Return' : 'Exchange'} Request
            {selectedCount > 0 && ` (${selectedCount} item${selectedCount > 1 ? 's' : ''})`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReturnsPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [view, setView] = useState<'info' | 'my-returns' | 'initiate'>('info');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (mounted && !user) {
    router.push('/account/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#faf8f5] border-b border-gray-100 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center">
              <RefreshCw size={20} className="text-gray-700" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900">Returns & Exchange</h1>
              <p className="text-gray-500 text-sm mt-0.5">30-day hassle-free return policy</p>
            </div>
          </div>
          <div className="flex border-b border-gray-200">
            {[{ key: 'info', label: 'Policy' }, { key: 'my-returns', label: 'My Returns' }].map(tab => (
              <button key={tab.key} onClick={() => setView(tab.key as any)}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                  (view === tab.key || (view === 'initiate' && tab.key === 'my-returns'))
                    ? 'border-b-2 border-gray-900 text-gray-900 -mb-px'
                    : 'text-gray-400 hover:text-gray-700'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {view === 'info' && (
          <div className="space-y-12">
            <div className="grid sm:grid-cols-4 gap-5 text-center">
              {[
                { icon: '📱', title: 'Submit Request', desc: 'Fill out return form in My Returns tab' },
                { icon: '✅', title: 'Get Approved',   desc: 'We review within 24 hours' },
                { icon: '📦', title: 'Free Pickup',    desc: 'Courier collects from your door' },
                { icon: '💰', title: 'Get Refund',     desc: 'Processed in 5–7 business days' },
              ].map(s => (
                <div key={s.title}>
                  <span className="text-3xl block mb-3">{s.icon}</span>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-1">{s.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle size={15} className="text-green-500" /> Eligible for Return
                </h3>
                <ul className="space-y-2.5">
                  {['Damaged or defective items', 'Wrong item delivered', 'Does not match description', 'Size issues (exchange)', 'Unused items within 30 days'].map(i => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />{i}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-4 flex items-center gap-2">
                  <XCircle size={15} className="text-red-400" /> Not Eligible
                </h3>
                <ul className="space-y-2.5">
                  {['Worn, used or altered items', 'Missing original packaging', 'Custom engraved items', 'Clearance / final sale items', 'After 30 days from delivery'].map(i => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-300 mt-1.5 flex-shrink-0" />{i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center pt-2">
              <button onClick={() => setView('my-returns')}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-10 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-700 transition-colors">
                Initiate a Return <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
        {view === 'my-returns' && <MyReturns onInitiate={() => setView('initiate')} />}
        {view === 'initiate' && <InitiateReturn onBack={() => setView('my-returns')} onSuccess={() => setView('my-returns')} />}
      </div>
    </div>
  );
}
