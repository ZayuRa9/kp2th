import React, { useState, useEffect, useRef } from 'react';
import { fetchPublicData, verifyAdminSession, PublicDataResponse } from './services/api';
import { getInitialPublicData } from './data/initialData';
import { Header } from './components/Header';
import { BannerTicker } from './components/BannerTicker';
import { HeroOverview } from './components/HeroOverview';
import { WardMapSection } from './components/WardMapSection';
import { CommitteeSection } from './components/CommitteeSection';
import { OfficialDocumentsSection } from './components/OfficialDocumentsSection';
import { PublicMediaSection } from './components/PublicMediaSection';
import { DigitalUtilitiesSection } from './components/DigitalUtilitiesSection';
import { OrganizationsSection } from './components/OrganizationsSection';
import { ActivitiesSection } from './components/ActivitiesSection';
import { IncidentReportSection } from './components/IncidentReportSection';
import { CommunityQASection } from './components/CommunityQASection';
import { AnnouncementsSection } from './components/AnnouncementsSection';
import { ResidentDocsSection } from './components/ResidentDocsSection';
import { Footer } from './components/Footer';
import { AdminModal } from './components/AdminModal';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { diffNewEventsAndIncidents } from './utils/rules';
import { RefreshCw } from 'lucide-react';

function AppContent() {
  const { showToast } = useToast();
  const [publicData, setPublicData] = useState<PublicDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const prevDataRef = useRef<PublicDataResponse | null>(null);
  const isFirstLoadRef = useRef(true);

  const loadData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const data = await fetchPublicData();

      // Check diff to trigger toast notifications when new items arrive
      if (prevDataRef.current) {
        const detected = diffNewEventsAndIncidents(
          prevDataRef.current.publicIncidents || [],
          data.publicIncidents || [],
          prevDataRef.current.activities || [],
          data.activities || []
        );

        detected.forEach((notif) => {
          showToast({
            type: notif.type,
            title: notif.title,
            message: notif.message,
            duration: 8000,
            actionLabel: notif.actionLabel || 'Xem ngay',
            metadata: {
              targetTab: notif.actionUrl ? notif.actionUrl.replace('#', '') : 'overview',
            },
          });
        });
      } else if (isFirstLoadRef.current) {
        // Welcome notification on first visit
        isFirstLoadRef.current = false;
        setTimeout(() => {
          showToast({
            type: 'info',
            title: 'Hệ Thống Số Khu Phố 02 Sẵn Sàng',
            message: 'Chào mừng bà con đến với Cổng thông tin & Tiện ích số Khu phố 02, Phường Tân Hưng.',
            duration: 6500,
            actionLabel: 'Xem tiện ích',
            metadata: { targetTab: 'utilities-section' },
          });
        }, 1200);
      }

      prevDataRef.current = data;
      setPublicData(data);
      setError(null);
    } catch (err: any) {
      console.warn('Lỗi nạp dữ liệu từ máy chủ, kích hoạt dữ liệu cơ sở dự phòng:', err);
      const fallback = getInitialPublicData();
      setPublicData(fallback);
      setError(null);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    verifyAdminSession().then((isAuth) => {
      setIsAdminLoggedIn(isAuth);
    });

    if (window.location.hash === '#admin') {
      setIsAdminOpen(true);
    }

    // Auto-polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigateTab = (tabId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading && !publicData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 animate-pulse">
          <span className="font-extrabold text-xl text-white">KP2</span>
        </div>
        <h2 className="text-xl font-bold mb-2">HỆ THỐNG THÔNG TIN – TIỆN ÍCH SỐ KHU PHỐ 02</h2>
        <p className="text-xs text-slate-400">Đang khởi động dữ liệu máy chủ Phường Tân Hưng...</p>
      </div>
    );
  }

  if (error && !publicData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md p-6 bg-white rounded-2xl border border-red-200 shadow-md">
          <div className="text-red-600 font-extrabold text-base mb-2">
            Không thể kết nối máy chủ
          </div>
          <p className="text-xs text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => loadData(false)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    );
  }

  if (!publicData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Dynamic Floating Toasts & Notification Drawer */}
      <ToastContainer onNavigateTab={handleNavigateTab} />

      {/* 1. Official Header */}
      <Header
        communityInfo={publicData.communityInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* 2. Banner Ticker for Notices */}
      {publicData.announcements && publicData.announcements.length > 0 && (
        <BannerTicker announcements={publicData.announcements} />
      )}

      {/* 3. Main Body Sections */}
      <main className="flex-1">
        {/* Section 1: Overview & Live Demographics */}
        <div id="overview">
          <HeroOverview
            communityInfo={publicData.communityInfo}
            demographics={publicData.demographics}
            onNavigateTab={handleNavigateTab}
          />
        </div>

        {/* Section 2: Ward Map & Google Maps Separation */}
        <div id="map-section">
          <WardMapSection communityInfo={publicData.communityInfo} />
        </div>

        {/* Section 3: Committee Members (Ban Điều hành Khu phố 02) */}
        <div id="committee-section">
          <CommitteeSection
            members={publicData.committeeMembers}
            communityInfo={publicData.communityInfo}
            onOpenAdminModal={() => setIsAdminOpen(true)}
          />
        </div>

        {/* Section 4: Official Documents (Văn bản Khu phố) */}
        <div id="documents-section">
          <OfficialDocumentsSection documents={publicData.officialDocuments} />
        </div>

        {/* Section 5: Public Media Channels (Trang Thông tin Đại chúng Phường Tân Hưng) */}
        <div id="media-section">
          <PublicMediaSection />
        </div>

        {/* Section 6: Digital Utilities Library */}
        <div id="utilities-section">
          <DigitalUtilitiesSection utilities={publicData.digitalUtilities} />
        </div>

        {/* Section 7: Political & Social Organizations Registration */}
        <div id="orgs-section">
          <OrganizationsSection organizations={publicData.organizations} />
        </div>

        {/* Section 7: Activities, Events & Program Registration */}
        <div id="activities-section">
          <ActivitiesSection
            activities={publicData.activities}
            onRefresh={() => loadData(true)}
          />
        </div>

        {/* Section 8: Community Incident Reporting */}
        <div id="incidents-section">
          <IncidentReportSection
            incidents={publicData.publicIncidents || []}
            onRefresh={() => loadData(true)}
          />
        </div>

        {/* Section 9: Community Q&A */}
        <div id="qa-section">
          <CommunityQASection
            questions={publicData.communityQuestions || []}
            onRefresh={() => loadData(true)}
          />
        </div>

        {/* Section 10: Official Announcements */}
        {publicData.announcements && publicData.announcements.length > 0 && (
          <div id="announcements">
            <AnnouncementsSection announcements={publicData.announcements} />
          </div>
        )}

        {/* Section 11: Administrative Form Templates */}
        {publicData.residentDocuments && publicData.residentDocuments.length > 0 && (
          <div id="docs-section">
            <ResidentDocsSection documents={publicData.residentDocuments} />
          </div>
        )}
      </main>

      {/* 4. Official Footer */}
      <Footer
        communityInfo={publicData.communityInfo}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* 5. Comprehensive Admin Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataChanged={() => loadData(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        setIsAdminLoggedIn={setIsAdminLoggedIn}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
