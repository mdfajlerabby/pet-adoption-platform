"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import LoadingState from "@/components/LoadingState";
import PetForm, { readPetForm } from "@/components/PetForm";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { apiRequest, asJson } from "@/lib/api";

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function DashboardContents() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [pets, setPets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [deletingPet, setDeletingPet] = useState(null);
  const [requestPet, setRequestPet] = useState(null);
  const [petRequests, setPetRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [cancellingRequest, setCancellingRequest] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [petResult, requestResult] = await Promise.all([
        apiRequest("/pets/mine"),
        apiRequest("/requests/mine"),
      ]);
      setPets(petResult.pets);
      setRequests(requestResult.requests);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadDashboard);
  }, [loadDashboard]);

  async function handleCreatePet(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    try {
      await apiRequest("/pets", { method: "POST", body: asJson(readPetForm(new FormData(formElement))) });
      formElement.reset();
      showToast("Your pet listing is live. Thanks for helping a friend find home!");
      await loadDashboard();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePet(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    try {
      await apiRequest(`/pets/${editingPet._id}`, {
        method: "PATCH",
        body: asJson(readPetForm(new FormData(formElement))),
      });
      setEditingPet(null);
      showToast("Your pet's profile has been updated.");
      await loadDashboard();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePet() {
    try {
      await apiRequest(`/pets/${deletingPet._id}`, { method: "DELETE" });
      showToast(`${deletingPet.name}'s listing has been removed.`);
      setDeletingPet(null);
      await loadDashboard();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function openRequests(pet) {
    setRequestPet(pet);
    setPetRequests([]);
    setRequestError("");
    setRequestLoading(true);
    try {
      const result = await apiRequest(`/requests/pet/${pet._id}`);
      setPetRequests(result.requests);
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setRequestLoading(false);
    }
  }

  async function updateRequestStatus(request, status) {
    try {
      const result = await apiRequest(`/requests/${request._id}`, {
        method: "PATCH",
        body: asJson({ status }),
      });
      setPetRequests((current) => current.map((item) => {
        if (item._id === request._id) return { ...item, status: result.request.status };
        return status === "approved" && item.status === "pending" ? { ...item, status: "rejected" } : item;
      }));
      if (status === "approved") {
        setRequestPet((current) => current ? { ...current, status: "adopted" } : current);
      }
      showToast(status === "approved" ? `${request.adopterId.name}'s request was approved. ${requestPet.name} is marked adopted.` : "Request declined.");
      await loadDashboard();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function cancelRequest() {
    try {
      await apiRequest(`/requests/${cancellingRequest._id}`, { method: "DELETE" });
      showToast("Your pending adoption request was cancelled.");
      setCancellingRequest(null);
      await loadDashboard();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  const availableCount = pets.filter((pet) => pet.status === "available").length;
  const adoptedCount = pets.filter((pet) => pet.status === "adopted").length;

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div className="page-container dashboard-welcome-inner">
          <div><p className="eyebrow">A little home for happy beginnings</p><h1>Welcome home, <em>{user.name.split(" ")[0]}.</em></h1><p>Manage your listings, meet the people who love your pets, and keep up with the friends you&apos;ve asked to meet.</p></div>
          <div className="dashboard-avatar">{user.photoURL ? <img src={user.photoURL} alt="" /> : user.name.charAt(0).toUpperCase()}</div>
        </div>
        <nav className="dashboard-nav page-container" aria-label="Dashboard sections">
          <a href="#my-listings">My listings</a>
          <a href="#add-pet">Add a pet</a>
          <a href="#requests">My requests</a>
        </nav>
      </section>

      <div className="page-container dashboard-content">
        {loadError && <div className="inline-error" role="alert"><strong>We couldn&apos;t refresh your dashboard.</strong><p>{loadError}</p><button className="button button-outline" onClick={loadDashboard}>Try again</button></div>}
        <section className="dashboard-section" id="my-listings">
          <div className="section-heading dashboard-section-heading">
            <div><p className="eyebrow">You&apos;re making a difference</p><h2>Your pet listings</h2></div>
            <a className="button button-dark" href="#add-pet">+ Add a pet</a>
          </div>
          <div className="stats-grid">
            <article className="stat-card"><span>Total listings</span><strong>{loading ? "—" : pets.length.toString().padStart(2, "0")}</strong><small>Your cared-for companions</small></article>
            <article className="stat-card"><span>Looking for home</span><strong>{loading ? "—" : availableCount.toString().padStart(2, "0")}</strong><small>Ready to meet their person</small></article>
            <article className="stat-card"><span>Happy endings</span><strong>{loading ? "—" : adoptedCount.toString().padStart(2, "0")}</strong><small>Found their forever home</small></article>
          </div>
          {loading ? <LoadingState label="Gathering your pet listings..." /> : pets.length ? (
            <div className="listing-table-wrap">
              <div className="listing-table-head"><span>Pet</span><span>Adoption fee</span><span>Status</span><span>Manage</span></div>
              {pets.map((pet) => (
                <article className="listing-row" key={pet._id}>
                  <div className="listing-pet-info"><img src={pet.imageUrl} alt="" /><div><strong>{pet.name}</strong><small>{pet.species} · {pet.breed}</small></div></div>
                  <span className="listing-fee">{Number(pet.adoptionFee) ? `$${Number(pet.adoptionFee).toFixed(0)}` : "No fee"}</span>
                  <span><span className={`status-pill status-${pet.status}`}>{pet.status === "adopted" ? "Adopted" : "Available"}</span></span>
                  <div className="listing-actions">
                    <button className="table-action" onClick={() => openRequests(pet)}>Requests</button>
                    <button className="table-action" onClick={() => setEditingPet(pet)}>Edit</button>
                    <Link className="table-action" href={`/pets/${pet._id}`}>View</Link>
                    <button className="table-action table-action-danger" onClick={() => setDeletingPet(pet)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state dashboard-empty"><span className="empty-icon">✳</span><h3>No listings yet.</h3><p>Share a pet&apos;s story and help them find the home they deserve.</p><a className="button button-dark" href="#add-pet">Add your first pet <span aria-hidden="true">→</span></a></div>
          )}
        </section>

        <section className="dashboard-section add-pet-section" id="add-pet">
          <div className="section-heading dashboard-section-heading">
            <div><p className="eyebrow">A new beginning starts here</p><h2>Tell us about a pet</h2></div>
            <span className="section-side-note">Fields marked required help their new person find them.</span>
          </div>
          <PetForm ownerEmail={user.email} onSubmit={handleCreatePet} submitLabel="Publish this listing" busy={saving} />
        </section>

        <section className="dashboard-section my-requests-section" id="requests">
          <div className="section-heading dashboard-section-heading">
            <div><p className="eyebrow">The start of something lovely</p><h2>My adoption requests</h2></div>
            <span className="section-side-note">{requests.length} {requests.length === 1 ? "friend" : "friends"} you&apos;ve asked to meet</span>
          </div>
          {loading ? <LoadingState label="Finding your adoption requests..." /> : requests.length ? (
            <div className="my-requests-list">
              {requests.map((request) => {
                const requestedPet = request.petId;
                return (
                  <article className="my-request-card" key={request._id}>
                    {requestedPet?.imageUrl ? <img src={requestedPet.imageUrl} alt="" /> : <div className="request-photo-placeholder">🐾</div>}
                    <div className="my-request-main">
                      <p className="eyebrow">Request sent {formatDate(request.createdAt)}</p>
                      <h3>{requestedPet?.name || "Pet listing"}</h3>
                      <p>Preferred pickup: {formatDate(request.pickupDate)}</p>
                    </div>
                    <span className={`status-pill status-${request.status}`}>{request.status}</span>
                    <div className="my-request-actions">
                      {requestedPet ? <Link className="table-action" href={`/pets/${requestedPet._id}`}>View profile</Link> : null}
                      {request.status === "pending" && <button className="table-action table-action-danger" onClick={() => setCancellingRequest(request)}>Cancel request</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state dashboard-empty"><span className="empty-icon">♥</span><h3>No requests just yet.</h3><p>When a pet catches your eye, you&apos;ll find your requests right here.</p><Link className="button button-dark" href="/pets">Meet the pets <span aria-hidden="true">→</span></Link></div>
          )}
        </section>
      </div>

      {editingPet && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingPet(null); }}>
          <section className="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="edit-pet-heading">
            <div className="modal-heading"><div><p className="eyebrow">Update their story</p><h2 id="edit-pet-heading">Edit {editingPet.name}&apos;s listing</h2></div><button className="modal-close" onClick={() => setEditingPet(null)} aria-label="Close edit pet form">×</button></div>
            <PetForm initialPet={editingPet} ownerEmail={user.email} onSubmit={handleUpdatePet} submitLabel="Save changes" busy={saving} />
          </section>
        </div>
      )}

      {deletingPet && (
        <div className="modal-backdrop">
          <section className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-pet-heading">
            <button className="modal-close" onClick={() => setDeletingPet(null)} aria-label="Close">×</button>
            <span className="empty-icon">!</span><p className="eyebrow">One last check</p>
            <h2 id="delete-pet-heading">Remove {deletingPet.name}&apos;s listing?</h2>
            <p>This will remove the pet profile and its adoption requests. You can&apos;t undo this action.</p>
            <div className="modal-actions"><button className="button button-outline" onClick={() => setDeletingPet(null)}>Keep listing</button><button className="button button-danger" onClick={handleDeletePet}>Remove listing</button></div>
          </section>
        </div>
      )}

      {cancellingRequest && (
        <div className="modal-backdrop">
          <section className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-request-heading">
            <button className="modal-close" onClick={() => setCancellingRequest(null)} aria-label="Close">×</button>
            <span className="empty-icon">♥</span><p className="eyebrow">Plans change, and that&apos;s okay</p>
            <h2 id="cancel-request-heading">Cancel this request?</h2>
            <p>Your pending request for {cancellingRequest.petId?.name || "this pet"} will be removed.</p>
            <div className="modal-actions"><button className="button button-outline" onClick={() => setCancellingRequest(null)}>Keep request</button><button className="button button-danger" onClick={cancelRequest}>Cancel request</button></div>
          </section>
        </div>
      )}

      {requestPet && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRequestPet(null); }}>
          <section className="modal requests-modal" role="dialog" aria-modal="true" aria-labelledby="requests-heading">
            <div className="modal-heading"><div><p className="eyebrow">The people who love {requestPet.name}</p><h2 id="requests-heading">Adoption requests</h2></div><button className="modal-close" onClick={() => setRequestPet(null)} aria-label="Close adoption requests">×</button></div>
            {requestLoading ? <LoadingState label="Loading adoption requests..." /> : requestError ? <div className="inline-error" role="alert"><p>{requestError}</p></div> : petRequests.length ? (
              <div className="incoming-requests">
                {petRequests.map((request) => (
                  <article className="incoming-request" key={request._id}>
                    <div className="request-person">
                      <span className="shelter-avatar">{request.adopterId?.name?.charAt(0).toUpperCase() || "?"}</span>
                      <div><strong>{request.adopterId?.name || "Pet lover"}</strong><a href={`mailto:${request.adopterId?.email}`}>{request.adopterId?.email}</a></div>
                      <span className={`status-pill status-${request.status}`}>{request.status}</span>
                    </div>
                    <p><strong>Preferred pickup:</strong> {formatDate(request.pickupDate)}</p>
                    <p className="request-message">{request.message}</p>
                    {request.status === "pending" && requestPet.status === "available" && (
                      <div className="request-decision">
                        <button className="button button-outline" onClick={() => updateRequestStatus(request, "rejected")}>Decline</button>
                        <button className="button button-dark" onClick={() => updateRequestStatus(request, "approved")}>Approve and mark adopted <span aria-hidden="true">→</span></button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : <div className="empty-state modal-empty"><span className="empty-icon">✉</span><h3>No requests yet.</h3><p>New adoption requests for {requestPet.name} will show up here.</p></div>}
            {requestPet.status === "adopted" && <p className="inline-notice">This pet has been adopted, so no more requests can be approved.</p>}
          </section>
        </div>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return <RequireAuth><DashboardContents /></RequireAuth>;
}
