export interface PaystackInitParams {
  amountCents: number;
  email: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export async function initializeDirectPaystack(params: PaystackInitParams): Promise<string> {
  const API_BASE_URL =
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'https://crysgarage.studio/api'
      : ((import.meta as any).env?.VITE_API_URL || 'https://crysgarage.studio/api');

  const response = await fetch(`${API_BASE_URL}/payments/initialize?t=${Date.now()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      amount: params.amountCents,
      email: params.email,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata || {},
    }),
  });

  const data = await response.json().catch(() => ({} as any));
  if (!response.ok) {
    // Try client-side fallback if server returns gateway error
    try {
      await startClientSidePaystack(params);
      return 'inline_redirect';
    } catch (e: any) {
      throw new Error(data?.message || e?.message || `HTTP ${response.status}`);
    }
  }
  // Debug log to aid diagnosis
  try { console.log('Paystack initialize response:', data); } catch {}
  // Expect unified backend shape
  const url = data?.data?.authorization_url || null;
  if (!url) {
    // Fallback to inline checkout
    await startClientSidePaystack(params);
    return 'inline_redirect';
  }
  return url;
}

async function startClientSidePaystack(params: PaystackInitParams): Promise<void> {
  await ensurePaystackScript();
  const envKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
  const publicKey = (envKey && envKey.startsWith('pk_live_'))
    ? envKey
    : 'pk_live_758b91bb9938f2b5af9566310736507e76e3bc6f';
  try {
    const masked = publicKey ? publicKey.slice(0, 7) + '...' : 'undefined';
    console.log('Using Paystack public key:', masked);
  } catch {}
  if (!publicKey) throw new Error('Missing Paystack public key');
  const handler = (window as any).PaystackPop?.setup({
    key: publicKey,
    email: params.email,
    amount: params.amountCents,
    ref: params.reference,
    callback: () => { try { window.location.href = params.callbackUrl; } catch {} },
    onClose: () => {}
  });
  if (!handler) throw new Error('Unable to load Paystack checkout');
  handler.openIframe();
}

function ensurePaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).PaystackPop !== 'undefined') return resolve();
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
}


