"use client";

const blankPet = {
  name: "",
  species: "Dog",
  breed: "",
  age: "",
  gender: "Unknown",
  imageUrl: "",
  healthStatus: "",
  vaccinationStatus: "Unknown",
  location: "",
  adoptionFee: "0",
  description: "",
};

export default function PetForm({ initialPet, onSubmit, submitLabel, busy, ownerEmail }) {
  const pet = initialPet ? { ...blankPet, ...initialPet, adoptionFee: String(initialPet.adoptionFee ?? 0) } : blankPet;

  return (
    <form className="pet-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label className="form-field">Pet name<input name="name" defaultValue={pet.name} required maxLength={80} placeholder="e.g. Clover" /></label>
        <label className="form-field">Species<select name="species" defaultValue={pet.species} required><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option></select></label>
        <label className="form-field">Breed<input name="breed" defaultValue={pet.breed} required maxLength={80} placeholder="e.g. Beagle mix" /></label>
        <label className="form-field">Age<input name="age" defaultValue={pet.age} required maxLength={40} placeholder="e.g. 2 years" /></label>
        <label className="form-field">Gender<select name="gender" defaultValue={pet.gender} required><option>Male</option><option>Female</option><option>Unknown</option></select></label>
        <label className="form-field">Vaccination status<select name="vaccinationStatus" defaultValue={pet.vaccinationStatus} required><option>Up to date</option><option>Partially vaccinated</option><option>Not vaccinated</option><option>Unknown</option></select></label>
        <label className="form-field form-field-wide">Pet parent email<input value={ownerEmail} readOnly aria-readonly="true" /><small>Your account email is attached to this listing.</small></label>
        <label className="form-field form-field-wide">Photo URL<input name="imageUrl" type="url" defaultValue={pet.imageUrl} required placeholder="https://images.example.com/your-pet.jpg" /><small>Paste a direct image URL from an image host.</small></label>
        <label className="form-field">Health status<input name="healthStatus" defaultValue={pet.healthStatus} required maxLength={240} placeholder="e.g. Healthy, recent checkup" /></label>
        <label className="form-field">Location<input name="location" defaultValue={pet.location} required maxLength={120} placeholder="City, State" /></label>
        <label className="form-field">Adoption fee ($)<input name="adoptionFee" type="number" min="0" max="100000" step="0.01" defaultValue={pet.adoptionFee} required /></label>
        <label className="form-field form-field-wide">A little about this friend<textarea name="description" defaultValue={pet.description} required minLength={20} maxLength={3000} rows={4} placeholder="Share their personality, favorite things, and the home they would love..." /><small>At least 20 characters. Great details help a pet find their person.</small></label>
      </div>
      <button className="button button-dark form-submit" type="submit" disabled={busy}>{busy ? "Saving your listing..." : submitLabel} <span aria-hidden="true">→</span></button>
    </form>
  );
}

export function readPetForm(formData) {
  return {
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed"),
    age: formData.get("age"),
    gender: formData.get("gender"),
    imageUrl: formData.get("imageUrl"),
    healthStatus: formData.get("healthStatus"),
    vaccinationStatus: formData.get("vaccinationStatus"),
    location: formData.get("location"),
    adoptionFee: Number(formData.get("adoptionFee")),
    description: formData.get("description"),
  };
}
