import React from 'react';
import { useToast } from '../context/ToastContext';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  X,
  ExternalLink,
  Trash2,
  CheckCheck,
  ShieldAlert,
} from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastContainerProps {
  onNavigateTab?: (tabId: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ onNavigateTab }) => {
  const {
    toasts,
    history,
    unreadCount,
    isHistoryOpen,
    setIsHistoryOpen,
    dismissToast,
    clearAllToasts,
    markHistoryAsRead,
    clearHistory,
  } = useToast();

  const getIcon = (type: ToastNotification['type']) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'alert':
        return <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-600 shrink-0" />;
    }
  };

  const getTypeStyle = (type: ToastNotification['type']) => {
    switch (type) {
      case 'incident':
        return 'border-amber-200 bg-amber-50/95 text-slate-800 shadow-amber-500/10';
      case 'event':
        return 'border-blue-200 bg-blue-50/95 text-slate-800 shadow-blue-500/10';
      case 'alert':
        return 'border-red-200 bg-red-50/95 text-slate-800 shadow-red-500/10';
      case 'success':
        return 'border-emerald-200 bg-emerald-50/95 text-slate-800 shadow-emerald-500/10';
      case 'warning':
        return 'border-orange-200 bg-orange-50/95 text-slate-800 shadow-orange-500/10';
      case 'info':
      default:
        return 'border-sky-200 bg-white/95 text-slate-800 shadow-slate-900/10';
    }
  };

  const handleToastAction = (t: ToastNotification) => {
    if (t.onAction) {
      t.onAction();
    } else if (t.actionHref) {
      window.location.hash = t.actionHref;
    } else if (t.metadata?.targetTab && onNavigateTab) {
      onNavigateTab(t.metadata.targetTab);
    }
    dismissToast(t.id);
  };

  return (
    <>
      {/* Floating Toasts Stack */}
      <div
        aria-live="polite"
        className="fixed top-20 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto rounded-xl p-3.5 sm:p-4 border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${getTypeStyle(
              toast.type
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(toast.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                    {toast.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">Vừa xong</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed line-clamp-3">
                  {toast.message}
                </p>

                {(toast.actionLabel || toast.metadata?.targetTab) && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToastAction(toast)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition active:scale-95 shadow-sm"
                    >
                      <span>{toast.actionLabel || 'Xem chi tiết'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md transition"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Drawer Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[9998] flex items-start justify-end p-2 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] mt-14 sm:mt-16 animate-in slide-in-from-right-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Trung tâm thông báo Khu phố 02</h3>
                  <p className="text-[11px] text-slate-500">
                    {history.length > 0 ? `${history.length} thông báo gần đây` : 'Chưa có thông báo'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markHistoryAsRead}
                    title="Đánh dấu đã đọc"
                    className="p-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-medium flex items-center gap-1 transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đã đọc</span>
                  </button>
                )}
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100/80">
              {history.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="text-xs">Hiện tại chưa có thông báo cập nhật nào</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hệ thống sẽ tự động gửi thông báo nhỏ khi có sự kiện hoặc phản ánh mới
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="pt-2 first:pt-0 flex items-start gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition cursor-pointer"
                    onClick={() => {
                      if (item.metadata?.targetTab && onNavigateTab) {
                        onNavigateTab(item.metadata.targetTab);
                        setIsHistoryOpen(false);
                      }
                    }}
                  >
                    <div className="mt-0.5">{getIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{item.title}</h5>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                      {item.metadata?.targetTab && (
                        <span className="inline-block mt-1 text-[10px] text-blue-600 font-semibold hover:underline">
                          Chuyển đến mục liên quan &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={clearHistory}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-red-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa lịch sử</span>
                </button>
                <button
                  type="button"
                  onClick={clearAllToasts}
                  className="text-slate-500 hover:text-slate-700 transition"
                >
                  Ẩn tất cả pop-up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
