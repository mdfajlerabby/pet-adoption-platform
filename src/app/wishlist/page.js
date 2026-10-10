"use client";

import Link from "next/link";
import PetCard from "@/components/PetCard";
import { usePreferences } from "@/components/PreferencesProvider";

export default function WishlistPage() {
  const { wishlist } = usePreferences();

  return (
    <main className="wishlist-page page-container">
      <div className="wishlist-heading">
        <div><p className="eyebrow">A few friends on your mind</p><h1>Your <em>saved pets.</em></h1><p>Keep the companions you love close while you find the right fit.</p></div>
        <span className="wishlist-count">{wishlist.length.toString().padStart(2, "0")} saved</span>
      </div>
      {wishlist.length ? (
        <div className="pet-grid">
          {wishlist.map((pet) => <PetCard key={pet._id || pet.id} pet={pet} sample={!pet._id || String(pet._id).startsWith("sample-")} />)}
        </div>
      ) : (
        <div className="empty-state wishlist-empty">
          <span className="empty-icon">♥</span>
          <h2>Save a little love for later.</h2>
          <p>Tap the heart on any pet profile or card and we&apos;ll keep it here on this device.</p>
          <Link className="button button-dark" href="/pets">Meet the pets <span aria-hidden="true">→</span></Link>
        </div>
      )}
    </main>
  );
}
