// ─── 1. Mark page as JS-ready ─────────────────────────────────────────────────
// This adds a class to <body> so our fade-in CSS only activates when JS is
// running. Without this, a visitor with JS disabled would see invisible text.
document.body.classList.add('js-loaded');


// ─── 2. Typewriter effect on hero h1 ─────────────────────────────────────────
// Types "Building Ideas\nInto Reality" one character at a time.
// The h1 has a <br> and an <em> tag — instead of typing raw HTML strings
// (which would show literal "<em>" on screen), we build the DOM nodes ourselves.
//
// Key concepts used here:
//   - document.createElement()  → creates a new HTML element in memory
//   - document.createTextNode() → creates a plain-text node (no HTML tags)
//   - parent.insertBefore(newNode, referenceNode) → inserts newNode just before referenceNode
//   - setTimeout(fn, ms) → waits ms milliseconds, then calls fn once

function typewriterEffect() {
  const h1 = document.querySelector('#hero h1');

  // Break the h1 content into typed "parts" so we never type raw HTML
  const parts = [
    { type: 'text', content: 'Building Ideas' },
    { type: 'br' },                              // just insert <br>, no typing delay
    { type: 'text', content: 'Into ' },
    { type: 'em',   content: 'Reality' }         // typed inside an <em> element
  ];

  // Clear h1 and drop a blinking cursor inside it as a starting point
  h1.innerHTML = '<span class="typewriter-cursor">|</span>';
  const cursor = h1.querySelector('.typewriter-cursor');

  const speed   = 80;   // ms between characters — raise to slow down, lower to speed up
  let partIndex = 0;
  let charIndex = 0;
  let emEl      = null; // holds the <em> element while we're typing inside it

  function typeNext() {
    // All parts finished — fade the cursor out after a short pause
    if (partIndex >= parts.length) {
      setTimeout(function () {
        cursor.style.animation  = 'none';
        cursor.style.transition = 'opacity 0.8s';
        cursor.style.opacity    = '0';
      }, 1200);
      return;
    }

    const part = parts[partIndex];

    // <br> — insert instantly with no character-by-character delay
    if (part.type === 'br') {
      h1.insertBefore(document.createElement('br'), cursor);
      partIndex++;
      setTimeout(typeNext, speed);
      return;
    }

    // First character of an <em> part — create the element and move cursor inside it
    // so the blinking cursor always appears right after the last typed character
    if (part.type === 'em' && charIndex === 0) {
      emEl = document.createElement('em');
      h1.insertBefore(emEl, cursor);  // place <em> before cursor in h1
      emEl.appendChild(cursor);       // cursor now lives inside <em>
    }

    const target = (part.type === 'em') ? emEl : h1;

    if (charIndex < part.content.length) {
      // createTextNode makes a plain text character — safer than innerHTML += char
      target.insertBefore(document.createTextNode(part.content[charIndex]), cursor);
      charIndex++;
      setTimeout(typeNext, speed);
    } else {
      // Done with this part — move on
      if (part.type === 'em') {
        h1.appendChild(cursor); // pull cursor back out of <em> into h1
        emEl = null;
      }
      partIndex++;
      charIndex = 0;
      setTimeout(typeNext, speed);
    }
  }

  setTimeout(typeNext, 500); // brief pause before typing begins
}

typewriterEffect();


// ─── 3. Hamburger menu (mobile nav toggle) ────────────────────────────────────
// On small screens the nav hides its links. Clicking ☰ toggles them open/closed.
//
// How it works:
//   - querySelector finds the FIRST element matching a CSS selector
//   - addEventListener listens for an event (here: 'click') on that element
//   - classList.toggle adds a class if it's missing, removes it if it's there

const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');

hamburger.addEventListener('click', function () {
  nav.classList.toggle('nav-open');
});

// Close the menu when any nav link is clicked (so it collapses after navigating)
document.querySelectorAll('nav ul a').forEach(function (link) {
  link.addEventListener('click', function () {
    nav.classList.remove('nav-open');
  });
});


// ─── 3. Highlight active nav link on scroll ───────────────────────────────────
// IntersectionObserver is a built-in browser tool that fires a callback
// whenever a watched element enters or exits the visible area (viewport).
//
// We watch each section. When one becomes visible, we:
//   1. Remove "active" from all nav links
//   2. Add "active" only to the link that matches the visible section's id

const sections = document.querySelectorAll('#hero, #about, #skills, #projects, #contact');
const navLinks = document.querySelectorAll('nav ul a');

const activeObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      navLinks.forEach(function (link) {
        link.classList.remove('active');
      });

      // Build a selector like: nav ul a[href="#about"]
      const matchingLink = document.querySelector('nav ul a[href="#' + entry.target.id + '"]');
      if (matchingLink) {
        matchingLink.classList.add('active');
      }
    }
  });
}, {
  threshold: 0.4  // section must be 40% visible before we count it as "active"
});

sections.forEach(function (section) {
  activeObserver.observe(section);
});


// ─── 4. Scroll fade-in animations ─────────────────────────────────────────────
// A second IntersectionObserver watches elements with class "fade-in".
// When they enter the viewport, we add class "visible" — the CSS in styles.css
// defines a transition that smoothly brings them into view.

const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target); // once animated, stop watching it
    }
  });
}, {
  threshold: 0.15  // start animating when 15% of the element is in view
});

fadeElements.forEach(function (el) {
  fadeObserver.observe(el);
});


// ─── 5. Contact form — send to Formspree via fetch ───────────────────────────
// fetch() sends data to a URL in the background without navigating away.
// new FormData(form) automatically packages up all the named inputs.
// .then() runs when the server responds; .catch() runs if the network fails.
//
// TO ACTIVATE: replace YOUR_FORM_ID below with the ID from formspree.io

const form = document.querySelector('.contact-form');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const button = form.querySelector('button');
  button.textContent = 'Sending…';
  button.disabled = true;

  fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  })
  .then(function (response) {
    if (response.ok) {
      form.innerHTML = '<p class="form-success">Thanks for reaching out! I\'ll get back to you soon.</p>';
    } else {
      button.textContent = 'Send Message';
      button.disabled = false;
      form.insertAdjacentHTML('afterbegin', '<p class="form-error">Something went wrong — please try again.</p>');
    }
  })
  .catch(function () {
    button.textContent = 'Send Message';
    button.disabled = false;
    form.insertAdjacentHTML('afterbegin', '<p class="form-error">Something went wrong — please try again.</p>');
  });
});
