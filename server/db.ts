import fs from 'fs';
import path from 'path';
import {
  AppDatabase,
  Activity,
  DigitalUtility,
  Organization,
  OrganizationRegistration,
  Announcement,
  ResidentDocument,
  AuditLog,
  Demographics,
  CommunityInfo,
  CommitteeMember,
  OfficialDocument,
  ProgramRegistration,
  IncidentReport,
  CommunityQuestion,
} from '../src/types';
import { hashAdminPassword, isDocumentExpired } from '../src/utils/rules';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');
const PUBLIC_DATA_DIR = path.resolve(process.cwd(), 'public', 'data');
const PUBLIC_DB_FILE = path.join(PUBLIC_DATA_DIR, 'database.json');

const ADMIN_SALT = 'kp2_tan_hung_secure_salt_2025';
// Tài khoản: kp2.tanhung.hcm | Mật khẩu: Kp2#TanHung
const ADMIN_HASH = hashAdminPassword('Kp2#TanHung', ADMIN_SALT);

const initialDatabase: AppDatabase = {
  communityInfo: {
    id: 'comm-kp2',
    name: 'Khu phố 02',
    ward: 'Phường Tân Hưng',
    city: 'Thành phố Hồ Chí Minh',
    bannerTitle: 'CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH QUYỀN SỐ CƠ SỞ',
    address: '465/1/2 Trần Xuân Soạn, Khu phố 2, Phường Tân Hưng, TP. Hồ Chí Minh',
    coordinates: '10.751307, 106.707736',
    googleMapsPinUrl: 'https://maps.app.goo.gl/ogk6mH2ve5uYgDaY8',
    hotline: '028 3775 1234',
    policePhone: '028 3771 5678 (Công an Phường Tân Hưng)',
    healthClinicPhone: '028 3771 2468 (Trạm Y tế Phường Tân Hưng)',
    leaderName: '',
    leaderPhone: '',
    deputyName: '',
    deputyPhone: '',
    email: 'khupho02.phuongtanhung@tphcm.gov.vn',
    workingHours: 'Thứ Hai - Thứ Bảy: 07:30 - 17:00 | Trực ban dân cư 24/7',
    updatedAt: new Date().toISOString(),
  },
  demographics: {
    totalResidents: 0,
    totalHouseholds: 0,
    totalNeighborhoodGroups: 0,
    vneidLevel2Rate: 0,
    onlinePublicServiceRate: 0,
    cashlessPaymentRate: 0,
    culturalFamiliesRate: 0,
    elderlyCount: 0,
    childrenCount: 0,
    updatedAt: new Date().toISOString(),
  },
  committeeMembers: [],
  officialDocuments: [],
  programRegistrations: [],
  organizationRegistrations: [],
  incidentReports: [],
  communityQuestions: [],
  activities: [],
  digitalUtilities: [
    {
      id: 'util-vneid',
      name: 'VNeID - Định danh điện tử quốc gia',
      category: 'admin',
      categoryName: 'Hành chính công & Định danh',
      shortDesc: 'Ứng dụng định danh điện tử của Bộ Công an thay thế CCCD gắn chip, tích hợp giấy phép lái xe, thẻ BHYT và xác thực dịch vụ công.',
      badge: 'Bộ Công an',
      icon: 'ShieldCheck',
      imageUrl: '',
      websiteUrl: 'https://dichvucong.dancuquocgia.gov.vn',
      androidUrl: 'https://play.google.com/store/apps/details?id=com.vnid',
      iosUrl: 'https://apps.apple.com/vn/app/vneid/id1582750372',
      videoGuideUrl: '',
      videoGuideTitle: '',
      pdfGuideUrl: '',
      pdfGuideName: '',
      wordGuideUrl: '',
      wordGuideName: '',
      displayOrder: 1,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'util-dvc-national',
      name: 'Cổng Dịch vụ công Quốc gia',
      category: 'admin',
      categoryName: 'Hành chính công & Định danh',
      shortDesc: 'Cổng đầu mối quốc gia hỗ trợ nộp hồ sơ trực tuyến, thanh toán nghĩa vụ tài chính đất đai, đóng phạt vi phạm giao thông.',
      badge: 'Chính phủ',
      icon: 'Building2',
      imageUrl: '',
      websiteUrl: 'https://dichvucong.gov.vn',
      androidUrl: 'https://play.google.com/store/apps/details?id=vn.gov.dichvucong',
      iosUrl: 'https://apps.apple.com/vn/app/c%E1%BB%95ng-d%E1%BB%8Bch-v%E1%BB%A5-c%C3%B4ng-qu%E1%BB%91c-gia/id1489679633',
      videoGuideUrl: '',
      videoGuideTitle: '',
      pdfGuideUrl: '',
      pdfGuideName: '',
      wordGuideUrl: '',
      wordGuideName: '',
      displayOrder: 2,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'util-dvc-hcm',
      name: 'Hệ thống Thông tin Giải quyết TTHC TP.HCM',
      category: 'admin',
      categoryName: 'Hành chính công & Định danh',
      shortDesc: 'Nộp hồ sơ trực tuyến cấp phường Tân Hưng, tra cứu tiến độ xử lý hồ sơ khai sinh, đăng ký kết hôn, chứng thực bản sao.',
      badge: 'UBND TP.HCM',
      icon: 'Landmark',
      imageUrl: '',
      websiteUrl: 'https://dichvucong.hochiminhcity.gov.vn',
      androidUrl: '',
      iosUrl: '',
      videoGuideUrl: '',
      videoGuideTitle: '',
      pdfGuideUrl: '',
      pdfGuideName: '',
      wordGuideUrl: '',
      wordGuideName: '',
      displayOrder: 3,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'util-vssid',
      name: 'VssID - Bảo hiểm Xã hội số',
      category: 'welfare',
      categoryName: 'An sinh & Y tế',
      shortDesc: 'Thẻ BHYT điện tử dùng khám chữa bệnh tại các bệnh viện, theo dõi quá trình tham gia BHXH, BHTN, chế độ thai sản, ốm đau.',
      badge: 'BHXH Việt Nam',
      icon: 'HeartHandshake',
      imageUrl: '',
      websiteUrl: 'https://baohiemxahoi.gov.vn',
      androidUrl: 'https://play.google.com/store/apps/details?id=com.bhxhapp',
      iosUrl: 'https://apps.apple.com/vn/app/vssid/id1536353244',
      videoGuideUrl: '',
      videoGuideTitle: '',
      pdfGuideUrl: '',
      pdfGuideName: '',
      wordGuideUrl: '',
      wordGuideName: '',
      displayOrder: 4,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'util-1022',
      name: 'Cổng Thông tin Tiếp nhận & Phản ánh 1022 TP.HCM',
      category: 'living',
      categoryName: 'Đời sống & Phản ánh',
      shortDesc: 'Người dân gửi phản ánh tức thì về sự cố hạ tầng, rác thải, ngập nước, đèn chiếu sáng, trật tự lòng lề đường tới chính quyền.',
      badge: 'Tổng đài 1022',
      icon: 'Megaphone',
      imageUrl: '',
      websiteUrl: 'https://1022.tphcm.gov.vn',
      androidUrl: 'https://play.google.com/store/apps/details?id=vn.gov.tphcm.tongdai1022',
      iosUrl: 'https://apps.apple.com/vn/app/t%E1%BB%95ng-%C4%91%C3%A0i-1022-tp-hcm/id1453995897',
      videoGuideUrl: '',
      videoGuideTitle: '',
      pdfGuideUrl: '',
      pdfGuideName: '',
      wordGuideUrl: '',
      wordGuideName: '',
      displayOrder: 5,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'util-help114',
      name: 'Help 114 - Báo cháy và Cứu nạn Cứu hộ TP.HCM',
      category: 'security',
      categoryName: 'An ninh & PCCC',
      shortDesc: 'Báo cháy và gọi cứu nạn khẩn cấp bằng video call trực tiếp với trung tâm chỉ huy 114, tự động truyền tọa độ GPS chuẩn xác.',
      badge: 'Cảnh sát PCCC',
      icon: 'Flame',
      imageUrl: '',
      websiteUrl: 'https://pccc.hochiminhcity.gov.vn',
      androidUrl: 'https://play.google.com/store/apps/details?id=com.help114.pccc',
      iosUrl: 'https://apps.apple.com/vn/app/help-114/id1438706316',
      videoGuideUrl: '',
      videoGuideTitle: '',
      pdfGuideUrl: '',
      pdfGuideName: '',
      wordGuideUrl: '',
      wordGuideName: '',
      displayOrder: 6,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'util-evn',
      name: 'CSKH EVNHCMC - Điện lực TP.HCM',
      category: 'living',
      categoryName: 'Đời sống & Dịch vụ thiết yếu',
      shortDesc: 'Theo dõi chỉ số điện hàng ngày, tra cứu hóa đơn, lịch bảo trì lưới điện và thanh toán trực tuyến không dùng tiền mặt.',
      badge: 'Điện lực EVNHCMC',
      icon: 'Zap',
      imageUrl: '',
      websiteUrl: 'https://cskh.evnhcmc.vn',
      androidUrl: 'https://play.google.com/store/apps/details?id=evnhcmc.cskh.cskheevnhcmc',
      iosUrl: 'https://apps.apple.com/vn/app/evnhcmc-cskh/id1312706562',
      videoGuideUrl: '',
      videoGuideTitle: '',
      pdfGuideUrl: '',
      pdfGuideName: '',
      wordGuideUrl: '',
      wordGuideName: '',
      displayOrder: 7,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'util-sawaco',
      name: 'Sawaco - Nước sạch và Hóa đơn số TP.HCM',
      category: 'living',
      categoryName: 'Đời sống & Dịch vụ thiết yếu',
      shortDesc: 'Báo chỉ số nước, đăng ký định mức nước sinh hoạt trực tuyến cho hộ cư trú, tra cứu hóa đơn và thanh toán online.',
      badge: 'Cấp nước Sawaco',
      icon: 'Droplets',
      imageUrl: '',
      websiteUrl: 'https://sawaco.com.vn',
      androidUrl: 'https://play.google.com/store/apps/details?id=vn.sawaco.cskh',
      iosUrl: 'https://apps.apple.com/vn/app/sawaco-cskh/id1527878345',
      videoGuideUrl: '',
      videoGuideTitle: '',
      pdfGuideUrl: '',
      pdfGuideName: '',
      wordGuideUrl: '',
      wordGuideName: '',
      displayOrder: 8,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  organizations: [
    {
      id: 'org-youth',
      name: 'Đoàn TNCS Hồ Chí Minh Chi đoàn Khu phố 02',
      shortName: 'Đoàn Thanh niên',
      badge: 'Lực lượng xung kích',
      logo: '',
      coverImage: '',
      description: 'Tổ chức chính trị - xã hội của thanh niên Việt Nam tại Khu phố 02. Nơi rèn luyện, cống hiến và trưởng thành cho thế hệ trẻ.',
      mission: 'Phát huy tinh thần xung kích, tình nguyện trong chuyển đổi số cộng đồng, bảo vệ môi trường, hỗ trợ trẻ em và giữ gìn an ninh trật tự.',
      memberBenefits: [
        'Tham gia các hoạt động cộng đồng, đào tạo kỹ năng số và kỹ năng công tác thanh niên.',
        'Môi trường rèn luyện phấn đấu kết nạp vào Đảng Cộng sản Việt Nam.',
      ],
      eligibility: 'Thanh niên nam, nữ từ đủ 16 tuổi đến 30 tuổi đang cư trú tại Khu phố 02.',
      leaderInfo: '',
      googleFormsUrl: '',
      status: 'continuous',
      statusLabel: 'Tiếp nhận liên tục',
      displayOrder: 1,
      isVisible: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'org-women',
      name: 'Hội Liên hiệp Phụ nữ Chi hội Phụ nữ Khu phố 02',
      shortName: 'Hội Phụ nữ',
      badge: 'Vì sự tiến bộ phụ nữ',
      logo: '',
      coverImage: '',
      description: 'Tổ chức đại diện cho quyền và lợi ích hợp pháp, chính đáng của các tầng lớp phụ nữ, xây dựng gia đình no ấm, bình đẳng, tiến bộ, hạnh phúc.',
      mission: 'Vận động phụ nữ tham gia phong trào thi đua, hỗ trợ vốn vay tín dụng chính sách phát triển kinh tế gia đình.',
      memberBenefits: [
        'Hỗ trợ tiếp cận nguồn vốn vay ưu đãi ngân hàng chính sách, tham gia các hoạt động nữ công gia chánh.',
      ],
      eligibility: 'Phụ nữ từ 18 tuổi trở lên đang sinh sống, cư trú tại Khu phố 02.',
      leaderInfo: '',
      googleFormsUrl: '',
      status: 'continuous',
      statusLabel: 'Tiếp nhận liên tục',
      displayOrder: 2,
      isVisible: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'org-veterans',
      name: 'Hội Cựu chiến binh Chi hội Cựu chiến binh Khu phố 02',
      shortName: 'Hội Cựu chiến binh',
      badge: 'Phát huy phẩm chất Bộ đội Cụ Hồ',
      logo: '',
      coverImage: '',
      description: 'Đoàn kết, tập hợp các thế hệ Cựu chiến binh, Cựu quân nhân phát huy bản chất truyền thống tốt đẹp của Quân đội nhân dân Việt Nam.',
      mission: 'Tham gia xây dựng và bảo vệ Đảng, chính quyền, giữ gìn an ninh trật tự khu dân cư, giáo dục truyền thống yêu nước.',
      memberBenefits: [
        'Sinh hoạt truyền thống, thăm hỏi nghĩa tình đồng đội lúc ốm đau, khó khăn.',
      ],
      eligibility: 'Cựu chiến binh, cựu quân nhân đã hoàn thành nghĩa vụ quân sự đang cư trú tại KP2.',
      leaderInfo: '',
      googleFormsUrl: '',
      status: 'continuous',
      statusLabel: 'Tiếp nhận liên tục',
      displayOrder: 3,
      isVisible: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'org-study',
      name: 'Hội Khuyến học Chi hội Khuyến học Khu phố 02',
      shortName: 'Hội Khuyến học',
      badge: 'Xây dựng xã hội học tập',
      logo: '',
      coverImage: '',
      description: 'Vận động toàn dân tham gia khuyến học, khuyến tài, xây dựng gia đình học tập, dòng họ học tập và cộng đồng học tập.',
      mission: 'Trao học bổng cho học sinh hiếu học vượt khó, khen thưởng học sinh giỏi các cấp tại Khu phố 02 hàng năm.',
      memberBenefits: [
        'Con em hội viên được ưu tiên xét duyệt học bổng khuyến học, khuyến tài hàng năm.',
      ],
      eligibility: 'Mọi công dân, phụ huynh, cán bộ hưu trí tâm huyết với sự nghiệp giáo dục tại Khu phố 02.',
      leaderInfo: '',
      googleFormsUrl: '',
      status: 'continuous',
      statusLabel: 'Tiếp nhận liên tục',
      displayOrder: 4,
      isVisible: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'org-redcross',
      name: 'Hội Chữ thập đỏ Chi hội Chữ thập đỏ Khu phố 02',
      shortName: 'Hội Chữ thập đỏ',
      badge: 'Nhân ái - Vì cộng đồng',
      logo: '',
      coverImage: '',
      description: 'Tổ chức xã hội nhân đạo đóng vai trò nòng cốt trong các phong trào trợ giúp xã hội, cứu trợ khẩn cấp và hiến máu nhân đạo.',
      mission: 'Vận động nguồn lực chăm lo gia đình khó khăn, người neo đơn, tham gia hiến máu tình nguyện.',
      memberBenefits: [
        'Được tập huấn kỹ năng sơ cấp cứu ban đầu, tham gia câu lạc bộ hiến máu cứu người.',
      ],
      eligibility: 'Mọi cá nhân có lòng nhân ái, sẵn sàng tham gia hoạt động thiện nguyện xã hội tại Khu phố 02.',
      leaderInfo: '',
      googleFormsUrl: '',
      status: 'continuous',
      statusLabel: 'Tiếp nhận liên tục',
      displayOrder: 5,
      isVisible: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'org-front',
      name: 'Ban Công tác Mặt trận & Các Tổ chức Tự quản Khu phố 02',
      shortName: 'Mặt trận & Hội Tự quản',
      badge: 'Đại đoàn kết toàn dân tộc',
      logo: '',
      coverImage: '',
      description: 'Tập hợp, phát huy sức mạnh khối đại đoàn kết toàn dân, giám sát cộng đồng, Câu lạc bộ Người cao tuổi và Tổ Tự quản an ninh.',
      mission: 'Cầu nối giữa nhân dân với cấp ủy, chính quyền địa phương; vận động nhân dân xây dựng đời sống văn hóa ở khu dân cư.',
      memberBenefits: [
        'Đóng góp tiếng nói, đề xuất trực tiếp các vấn đề dân sinh lên chính quyền cấp phường.',
      ],
      eligibility: 'Mọi công dân gương mẫu, người có uy tín, nhân sĩ, trí thức đang sinh sống tại Khu phố 02.',
      leaderInfo: '',
      googleFormsUrl: '',
      status: 'continuous',
      statusLabel: 'Tiếp nhận liên tục',
      displayOrder: 6,
      isVisible: true,
      updatedAt: new Date().toISOString(),
    },
  ],
  announcements: [],
  residentDocuments: [],
  adminConfig: {
    username: 'kp2.tanhung.hcm',
    passwordHash: ADMIN_HASH,
    passwordSalt: ADMIN_SALT,
    failedAttempts: 0,
    lockedUntil: 0,
    lastLogin: null,
  },
  auditLogs: [
    {
      id: 'log-init',
      action: 'Khởi tạo hệ thống',
      details: 'Khởi tạo hệ thống thông tin – điều hành Khu phố 02, Phường Tân Hưng',
      operator: 'Hệ thống',
      timestamp: new Date().toISOString(),
      status: 'success',
    },
  ],
};

class DatabaseManager {
  private db: AppDatabase;

  constructor() {
    this.ensureDirs();
    this.db = this.loadDatabase();
    this.cleanupExpiredDocuments();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    if (!fs.existsSync(PUBLIC_DATA_DIR)) {
      fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): AppDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        
        // Chỉ lưu logo do người quản trị tải lên; các logo mặc định /icons/apps/ không tự động gán
        const loadedUtilities = Array.isArray(parsed.digitalUtilities) && parsed.digitalUtilities.length > 0
          ? parsed.digitalUtilities.map((u: any, idx: number) => ({
              ...u,
              imageUrl: u.imageUrl && !u.imageUrl.startsWith('/icons/apps/') ? u.imageUrl : '',
              isPinned: u.isPinned !== undefined ? Boolean(u.isPinned) : idx < 4,
            }))
          : initialDatabase.digitalUtilities.map((u, idx) => ({ ...u, isPinned: idx < 4 }));

        return {
          ...initialDatabase,
          ...parsed,
          communityInfo: {
            ...initialDatabase.communityInfo,
            ...(parsed.communityInfo || {}),
          },
          demographics: { ...initialDatabase.demographics, ...(parsed.demographics || {}) },
          committeeMembers: Array.isArray(parsed.committeeMembers) ? parsed.committeeMembers : [],
          officialDocuments: Array.isArray(parsed.officialDocuments) ? parsed.officialDocuments : [],
          programRegistrations: Array.isArray(parsed.programRegistrations) ? parsed.programRegistrations.map((r: any) => ({
            ...r,
            status: r.status || 'pending',
            statusLabel: r.statusLabel || (r.status === 'confirmed' ? 'Đã xác nhận tham gia' : 'Chưa xác nhận'),
          })) : [],
          organizationRegistrations: Array.isArray(parsed.organizationRegistrations) ? parsed.organizationRegistrations : [],
          incidentReports: Array.isArray(parsed.incidentReports) ? parsed.incidentReports : [],
          communityQuestions: Array.isArray(parsed.communityQuestions) ? parsed.communityQuestions : [],
          digitalUtilities: loadedUtilities,
          adminConfig: {
            ...initialDatabase.adminConfig,
            ...(parsed.adminConfig || {}),
            // Luôn đảm bảo tài khoản kp2.tanhung.hcm được cài đặt chuẩn xác
            username: 'kp2.tanhung.hcm',
            passwordHash: parsed.adminConfig?.passwordHash || ADMIN_HASH,
            passwordSalt: parsed.adminConfig?.passwordSalt || ADMIN_SALT,
          },
        };
      }
    } catch (e) {
      console.error('Lỗi tải cơ sở dữ liệu, khởi tạo dữ liệu chuẩn:', e);
    }

    this.saveDatabase(initialDatabase);
    return initialDatabase;
  }

  public saveDatabase(dataToSave?: AppDatabase): boolean {
    try {
      const data = dataToSave || this.db;
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
      try {
        fs.writeFileSync(PUBLIC_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      } catch {}
      if (dataToSave) {
        this.db = dataToSave;
      }
      return true;
    } catch (err) {
      console.error('Lỗi lưu cơ sở dữ liệu:', err);
      return false;
    }
  }

  // Tự động kiểm tra và lọc/xóa văn bản hết hạn
  public cleanupExpiredDocuments(): void {
    if (!Array.isArray(this.db.officialDocuments)) {
      this.db.officialDocuments = [];
      return;
    }
    const beforeCount = this.db.officialDocuments.length;
    // Đánh dấu thuộc tính isExpired cho văn bản
    this.db.officialDocuments = this.db.officialDocuments.map(doc => ({
      ...doc,
      isExpired: isDocumentExpired(doc.expirationDate),
    }));
    // Loại bỏ hoàn toàn các văn bản đã hết hạn nếu cần hoặc để admin xem
  }

  public getPublicData() {
    this.cleanupExpiredDocuments();
    // Văn bản công khai: chỉ hiển thị các văn bản CHƯA hết hạn
    const activeDocuments = (this.db.officialDocuments || []).filter(
      doc => !isDocumentExpired(doc.expirationDate)
    );

    return {
      communityInfo: this.db.communityInfo,
      demographics: this.db.demographics,
      committeeMembers: (this.db.committeeMembers || []).sort((a, b) => a.displayOrder - b.displayOrder),
      officialDocuments: activeDocuments,
      activities: this.db.activities || [],
      digitalUtilities: (this.db.digitalUtilities || []).filter(u => u.isVisible),
      organizations: (this.db.organizations || []).filter(o => o.isVisible),
      announcements: this.db.announcements || [],
      residentDocuments: this.db.residentDocuments || [],
      communityQuestions: (this.db.communityQuestions || []).filter(q => q.status !== 'closed'),
      // Phản ánh đã tiếp nhận/đang xử lý/đã xử lý hiển thị ẩn danh số điện thoại
      publicIncidents: (this.db.incidentReports || []).map(inc => ({
        id: inc.id,
        reportCode: inc.reportCode,
        title: inc.title,
        category: inc.category,
        categoryLabel: inc.categoryLabel,
        description: inc.description,
        locationAddress: inc.locationAddress,
        coordinates: inc.coordinates,
        photoUrl: inc.photoUrl,
        reporterName: inc.reporterName.charAt(0) + '***',
        status: inc.status,
        statusLabel: inc.statusLabel,
        adminResponse: inc.adminResponse,
        resolvedAt: inc.resolvedAt,
        createdAt: inc.createdAt,
      })),
    };
  }

  public getAdminData() {
    this.cleanupExpiredDocuments();
    return {
      communityInfo: this.db.communityInfo,
      demographics: this.db.demographics,
      committeeMembers: (this.db.committeeMembers || []).sort((a, b) => a.displayOrder - b.displayOrder),
      officialDocuments: this.db.officialDocuments || [],
      programRegistrations: this.db.programRegistrations || [],
      organizationRegistrations: this.db.organizationRegistrations || [],
      incidentReports: this.db.incidentReports || [],
      communityQuestions: this.db.communityQuestions || [],
      activities: this.db.activities || [],
      digitalUtilities: this.db.digitalUtilities || [],
      organizations: this.db.organizations || [],
      announcements: this.db.announcements || [],
      residentDocuments: this.db.residentDocuments || [],
      auditLogs: (this.db.auditLogs || []).slice(-100).reverse(),
      adminStatus: {
        username: this.db.adminConfig.username,
        lastLogin: this.db.adminConfig.lastLogin,
      },
    };
  }

  public logAudit(action: string, details: string, operator = 'kp2.tanhung.hcm', status: 'success' | 'failure' = 'success', ipAddress = '') {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      details,
      operator,
      timestamp: new Date().toISOString(),
      status,
      ipAddress,
    };
    if (!this.db.auditLogs) this.db.auditLogs = [];
    this.db.auditLogs.push(log);
    if (this.db.auditLogs.length > 1000) {
      this.db.auditLogs.shift();
    }
    this.saveDatabase();
  }

  // Admin Account & Auth
  public getAdminConfig() {
    return this.db.adminConfig;
  }

  public updateFailedLogin(newFailedCount: number, lockedUntilMs: number) {
    this.db.adminConfig.failedAttempts = newFailedCount;
    this.db.adminConfig.lockedUntil = lockedUntilMs;
    this.saveDatabase();
  }

  public recordSuccessLogin() {
    this.db.adminConfig.failedAttempts = 0;
    this.db.adminConfig.lockedUntil = 0;
    this.db.adminConfig.lastLogin = new Date().toISOString();
    this.saveDatabase();
  }

  public changeAdminPassword(newPasswordHash: string, newSalt: string) {
    this.db.adminConfig.passwordHash = newPasswordHash;
    this.db.adminConfig.passwordSalt = newSalt;
    this.db.adminConfig.failedAttempts = 0;
    this.db.adminConfig.lockedUntil = 0;
    this.saveDatabase();
    this.logAudit('Đổi mật khẩu', 'Đổi mật khẩu quản trị viên thành công');
  }

  // Basic update methods
  public updateCommunityInfo(info: Partial<CommunityInfo>) {
    this.db.communityInfo = {
      ...this.db.communityInfo,
      ...info,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    this.logAudit('Cập nhật thông tin', 'Cập nhật thông tin nhận diện Khu phố 02');
    return this.db.communityInfo;
  }

  public updateDemographics(stats: Partial<Demographics>) {
    this.db.demographics = {
      ...this.db.demographics,
      ...stats,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    this.logAudit('Cập nhật chỉ số dân cư', `Cập nhật số liệu dân số và chỉ số số hóa`);
    return this.db.demographics;
  }

  // Committee Members CRUD
  public saveCommitteeMember(member: CommitteeMember) {
    if (!this.db.committeeMembers) this.db.committeeMembers = [];
    const index = this.db.committeeMembers.findIndex(m => m.id === member.id);
    if (index >= 0) {
      this.db.committeeMembers[index] = { ...member, updatedAt: new Date().toISOString() };
      this.logAudit('Sửa cán bộ', `Cập nhật thông tin cán bộ "${member.fullName}" - ${member.position}`);
    } else {
      this.db.committeeMembers.push({
        ...member,
        id: member.id || `mem-${Date.now()}`,
        displayOrder: member.displayOrder || this.db.committeeMembers.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.logAudit('Thêm cán bộ', `Thêm cán bộ mới "${member.fullName}" - ${member.position}`);
    }
    this.saveDatabase();
    return this.db.committeeMembers;
  }

  public deleteCommitteeMember(id: string) {
    const mem = (this.db.committeeMembers || []).find(m => m.id === id);
    this.db.committeeMembers = (this.db.committeeMembers || []).filter(m => m.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa cán bộ', `Xóa cán bộ "${mem?.fullName || id}"`);
    return this.db.committeeMembers;
  }

  // Official Documents CRUD & Expiration
  public saveOfficialDocument(doc: OfficialDocument) {
    if (!this.db.officialDocuments) this.db.officialDocuments = [];
    const index = this.db.officialDocuments.findIndex(d => d.id === doc.id);
    const isExpired = isDocumentExpired(doc.expirationDate);

    if (index >= 0) {
      this.db.officialDocuments[index] = {
        ...doc,
        isExpired,
        updatedAt: new Date().toISOString(),
      };
      this.logAudit('Sửa văn bản', `Cập nhật văn bản "${doc.title}" (Số hiệu: ${doc.documentNumber})`);
    } else {
      this.db.officialDocuments.unshift({
        ...doc,
        id: doc.id || `vban-${Date.now()}`,
        isExpired,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.logAudit('Ban hành văn bản', `Ban hành văn bản "${doc.title}" (Số: ${doc.documentNumber}, Hết hạn: ${doc.expirationDate})`);
    }
    this.saveDatabase();
    return this.db.officialDocuments;
  }

  public deleteOfficialDocument(id: string) {
    const doc = (this.db.officialDocuments || []).find(d => d.id === id);
    this.db.officialDocuments = (this.db.officialDocuments || []).filter(d => d.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa văn bản', `Xóa văn bản "${doc?.title || id}"`);
    return this.db.officialDocuments;
  }

  public purgeExpiredDocuments(): { purgedCount: number } {
    if (!this.db.officialDocuments) return { purgedCount: 0 };
    const originalCount = this.db.officialDocuments.length;
    this.db.officialDocuments = this.db.officialDocuments.filter(d => !isDocumentExpired(d.expirationDate));
    const purgedCount = originalCount - this.db.officialDocuments.length;
    if (purgedCount > 0) {
      this.saveDatabase();
      this.logAudit('Tự động dọn dẹp', `Đã tự động xóa ${purgedCount} văn bản hết thời hạn hiệu lực`);
    }
    return { purgedCount };
  }

  // Program Registrations
  public registerProgram(registration: Omit<ProgramRegistration, 'id' | 'createdAt' | 'status' | 'statusLabel'>) {
    if (!this.db.programRegistrations) this.db.programRegistrations = [];
    const newReg: ProgramRegistration = {
      ...registration,
      id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'pending',
      statusLabel: 'Chưa xác nhận',
      createdAt: new Date().toISOString(),
    };
    this.db.programRegistrations.unshift(newReg);

    // Update registration count in corresponding activity if exists
    if (this.db.activities) {
      const act = this.db.activities.find(a => a.id === registration.activityId);
      if (act) {
        act.registrationCount = (act.registrationCount || 0) + (registration.attendeeCount || 1);
      }
    }

    this.saveDatabase();
    this.logAudit('Đăng ký hoạt động', `Tiếp nhận đăng ký tham gia "${registration.activityTitle}" của "${registration.fullName}" (Chờ quản lý xác nhận)`);
    return newReg;
  }

  public updateProgramRegistrationStatus(id: string, status: ProgramRegistration['status'], operator = 'kp2.tanhung.hcm') {
    if (!this.db.programRegistrations) return null;
    const item = this.db.programRegistrations.find(r => r.id === id);
    if (!item) return null;

    item.status = status;
    item.statusLabel = status === 'confirmed' ? 'Đã xác nhận tham gia' : status === 'rejected' ? 'Từ chối tham gia' : 'Chưa xác nhận';
    if (status === 'confirmed') {
      item.confirmedAt = new Date().toISOString();
      item.confirmedBy = operator;
    }
    this.saveDatabase();
    this.logAudit('Xác nhận đăng ký hoạt động', `${status === 'confirmed' ? 'Xác nhận tham gia' : 'Cập nhật trạng thái'} cho người dân "${item.fullName}" (${item.statusLabel})`);
    return item;
  }

  public getProgramRegistrationStatus(phoneNumber: string) {
    const clean = phoneNumber.replace(/[^\d]/g, '');
    if (!clean || clean.length < 8) return [];
    return (this.db.programRegistrations || [])
      .filter(r => r.phoneNumber.replace(/[^\d]/g, '').includes(clean))
      .map(r => ({
        id: r.id,
        activityTitle: r.activityTitle,
        fullName: r.fullName,
        phoneNumber: r.phoneNumber.slice(0, 3) + '****' + r.phoneNumber.slice(-3),
        attendeeCount: r.attendeeCount,
        status: r.status || 'pending',
        statusLabel: r.statusLabel || (r.status === 'confirmed' ? 'Đã xác nhận tham gia' : 'Chưa xác nhận'),
        createdAt: r.createdAt,
      }));
  }

  public deleteProgramRegistration(id: string) {
    this.db.programRegistrations = (this.db.programRegistrations || []).filter(r => r.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa đăng ký', `Xóa đơn đăng ký tham gia chương trình ID ${id}`);
    return this.db.programRegistrations;
  }

  // Organization Registrations (Đoàn thể & Hội)
  public registerOrganization(data: {
    organizationId: string;
    organizationName: string;
    fullName: string;
    phoneNumber: string;
    birthDate?: string;
    neighborhoodGroup?: string;
    address?: string;
    notes?: string;
    hasConfirmedAgreement: boolean;
  }): OrganizationRegistration {
    if (!this.db.organizationRegistrations) this.db.organizationRegistrations = [];
    const newReg: OrganizationRegistration = {
      id: `orgreg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      organizationId: data.organizationId,
      organizationName: data.organizationName,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      birthDate: data.birthDate,
      neighborhoodGroup: data.neighborhoodGroup,
      address: data.address,
      notes: data.notes,
      hasConfirmedAgreement: Boolean(data.hasConfirmedAgreement),
      status: 'pending',
      statusLabel: 'Chờ xét duyệt',
      createdAt: new Date().toISOString(),
    };
    this.db.organizationRegistrations.unshift(newReg);
    this.saveDatabase();
    this.logAudit('Đăng ký đoàn thể', `Tiếp nhận đăng ký tham gia ${data.organizationName} của ${data.fullName}`);
    return newReg;
  }

  public deleteOrganizationRegistration(id: string) {
    this.db.organizationRegistrations = (this.db.organizationRegistrations || []).filter(r => r.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa đăng ký đoàn thể', `Xóa đơn đăng ký ID ${id}`);
    return this.db.organizationRegistrations;
  }

  public updateOrganizationRegistrationStatus(id: string, status: OrganizationRegistration['status']) {
    if (!this.db.organizationRegistrations) return null;
    const item = this.db.organizationRegistrations.find(r => r.id === id);
    if (!item) return null;
    item.status = status;
    item.statusLabel = status === 'accepted' ? 'Đã kết nạp/tiếp nhận' : status === 'contacted' ? 'Đã liên hệ' : status === 'rejected' ? 'Chưa phù hợp' : 'Chờ xét duyệt';
    this.saveDatabase();
    this.logAudit('Cập nhật đăng ký đoàn thể', `Cập nhật trạng thái của ${item.fullName} sang: ${item.statusLabel}`);
    return item;
  }

  // Incident Reports
  public submitIncidentReport(report: Omit<IncidentReport, 'id' | 'reportCode' | 'status' | 'statusLabel' | 'createdAt' | 'updatedAt'>) {
    if (!this.db.incidentReports) this.db.incidentReports = [];
    const count = this.db.incidentReports.length + 1;
    const year = new Date().getFullYear();
    const reportCode = `PA-${year}-${count.toString().padStart(3, '0')}`;

    const newReport: IncidentReport = {
      ...report,
      id: `inc-${Date.now()}`,
      reportCode,
      status: 'received',
      statusLabel: 'Chờ tiếp nhận',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.incidentReports.unshift(newReport);
    this.saveDatabase();
    return newReport;
  }

  public updateIncidentStatus(id: string, status: IncidentReport['status'], adminResponse?: string) {
    if (!this.db.incidentReports) return null;
    const item = this.db.incidentReports.find(i => i.id === id);
    if (!item) return null;

    const statusLabels: Record<IncidentReport['status'], string> = {
      received: 'Đã tiếp nhận',
      in_progress: 'Đang xử lý',
      resolved: 'Đã giải quyết',
      rejected: 'Không thuộc thẩm quyền',
    };

    item.status = status;
    item.statusLabel = statusLabels[status];
    if (adminResponse !== undefined) {
      item.adminResponse = adminResponse;
    }
    if (status === 'resolved') {
      item.resolvedAt = new Date().toISOString();
    }
    item.updatedAt = new Date().toISOString();

    this.saveDatabase();
    this.logAudit('Xử lý phản ánh', `Cập nhật trạng thái phản ánh ${item.reportCode} sang: ${item.statusLabel}`);
    return item;
  }

  public deleteIncidentReport(id: string) {
    this.db.incidentReports = (this.db.incidentReports || []).filter(i => i.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa phản ánh', `Xóa hồ sơ phản ánh ID ${id}`);
    return this.db.incidentReports;
  }

  // Community Q&A
  public submitQuestion(data: {
    title: string;
    content: string;
    authorName: string;
    authorContact?: string;
    category: CommunityQuestion['category'];
    categoryLabel: string;
  }) {
    if (!this.db.communityQuestions) this.db.communityQuestions = [];
    const question: CommunityQuestion = {
      id: `q-${Date.now()}`,
      title: data.title,
      content: data.content,
      authorName: data.authorName,
      authorContact: data.authorContact,
      category: data.category,
      categoryLabel: data.categoryLabel,
      status: 'pending',
      answers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.communityQuestions.unshift(question);
    this.saveDatabase();
    return question;
  }

  public addAnswer(questionId: string, answer: { authorName: string; isOfficial: boolean; content: string }) {
    if (!this.db.communityQuestions) return null;
    const q = this.db.communityQuestions.find(i => i.id === questionId);
    if (!q) return null;

    const newAnswer = {
      id: `ans-${Date.now()}`,
      authorName: answer.authorName,
      isOfficial: answer.isOfficial,
      content: answer.content,
      createdAt: new Date().toISOString(),
    };

    q.answers.push(newAnswer);
    q.status = 'answered';
    q.updatedAt = new Date().toISOString();

    this.saveDatabase();
    if (answer.isOfficial) {
      this.logAudit('Trả lời ý kiến', `Ban điều hành trả lời câu hỏi "${q.title}"`);
    }
    return q;
  }

  public deleteQuestion(id: string) {
    this.db.communityQuestions = (this.db.communityQuestions || []).filter(q => q.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa câu hỏi', `Xóa câu hỏi thảo luận ID ${id}`);
    return this.db.communityQuestions;
  }

  public deleteAnswer(questionId: string, answerId: string) {
    if (!this.db.communityQuestions) return null;
    const q = this.db.communityQuestions.find(i => i.id === questionId);
    if (!q) return null;

    q.answers = q.answers.filter(a => a.id !== answerId);
    if (q.answers.length === 0) {
      q.status = 'pending';
    }
    q.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return q;
  }

  public togglePinQuestion(id: string) {
    if (!this.db.communityQuestions) return null;
    const q = this.db.communityQuestions.find(i => i.id === id);
    if (!q) return null;
    q.isPinned = !q.isPinned;
    this.saveDatabase();
    return q;
  }

  // Activities CRUD
  public saveActivity(activity: Activity) {
    if (!this.db.activities) this.db.activities = [];
    const index = this.db.activities.findIndex(a => a.id === activity.id);
    if (index >= 0) {
      this.db.activities[index] = { ...activity, updatedAt: new Date().toISOString() };
      this.logAudit('Sửa hoạt động', `Chỉnh sửa hoạt động "${activity.title}"`);
    } else {
      this.db.activities.unshift({
        ...activity,
        id: activity.id || `act-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.logAudit('Thêm hoạt động', `Tạo hoạt động mới "${activity.title}"`);
    }
    this.saveDatabase();
    return this.db.activities;
  }

  public deleteActivity(id: string) {
    const act = (this.db.activities || []).find(a => a.id === id);
    this.db.activities = (this.db.activities || []).filter(a => a.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa hoạt động', `Xóa hoạt động ID ${id} (${act?.title || ''})`);
    return this.db.activities;
  }

  // Digital Utilities CRUD
  public saveUtility(utility: DigitalUtility) {
    if (!this.db.digitalUtilities) this.db.digitalUtilities = [];
    const index = this.db.digitalUtilities.findIndex(u => u.id === utility.id);
    if (index >= 0) {
      this.db.digitalUtilities[index] = { ...utility, updatedAt: new Date().toISOString() };
      this.logAudit('Sửa tiện ích số', `Chỉnh sửa tiện ích "${utility.name}"`);
    } else {
      this.db.digitalUtilities.push({
        ...utility,
        id: utility.id || `util-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.logAudit('Thêm tiện ích số', `Thêm tiện ích mới "${utility.name}"`);
    }
    this.saveDatabase();
    return this.db.digitalUtilities;
  }

  public deleteUtility(id: string) {
    const util = (this.db.digitalUtilities || []).find(u => u.id === id);
    this.db.digitalUtilities = (this.db.digitalUtilities || []).filter(u => u.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa tiện ích số', `Xóa tiện ích ID ${id} (${util?.name || ''})`);
    return this.db.digitalUtilities;
  }

  // Organizations CRUD
  public saveOrganization(org: Organization) {
    if (!this.db.organizations) this.db.organizations = [];
    const index = this.db.organizations.findIndex(o => o.id === org.id);
    if (index >= 0) {
      this.db.organizations[index] = { ...org, updatedAt: new Date().toISOString() };
      this.logAudit('Sửa tổ chức', `Cập nhật tổ chức "${org.name}", Forms: ${org.googleFormsUrl || 'Chưa thiết lập'}`);
    } else {
      this.db.organizations.push({
        ...org,
        id: org.id || `org-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      });
      this.logAudit('Thêm tổ chức', `Thêm tổ chức mới "${org.name}"`);
    }
    this.saveDatabase();
    return this.db.organizations;
  }

  public deleteOrganization(id: string) {
    const org = (this.db.organizations || []).find(o => o.id === id);
    this.db.organizations = (this.db.organizations || []).filter(o => o.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa tổ chức', `Xóa tổ chức ID ${id} (${org?.name || ''})`);
    return this.db.organizations;
  }

  // Announcements CRUD
  public saveAnnouncement(ann: Announcement) {
    if (!this.db.announcements) this.db.announcements = [];
    const index = this.db.announcements.findIndex(a => a.id === ann.id);
    if (index >= 0) {
      this.db.announcements[index] = { ...ann };
      this.logAudit('Sửa thông báo', `Chỉnh sửa thông báo "${ann.title}"`);
    } else {
      this.db.announcements.unshift({
        ...ann,
        id: ann.id || `ann-${Date.now()}`,
        publishedAt: new Date().toISOString(),
      });
      this.logAudit('Đăng thông báo', `Đăng thông báo mới "${ann.title}"`);
    }
    this.saveDatabase();
    return this.db.announcements;
  }

  public deleteAnnouncement(id: string) {
    const ann = (this.db.announcements || []).find(a => a.id === id);
    this.db.announcements = (this.db.announcements || []).filter(a => a.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa thông báo', `Xóa thông báo ID ${id} (${ann?.title || ''})`);
    return this.db.announcements;
  }

  // Resident Documents CRUD
  public saveResidentDocument(doc: ResidentDocument) {
    if (!this.db.residentDocuments) this.db.residentDocuments = [];
    const index = this.db.residentDocuments.findIndex(d => d.id === doc.id);
    if (index >= 0) {
      this.db.residentDocuments[index] = { ...doc, updatedAt: new Date().toISOString() };
      this.logAudit('Sửa biểu mẫu', `Cập nhật biểu mẫu "${doc.title}" (${doc.code})`);
    } else {
      this.db.residentDocuments.push({
        ...doc,
        id: doc.id || `doc-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      });
      this.logAudit('Thêm biểu mẫu', `Thêm biểu mẫu mới "${doc.title}" (${doc.code})`);
    }
    this.saveDatabase();
    return this.db.residentDocuments;
  }

  public deleteResidentDocument(id: string) {
    const doc = (this.db.residentDocuments || []).find(d => d.id === id);
    this.db.residentDocuments = (this.db.residentDocuments || []).filter(d => d.id !== id);
    this.saveDatabase();
    this.logAudit('Xóa biểu mẫu', `Xóa biểu mẫu ID ${id} (${doc?.title || ''})`);
    return this.db.residentDocuments;
  }

  // Backup & Restore
  public createBackup(): { success: boolean; data: AppDatabase; filename: string } {
    const filename = `backup-kp2-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(this.db, null, 2), 'utf-8');
    this.logAudit('Sao lưu dữ liệu', `Tạo bản sao lưu hệ thống: ${filename}`);
    return { success: true, data: this.db, filename };
  }

  public restoreBackup(data: Partial<AppDatabase>): { success: boolean; message: string } {
    if (!data.communityInfo || !data.demographics) {
      return { success: false, message: 'Dữ liệu sao lưu không đúng định dạng chuẩn của Khu phố 02' };
    }
    this.db = {
      ...this.db,
      ...data,
      adminConfig: this.db.adminConfig, // preserve admin auth credentials
    };
    this.saveDatabase();
    this.logAudit('Phục hồi dữ liệu', 'Phục hồi toàn bộ cơ sở dữ liệu từ bản sao lưu thành công');
    return { success: true, message: 'Phục hồi dữ liệu thành công' };
  }

  // Reset entire database to clean slate (no demo data)
  public resetToCleanSlate() {
    this.db = {
      ...initialDatabase,
      adminConfig: {
        username: 'kp2.tanhung.hcm',
        passwordHash: ADMIN_HASH,
        passwordSalt: ADMIN_SALT,
        failedAttempts: 0,
        lockedUntil: 0,
        lastLogin: null,
      },
    };
    this.saveDatabase();
    this.logAudit('Khởi tạo lại', 'Đã xóa toàn bộ nội dung kiểm thử, hệ thống sẵn sàng cập nhật từ đầu');
    return this.db;
  }
}

export const dbManager = new DatabaseManager();
