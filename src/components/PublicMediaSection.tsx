import React, { useState, useMemo } from 'react';
import {
  Globe,
  ExternalLink,
  Shield,
  ShieldCheck,
  Users,
  Landmark,
  Flame,
  Share2,
  HeartPulse,
  Trophy,
  Search,
  Check,
  Copy,
  BadgeCheck,
  Facebook,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export interface MediaChannel {
  id: string;
  title: string;
  orgName: string;
  group: 'gov' | 'security' | 'culture_health' | 'community';
  platformType: 'web' | 'facebook';
  url: string;
  displayUrl: string;
  description: string;
  badge: string;
  theme: {
    bgGradient: string;
    border: string;
    borderHover: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    titleHover: string;
    buttonBg: string;
    buttonHover: string;
  };
  iconType: 'gov' | 'culture_sports' | 'police' | 'military' | 'health' | 'mttq' | 'general' | 'youth' | 'kp2';
}

const MEDIA_CHANNELS: MediaChannel[] = [
  {
    id: 'gov-portal',
    title: 'Cổng Thông tin Điện tử Phường Tân Hưng',
    orgName: 'ỦY BAN NHÂN DÂN PHƯỜNG TÂN HƯNG',
    group: 'gov',
    platformType: 'web',
    url: 'https://phuongtanhung.gov.vn/',
    displayUrl: 'phuongtanhung.gov.vn',
    description: 'Cổng TTĐT chính thức, công bố tin tức chỉ đạo điều hành, tình hình kinh tế - xã hội và tra cứu văn bản hành chính của UBND Phường.',
    badge: 'Cổng TTĐT',
    theme: {
      bgGradient: 'from-blue-50 via-sky-50 to-indigo-50/70',
      border: 'border-blue-200',
      borderHover: 'hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/10',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      badgeText: 'text-blue-800',
      iconBg: 'bg-blue-600 text-white',
      iconColor: 'text-white',
      titleHover: 'group-hover:text-blue-700',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonHover: 'hover:bg-blue-700',
    },
    iconType: 'gov',
  },
  {
    id: 'fb-cudvc',
    title: 'Trung tâm Cung ứng Dịch vụ Công phường Tân Hưng',
    orgName: 'TRUNG TÂM CUNG ỨNG DỊCH VỤ CÔNG',
    group: 'culture_health',
    platformType: 'facebook',
    url: 'https://www.facebook.com/TTCUDVC.TANHUNG',
    displayUrl: 'facebook.com/TTCUDVC.TANHUNG',
    description: 'Tổ chức các hoạt động văn hóa nghệ thuật, phong trào thể dục thể thao, sự kiện cộng đồng và các dịch vụ văn hóa thể thao phục vụ nhân dân.',
    badge: 'Văn Hóa & Thể Thao',
    theme: {
      bgGradient: 'from-amber-50 via-orange-50 to-yellow-50/70',
      border: 'border-amber-200',
      borderHover: 'hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'text-amber-900',
      iconBg: 'bg-amber-500 text-white',
      iconColor: 'text-white',
      titleHover: 'group-hover:text-amber-700',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      buttonHover: 'hover:bg-amber-700',
    },
    iconType: 'culture_sports',
  },
  {
    id: 'fb-police',
    title: 'Công an phường Tân Hưng',
    orgName: 'CÔNG AN PHƯỜNG TÂN HƯNG',
    group: 'security',
    platformType: 'facebook',
    url: 'https://www.facebook.com/conganphuongtanhungtphcm',
    displayUrl: 'facebook.com/conganphuongtanhungtphcm',
    description: 'Tuyên truyền an ninh trật tự, cảnh báo thủ đoạn tội phạm công nghệ cao, an toàn PCCC, hướng dẫn cư trú và định danh VNeID.',
    badge: 'An Ninh & PCCC',
    theme: {
      bgGradient: 'from-rose-50 via-red-50 to-pink-50/70',
      border: 'border-rose-200',
      borderHover: 'hover:border-rose-400 hover:shadow-md hover:shadow-rose-500/10',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      badgeText: 'text-rose-800',
      iconBg: 'bg-rose-600 text-white',
      iconColor: 'text-white',
      titleHover: 'group-hover:text-rose-700',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white',
      buttonHover: 'hover:bg-rose-700',
    },
    iconType: 'police',
  },
  {
    id: 'fb-military',
    title: 'Ban Chỉ huy quân sự phường Tân Hưng',
    orgName: 'BAN CHỈ HUY QUÂN SỰ PHƯỜNG',
    group: 'security',
    platformType: 'facebook',
    url: 'https://www.facebook.com/profile.php?id=61578236970673',
    displayUrl: 'facebook.com/bchqs.tanhung',
    description: 'Tuyên truyền luật nghĩa vụ quân sự, đăng ký NVQS tuổi 17, công tác tuyển chọn công dân nhập ngũ và xây dựng thế trận quốc phòng toàn dân.',
    badge: 'Quân Sự & Quốc Phòng',
    theme: {
      bgGradient: 'from-emerald-50 via-green-50 to-teal-50/70',
      border: 'border-emerald-200',
      borderHover: 'hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/10',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeText: 'text-emerald-800',
      iconBg: 'bg-emerald-700 text-white',
      iconColor: 'text-white',
      titleHover: 'group-hover:text-emerald-800',
      buttonBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      buttonHover: 'hover:bg-emerald-800',
    },
    iconType: 'military',
  },
  {
    id: 'fb-health',
    title: 'Trạm Y tế Phường Tân Hưng',
    orgName: 'TRẠM Y TẾ PHƯỜNG TÂN HƯNG',
    group: 'culture_health',
    platformType: 'facebook',
    url: 'https://www.facebook.com/profile.php?id=100090110839996',
    displayUrl: 'facebook.com/tramyte.tanhung',
    description: 'Lịch tiêm chủng mở rộng, hướng dẫn phòng chống dịch bệnh sốt xuất huyết, tay chân miệng, khám BHYT và chăm sóc sức khỏe ban đầu.',
    badge: 'Y Tế & Sức Khỏe',
    theme: {
      bgGradient: 'from-teal-50 via-cyan-50 to-emerald-50/70',
      border: 'border-teal-200',
      borderHover: 'hover:border-teal-400 hover:shadow-md hover:shadow-teal-500/10',
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
      badgeText: 'text-teal-800',
      iconBg: 'bg-teal-600 text-white',
      iconColor: 'text-white',
      titleHover: 'group-hover:text-teal-700',
      buttonBg: 'bg-teal-600 hover:bg-teal-700 text-white',
      buttonHover: 'hover:bg-teal-700',
    },
    iconType: 'health',
  },
  {
    id: 'fb-tanhung',
    title: 'Trang Facebook Thông tin điện tử Phường Tân Hưng',
    orgName: 'NHỊP SỐNG TÂN HƯNG',
    group: 'culture_health',
    platformType: 'facebook',
    url: 'https://www.facebook.com/nhipsong.tanhung',
    displayUrl: 'facebook.com/nhipsong.tanhung',
    description: 'Kênh tin tức cộng đồng, nhịp sống dân sinh, văn hóa thể thao cơ sở và các phong trào thi đua yêu nước sôi nổi trên địa bàn phường.',
    badge: 'Nhịp Sống Dân Sinh',
    theme: {
      bgGradient: 'from-sky-50 via-blue-50 to-cyan-50/70',
      border: 'border-sky-200',
      borderHover: 'hover:border-sky-400 hover:shadow-md hover:shadow-sky-500/10',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
      badgeText: 'text-sky-800',
      iconBg: 'bg-sky-600 text-white',
      iconColor: 'text-white',
      titleHover: 'group-hover:text-sky-700',
      buttonBg: 'bg-sky-600 hover:bg-sky-700 text-white',
      buttonHover: 'hover:bg-sky-700',
    },
    iconType: 'general',
  },
  {
    id: 'fb-mttq',
    title: 'Ủy ban MTTQ Việt Nam phường Tân Hưng',
    orgName: 'ỦY BAN MẶT TRẬN TỔ QUỐC VIỆT NAM',
    group: 'community',
    platformType: 'facebook',
    url: 'https://www.facebook.com/profile.php?id=61578006772852',
    displayUrl: 'facebook.com/mttq.tanhung',
    description: 'Xây dựng khối đại đoàn kết toàn dân, giám sát phản biện xã hội, chăm lo an sinh xã hội, quỹ vì người nghèo và cứu trợ cứu nạn.',
    badge: 'Mặt Trận Tổ Quốc',
    theme: {
      bgGradient: 'from-yellow-50 via-amber-50 to-orange-50/70',
      border: 'border-amber-300',
      borderHover: 'hover:border-amber-500 hover:shadow-md hover:shadow-amber-500/10',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'text-amber-900',
      iconBg: 'bg-amber-600 text-white',
      iconColor: 'text-white',
      titleHover: 'group-hover:text-amber-800',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      buttonHover: 'hover:bg-amber-700',
    },
    iconType: 'mttq',
  },
  {
    id: 'fb-youth',
    title: 'Đoàn TNCS Hồ Chí Minh phường Tân Hưng',
    orgName: 'ĐOÀN THANH NIÊN CỘNG SẢN HỒ CHÍ MINH',
    group: 'community',
    platformType: 'facebook',
    url: 'https://www.facebook.com/profile.php?id=100069747550183',
    displayUrl: 'facebook.com/doantn.tanhung',
    description: 'Phong trào thanh niên xung kích, hỗ trợ chuyển đổi số lưu động, hoạt động tình nguyện hè, chiến dịch Tiếp sức người dân và công tác Đội.',
    badge: 'Tuổi Trẻ & Chuyển Đổi Số',
    theme: {
      bgGradient: 'from-lime-50 via-emerald-50 to-green-50/70',
      border: 'border-emerald-200',
      borderHover: 'hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/10',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeText: 'text-emerald-800',
      iconBg: 'bg-emerald-600 text-white',
      iconColor: 'text-white',
      titleHover: 'group-hover:text-emerald-700',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      buttonHover: 'hover:bg-emerald-700',
    },
    iconType: 'youth',
  },
  {
    id: 'fb-kp2',
    title: 'Trang Facebook Khu phố 02 - Phường Tân Hưng',
    orgName: 'BAN ĐIỀU HÀNH - CHI BỘ KHU PHỐ 2',
    group: 'community',
    platformType: 'facebook',
    url: 'https://www.facebook.com/profile.php?id=61578128452998',
    displayUrl: 'facebook.com/khupho2.tanhung',
    description: 'Kênh thông tin trực tiếp gắn bó với bà con Khu phố 02, cập nhật lịch sinh hoạt dân phố, thông báo khẩn và phong trào thi đua dân cư.',
    badge: 'Khu Phố 02',
    theme: {
      bgGradient: 'from-indigo-50 via-purple-50 to-blue-50/70',
      border: 'border-indigo-200',
      borderHover: 'hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-500/10',
      badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      badgeText: 'text-indigo-900',
      iconBg: 'bg-indigo-600 text-white',
      iconColor: 'text-white',
      titleHover: 'group-hover:text-indigo-700',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      buttonHover: 'hover:bg-indigo-700',
    },
    iconType: 'kp2',
  },
];

type CategoryFilter = 'all' | 'gov' | 'security' | 'culture_health' | 'community';

interface CategoryTab {
  id: CategoryFilter;
  label: string;
  count: number;
}

export const PublicMediaSection: React.FC = () => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: CategoryTab[] = [
    { id: 'all', label: 'Tất cả', count: MEDIA_CHANNELS.length },
    {
      id: 'gov',
      label: 'Cổng TTĐT Phường',
      count: MEDIA_CHANNELS.filter((item) => item.group === 'gov').length,
    },
    {
      id: 'security',
      label: 'An ninh - Quốc phòng',
      count: MEDIA_CHANNELS.filter((item) => item.group === 'security').length,
    },
    {
      id: 'culture_health',
      label: 'Văn hóa, Thể thao & Y tế',
      count: MEDIA_CHANNELS.filter((item) => item.group === 'culture_health').length,
    },
    {
      id: 'community',
      label: 'Đoàn thể & Khu phố',
      count: MEDIA_CHANNELS.filter((item) => item.group === 'community').length,
    },
  ];

  const filteredChannels = useMemo(() => {
    return MEDIA_CHANNELS.filter((channel) => {
      const matchCategory =
        selectedCategory === 'all' || channel.group === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        channel.title.toLowerCase().includes(q) ||
        channel.orgName.toLowerCase().includes(q) ||
        channel.description.toLowerCase().includes(q) ||
        channel.badge.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyLink = async (channel: MediaChannel, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(channel.url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = channel.url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedId(channel.id);
      setTimeout(() => setCopiedId(null), 2500);

      showToast({
        type: 'success',
        title: 'Đã sao chép liên kết',
        message: `Đã lưu đường dẫn ${channel.title} vào bộ nhớ tạm.`,
        duration: 3500,
      });
    } catch {
      showToast({
        type: 'warning',
        title: 'Không thể sao chép',
        message: 'Trình duyệt không hỗ trợ sao chép tự động, vui lòng mở liên kết trực tiếp.',
        duration: 4000,
      });
    }
  };

  const renderIcon = (type: MediaChannel['iconType']) => {
    switch (type) {
      case 'gov':
        return <Globe className="w-5 h-5 text-white" />;
      case 'culture_sports':
        return <Trophy className="w-5 h-5 text-white" />;
      case 'police':
        return <Shield className="w-5 h-5 text-white" />;
      case 'military':
        return <ShieldCheck className="w-5 h-5 text-white" />;
      case 'health':
        return <HeartPulse className="w-5 h-5 text-white" />;
      case 'general':
        return <Share2 className="w-5 h-5 text-white" />;
      case 'mttq':
        return <Landmark className="w-5 h-5 text-white" />;
      case 'youth':
        return <Flame className="w-5 h-5 text-white" />;
      case 'kp2':
        return <Users className="w-5 h-5 text-white" />;
      default:
        return <Globe className="w-5 h-5 text-white" />;
    }
  };

  return (
    <section
      id="media-section"
      className="py-12 sm:py-16 bg-gradient-to-b from-slate-50 via-white to-slate-100 border-b border-slate-200 text-slate-900 relative overflow-hidden"
    >
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold mb-2">
              <Share2 className="w-3.5 h-3.5 text-blue-700" />
              <span>HỆ THỐNG TRUYỀN THÔNG CƠ SỞ CHÍNH THỨC</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              TRANG THÔNG TIN ĐẠI CHÚNG PHƯỜNG TÂN HƯNG
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Các trang thông tin điện tử, cổng dịch vụ và mạng xã hội chính thức của UBND Phường, Công an, Quân sự, Y tế, Mặt trận và các đoàn thể Phường Tân Hưng.
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span>9 Kênh xác thực</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Kết nối trực tiếp 24/7</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar - Bright Theme */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            {categories.map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh kênh, cơ quan..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:bg-white placeholder:text-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer p-0.5"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Empty Search State */}
        {filteredChannels.length === 0 ? (
          <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
            <p className="text-sm font-bold text-slate-800 mb-1">
              Không tìm thấy kênh thông tin phù hợp
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Không có kết quả nào khớp với từ khóa "{searchQuery}" trong danh mục hiện tại.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>
        ) : (
          /* Channels Grid - MỖI KÊNH MỘT MÀU SẮC RIÊNG BIỆT & SÁNG SỦA */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredChannels.map((item) => {
              const isCopied = copiedId === item.id;
              const isFacebook = item.platformType === 'facebook';

              return (
                <div
                  key={item.id}
                  className={`bg-gradient-to-br ${item.theme.bgGradient} rounded-2xl border ${item.theme.border} ${item.theme.borderHover} p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group relative`}
                >
                  <div>
                    {/* Top Row: Colored Icon + Badge + Copy Link */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl ${item.theme.iconBg} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                        >
                          {renderIcon(item.iconType)}
                        </div>

                        <div className="min-w-0">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase rounded-lg border tracking-wide truncate max-w-[170px] sm:max-w-[200px] ${item.theme.badgeBg}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      {/* Platform pill & Copy Link */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isFacebook ? (
                          <span
                            title="Kênh Facebook Fanpage chính thức"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/30"
                          >
                            <Facebook className="w-2.5 h-2.5 fill-current" />
                            <span>Facebook</span>
                          </span>
                        ) : (
                          <span
                            title="Cổng thông tin điện tử Web chính thức"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300"
                          >
                            <Globe className="w-2.5 h-2.5" />
                            <span>Cổng TTĐT</span>
                          </span>
                        )}

                        <button
                          onClick={(e) => handleCopyLink(item, e)}
                          title="Sao chép liên kết"
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                          }`}
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Org Department Name */}
                    <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase mb-1 truncate">
                      {item.orgName}
                    </div>

                    {/* Channel Title */}
                    <h3
                      className={`text-[15px] font-extrabold text-slate-900 mb-1.5 leading-snug line-clamp-1 ${item.theme.titleHover} transition-colors`}
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4 font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Action Button */}
                  <div className="pt-3 border-t border-slate-200/80 mt-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl ${item.theme.buttonBg} font-bold text-xs shadow-xs transition-all active:scale-[0.98] group/btn`}
                    >
                      <span className="truncate text-xs">
                        {isFacebook ? 'Truy cập Fanpage Facebook' : 'Mở Cổng thông tin điện tử'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security & Verification Notice - Bright Theme */}
        <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-700">
              <BadgeCheck className="w-4 h-4" />
            </div>
            <span>
              <strong>Lưu ý cảnh giác:</strong> 100% các kênh trên đều là trang chính thống của các cơ quan, ban ngành Phường Tân Hưng. Người dân lưu ý chỉ theo dõi thông tin từ các kênh chính thống để phòng ngừa thông tin giả mạo.
            </span>
          </div>

          <span className="text-[11px] text-slate-400 shrink-0 font-medium">
            Khu phố 02 • Phường Tân Hưng
          </span>
        </div>
      </div>
    </section>
  );
};
