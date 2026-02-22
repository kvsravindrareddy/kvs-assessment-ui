import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import './PricingPage.css';

const PricingPage = ({ onClose }) => {
  const { user } = useAuth();
  const { subscriptionTier, SUBSCRIPTION_TIERS } = useSubscription();
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'

  const plans = [
    {
      id: SUBSCRIPTION_TIERS.STUDENT_INDIVIDUAL,
      name: 'Student Individual',
      icon: '💎',
      description: 'Perfect for individual learners',
      monthlyPrice: 9.99,
      annualPrice: 99,
      savings: 17,
      features: [
        '1 student account',
        'Unlimited assessments',
        'All reading materials',
        'All games (unlimited)',
        'AI tutor (100 questions/month)',
        'Progress reports & certificates',
        'Parent monitoring',
        'Mobile app access'
      ],
      popular: false,
      color: '#667eea'
    },
    {
      id: SUBSCRIPTION_TIERS.FAMILY_PLAN,
      name: 'Family Plan',
      icon: '👨‍👩‍👧‍👦',
      description: 'Great for families with multiple children',
      monthlyPrice: 19.99,
      annualPrice: 199,
      savings: 17,
      features: [
        'Up to 4 student accounts',
        'Everything in Student Individual',
        'AI tutor (300 questions/month)',
        'Family dashboard',
        'Sibling comparison reports',
        '2 parent accounts',
        'Priority support'
      ],
      popular: true,
      color: '#f093fb'
    },
    {
      id: SUBSCRIPTION_TIERS.TEACHER_BASIC,
      name: 'Teacher Basic',
      icon: '👩‍🏫',
      description: 'For individual teachers and tutors',
      monthlyPrice: 29.99,
      annualPrice: 299,
      savings: 17,
      features: [
        '1 teacher account',
        'Manage up to 50 students',
        'Create 5+ classes/groups',
        'Custom assessments',
        'Student progress tracking',
        'Assignment management',
        'Parent communication',
        '500 AI-generated questions/month',
        'Export reports (PDF, Excel)'
      ],
      popular: false,
      color: '#3498db'
    },
    {
      id: SUBSCRIPTION_TIERS.SCHOOL_STANDARD,
      name: 'School Standard',
      icon: '🏫',
      description: 'For small to medium schools',
      annualPrice: 499,
      yearly: true,
      features: [
        'Unlimited teachers (per branch)',
        'Up to 500 students',
        '1 school admin account',
        'Unlimited classes/groups',
        'Advanced analytics',
        'Bulk registration (CSV upload)',
        'Custom branding (logo, colors)',
        'API access (limited)',
        'Teacher training materials',
        'Priority support',
        'Unlimited AI content generation',
        'Parent portal'
      ],
      popular: false,
      color: '#9b59b6'
    },
    {
      id: SUBSCRIPTION_TIERS.SCHOOL_PREMIUM,
      name: 'School Premium',
      icon: '🏛️',
      description: 'For large schools and school chains',
      annualPrice: 999,
      yearly: true,
      features: [
        'Everything in School Standard',
        'Up to 1500 students per branch',
        'Multi-branch support',
        'District admin access',
        'White-label options',
        'Custom integrations',
        'Dedicated account manager',
        'Compliance reporting',
        'Advanced security (SSO, 2FA)',
        'Professional development workshops'
      ],
      popular: true,
      color: '#e91e63'
    },
    {
      id: SUBSCRIPTION_TIERS.DISTRICT_ENTERPRISE,
      name: 'District Enterprise',
      icon: '🌐',
      description: 'For school districts and large organizations',
      customPricing: true,
      features: [
        'Everything in School Premium',
        'Unlimited schools',
        'Unlimited students',
        'District-wide analytics',
        'State reporting tools',
        'Custom development',
        'On-premise deployment option',
        '24/7 phone support',
        'Quarterly business reviews',
        'Training for administrators'
      ],
      popular: false,
      color: '#16a085'
    }
  ];

  const calculatePrice = (plan) => {
    if (plan.customPricing) return 'Custom';
    if (plan.yearly) return `$${plan.annualPrice}/year`;

    if (billingCycle === 'monthly') {
      return `$${plan.monthlyPrice}/month`;
    } else {
      return `$${plan.annualPrice}/year`;
    }
  };

  const getSavingsText = (plan) => {
    if (plan.yearly || plan.customPricing) return null;
    if (billingCycle === 'annual') {
      return `Save ${plan.savings}%`;
    }
    return null;
  };

  const handleSelectPlan = (planId) => {
    console.log('Selected plan:', planId);
    // TODO: Implement payment flow
    alert(`Selected: ${planId}\nPayment integration coming soon!`);
  };

  const handleContactSales = () => {
    window.location.href = '#contact';
  };

  return (
    <div className="pricing-page-container">
      {onClose && (
        <button className="pricing-close-btn" onClick={onClose}>
          ✕
        </button>
      )}

      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p className="pricing-subtitle">
          Start with a free trial. No credit card required. Cancel anytime.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="billing-cycle-toggle">
          <button
            className={`cycle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`cycle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
            onClick={() => setBillingCycle('annual')}
          >
            Annual
            <span className="save-badge">Save 17%</span>
          </button>
        </div>
      </div>

      <div className="pricing-plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`pricing-plan-card ${plan.popular ? 'popular' : ''}`}
            style={{ '--plan-color': plan.color }}
          >
            {plan.popular && (
              <div className="popular-badge">
                ⭐ Most Popular
              </div>
            )}

            <div className="plan-header">
              <div className="plan-icon">{plan.icon}</div>
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
            </div>

            <div className="plan-price">
              <span className="price-amount">{calculatePrice(plan)}</span>
              {getSavingsText(plan) && (
                <span className="price-savings">{getSavingsText(plan)}</span>
              )}
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <span className="feature-check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`plan-select-btn ${subscriptionTier === plan.id ? 'current' : ''}`}
              onClick={() => plan.customPricing ? handleContactSales() : handleSelectPlan(plan.id)}
              disabled={subscriptionTier === plan.id}
            >
              {subscriptionTier === plan.id ? 'Current Plan' :
               plan.customPricing ? 'Contact Sales' :
               plan.yearly ? 'Start Free Trial' :
               'Get Started'}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Do you offer a free trial?</h4>
            <p>Yes! All plans come with a 7-day (individual) or 14-day (school) free trial. No credit card required.</p>
          </div>
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>Absolutely. You can cancel your subscription anytime with no penalties. Prorated refunds available.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>We accept credit cards, debit cards, PayPal, and bank transfers (for schools).</p>
          </div>
          <div className="faq-item">
            <h4>Is there a discount for annual billing?</h4>
            <p>Yes! You save 17% when you choose annual billing instead of monthly.</p>
          </div>
          <div className="faq-item">
            <h4>Can I upgrade or downgrade my plan?</h4>
            <p>Yes, you can change your plan anytime. Changes are prorated based on your billing cycle.</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer custom plans for large districts?</h4>
            <p>Yes! Contact our sales team for custom enterprise pricing and features.</p>
          </div>
        </div>
      </div>

      <div className="pricing-cta-section">
        <h2>Not sure which plan is right for you?</h2>
        <p>Our team is here to help you find the perfect plan for your needs.</p>
        <button className="cta-contact-btn" onClick={handleContactSales}>
          Contact Us
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
