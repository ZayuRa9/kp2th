import React from 'react';
import { FileText, Download, ShieldCheck, FolderDown, FileCode, CheckCircle } from 'lucide-react';
import { ResidentDocument } from '../types';

interface ResidentDocsSectionProps {
  documents: ResidentDocument[];
}

export const ResidentDocsSection: React.FC<ResidentDocsSectionProps> = ({ documents }) => {
  return (
    <section id="docs-section" className="py-7 sm:py-9 bg-slate-50 border-b border-slate-200">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 pb-2.5 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-200 text-[10.5px] font-bold mb-1">
              <FolderDown className="w-3 h-3 text-emerald-700" />
              <span>KHO BIỂU MẪU HÀNH CHÍNH DÂN CƯ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>BIỂU MẪU &amp; HỒ SƠ THỦ TỤC</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {documents.length} biểu mẫu
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Tải về miễn phí các mẫu tờ khai thay đổi thông tin cư trú, phiếu xác nhận nơi ở và quy ước khu dân cư phục vụ giải quyết thủ tục tại Phường Tân Hưng.
            </p>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    doc.fileType === 'pdf'
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}
                >
                  {doc.fileType.toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                      {doc.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium truncate">
                      {doc.department}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {doc.description}
                  </p>

                  {doc.guideText && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-1">
                      <CheckCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">{doc.guideText}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span className="text-[11px] text-slate-400 hidden lg:inline">
                  {doc.fileSize}
                </span>

                <a
                  href={doc.downloadUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải về</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
