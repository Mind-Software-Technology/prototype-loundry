'use client';

import React from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { formatRupiah } from '@/utils/formatters';
import { BrandMark } from './BrandMark';
import { displayBrandName } from '@/utils/branding';
import { 
  Truck, 
  Sparkles, 
  Clock, 
  Tag, 
  ArrowRight, 
  Play, 
  Shirt, 
  Wind, 
  Footprints, 
  Home, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  HeartHandshake, 
  Leaf, 
  Lock, 
  Star,
  PhoneCall,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  ShoppingBag
} from 'lucide-react';

export const WashyLanding: React.FC = () => {
  const { setActiveTab, settings } = useLaundry();

  const servicesList = [
    {
      title: 'Wash & Fold',
      desc: 'Regular washing & folding service for daily wear.',
      icon: <Shirt size={22} color="#0052cc" />,
      image: '/images/service_wash_fold.jpg',
    },
    {
      title: 'Dry Cleaning',
      desc: 'Professional dry cleaning for delicate clothes.',
      icon: <Layers size={22} color="#0052cc" />,
      image: '/images/service_dry_cleaning.jpg',
    },
    {
      title: 'Ironing Service',
      desc: 'Perfect ironing for sharp & clean look.',
      icon: <Wind size={22} color="#0052cc" />,
      image: '/images/service_ironing.jpg',
    },
    {
      title: 'Shoe Cleaning',
      desc: 'Deep cleaning for all types of shoes.',
      icon: <Footprints size={22} color="#0052cc" />,
      image: '/images/service_shoe.jpg',
    },
    {
      title: 'Laundry for Home',
      desc: 'Curtains, bedsheets, quilts & more.',
      icon: <Home size={22} color="#0052cc" />,
      image: '/images/service_home.jpg',
    },
    {
      title: 'Special Care',
      desc: 'Premium care for designer & winter wear.',
      icon: <Sparkles size={22} color="#0052cc" />,
      image: '/images/service_special.jpg',
    },
  ];

  const pricingRows = [
    { name: 'Shirt', reg: '₹25 (Rp 8.000)', exp: '₹35 (Rp 15.000)', prem: '₹50 (Rp 25.000)' },
    { name: 'T-Shirt', reg: '₹20 (Rp 6.000)', exp: '₹30 (Rp 12.000)', prem: '₹45 (Rp 20.000)' },
    { name: 'Jeans', reg: '₹40 (Rp 10.000)', exp: '₹60 (Rp 18.000)', prem: '₹80 (Rp 30.000)' },
    { name: 'Trouser', reg: '₹30 (Rp 9.000)', exp: '₹45 (Rp 16.000)', prem: '₹60 (Rp 28.000)' },
    { name: 'Saree / Gamis', reg: '₹60 (Rp 15.000)', exp: '₹90 (Rp 25.000)', prem: '₹120 (Rp 40.000)' },
    { name: 'Suit / Blazer', reg: '₹120 (Rp 30.000)', exp: '₹180 (Rp 50.000)', prem: '₹250 (Rp 75.000)' },
    { name: 'Bedsheet (Double)', reg: '₹80 (Rp 15.000)', exp: '₹120 (Rp 25.000)', prem: '₹160 (Rp 40.000)' },
    { name: 'Blanket / Comforter', reg: '₹150 (Rp 35.000)', exp: '₹200 (Rp 55.000)', prem: '₹250 (Rp 80.000)' },
  ];

  const stepsList = [
    {
      step: 'Step 1',
      title: 'Book Your Order',
      desc: 'Schedule a pickup through website or app.',
      icon: <Calendar size={26} color="#0052cc" />,
    },
    {
      step: 'Step 2',
      title: 'We Pickup',
      desc: 'Our executive will pick up your clothes for free.',
      icon: <Truck size={26} color="#0052cc" />,
    },
    {
      step: 'Step 3',
      title: 'Expert Cleaning',
      desc: 'Your clothes are cleaned with care & hygiene.',
      icon: <Sparkles size={26} color="#0052cc" />,
    },
    {
      step: 'Step 4',
      title: 'Fast Delivery',
      desc: 'We deliver fresh & clean clothes on time.',
      icon: <CheckCircle2 size={26} color="#0052cc" />,
    },
  ];

  const testimonials = [
    {
      name: 'Rahul Sharma',
      city: 'Mumbai',
      text: 'Excellent service! Clothes are always fresh and neatly packed.',
      rating: 5,
    },
    {
      name: 'Priya Mehta',
      city: 'Delhi',
      text: 'Very professional and timely pickup & delivery.',
      rating: 5,
    },
    {
      name: 'Arjun Verma',
      city: 'Bangalore',
      text: 'Best laundry service in my city. Highly recommended!',
      rating: 5,
    },
  ];

  return (
    <div className="washy-page-wrapper">
      {/* 1. HERO SECTION */}
      <section className="washy-hero-section">
        <div className="washy-container hero-grid">
          {/* Left Column: Titles, Features, Buttons */}
          <div className="hero-text-content">
            <h1 className="hero-headline">
              Clean Clothes,<br />
              <span className="hero-highlight">Fresh Life!</span>
            </h1>

            <p className="hero-description">
              Professional laundry & dry cleaning service with care, hygiene & on-time delivery.
            </p>

            {/* 4 Feature Badges in 2x2 Grid */}
            <div className="hero-features-grid">
              <div className="feature-item-pill">
                <div className="feature-icon-bubble">
                  <Truck size={16} color="#0052cc" />
                </div>
                <div className="feature-item-text">
                  <strong>Free Pickup</strong>
                  <span>& Delivery</span>
                </div>
              </div>

              <div className="feature-item-pill">
                <div className="feature-icon-bubble">
                  <Sparkles size={16} color="#0052cc" />
                </div>
                <div className="feature-item-text">
                  <strong>100% Hygienic</strong>
                  <span>Cleaning</span>
                </div>
              </div>

              <div className="feature-item-pill">
                <div className="feature-icon-bubble">
                  <Clock size={16} color="#0052cc" />
                </div>
                <div className="feature-item-text">
                  <strong>Express Delivery</strong>
                  <span>in 24 Hours</span>
                </div>
              </div>

              <div className="feature-item-pill">
                <div className="feature-icon-bubble">
                  <Tag size={16} color="#0052cc" />
                </div>
                <div className="feature-item-text">
                  <strong>Affordable</strong>
                  <span>Pricing</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hero-buttons-row">
              <button
                type="button"
                onClick={() => setActiveTab('pos')}
                className="btn-washy-cta-primary"
              >
                <span>Book a Free Pickup</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('how-it-works-sec');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-washy-cta-secondary"
              >
                <div className="play-icon-badge">
                  <Play size={12} fill="#0052cc" color="#0052cc" />
                </div>
                <span>How It Works</span>
              </button>
            </div>
          </div>

          {/* Right Column: Washing Machine & Towels Photo Card */}
          <div className="hero-visual-content">
            <div className="hero-photo-card">
              <img
                src="/images/hero_washing_machine.jpg"
                alt="Washy Washing Machine and Fresh Towels"
                className="hero-machine-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR SERVICES SECTION */}
      <section className="washy-section-block services-section" id="services-sec">
        <div className="washy-container">
          <div className="section-header-centered">
            <span className="section-label-blue">OUR SERVICES</span>
            <h2 className="section-title-dark">Laundry & Dry Cleaning Services</h2>
            <div className="title-divider-line">
              <span className="diamond-marker">◆</span>
            </div>
          </div>

          {/* Exactly 6 Cards in a clean row */}
          <div className="services-card-grid">
            {servicesList.map((srv, idx) => (
              <div 
                key={idx} 
                className="service-feature-card"
                onClick={() => setActiveTab('pos')}
                style={{ cursor: 'pointer' }}
              >
                <div className="service-card-image-wrap">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="service-card-thumb"
                  />
                  <div className="service-card-icon-floating">
                    {srv.icon}
                  </div>
                </div>

                <div className="service-card-body">
                  <h3 className="service-item-title">{srv.title}</h3>
                  <p className="service-item-desc">{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRICING / RATE CARD SECTION */}
      <section className="washy-section-block pricing-section" id="pricing-sec">
        <div className="washy-container">
          <div className="rate-card-layout">
            {/* Left Blue Card */}
            <div className="rate-card-left-banner">
              <div className="rate-badge-top">
                <span className="rate-tagline">OUR PRICING</span>
                <h3 className="rate-heading">Laundry<br />Rate Card</h3>
              </div>

              <div className="badge-best-price-stamp">
                <span>Best</span>
                <strong>Prices</strong>
              </div>

              <div className="rate-image-frame">
                <img
                  src="/images/folded_towels_banner.jpg"
                  alt="Folded Laundry Towels"
                  className="rate-towels-photo"
                />
              </div>
            </div>

            {/* Right Pricing Table */}
            <div className="rate-card-right-table">
              <div className="table-responsive-box">
                <table className="rate-styled-table">
                  <thead>
                    <tr>
                      <th className="th-col-service">Service</th>
                      <th className="th-col-reg">
                        Regular
                        <span className="th-subtext">(3 Days Delivery)</span>
                      </th>
                      <th className="th-col-exp">
                        Express
                        <span className="th-subtext">(24 Hours Delivery)</span>
                      </th>
                      <th className="th-col-prem">
                        Premium
                        <span className="th-subtext">(Same Day Delivery)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingRows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'row-alt' : ''}>
                        <td className="cell-service-name">{row.name}</td>
                        <td className="cell-price">{row.reg}</td>
                        <td className="cell-price">{row.exp}</td>
                        <td className="cell-price">{row.prem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-note-caption">
                * Prices may vary based on fabric and condition.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (4 SIMPLE STEPS) */}
      <section className="washy-section-block how-section" id="how-it-works-sec">
        <div className="washy-container">
          <div className="section-header-centered">
            <span className="section-label-blue">HOW IT WORKS</span>
            <h2 className="section-title-dark">4 Simple Steps</h2>
            <div className="title-divider-line">
              <span className="diamond-marker">◆</span>
            </div>
          </div>

          <div className="steps-flow-row">
            {stepsList.map((st, i) => (
              <React.Fragment key={i}>
                <div className="step-process-card">
                  <div className="step-card-top-icon">
                    {st.icon}
                  </div>
                  <div className="step-number-tag">{st.step}</div>
                  <h4 className="step-title-text">{st.title}</h4>
                  <p className="step-desc-text">{st.desc}</p>
                </div>

                {i < stepsList.length - 1 && (
                  <div className="step-flow-arrow" aria-hidden="true">
                    <ArrowRight size={20} color="#0052cc" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROMO BANNER (20% OFF) */}
      <section className="washy-section-block promo-section">
        <div className="washy-container">
          <div className="promo-cta-banner">
            <div className="promo-text-wrap">
              <h3 className="promo-title-bold">
                Get <span className="yellow-accent">20% OFF</span> on Your First Order
              </h3>
              <div className="promo-coupon-badge">
                <span>Use Code:</span>
                <span className="coupon-code-pill">WELCOME20</span>
              </div>
            </div>

            <div className="promo-image-wrap">
              <img
                src="/images/folded_towels_banner.jpg"
                alt="Towels Promo"
                className="promo-towels-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST BADGES ROW */}
      <section className="washy-section-block trust-section">
        <div className="washy-container">
          <div className="trust-badges-bar">
            <div className="trust-badge-unit">
              <div className="trust-icon-box">
                <ShieldCheck size={24} color="#0052cc" />
              </div>
              <div className="trust-unit-copy">
                <strong>100% Hygienic</strong>
                <span>Kills 99% germs & bacteria</span>
              </div>
            </div>

            <div className="trust-badge-unit">
              <div className="trust-icon-box">
                <Clock size={24} color="#0052cc" />
              </div>
              <div className="trust-unit-copy">
                <strong>On-Time Delivery</strong>
                <span>Always on time, every time</span>
              </div>
            </div>

            <div className="trust-badge-unit">
              <div className="trust-icon-box">
                <Lock size={24} color="#0052cc" />
              </div>
              <div className="trust-unit-copy">
                <strong>Secure & Safe</strong>
                <span>Your clothes are in safe hands</span>
              </div>
            </div>

            <div className="trust-badge-unit">
              <div className="trust-icon-box">
                <Leaf size={24} color="#0052cc" />
              </div>
              <div className="trust-unit-copy">
                <strong>Eco Friendly</strong>
                <span>Environment safe cleaning</span>
              </div>
            </div>

            <div className="trust-badge-unit">
              <div className="trust-icon-box">
                <HeartHandshake size={24} color="#0052cc" />
              </div>
              <div className="trust-unit-copy">
                <strong>Satisfaction</strong>
                <span>100% customer satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section className="washy-section-block testimonials-section" id="testimonials-sec">
        <div className="washy-container">
          <div className="section-header-centered">
            <span className="section-label-blue">WHAT OUR CLIENTS SAY</span>
            <h2 className="section-title-dark">Happy Customers, Fresh Clothes</h2>
            <div className="title-divider-line">
              <span className="diamond-marker">◆</span>
            </div>
          </div>

          <div className="testimonials-cards-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="client-review-card">
                <div className="stars-row">
                  {[...Array(t.rating)].map((_, r) => (
                    <Star key={r} size={15} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <p className="review-quote-text">"{t.text}"</p>
                <div className="review-author-row">
                  <div className="author-avatar-circle">
                    {t.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="author-details">
                    <strong className="author-name">{t.name}</strong>
                    <span className="author-city">{t.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="washy-site-footer">
        <div className="washy-container footer-content-grid">
          <div className="footer-col-about">
            <div className="footer-logo-lockup">
              <BrandMark boxClassName="footer-logo-icon" size={36}>
                <Sparkles size={20} color="#fff" />
              </BrandMark>
              <div>
                <span className="footer-logo-title">{displayBrandName(settings.branding)}</span>
              </div>
            </div>
            <p className="footer-about-text">
              Professional laundry & dry cleaning service with care, hygiene, and on-time pickup & delivery.
            </p>
          </div>

          <div className="footer-col-nav">
            <h4 className="footer-nav-title">Our Services</h4>
            <ul className="footer-nav-list">
              <li>Wash & Fold</li>
              <li>Dry Cleaning</li>
              <li>Ironing Service</li>
              <li>Shoe Cleaning</li>
              <li>Laundry for Home</li>
              <li>Special Care</li>
            </ul>
          </div>

          <div className="footer-col-nav">
            <h4 className="footer-nav-title">Quick Links</h4>
            <ul className="footer-nav-list">
              <li><a href="#services-sec">Home</a></li>
              <li><a href="#services-sec">Services</a></li>
              <li><a href="#pricing-sec">Pricing</a></li>
              <li><a href="#how-it-works-sec">How It Works</a></li>
              <li><a href="#testimonials-sec">About Us</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('pos')}
                  className="footer-btn-link"
                >
                  Kasir POS Terminal ➔
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col-contact">
            <h4 className="footer-nav-title">Customer Support</h4>
            <p className="footer-phone-number">
              <PhoneCall size={16} style={{ display: 'inline', marginRight: 6 }} />
              +91 98765 43210
            </p>
            <p className="footer-meta-info">Mon - Sun: 07:00 AM - 09:00 PM</p>
            <p className="footer-meta-info">Customer Care: support@washylaundry.com</p>
          </div>
        </div>

        <div className="footer-bottom-copyright">
          <div className="washy-container">
            <p>© 2026 {displayBrandName(settings.branding)}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating POS Shortcut Button on Bottom Right */}
      <button
        type="button"
        onClick={() => setActiveTab('pos')}
        className="floating-pos-fab"
        title="Buka Kasir POS"
      >
        <ShoppingBag size={20} />
        <span>Buka Kasir POS</span>
      </button>
    </div>
  );
};
