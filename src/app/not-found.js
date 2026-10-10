import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container centered-page">
      <div className="empty-state">
        <span className="empty-icon">🐾</span>
        <p className="eyebrow">A little off the beaten path</p>
        <h1>This page wandered off.</h1>
        <p>The page you&apos;re looking for isn&apos;t here, but there are plenty of pets waiting to meet you.</p>
        <Link className="button button-dark" href="/">Back to home <span aria-hidden="true">→</span></Link>
      </div>
    </main>
  );
}
