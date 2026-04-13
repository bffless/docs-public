if (typeof window !== 'undefined' && typeof (window as any).gtag !== 'function') {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function gtag() {
    (window as any).dataLayer.push(arguments);
  };
}
