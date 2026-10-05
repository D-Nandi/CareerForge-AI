/**
 * CareerForge AI — Pricing & Checkout Page Controller
 * Conforms strictly to AGENTS.md standards: IIFE, api.js, auth.js, toast.js.
 */
(function () {
  'use strict';

  // State
  let currentBillingCycle = 'annual'; // 'monthly' | 'annual'
  let pendingCheckout = null;

  // DOM Elements
  const btnMonthly = document.getElementById('btnMonthlyBilling');
  const btnAnnual = document.getElementById('btnAnnualBilling');
  const saveBadge = document.getElementById('saveBadge');
  
  const proAmountEl = document.getElementById('proAmount');
  const proPeriodEl = document.getElementById('proPeriod');
  const proSubtextEl = document.getElementById('proSubtext');

  const plusAmountEl = document.getElementById('plusAmount');
  const plusPeriodEl = document.getElementById('plusPeriod');
  const plusSubtextEl = document.getElementById('plusSubtext');

  const btnUpgradePro = document.getElementById('btnUpgradePro');
  const btnUpgradePlus = document.getElementById('btnUpgradePlus');
  const btnFreeCta = document.getElementById('btnFreeCta');

  // Checkout modal elements
  const simModal = document.getElementById('simulatedCheckoutModal');
  const btnSimClose = document.getElementById('btnSimClose');
  const btnCancelCheckout = document.getElementById('btnCancelCheckout');
  const btnConfirmPayment = document.getElementById('btnConfirmPayment');
  const modalPlanBadge = document.getElementById('modalPlanBadge');
  const checkoutPlanName = document.getElementById('checkoutPlanName');
  const checkoutBillingCycle = document.getElementById('checkoutBillingCycle');
  const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');

  // Auth modal
  const authModal = document.getElementById('authPromptModal');
  const btnAuthClose = document.getElementById('btnAuthClose');

  const PRICING_DATA = {
    monthly: {
      pro: { amount: '299', period: '/ month', subtext: 'Billed monthly · Cancel anytime' },
      career_plus: { amount: '549', period: '/ month', subtext: 'Billed monthly · Cancel anytime' }
    },
    annual: {
      pro: { amount: '1,999', period: '/ year', subtext: 'Equivalent to ₹166/month (Save 44%)' },
      career_plus: { amount: '3,499', period: '/ year', subtext: 'Equivalent to ₹291/month (Save 47%)' }
    }
  };

  async function init() {
    bindEvents();
    initFAQ();
    checkUrlParams();
    await syncUserTierState();
  }

  function bindEvents() {
    if (btnMonthly && btnAnnual) {
      btnMonthly.addEventListener('click', () => setBillingCycle('monthly'));
      btnAnnual.addEventListener('click', () => setBillingCycle('annual'));
    }

    if (btnUpgradePro) {
      btnUpgradePro.addEventListener('click', () => handleUpgradeClick('pro'));
    }

    if (btnUpgradePlus) {
      btnUpgradePlus.addEventListener('click', () => handleUpgradeClick('career_plus'));
    }

    if (btnSimClose) btnSimClose.addEventListener('click', closeCheckoutModal);
    if (btnCancelCheckout) btnCancelCheckout.addEventListener('click', closeCheckoutModal);
    if (btnAuthClose) btnAuthClose.addEventListener('click', closeAuthModal);

    if (btnConfirmPayment) {
      btnConfirmPayment.addEventListener('click', executeSimulatedPayment);
    }

    // Payment method selector buttons
    const methodBtns = document.querySelectorAll('.method-btn');
    methodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        methodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  }

  function setBillingCycle(cycle) {
    currentBillingCycle = cycle;
    if (cycle === 'monthly') {
      btnMonthly.classList.add('active');
      btnMonthly.setAttribute('aria-checked', 'true');
      btnAnnual.classList.remove('active');
      btnAnnual.setAttribute('aria-checked', 'false');
      if (saveBadge) saveBadge.style.opacity = '0.4';
    } else {
      btnAnnual.classList.add('active');
      btnAnnual.setAttribute('aria-checked', 'true');
      btnMonthly.classList.remove('active');
      btnMonthly.setAttribute('aria-checked', 'false');
      if (saveBadge) saveBadge.style.opacity = '1';
    }

    const data = PRICING_DATA[cycle];
    if (proAmountEl) proAmountEl.textContent = data.pro.amount;
    if (proPeriodEl) proPeriodEl.textContent = data.pro.period;
    if (proSubtextEl) proSubtextEl.textContent = data.pro.subtext;

    if (plusAmountEl) plusAmountEl.textContent = data.career_plus.amount;
    if (plusPeriodEl) plusPeriodEl.textContent = data.career_plus.period;
    if (plusSubtextEl) plusSubtextEl.textContent = data.career_plus.subtext;
  }

  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTier = urlParams.get('tier');

    if (requestedTier === 'career_plus') {
      const card = document.getElementById('cardCareerPlus');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.outline = '2px solid var(--accent)';
      }
    } else if (requestedTier === 'pro') {
      const card = document.getElementById('cardPro');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  async function syncUserTierState() {
    try {
      const user = await window.auth.checkSession();
      if (!user) return;

      const currentTier = user.tier || 'free';

      if (currentTier === 'pro') {
        if (btnFreeCta) {
          btnFreeCta.textContent = 'Included';
        }
        if (btnUpgradePro) {
          btnUpgradePro.textContent = 'Current Plan ✓';
          btnUpgradePro.classList.remove('btn-primary');
          btnUpgradePro.classList.add('btn-outline');
          btnUpgradePro.disabled = true;
        }
        if (btnUpgradePlus) {
          btnUpgradePlus.textContent = 'Upgrade to Career+ →';
        }
      } else if (currentTier === 'career_plus') {
        if (btnFreeCta) btnFreeCta.textContent = 'Included';
        if (btnUpgradePro) {
          btnUpgradePro.textContent = 'Included';
          btnUpgradePro.classList.remove('btn-primary');
          btnUpgradePro.classList.add('btn-ghost');
          btnUpgradePro.disabled = true;
        }
        if (btnUpgradePlus) {
          btnUpgradePlus.textContent = 'Active Plan ✓';
          btnUpgradePlus.classList.remove('btn-secondary');
          btnUpgradePlus.classList.add('btn-outline');
          btnUpgradePlus.disabled = true;
        }
      }
    } catch (e) {
      console.warn('Could not sync user session:', e);
    }
  }

  async function handleUpgradeClick(targetTier) {
    if (!window.auth.isLoggedIn()) {
      openAuthModal();
      return;
    }

    const btn = targetTier === 'pro' ? btnUpgradePro : btnUpgradePlus;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Preparing Order...';

    try {
      const orderRes = await window.api.post('/api/payments/create-order', {
        tier: targetTier,
        billingCycle: currentBillingCycle
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      pendingCheckout = {
        tier: targetTier,
        billingCycle: currentBillingCycle,
        orderId: orderRes.orderId,
        amount: orderRes.amount,
        amountInRupees: orderRes.amountInRupees,
        isSimulated: orderRes.isSimulated,
        keyId: orderRes.keyId,
        user: orderRes.user
      };

      // Check if live Razorpay SDK and valid non-placeholder key is ready
      const hasLiveRazorpay = window.Razorpay && orderRes.keyId && !orderRes.isSimulated && !orderRes.keyId.includes('simulated');

      if (hasLiveRazorpay) {
        launchRazorpayCheckout(pendingCheckout);
      } else {
        // Launch Simulated Checkout modal
        openCheckoutModal(pendingCheckout);
      }
    } catch (err) {
      if (window.toast) {
        window.toast.error(err.message || 'Payment initiation failed.');
      } else {
        alert(err.message || 'Payment initiation failed.');
      }
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  function launchRazorpayCheckout(orderData) {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: 'INR',
      name: 'CareerForge AI',
      description: `${orderData.tier === 'career_plus' ? 'Career+' : 'Pro'} Plan (${orderData.billingCycle})`,
      order_id: orderData.orderId,
      prefill: {
        name: orderData.user?.name || '',
        email: orderData.user?.email || ''
      },
      theme: {
        color: '#6c5ce7'
      },
      handler: async function (response) {
        await verifyPaymentOnServer({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          tier: orderData.tier,
          billingCycle: orderData.billingCycle,
          isSimulated: false
        });
      },
      modal: {
        ondismiss: function () {
          if (window.toast) window.toast.info('Payment checkout closed.');
        }
      }
    };

    const rzpInstance = new window.Razorpay(options);
    rzpInstance.open();
  }

  function openCheckoutModal(orderData) {
    if (modalPlanBadge) {
      modalPlanBadge.textContent = orderData.tier === 'career_plus' ? 'Career+ Accelerator' : 'Pro Tier';
      modalPlanBadge.className = orderData.tier === 'career_plus' ? 'badge badge-warning' : 'badge badge-primary';
    }

    if (checkoutPlanName) {
      checkoutPlanName.textContent = `${orderData.tier === 'career_plus' ? 'Career+ Accelerator' : 'CareerForge Pro'} (${orderData.billingCycle})`;
    }

    if (checkoutBillingCycle) {
      checkoutBillingCycle.textContent = orderData.billingCycle === 'annual' ? 'Annual (1 Year · Best Value)' : 'Monthly (30 Days)';
    }

    if (checkoutTotalAmount) {
      checkoutTotalAmount.textContent = `₹${orderData.amountInRupees.toLocaleString('en-IN')}`;
    }

    if (window.modal) {
      window.modal.open('simulatedCheckoutModal');
    } else if (simModal) {
      simModal.classList.add('visible');
    }
  }

  function closeCheckoutModal() {
    if (window.modal) {
      window.modal.close('simulatedCheckoutModal');
    } else if (simModal) {
      simModal.classList.remove('visible');
    }
  }

  function openAuthModal() {
    if (window.modal) {
      window.modal.open('authPromptModal');
    } else if (authModal) {
      authModal.classList.add('visible');
    }
  }

  function closeAuthModal() {
    if (window.modal) {
      window.modal.close('authPromptModal');
    } else if (authModal) {
      authModal.classList.remove('visible');
    }
  }

  async function executeSimulatedPayment() {
    if (!pendingCheckout) return;

    btnConfirmPayment.disabled = true;
    btnConfirmPayment.textContent = 'Processing Payment...';

    try {
      await verifyPaymentOnServer({
        razorpayOrderId: pendingCheckout.orderId,
        razorpayPaymentId: `pay_sim_${Date.now()}`,
        razorpaySignature: 'simulated_test_sig',
        tier: pendingCheckout.tier,
        billingCycle: pendingCheckout.billingCycle,
        isSimulated: true
      });
    } finally {
      btnConfirmPayment.disabled = false;
      btnConfirmPayment.textContent = 'Complete Payment & Activate Plan';
      closeCheckoutModal();
    }
  }

  async function verifyPaymentOnServer(payload) {
    try {
      const verifyRes = await window.api.post('/api/payments/verify', payload);

      if (verifyRes.success) {
        if (verifyRes.user) {
          window.auth.setUser(verifyRes.user);
        }

        if (window.toast) {
          window.toast.success(verifyRes.message || 'Payment successful! Plan upgraded.');
        }

        // Celebrate and redirect to dashboard after short delay
        setTimeout(() => {
          window.location.href = 'dashboard.html?upgraded=true';
        }, 1500);
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed');
      }
    } catch (err) {
      if (window.toast) {
        window.toast.error(err.message || 'Verification failed. Please contact support.');
      } else {
        alert(err.message || 'Verification failed.');
      }
    }
  }

  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        // Close others
        faqItems.forEach(other => {
          other.classList.remove('is-open');
          const t = other.querySelector('.faq-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
