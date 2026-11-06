import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Pin,
  ShieldCheck,
  User,
  PlusCircle,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CommunityQuestion } from '../types';
import { submitQuestionApi, addAnswerApi } from '../services/api';
import { formatVietnameseDate } from '../utils/rules';

interface CommunityQASectionProps {
  questions: CommunityQuestion[];
  onRefresh?: () => void;
}

const QA_CATEGORIES = [
  { value: 'all', label: 'Tất cả câu hỏi' },
  { value: 'admin', label: 'Thủ tục hành chính' },
  { value: 'utility', label: 'Tiện ích & Dịch vụ số' },
  { value: 'residence', label: 'Cư trú & Đời sống dân sinh' },
  { value: 'security', label: 'An ninh trật tự' },
  { value: 'other', label: 'Khác' },
];

export const CommunityQASection: React.FC<CommunityQASectionProps> = ({ questions, onRefresh }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // New question form state
  const [qTitle, setQTitle] = useState('');
  const [qContent, setQContent] = useState('');
  const [qCategory, setQCategory] = useState<CommunityQuestion['category']>('admin');
  const [qAuthorName, setQAuthorName] = useState('');
  const [qAuthorContact, setQAuthorContact] = useState('');
  const [submittingQ, setSubmittingQ] = useState(false);
  const [errorQ, setErrorQ] = useState<string | null>(null);

  // Quick reply state
  const [replyText, setReplyText] = useState<{ [qId: string]: string }>({});
  const [replyAuthor, setReplyAuthor] = useState<{ [qId: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  const filteredQuestions = questions.filter((q) => {
    const matchesCat = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim() || !qContent.trim() || !qAuthorName.trim()) {
      setErrorQ('Vui lòng nhập đầy đủ tiêu đề, nội dung và họ tên');
      return;
    }

    setSubmittingQ(true);
    setErrorQ(null);

    const catObj = QA_CATEGORIES.find((c) => c.value === qCategory);

    try {
      await submitQuestionApi({
        title: qTitle.trim(),
        content: qContent.trim(),
        authorName: qAuthorName.trim(),
        authorContact: qAuthorContact.trim(),
        category: qCategory,
        categoryLabel: catObj?.label || 'Hỏi đáp chung',
      });
      setShowQuestionModal(false);
      setQTitle('');
      setQContent('');
      setQAuthorName('');
      setQAuthorContact('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorQ(err.message || 'Lỗi gửi câu hỏi');
    } finally {
      setSubmittingQ(false);
    }
  };

  const handlePostAnswer = async (questionId: string) => {
    const content = replyText[questionId];
    const authorName = replyAuthor[questionId] || 'Người dân Khu phố 02';

    if (!content || !content.trim()) return;

    setSubmittingReply(questionId);

    try {
      await addAnswerApi(questionId, {
        authorName: authorName.trim(),
        content: content.trim(),
      });
      setReplyText({ ...replyText, [questionId]: '' });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi phản hồi');
    } finally {
      setSubmittingReply(null);
    }
  };

  return (
    <section id="qa-section" className="py-7 sm:py-9 bg-white border-b border-slate-200">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 pb-2.5 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/90 text-blue-900 border border-blue-200 text-[10.5px] font-bold mb-1">
              <HelpCircle className="w-3 h-3 text-blue-700" />
              <span>TƯƠNG TÁC &amp; GIẢI ĐÁP CỘNG ĐỒNG</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>HỎI ĐÁP DÂN CƯ &amp; TIỆN ÍCH SỐ</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {questions.length} câu hỏi
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Không gian trao đổi trực tiếp giữa nhân dân với Ban Điều hành Khu phố 02 về thủ tục hành chính, dịch vụ công và đời sống.
            </p>
          </div>

          <button
            onClick={() => setShowQuestionModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-200" />
            <span>Đặt câu hỏi cho Ban Điều hành</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm câu hỏi theo từ khóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {QA_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Chưa có câu hỏi nào trong danh mục này</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Người dân có thắc mắc về VNeID, làm giấy tờ cư trú, BHYT hoặc các vấn đề trong khu phố? Hãy gửi câu hỏi đầu tiên!
            </p>
            <button
              onClick={() => setShowQuestionModal(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Đặt câu hỏi ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              const hasAnswers = q.answers && q.answers.length > 0;
              const officialAnswer = q.answers?.find((a) => a.isOfficial);

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-xl border transition-all ${
                    q.isPinned
                      ? 'border-blue-300 bg-blue-50/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="p-5">
                    {/* Header tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {q.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-bold">
                          <Pin className="w-3 h-3 text-blue-700" />
                          Đã ghim
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                        {q.categoryLabel}
                      </span>
                      {hasAnswers ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {officialAnswer ? 'Ban Điều hành đã trả lời' : `${q.answers.length} phản hồi`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Chờ phản hồi
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">{formatVietnameseDate(q.createdAt)}</span>
                    </div>

                    {/* Question title and content */}
                    <h3 className="text-base font-bold text-slate-900 mb-1">{q.title}</h3>
                    <p className="text-xs text-slate-700 leading-relaxed mb-3">{q.content}</p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Người hỏi: <strong>{q.authorName}</strong></span>
                      </div>

                      <button
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline"
                      >
                        <span>{hasAnswers ? `Xem câu trả lời (${q.answers.length})` : 'Gửi câu trả lời'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded answers section */}
                  {isExpanded && (
                    <div className="bg-slate-50 p-5 border-t border-slate-200 rounded-b-xl space-y-4">
                      {q.answers && q.answers.length > 0 ? (
                        <div className="space-y-3">
                          {q.answers.map((ans) => (
                            <div
                              key={ans.id}
                              className={`p-3.5 rounded-xl border text-xs ${
                                ans.isOfficial
                                  ? 'bg-blue-50 border-blue-200 text-blue-950'
                                  : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5 font-bold">
                                  {ans.isOfficial ? (
                                    <>
                                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                                      <span className="text-blue-900">{ans.authorName}</span>
                                      <span className="px-1.5 py-0.2 rounded bg-blue-200 text-blue-800 text-[10px]">
                                        Chính thức
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <User className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{ans.authorName}</span>
                                    </>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400">{formatVietnameseDate(ans.createdAt)}</span>
                              </div>
                              <p className="leading-relaxed whitespace-pre-line">{ans.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 text-xs text-slate-500">
                          Chưa có câu trả lời nào cho câu hỏi này. Hãy là người đầu tiên chia sẻ thông tin!
                        </div>
                      )}

                      {/* Citizen quick reply input */}
                      <div className="pt-2 border-t border-slate-200 space-y-2">
                        <div className="text-xs font-bold text-slate-700">Đóng góp câu trả lời hoặc ý kiến:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Họ tên của bạn..."
                            value={replyAuthor[q.id] || ''}
                            onChange={(e) => setReplyAuthor({ ...replyAuthor, [q.id]: e.target.value })}
                            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Nhập nội dung phản hồi..."
                            value={replyText[q.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [q.id]: e.target.value })}
                            className="sm:col-span-2 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handlePostAnswer(q.id)}
                            disabled={submittingReply === q.id || !replyText[q.id]?.trim()}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-bold transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{submittingReply === q.id ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Đặt câu hỏi mới */}
        {showQuestionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
              <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-200" />
                  <h3 className="text-base font-bold">ĐẶT CÂU HỎI MỚI</h3>
                </div>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePostQuestion} className="p-6 space-y-4">
                {errorQ && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                    {errorQ}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chủ đề hỏi đáp <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="admin">Thủ tục hành chính (Khai sinh, kết hôn, cư trú, đất đai)</option>
                    <option value="utility">Tiện ích & Dịch vụ số (VNeID, DVC Quốc gia, VssID, 1022)</option>
                    <option value="residence">Cư trú & Đời sống dân sinh (Vệ sinh, tiếng ồn, điện nước)</option>
                    <option value="security">An ninh trật tự & PCCC</option>
                    <option value="other">Chủ đề khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiêu đề câu hỏi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tóm tắt ngắn gọn thắc mắc của bạn..."
                    value={qTitle}
                    onChange={(e) => setQTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nội dung câu hỏi chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Mô tả cụ thể trường hợp của bạn để Ban Điều hành hoặc bà con hỗ trợ chính xác nhất..."
                    value={qContent}
                    onChange={(e) => setQContent(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên của bạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={qAuthorName}
                      onChange={(e) => setQAuthorName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Số điện thoại / Email (tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="Để nhận thông báo khi có trả lời"
                      value={qAuthorContact}
                      onChange={(e) => setQAuthorContact(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQ}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    {submittingQ ? 'Đang gửi...' : 'Gửi câu hỏi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
