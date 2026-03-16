'use client';
import { useState, useEffect } from 'react';
import { Star, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ReviewsSectionProps {
  productId: number;
  productName: string;
}

// ── Interactive star picker ───────────────────────────────
function StarPicker({ value, onChange, size = 28 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star size={size}
            className={s <= display ? 'text-gray-900' : 'text-gray-300'}
            fill={s <= display ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

// ── Display stars (no interaction) ───────────────────────
function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size}
          className={s <= Math.round(value) ? 'text-gray-900' : 'text-gray-300'}
          fill={s <= Math.round(value) ? 'currentColor' : 'none'} />
      ))}
    </div>
  );
}

export default function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const user = useAuthStore(s => s.user);
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [myReview, setMyReview] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const LIMIT = 5;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await reviewsApi.getByProduct(productId, p);
      const data = res.data;
      let rows = data.data;

      // Client-side search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        rows = rows.filter((r: any) =>
          r.comment?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.user_name?.toLowerCase().includes(q)
        );
      }

      // Client-side sort
      if (sortBy === 'highest') rows = [...rows].sort((a: any, b: any) => b.rating - a.rating);
      if (sortBy === 'lowest')  rows = [...rows].sort((a: any, b: any) => a.rating - b.rating);
      if (sortBy === 'newest')  rows = [...rows].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setReviews(rows);
      setSummary(data.summary);
      setTotalPages(Math.ceil(parseInt(data.summary?.total || 0) / LIMIT));
    } catch { }
    finally { setLoading(false); }
  };

  const loadMyReview = async () => {
    if (!user) return;
    try {
      const res = await reviewsApi.getMyReview(productId);
      const r = res.data.data;
      if (r) { setMyReview(r); setRating(r.rating); setTitle(r.title || ''); setComment(r.comment || ''); }
    } catch { }
    try {
      const res = await reviewsApi.checkPurchased(productId);
      setHasPurchased(res.data.data.purchased);
    } catch { setHasPurchased(true); }
  };

  useEffect(() => { load(page); }, [productId, page, sortBy]);
  useEffect(() => { loadMyReview(); }, [productId, user]);

  // Search with debounce
  useEffect(() => {
    const t = setTimeout(() => load(1), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in'); return; }
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await reviewsApi.submit(productId, { rating, title, comment });
      toast.success(myReview ? 'Review updated!' : 'Review submitted! 🌟');
      setShowForm(false);
      load(1); loadMyReview();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit';
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete your review?')) return;
    try {
      await reviewsApi.delete(productId);
      toast.success('Review deleted');
      setMyReview(null); setRating(0); setTitle(''); setComment(''); setShowForm(false);
      load(1);
    } catch { toast.error('Failed to delete'); }
  };

  const totalReviews = parseInt(summary?.total || 0);
  const avgRating = parseFloat(summary?.avg_rating || 0);

  const ratingLabel = (r: number) => {
    if (r >= 4.5) return 'Excellent'; if (r >= 4) return 'Very Good';
    if (r >= 3) return 'Good'; if (r >= 2) return 'Fair'; return 'Poor';
  };

  return (
    <div className="mt-20 border-t border-gray-100 pt-14">

      {/* ── Header row — "CUSTOMER REVIEWS  4.5 ★★★★½  WRITE A REVIEW | ASK A QUESTION" ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-5 flex-wrap">
          <h2 className="font-display text-xl font-bold text-gray-900 uppercase tracking-wide">
            Customer Reviews
            {totalReviews > 0 && <span className="text-gray-400 font-normal ml-2 text-base normal-case tracking-normal">({totalReviews})</span>}
          </h2>
          {avgRating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{avgRating.toFixed(1)}</span>
              <Stars value={avgRating} size={16} />
            </div>
          )}
        </div>

        {/* Action buttons — right side like Mejuri */}
        <div className="flex items-center divide-x divide-gray-200">
          {user && hasPurchased !== false && !showForm && (
            <button onClick={() => setShowForm(true)}
              className="px-5 py-1 text-sm font-semibold text-gray-600 hover:text-gray-900 uppercase tracking-wide underline underline-offset-4 transition-colors">
              {myReview ? 'Edit Review' : 'Write a Review'}
            </button>
          )}
          {user && hasPurchased === false && !myReview && (
            <span className="px-5 py-1 text-sm text-gray-400 uppercase tracking-wide">
              Purchase to review
            </span>
          )}
          {!user && (
            <a href="/account/login"
              className="px-5 py-1 text-sm font-semibold text-gray-600 hover:text-gray-900 uppercase tracking-wide underline underline-offset-4 transition-colors">
              Write a Review
            </a>
          )}
        </div>
      </div>

      {/* ── Write / Edit form ─────────────────────────── */}
      {showForm && (
        <div className="mb-10 border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              {myReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-gray-700 uppercase tracking-wide">Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Star picker */}
            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Your Rating *</p>
              <div className="flex items-center gap-3">
                <StarPicker value={rating} onChange={setRating} size={28} />
                {rating > 0 && (
                  <span className="text-sm text-gray-600">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Review Title</p>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Summarise your experience"
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900 transition-colors"
              />
            </div>

            {/* Comment */}
            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Your Review</p>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Share details about your experience..."
                rows={4}
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting || rating === 0}
                className="px-8 py-3 bg-gray-900 text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {myReview ? 'Update' : 'Submit'} Review
              </button>
              {myReview && (
                <button type="button" onClick={handleDelete}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 uppercase tracking-wide transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── My review highlight ───────────────────────── */}
      {myReview && !showForm && (
        <div className="mb-8 border border-yellow-200 bg-yellow-50/50 p-5 flex gap-6">
          <div className="w-36 flex-shrink-0">
            <p className="text-xs font-bold text-gray-900">{user?.name?.split(' ')[0]} {user?.name?.split(' ').pop()?.[0]}.</p>
            <p className="text-xs text-yellow-700 font-semibold mt-0.5">Your Review</p>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              {new Date(myReview.created_at).toLocaleDateString('en-GB').replace(/\//g, '/')}
            </p>
          </div>
          <div className="flex-1">
            <Stars value={myReview.rating} size={15} />
            {myReview.title && <p className="text-xs font-bold uppercase tracking-wide text-gray-900 mt-2">{myReview.title}</p>}
            {myReview.comment && <p className="text-sm text-gray-600 mt-1 leading-relaxed" style={{ fontFamily: 'monospace' }}>{myReview.comment}</p>}
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 self-start transition-colors">
            <Edit2 size={12} /> Edit
          </button>
        </div>
      )}

      {/* ── Search + Sort controls ────────────────────── */}
      {totalReviews > 0 && (
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-gray-300 pb-1 w-64">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Reviews"
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs font-bold uppercase tracking-wide text-gray-700 border-none outline-none bg-transparent cursor-pointer">
              <option value="newest">Newest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Reviews list — Mejuri 2-col layout ───────── */}
      {loading ? (
        <div className="space-y-8">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-6 border-b border-gray-100 pb-8">
              <div className="w-36 space-y-1.5 flex-shrink-0">
                <div className="skeleton h-3 rounded w-20" />
                <div className="skeleton h-2.5 rounded w-16" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 rounded w-24" />
                <div className="skeleton h-3 rounded w-3/4" />
                <div className="skeleton h-3 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !myReview ? (
        <div className="text-center py-16 border border-gray-100">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">No Reviews Yet</p>
          <p className="text-xs text-gray-400">Be the first to share your experience</p>
          {user && hasPurchased !== false && !showForm && (
            <button onClick={() => setShowForm(true)}
              className="mt-5 px-8 py-3 bg-gray-900 text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-700 transition-colors">
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews
            .filter(r => !myReview || r.id !== myReview.id)
            .map(r => (
            <div key={r.id} className="flex gap-6 lg:gap-16 py-7">
              {/* Left col: name, badge, date */}
              <div className="w-36 xl:w-44 flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {/* First name + last initial — like Mejuri */}
                  {r.user_name?.split(' ')[0]} {r.user_name?.split(' ').slice(1).map((n: string) => n[0]).join('')}.
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Verified Buyer</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  {new Date(r.created_at).toLocaleDateString('en-GB').replace(/\//g, '/')}
                </p>
              </div>

              {/* Right col: stars, title, comment */}
              <div className="flex-1 min-w-0">
                <Stars value={r.rating} size={15} />
                {r.title && (
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-900 mt-2">
                    {r.title}
                  </p>
                )}
                {r.comment && (
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed" style={{ fontFamily: 'monospace' }}>
                    {r.comment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination — like Mejuri: « 1 2 3 ... 214 » ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors">
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let num: number;
            if (totalPages <= 5) num = i + 1;
            else if (page <= 3) num = i + 1;
            else if (page >= totalPages - 2) num = totalPages - 4 + i;
            else num = page - 2 + i;
            return num;
          }).map((num, i, arr) => (
            <span key={num} className="flex items-center gap-2">
              {i === arr.length - 1 && num < totalPages && arr[i-1] !== num - 1 && (
                <span className="text-gray-400 text-sm">...</span>
              )}
              <button
                onClick={() => setPage(num)}
                className={`w-8 h-8 flex items-center justify-center text-sm font-semibold transition-colors ${
                  page === num
                    ? 'text-gray-900 underline underline-offset-2'
                    : 'text-gray-400 hover:text-gray-900'
                }`}>
                {num}
              </button>
            </span>
          ))}

          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="text-gray-400 text-sm">...</span>
              <button onClick={() => setPage(totalPages)}
                className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
                {totalPages}
              </button>
            </>
          )}

          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
