import React, { useState } from 'react';
import {
  Users,
  FileText,
  Calendar,
  Layers,
  Building2,
  AlertTriangle,
  HelpCircle,
  Database,
  LogOut,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Download,
  Upload,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldAlert,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  Eye,
  Key,
  Sliders,
  PhoneCall,
  HeartHandshake,
  Image,
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  DownloadCloud,
  FileVideo,
  Presentation,
  Play,
  FolderOpen,
} from 'lucide-react';
import { DocumentUploader, UtilityResourceForm } from './DocumentUploader';
import {
  AdminDataResponse,
  saveCommitteeMemberApi,
  deleteCommitteeMemberApi,
  saveOfficialDocumentApi,
  deleteOfficialDocumentApi,
  purgeExpiredDocumentsApi,
  updateDemographics,
  updateCommunityInfo,
  saveActivityApi,
  deleteActivityApi,
  saveOrganizationApi,
  saveUtilityApi,
  deleteUtilityApi,
  deleteProgramRegistrationApi,
  updateProgramRegistrationStatusApi,
  deleteOrganizationRegistrationApi,
  updateOrganizationRegistrationStatusApi,
  updateIncidentStatusApi,
  deleteIncidentReportApi,
  addOfficialAnswerApi,
  togglePinQuestionApi,
  deleteQuestionApi,
  deleteAnswerApi,
  uploadFileApi,
  changeAdminPassword,
  getLocalDatabase,
  saveLocalDatabase,
} from '../services/api';
import {
  CommitteeMember,
  OfficialDocument,
  Activity,
  DigitalUtility,
  Organization,
  OrganizationRegistration,
  IncidentReport,
  CommunityQuestion,
} from '../types';
import {
  formatVietnameseDate,
  extractPhoneDigits,
  aggregateMonthlyStatistics,
  MonthlyStatistics,
} from '../utils/rules';
import {
  exportMonthlySummaryReportWord,
  exportMonthlySummaryReportExcel,
  exportProgramRegistrationsWord,
  exportProgramRegistrationsCsv,
  exportOfficialDocumentsWord,
  exportOfficialDocumentsCsv,
  exportIncidentReportsWord,
  exportIncidentReportsCsv,
  exportCommunityQAWord,
  exportCommunityQACsv,
  exportActivitiesWord,
  exportActivitiesCsv,
} from '../utils/exportReports';

interface AdminDashboardProps {
  adminData: AdminDataResponse;
  onRefresh: () => void;
  onLogout: () => void;
  onClose: () => void;
}

