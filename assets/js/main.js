/* ==========================================================================
   KANVAS — site behaviour
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     WAITLIST CONFIG
     Fill in ONE of the two options below to make the sign-up form live.

     A) Supabase — create a table called `waitlist` with columns
        email (text, unique), discipline (text), source (text), created_at
        (timestamptz default now()), then paste the project URL and the
        publishable/anon key here.

     B) Any other endpoint (Formspree, Buttondown, your own API): set
        `endpoint` to the URL. The form POSTs JSON
        { email, discipline, source }.
     ---------------------------------------------------------------------- */
  var CONFIG = {
    supabase: {
      url: "",        // e.g. "https://abcdefgh.supabase.co"
      anonKey: "",    // publishable / anon key — safe to expose
      table: "waitlist"
    },
    endpoint: ""      // e.g. "https://formspree.io/f/xxxxxxx"
  };

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("js-ready");

  /* ---------- hero: retire the mask once the K has cleared the frame ------ */
  var heroMedia = document.getElementById("heroMedia");
  if (heroMedia) {
    if (reduced) {
      heroMedia.classList.add("is-open");
    } else {
      heroMedia.addEventListener("animationend", function (e) {
        if (e.animationName === "markOpen") heroMedia.classList.add("is-open");
      });
      // safety net if the animation never fires (e.g. mask unsupported)
      setTimeout(function () { heroMedia.classList.add("is-open"); }, 3200);
    }
  }

  /* ---------- nav ---------------------------------------------------------- */
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-stuck", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- scroll reveals ---------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || reduced) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("is-in"); });
  } else {
    // stagger siblings that share a parent so groups arrive as a group
    var groups = new Map();
    Array.prototype.forEach.call(reveals, function (el) {
      var list = groups.get(el.parentNode) || [];
      el.style.setProperty("--d", list.length * 90 + "ms");
      list.push(el);
      groups.set(el.parentNode, list);
    });

    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // anything already scrolled past (deep link, restored scroll position,
        // in-page jump) must not stay invisible when the reader scrolls back
        var alreadyPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (!entry.isIntersecting && !alreadyPassed) return;
        if (alreadyPassed) entry.target.style.transitionDuration = "0s";
        entry.target.classList.add("is-in");
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

    Array.prototype.forEach.call(reveals, function (el) { revealer.observe(el); });
  }

  /* ---------- product: sync the phone screen to the feature in view ------- */
  var feats = Array.prototype.slice.call(document.querySelectorAll(".feat"));
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));

  if (feats.length && screens.length && "IntersectionObserver" in window) {
    var setActive = function (index) {
      feats.forEach(function (f, i) { f.classList.toggle("is-active", i === index); });
      screens.forEach(function (s, i) { s.classList.toggle("is-active", i === index); });
    };

    // the trigger band has to sit where the copy is actually readable: dead
    // centre on desktop, but below the pinned phone on narrow screens
    var narrow = window.matchMedia("(max-width: 900px)");
    var featObserver;

    var buildFeatObserver = function () {
      if (featObserver) featObserver.disconnect();
      featObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          setActive(Number(entry.target.dataset.feat));
        });
      }, {
        rootMargin: narrow.matches ? "-72% 0px -22% 0px" : "-48% 0px -48% 0px",
        threshold: 0
      });
      feats.forEach(function (f) { featObserver.observe(f); });
    };

    buildFeatObserver();
    if (narrow.addEventListener) narrow.addEventListener("change", buildFeatObserver);
  }

  /* ---------- waitlist form ----------------------------------------------- */
  var form = document.getElementById("waitlist");
  var msg = document.getElementById("formMsg");

  var say = function (text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.toggle("is-error", !!isError);
  };

  var validEmail = function (value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  };

  var send = function (payload) {
    var sb = CONFIG.supabase;

    if (sb.url && sb.anonKey) {
      return fetch(sb.url.replace(/\/+$/, "") + "/rest/v1/" + sb.table, {
        method: "POST",
        headers: {
          "apikey": sb.anonKey,
          "Authorization": "Bearer " + sb.anonKey,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(payload)
      });
    }

    if (CONFIG.endpoint) {
      return fetch(CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    return Promise.reject(new Error("NOT_CONFIGURED"));
  };

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var emailField = form.querySelector("#email");
      var discField = form.querySelector("#discipline");
      var button = form.querySelector(".form__btn");
      var email = emailField.value.trim();

      if (!validEmail(email)) {
        emailField.parentNode.classList.add("has-error");
        emailField.focus();
        say("That email doesn't look right. Check it and try again.", true);
        return;
      }
      emailField.parentNode.classList.remove("has-error");

      var original = button.textContent;
      button.disabled = true;
      button.textContent = "Joining…";
      say("");

      send({
        email: email,
        discipline: discField.value || null,
        source: "kanvas-site"
      })
        .then(function (res) {
          if (res.status === 409 || res.status === 422) {
            say("You're already on the list. We'll be in touch.");
            form.reset();
            return;
          }
          if (!res.ok) throw new Error("HTTP " + res.status);
          say("You're on the list. We'll email you the day Kanvas opens.");
          form.reset();
        })
        .catch(function (err) {
          if (err && err.message === "NOT_CONFIGURED") {
            console.warn(
              "[Kanvas] Sign-up is not connected yet. Add a Supabase project or an " +
              "endpoint in assets/js/main.js → CONFIG. Captured:",
              { email: email, discipline: discField.value }
            );
            say("Sign-up isn't live yet. Check back shortly.", true);
            return;
          }
          say("Something went wrong. Try again in a moment.", true);
        })
        .finally(function () {
          button.disabled = false;
          button.textContent = original;
        });
    });

    form.querySelector("#email").addEventListener("input", function () {
      this.parentNode.classList.remove("has-error");
    });
  }

  /* ---------- misc --------------------------------------------------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
