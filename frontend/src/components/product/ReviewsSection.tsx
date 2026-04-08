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

// ── Star picker ──────────────────────────────────────────
function StarPicker({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star
            size={size}
            style={{ color: s <= display ? '#ed8a00' : '#e1e1e1' }}
            fill={s <= display ? '#ed8a00' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}

// ── Display stars (read-only) ────────────────────────────
function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size}
          style={{ color: s <= Math.round(value) ? '#ed8a00' : '#e1e1e1' }}
          fill={s <= Math.round(value) ? '#ed8a00' : 'none'}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const user = useAuthStore(s => s.user);
  const [reviews, setReviews]           = useState<any[]>([]);
  const [summary, setSummary]           = useState<any>(null);
  const [myReview, setMyReview]         = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState('newest');

  const [showForm, setShowForm]     = useState(false);
  const [rating, setRating]         = useState(0);
  const [title, setTitle]           = useState('');
  const [comment, setComment]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const LIMIT = 5;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await reviewsApi.getByProduct(productId, p);
      const data = res.data;
      let rows = data.data;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        rows = rows.filter((r: any) =>
          r.comment?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.user_name?.toLowerCase().includes(q)
        );
      }

      if (sortBy === 'highest') rows = [...rows].sort((a: any, b: any) => b.rating - a.rating);
      if (sortBy === 'lowest')  rows = [...rows].sort((a: any, b: any) => a.rating - b.rating);
      if (sortBy === 'newest')  rows = [...rows].sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
      toast.success(myReview ? 'Review updated!' : 'Review submitted!');
      setShowForm(false);
      load(1); loadMyReview();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
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
  const avgRating    = parseFloat(summary?.avg_rating || 0);

  return (
    <div className="mt-20 pt-14" style={{ borderTop: '1px solid #e1e1e1' }}>

      {/* ── Section header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div className="flex items-center gap-5 flex-wrap">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-[#1c1c1c]">
            Customer Reviews
            {totalReviews > 0 && (
              <span className="ml-2 font-normal tracking-normal normal-case text-[#9b9b9b]">
                ({totalReviews})
              </span>
            )}
          </h2>
          {avgRating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#1c1c1c]">{avgRating.toFixed(1)}</span>
              <Stars value={avgRating} size={14} />
            </div>
          )}
        </div>

        {/* Write review CTA */}
        <div className="flex items-center">
          {user && hasPurchased !== false && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-bold tracking-[0.2em] uppercase pb-0.5 text-[#1c1c1c] transition-colors hover:text-[#363636]"
              style={{ borderBottom: '1px solid #1c1c1c' }}
            >
              {myReview ? 'Edit Review' : 'Write a Review'}
            </button>
          )}
          {user && hasPurchased === false && !myReview && (
            <span className="text-xs tracking-widest uppercase text-[#9b9b9b]">
              Purchase to review
            </span>
          )}
          {!user && (
            <a
              href="/account/login"
              className="text-xs font-bold tracking-[0.2em] uppercase pb-0.5 text-[#1c1c1c]"
              style={{ borderBottom: '1px solid #1c1c1c' }}
            >
              Write a Review
            </a>
          )}
        </div>
      </div>

      {/* ── Write / Edit form ── */}
      {showForm && (
        <div className="mb-10 p-6" style={{ border: '1px solid #e1e1e1', backgroundColor: '#f5f5f5' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-[#1c1c1c]">
              {myReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-[10px] tracking-widest uppercase text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3 text-[#9b9b9b]">
                Your Rating *
              </p>
              <div className="flex items-center gap-3">
                <StarPicker value={rating} onChange={setRating} size={24} />
                {rating > 0 && (
                  <span className="text-xs text-[#363636]">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2 text-[#9b9b9b]">
                Review Title
              </p>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Summarise your experience"
                className="w-full px-4 py-3 text-sm outline-none bg-white text-[#1c1c1c] placeholder:text-[#9b9b9b]"
                style={{ border: '1px solid #e1e1e1' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#1c1c1c')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e1e1e1')}
              />
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2 text-[#9b9b9b]">
                Your Review
              </p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share details about your experience with this toran…"
                rows={4}
                className="w-full px-4 py-3 text-sm outline-none resize-none bg-white text-[#1c1c1c] placeholder:text-[#9b9b9b]"
                style={{ border: '1px solid #e1e1e1' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#1c1c1c')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e1e1e1')}
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="px-8 h-12 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 transition-colors disabled:opacity-40 bg-[#1c1c1c] text-white hover:bg-[#363636]"
              >
                {submitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {myReview ? 'Update Review' : 'Submit Review'}
              </button>
              {myReview && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-xs tracking-wide uppercase text-[#9b9b9b] hover:text-[#e32c2b] transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── My review highlight ── */}
      {myReview && !showForm && (
        <div className="mb-8 p-5 flex gap-6" style={{ border: '1px solid #e1e1e1', backgroundColor: '#f5f5f5' }}>
          <div className="w-36 flex-shrink-0">
            <p className="text-xs font-semibold text-[#1c1c1c]">
              {user?.name?.split(' ')[0]} {user?.name?.split(' ').pop()?.[0]}.
            </p>
            <p className="text-[10px] font-bold tracking-wide mt-0.5 uppercase text-[#9b9b9b]">Your Review</p>
            <p className="text-[10px] mt-0.5 font-mono text-[#9b9b9b]">
              {new Date(myReview.created_at).toLocaleDateString('en-GB')}
            </p>
          </div>
          <div className="flex-1">
            <Stars value={myReview.rating} size={13} />
            {myReview.title && (
              <p className="text-xs font-bold uppercase tracking-wide mt-2 text-[#1c1c1c]">
                {myReview.title}
              </p>
            )}
            {myReview.comment && (
              <p className="text-sm mt-1.5 leading-relaxed text-[#363636]">
                {myReview.comment}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex-shrink-0 flex items-center gap-1 self-start text-xs text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
          >
            <Edit2 size={11} /> Edit
          </button>
        </div>
      )}

      {/* ── Search + Sort bar ── */}
      {totalReviews > 0 && (
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div
            className="flex items-center gap-2 pb-1 w-56"
            style={{ borderBottom: '1px solid #e1e1e1' }}
          >
            <Search size={12} style={{ color: '#9b9b9b', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reviews"
              className="flex-1 text-xs outline-none bg-transparent text-[#1c1c1c] placeholder:text-[#9b9b9b]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#9b9b9b]">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs font-semibold border-none outline-none bg-transparent cursor-pointer text-[#1c1c1c]"
            >
              <option value="newest">Newest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Reviews list ── */}
      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-6 pb-8" style={{ borderBottom: '1px solid #e1e1e1' }}>
              <div className="w-36 space-y-2 flex-shrink-0">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-2.5 w-16" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-3 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !myReview ? (
        <div className="py-16 text-center" style={{ border: '1px solid #e1e1e1' }}>
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2 text-[#9b9b9b]">
            No Reviews Yet
          </p>
          <p className="text-xs mb-6 text-[#9b9b9b]">Be the first to share your experience</p>
          {user && hasPurchased !== false && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-craft"
            >
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div>
          {reviews
            .filter(r => !myReview || r.id !== myReview.id)
            .map((r, idx, arr) => (
              <div
                key={r.id}
                className="flex gap-8 lg:gap-16 py-7"
                style={{ borderBottom: idx < arr.length - 1 ? '1px solid #e1e1e1' : 'none' }}
              >
                {/* Left: author */}
                <div className="w-36 xl:w-44 flex-shrink-0">
                  <p className="text-sm font-semibold text-[#1c1c1c]">
                    {r.user_name?.split(' ')[0]} {r.user_name?.split(' ').slice(1).map((n: string) => n[0]).join('')}.
                  </p>
                  <p className="text-[10px] font-medium tracking-wide mt-0.5 uppercase text-[#9b9b9b]">
                    Verified Buyer
                  </p>
                  <p className="text-[10px] mt-0.5 font-mono text-[#9b9b9b]">
                    {new Date(r.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>

                {/* Right: review content */}
                <div className="flex-1 min-w-0">
                  <Stars value={r.rating} size={13} />
                  {r.title && (
                    <p className="text-xs font-bold uppercase tracking-wide mt-2 text-[#1c1c1c]">
                      {r.title}
                    </p>
                  )}
                  {r.comment && (
                    <p className="text-sm mt-1.5 leading-relaxed text-[#363636]">
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={15} />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let num: number;
            if (totalPages <= 5)             num = i + 1;
            else if (page <= 3)              num = i + 1;
            else if (page >= totalPages - 2) num = totalPages - 4 + i;
            else                             num = page - 2 + i;
            return num;
          }).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className="w-8 h-8 flex items-center justify-center text-sm transition-colors"
              style={{
                backgroundColor: page === num ? '#1c1c1c' : 'transparent',
                color: page === num ? '#ffffff' : '#9b9b9b',
              }}
            >
              {num}
            </button>
          ))}

          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="text-[#9b9b9b] text-sm">…</span>
              <button
                onClick={() => setPage(totalPages)}
                className="w-8 h-8 flex items-center justify-center text-sm text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center text-[#9b9b9b] hover:text-[#1c1c1c] transition-colors disabled:opacity-30"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
