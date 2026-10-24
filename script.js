/* ==========================================================
   Kristan Apartments — script
   ========================================================== */
(function () {
  "use strict";

  // Booking.com page used for availability searches
  const BOOKING_URL = "https://www.booking.com/hotel/bg/kristan.bg.html";

  /* ---------- Sticky nav ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll("#navLinks a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Booking form ---------- */
  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");
  const note = document.getElementById("nightsNote");
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  const today = new Date(); today.setHours(12, 0, 0, 0);
  checkin.min = iso(today);
  checkin.value = iso(addDays(today, 7));
  checkout.min = iso(addDays(today, 8));
  checkout.value = iso(addDays(today, 12));

  function updateNights() {
    const a = new Date(checkin.value), b = new Date(checkout.value);
    const n = Math.round((b - a) / 86400000);
    note.textContent = n > 0 ? t(n === 1 ? "book.night" : "book.nights").replace("{n}", n) : "";
  }
  checkin.addEventListener("change", () => {
    const minOut = addDays(new Date(checkin.value), 1);
    checkout.min = iso(minOut);
    if (new Date(checkout.value) <= new Date(checkin.value)) checkout.value = iso(minOut);
    updateNights();
  });
  checkout.addEventListener("change", updateNights);

  document.getElementById("book").addEventListener("submit", (e) => {
    e.preventDefault();
    const kids = +document.getElementById("children").value;
    const params = new URLSearchParams({
      checkin: checkin.value,
      checkout: checkout.value,
      group_adults: document.getElementById("adults").value,
      group_children: kids,
      no_rooms: 1,
      lang: currentLang === "bg" ? "bg" : "en-gb",
    });
    for (let i = 0; i < kids; i++) params.append("age", "8");
    window.open(`${BOOKING_URL}?${params}`, "_blank", "noopener");
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- Gallery lightbox ---------- */
  const PHOTO_COUNT = 29; // img/gallery/01.jpg … 29.jpg
  const ROOT = document.documentElement.dataset.root || "";
  const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => `${ROOT}img/gallery/${String(i + 1).padStart(2, "0")}.jpg`);
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  const lbCount = lb.querySelector(".lightbox__count");
  let idx = 0;
  function show(i) {
    idx = (i + photos.length) % photos.length;
    lbImg.src = photos[idx];
    lbCount.textContent = `${idx + 1} / ${photos.length}`;
    // preload neighbours
    [idx + 1, idx - 1].forEach((n) => { new Image().src = photos[(n + photos.length) % photos.length]; });
  }
  function openLb(i) { show(i); lb.hidden = false; document.body.style.overflow = "hidden"; }
  function closeLb() { lb.hidden = true; lbImg.src = ""; document.body.style.overflow = ""; }

  document.querySelectorAll(".gallery__item").forEach((btn) =>
    btn.addEventListener("click", () => openLb(Math.max(0, photos.indexOf(btn.dataset.src))))
  );
  document.getElementById("allPhotos").addEventListener("click", () => openLb(0));
  lb.querySelector(".lightbox__nav--prev").addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
  lb.querySelector(".lightbox__nav--next").addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lightbox__close")) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "ArrowLeft") show(idx - 1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  document.getElementById("year").textContent = new Date().getFullYear();


  /* ---------- Language (the page itself is EN at / and BG at /bg/) ---------- */
  const currentLang = document.documentElement.lang === "bg" ? "bg" : "en";
  const STR = {
    en: { night: "{n} night", nights: "{n} nights" },
    bg: { night: "{n} нощувка", nights: "{n} нощувки" },
  };
  function t(key) { return STR[currentLang][key.replace("book.", "")]; }
  updateNights();

})();
