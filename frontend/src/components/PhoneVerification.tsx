import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeIranPhone, requestOtp, verifyOtp, isPhoneVerified } from '@/lib/store';

interface Props {
  phone: string;
  onVerified: () => void;
}

/** Mandatory phone verification gate (§3.2 of the master prompt). Renders
 * nothing once the given phone is already verified this session. */
export default function PhoneVerification({ phone, onVerified }: Props) {
  const [stage, setStage] = useState<'idle' | 'sent' | 'verifying'>('idle');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);

  if (isPhoneVerified(phone)) return null;

  const normalized = normalizeIranPhone(phone);

  async function sendCode() {
    if (!normalized) {
      toast.error('شماره موبایل معتبر نیست (مثال: ۰۹۱۲۲۶۴۰۹۷۹)');
      return;
    }
    setSending(true);
    try {
      await requestOtp(normalized);
      setStage('sent');
      toast.success('کد تایید ارسال شد');
    } catch (err) {
      console.error(err);
      toast.error('ارسال کد ناموفق بود. دوباره تلاش کنید.');
    } finally {
      setSending(false);
    }
  }

  async function confirmCode() {
    if (!normalized || code.length !== 5) return;
    setStage('verifying');
    try {
      const ok = await verifyOtp(normalized, code);
      if (ok) {
        toast.success('شماره شما تایید شد');
        onVerified();
      } else {
        toast.error('کد وارد شده نادرست یا منقضی است');
        setStage('sent');
      }
    } catch (err) {
      console.error(err);
      toast.error('خطا در بررسی کد. دوباره تلاش کنید.');
      setStage('sent');
    }
  }

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold">
        <ShieldCheck className="w-4 h-4 text-primary" />
        تایید شماره موبایل الزامی است
      </div>
      <p className="text-xs text-muted-foreground leading-6">
        برای ثبت نهایی سفارش، ابتدا شماره موبایل خود را با کد پیامکی تایید کنید.
      </p>

      <AnimatePresence mode="wait">
        {stage === 'idle' && (
          <motion.button
            key="send"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={sendCode}
            disabled={sending}
            className="btn-gold w-full rounded-full py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending && <Loader2 className="w-4 h-4 animate-spin" />}
            ارسال کد تایید به {normalized ?? phone}
          </motion.button>
        )}

        {(stage === 'sent' || stage === 'verifying') && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex justify-center" dir="ltr">
              <InputOTP maxLength={5} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button
              type="button"
              onClick={confirmCode}
              disabled={code.length !== 5 || stage === 'verifying'}
              className="btn-gold w-full rounded-full py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {stage === 'verifying' && <Loader2 className="w-4 h-4 animate-spin" />}
              تایید کد
            </button>
            <button type="button" onClick={sendCode} className="w-full text-xs text-muted-foreground hover:text-primary">
              ارسال مجدد کد
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
