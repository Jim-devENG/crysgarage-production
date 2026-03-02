export interface PaystackInitParams {
  amountCents: number;
  email: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export async function initializeDirectPaystack(params: PaystackInitParams): Promise<string> {
  // For TESTING we always use client-side Paystack with a TEST public key.
  // This bypasses any backend initialization that might be using live keys.
    await startClientSidePaystack(params);
    return 'inline_redirect';
}

async function startClientSidePaystack(params: PaystackInitParams): Promise<void> {
  await ensurePaystackScript();

  // PRODUCTION MODE: Using Paystack LIVE public key
  // IMPORTANT: This is the LIVE public key from your Paystack dashboard (pk_live_...)
  const publicKey = 'pk_live_758b91bb9938f2b5af9566310736507e76e3bc6f';

  try {
    const masked = publicKey ? publicKey.slice(0, 7) + '...' : 'undefined';
    console.log('🔧 PRODUCTION MODE: Using Paystack LIVE public key:', masked);
    console.log('🔧 Payment will use LIVE mode - real charges will be made');
  } catch {}
  if (!publicKey) throw new Error('Missing Paystack public key');

  // Production mode - real payments
  const isTestMode = false;

  const handler = (window as any).PaystackPop?.setup({
    key: publicKey,
    email: params.email,
    amount: params.amountCents,
    ref: params.reference,
    // Configure payment channels - for testing, show only card payments
    // For production, you can remove this or set to ['card', 'bank', 'ussd', 'qr', 'mobile_money']
    channels: isTestMode ? ['card'] : ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
    // Currency - NGN for Nigerian Naira
    currency: 'NGN',
    callback: (response: any) => { 
      try { 
        // Prefer reference from Paystack response, fall back to the one we generated
        const ref = response?.reference || params.reference;
        const url = new URL(params.callbackUrl, window.location.origin);
        if (ref) {
          url.searchParams.set('reference', ref);
        }
        window.location.href = url.toString(); 
      } catch (err) { 
        console.error('Error redirecting after Paystack payment:', err);
      try { 
        window.location.href = params.callbackUrl; 
      } catch {} 
      } 
    },
    onClose: () => {
      // Payment was cancelled - prevent any download
      // The modal will remain open, forcing user to complete payment
      console.log('Payment cancelled - download blocked');
      // Don't show alert here as it's handled by the modal
      // The modal itself has no close button, so user must complete payment
    }
  });
  if (!handler) throw new Error('Unable to load Paystack checkout');
  handler.openIframe();
}

export interface PaystackInlineParams {
  amountCents: number;
  email: string;
  reference: string;
  onSuccess: (response: any) => void;
  onClose: () => void;
  metadata?: Record<string, any>;
}

export async function initializeDirectPaystackInline(params: PaystackInlineParams): Promise<void> {
  await ensurePaystackScript();

  // PRODUCTION MODE: Using Paystack LIVE public key
  const publicKey = 'pk_live_758b91bb9938f2b5af9566310736507e76e3bc6f';

  if (!publicKey) throw new Error('Missing Paystack public key');

  // Production mode - real payments
  const isTestMode = false;

  const handler = (window as any).PaystackPop?.setup({
    key: publicKey,
    email: params.email,
    amount: params.amountCents,
    ref: params.reference,
    channels: isTestMode ? ['card'] : ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
    currency: 'NGN',
    metadata: params.metadata || {},
    callback: (response: any) => {
      console.log('✅ Paystack payment successful:', response);
      params.onSuccess(response);
    },
    onClose: () => {
      console.log('Payment cancelled');
      params.onClose();
    }
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


