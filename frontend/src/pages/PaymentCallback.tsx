import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { verifyZarinpalPayment } from '@/lib/store';

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const [state, setState] = useState<'loading' | 'success' | 'failed'>('loading');
  const [refId, setRefId] = useState<string>();

  useEffect(() => {
    const authority = params.get('Authority') || params.get('authority') || '';
    const status = params.get('Status') || params.get('status') || '';
    const orderNumber = params.get('order') || '';
    if (!authority || !orderNumber) { setState('failed'); return; }
    verifyZarinpalPayment(authority, status, orderNumber)
      .then((result) => { setRefId(result.refId); setState(result.ok ? 'success' : 'failed'); })
      .catch(() => setState('failed'));
  }, [params]);

  return <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
    {state === 'loading' && <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />}
    {state === 'success' && <CheckCircle2 className="w-20 h-20 text-primary mx-auto" />}
    {state === 'failed' && <XCircle className="w-20 h-20 text-destructive mx-auto" />}
    <h1 className="text-3xl font-black">{state === 'loading' ? 'در حال بررسی پرداخت…' : state === 'success' ? 'پرداخت با موفقیت تأیید شد' : 'پرداخت تأیید نشد'}</h1>
    {refId && <p className="text-muted-foreground">کد پیگیری پرداخت: <span dir="ltr" className="font-bold">{refId}</span></p>}
    {state !== 'loading' && <Link to="/shop" className="btn-gold rounded-full px-8 py-3 inline-block">بازگشت به فروشگاه</Link>}
  </div>;
}
