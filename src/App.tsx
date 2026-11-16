import React, { useState, useEffect } from 'react';
import { PaymentItem, AgreementMeta } from './types';
import { INITIAL_AGREEMENT, INITIAL_PAYMENTS } from './data/initialData';
import { Header } from './components/Header';
import { OverviewCard } from './components/OverviewCard';
import { MayaAccountCard } from './components/MayaAccountCard';
import { PaymentCard } from './components/PaymentCard';
import { ReferenceLogView } from './components/ReferenceLogView';
import { OfficialDocumentView } from './components/OfficialDocumentView';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { PaymentStatusModal } from './components/PaymentStatusModal';
import { BottomNav, TabType } from './components/BottomNav';
import { formatCurrency } from './utils/formatters';
import {
  subscribeToPayments,
  subscribeToAgreement,
  updatePaymentGlobal,
  updateAgreementGlobal,
  resetAllDataGlobal,
} from './firebase';
import { RotateCcw, CheckCircle, ShieldCheck } from 'lucide-react';

const STORAGE_KEY_PAYMENTS = 'maya_payment_schedule_payments_v2';
const STORAGE_KEY_META = 'maya_payment_schedule_meta_v2';
const STORAGE_KEY_ADMIN = 'maya_payment_schedule_admin_v2';

