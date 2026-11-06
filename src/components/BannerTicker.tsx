import React from 'react';
import { ChevronRight, BellRing } from 'lucide-react';
import { Announcement } from '../types';

interface BannerTickerProps {
  announcements: Announcement[];
  onSelectAnnouncement?: (ann: Announcement) => void;
}

export const BannerTicker: React.FC<BannerTickerProps> = ({
  announcements,
  onSelectAnnouncement,
}) => {
  const urgent = announcements.find((a) => a.isUrgent) || announcements[0];

  if (!urgent) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-blue-900/20 to-amber-500/15 border-b border-amber-300/30 px-3 sm:px-6 py-2 backdrop-blur-xs">
      <div className="w-full max-w-[1760px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider shrink-0 shadow-sm animate-pulse">
            <BellRing className="w-3 h-3" />
            {urgent.isUrgent ? 'Thông báo khẩn' : 'Thông báo mới'}
          </span>
          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            {urgent.title}
          </p>
        </div>

        <button
          onClick={() => {
            if (onSelectAnnouncement) {
              onSelectAnnouncement(urgent);
            } else {
              const el = document.getElementById('announcements');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 dark:text-cyan-300 dark:hover:text-cyan-200 font-bold shrink-0 self-end sm:self-auto cursor-pointer transition-colors"
        >
          <span>Xem chi tiết văn bản thông báo</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
