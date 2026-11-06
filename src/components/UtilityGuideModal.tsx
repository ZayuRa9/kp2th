import React from 'react';
import {
  X,
  Play,
  FileText,
  Download,
  ExternalLink,
  Globe,
  Smartphone,
  Apple,
  FileVideo,
  Presentation,
  CheckCircle2,
} from 'lucide-react';
import { DigitalUtility } from '../types';

interface UtilityGuideModalProps {
  utility: DigitalUtility | null;
  onClose: () => void;
}

export const UtilityGuideModal: React.FC<UtilityGuideModalProps> = ({ utility, onClose }) => {
  if (!utility) return null;

  // Check if video is YouTube or direct video
  const getEmbedYouTubeUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const isYouTube = utility.videoGuideUrl && (utility.videoGuideUrl.includes('youtube') || utility.videoGuideUrl.includes('youtu.be'));
  const embedUrl = isYouTube ? getEmbedYouTubeUrl(utility.videoGuideUrl) : utility.videoGuideUrl;

  const hasAnyGuide = Boolean(
    utility.videoGuideUrl ||
    utility.wordGuideUrl ||
    utility.pptGuideUrl ||
    utility.pdfGuideUrl
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0">
              {utility.imageUrl ? (
                <img
                  src={utility.imageUrl}
                  alt={utility.name}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <span className="font-black text-xs text-amber-300">KP2</span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {utility.badge}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                {utility.name}
              </h3>
              <p className="text-xs text-slate-300">
                {utility.categoryName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ hướng dẫn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Giới thiệu chức năng
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {utility.shortDesc}
            </p>
          </div>

          {/* Quick Direct Links */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
            {utility.websiteUrl && (
              <a
                href={utility.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Mở Website dịch vụ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {utility.androidUrl && (
              <a
                href={utility.androidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>Tải CH Play (Android)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {utility.iosUrl && (
              <a
                href={utility.iosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Apple className="w-4 h-4" />
                <span>Tải App Store (iOS)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Video Guide Section (MP4) */}
          {utility.videoGuideUrl && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2.5 text-slate-800">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-rose-600 fill-current" />
                  <h4 className="text-sm font-bold">
                    {utility.videoGuideName || utility.videoGuideTitle || 'Video hướng dẫn thao tác (MP4)'}
                  </h4>
                </div>
                {!isYouTube && (
                  <a
                    href={utility.videoGuideUrl}
                    download
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 px-2 py-1 rounded-md border border-rose-200"
                  >
                    <Download className="w-3 h-3" />
                    <span>Tải video MP4</span>
                  </a>
                )}
              </div>

              {isYouTube ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                  <iframe
                    src={embedUrl}
                    title={utility.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <video
                    controls
                    src={utility.videoGuideUrl}
                    className="w-full h-full object-contain"
                  >
                    Trình duyệt của bạn không hỗ trợ phát video trực tiếp.
                  </video>
                </div>
              )}
            </div>
          )}

          {/* Downloadable Documents Section (MP4, Word, PPT, PDF) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tài liệu hướng dẫn đính kèm (Word, PPT, PDF)
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Bấm tải về máy để xem chi tiết</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. File Word */}
              {utility.wordGuideUrl ? (
                <div className="flex flex-col justify-between p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[11px] shadow-2xs">
                        DOC
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        File Word
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-2 mb-1">
                      {utility.wordGuideName || 'Tài liệu hướng dẫn (Word)'}
                    </div>
                    <div className="text-[10px] text-slate-500">Định dạng .doc / .docx</div>
                  </div>
                  <a
                    href={utility.wordGuideUrl}
                    download
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải tệp Word</span>
                  </a>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-xs flex flex-col items-center justify-center text-center py-6">
                  <FileText className="w-6 h-6 text-slate-300 mb-1" />
                  <span className="font-semibold text-slate-500">File Word</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Chưa đính kèm tệp</span>
                </div>
              )}

              {/* 2. File PowerPoint PPT */}
              {utility.pptGuideUrl ? (
                <div className="flex flex-col justify-between p-3.5 rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-[11px] shadow-2xs">
                        PPT
                      </div>
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                        Slide PPT
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-2 mb-1">
                      {utility.pptGuideName || 'Bài trình chiếu hướng dẫn (PPT)'}
                    </div>
                    <div className="text-[10px] text-slate-500">Định dạng .ppt / .pptx</div>
                  </div>
                  <a
                    href={utility.pptGuideUrl}
                    download
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải slide PPT</span>
                  </a>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-xs flex flex-col items-center justify-center text-center py-6">
                  <Presentation className="w-6 h-6 text-slate-300 mb-1" />
                  <span className="font-semibold text-slate-500">File PPT</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Chưa đính kèm tệp</span>
                </div>
              )}

              {/* 3. File PDF */}
              {utility.pdfGuideUrl ? (
                <div className="flex flex-col justify-between p-3.5 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-[11px] shadow-2xs">
                        PDF
                      </div>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        File PDF
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-2 mb-1">
                      {utility.pdfGuideName || 'Tài liệu hướng dẫn (PDF)'}
                    </div>
                    <div className="text-[10px] text-slate-500">Xem trực tiếp hoặc tải về</div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <a
                      href={utility.pdfGuideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-2xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem</span>
                    </a>
                    <a
                      href={utility.pdfGuideUrl}
                      download
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 transition-colors shadow-2xs"
                      title="Tải PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-xs flex flex-col items-center justify-center text-center py-6">
                  <FileText className="w-6 h-6 text-slate-300 mb-1" />
                  <span className="font-semibold text-slate-500">File PDF</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Chưa đính kèm tệp</span>
                </div>
              )}
            </div>

            {!hasAnyGuide && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs text-slate-600">
                  Ban Điều hành Khu phố 02 đang chuẩn bị các tệp tài liệu hướng dẫn (MP4, Word, PPT, PDF) cho tiện ích này. Bà con có thể bấm mở trực tiếp Website hoặc tải ứng dụng trên điện thoại ở phía trên.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
