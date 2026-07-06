'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
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

export function PaywallModal({
  open,
  onClose,
  contentId,
  contentTitle,
  onUnlocked,
}: PaywallModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
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

  const subscribe = async () => {
    setLoading(true);
    setError('');
    const init = await apiFetch<{ gatewayRef: string }>('/payment/subscribe/PREMIUM', {
      method: 'POST',
    });
    if (!init.success || !init.data?.gatewayRef) {
      setError(init.error?.message || 'خطا در شروع پرداخت');
      setLoading(false);
      return;
    }
    const verify = await apiFetch('/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ gatewayRef: init.data.gatewayRef }),
    });
    setLoading(false);
    if (verify.success) {
      onUnlocked?.();
      onClose();
    } else {
      setError(verify.error?.message || 'خطا در تأیید پرداخت');
    }
  };

  const purchaseContent = async () => {
    if (!contentId) return;
    setLoading(true);
    setError('');
    const init = await apiFetch<{ gatewayRef: string }>(`/payment/purchase/${contentId}`, {
      method: 'POST',
    });
    if (!init.success || !init.data?.gatewayRef) {
      setError(init.error?.message || 'خطا در شروع خرید');
      setLoading(false);
      return;
    }
    const verify = await apiFetch('/payment/purchase/verify', {
      method: 'POST',
      body: JSON.stringify({ gatewayRef: init.data.gatewayRef }),
    });
    setLoading(false);
    if (verify.success) {
      onUnlocked?.();
      onClose();
    } else {
      setError(verify.error?.message || 'خطا در تأیید خرید');
    }
  };

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
          <button type="button" className="btn-primary paywall-cta" onClick={subscribe} disabled={loading}>
            {loading ? 'در حال پردازش…' : 'خرید اشتراک پریمیوم'}
          </button>
        </div>

        {contentId ? (
          <button
            type="button"
            className="btn-secondary paywall-secondary"
            onClick={purchaseContent}
            disabled={loading}
          >
            خرید تکی این محتوا
          </button>
        ) : null}

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <p className="paywall-footnote">
          درگاه پرداخت در نسخه MVP شبیه‌سازی شده است. برای ادامه{' '}
          <Link href="/login">وارد شوید</Link>.
        </p>
      </div>
    </div>
  );
}
