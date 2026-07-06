'use client';

import { useCallback, useEffect, useState } from 'react';
import { SUBSCRIPTION_PLANS } from '@castaminofen/shared';
import { apiFetch } from '@/lib/api';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  contentId?: string;
  contentTitle?: string;
  onUnlocked?: () => void;
}

type Plan = { id: string; name: string; price: number; currency: string };

type PaymentSession = {
  gatewayRef: string;
  gatewayUrl: string;
  amount: number;
  currency: string;
  type: 'SUBSCRIBE' | 'PURCHASE';
};

export function PaywallModal({
  open,
  onClose,
  contentId,
  contentTitle,
  onUnlocked,
}: PaywallModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setSuccess('');
    setSession(null);
    apiFetch<Plan[]>('/payment/plans').then((res) => {
      if (res.data) setPlans(res.data);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const openGateway = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const createSession = useCallback(
    async (path: string, type: 'SUBSCRIBE' | 'PURCHASE') => {
      setLoading(true);
      setError('');
      setSuccess('');

      const paymentWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (!paymentWindow) {
        setError('باز کردن درگاه پرداخت امکان‌پذیر نیست. لطفاً تنظیمات مرورگر را بررسی کنید.');
        setLoading(false);
        return;
      }

      const init = await apiFetch<{
        gatewayRef: string;
        gatewayUrl: string;
        amount: number;
        currency: string;
      }>(path, { method: 'POST' });

      if (!init.success || !init.data?.gatewayRef || !init.data?.gatewayUrl) {
        paymentWindow.close();
        setError(init.error?.message || 'خطا در شروع پرداخت');
        setLoading(false);
        return;
      }

      setSession({
        gatewayRef: init.data.gatewayRef,
        gatewayUrl: init.data.gatewayUrl,
        amount: init.data.amount,
        currency: init.data.currency,
        type,
      });
      setLoading(false);
      paymentWindow.location.href = init.data.gatewayUrl;
    },
    [],
  );

  const subscribe = useCallback(async () => {
    await createSession('/payment/subscribe/PREMIUM', 'SUBSCRIBE');
  }, [createSession]);

  const purchaseContent = useCallback(async () => {
    if (!contentId) return;
    await createSession(`/payment/purchase/${contentId}`, 'PURCHASE');
  }, [contentId, createSession]);

  const verifyPayment = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const path = session.type === 'SUBSCRIBE' ? '/payment/verify' : '/payment/purchase/verify';
    const verify = await apiFetch<{ verified: boolean }>(path, {
      method: 'POST',
      body: JSON.stringify({ gatewayRef: session.gatewayRef }),
    });

    setLoading(false);
    if (verify.success) {
      setSuccess('پرداخت با موفقیت تأیید شد. اکنون دسترسی فعال است.');
      onUnlocked?.();
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setError(verify.error?.message || 'خطا در تأیید پرداخت');
    }
  }, [onClose, onUnlocked, session]);

  if (!open) return null;

  const premiumPlan = plans.find((p) => p.id === 'PREMIUM');
  const premiumPrice = premiumPlan?.price ?? SUBSCRIPTION_PLANS.PREMIUM.price;

  return (
    <div className="paywall-backdrop" role="presentation" onClick={onClose}>
      <div
        className="paywall-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="paywall-close" onClick={onClose} aria-label="بستن">
          ×
        </button>
        <h2 id="paywall-title" className="paywall-title">
          محتوای پریمیوم
        </h2>
        <p className="paywall-desc">
          {contentTitle
            ? `برای دسترسی به «${contentTitle}» اشتراک پریمیوم بگیرید یا محتوا را تکی خریداری کنید.`
            : 'برای پخش این محتوا به اشتراک پریمیوم نیاز دارید.'}
        </p>

        <div className="paywall-plan">
          <div className="paywall-plan-header">
            <span className="paywall-plan-name">پریمیوم</span>
            <span className="paywall-plan-price">
              {premiumPrice.toLocaleString('fa-IR')} تومان / ماه
            </span>
          </div>
          <ul className="paywall-features">
            <li>دسترسی به همه کتاب‌های صوتی و پادکست‌های پریمیوم</li>
            <li>پخش بدون محدودیت</li>
            <li>ادامه گوش دادن در همه دستگاه‌ها</li>
          </ul>
          <button type="button" className="btn-primary paywall-cta" onClick={subscribe} disabled={loading || !!session}>
            {loading ? 'در حال پردازش…' : session ? 'پرداخت آغاز شد' : 'خرید اشتراک پریمیوم'}
          </button>
        </div>

        {contentId ? (
          <button
            type="button"
            className="btn-secondary paywall-secondary"
            onClick={purchaseContent}
            disabled={loading || !!session}
          >
            {loading ? 'در حال پردازش…' : session ? 'پرداخت آغاز شد' : 'خرید تکی این محتوا'}
          </button>
        ) : null}

        {session ? (
          <div className="paywall-session">
            <p className="paywall-session-text">
              درگاه پرداخت باز شد. اگر به صورت خودکار باز نشد، روی دکمه زیر کلیک کنید.
            </p>
            <button
              type="button"
              className="btn-secondary paywall-secondary"
              onClick={() => openGateway(session.gatewayUrl)}
            >
              باز کردن درگاه پرداخت
            </button>
            <button
              type="button"
              className="btn-primary paywall-cta"
              onClick={verifyPayment}
              disabled={loading}
            >
              {loading ? 'در حال بررسی…' : 'تأیید پرداخت'}
            </button>
          </div>
        ) : null}

        {success ? (
          <p className="paywall-success" role="status">
            {success}
          </p>
        ) : null}
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <p className="paywall-footnote">
          برای ادامه پرداخت، درگاه باز می‌شود و پس از تکمیل روی «تأیید پرداخت» کلیک کنید.
        </p>
      </div>
    </div>
  );
}
