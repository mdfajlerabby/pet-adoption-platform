"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import PetCard from "@/components/PetCard";
import LoadingState from "@/components/LoadingState";
import { apiRequest } from "@/lib/api";

const communityFavorites = [
  {
    id: "sample-milo",
    name: "Milo",
    species: "Dog",
    breed: "Golden retriever mix",
    age: "2 years",
    gender: "Male",
    location: "Portland, OR",
    adoptionFee: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "sample-luna",
    name: "Luna",
    species: "Cat",
    breed: "Domestic shorthair",
    age: "1 year",
    gender: "Female",
    location: "Austin, TX",
    adoptionFee: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "sample-pip",
    name: "Pip",
    species: "Bird",
    breed: "Green-cheek conure",
    age: "8 months",
    gender: "Unknown",
    location: "Denver, CO",
    adoptionFee: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "sample-peanut",
    name: "Peanut",
    species: "Rabbit",
    breed: "Mini lop",
    age: "1 year",
    gender: "Male",
    location: "Seattle, WA",
    adoptionFee: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "sample-daisy",
    name: "Daisy",
    species: "Dog",
    breed: "Beagle mix",
    age: "3 years",
    gender: "Female",
    location: "Chicago, IL",
    adoptionFee: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "sample-olive",
    name: "Olive",
    species: "Cat",
    breed: "Tabby",
    age: "4 months",
    gender: "Female",
    location: "Brooklyn, NY",
    adoptionFee: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=85",
  },
];

const careTips = [
  {
    number: "01",
    title: "Make space for a slow hello",
    copy: "Give your new friend a quiet corner and time to settle in at their own pace.",
  },
  {
    number: "02",
    title: "Keep the first days simple",
    copy: "A steady routine, fresh water, and familiar comforts help a new home feel safe.",
  },
  {
    number: "03",
    title: "Ask your vet anything",
    copy: "A first checkup is a great moment to talk nutrition, vaccinations, and next steps.",
  },
];

