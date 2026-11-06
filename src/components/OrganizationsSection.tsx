import React, { useState } from 'react';
import { Users, Award, UserPlus, Info, Check, CheckSquare, Square, X, Send, HeartHandshake } from 'lucide-react';
import { Organization } from '../types';
import { registerOrganizationApi } from '../services/api';
import { useToast } from '../context/ToastContext';

interface OrganizationsSectionProps {
  organizations: Organization[];
}

interface OrgTheme {
  gradient: string;
  badge: string;
  borderHover: string;
  btnPrimary: string;
  btnPrimaryHover: string;
  accentText: string;
  iconBg: string;
}

const DEFAULT_THEMES: Record<string, OrgTheme> = {
  'org-youth': {
    gradient: 'from-blue-700 via-blue-800 to-indigo-900',
    badge: 'bg-blue-100 text-blue-900 border-blue-300',
    borderHover: 'hover:border-blue-400 hover:shadow-blue-500/10',
    btnPrimary: 'bg-blue-600',
    btnPrimaryHover: 'hover:bg-blue-700',
    accentText: 'text-blue-700',
    iconBg: 'bg-blue-50 text-blue-700',
  },
  'org-women': {
    gradient: 'from-rose-600 via-pink-700 to-rose-900',
    badge: 'bg-rose-100 text-rose-900 border-rose-300',
    borderHover: 'hover:border-rose-400 hover:shadow-rose-500/10',
    btnPrimary: 'bg-rose-600',
    btnPrimaryHover: 'hover:bg-rose-700',
    accentText: 'text-rose-700',
    iconBg: 'bg-rose-50 text-rose-700',
  },
  'org-veterans': {
    gradient: 'from-emerald-700 via-teal-800 to-green-950',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
    btnPrimary: 'bg-emerald-700',
    btnPrimaryHover: 'hover:bg-emerald-800',
    accentText: 'text-emerald-700',
    iconBg: 'bg-emerald-50 text-emerald-700',
  },
  'org-study': {
    gradient: 'from-purple-700 via-violet-800 to-indigo-950',
    badge: 'bg-purple-100 text-purple-900 border-purple-300',
    borderHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
    btnPrimary: 'bg-purple-600',
    btnPrimaryHover: 'hover:bg-purple-700',
    accentText: 'text-purple-700',
    iconBg: 'bg-purple-50 text-purple-700',
  },
  'org-redcross': {
    gradient: 'from-red-600 via-rose-700 to-red-900',
    badge: 'bg-red-100 text-red-900 border-red-300',
    borderHover: 'hover:border-red-400 hover:shadow-red-500/10',
    btnPrimary: 'bg-red-600',
    btnPrimaryHover: 'hover:bg-red-700',
    accentText: 'text-red-700',
    iconBg: 'bg-red-50 text-red-700',
  },
  'org-front': {
    gradient: 'from-amber-600 via-orange-700 to-amber-900',
    badge: 'bg-amber-100 text-amber-950 border-amber-300',
    borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
    btnPrimary: 'bg-amber-600',
    btnPrimaryHover: 'hover:bg-amber-700',
    accentText: 'text-amber-800',
    iconBg: 'bg-amber-50 text-amber-700',
  },
};

const FALLBACK_PALETTES: OrgTheme[] = [
  DEFAULT_THEMES['org-youth'],
  DEFAULT_THEMES['org-women'],
  DEFAULT_THEMES['org-veterans'],
  DEFAULT_THEMES['org-study'],
  DEFAULT_THEMES['org-redcross'],
  DEFAULT_THEMES['org-front'],
];

const getOrgTheme = (orgId: string, index: number): OrgTheme => {
  return DEFAULT_THEMES[orgId] || FALLBACK_PALETTES[index % FALLBACK_PALETTES.length];
};

