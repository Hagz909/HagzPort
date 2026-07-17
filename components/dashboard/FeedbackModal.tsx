'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, Loader2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function FeedbackModal({ isOpen, onClose, onSuccess }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      return toast.error('Silakan pilih rating bintang terlebih dahulu.');
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });
      
      if (!res.ok) throw new Error('Gagal mengirim ulasan');
      
      toast.success('Terima kasih atas ulasan Anda!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await fetch('/api/dashboard/feedback/dismiss', { method: 'POST' });
    } catch (error) {
      // Ignore dismiss error
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-5 transform rotate-3">
                <MessageSquare className="w-8 h-8 text-white -rotate-3" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Bagaimana Pengalaman Anda?</h2>
              <p className="text-zinc-400 text-sm mb-8 px-4">
                Anda baru saja membuat CV! Berikan penilaian untuk membantu kami membuat platform HAGZPORT menjadi lebih baik lagi.
              </p>

              {/* Star Rating */}
              <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                  >
                    <Star 
                      className={`w-10 h-10 transition-colors duration-200 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                          : 'fill-transparent text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Comment Box */}
              <div className="w-full text-left mb-6">
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider ml-1">Komentar Tambahan (Opsional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan apa yang Anda sukai atau yang perlu kami perbaiki..."
                  className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="w-full flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || rating === 0}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Kirim Ulasan
                </button>
              </div>
            </div>
            
            {/* Close Icon Top Right */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
