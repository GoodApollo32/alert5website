/* ============================================================
   ALERT5 — landing page behaviour

   MAIN THING TO CONFIGURE: BUTTONDOWN_USERNAME, just below.
   Until you set it, the signup forms deliberately do NOT submit
   anywhere and show an amber "not configured" notice instead of
   a fake success message.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG — replace this with your Buttondown username.

     1. Sign up at https://buttondown.com (free up to 100 subscribers).
     2. Your username is the last part of your newsletter URL:
        https://buttondown.com/<THIS-PART>
     3. Paste it between the quotes below and redeploy.
     ---------------------------------------------------------- */
  var BUTTONDOWN_USERNAME = 'alert5';

  /* Endpoint Buttondown's embedded forms post to. Normally no need to touch. */
  var ENDPOINT_BASE = 'https://buttondown.com/api/emails/embed-subscribe/';

  var MESSAGES = {
    empty:      'Enter an email address.',
    invalid:    'That email address does not look right.',
    pending:    'Transmitting…',
    success:    'Confirmed. Check your inbox for a confirmation email.',
    failure:    'Something went wrong. Please try again in a moment.',
    unconfigured:
      'Signup is not connected yet — set BUTTONDOWN_USERNAME in main.js.'
  };

  function isConfigured() {
    return (
      typeof BUTTONDOWN_USERNAME === 'string' &&
      BUTTONDOWN_USERNAME.trim() !== '' &&
      BUTTONDOWN_USERNAME.indexOf('YOUR-') !== 0
    );
  }

  /* Deliberately permissive: the provider does the real validation.
     This only catches obvious typos before a round trip. */
  function looksLikeEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function setStatus(el, state, message) {
    if (!el) return;
    el.setAttribute('data-state', state);
    el.textContent = message;
  }

  /* Fallback path: submit the form the old-fashioned way so the
     visitor still gets subscribed if fetch is blocked (CORS, an
     extension, an offline-ish network). This navigates to
     Buttondown's own confirmation page. */
  function nativeSubmit(form, email) {
    var real = document.createElement('form');
    real.method = 'POST';
    real.action = ENDPOINT_BASE + encodeURIComponent(BUTTONDOWN_USERNAME);
    real.style.display = 'none';

    var field = document.createElement('input');
    field.type = 'hidden';
    field.name = 'email';
    field.value = email;
    real.appendChild(field);

    document.body.appendChild(real);
    real.submit();
  }

  function wireForm(form) {
    var input = form.querySelector('input[type="email"]');
    var honeypot = form.querySelector('input[name="website"]');
    var button = form.querySelector('button[type="submit"]');
    var status = document.getElementById(
      input && input.getAttribute('aria-describedby')
    );

    if (!input) return;

    input.addEventListener('input', function () {
      input.removeAttribute('aria-invalid');
      if (status && status.getAttribute('data-state') === 'error') {
        setStatus(status, '', '');
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      /* Honeypot tripped — a bot filled a field humans never see.
         Say nothing and do nothing. */
      if (honeypot && honeypot.value !== '') return;

      var email = input.value.trim();

      if (email === '') {
        input.setAttribute('aria-invalid', 'true');
        setStatus(status, 'error', MESSAGES.empty);
        input.focus();
        return;
      }

      if (!looksLikeEmail(email)) {
        input.setAttribute('aria-invalid', 'true');
        setStatus(status, 'error', MESSAGES.invalid);
        input.focus();
        return;
      }

      if (!isConfigured()) {
        setStatus(status, 'config', MESSAGES.unconfigured);
        return;
      }

      input.removeAttribute('aria-invalid');
      setStatus(status, 'pending', MESSAGES.pending);
      if (button) {
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
      }

      var body = new URLSearchParams();
      body.set('email', email);

      fetch(ENDPOINT_BASE + encodeURIComponent(BUTTONDOWN_USERNAME), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      })
        .then(function (response) {
          if (response.ok) {
            setStatus(status, 'success', MESSAGES.success);
            form.reset();
          } else {
            setStatus(status, 'error', MESSAGES.failure);
          }
        })
        .catch(function () {
          /* Could not reach the API from JavaScript. Rather than
             report a failure we may not actually have, hand off to
             a plain form POST, which is not subject to CORS. */
          nativeSubmit(form, email);
        })
        .then(function () {
          if (button) {
            button.disabled = false;
            button.removeAttribute('aria-busy');
          }
        });
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('[data-signup-form]');
    Array.prototype.forEach.call(forms, wireForm);

    /* Footer copyright year */
    var year = document.querySelector('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());

    /* Warn in the console so an unconfigured form is obvious in dev. */
    if (!isConfigured()) {
      console.warn(
        '[Alert5] Email signup is not connected. Set BUTTONDOWN_USERNAME in main.js.'
      );
    }

    /* Gentle fade-up as sections enter the viewport. Skipped entirely
       for visitors who prefer reduced motion, and for browsers without
       IntersectionObserver (content just shows immediately). */
    var prefersReduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced && 'IntersectionObserver' in window) {
      var targets = document.querySelectorAll('.section .wrap > *');

      var revealAll = function () {
        Array.prototype.forEach.call(targets, function (el) {
          el.classList.add('is-visible');
        });
      };

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
      );

      Array.prototype.forEach.call(targets, function (el, i) {
        el.classList.add('reveal');
        el.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
        observer.observe(el);
      });

      /* Failsafe. The reveal hides content until it scrolls into view,
         so anything that stops the observer from firing — a printed
         page, a full-page screenshot, an in-page search, a browser
         quirk — would leave the page looking blank. Show everything
         unconditionally after a few seconds regardless. */
      window.setTimeout(revealAll, 4000);
      window.addEventListener('beforeprint', revealAll);
    }
  });
})();
