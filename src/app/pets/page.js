"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingState from "@/components/LoadingState";
import PetCard from "@/components/PetCard";
import { apiRequest } from "@/lib/api";

const speciesOptions = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

export default function PetsPage() {
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams({ q: query, limit: "12", page: String(page) });
      if (species) params.set("species", species);
      const [sortBy, order] = sort.split(":");
      params.set("sort", sortBy);
      params.set("order", order);
      setLoading(true);
      setError("");
      apiRequest(`/pets?${params.toString()}`)
        .then((data) => {
          if (active) setResult(data);
        })
        .catch((requestError) => {
          if (active) {
            setError(requestError.message);
            setResult(null);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, query ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [page, query, retry, sort, species]);

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  return (
    <main className="listing-page">
      <section className="listing-hero">
        <div className="page-container">
          <p className="eyebrow">Good things start with hello</p>
          <h1>Find your <em>forever friend.</em></h1>
          <p>A new best friend, a brighter home, a reason to take the long way back. Your next chapter starts here.</p>
          <div className="listing-hero-decoration" aria-hidden="true">✳</div>
        </div>
      </section>

      <section className="page-container pets-browser">
        <div className="browser-heading">
          <div><p className="eyebrow">The latest little loves</p><h2>Meet the pets</h2></div>
          <span>{result ? `${result.total} ${result.total === 1 ? "friend" : "friends"} looking for home` : "Find your new best friend"}</span>
        </div>
        <div className="filter-bar">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => changeFilter(setQuery, event.target.value)} placeholder="Search by pet name..." aria-label="Search pets by name" />
            {query && <button type="button" onClick={() => changeFilter(setQuery, "")} aria-label="Clear search">×</button>}
          </label>
          <label className="filter-select"><span>Species</span>
            <select value={species} onChange={(event) => changeFilter(setSpecies, event.target.value)}>
              <option value="">All friends</option>
              {speciesOptions.map((option) => <option key={option} value={option}>{option}s</option>)}
            </select>
          </label>
          <label className="filter-select"><span>Sort by</span>
            <select value={sort} onChange={(event) => changeFilter(setSort, event.target.value)}>
              <option value="createdAt:desc">Newest arrivals</option>
              <option value="name:asc">Name, A to Z</option>
              <option value="adoptionFee:asc">Fee, low to high</option>
              <option value="adoptionFee:desc">Fee, high to low</option>
            </select>
          </label>
        </div>

        {loading ? <LoadingState label="Finding your kind of wonderful..." /> : error ? (
          <div className="inline-error" role="alert"><strong>We couldn&apos;t load the pet listings.</strong><p>{error}</p><button className="button button-outline" onClick={() => setRetry((current) => current + 1)}>Try again</button></div>
        ) : result?.pets.length ? (
          <>
            <div className="pet-grid">
              {result.pets.map((pet) => <PetCard key={pet._id} pet={pet} />)}
            </div>
            {result.pages > 1 && (
              <div className="pagination">
                <button className="button button-outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>← Previous</button>
                <span>Page {page} of {result.pages}</span>
                <button className="button button-outline" disabled={page >= result.pages} onClick={() => setPage((current) => current + 1)}>Next →</button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state browser-empty">
            <span className="empty-icon">🐾</span>
            <h2>No matches just yet.</h2>
            <p>Try a different name or species. Your perfect friend may be one search away.</p>
            <button className="button button-dark" onClick={() => { setQuery(""); setSpecies(""); setPage(1); }}>Clear filters</button>
          </div>
        )}
        <div className="list-pet-prompt"><span>Have a pet who needs a loving home?</span><Link className="text-link" href="/dashboard#add-pet">Create a listing <span aria-hidden="true">→</span></Link></div>
      </section>
    </main>
  );
}
