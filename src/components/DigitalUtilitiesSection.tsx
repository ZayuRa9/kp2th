import React, { useState, useMemo } from 'react';
import { Search, Globe, Smartphone, Apple, FileVideo, ExternalLink, Sparkles, ChevronDown, ChevronUp, Pin } from 'lucide-react';
import { DigitalUtility, UtilityCategory } from '../types';
import { UtilityGuideModal } from './UtilityGuideModal';

interface DigitalUtilitiesSectionProps {
  utilities: DigitalUtility[];
}

export const DigitalUtilitiesSection: React.FC<DigitalUtilitiesSectionProps> = ({ utilities }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGuideModal, setActiveGuideModal] = useState<DigitalUtility | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'Tất cả tiện ích số' },
    { id: 'admin', label: 'Hành chính công' },
    { id: 'identity', label: 'Định danh điện tử' },
    { id: 'welfare', label: 'An sinh xã hội' },
    { id: 'health', label: 'Y tế số' },
    { id: 'security', label: 'An ninh & PCCC' },
    { id: 'living', label: 'Đời sống thiết yếu' },
  ];

  // Hàm kiểm tra khớp chuyên mục
  const matchesSubcategory = (u: DigitalUtility, catId: string): boolean => {
    if (catId === 'all') return true;
    if (u.category === (catId as any)) return true;

    const lowerName = (u.name + ' ' + u.shortDesc + ' ' + u.badge).toLowerCase();

    switch (catId) {
      case 'admin':
        return (
          u.category === 'admin' ||
          lowerName.includes('dịch vụ công') ||
          lowerName.includes('thủ tục hành chính') ||
          lowerName.includes('tthc')
        );
      case 'identity':
        return (
          lowerName.includes('vneid') ||
          lowerName.includes('định danh') ||
          lowerName.includes('cccd') ||
          lowerName.includes('xác thực')
        );
      case 'welfare':
        return (
          u.category === 'welfare' ||
          lowerName.includes('vssid') ||
          lowerName.includes('bảo hiểm xã hội') ||
          lowerName.includes('an sinh') ||
          lowerName.includes('trợ cấp')
        );
      case 'health':
        return (
          lowerName.includes('y tế') ||
          lowerName.includes('sức khỏe') ||
          lowerName.includes('bhyt') ||
          lowerName.includes('bảo hiểm y tế') ||
          lowerName.includes('tiêm chủng')
        );
      case 'security':
        return (
          u.category === 'security' ||
          lowerName.includes('114') ||
          lowerName.includes('cháy') ||
          lowerName.includes('cứu nạn') ||
          lowerName.includes('an ninh') ||
          lowerName.includes('công an')
        );
      case 'living':
        return (
          u.category === 'living' ||
          lowerName.includes('điện lực') ||
          lowerName.includes('evnhcmc') ||
          lowerName.includes('nước') ||
          lowerName.includes('sawaco') ||
          lowerName.includes('1022') ||
          lowerName.includes('rác')
        );
      default:
        return u.category === catId;
    }
  };

  // Lọc theo danh mục và tìm kiếm
  const filteredUtilities = useMemo(() => {
    return utilities
      .filter((u) => {
        const matchesCategory = matchesSubcategory(u, selectedCategory);
        const matchesSearch =
          searchQuery.trim() === '' ||
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.badge.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [utilities, selectedCategory, searchQuery]);

  // Gom toàn bộ vào một nhóm thống nhất
  const displayedUtilities = filteredUtilities;

  return (
    <section id="utilities-section" className="py-7 sm:py-9 bg-slate-50 border-b border-slate-200">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Compact Section Header & Filter Bar Merged into 1 unified line */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-3.5 mb-4 border-b border-slate-200 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10.5px] font-bold">
                <Sparkles className="w-3 h-3 text-blue-700" />
                <span>CHUYỂN ĐỔI SỐ CƠ SỞ</span>
              </span>
              <span className="text-[11px] text-slate-500 hidden md:inline">
                Hệ sinh thái tiện ích số quốc gia &amp; đô thị thông minh phục vụ cư dân
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>TIỆN ÍCH SỐ &amp; TẤT CẢ DỊCH VỤ CÔNG</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {filteredUtilities.length} dịch vụ
              </span>
            </h2>
          </div>

          {/* Filter & Search Bar Unified */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-700 text-white shadow-sm ring-1 ring-blue-600'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tiện ích số..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Utilities Grid */}
        {displayedUtilities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            Không tìm thấy tiện ích số phù hợp với từ khóa "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedUtilities.map((util) => (
              <div
                key={util.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div>
                  {/* Top card: Badge & Logo */}
                  <div className="flex items-start justify-between gap-2.5 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
                        {util.badge}
                      </span>
                      {util.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                          <Pin className="w-2.5 h-2.5 rotate-45 text-amber-600" />
                          <span>Ưu tiên</span>
                        </span>
                      )}
                    </div>
                    {util.imageUrl && util.imageUrl.trim() !== '' && (
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 p-1 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                        <img
                          src={util.imageUrl}
                          alt={util.name}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1 mb-1">
                    {util.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                    {util.shortDesc}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                  {/* Direct Launch Buttons */}
                  <div className="flex items-center gap-1.5">
                    {util.websiteUrl ? (
                      <a
                        href={util.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-95"
                        title={`Mở website ${util.name}`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Mở Website</span>
                      </a>
                    ) : (
                      <span className="flex-1 py-2 px-2 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-medium text-center">
                        Cổng nội bộ
                      </span>
                    )}

                    {util.androidUrl && (
                      <a
                        href={util.androidUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs"
                        title="Tải trên Google Play (Android)"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {util.iosUrl && (
                      <a
                        href={util.iosUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200 transition-all shadow-2xs"
                        title="Tải trên App Store (iOS)"
                      >
                        <Apple className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Multimedia Guide Button (Video / PDF / Word) */}
                  <button
                    onClick={() => setActiveGuideModal(util)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <FileVideo className="w-3.5 h-3.5 text-blue-600" />
                    <span>Hướng dẫn cài đặt &amp; sử dụng</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guide Details Modal */}
      {activeGuideModal && (
        <UtilityGuideModal
          utility={activeGuideModal}
          onClose={() => setActiveGuideModal(null)}
        />
      )}
    </section>
  );
};
