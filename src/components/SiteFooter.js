import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark" aria-hidden="true">p</span>
            <span>Pawfect<span className="brand-light">Home</span><small>Every pet deserves a family</small></span>
          </Link>
          <p>Bringing kind people and wonderful animals together, one happy home at a time.</p>
        </div>
        <div className="footer-column">
          <h3>Explore</h3>
          <Link href="/pets">Find a pet</Link>
          <Link href="/#why-adopt">Why adopt</Link>
          <Link href="/#care-tips">Pet care tips</Link>
        </div>
        <div className="footer-column">
          <h3>Say hello</h3>
          <a href="mailto:hello@pawfecthome.org">hello@pawfecthome.org</a>
          <a href="tel:+18005550143">+1 (800) 555-0143</a>
          <p>Mon–Sat, 9am–5pm</p>
        </div>
        <div className="footer-column">
          <h3>Follow along</h3>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram ↗</a>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook ↗</a>
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">YouTube ↗</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Pawfect Home. Made for the love of animals.</span>
        <span>Kind hearts. Happy paws. Better beginnings.</span>
      </div>
    </footer>
  );
}
