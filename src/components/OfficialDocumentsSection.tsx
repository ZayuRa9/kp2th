import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Building,
  Clock,
  CheckCircle2,
  Search,
  Eye,
  X,
  ExternalLink,
  Maximize2,
} from 'lucide-react';
import { OfficialDocument } from '../types';
import { formatVietnameseDate } from '../utils/rules';

interface OfficialDocumentsSectionProps {
  documents: OfficialDocument[];
}

export const OfficialDocumentsSection: React.FC<OfficialDocumentsSectionProps> = ({ documents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('all');
  const [viewingDoc, setViewingDoc] = useState<OfficialDocument | null>(null);

  const authorities = Array.from(new Set(documents.map((d) => d.issuingAuthority).filter(Boolean)));

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAuth = selectedAuthority === 'all' || doc.issuingAuthority === selectedAuthority;
    return matchesSearch && matchesAuth;
  });

  return (
    <section id="documents-section" className="py-7 sm:py-9 bg-slate-50 border-b border-slate-200">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 pb-2.5 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/90 text-blue-900 border border-blue-200 text-[10.5px] font-bold mb-1">
              <FileText className="w-3 h-3 text-blue-700" />
              <span>CÔNG KHAI VĂN BẢN CHỈ ĐẠO ĐIỀU HÀNH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>VĂN BẢN KHU PHỐ &amp; ĐỊA BÀN DÂN CƯ</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {documents.length} văn bản
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Kho văn bản chỉ đạo, thông báo và kế hoạch triển khai của Phường Tân Hưng và Khu phố 02. Người dân có thể xem trực tiếp toàn văn hoặc tải về máy.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-[11px]">Tự động rà soát &amp; cập nhật hiệu lực</span>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo số hiệu, tên văn bản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-500 whitespace-nowrap">Đơn vị:</span>
            <button
              onClick={() => setSelectedAuthority('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedAuthority === 'all'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            {authorities.map((auth) => (
              <button
                key={auth}
                onClick={() => setSelectedAuthority(auth)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedAuthority === auth
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {auth}
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-white">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Chưa có văn bản nào trong mục này</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Ban Điều hành Khu phố 02 sẽ cập nhật các thông tri, kế hoạch và văn bản hành chính mới nhất tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                      Số: {doc.documentNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                      <Building className="w-3 h-3 text-slate-500" />
                      {doc.issuingAuthority}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Còn hiệu lực
                    </span>
                  </div>

                  <h3
                    onClick={() => setViewingDoc(doc)}
                    className="text-base font-bold text-slate-900 mb-1 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    {doc.title}
                  </h3>

                  {doc.summary && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 max-w-3xl">{doc.summary}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ngày ban hành: {formatVietnameseDate(doc.issueDate)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Thời hạn hiệu lực: đến hết {formatVietnameseDate(doc.expirationDate)}</span>
                    </div>

                    {doc.fileSize && <span>Dung lượng: {doc.fileSize}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                  {/* Xem trực tiếp ngay trên phần mềm */}
                  <button
                    type="button"
                    onClick={() => setViewingDoc(doc)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                    title="Xem toàn văn văn bản ngay trên ứng dụng"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem trực tiếp</span>
                  </button>

                  {/* Tải về máy */}
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.fileName || 'van-ban.pdf'}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
                    title="Tải tệp văn bản về thiết bị"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tải về</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL XEM VĂN BẢN TRỰC TIẾP TRÊN PHẦN MỀM */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between gap-3 border-b border-slate-800">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">
                    Số: {viewingDoc.documentNumber}
                  </span>
                  <span className="text-[11px] text-slate-300 truncate">
                    {viewingDoc.issuingAuthority}
                  </span>
                  <span className="text-[11px] text-amber-300">
                    • Hiệu lực đến: {formatVietnameseDate(viewingDoc.expirationDate)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white truncate max-w-2xl">
                  {viewingDoc.title}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={viewingDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                  title="Mở sang tab mới"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Tab mới</span>
                </a>
                <a
                  href={viewingDoc.fileUrl}
                  download={viewingDoc.fileName || 'van-ban.pdf'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                  title="Tải văn bản về máy"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  title="Đóng cửa sổ xem"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded In-App Viewer */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col">
              <iframe
                src={`${viewingDoc.fileUrl}#view=FitH`}
                title={viewingDoc.title}
                className="w-full h-full border-0 bg-white"
              />

              {/* Fallback floating bar for devices that don't support PDF plugins */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="truncate">
                  Đang xem văn bản trực tiếp: <strong>{viewingDoc.fileName || viewingDoc.title}</strong>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={viewingDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline font-bold"
                  >
                    Nếu không hiển thị, bấm để mở trực tiếp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
