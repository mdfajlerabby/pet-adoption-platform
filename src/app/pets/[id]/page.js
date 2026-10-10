"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingState from "@/components/LoadingState";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { usePreferences } from "@/components/PreferencesProvider";
import { useToast } from "@/components/ToastProvider";
import { apiRequest, asJson } from "@/lib/api";

function PetDetailsContent({ id }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = usePreferences();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    apiRequest(`/pets/${encodeURIComponent(id)}`)
      .then(({ pet: foundPet }) => {
        if (active) setPet(foundPet);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  async function handleAdoption(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await apiRequest("/requests", {
        method: "POST",
        body: asJson({
          petId: pet._id,
          pickupDate: form.get("pickupDate"),
          message: form.get("message"),
        }),
      });
      showToast(`Your adoption request for ${pet.name} is on its way.`);
      router.push("/dashboard#requests");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
      <main className="page-container detail-page">
        <Link className="back-link" href="/pets">← Back to all pets</Link>
        {loading ? <LoadingState label="Getting to know your new friend..." /> : error && !pet ? (
          <div className="inline-error" role="alert"><h1>We couldn&apos;t find this pet.</h1><p>{error}</p><Link className="button button-dark" href="/pets">Browse all pets</Link></div>
        ) : pet && (
          <div className="detail-layout">
            <div className="detail-main">
              <div className="detail-image"><img src={pet.imageUrl} alt={pet.name} /><span className={`status-pill status-${pet.status}`}>{pet.status === "adopted" ? "Found a home" : "Ready to meet you"}</span><button className={`wishlist-toggle detail-wishlist${isWishlisted(pet) ? " is-saved" : ""}`} onClick={() => { try { const added = toggleWishlist(pet); showToast(added ? `${pet.name} was added to your saved pets.` : `${pet.name} was removed from your saved pets.`); } catch (requestError) { showToast(requestError.message, "error"); } }} aria-label={isWishlisted(pet) ? `Remove ${pet.name} from saved pets` : `Save ${pet.name}`} aria-pressed={isWishlisted(pet)}>{isWishlisted(pet) ? "♥" : "♡"}</button></div>
              <div className="detail-heading">
                <div><p className="eyebrow">{pet.species} · {pet.breed}</p><h1>Meet {pet.name}.</h1><p className="detail-location">⌖ {pet.location}</p></div>
                <div className="detail-fee">{Number(pet.adoptionFee) === 0 ? "No adoption fee" : `$${Number(pet.adoptionFee).toFixed(0)}`}<small>adoption fee</small></div>
              </div>
              <p className="detail-description">{pet.description}</p>
              <div className="detail-facts">
                <div><span>Age</span><strong>{pet.age}</strong></div>
                <div><span>Gender</span><strong>{pet.gender}</strong></div>
                <div><span>Health</span><strong>{pet.healthStatus}</strong></div>
                <div><span>Vaccines</span><strong>{pet.vaccinationStatus}</strong></div>
              </div>
              <div className="shelter-card">
                <span className="shelter-avatar">{pet.ownerId?.name?.charAt(0).toUpperCase() || "P"}</span>
                <div><small>In the care of</small><strong>{pet.ownerId?.name || "A caring pet parent"}</strong></div>
                <span className="shelter-verified">Community pet parent</span>
              </div>
            </div>
            <aside className="adoption-panel">
              <p className="eyebrow">Could this be your friend?</p>
              <h2>Let&apos;s get<br /><em>acquainted.</em></h2>
              {String(pet.ownerId?._id) === user.id ? (
                <div className="adoption-message"><p>This is your listing. You can manage it from your dashboard.</p><Link className="button button-dark" href="/dashboard#my-listings">Manage my listing</Link></div>
              ) : pet.status === "adopted" ? (
                <div className="adoption-message"><span className="empty-icon">♥</span><p>{pet.name} has found a loving home. Thank you for helping pets like {pet.name} find their people.</p><Link className="text-link" href="/pets">Meet other pets <span aria-hidden="true">→</span></Link></div>
              ) : (
                <>
                  <p>Tell {pet.name}&apos;s person a little about yourself and when you&apos;d love to say hello.</p>
                  <form className="adoption-form" onSubmit={handleAdoption}>
                    <label className="form-field">Your name<input value={user.name} readOnly /></label>
                    <label className="form-field">Your email<input value={user.email} readOnly /></label>
                    <label className="form-field">Preferred pickup date<input name="pickupDate" type="date" min={new Date().toISOString().slice(0, 10)} required /></label>
                    <label className="form-field">A note to the pet parent<textarea name="message" rows={4} minLength={10} maxLength={1000} required placeholder="Tell them a little about your home and why you connected..." /></label>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <button className="button button-dark auth-submit" disabled={busy}>{busy ? "Sending your request..." : "Ask to meet"} <span aria-hidden="true">→</span></button>
                    <small className="privacy-note">Your details are only shared with the pet&apos;s owner to help arrange a meet-up.</small>
                  </form>
                </>
              )}
            </aside>
          </div>
        )}
      </main>
  );
}

export default function PetDetailsPage() {
  const { id } = useParams();
  return <RequireAuth><PetDetailsContent id={id} /></RequireAuth>;
}