export default function App() {
  // Load persisted cache or initial seed for instant 0ms first render
  const [agreement, setAgreement] = useState<AgreementMeta>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_META);
      return saved ? JSON.parse(saved) : INITIAL_AGREEMENT;
    } catch {
      return INITIAL_AGREEMENT;
    }
  });

  const [payments, setPayments] = useState<PaymentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAYMENTS);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_ADMIN) === 'true';
    } catch {
      return false;
    }
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  // Modals & Pending Action state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminTargetAction, setAdminTargetAction] = useState<string>('');
  const [pendingActionAfterAdmin, setPendingActionAfterAdmin] = useState<(() => void) | null>(null);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedPaymentForModal, setSelectedPaymentForModal] = useState<PaymentItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Real-time Firestore synchronization for payments and agreement
  useEffect(() => {
    const unsubPayments = subscribeToPayments(
      (remotePayments) => {
        if (remotePayments && remotePayments.length > 0) {
          setPayments(remotePayments);
          setIsCloudSynced(true);
        }
      },
      (err) => {
        console.warn('Real-time payment subscription error:', err);
      }
    );

    const unsubAgreement = subscribeToAgreement(
      (remoteAgreement) => {
        if (remoteAgreement) {
          setAgreement(remoteAgreement);
          setIsCloudSynced(true);
        }
      },
      (err) => {
        console.warn('Real-time agreement subscription error:', err);
      }
    );

    return () => {
      unsubPayments();
      unsubAgreement();
    };
  }, []);

  // Sync cache with localStorage for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(payments));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(agreement));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [agreement]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_ADMIN, isAdmin ? 'true' : 'false');
    } catch (e) {
      console.warn('Session sync failed', e);
    }
  }, [isAdmin]);

  // Unlock Admin handler
  const handleAdminSuccess = () => {
    setIsAdmin(true);
    showToast('Admin access unlocked');
    if (pendingActionAfterAdmin) {
      pendingActionAfterAdmin();
      setPendingActionAfterAdmin(null);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      showToast('Admin locked');
    } else {
      setAdminTargetAction('Enable Admin Management');
      setPendingActionAfterAdmin(null);
      setAdminModalOpen(true);
    }
  };

  const requestAdminAction = (actionDesc: string, onAuthorized?: () => void) => {
    if (isAdmin) {
      if (onAuthorized) onAuthorized();
    } else {
      setAdminTargetAction(actionDesc);
      setPendingActionAfterAdmin(() => onAuthorized || null);
      setAdminModalOpen(true);
    }
  };

  // Direct switch toggle for a month
  const handleTogglePaymentStatus = (payment: PaymentItem) => {
    if (!isAdmin) {
      const nextStatus = payment.status === 'Paid' ? 'Pending' : 'Paid';
      requestAdminAction(`Mark #${payment.monthNum} as ${nextStatus}`, () => {
        setSelectedPaymentForModal(payment);
        setStatusModalOpen(true);
      });
      return;
    }

    // If already admin, open status modal to update reference/date
    setSelectedPaymentForModal(payment);
    setStatusModalOpen(true);
  };

  // Save updated payment from modal or reference log — saved globally to Firestore!
  const handleSavePayment = async (updated: PaymentItem) => {
    // 1. Optimistic instant local update
    setPayments((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    showToast(`Payment #${updated.monthNum} globally saved`);

    // 2. Persist to Firestore database
    try {
      await updatePaymentGlobal(updated);
    } catch (err) {
      console.error('Failed to update payment globally:', err);
    }
  };

  // Quick pay next pending
  const handleQuickPayNext = () => {
    const nextPending = payments.find((p) => p.status === 'Pending');
    if (!nextPending) return;

    if (!isAdmin) {
      requestAdminAction(`Mark #${nextPending.monthNum} as Paid`, () => {
        setSelectedPaymentForModal(nextPending);
        setStatusModalOpen(true);
      });
    } else {
      setSelectedPaymentForModal(nextPending);
      setStatusModalOpen(true);
    }
  };

  // Update Maya Receiver Number — saved globally to Firestore!
  const handleUpdateMayaNumber = async (newNumber: string) => {
    const updated = {
      ...agreement,
      receiverMayaNumber: newNumber,
    };
    setAgreement(updated);
    showToast('Receiver Maya account number globally saved');

    try {
      await updateAgreementGlobal(updated);
    } catch (err) {
      console.error('Failed to save Maya number globally:', err);
    }
  };

  // Reset to original PDF globally
  const handleResetData = async () => {
    const executeReset = async () => {
      if (window.confirm('Reset all payments and references to initial PDF state globally for all users?')) {
        setPayments(INITIAL_PAYMENTS);
        setAgreement(INITIAL_AGREEMENT);
        showToast('Resetting global schedule...');
        try {
          await resetAllDataGlobal();
          showToast('Data reset to original agreement globally');
        } catch (err) {
          console.error('Failed to reset global data:', err);
          showToast('Data reset locally');
        }
      }
    };

    if (!isAdmin) {
      requestAdminAction('Reset all schedule data globally', executeReset);
      return;
    }

    await executeReset();
  };

  // Print PDF
  const handlePrint = () => {
    window.print();
  };

  // Share summary
  const handleShare = () => {
    const paidList = payments.filter((p) => p.status === 'Paid');
    const totalPaid = paidList.reduce((sum, p) => sum + p.amount, 0);
    const nextPending = payments.find((p) => p.status === 'Pending');

    const summaryText = [
      `Official Payment Schedule Summary:`,
      `Payer: ${agreement.payer}`,
      `Receiver: ${agreement.receiver}`,
      `Method: ${agreement.currency} ${agreement.currencySymbol} via Maya (${agreement.receiverMayaNumber})`,
      `Progress: ${paidList.length} of ${payments.length} Months Paid (${formatCurrency(totalPaid)} / ${formatCurrency(agreement.totalAmount)})`,
      nextPending ? `Next Due: #${nextPending.monthNum} on ${nextPending.dueDate} (${formatCurrency(nextPending.amount)})` : 'Status: All 6 installments fully settled!',
      `Live Tracking: ${window.location.href}`,
    ].join('\n');

    navigator.clipboard.writeText(summaryText);
    showToast('Payment summary copied to clipboard');
  };

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    if (statusFilter === 'paid') return p.status === 'Paid';
    if (statusFilter === 'pending') return p.status === 'Pending';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20 sm:pb-12 selection:bg-emerald-500 selection:text-white">
      {/* Top Header with live Global Sync badge */}
      <Header
        isAdmin={isAdmin}
        onAdminToggle={handleAdminToggle}
        onPrint={handlePrint}
        onShare={handleShare}
        isCloudSynced={isCloudSynced}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* KPI & Summary Overview */}
        <OverviewCard
          meta={agreement}
          payments={payments}
          isAdmin={isAdmin}
          onLockAdmin={() => setIsAdmin(false)}
          onQuickPayNext={handleQuickPayNext}
        />

        {/* Receiver Maya Card */}
        <MayaAccountCard
          receiverName={agreement.receiverMayaName}
          mayaNumber={agreement.receiverMayaNumber}
          isAdmin={isAdmin}
          onUpdateMayaNumber={handleUpdateMayaNumber}
        />

        {/* View Switcher Tabs (Desktop & Tablet) */}
        <div className="no-print hidden sm:flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'schedule'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Installment Schedule
            </button>
            <button
              onClick={() => setActiveTab('reference')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'reference'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transaction & Ref Log
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'document'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Official Document (PDF)
            </button>
          </div>

          {/* Optional Reset Button in Admin mode */}
          {isAdmin && (
            <button
              onClick={handleResetData}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Globally</span>
            </button>
          )}
        </div>

        {/* TAB 1: SCHEDULE VIEW */}
        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter controls */}
            <div className="no-print flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-500 mr-1 hidden xs:inline">Filter:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  All (6)
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === 'pending'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Pending ({payments.filter((p) => p.status === 'Pending').length})
                </button>
                <button
                  onClick={() => setStatusFilter('paid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === 'paid'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Paid ({payments.filter((p) => p.status === 'Paid').length})
                </button>
              </div>

              {!isAdmin && (
                <button
                  onClick={() => requestAdminAction('Unlock Admin')}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin switch locked</span>
                </button>
              )}
            </div>

            {/* List of Payments */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  isAdmin={isAdmin}
                  onToggleStatus={handleTogglePaymentStatus}
                  onOpenEditModal={(p) => {
                    setSelectedPaymentForModal(p);
                    setStatusModalOpen(true);
                  }}
                />
              ))}

              {filteredPayments.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-semibold text-slate-500">
                    No installments match the selected filter.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REFERENCE LOG VIEW */}
        {activeTab === 'reference' && (
          <div className="animate-fade-in">
            <ReferenceLogView
              meta={agreement}
              payments={payments}
              isAdmin={isAdmin}
              onUpdatePayment={handleSavePayment}
              onRequestAdmin={(desc) => requestAdminAction(desc)}
            />
          </div>
        )}

        {/* TAB 3: OFFICIAL DOCUMENT PREVIEW */}
        {activeTab === 'document' && (
          <div className="animate-fade-in">
            <OfficialDocumentView
              meta={agreement}
              payments={payments}
              onPrint={handlePrint}
            />
          </div>
        )}

        {/* Print-only container that renders when user clicks Print in any tab */}
        <div className="print-only">
          <OfficialDocumentView
            meta={agreement}
            payments={payments}
            onPrint={handlePrint}
          />
        </div>
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <BottomNav
        currentTab={activeTab}
        onChangeTab={setActiveTab}
        isAdmin={isAdmin}
        onAdminClick={handleAdminToggle}
      />

      {/* Admin Password Modal */}
      <AdminPasswordModal
        isOpen={adminModalOpen}
        onClose={() => {
          setAdminModalOpen(false);
          setPendingActionAfterAdmin(null);
        }}
        onSuccess={handleAdminSuccess}
        targetActionDescription={adminTargetAction}
      />

      {/* Payment Status Modal (for marking paid and entering reference details) */}
      <PaymentStatusModal
        isOpen={statusModalOpen}
        payment={selectedPaymentForModal}
        onClose={() => {
          setStatusModalOpen(false);
          setSelectedPaymentForModal(null);
        }}
        onSave={handleSavePayment}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 pointer-events-auto animate-bounce-subtle">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
