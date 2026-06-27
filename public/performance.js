// Core Web Vitals monitoring (lightweight)
(function() {
  'use strict';

  if (window.__perfInitialized) return
  window.__perfInitialized = true

  // Only run in modern browsers
  if (!window.PerformanceObserver || !window.requestIdleCallback) return;
  
  const vitals = {
    CLS: 0,
    LCP: 0,
    FID: 0
  };
  
  // Cumulative Layout Shift
  try {
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      vitals.CLS = clsValue;
    }).observe({entryTypes: ['layout-shift']});
  } catch (e) {}
  
  // Largest Contentful Paint
  try {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      vitals.LCP = lastEntry.startTime;
    }).observe({entryTypes: ['largest-contentful-paint']});
  } catch (e) {}
  
  // First Input Delay
  try {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        vitals.FID = entry.processingStart - entry.startTime;
        break;
      }
    }).observe({entryTypes: ['first-input']});
  } catch (e) {}
  
  // Send vitals when page is about to unload
  const sendVitals = () => {
    if (window.gtag && typeof gtag === 'function') {
      gtag('event', 'web_vitals', {
        'custom_parameter_cls': Math.round(vitals.CLS * 1000) / 1000,
        'custom_parameter_lcp': Math.round(vitals.LCP),
        'custom_parameter_fid': Math.round(vitals.FID)
      });
    }
  };
  
  // Send on visibility change or page unload
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      sendVitals();
    }
  });
  
  window.addEventListener('beforeunload', sendVitals);
  
  // Lazy loading performance optimization
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });
    
    // Apply to images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
})();