type TabKey =
  | 'monthlyReport'
  | 'portalInfo'
  | 'committee'
  | 'officialDocs'
  | 'incidents'
  | 'qa'
  | 'orgRegistrations'
  | 'activities'
  | 'demographics'
  | 'organizations'
  | 'utilities'
  | 'utilityResources'
  | 'backup';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminData,
  onRefresh,
  onLogout,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('monthlyReport');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick Utility Resource Management (Standalone DocumentUploader Tab)
  const [quickManageResources, setQuickManageResources] = useState<UtilityResourceForm>({
    videoGuideUrl: '',
    videoGuideName: '',
    wordGuideUrl: '',
    wordGuideName: '',
    pptGuideUrl: '',
    pptGuideName: '',
    pdfGuideUrl: '',
    pdfGuideName: '',
  });

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg(null);
    } else {
      setSuccessMsg(msg);
      setErrorMsg(null);
    }
    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 4000);
  };

  // 1. Committee Member Form State
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [memberForm, setMemberForm] = useState({
    fullName: '',
    birthDate: '',
    position: '',
    phoneNumber: '',
    responsibility: '',
    receivingHours: '07:30 - 11:30 & 13:30 - 17:00 (Thứ Hai – Thứ Sáu)',
  });

  // 2. Official Document Form State
  const [docForm, setDocForm] = useState({
    documentNumber: '',
    title: '',
    issuingAuthority: 'UBND Phường Tân Hưng',
    issueDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    fileUrl: '',
    fileName: '',
    fileSize: '',
    summary: '',
  });
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // 3. Activity Form State
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [actForm, setActForm] = useState({
    title: '',
    category: 'community' as Activity['category'],
    categoryLabel: 'Sinh hoạt cộng đồng',
    time: '',
    location: '',
    organizer: 'Ban Điều hành Khu phố 02',
    summary: '',
    content: '',
    imageUrl: '', // Ảnh bìa / hình ảnh minh họa sự kiện (như ảnh Facebook)
    logoUrl: '', // Logo biểu trưng sự kiện (tùy chọn)
    status: 'upcoming' as Activity['status'],
    statusLabel: 'Sắp diễn ra',
  });
  const [uploadingActImage, setUploadingActImage] = useState(false);
  const [uploadingActLogo, setUploadingActLogo] = useState(false);

  // Month selector for Executive Monthly Report
  const [selectedReportMonth, setSelectedReportMonth] = useState<string>('2026-11');

  // 4. Utility Form State
  const [editingUtility, setEditingUtility] = useState<DigitalUtility | null>(null);
  const [utilForm, setUtilForm] = useState({
    name: '',
    category: 'admin' as DigitalUtility['category'],
    categoryName: 'Hành chính công & Định danh',
    shortDesc: '',
    badge: 'Chính phủ',
    icon: 'ShieldCheck',
    imageUrl: '',
    websiteUrl: '',
    androidUrl: '',
    iosUrl: '',
    videoGuideUrl: '',
    videoGuideName: '',
    wordGuideUrl: '',
    wordGuideName: '',
    pptGuideUrl: '',
    pptGuideName: '',
    pdfGuideUrl: '',
    pdfGuideName: '',
    displayOrder: 1,
    isPinned: true,
    isVisible: true,
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGuideMp4, setUploadingGuideMp4] = useState(false);
  const [uploadingGuideWord, setUploadingGuideWord] = useState(false);
  const [uploadingGuidePpt, setUploadingGuidePpt] = useState(false);
  const [uploadingGuidePdf, setUploadingGuidePdf] = useState(false);
  const [uploadingOrgLogoId, setUploadingOrgLogoId] = useState<string | null>(null);

  // 5. Demographics Form State
  const [demoForm, setDemoForm] = useState({ ...adminData.demographics });

  // 5b. Portal Header & Hotline Form State
  const [portalForm, setPortalForm] = useState({
    bannerTitle: adminData.communityInfo.bannerTitle || 'CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH QUYỀN SỐ CƠ SỞ',
    ward: adminData.communityInfo.ward || 'Phường Tân Hưng',
    city: adminData.communityInfo.city || 'Thành phố Hồ Chí Minh',
    workingHours: adminData.communityInfo.workingHours || 'Giờ tiếp dân: 07:30 - 17:00 (Thứ Hai - Thứ Bảy)',
    hotline: adminData.communityInfo.hotline || '028 3775 1234',
    policePhone: adminData.communityInfo.policePhone || '028 3771 5678 (Công an Phường Tân Hưng)',
    healthClinicPhone: adminData.communityInfo.healthClinicPhone || '028 3771 2468 (Trạm Y tế Phường Tân Hưng)',
    address: adminData.communityInfo.address || '465/1/2 Trần Xuân Soạn, Khu phố 2, Phường Tân Hưng, TP. Hồ Chí Minh',
    coordinates: adminData.communityInfo.coordinates || '10.751307, 106.707736',
    googleMapsPinUrl: adminData.communityInfo.googleMapsPinUrl || 'https://maps.app.goo.gl/ogk6mH2ve5uYgDaY8',
    email: adminData.communityInfo.email || 'khupho02.phuongtanhung@tphcm.gov.vn',
    leaderName: adminData.communityInfo.leaderName || '',
    leaderPhone: adminData.communityInfo.leaderPhone || '',
    deputyName: adminData.communityInfo.deputyName || '',
    deputyPhone: adminData.communityInfo.deputyPhone || '',
  });

  // Dedicated In-App Confirmation Modal for All Deletions
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    title: string;
    itemName: string;
    warningNote?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Forms dirty state to prevent unwanted auto-resets while typing
  const [demoFormDirty, setDemoFormDirty] = useState(false);
  const [portalFormDirty, setPortalFormDirty] = useState(false);

  React.useEffect(() => {
    if (!demoFormDirty && adminData.demographics) {
      setDemoForm({ ...adminData.demographics });
    }
  }, [adminData.demographics, demoFormDirty]);

  React.useEffect(() => {
    if (!portalFormDirty && adminData.communityInfo) {
      setPortalForm({
        bannerTitle: adminData.communityInfo.bannerTitle || 'CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH QUYỀN SỐ CƠ SỞ',
        ward: adminData.communityInfo.ward || 'Phường Tân Hưng',
        city: adminData.communityInfo.city || 'Thành phố Hồ Chí Minh',
        workingHours: adminData.communityInfo.workingHours || 'Giờ tiếp dân: 07:30 - 17:00 (Thứ Hai - Thứ Bảy)',
        hotline: adminData.communityInfo.hotline || '028 3775 1234',
        policePhone: adminData.communityInfo.policePhone || '028 3771 5678 (Công an Phường Tân Hưng)',
        healthClinicPhone: adminData.communityInfo.healthClinicPhone || '028 3771 2468 (Trạm Y tế Phường Tân Hưng)',
        address: adminData.communityInfo.address || '465/1/2 Trần Xuân Soạn, Khu phố 2, Phường Tân Hưng, TP. Hồ Chí Minh',
        coordinates: adminData.communityInfo.coordinates || '10.751307, 106.707736',
        googleMapsPinUrl: adminData.communityInfo.googleMapsPinUrl || 'https://maps.app.goo.gl/ogk6mH2ve5uYgDaY8',
        email: adminData.communityInfo.email || 'khupho02.phuongtanhung@tphcm.gov.vn',
        leaderName: adminData.communityInfo.leaderName || '',
        leaderPhone: adminData.communityInfo.leaderPhone || '',
        deputyName: adminData.communityInfo.deputyName || '',
        deputyPhone: adminData.communityInfo.deputyPhone || '',
      });
    }
  }, [adminData.communityInfo, portalFormDirty]);

  const handleExecuteDelete = async () => {
    if (!deleteConfirmModal) return;
    setIsDeleting(true);
    try {
      await deleteConfirmModal.onConfirm();
      setDeleteConfirmModal(null);
    } catch (err: any) {
      showNotification(err.message || 'Lỗi khi xóa dữ liệu', true);
    } finally {
      setIsDeleting(false);
    }
  };

  // 6. Password Change Form State
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });

  // 7. Incident Response Modal
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [incidentResponseText, setIncidentResponseText] = useState('');
  const [incidentNewStatus, setIncidentNewStatus] = useState<IncidentReport['status']>('in_progress');

  // 8. Q&A Official Answer State
  const [selectedQ, setSelectedQ] = useState<CommunityQuestion | null>(null);
  const [officialAnswerText, setOfficialAnswerText] = useState('');

  // Handle PDF file upload for Official Documents
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadFileApi(file.name, base64);
        setDocForm((prev) => ({
          ...prev,
          fileUrl: res.fileUrl,
          fileName: res.fileName,
          fileSize: res.fileSize,
        }));
        showNotification('Tải lên tệp PDF thành công');
        setUploadingPdf(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification('Lỗi tải tệp: ' + err.message, true);
      setUploadingPdf(false);
    }
  };

  // Handle Save Committee Member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.fullName || !memberForm.position || !memberForm.phoneNumber || !memberForm.responsibility) {
      showNotification('Vui lòng điền đầy đủ các thông tin bắt buộc', true);
      return;
    }
    setLoading(true);
    try {
      await saveCommitteeMemberApi({
        ...(editingMember ? { id: editingMember.id } : {}),
        ...memberForm,
        displayOrder: editingMember ? editingMember.displayOrder : adminData.committeeMembers.length + 1,
      });
      showNotification(editingMember ? 'Cập nhật cán bộ thành công' : 'Thêm cán bộ mới thành công');
      setEditingMember(null);
      setMemberForm({
        fullName: '',
        birthDate: '',
        position: '',
        phoneNumber: '',
        responsibility: '',
        receivingHours: '07:30 - 11:30 & 13:30 - 17:00 (Thứ Hai – Thứ Sáu)',
      });
      onRefresh();
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Member
  const handleDeleteMember = (id: string, name?: string) => {
    const memberName = name || 'cán bộ này';
    setDeleteConfirmModal({
      title: 'Xác nhận xóa cán bộ Ban Điều hành',
      itemName: memberName,
      warningNote: 'Dữ liệu cán bộ sẽ bị gỡ bỏ vĩnh viễn khỏi danh sách công khai và cơ sở dữ liệu.',
      onConfirm: async () => {
        await deleteCommitteeMemberApi(id);
        showNotification(`Đã xóa thành công thông tin cán bộ "${memberName}"`);
        onRefresh();
      },
    });
  };

  // Handle Save Official Document
  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.documentNumber || !docForm.title || !docForm.expirationDate || !docForm.fileUrl) {
      showNotification('Vui lòng điền số hiệu, trích yếu, ngày hết hạn và tải tệp PDF', true);
      return;
    }
    setLoading(true);
    try {
      await saveOfficialDocumentApi({
        ...docForm,
      });
      showNotification('Ban hành văn bản thành công (Văn bản sẽ tự động thu hồi khi qua ngày hết hạn)');
      setDocForm({
        documentNumber: '',
        title: '',
        issuingAuthority: 'UBND Phường Tân Hưng',
        issueDate: new Date().toISOString().split('T')[0],
        expirationDate: '',
        fileUrl: '',
        fileName: '',
        fileSize: '',
        summary: '',
      });
      onRefresh();
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Purge Expired Docs
  const handlePurgeExpiredDocs = () => {
    setDeleteConfirmModal({
      title: 'Dọn dẹp văn bản hết thời hạn hiệu lực',
      itemName: 'Tất cả văn bản lưu trữ đã quá ngày hết hạn',
      warningNote: 'Hệ thống sẽ rà soát và thu hồi vĩnh viễn tất cả văn bản đã quá ngày hết hạn khỏi danh sách.',
      onConfirm: async () => {
        const count = await purgeExpiredDocumentsApi();
        showNotification(`Đã tự động rà soát và dọn dẹp ${count} văn bản hết thời hạn hiệu lực`);
        onRefresh();
      },
    });
  };

  // Handle Save Demographics
  const handleSaveDemographics = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDemographics(demoForm);
      setDemoFormDirty(false);
      showNotification('Đã lưu và cập nhật chỉ số dân cư thành công!');
      onRefresh();
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Save Organization Forms URL
  const handleSaveOrgForms = async (org: Organization, newUrl: string) => {
    try {
      await saveOrganizationApi({
        ...org,
        googleFormsUrl: newUrl.trim(),
      });
      showNotification(`Cập nhật link đăng ký cho ${org.shortName} thành công`);
      onRefresh();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Save Digital Utility (Thêm mới / Chỉnh sửa)
  const handleSaveUtility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utilForm.name || !utilForm.shortDesc) {
      showNotification('Vui lòng nhập tên tiện ích và mô tả ngắn gọn', true);
      return;
    }
    setLoading(true);
    try {
      await saveUtilityApi({
        ...(editingUtility ? { id: editingUtility.id } : {}),
        ...utilForm,
        displayOrder: editingUtility ? editingUtility.displayOrder : adminData.digitalUtilities.length + 1,
      });
      showNotification(editingUtility ? 'Đã cập nhật tiện ích số thành công' : 'Đã thêm tiện ích số mới thành công');
      setEditingUtility(null);
      setUtilForm({
        name: '',
        category: 'admin',
        categoryName: 'Hành chính công & Định danh',
        shortDesc: '',
        badge: 'Chính phủ',
        icon: 'ShieldCheck',
        imageUrl: '',
        websiteUrl: '',
        androidUrl: '',
        iosUrl: '',
        videoGuideUrl: '',
        videoGuideName: '',
        wordGuideUrl: '',
        wordGuideName: '',
        pptGuideUrl: '',
        pptGuideName: '',
        pdfGuideUrl: '',
        pdfGuideName: '',
        displayOrder: adminData.digitalUtilities.length + 2,
        isPinned: true,
        isVisible: true,
      });
      onRefresh();
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUtility = (id: string, name?: string) => {
    const utilName = name || 'tiện ích số này';
    setDeleteConfirmModal({
      title: 'Xác nhận xóa tiện ích số',
      itemName: utilName,
      warningNote: 'Tiện ích này sẽ không còn hiển thị trên thư viện tiện ích dân cư.',
      onConfirm: async () => {
        await deleteUtilityApi(id);
        showNotification(`Đã xóa tiện ích số "${utilName}"`);
        onRefresh();
      },
    });
  };

  // Handle Avatar Image Upload for Utility
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadFileApi(file.name, base64);
        setUtilForm((prev) => ({
          ...prev,
          imageUrl: res.fileUrl,
        }));
        showNotification('Tải lên logo tiện ích số thành công. Nhấn "Lưu tiện ích số" để hoàn tất.');
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification('Lỗi tải avatar: ' + err.message, true);
      setUploadingAvatar(false);
    }
  };

  // Handle Guide File Uploads for Utility (MP4, Word, PPT, PDF)
  const handleGuideUpload = async (e: React.ChangeEvent<HTMLInputElement>, format: 'mp4' | 'word' | 'ppt' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (format === 'mp4') setUploadingGuideMp4(true);
    if (format === 'word') setUploadingGuideWord(true);
    if (format === 'ppt') setUploadingGuidePpt(true);
    if (format === 'pdf') setUploadingGuidePdf(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await uploadFileApi(file.name, base64);
          if (format === 'mp4') {
            setUtilForm((prev) => ({
              ...prev,
              videoGuideUrl: res.fileUrl,
              videoGuideName: file.name,
            }));
            showNotification(`Đã tải lên video MP4: ${file.name}`);
          } else if (format === 'word') {
            setUtilForm((prev) => ({
              ...prev,
              wordGuideUrl: res.fileUrl,
              wordGuideName: file.name,
            }));
            showNotification(`Đã tải lên tệp Word: ${file.name}`);
          } else if (format === 'ppt') {
            setUtilForm((prev) => ({
              ...prev,
              pptGuideUrl: res.fileUrl,
              pptGuideName: file.name,
            }));
            showNotification(`Đã tải lên tệp PowerPoint (PPT): ${file.name}`);
          } else if (format === 'pdf') {
            setUtilForm((prev) => ({
              ...prev,
              pdfGuideUrl: res.fileUrl,
              pdfGuideName: file.name,
            }));
            showNotification(`Đã tải lên tệp PDF: ${file.name}`);
          }
        } catch (uploadErr: any) {
          showNotification('Lỗi khi tải tệp lên: ' + uploadErr.message, true);
        } finally {
          if (format === 'mp4') setUploadingGuideMp4(false);
          if (format === 'word') setUploadingGuideWord(false);
          if (format === 'ppt') setUploadingGuidePpt(false);
          if (format === 'pdf') setUploadingGuidePdf(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification('Lỗi đọc tệp: ' + err.message, true);
      if (format === 'mp4') setUploadingGuideMp4(false);
      if (format === 'word') setUploadingGuideWord(false);
      if (format === 'ppt') setUploadingGuidePpt(false);
      if (format === 'pdf') setUploadingGuidePdf(false);
    }
  };

  // Handle Cover Photo / Image Upload for Activity (Ảnh bìa như Facebook)
  const handleActivityImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingActImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadFileApi(file.name, base64);
        setActForm((prev) => ({
          ...prev,
          imageUrl: res.fileUrl,
        }));
        showNotification('Tải lên ảnh bìa hoạt động (hiển thị như bài viết Facebook) thành công');
        setUploadingActImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification('Lỗi tải ảnh hoạt động: ' + err.message, true);
      setUploadingActImage(false);
    }
  };

  // Handle Logo / Badge Upload for Activity
  const handleActivityLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingActLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadFileApi(file.name, base64);
        setActForm((prev) => ({
          ...prev,
          logoUrl: res.fileUrl,
        }));
        showNotification('Tải lên logo biểu trưng hoạt động thành công');
        setUploadingActLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification('Lỗi tải logo: ' + err.message, true);
      setUploadingActLogo(false);
    }
  };

  // Handle Organization Logo Upload
  const handleOrgLogoUpload = async (org: Organization, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOrgLogoId(org.id);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadFileApi(file.name, base64);
        await saveOrganizationApi({
          ...org,
          logo: res.fileUrl,
        });
        showNotification(`Đã cập nhật logo cho "${org.shortName}" thành công`);
        setUploadingOrgLogoId(null);
        onRefresh();
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification('Lỗi tải logo: ' + err.message, true);
      setUploadingOrgLogoId(null);
    }
  };

  const handleRemoveOrgLogo = async (org: Organization) => {
    try {
      await saveOrganizationApi({
        ...org,
        logo: '',
      });
      showNotification(`Đã gỡ logo của "${org.shortName}"`);
      onRefresh();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Program (Activity) Registration Confirmation / Rejection
  const handleUpdateProgramRegStatus = async (id: string, status: 'pending' | 'confirmed' | 'rejected') => {
    try {
      await updateProgramRegistrationStatusApi(id, status);
      if (status === 'confirmed') {
        showNotification('Đã xác nhận người dân ĐƯỢC PHÉP THAM GIA hoạt động');
      } else if (status === 'rejected') {
        showNotification('Đã từ chối tham gia của người dân');
      } else {
        showNotification('Đã đặt lại trạng thái về "Chưa xác nhận"');
      }
      onRefresh();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Organization Registrations
  const handleDeleteOrgRegistration = (id: string, name?: string) => {
    const applicantName = name || 'đơn đăng ký này';
    setDeleteConfirmModal({
      title: 'Xác nhận xóa đơn đăng ký đoàn thể',
      itemName: applicantName,
      warningNote: 'Hồ sơ xin gia nhập tổ chức đoàn thể này sẽ bị gỡ bỏ vĩnh viễn khỏi danh sách tiếp nhận.',
      onConfirm: async () => {
        await deleteOrganizationRegistrationApi(id);
        showNotification(`Đã xóa đơn đăng ký đoàn thể của "${applicantName}"`);
        onRefresh();
      },
    });
  };

  const handleUpdateOrgRegistrationStatus = async (id: string, status: string) => {
    try {
      await updateOrganizationRegistrationStatusApi(id, status);
      showNotification('Đã cập nhật trạng thái đơn đăng ký');
      onRefresh();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Incident Resolution
  const handleUpdateIncidentStatus = async () => {
    if (!selectedIncident) return;
    try {
      await updateIncidentStatusApi(selectedIncident.id, incidentNewStatus, incidentResponseText);
      showNotification('Cập nhật tiến độ xử lý phản ánh thành công');
      setSelectedIncident(null);
      setIncidentResponseText('');
      onRefresh();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Q&A Official Answer
  const handleSendOfficialAnswer = async () => {
    if (!selectedQ || !officialAnswerText.trim()) return;
    try {
      await addOfficialAnswerApi(selectedQ.id, officialAnswerText.trim());
      showNotification('Đã đăng phản hồi chính thức từ Ban Điều hành');
      setSelectedQ(null);
      setOfficialAnswerText('');
      onRefresh();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) return;
    try {
      await changeAdminPassword(pwForm.currentPassword, pwForm.newPassword);
      showNotification('Đổi mật khẩu quản trị viên thành công');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Save Portal & Hotline Info
  const handleSavePortalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCommunityInfo(portalForm);
      setPortalFormDirty(false);
      showNotification('Đã cập nhật và lưu vĩnh viễn thông tin Cổng, Tiếp dân và Đường dây nóng!');
      onRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Lỗi khi lưu thông tin', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-800">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center font-bold text-xs">
            KP2
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-blue-400 tracking-wider">
              TRANG ĐIỀU HÀNH NỘI BỘ
            </div>
            <div className="text-sm font-extrabold text-white">
              BAN ĐIỀU HÀNH KHU PHỐ 02 – PHƯỜNG TÂN HƯNG
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Tài khoản: <strong className="text-white">{adminData.adminStatus.username}</strong>
          </span>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-56 bg-white border-r border-slate-200 overflow-y-auto p-2 space-y-1 shrink-0 hidden md:block">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
            Phân hệ Quản lý
          </div>

          {[
            { key: 'monthlyReport', label: 'Báo cáo Tổng hợp (Tháng)', icon: BarChart3 },
            { key: 'portalInfo', label: 'Cổng thông tin & Hotline', icon: Sliders },
            { key: 'committee', label: 'Cán bộ Ban Điều hành', icon: Users },
            { key: 'officialDocs', label: 'Văn bản Khu phố', icon: FileText },
            { key: 'incidents', label: 'Phản ánh sự cố', icon: AlertTriangle, badge: adminData.incidentReports.filter(i => i.status === 'received').length },
            { key: 'qa', label: 'Hỏi đáp Dân cư', icon: HelpCircle, badge: adminData.communityQuestions.filter(q => q.status === 'pending').length },
            { key: 'orgRegistrations', label: 'Đăng ký Đoàn thể', icon: HeartHandshake, badge: (adminData.organizationRegistrations || []).filter(r => r.status === 'pending').length },
            { key: 'activities', label: 'Hoạt động & Sự kiện', icon: Calendar, badge: adminData.programRegistrations.length },
            { key: 'demographics', label: 'Chỉ số Dân cư', icon: Layers },
            { key: 'organizations', label: 'Thông tin Đoàn thể', icon: Building2 },
            { key: 'utilities', label: 'Thư viện Tiện ích số', icon: ExternalLink },
            { key: 'utilityResources', label: 'Tải lên Tài nguyên (MP4/DOCX/PPTX/PDF)', icon: FolderOpen },
            { key: 'backup', label: 'Bảo mật & Sao lưu', icon: Database },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as TabKey)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {/* Mobile Tab Bar */}
          <div className="md:hidden mb-4 overflow-x-auto pb-1 flex gap-1.5 no-scrollbar">
            {[
              { key: 'monthlyReport', label: 'Báo cáo Tháng', icon: BarChart3 },
              { key: 'portalInfo', label: 'Cổng & Hotline', icon: Sliders },
              { key: 'committee', label: 'Cán bộ KP2', icon: Users },
              { key: 'officialDocs', label: 'Văn bản', icon: FileText },
              { key: 'incidents', label: 'Phản ánh', icon: AlertTriangle },
              { key: 'qa', label: 'Hỏi đáp', icon: HelpCircle },
              { key: 'orgRegistrations', label: 'ĐK Đoàn thể', icon: HeartHandshake },
              { key: 'activities', label: 'Hoạt động', icon: Calendar },
              { key: 'demographics', label: 'Chỉ số', icon: Layers },
              { key: 'organizations', label: 'Đoàn thể', icon: Building2 },
              { key: 'utilities', label: 'Tiện ích', icon: ExternalLink },
              { key: 'utilityResources', label: 'Tài nguyên số', icon: FolderOpen },
              { key: 'backup', label: 'Bảo mật', icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Notifications */}
          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB: BÁO CÁO TỔNG HỢP HIỆU QUẢ HOẠT ĐỘNG THEO THÁNG */}
          {activeTab === 'monthlyReport' && (() => {
            const stats = aggregateMonthlyStatistics(adminData, selectedReportMonth);
            const monthLabel = selectedReportMonth === 'all'
              ? 'Toàn bộ thời gian'
              : `Tháng ${selectedReportMonth.split('-')[1]}/${selectedReportMonth.split('-')[0]}`;

            const filteredRegs = adminData.programRegistrations.filter((r) =>
              selectedReportMonth === 'all' ? true : (r.createdAt && r.createdAt.startsWith(selectedReportMonth))
            );
            const filteredIncidents = adminData.incidentReports.filter((i) =>
              selectedReportMonth === 'all' ? true : (i.createdAt && i.createdAt.startsWith(selectedReportMonth))
            );
            const filteredQuestions = adminData.communityQuestions.filter((q) =>
              selectedReportMonth === 'all' ? true : (q.createdAt && q.createdAt.startsWith(selectedReportMonth))
            );

            return (
              <div className="space-y-6">
                {/* 1. Header & Quick Month Selector & Export Actions */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                        <BarChart3 className="w-3 h-3 text-blue-700" />
                        <span>BẢNG ĐIỀU HÀNH & THEO DÕI HIỆU QUẢ HOẠT ĐỘNG DÂN CƯ</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                        BÁO CÁO TỔNG HỢP THEO THÁNG – KHU PHỐ 02
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Theo dõi toàn diện lượt tham gia hoạt động, tiến độ xử lý phản ánh sự cố và tình hình giải đáp kiến nghị nhân dân. Xuất báo cáo in ấn chuẩn mẫu hành chính Word/Excel.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Month filter select */}
                      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                        <Calendar className="w-4 h-4 text-slate-500 ml-1.5" />
                        <select
                          value={selectedReportMonth}
                          onChange={(e) => setSelectedReportMonth(e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-2"
                        >
                          <option value="2026-11">Tháng 11/2026 (Hiện tại)</option>
                          <option value="2026-10">Tháng 10/2026</option>
                          <option value="2026-09">Tháng 09/2026</option>
                          <option value="2026-08">Tháng 08/2026</option>
                          <option value="2026-07">Tháng 07/2026</option>
                          <option value="all">Toàn bộ thời gian (Lũy kế)</option>
                        </select>
                      </div>

                      {/* Export Word Button */}
                      <button
                        type="button"
                        onClick={() => exportMonthlySummaryReportWord(stats, monthLabel)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                        title="Xuất file báo cáo định dạng Microsoft Word (.doc) có Quốc hiệu Tiêu ngữ và chữ ký"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-200" />
                        <span>Xuất Báo Cáo Word (.doc)</span>
                      </button>

                      {/* Export Excel Button */}
                      <button
                        type="button"
                        onClick={() => exportMonthlySummaryReportExcel(stats, monthLabel)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                        title="Xuất bảng tổng hợp số liệu Microsoft Excel (.xls)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Xuất Báo Cáo Excel (.xls)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Four Statistical KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Hoạt động & Đăng ký tham gia */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase text-blue-700 tracking-wider">Hoạt động &amp; Đăng ký</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {stats.activities.totalRegistrations} <span className="text-xs font-normal text-slate-500">lượt đăng ký</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 font-semibold">
                        👥 {stats.activities.totalAttendees} người dân tham dự
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          Đã duyệt: {stats.activities.confirmedRegistrations}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                          Chờ duyệt: {stats.activities.pendingRegistrations}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => exportProgramRegistrationsWord(filteredRegs)}
                        className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                      >
                        Xuất DS Word
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => exportProgramRegistrationsCsv(filteredRegs)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                      >
                        Xuất DS Excel
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Phản ánh sự cố */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-red-400 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase text-red-700 tracking-wider">Phản ánh sự cố</span>
                        <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {stats.incidents.totalIncidents} <span className="text-xs font-normal text-slate-500">vụ việc tiếp nhận</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 font-semibold">
                        ✅ Đã xử lý xong: <strong className="text-emerald-700">{stats.incidents.resolvedCount}</strong> vụ
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold">
                          Tỷ lệ xử lý: {stats.incidents.resolutionRate}%
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                          Đang xử lý: {stats.incidents.inProgressCount}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => exportIncidentReportsWord(filteredIncidents)}
                        className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                      >
                        Xuất báo cáo Word
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => exportIncidentReportsCsv(filteredIncidents)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                      >
                        Xuất Excel
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Hỏi đáp dân cư */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase text-amber-700 tracking-wider">Hỏi đáp dân cư</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {stats.communityQA.totalQuestions} <span className="text-xs font-normal text-slate-500">câu hỏi nhân dân</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 font-semibold">
                        💬 Đã giải đáp: <strong className="text-blue-700">{stats.communityQA.answeredCount}</strong> câu
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold">
                          Tỷ lệ phản hồi: {stats.communityQA.responseRate}%
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                          Chờ trả lời: {stats.communityQA.pendingCount}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => exportCommunityQAWord(filteredQuestions)}
                        className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                      >
                        Xuất hỏi đáp Word
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => exportCommunityQACsv(filteredQuestions)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                      >
                        Xuất Excel
                      </button>
                    </div>
                  </div>

                  {/* Card 4: Văn bản ban hành */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider">Văn bản Khu phố</span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {stats.documents.totalDocuments} <span className="text-xs font-normal text-slate-500">văn bản chỉ đạo</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 font-semibold">
                        📜 Đang hiệu lực: <strong className="text-emerald-700">{stats.documents.activeCount}</strong>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          Còn hiệu lực: {stats.documents.activeCount}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          Hết hiệu lực: {stats.documents.expiredCount}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => exportOfficialDocumentsWord(adminData.officialDocuments)}
                        className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                      >
                        Xuất văn bản Word
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => exportOfficialDocumentsCsv(adminData.officialDocuments)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                      >
                        Xuất Excel
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Detailed Data Tables Preview in Tab */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Table: Lượt đăng ký hoạt động trong kỳ */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        ĐĂNG KÝ HOẠT ĐỘNG TRONG KỲ ({filteredRegs.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('activities')}
                        className="text-xs text-blue-700 font-bold hover:underline cursor-pointer"
                      >
                        Đi đến Quản lý Hoạt động &rarr;
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredRegs.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          Chưa có lượt đăng ký nào trong {monthLabel}.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Họ tên &amp; SĐT</th>
                              <th className="p-2.5">Chương trình</th>
                              <th className="p-2.5 text-center">Số người</th>
                              <th className="p-2.5 text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredRegs.slice(0, 10).map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50">
                                <td className="p-2.5">
                                  <div className="font-bold text-slate-900">{r.fullName}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{r.phoneNumber}</div>
                                </td>
                                <td className="p-2.5 text-slate-700 line-clamp-1">{r.activityTitle}</td>
                                <td className="p-2.5 text-center font-bold">{r.attendeeCount || 1}</td>
                                <td className="p-2.5 text-center">
                                  {r.status === 'confirmed' ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                      Đã duyệt
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                                      Chờ duyệt
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Table: Phản ánh sự cố trong kỳ */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        PHẢN ÁNH SỰ CỐ TIẾP NHẬN ({filteredIncidents.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('incidents')}
                        className="text-xs text-blue-700 font-bold hover:underline cursor-pointer"
                      >
                        Đi đến Xử lý Phản ánh &rarr;
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredIncidents.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          Chưa có phản ánh sự cố nào trong {monthLabel}.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Tiêu đề &amp; Vị trí</th>
                              <th className="p-2.5">Người gửi</th>
                              <th className="p-2.5 text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredIncidents.slice(0, 10).map((i) => (
                              <tr key={i.id} className="hover:bg-slate-50">
                                <td className="p-2.5">
                                  <div className="font-bold text-slate-900 line-clamp-1">{i.title}</div>
                                  <div className="text-[10px] text-slate-500 truncate">{i.locationAddress}</div>
                                </td>
                                <td className="p-2.5 text-slate-700">{i.reporterName}</td>
                                <td className="p-2.5 text-center">
                                  {i.status === 'resolved' ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                      Đã xử lý
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                                      {i.status === 'in_progress' ? 'Đang xử lý' : 'Mới tiếp nhận'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 0: CỔNG THÔNG TIN & ĐƯỜNG DÂY NÓNG (HEADER TOP BAR) */}
          {activeTab === 'portalInfo' && (
            <div className="space-y-6">
              {/* Live Portal Header Preview Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-700" />
                    <span>BẢN XEM TRƯỚC DẢI BIỂU NGỮ ĐẦU TRANG (HEADER TOP BAR)</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 w-fit">
                    Cố định đầu trang – Gọi liền ngay
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Dải biểu ngữ này hiển thị cố định ở đầu trang web của Khu phố 02. Các số điện thoại tại đây và trên toàn hệ thống đều tích hợp giao thức cuộc gọi tức thì – <strong>người dân bấm vào là gọi liền ngay lập tức</strong>.
                </p>

                {/* Visual Live Preview */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-xs py-2.5 px-4 rounded-xl border border-slate-800 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold tracking-wide text-blue-100">
                      {portalForm.bannerTitle || 'CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH QUYỀN SỐ CƠ SỞ'}
                    </span>
                    <span className="text-slate-400 hidden sm:inline">|</span>
                    <span className="text-slate-300 hidden sm:inline">{portalForm.ward} – {portalForm.city}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 flex-wrap justify-center sm:justify-end">
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] text-slate-200">
                      {portalForm.workingHours || 'Giờ tiếp dân: 07:30 - 17:00'}
                    </span>
                    <a
                      href={`tel:${extractPhoneDigits(portalForm.hotline)}`}
                      className="inline-flex items-center gap-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold px-2.5 py-1 rounded-md border border-amber-400/40 transition-all active:scale-95 shadow-xs"
                      title="Thử bấm gọi liền"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Đường dây nóng: <u>{portalForm.hotline || 'Chưa cập nhật'}</u></span>
                      <span className="bg-amber-400 text-slate-950 text-[10px] uppercase font-black px-1.5 py-0.2 rounded-sm ml-0.5">Gọi liền</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Adjustment Form */}
              <form onSubmit={handleSavePortalInfo} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                {/* Group 1: Dải Biểu Ngữ Trên Cùng & Định Danh */}
                <div>
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>1. Nội dung Dải Biểu Ngữ Trên Cùng (Header Top Bar) & Hành chính</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tiêu đề Dải Biểu Ngữ (Chạy đầu trang) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={portalForm.bannerTitle}
                        onChange={(e) => setPortalForm({ ...portalForm, bannerTitle: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                        placeholder="Ví dụ: CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH QUYỀN SỐ CƠ SỞ"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lịch tiếp dân & Giờ làm việc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={portalForm.workingHours}
                        onChange={(e) => setPortalForm({ ...portalForm, workingHours: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ví dụ: Giờ tiếp dân: 07:30 - 17:00 (Thứ 2 - Thứ 7)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Đơn vị Phường <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={portalForm.ward}
                        onChange={(e) => setPortalForm({ ...portalForm, ward: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ví dụ: Phường Tân Hưng"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tỉnh / Thành phố <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={portalForm.city}
                        onChange={(e) => setPortalForm({ ...portalForm, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ví dụ: Thành phố Hồ Chí Minh"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Địa chỉ Trụ sở Ban Điều hành KP2 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={portalForm.address}
                        onChange={(e) => setPortalForm({ ...portalForm, address: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="465/1/2 Trần Xuân Soạn, Khu phố 2, Phường Tân Hưng, TP. Hồ Chí Minh"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tọa độ GPS Google Maps (Đã ghim thực tế) <span className="text-blue-600 font-normal">(Vĩ độ, Kinh độ)</span>
                      </label>
                      <input
                        type="text"
                        value={portalForm.coordinates}
                        onChange={(e) => setPortalForm({ ...portalForm, coordinates: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="10.751307, 106.707736"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Định dạng: <code>10.751307, 106.707736</code>. Bản đồ vệ tinh và chỉ đường sẽ ghim trực tiếp đến đúng tọa độ này.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Liên kết ghim vị trí Google Maps (Shortlink hoặc URL chia sẻ)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={portalForm.googleMapsPinUrl}
                          onChange={(e) => setPortalForm({ ...portalForm, googleMapsPinUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="https://maps.app.goo.gl/ogk6mH2ve5uYgDaY8"
                        />
                        {portalForm.googleMapsPinUrl && (
                          <a
                            href={portalForm.googleMapsPinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 shrink-0 inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Mở ghim</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group 2: Số điện thoại khẩn cấp & Hotline (Bấm gọi liền) */}
                <div>
                  <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-red-600" />
                    <span>2. Số Điện Thoại & Đường Dây Nóng (Người dân bấm vào là gọi liền)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                      <label className="block text-xs font-bold text-amber-900 mb-1">
                        Đường dây nóng Trực ban KP2 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={portalForm.hotline}
                        onChange={(e) => setPortalForm({ ...portalForm, hotline: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-amber-300 bg-white rounded-lg focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                        placeholder="Số điện thoại trực ban (VD: 028 3775 1234)"
                      />
                      {portalForm.hotline && (
                        <a
                          href={`tel:${extractPhoneDigits(portalForm.hotline)}`}
                          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300 transition-colors shadow-xs active:scale-95"
                          title="Bấm để gọi ngay"
                        >
                          <Phone className="w-3 h-3 text-emerald-600 animate-bounce" />
                          <span>Bấm gọi liền: {extractPhoneDigits(portalForm.hotline)}</span>
                        </a>
                      )}
                    </div>

                    <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                      <label className="block text-xs font-bold text-blue-900 mb-1">
                        Trực ban Công an Phường <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={portalForm.policePhone}
                        onChange={(e) => setPortalForm({ ...portalForm, policePhone: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                        placeholder="VD: 028 3771 5678 (Công an Phường Tân Hưng)"
                      />
                      {portalForm.policePhone && (
                        <a
                          href={`tel:${extractPhoneDigits(portalForm.policePhone)}`}
                          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-100/70 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-300 transition-colors shadow-xs active:scale-95"
                          title="Bấm để gọi ngay"
                        >
                          <Phone className="w-3 h-3 text-blue-600 animate-bounce" />
                          <span>Bấm gọi liền: {extractPhoneDigits(portalForm.policePhone)}</span>
                        </a>
                      )}
                    </div>

                    <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                      <label className="block text-xs font-bold text-emerald-900 mb-1">
                        Trạm Y tế Phường <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={portalForm.healthClinicPhone}
                        onChange={(e) => setPortalForm({ ...portalForm, healthClinicPhone: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-emerald-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
                        placeholder="VD: 028 3771 2468 (Trạm Y tế Phường Tân Hưng)"
                      />
                      {portalForm.healthClinicPhone && (
                        <a
                          href={`tel:${extractPhoneDigits(portalForm.healthClinicPhone)}`}
                          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300 transition-colors shadow-xs active:scale-95"
                          title="Bấm để gọi ngay"
                        >
                          <Phone className="w-3 h-3 text-emerald-600 animate-bounce" />
                          <span>Bấm gọi liền: {extractPhoneDigits(portalForm.healthClinicPhone)}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Group 3: Thông tin Lãnh đạo & Email liên hệ */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    <span>3. Thông tin Trực tiếp & Email tiếp nhận</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Họ tên Trưởng khu phố
                      </label>
                      <input
                        type="text"
                        value={portalForm.leaderName}
                        onChange={(e) => setPortalForm({ ...portalForm, leaderName: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="VD: Nguyễn Văn A"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        SĐT Trưởng khu phố (Bấm gọi liền)
                      </label>
                      <input
                        type="text"
                        value={portalForm.leaderPhone}
                        onChange={(e) => setPortalForm({ ...portalForm, leaderPhone: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Số điện thoại di động"
                      />
                      {portalForm.leaderPhone && (
                        <a
                          href={`tel:${extractPhoneDigits(portalForm.leaderPhone)}`}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                        >
                          <Phone className="w-3 h-3 text-blue-600" /> Gọi: {extractPhoneDigits(portalForm.leaderPhone)}
                        </a>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email tiếp nhận thông tin
                      </label>
                      <input
                        type="email"
                        value={portalForm.email}
                        onChange={(e) => setPortalForm({ ...portalForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="khupho02.phuongtanhung@..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Họ tên Phó Trưởng khu phố
                      </label>
                      <input
                        type="text"
                        value={portalForm.deputyName}
                        onChange={(e) => setPortalForm({ ...portalForm, deputyName: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="VD: Trần Thị B"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        SĐT Phó Trưởng khu phố (Bấm gọi liền)
                      </label>
                      <input
                        type="text"
                        value={portalForm.deputyPhone}
                        onChange={(e) => setPortalForm({ ...portalForm, deputyPhone: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Số điện thoại di động"
                      />
                      {portalForm.deputyPhone && (
                        <a
                          href={`tel:${extractPhoneDigits(portalForm.deputyPhone)}`}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                        >
                          <Phone className="w-3 h-3 text-blue-600" /> Gọi: {extractPhoneDigits(portalForm.deputyPhone)}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 italic">
                    Sau khi lưu, toàn bộ các mục trên trang chủ, bản đồ, dải header và chân trang sẽ được cập nhật đồng bộ ngay lập tức.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Lưu thay đổi Cổng & Đường dây nóng</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 1: CÁN BỘ BAN ĐIỀU HÀNH */}
          {activeTab === 'committee' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-700" />
                  {editingMember ? 'CHỈNH SỬA THÔNG TIN CÁN BỘ' : 'THÊM MỚI CÁN BỘ BAN ĐIỀU HÀNH KHU PHỐ 02'}
                </h3>

                <form onSubmit={handleSaveMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên cán bộ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Thành"
                      value={memberForm.fullName}
                      onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ngày tháng năm sinh
                    </label>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY (ví dụ: 15/08/1968)"
                      value={memberForm.birthDate}
                      onChange={(e) => setMemberForm({ ...memberForm, birthDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chức vụ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Trưởng khu phố / Phó Trưởng khu phố / Bí thư Chi bộ"
                      value={memberForm.position}
                      onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0908 123 456"
                      value={memberForm.phoneNumber}
                      onChange={(e) => setMemberForm({ ...memberForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thời gian tiếp dân (Giờ hành chính)
                    </label>
                    <input
                      type="text"
                      placeholder="07:30 - 11:30 & 13:30 - 17:00 (Thứ Hai – Thứ Sáu)"
                      value={memberForm.receivingHours}
                      onChange={(e) => setMemberForm({ ...memberForm, receivingHours: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Ngoài giờ này, cuộc gọi từ người dân tự động chuyển tiếp tới Công an Phường.
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phụ trách nhiệm vụ / Lĩnh vực / Địa bàn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Phụ trách chung, An ninh - Trật tự, Tổ Dân phố 1 đến 6"
                      value={memberForm.responsibility}
                      onChange={(e) => setMemberForm({ ...memberForm, responsibility: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
                    {editingMember && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMember(null);
                          setMemberForm({
                            fullName: '',
                            birthDate: '',
                            position: '',
                            phoneNumber: '',
                            responsibility: '',
                            receivingHours: '07:30 - 11:30 & 13:30 - 17:00 (Thứ Hai – Thứ Sáu)',
                          });
                        }}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      {editingMember ? 'Lưu thay đổi' : 'Thêm cán bộ vào danh sách'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Committee Members Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    DANH SÁCH CÁN BỘ BAN ĐIỀU HÀNH ({adminData.committeeMembers.length})
                  </span>
                </div>

                {adminData.committeeMembers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Chưa có cán bộ nào. Hãy nhập thông tin cán bộ ở form phía trên để hiển thị ra trang chủ.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 font-bold">Họ và tên</th>
                          <th className="py-2.5 px-4 font-bold">Chức vụ</th>
                          <th className="py-2.5 px-4 font-bold">Ngày sinh</th>
                          <th className="py-2.5 px-4 font-bold">Số điện thoại</th>
                          <th className="py-2.5 px-4 font-bold">Giờ tiếp dân</th>
                          <th className="py-2.5 px-4 font-bold">Phụ trách</th>
                          <th className="py-2.5 px-4 font-bold text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminData.committeeMembers.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-bold text-slate-900">{m.fullName}</td>
                            <td className="py-3 px-4 font-semibold text-blue-700">{m.position}</td>
                            <td className="py-3 px-4 text-slate-600">{m.birthDate || '—'}</td>
                            <td className="py-3 px-4 text-slate-800 font-mono">
                              <a
                                href={`tel:${extractPhoneDigits(m.phoneNumber)}`}
                                className="text-blue-700 hover:text-blue-900 hover:underline font-bold"
                              >
                                {m.phoneNumber}
                              </a>
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-[11px]">{m.receivingHours || '07:30 - 11:30 & 13:30 - 17:00 (T2-T6)'}</td>
                            <td className="py-3 px-4 text-slate-700">{m.responsibility}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingMember(m);
                                  setMemberForm({
                                    fullName: m.fullName,
                                    birthDate: m.birthDate,
                                    position: m.position,
                                    phoneNumber: m.phoneNumber,
                                    responsibility: m.responsibility,
                                    receivingHours: m.receivingHours || '07:30 - 11:30 & 13:30 - 17:00 (Thứ Hai – Thứ Sáu)',
                                  });
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Sửa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(m.id, m.fullName)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VĂN BẢN KHU PHỐ */}
          {activeTab === 'officialDocs' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    BAN HÀNH VĂN BẢN MỚI (TỰ ĐỘNG THU HỒI KHI HẾT HẠN)
                  </h3>
                  <button
                    onClick={handlePurgeExpiredDocs}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Rà soát & dọn dẹp văn bản hết hạn</span>
                  </button>
                </div>

                <form onSubmit={handleSaveDoc} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số ký hiệu văn bản <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: 18/TB-UBND"
                        value={docForm.documentNumber}
                        onChange={(e) => setDocForm({ ...docForm, documentNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Đơn vị ban hành <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="UBND Phường Tân Hưng / Ban Điều hành KP2"
                        value={docForm.issuingAuthority}
                        onChange={(e) => setDocForm({ ...docForm, issuingAuthority: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ngày ban hành
                      </label>
                      <input
                        type="date"
                        required
                        value={docForm.issueDate}
                        onChange={(e) => setDocForm({ ...docForm, issueDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tiêu đề / Trích yếu văn bản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Kế hoạch phối hợp tổng vệ sinh môi trường phòng chống dịch bệnh năm 2026"
                      value={docForm.title}
                      onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">
                        Thời hạn hiệu lực (Ngày hết hạn) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={docForm.expirationDate}
                        onChange={(e) => setDocForm({ ...docForm, expirationDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                      <span className="text-[10px] text-amber-700 mt-1 block">
                        Văn bản sẽ tự động ẩn và xóa khỏi trang chủ sau ngày này.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tệp PDF văn bản đính kèm <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold cursor-pointer hover:bg-blue-800">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingPdf ? 'Đang tải...' : 'Tải tệp PDF'}</span>
                          <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                        </label>
                        {docForm.fileName && (
                          <span className="text-xs text-slate-700 font-medium truncate max-w-xs">
                            {docForm.fileName} ({docForm.fileSize})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tóm tắt nội dung văn bản
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tóm tắt ngắn gọn các điểm chính để người dân dễ nắm bắt..."
                      value={docForm.summary}
                      onChange={(e) => setDocForm({ ...docForm, summary: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading || uploadingPdf}
                      className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      Ban hành văn bản
                    </button>
                  </div>
                </form>
              </div>

              {/* Official Documents List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    DANH SÁCH VĂN BẢN HIỆN HÀNH ({adminData.officialDocuments.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportOfficialDocumentsWord(adminData.officialDocuments)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Xuất báo cáo danh mục văn bản đã ban hành định dạng Word"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xuất Báo cáo (Word)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportOfficialDocumentsCsv(adminData.officialDocuments)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Xuất danh mục văn bản đã ban hành ra bảng tính Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Xuất Báo cáo (Excel)</span>
                    </button>
                  </div>
                </div>

                {adminData.officialDocuments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Chưa có văn bản nào. Hãy tải tệp PDF và điền thông tin để ban hành.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 font-bold">Số hiệu</th>
                          <th className="py-2.5 px-4 font-bold">Trích yếu văn bản</th>
                          <th className="py-2.5 px-4 font-bold">Đơn vị ban hành</th>
                          <th className="py-2.5 px-4 font-bold">Hết hạn vào</th>
                          <th className="py-2.5 px-4 font-bold">Trạng thái</th>
                          <th className="py-2.5 px-4 font-bold text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminData.officialDocuments.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-bold text-blue-700">{d.documentNumber}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900 max-w-sm">{d.title}</td>
                            <td className="py-3 px-4 text-slate-600">{d.issuingAuthority}</td>
                            <td className="py-3 px-4 text-amber-800 font-semibold">{formatVietnameseDate(d.expirationDate)}</td>
                            <td className="py-3 px-4">
                              {d.isExpired ? (
                                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                                  Hết hiệu lực
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  Còn hiệu lực
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <a
                                href={d.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded inline-block"
                                title="Xem file"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => {
                                  setDeleteConfirmModal({
                                    title: 'Xóa văn bản chính thức',
                                    itemName: `${d.documentNumber} - ${d.title}`,
                                    warningNote: 'Văn bản và tệp PDF đính kèm sẽ bị xóa hoàn toàn khỏi hệ thống lưu trữ.',
                                    onConfirm: async () => {
                                      await deleteOfficialDocumentApi(d.id);
                                      showNotification(`Đã xóa văn bản ${d.documentNumber}`);
                                      onRefresh();
                                    },
                                  });
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PHẢN ÁNH HIỆN TRƯỜNG */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    TIẾP NHẬN & XỬ LÝ PHẢN ÁNH DÂN SINH ({adminData.incidentReports.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportIncidentReportsWord(adminData.incidentReports)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Xuất báo cáo tổng hợp tình hình phản ánh sự cố kiến nghị định dạng Word"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xuất Báo cáo (Word)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportIncidentReportsCsv(adminData.incidentReports)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Xuất bảng số liệu phản ánh sự cố ra Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Xuất Báo cáo (Excel)</span>
                    </button>
                  </div>
                </div>

                {adminData.incidentReports.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Hiện chưa có tin báo hoặc phản ánh sự cố nào từ người dân.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 font-bold">Mã & Ngày gửi</th>
                          <th className="py-2.5 px-4 font-bold">Nội dung sự cố</th>
                          <th className="py-2.5 px-4 font-bold">Vị trí</th>
                          <th className="py-2.5 px-4 font-bold">Người gửi</th>
                          <th className="py-2.5 px-4 font-bold">Trạng thái</th>
                          <th className="py-2.5 px-4 font-bold text-right">Xử lý</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminData.incidentReports.map((inc) => (
                          <tr key={inc.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4">
                              <div className="font-mono font-bold text-blue-700">{inc.reportCode}</div>
                              <div className="text-[10px] text-slate-400">{formatVietnameseDate(inc.createdAt)}</div>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-bold text-slate-900 line-clamp-1">{inc.title}</div>
                              <div className="text-slate-600 line-clamp-1">{inc.description}</div>
                              {inc.photoUrl && (
                                <a
                                  href={inc.photoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-blue-600 underline font-semibold mt-0.5 inline-block"
                                >
                                  [Xem ảnh hiện trường]
                                </a>
                              )}
                            </td>
                            <td className="py-3 px-4 max-w-xs text-slate-700 truncate">
                              {inc.locationAddress}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">{inc.reporterName}</div>
                              <div className="text-slate-500 font-mono text-[11px]">{inc.reporterPhone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  inc.status === 'resolved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : inc.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {inc.statusLabel}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedIncident(inc);
                                  setIncidentNewStatus(inc.status);
                                  setIncidentResponseText(inc.adminResponse || '');
                                }}
                                className="px-2.5 py-1 rounded bg-blue-700 text-white text-[11px] font-bold hover:bg-blue-800"
                              >
                                Cập nhật
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirmModal({
                                    title: 'Xóa phản ánh sự cố dân sinh',
                                    itemName: `${inc.reportCode} - ${inc.title}`,
                                    warningNote: 'Hồ sơ phản ánh sự cố này sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống điều hành.',
                                    onConfirm: async () => {
                                      await deleteIncidentReportApi(inc.id);
                                      showNotification(`Đã xóa phản ánh ${inc.reportCode}`);
                                      onRefresh();
                                    },
                                  });
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Xóa phản ánh"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Update Incident Status */}
              {selectedIncident && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">
                      Xử lý phản ánh {selectedIncident.reportCode}
                    </h4>
                    <p className="text-xs text-slate-600 mb-4">{selectedIncident.title}</p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái giải quyết</label>
                        <select
                          value={incidentNewStatus}
                          onChange={(e) => setIncidentNewStatus(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="received">Đã tiếp nhận</option>
                          <option value="in_progress">Đang xử lý hiện trường</option>
                          <option value="resolved">Đã giải quyết xong</option>
                          <option value="rejected">Không thuộc thẩm quyền / Từ chối</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nội dung phản hồi kết quả cho người dân
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Ví dụ: Đội duy tu đô thị phường đã thay bóng đèn mới và khắc phục sự cố xong lúc 15:30 ngày 10/11..."
                          value={incidentResponseText}
                          onChange={(e) => setIncidentResponseText(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg resize-none"
                        ></textarea>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedIncident(null)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateIncidentStatus}
                          className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold"
                        >
                          Lưu kết quả
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HỎI ĐÁP DÂN CƯ */}
          {activeTab === 'qa' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    QUẢN TRỊ HỎI ĐÁP CỘNG ĐỒNG ({adminData.communityQuestions.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportCommunityQAWord(adminData.communityQuestions)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Xuất báo cáo tình hình hỏi đáp dân cư định dạng Word"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xuất Báo cáo (Word)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportCommunityQACsv(adminData.communityQuestions)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Xuất báo cáo hỏi đáp dân cư ra bảng tính Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Xuất Báo cáo (Excel)</span>
                    </button>
                  </div>
                </div>

                {adminData.communityQuestions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Chưa có câu hỏi nào từ người dân.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {adminData.communityQuestions.map((q) => (
                      <div key={q.id} className="p-4 sm:p-5 hover:bg-slate-50/60">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                                {q.categoryLabel}
                              </span>
                              <span className="text-xs text-slate-400">
                                {formatVietnameseDate(q.createdAt)} – Người gửi: <strong>{q.authorName}</strong> ({q.authorContact || 'Không để lại liên hệ'})
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">{q.title}</h4>
                            <p className="text-xs text-slate-600 mt-1">{q.content}</p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={async () => {
                                await togglePinQuestionApi(q.id);
                                showNotification('Đã thay đổi trạng thái ghim');
                                onRefresh();
                              }}
                              className={`p-1.5 rounded ${q.isPinned ? 'bg-amber-100 text-amber-800' : 'text-slate-400 hover:bg-slate-100'}`}
                              title={q.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                            >
                              📌
                            </button>
                            <button
                              onClick={() => {
                                setSelectedQ(q);
                                setOfficialAnswerText('');
                              }}
                              className="px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold"
                            >
                              Trả lời chính thức
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirmModal({
                                  title: 'Xóa câu hỏi người dân',
                                  itemName: q.title,
                                  warningNote: 'Câu hỏi cùng toàn bộ câu trả lời kèm theo sẽ bị xóa vĩnh viễn khỏi mục đối thoại.',
                                  onConfirm: async () => {
                                    await deleteQuestionApi(q.id);
                                    showNotification(`Đã xóa câu hỏi "${q.title}"`);
                                    onRefresh();
                                  },
                                });
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Xóa câu hỏi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Answers preview */}
                        {q.answers && q.answers.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-blue-400 space-y-2">
                            {q.answers.map((a) => (
                              <div key={a.id} className="text-xs flex items-start justify-between gap-2">
                                <div>
                                  <span className={`font-bold ${a.isOfficial ? 'text-blue-800' : 'text-slate-700'}`}>
                                    {a.authorName}:{' '}
                                  </span>
                                  <span className="text-slate-600">{a.content}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setDeleteConfirmModal({
                                      title: 'Xóa câu trả lời',
                                      itemName: `${a.authorName}: ${a.content.substring(0, 50)}...`,
                                      warningNote: 'Câu trả lời sẽ bị gỡ bỏ vĩnh viễn khỏi câu hỏi này.',
                                      onConfirm: async () => {
                                        await deleteAnswerApi(q.id, a.id);
                                        showNotification('Đã xóa câu trả lời thành công');
                                        onRefresh();
                                      },
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700 p-0.5 shrink-0"
                                  title="Xóa câu trả lời"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Official Answer Modal */}
              {selectedQ && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Phản hồi chính thức từ Ban Điều hành Khu phố 02
                    </h4>
                    <p className="text-xs text-slate-600 mb-3 font-semibold">{selectedQ.title}</p>
                    <textarea
                      rows={4}
                      placeholder="Nhập nội dung giải đáp chính thức từ UBND / Ban Điều hành..."
                      value={officialAnswerText}
                      onChange={(e) => setOfficialAnswerText(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg mb-3"
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedQ(null)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOfficialAnswer}
                        className="px-4 py-1.5 bg-blue-700 text-white text-xs font-bold rounded-lg"
                      >
                        Đăng câu trả lời
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HOẠT ĐỘNG & ĐĂNG KÝ THAM GIA */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              {/* Registered Citizens List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      DANH SÁCH CƯ DÂN ĐĂNG KÝ THAM GIA CÁC CHƯƠNG TRÌNH ({adminData.programRegistrations.length})
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Quy định: Người dân sau khi đăng ký phải được Người quản lý phần mềm "Xác nhận tham gia" thì mới được tham gia. Nếu vẫn hiển thị "Chưa xác nhận" thì không thể tham gia.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportProgramRegistrationsWord(adminData.programRegistrations)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Xuất danh sách người dân đăng ký tham gia định dạng Word"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xuất Danh Sách (Word)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportProgramRegistrationsCsv(adminData.programRegistrations)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Xuất danh sách đăng ký tham gia ra bảng tính Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Xuất Danh Sách (Excel)</span>
                    </button>
                  </div>
                </div>

                {adminData.programRegistrations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Chưa có cư dân đăng ký tham gia chương trình nào.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 font-bold">Chương trình</th>
                          <th className="py-2.5 px-4 font-bold">Họ và tên</th>
                          <th className="py-2.5 px-4 font-bold">Số điện thoại (Bấm gọi)</th>
                          <th className="py-2.5 px-4 font-bold">Địa chỉ / Nơi cư trú</th>
                          <th className="py-2.5 px-4 font-bold">Số lượng</th>
                          <th className="py-2.5 px-4 font-bold">Ghi chú</th>
                          <th className="py-2.5 px-4 font-bold text-center">Trạng thái phê duyệt</th>
                          <th className="py-2.5 px-4 font-bold text-right">Phê duyệt / Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminData.programRegistrations.map((reg) => {
                          const isConfirmed = reg.status === 'confirmed';
                          const isRejected = reg.status === 'rejected';
                          return (
                            <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-4 font-bold text-blue-700">{reg.activityTitle}</td>
                              <td className="py-3 px-4 font-semibold text-slate-900">{reg.fullName}</td>
                              <td className="py-3 px-4 font-mono text-slate-800">
                                <a
                                  href={`tel:${extractPhoneDigits(reg.phoneNumber)}`}
                                  className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-bold hover:underline"
                                  title="Bấm để gọi ngay cho người dân"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600 animate-pulse" />
                                  <span>{reg.phoneNumber}</span>
                                </a>
                              </td>
                              <td className="py-3 px-4 text-slate-600">{reg.neighborhoodGroup}</td>
                              <td className="py-3 px-4 font-bold">{reg.attendeeCount} người</td>
                              <td className="py-3 px-4 text-slate-500 max-w-[150px] truncate">{reg.notes || '—'}</td>
                              <td className="py-3 px-4 text-center">
                                {isConfirmed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Đã xác nhận tham gia</span>
                                  </span>
                                ) : isRejected ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    <X className="w-3 h-3 text-rose-600" />
                                    <span>Từ chối</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Chưa xác nhận (Không thể tham gia)</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  {!isConfirmed ? (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateProgramRegStatus(reg.id, 'confirmed')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                                      title="Xác nhận người dân được phép tham gia hoạt động"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Xác nhận tham gia</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateProgramRegStatus(reg.id, 'pending')}
                                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-semibold inline-flex items-center gap-1 transition-all"
                                      title="Đặt lại trạng thái Chưa xác nhận"
                                    >
                                      <span>Chưa xác nhận</span>
                                    </button>
                                  )}

                                  {!isRejected && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateProgramRegStatus(reg.id, 'rejected')}
                                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-all"
                                      title="Từ chối tham gia"
                                    >
                                      <span>Từ chối</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteConfirmModal({
                                        title: 'Xóa đăng ký tham gia chương trình',
                                        itemName: `${reg.fullName} (${reg.activityTitle})`,
                                        warningNote: 'Đơn đăng ký của người dân sẽ bị gỡ bỏ vĩnh viễn khỏi danh sách hoạt động này.',
                                        onConfirm: async () => {
                                          await deleteProgramRegistrationApi(reg.id);
                                          showNotification(`Đã xóa đơn đăng ký của "${reg.fullName}"`);
                                          onRefresh();
                                        },
                                      });
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Xóa đơn"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Activities CRUD */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      <span>{editingActivity ? 'CHỈNH SỬA HOẠT ĐỘNG' : 'THÊM HOẠT ĐỘNG KHU PHỐ MỚI'}</span>
                    </h3>
                    <p className="text-[11px] text-blue-800 font-semibold mt-0.5">
                      📌 Hoạt động và sự kiện luôn luôn được ghim trên trang chủ. Chỉ khi nào Quản trị viên chủ động bấm gỡ thì mới được xóa.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    try {
                      await saveActivityApi({
                        ...(editingActivity ? { id: editingActivity.id } : {}),
                        ...actForm,
                        dateTimestamp: Date.now(),
                      });
                      showNotification(editingActivity ? 'Cập nhật hoạt động thành công' : 'Thêm hoạt động thành công');
                      setEditingActivity(null);
                      setActForm({
                        title: '',
                        category: 'community',
                        categoryLabel: 'Sinh hoạt cộng đồng',
                        time: '',
                        location: '',
                        organizer: 'Ban Điều hành Khu phố 02',
                        summary: '',
                        content: '',
                        imageUrl: '',
                        logoUrl: '',
                        status: 'upcoming',
                        statusLabel: 'Sắp diễn ra',
                      });
                      onRefresh();
                    } catch (err: any) {
                      showNotification(err.message, true);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tên hoạt động *</label>
                      <input
                        type="text"
                        required
                        placeholder="Tên sự kiện / phong trào..."
                        value={actForm.title}
                        onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
                      <select
                        value={actForm.status}
                        onChange={(e) => {
                          const s = e.target.value as any;
                          const labels: Record<string, string> = {
                            ongoing: 'Đang triển khai',
                            upcoming: 'Sắp diễn ra',
                            completed: 'Đã hoàn thành',
                          };
                          setActForm({ ...actForm, status: s, statusLabel: labels[s] });
                        }}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="ongoing">Đang triển khai</option>
                        <option value="completed">Đã hoàn thành</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian diễn ra *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: 08:00 - 11:30, Ngày 20/11/2026"
                        value={actForm.time}
                        onChange={(e) => setActForm({ ...actForm, time: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Địa điểm *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nhà Văn hóa Khu phố 02"
                        value={actForm.location}
                        onChange={(e) => setActForm({ ...actForm, location: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tóm tắt ngắn gọn *</label>
                    <textarea
                      rows={2}
                      required
                      value={actForm.summary}
                      onChange={(e) => setActForm({ ...actForm, summary: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg resize-none"
                    ></textarea>
                  </div>

                  {/* 1. KHU VỰC TẢI LÊN ẢNH BÌA / HÌNH ẢNH HOẠT ĐỘNG (NHƯ ẢNH BÀI VIẾT FACEBOOK) */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Image className="w-4 h-4 text-blue-700" />
                        <span>Ảnh bìa / Hình ảnh hoạt động (Hiển thị nổi bật ngoài thẻ như Facebook)</span>
                      </label>
                      <span className="text-[11px] text-blue-700 font-medium">Khuyên dùng ảnh chụp ngang tỉ lệ 16:9</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-start gap-4">
                      {/* Banner Preview */}
                      <div className="w-full md:w-64 h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-xs shrink-0 flex items-center justify-center relative group">
                        {actForm.imageUrl ? (
                          <>
                            <img src={actForm.imageUrl} alt="Ảnh bìa hoạt động" className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                              Ảnh bìa Facebook
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-3 text-slate-400">
                            <Calendar className="w-8 h-8 mx-auto mb-1 opacity-50 text-cyan-300" />
                            <span className="text-[10px] font-medium block text-slate-300">Chưa có ảnh bìa</span>
                            <span className="text-[9px] text-slate-400 block">(Bấm tải lên để thêm ảnh minh họa thực tế)</span>
                          </div>
                        )}
                      </div>

                      {/* Upload and controls */}
                      <div className="flex-1 space-y-2">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Tải lên ảnh chụp thực tế hoặc poster của hoạt động từ máy tính. Người dân khi lướt web sẽ nhìn thấy ngay hình ảnh này ở bên ngoài thẻ hoạt động tương tự ảnh bìa trên mạng xã hội Facebook.
                        </p>

                        <div className="flex items-center gap-3 flex-wrap pt-1">
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer shadow-sm transition-all active:scale-95">
                            <Upload className="w-4 h-4" />
                            <span>{uploadingActImage ? 'Đang tải lên...' : 'Tải lên ảnh bìa sự kiện (Từ máy tính)'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleActivityImageUpload}
                              disabled={uploadingActImage}
                            />
                          </label>

                          {actForm.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setActForm((prev) => ({ ...prev, imageUrl: '' }));
                                showNotification('Đã gỡ ảnh bìa hoạt động');
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa ảnh bìa này</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. KHU VỰC TẢI LÊN LOGO / BIỂU TRƯNG SỰ KIỆN (TÙY CHỌN) */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Logo / Biểu trưng sự kiện (Tùy chọn - gắn góc thẻ)</span>
                      </label>
                      <span className="text-[11px] text-slate-500">Dành cho logo đoàn thể, phong trào nếu có</span>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-300 shadow-2xs shrink-0 flex items-center justify-center p-1">
                        {actForm.logoUrl ? (
                          <img src={actForm.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-slate-400 text-center">Không logo</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 text-blue-700" />
                          <span>{uploadingActLogo ? 'Đang tải...' : 'Tải lên logo sự kiện (nếu có)'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleActivityLogoUpload}
                            disabled={uploadingActLogo}
                          />
                        </label>

                        {actForm.logoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setActForm((prev) => ({ ...prev, logoUrl: '' }));
                              showNotification('Đã gỡ logo');
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                          >
                            Xóa logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {editingActivity && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingActivity(null);
                          setActForm({
                            title: '',
                            category: 'community',
                            categoryLabel: 'Sinh hoạt cộng đồng',
                            time: '',
                            location: '',
                            organizer: 'Ban Điều hành Khu phố 02',
                            summary: '',
                            content: '',
                            imageUrl: '',
                            logoUrl: '',
                            status: 'upcoming',
                            statusLabel: 'Sắp diễn ra',
                          });
                        }}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Hủy
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      {editingActivity ? 'Lưu hoạt động' : 'Tạo hoạt động'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Activities Pinned List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      DANH SÁCH HOẠT ĐỘNG & SỰ KIỆN ĐANG GHIM ({adminData.activities.length})
                    </span>
                    <span className="ml-2 text-[11px] text-blue-700 font-semibold">
                      📌 Luôn ghim trên trang chủ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportActivitiesWord(adminData.activities)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Xuất danh mục hoạt động sự kiện định dạng Word"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xuất Danh Mục (Word)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportActivitiesCsv(adminData.activities)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Xuất danh mục hoạt động sự kiện ra bảng tính Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Xuất Danh Mục (Excel)</span>
                    </button>
                  </div>
                </div>

                {adminData.activities.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Chưa có hoạt động nào được ghim.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {adminData.activities.map((act) => (
                      <div key={act.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          {act.imageUrl ? (
                            <img src={act.imageUrl} alt="" className="w-16 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs" />
                          ) : (
                            <div className="w-16 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                              Chưa có ảnh
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{act.title}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {act.statusLabel}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                📌 Đang ghim
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {act.time} — {act.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingActivity(act);
                              setActForm({
                                title: act.title,
                                category: act.category,
                                categoryLabel: act.categoryLabel,
                                time: act.time,
                                location: act.location,
                                organizer: act.organizer,
                                summary: act.summary,
                                content: act.content || '',
                                imageUrl: act.imageUrl || '',
                                logoUrl: act.logoUrl || '',
                                status: act.status,
                                statusLabel: act.statusLabel,
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirmModal({
                                title: 'Xóa hoạt động / sự kiện',
                                itemName: act.title,
                                warningNote: 'Hoạt động này và toàn bộ danh sách đăng ký tham gia liên quan sẽ bị xóa vĩnh viễn.',
                                onConfirm: async () => {
                                  await deleteActivityApi(act.id);
                                  showNotification(`Đã xóa hoạt động "${act.title}"`);
                                  onRefresh();
                                },
                              });
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Gỡ và xóa hoạt động"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CHỈ SỐ DÂN CƯ */}
          {activeTab === 'demographics' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs max-w-3xl">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700" />
                CẬP NHẬT CHỈ SỐ DÂN CƯ & PHÁT TRIỂN SỐ KHU PHỐ 02
              </h3>

              <form onSubmit={handleSaveDemographics} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tổng số cư dân (người)</label>
                    <input
                      type="number"
                      value={demoForm.totalResidents}
                      onChange={(e) => setDemoForm({ ...demoForm, totalResidents: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tổng số hộ dân (hộ)</label>
                    <input
                      type="number"
                      value={demoForm.totalHouseholds}
                      onChange={(e) => setDemoForm({ ...demoForm, totalHouseholds: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tỷ lệ định danh VNeID Mức 2 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={demoForm.vneidLevel2Rate}
                      onChange={(e) => setDemoForm({ ...demoForm, vneidLevel2Rate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tỷ lệ Gia đình Văn hóa (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={demoForm.culturalFamiliesRate}
                      onChange={(e) => setDemoForm({ ...demoForm, culturalFamiliesRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold"
                  >
                    Lưu các chỉ số
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: HỒ SƠ ĐĂNG KÝ ĐOÀN THỂ */}
          {activeTab === 'orgRegistrations' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-red-600" />
                      DANH SÁCH CƯ DÂN ĐĂNG KÝ THAM GIA ĐOÀN THỂ ({adminData.organizationRegistrations?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tiếp nhận trực tiếp từ bảng đăng ký trực tuyến nội bộ trên hệ thống (đã xác nhận cam kết tự nguyện).
                    </p>
                  </div>
                </div>

                {(!adminData.organizationRegistrations || adminData.organizationRegistrations.length === 0) ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Chưa có cư dân nào đăng ký tham gia đoàn thể.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                          <th className="py-3 px-4">Họ và tên &amp; Liên hệ</th>
                          <th className="py-3 px-4">Đoàn thể đăng ký</th>
                          <th className="py-3 px-4">Tổ / Địa chỉ</th>
                          <th className="py-3 px-4">Ngày sinh &amp; Ghi chú</th>
                          <th className="py-3 px-4">Cam kết</th>
                          <th className="py-3 px-4">Trạng thái xử lý</th>
                          <th className="py-3 px-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminData.organizationRegistrations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{reg.fullName}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <a
                                  href={`tel:${extractPhoneDigits(reg.phoneNumber)}`}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-bold hover:bg-blue-100"
                                  title="Bấm gọi liền"
                                >
                                  <Phone className="w-3 h-3 animate-pulse" />
                                  <span>{reg.phoneNumber}</span>
                                </a>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{formatVietnameseDate(reg.createdAt)}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-bold border border-red-200 inline-block text-[11px]">
                                {reg.organizationName}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              {reg.neighborhoodGroup && (
                                <div className="font-semibold text-slate-800">{reg.neighborhoodGroup}</div>
                              )}
                              <div className="text-[11px] text-slate-500">{reg.address || 'Khu phố 02'}</div>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              {reg.birthDate && (
                                <div className="text-slate-600">Sinh: {formatVietnameseDate(reg.birthDate)}</div>
                              )}
                              {reg.notes && (
                                <div className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-2">"{reg.notes}"</div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {reg.hasConfirmedAgreement ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Đã xác nhận
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Chưa tích</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={reg.status}
                                onChange={(e) => handleUpdateOrgRegistrationStatus(reg.id, e.target.value)}
                                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                              >
                                <option value="pending">Chờ xét duyệt</option>
                                <option value="contacted">Đã liên hệ</option>
                                <option value="accepted">Đã kết nạp/tiếp nhận</option>
                                <option value="rejected">Chưa phù hợp</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteOrgRegistration(reg.id, reg.fullName)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                title="Xóa đơn đăng ký"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: THÔNG TIN ĐOÀN THỂ */}
          {activeTab === 'organizations' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      DANH SÁCH ĐOÀN THỂ &amp; HỘI CHÍNH TRỊ - XÃ HỘI KHU PHỐ 02
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Người dân đăng ký trực tiếp qua bảng đăng ký nội bộ (không sử dụng form ngoài). Hồ sơ được lưu vào tab "Đăng ký Đoàn thể".
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminData.organizations.map((org) => (
                    <div key={org.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                            {org.logo ? (
                              <img src={org.logo} alt={org.shortName} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium text-center">Chưa có logo</span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">{org.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold inline-block mt-0.5">
                              {org.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">{org.description}</p>

                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] text-slate-600 font-medium">
                          Logo đoàn thể: {org.logo ? <span className="text-emerald-700 font-bold">Đã có logo</span> : <span className="text-amber-700 font-medium">Chưa tải lên</span>}
                        </span>

                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs">
                            <Upload className="w-3 h-3 text-blue-600" />
                            <span>{uploadingOrgLogoId === org.id ? 'Đang tải...' : 'Tải lên logo tệp ảnh'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleOrgLogoUpload(org, e)}
                              disabled={uploadingOrgLogoId === org.id}
                            />
                          </label>

                          {org.logo && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOrgLogo(org)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Gỡ logo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                        <span>Trạng thái: <strong>{org.statusLabel}</strong></span>
                        <span>Đối tượng: {org.eligibility}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: THƯ VIỆN TIỆN ÍCH SỐ (FULL CRUD & AVATAR PHẦN MỀM) */}
          {activeTab === 'utilities' && (
            <div className="space-y-6">
              {/* Form Thêm mới / Chỉnh sửa Tiện ích số */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-700" />
                    <span>{editingUtility ? `CHỈNH SỬA TIỆN ÍCH: ${editingUtility.name}` : 'THÊM MỚI TIỆN ÍCH SỐ KHU PHỐ'}</span>
                  </h3>
                  {editingUtility && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUtility(null);
                        setUtilForm({
                          name: '',
                          category: 'admin',
                          categoryName: 'Hành chính công & Định danh',
                          shortDesc: '',
                          badge: 'Chính phủ',
                          icon: 'ShieldCheck',
                          imageUrl: '',
                          websiteUrl: '',
                          androidUrl: '',
                          iosUrl: '',
                          videoGuideUrl: '',
                          videoGuideName: '',
                          wordGuideUrl: '',
                          wordGuideName: '',
                          pptGuideUrl: '',
                          pptGuideName: '',
                          pdfGuideUrl: '',
                          pdfGuideName: '',
                          displayOrder: adminData.digitalUtilities.length + 1,
                          isPinned: false,
                          isVisible: true,
                        });
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Hủy chỉnh sửa, thêm mới
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveUtility} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên tiện ích / Phần mềm ứng dụng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: VNeID, VssID, Sawaco..."
                        value={utilForm.name}
                        onChange={(e) => setUtilForm({ ...utilForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nhóm phân loại
                      </label>
                      <select
                        value={utilForm.category}
                        onChange={(e) => {
                          const cat = e.target.value as DigitalUtility['category'];
                          const catNames = {
                            admin: 'Hành chính công & Định danh',
                            welfare: 'An sinh & Y tế số',
                            security: 'An ninh & PCCC 114',
                            living: 'Đời sống & Dịch vụ thiết yếu',
                          };
                          setUtilForm({
                            ...utilForm,
                            category: cat,
                            categoryName: catNames[cat],
                          });
                        }}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                      >
                        <option value="admin">Hành chính công &amp; Định danh</option>
                        <option value="welfare">An sinh &amp; Y tế số</option>
                        <option value="security">An ninh &amp; PCCC 114</option>
                        <option value="living">Đời sống &amp; Dịch vụ thiết yếu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Đơn vị chủ quản / Huy hiệu
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Bộ Công an, UBND TP.HCM, BHXH Việt Nam..."
                        value={utilForm.badge}
                        onChange={(e) => setUtilForm({ ...utilForm, badge: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Thứ tự hiển thị
                      </label>
                      <input
                        type="number"
                        value={utilForm.displayOrder}
                        onChange={(e) => setUtilForm({ ...utilForm, displayOrder: parseInt(e.target.value, 10) || 1 })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mô tả ngắn gọn chức năng cho người dân <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Mô tả chức năng chính người dân có thể thực hiện..."
                      value={utilForm.shortDesc}
                      onChange={(e) => setUtilForm({ ...utilForm, shortDesc: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white resize-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <input
                      type="checkbox"
                      id="utilIsPinned"
                      checked={Boolean(utilForm.isPinned)}
                      onChange={(e) => setUtilForm({ ...utilForm, isPinned: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="utilIsPinned" className="text-xs font-bold text-amber-900 cursor-pointer">
                      📌 Ghim lên trang chủ (Ưu tiên hiển thị 2 – 4 mục quan trọng ngoài trang chủ, các mục khác sổ ra xem thêm)
                    </label>
                  </div>

                  {/* KHU VỰC CÀI ĐẶT LOGO TIỆN ÍCH SỐ - CHỈ TẢI LÊN TỆP ẢNH TỪ MÁY */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Image className="w-4 h-4 text-blue-700" />
                        <span>Logo đại diện của tiện ích số (Tải lên tệp ảnh từ máy tính)</span>
                      </label>
                      <span className="text-[11px] text-blue-700 font-medium">Chỉ tải lên tệp ảnh (không dùng link)</span>
                    </div>

                    <div className="flex items-start gap-4 flex-wrap">
                      {/* Logo Preview */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-300 shadow-xs shrink-0 flex items-center justify-center p-2">
                        {utilForm.imageUrl ? (
                          <img
                            src={utilForm.imageUrl}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-1">
                            <span className="text-[10px] text-slate-400 font-medium block leading-tight">Chưa có logo</span>
                            <span className="text-[9px] text-slate-400">(Trang chủ sẽ không hiện logo)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2.5">
                        <p className="text-xs text-slate-600">
                          Logo tiện ích số (VNeID, DVC Quốc gia, EVNHCMC, Sawaco...) do Quản lý phần mềm tải trực tiếp từ máy lên hệ thống. Nếu chưa tải lên thì trang chủ sẽ không hiển thị biểu tượng thay thế.
                        </p>

                        <div className="flex items-center gap-3 flex-wrap">
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer shadow-sm transition-all active:scale-95">
                            <Upload className="w-4 h-4" />
                            <span>{uploadingAvatar ? 'Đang tải lên...' : 'Tải lên tệp ảnh logo (PNG, JPG, SVG, WebP)'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarUpload}
                              disabled={uploadingAvatar}
                            />
                          </label>

                          {utilForm.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setUtilForm((prev) => ({ ...prev, imageUrl: '' }));
                                showNotification('Đã gỡ logo tiện ích');
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa logo này</span>
                            </button>
                          )}
                        </div>

                        {utilForm.imageUrl && (
                          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã nạp logo thành công. Nhấn <strong>"Lưu cập nhật tiện ích"</strong> bên dưới để lưu vào hệ thống.</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Links: Web, Android, iOS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn Website</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={utilForm.websiteUrl}
                        onChange={(e) => setUtilForm({ ...utilForm, websiteUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Link tải Android (CH Play)</label>
                      <input
                        type="url"
                        placeholder="https://play.google.com/..."
                        value={utilForm.androidUrl}
                        onChange={(e) => setUtilForm({ ...utilForm, androidUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Link tải iOS (App Store)</label>
                      <input
                        type="url"
                        placeholder="https://apps.apple.com/..."
                        value={utilForm.iosUrl}
                        onChange={(e) => setUtilForm({ ...utilForm, iosUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  {/* TÀI LIỆU & VIDEO HƯỚNG DẪN DÂN CƯ SỬ DỤNG - DOCUMENT UPLOADER */}
                  <DocumentUploader
                    utilityName={utilForm.name || 'Tiện ích số đang biên tập'}
                    resources={{
                      videoGuideUrl: utilForm.videoGuideUrl,
                      videoGuideName: utilForm.videoGuideName,
                      wordGuideUrl: utilForm.wordGuideUrl,
                      wordGuideName: utilForm.wordGuideName,
                      pptGuideUrl: utilForm.pptGuideUrl,
                      pptGuideName: utilForm.pptGuideName,
                      pdfGuideUrl: utilForm.pdfGuideUrl,
                      pdfGuideName: utilForm.pdfGuideName,
                    }}
                    onChange={(updated) => {
                      setUtilForm((prev) => ({
                        ...prev,
                        ...updated,
                      }));
                    }}
                    onNotify={(msg, isError) => showNotification(msg, isError)}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      {editingUtility ? 'Lưu cập nhật tiện ích' : 'Thêm tiện ích số'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Danh sách các tiện ích số hiện có */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                  <span>DANH SÁCH TIỆN ÍCH SỐ ĐANG VẬN HÀNH ({adminData.digitalUtilities.length})</span>
                  <span className="text-xs text-slate-500 font-normal">Bấm "Chỉnh sửa" để đổi avatar, tên hoặc liên kết</span>
                </h3>

                <div className="space-y-3">
                  {adminData.digitalUtilities.map((u) => (
                    <div
                      key={u.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Logo Preview */}
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                          {u.imageUrl ? (
                            <img
                              src={u.imageUrl}
                              alt={u.name}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <span className="text-[9px] text-slate-400 font-medium text-center">Chưa có logo</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">{u.name}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200 shrink-0">
                              {u.badge}
                            </span>
                            {u.isPinned && (
                              <span className="text-[9px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 font-extrabold shrink-0 border border-amber-300">
                                📌 Ghim trang chủ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{u.shortDesc}</div>
                          <div className="text-[10px] text-blue-600 font-mono truncate mt-0.5">{u.websiteUrl}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUtility(u);
                            setUtilForm({
                              name: u.name,
                              category: u.category,
                              categoryName: u.categoryName,
                              shortDesc: u.shortDesc,
                              badge: u.badge,
                              icon: u.icon || 'ShieldCheck',
                              imageUrl: u.imageUrl || '',
                              websiteUrl: u.websiteUrl || '',
                              androidUrl: u.androidUrl || '',
                              iosUrl: u.iosUrl || '',
                              videoGuideUrl: u.videoGuideUrl || '',
                              videoGuideName: u.videoGuideName || '',
                              wordGuideUrl: u.wordGuideUrl || '',
                              wordGuideName: u.wordGuideName || '',
                              pptGuideUrl: u.pptGuideUrl || '',
                              pptGuideName: u.pptGuideName || '',
                              pdfGuideUrl: u.pdfGuideUrl || '',
                              pdfGuideName: u.pdfGuideName || '',
                              displayOrder: u.displayOrder || 1,
                              isPinned: Boolean(u.isPinned),
                              isVisible: u.isVisible !== false,
                            });
                            // Scroll to top of panel
                            const panel = document.querySelector('.flex-1.overflow-y-auto');
                            if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUtility(u.id, u.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Xóa tiện ích"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8B: QUẢN LÝ TÀI NGUYÊN TIỆN ÍCH DÂN CƯ (DOCUMENT UPLOADER) */}
          {activeTab === 'utilityResources' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                      <FolderOpen className="w-3 h-3 text-indigo-700" />
                      <span>TRUNG TÂM QUẢN TRỊ TÀI NGUYÊN & HƯỚNG DẪN TIỆN ÍCH DÂN CƯ</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      TẢI LÊN &amp; QUẢN LÝ TÀI NGUYÊN SỐ (MP4, DOCX, PPTX, PDF)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Hỗ trợ Ban Điều hành tải lên các tệp video clip hướng dẫn thực tế (.mp4), biểu mẫu và hướng dẫn văn bản (.docx), slide trình chiếu tập huấn (.pptx) và sổ tay cẩm nang (.pdf) cho toàn bộ thư viện tiện ích phục vụ nhân dân Khu phố 02.
                    </p>
                  </div>
                </div>
              </div>

              <DocumentUploader
                digitalUtilities={adminData.digitalUtilities}
                utilityName="Kho tài nguyên số Khu phố 02"
                resources={quickManageResources}
                onChange={setQuickManageResources}
                onSaveDirectly={async (utilId, updated) => {
                  const targetUtil = adminData.digitalUtilities.find((u) => u.id === utilId);
                  if (!targetUtil) return;
                  await saveUtilityApi({
                    ...targetUtil,
                    ...updated,
                  });
                  showNotification(`Đã lưu thành công bộ tài nguyên cho tiện ích "${targetUtil.name}"!`);
                  onRefresh();
                }}
                onNotify={(msg, isError) => showNotification(msg, isError)}
              />
            </div>
          )}

          {/* TAB 9: BẢO MẬT & SAO LƯU */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-3xl">
              {/* Password Change */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-700" />
                  ĐỔI MẬT KHẨU QUẢN TRỊ VIÊN
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      required
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới (ít nhất 8 ký tự)</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg">
                      Xác nhận đổi mật khẩu
                    </button>
                  </div>
                </form>
              </div>

              {/* Backup & Restore */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-700" />
                      <span>SAO LƯU, PHỤC HỒI & ĐỒNG BỘ GITHUB / VERCEL</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Dữ liệu được lưu trữ trực tiếp vào bộ nhớ máy tính này, không bị mất khi đóng trình duyệt. Bạn có thể xuất file để đưa lên GitHub cho toàn bộ người dân xem qua Vercel.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-xs text-emerald-900 mb-1 flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-emerald-700" />
                        <span>Xuất tệp database.json</span>
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        Tải toàn bộ dữ liệu bạn vừa chỉnh sửa (cán bộ, thông tin, tiện ích, đoàn thể...) về máy dạng file chuẩn.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const db = getLocalDatabase();
                        const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'database.json';
                        a.click();
                        URL.revokeObjectURL(url);
                        alert('Đã xuất file database.json thành công về máy tính của bạn!');
                      }}
                      className="mt-3 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về file database.json</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-xs text-blue-900 mb-1 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-blue-700" />
                        <span>Phục hồi / Nạp tệp database.json</span>
                      </div>
                      <p className="text-[11px] text-blue-700">
                        Nạp dữ liệu từ một file JSON đã lưu trữ trước đó vào hệ thống trên máy này.
                      </p>
                    </div>
                    <label className="mt-3 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn file JSON để nạp</span>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const content = event.target?.result as string;
                              const parsed = JSON.parse(content);
                              if (parsed && parsed.communityInfo) {
                                saveLocalDatabase(parsed);
                                alert('Đã nạp dữ liệu thành công! Trang web sẽ tự động làm mới để hiển thị.');
                                window.location.reload();
                              } else {
                                alert('Tệp JSON không đúng cấu trúc dữ liệu của Khu phố 02.');
                              }
                            } catch {
                              alert('Lỗi đọc tệp JSON. Vui lòng kiểm tra lại định dạng file.');
                            }
                          };
                          reader.readAsText(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* GitHub & Vercel Sync Instructions */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>💡 Hướng dẫn đưa dữ liệu mới nhất lên GitHub và Vercel:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                    <li>Sau khi bạn dùng Trang Điều Hành chỉnh sửa xong, bấm nút <strong>"Tải về file database.json"</strong> ở trên.</li>
                    <li>Chép file <code>database.json</code> vừa tải về đè vào 2 vị trí: <code>data/database.json</code> và <code>public/data/database.json</code> trong thư mục mã nguồn.</li>
                    <li>Đẩy (push) mã nguồn lên GitHub. Vercel sẽ tự động cập nhật và bất kỳ ai vào link Vercel cũng thấy trang chủ mới nhất!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Universal In-App Confirmation Modal for All Deletions */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-red-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-red-50 border-b border-red-100 p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-red-950">
                  {deleteConfirmModal.title}
                </h3>
                <p className="text-xs text-red-700 mt-0.5">
                  Xác nhận thao tác điều hành nội bộ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-700">
              <p className="leading-relaxed">
                Bạn có chắc chắn muốn xóa mục:{' '}
                <strong className="text-slate-900 block font-bold mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-words">
                  {deleteConfirmModal.itemName}
                </strong>
              </p>
              {deleteConfirmModal.warningNote && (
                <p className="text-rose-700 bg-rose-50/80 p-2.5 rounded-lg border border-rose-200 leading-normal">
                  ⚠️ {deleteConfirmModal.warningNote} Thao tác sẽ lưu trực tiếp vào cơ sở dữ liệu và không thể hoàn tác.
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa ngay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
