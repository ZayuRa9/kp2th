import React, { useState } from 'react';
import { Bell, AlertTriangle, FileText, Download, Calendar, ArrowRight, X } from 'lucide-react';
import { Announcement } from '../types';
import { formatVietnameseDate } from '../utils/rules';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ announcements }) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  return (
    <section id="announcements" className="py-7 sm:py-9 bg-white border-b border-slate-200">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 pb-2.5 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/90 text-blue-900 border border-blue-200 text-[10.5px] font-bold mb-1">
              <Bell className="w-3 h-3 text-blue-700" />
              <span>THÔNG TIN CHÍNH THỐNG CƠ SỞ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>TIN TỨC &amp; THÔNG BÁO KHU PHỐ</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {announcements.length} thông báo
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Các chỉ đạo, văn bản hướng dẫn và thông báo khẩn cấp từ UBND Phường Tân Hưng và Ban Điều hành Khu phố 02.
            </p>
          </div>
        </div>

        {/* Announcements List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                ann.isUrgent
                  ? 'bg-red-50/40 border-red-200 hover:border-red-400 hover:shadow-lg'
                  : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      ann.isUrgent
                        ? 'bg-red-600 text-white'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {ann.categoryLabel}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatVietnameseDate(ann.publishedAt)}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 mb-2 line-clamp-2">
                  {ann.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {ann.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem toàn văn</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {ann.attachmentUrl && (
                  <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Có tệp đính kèm</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`p-5 flex items-start justify-between text-white ${
                selectedAnnouncement.isUrgent
                  ? 'bg-gradient-to-r from-red-600 to-rose-700'
                  : 'bg-gradient-to-r from-blue-900 to-slate-900'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                  {selectedAnnouncement.categoryLabel}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold mt-1">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  Ban hành: {formatVietnameseDate(selectedAnnouncement.publishedAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-900">
                {selectedAnnouncement.summary}
              </div>

              <div className="space-y-3 leading-relaxed text-slate-800 whitespace-pre-line">
                {selectedAnnouncement.content}
              </div>

              {selectedAnnouncement.attachmentUrl && (
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border-blue-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-blue-900">
                      {selectedAnnouncement.attachmentName || 'Tài liệu hướng dẫn đính kèm'}
                    </span>
                  </div>
                  <a
                    href={selectedAnnouncement.attachmentUrl}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về</span>
                  </a>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
