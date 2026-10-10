import Link from "next/link";
import { usePreferences } from "@/components/PreferencesProvider";
import { useToast } from "@/components/ToastProvider";

export default function PetCard({ pet, sample = false }) {
  const { isWishlisted, toggleWishlist } = usePreferences();
  const { showToast } = useToast();
  const saved = isWishlisted(pet);

  function handleWishlist(event) {
    event.preventDefault();
    event.stopPropagation();
    try {
      const added = toggleWishlist(pet);
      showToast(added ? `${pet.name} was added to your saved pets.` : `${pet.name} was removed from your saved pets.`);
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  return (
    <article className="pet-card">
      <div className="pet-photo-wrap">
        <Link className="pet-photo" href={sample ? "/pets" : `/pets/${pet._id || pet.id}`} aria-label={`View ${pet.name}'s profile`}>
          <img src={pet.imageUrl} alt={pet.name} loading="lazy" />
          <span className="pet-species">{pet.species}</span>
          {sample && <span className="sample-tag">Example profile</span>}
        </Link>
        <button className={`wishlist-toggle${saved ? " is-saved" : ""}`} onClick={handleWishlist} aria-label={saved ? `Remove ${pet.name} from saved pets` : `Save ${pet.name}`} aria-pressed={saved}>
          {saved ? "♥" : "♡"}
        </button>
      </div>
      <div className="pet-card-content">
        <div className="pet-card-heading">
          <div>
            <h3>{pet.name}</h3>
            <p>{pet.breed} <span aria-hidden="true">·</span> {pet.age}</p>
          </div>
          <span className="pet-gender">{pet.gender === "Female" ? "♀" : pet.gender === "Male" ? "♂" : "•"}</span>
        </div>
        <p className="pet-location"><span aria-hidden="true">⌖</span> {pet.location}</p>
        <div className="pet-card-footer">
          <span>{Number(pet.adoptionFee) === 0 ? "Ready for a home" : `$${Number(pet.adoptionFee).toFixed(0)} adoption fee`}</span>
          <Link className="text-link" href={sample ? "/pets" : `/pets/${pet._id || pet.id}`}>
            Meet {pet.name} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
