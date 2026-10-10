import Link from "next/link";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className="auth-page">
      <div className="auth-image">
        <img src="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=85" alt="A curious cat looking out from a cozy home" />
        <div className="auth-image-copy"><p className="eyebrow">The beginning of something lovely</p><h2>Somewhere,<br />a little heart<br />is <em>waiting for you.</em></h2><span>— A happy home changes everyone.</span></div>
      </div>
      <div className="auth-form-side">
        <Link className="auth-back" href="/">← Back to home</Link>
        <div className="auth-form-wrap">
          <p className="eyebrow">Pawfect Home community</p>
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
        <p className="auth-terms">By continuing, you agree to our community promise: treat every person and pet with care.</p>
      </div>
    </main>
  );
}