export default function Home() {
  const [featuredPets, setFeaturedPets] = useState(null);
  const [serviceMessage, setServiceMessage] = useState("");

  useEffect(() => {
    apiRequest("/pets?limit=6&sort=createdAt&order=desc")
      .then(({ pets }) =>
        setFeaturedPets(pets.length ? pets.slice(0, 6) : communityFavorites),
      )
      .catch((error) => {
        setFeaturedPets(communityFavorites);
        setServiceMessage(error.message);
      });
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" /> A little more love starts here
          </p>
          <h1>
            Big love comes
            <br />
            in <em>every</em> size.
          </h1>
          <p className="hero-description">
            Your next best friend is waiting for a place to call home. Meet
            adoptable pets and start a beautiful new chapter together.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/pets">
              Find your companion <span aria-hidden="true">→</span>
            </Link>
            <a className="button button-quiet" href="#why-adopt">
              Why adoption? <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span>J</span>
              <span>M</span>
              <span>A</span>
              <span>+</span>
            </div>
            <p>
              <strong>A community full of kind hearts</strong>
              <br />
              ready to help a pet find home
            </p>
          </div>
        </div>
        <div className="hero-image-wrap">
          <Image
            className="hero-image"
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1400&q=90"
            alt="Two happy dogs playing together in a sunny field"
            width={1400}
            height={900}
          />
          <div className="hero-image-note">
            <span className="note-heart">♥</span>
            <span>
              <strong>Room for one more?</strong>
              <small>Your best friend thinks so.</small>
            </span>
          </div>
          <div className="hero-image-index">
            <span>01</span> / 04
          </div>
        </div>
        <div className="hero-scroll">
          SCROLL TO MEET YOUR MATCH <span aria-hidden="true">↓</span>
        </div>
      </section>

      <section className="intro-strip">
        <p>
          GOOD THINGS HAPPEN WHEN WE <span>OPEN OUR HEARTS</span>
        </p>
        <span aria-hidden="true">✳</span>
        <p>
          GOOD THINGS HAPPEN WHEN WE <span>OPEN OUR HEARTS</span>
        </p>
        <span aria-hidden="true">✳</span>
      </section>

      <section className="section section-pets" id="pets">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your new best friend</p>
            <h2>
              Some faces you&apos;ll <em>love.</em>
            </h2>
          </div>
          <Link className="button button-outline" href="/pets">
            Meet all the pets <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {serviceMessage && (
          <p className="inline-notice" role="status">
            {serviceMessage} Showing community favorites while we reconnect.
          </p>
        )}
        {!featuredPets ? (
          <LoadingState label="Meeting our newest arrivals..." />
        ) : (
          <div className="pet-grid">
            {featuredPets.map((pet) => (
              <PetCard key={pet._id || pet.id} pet={pet} sample={!pet._id} />
            ))}
          </div>
        )}
        <div className="section-bottom-link">
          <Link className="text-link" href="/pets">
            There are more good dogs, cats &amp; friends this way{" "}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="why-section" id="why-adopt">
        <div className="why-photo">
          <Image
            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=85"
            alt="A rescued dog sharing a quiet moment with their new family"
            width={1200}
            height={900}
          />
          <div className="photo-stamp">
            <span>
              LOVE
              <br />
              GROWS
              <br />
              HERE
            </span>
            <span aria-hidden="true">✳</span>
          </div>
        </div>
        <div className="why-copy">
          <p className="eyebrow">A home changes everything</p>
          <h2>
            Adoption is a<br />
            <em>love story</em> with
            <br />a wagging tail.
          </h2>
          <p>
            When you adopt, you make room for a pet to feel safe, seen, and
            loved. And somewhere along the way, they do the same for you.
          </p>
          <div className="why-points">
            <div>
              <span>01</span>
              <p>
                <strong>A friend, not a purchase</strong>
                <small>
                  Give a deserving animal the fresh start they need.
                </small>
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <strong>Good for your whole heart</strong>
                <small>More walks, more joy, more reason to come home.</small>
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <strong>One kind choice, big ripple</strong>
                <small>
                  Your adoption helps shelters care for the next pet.
                </small>
              </p>
            </div>
          </div>
          <Link className="text-link" href="/pets">
            Find your kind of wonderful <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="stories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A very good ending</p>
            <h2>
              And then they found <em>each other.</em>
            </h2>
          </div>
          <span className="stories-caption">
            ILLUSTRATIVE MOMENTS, INSPIRED BY ADOPTION
          </span>
        </div>
        <div className="story-grid">
          <article className="story-card story-large">
            <Image
              src="https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=1000&q=85"
              alt="A woman cuddling her adopted rescue dog at home"
              width={1000}
              height={800}
            />
            <div className="story-overlay">
              <span>AUSTIN · A NEW ROUTINE</span>
              <h3>A couch, a sunny spot, a forever home.</h3>
              <p>An illustrative adoption story</p>
            </div>
          </article>
          <article className="story-card">
            <Image
              src="https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=800&q=85"
              alt="A newly adopted cat curled up in a sunny window"
              width={800}
              height={800}
            />
            <div className="story-overlay">
              <span>BROOKLYN · A WINDOW SEAT</span>
              <h3>The best spot in the house is claimed.</h3>
              <p>An illustrative adoption story</p>
            </div>
          </article>
          <article className="story-card">
            <Image
              src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=85"
              alt="A rescue pup exploring a neighborhood walk"
              width={800}
              height={800}
            />
            <div className="story-overlay">
              <span>DENVER · A WALK TOGETHER</span>
              <h3>Everyday walks become little adventures.</h3>
              <p>An illustrative adoption story</p>
            </div>
          </article>
        </div>
      </section>

      <section className="care-section" id="care-tips">
        <div className="care-heading">
          <p className="eyebrow">A soft landing</p>
          <h2>
            First days, <em>good ways.</em>
          </h2>
          <p>
            A little prep goes a long way. Three gentle reminders for bringing a
            new friend home.
          </p>
          <Link className="text-link" href="/pets">
            Start your adoption journey <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="care-list">
          {careTips.map((tip) => (
            <article className="care-tip" key={tip.number}>
              <span>{tip.number}</span>
              <div>
                <h3>{tip.title}</h3>
                <p>{tip.copy}</p>
              </div>
              <span className="care-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="impact-section">
        <div>
          <span className="impact-number">01</span>
          <strong>
            One new
            <br />
            best friend
          </strong>
          <small>
            could change
            <br />
            your every day.
          </small>
        </div>
        <div>
          <span className="impact-number">02</span>
          <strong>
            One more
            <br />
            safe place
          </strong>
          <small>
            opens room for
            <br />
            another rescue.
          </small>
        </div>
        <div className="impact-message">
          <p className="eyebrow">Goodness looks good on you</p>
          <h2>
            Ready to make
            <br />
            some <em>memories?</em>
          </h2>
          <Link className="button button-light" href="/pets">
            Meet your match <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