export const OrganizationsSection: React.FC<OrganizationsSectionProps> = ({ organizations }) => {
  const { showToast } = useToast();
  const [selectedOrgDetail, setSelectedOrgDetail] = useState<Organization | null>(null);
  const [registeringOrg, setRegisteringOrg] = useState<Organization | null>(null);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    fullName: '',
    phoneNumber: '',
    birthDate: '',
    neighborhoodGroup: '',
    address: '',
    notes: '',
    hasConfirmedAgreement: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sortedOrgs = [...organizations].sort((a, b) => a.displayOrder - b.displayOrder);

  const openRegisterModal = (org: Organization) => {
    setRegisteringOrg(org);
    setSubmitSuccess(null);
    setSubmitError(null);
    setRegForm({
      fullName: '',
      phoneNumber: '',
      birthDate: '',
      neighborhoodGroup: '',
      address: '',
      notes: '',
      hasConfirmedAgreement: false,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringOrg) return;

    if (!regForm.hasConfirmedAgreement) {
      setSubmitError('Bạn bắt buộc phải tích chọn ô xác nhận cam kết tự nguyện tham gia.');
      return;
    }

    if (!regForm.fullName || !regForm.phoneNumber) {
      setSubmitError('Vui lòng nhập đầy đủ họ tên và số điện thoại liên hệ.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await registerOrganizationApi({
        organizationId: registeringOrg.id,
        organizationName: registeringOrg.name,
        fullName: regForm.fullName,
        phoneNumber: regForm.phoneNumber,
        birthDate: regForm.birthDate,
        neighborhoodGroup: regForm.neighborhoodGroup,
        address: regForm.address,
        notes: regForm.notes,
        hasConfirmedAgreement: regForm.hasConfirmedAgreement,
      });

      setSubmitSuccess(`Đăng ký tham gia ${registeringOrg.shortName} thành công! Ban Điều hành và Chi hội sẽ liên hệ với bạn trong thời gian sớm nhất.`);
      showToast({
        type: 'success',
        title: `Đã gửi đăng ký: ${registeringOrg.shortName}`,
        message: `${regForm.fullName} đã gửi hồ sơ đăng ký tham gia. Chi hội Khu phố 02 sẽ liên hệ sớm nhất!`,
        duration: 7500,
        metadata: { targetTab: 'orgs-section' },
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Lỗi khi gửi thông tin đăng ký');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="orgs-section" className="py-7 sm:py-9 bg-white border-b border-slate-200">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 pb-2.5 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/90 text-blue-900 border border-blue-200 text-[10.5px] font-bold mb-1">
              <Users className="w-3 h-3 text-blue-700" />
              <span>ĐOÀN THỂ &amp; TỔ CHỨC CHÍNH TRỊ - XÃ HỘI</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>ĐĂNG KÝ THAM GIA ĐOÀN THỂ KHU PHỐ</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Tiếp nhận trực tuyến
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Cư dân Khu phố 02 đăng ký trực tiếp tham gia sinh hoạt cùng các tổ chức chính trị - xã hội tại cơ sở.
            </p>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedOrgs.map((org, index) => {
            const theme = getOrgTheme(org.id, index);
            return (
              <div
                key={org.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-400 transition-all duration-300 flex flex-col justify-between overflow-hidden group transform hover:-translate-y-1"
              >
                <div>
                  {/* Header Card with Cover / Badge */}
                  <div className={`relative h-18 overflow-hidden bg-gradient-to-r ${theme.gradient} p-3 flex flex-col justify-between`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.badge} shadow-xs`}>
                        {org.badge}
                      </span>
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                        {org.statusLabel || 'Tiếp nhận liên tục'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-white font-black text-sm leading-tight drop-shadow-xs line-clamp-1">
                        {org.shortName}
                      </h3>
                      <p className="text-white/80 text-[10px] truncate">Khu phố 02 – Phường Tân Hưng</p>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {org.description}
                    </p>

                    {/* Highlights / Member Benefits */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100">
                      <div className={`text-[10px] font-bold ${theme.accentText} uppercase tracking-wider mb-0.5 flex items-center gap-1.5`}>
                        <Award className="w-3 h-3" />
                        <span>Quyền lợi &amp; Hoạt động</span>
                      </div>
                      {org.memberBenefits && org.memberBenefits.slice(0, 2).map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Contact / Eligibility */}
                    {org.leaderInfo && (
                      <div className="text-[11px] text-slate-500 pt-0.5">
                        <span className="font-semibold text-slate-700">Phụ trách: </span>
                        <span>{org.leaderInfo}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrgDetail(org)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Info className="w-3 h-3 text-slate-500" />
                    <span>Điều lệ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openRegisterModal(org)}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl ${theme.btnPrimary} ${theme.btnPrimaryHover} text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer`}
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Đăng ký tham gia</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organization Detail Modal */}
      {selectedOrgDetail && (() => {
        const detailTheme = getOrgTheme(selectedOrgDetail.id, 0);
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className={`bg-gradient-to-r ${detailTheme.gradient} text-white p-5 flex items-start justify-between`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {selectedOrgDetail.badge}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold mt-1">
                    {selectedOrgDetail.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrgDetail(null)}
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs text-slate-700">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                    1. Sứ mệnh &amp; Mục tiêu hoạt động
                  </h4>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedOrgDetail.mission}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                    2. Quyền lợi hội viên / đoàn viên
                  </h4>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedOrgDetail.memberBenefits?.map((b, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                    3. Đối tượng &amp; Tiêu chuẩn gia nhập
                  </h4>
                  <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedOrgDetail.eligibility}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrgDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const org = selectedOrgDetail;
                    setSelectedOrgDetail(null);
                    openRegisterModal(org);
                  }}
                  className={`px-5 py-2 rounded-xl ${detailTheme.btnPrimary} ${detailTheme.btnPrimaryHover} text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Mở bảng đăng ký</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* BẢNG ĐĂNG KÝ THAM GIA ĐOÀN THỂ NỘI BỘ (KHÔNG DÙNG GOOGLE FORMS) */}
      {registeringOrg && (() => {
        const regTheme = getOrgTheme(registeringOrg.id, 0);
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${regTheme.gradient} text-white p-5 flex items-start justify-between`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {registeringOrg.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold mt-1">
                    Bảng đăng ký: {registeringOrg.shortName}
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">Khu phố 02 – Phường Tân Hưng</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRegisteringOrg(null)}
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            {/* Modal Body */}
            {submitSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Đăng ký tham gia thành công</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  {submitSuccess}
                </p>
                <button
                  type="button"
                  onClick={() => setRegisteringOrg(null)}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Hoàn tất &amp; Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4">
                {submitError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {submitError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên người đăng ký <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={regForm.fullName}
                      onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số điện thoại liên hệ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="09xx xxx xxx"
                        value={regForm.phoneNumber}
                        onChange={(e) => setRegForm({ ...regForm, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ngày tháng năm sinh
                      </label>
                      <input
                        type="date"
                        value={regForm.birthDate}
                        onChange={(e) => setRegForm({ ...regForm, birthDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Địa chỉ cư trú tại Khu phố 02 (Người dân tự nhập) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập số nhà, tên hẻm/đường tại Khu phố 02..."
                      value={regForm.address}
                      onChange={(e) => setRegForm({ ...regForm, address: e.target.value, neighborhoodGroup: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nguyện vọng / Ghi chú thêm
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Thời gian có thể tham gia sinh hoạt, sở trường hoặc mong muốn đóng góp..."
                      value={regForm.notes}
                      onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none bg-white"
                    ></textarea>
                  </div>

                  {/* BẮT BUỘC: Ô TÍCH CHỌN XÁC NHẬN ĐĂNG KÝ THAM GIA */}
                  <div
                    onClick={() => setRegForm({ ...regForm, hasConfirmedAgreement: !regForm.hasConfirmedAgreement })}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      regForm.hasConfirmedAgreement
                        ? 'bg-red-50/80 border-red-400 text-red-950 shadow-xs'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-red-600">
                      {regForm.hasConfirmedAgreement ? (
                        <CheckSquare className="w-5 h-5 text-red-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs leading-relaxed select-none">
                      <span className="font-bold">
                        Tôi tự nguyện xác nhận đăng ký tham gia sinh hoạt cùng {registeringOrg.shortName}
                      </span>{' '}
                      và cam kết chấp hành đầy đủ quy chế, điều lệ hoạt động của tổ chức.
                      <span className="text-red-600 font-bold block mt-0.5">
                        *(Bắt buộc phải tích chọn ô này để gửi thông tin)*
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRegisteringOrg(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={!regForm.hasConfirmedAgreement || isSubmitting}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                      regForm.hasConfirmedAgreement && !isSubmitting
                        ? `${regTheme.btnPrimary} ${regTheme.btnPrimaryHover} text-white cursor-pointer active:scale-95`
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Đang gửi hồ sơ...' : 'Gửi đăng ký tham gia'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        );
      })()}
    </section>
  );
};
