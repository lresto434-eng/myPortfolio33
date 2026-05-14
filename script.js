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

const sections = document.querySelectorAll('#hero, #about, #skills, #projects, #music, #contact');
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


// ─── 5. Music Section — iTunes API ───────────────────────────────────────────
// fetch() sends a request to a URL and returns a Promise.
// async/await is a cleaner way to write .then() chains — instead of chaining
// .then() after .then(), you just write "await" and the code reads top to bottom.
//
// Promise.all fires ALL the fetch calls at the same time and waits for every
// one to finish — much faster than fetching them one after another.

function loadMusicSection() {
  // Track data fetched from iTunes API and hardcoded for reliability across all devices
  const tracks = [
    {
      name: 'King of Kings',
      artist: 'Hillsong Worship & Brooke Ligertwood',
      art: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3f/1a/22/3f1a22c8-b48a-ae68-f1f6-ac8066d24702/9320428341303.png/300x300bb.jpg',
      preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b2/4e/9f/b24e9fa2-a071-d813-ff74-4e9d7472bd59/mzaf_6282635809404644004.plus.aac.p.m4a'
    },
    {
      name: 'One',
      artist: 'Metallica',
      art: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/f3/83/b5f38312-5b95-9a09-fcb9-5622dd5ea077/858978005820.png/300x300bb.jpg',
      preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/15/70/4f/15704fc6-5323-f790-10cd-bb8a162e8bf4/mzaf_18179605505662845535.plus.aac.p.m4a'
    },
    {
      name: 'Master of Puppets',
      artist: 'Metallica',
      art: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/b8/5a/82/b85a8259-60d9-bfaa-770a-2baac8380e87/858978005196.png/300x300bb.jpg',
      preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/da/e7/9c/dae79c08-a960-2d21-8eab-42e9d70e29e6/mzaf_7135498142102205621.plus.aac.p.m4a'
    },
    {
      name: 'Enter Sandman',
      artist: 'Metallica',
      art: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2e/94/95/2e9495d7-dfe3-ddc8-87ef-6ef797a60218/850007452056.png/300x300bb.jpg',
      preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/85/a5/65/85a565a5-c992-0a77-a1be-c4b190c7f395/mzaf_12174803259665081383.plus.aac.p.m4a'
    },
    {
      name: 'Pride and Joy',
      artist: 'Stevie Ray Vaughan',
      art: 'https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/4c/30/3b/4c303b15-31ec-2f95-5beb-370471968188/dj.fbyalctw.jpg/300x300bb.jpg',
      preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/77/be/cb/77becb7e-f631-a667-32a5-5bf4ffca8f25/mzaf_17145952464433995820.plus.aac.p.m4a'
    },
    {
      name: 'Texas Flood',
      artist: 'Stevie Ray Vaughan',
      art: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/34/da/84/34da8426-f27a-9a82-de08-e94083b7d2eb/23CRGIM36500.rgb.jpg/300x300bb.jpg',
      preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4c/f2/ca/4cf2ca9b-009c-aa2a-0a86-08c6df7576c6/mzaf_1059658685779354335.plus.aac.p.m4a'
    },
    {
      name: 'Wish You Were Here',
      artist: 'Pink Floyd',
      art: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/aa/e0/ab/aae0ab6a-d906-a189-81bf-70b56aa43f7a/886445635843.jpg/300x300bb.jpg',
      preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5e/4b/35/5e4b3554-282d-12dd-e420-728287a1d3b1/mzaf_14938061551507100947.plus.aac.p.m4a'
    },
    {
      name: 'Comfortably Numb',
      artist: 'Pink Floyd',
      art: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3e/17/ec/3e17ec6d-f980-c64f-19e0-a6fd8bbf0c10/886445635850.jpg/300x300bb.jpg',
      preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/fe/44/11/fe441140-ff52-28ef-d7c4-d87b3084d959/mzaf_9494577035851753023.plus.aac.p.m4a'
    },
    {
      name: 'Time',
      artist: 'Pink Floyd',
      art: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3e/76/b0/3e76b0e3-762b-2286-a019-8afb19cee541/886445635829.jpg/300x300bb.jpg',
      preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/da/8b/ed/da8bed67-d37d-eb79-d045-ab9b2770d945/mzaf_17679948615611584950.plus.aac.p.m4a'
    }
  ];

  const grid = document.querySelector('.music-grid');

  tracks.forEach(function (track) {
    const card = document.createElement('div');
    card.classList.add('music-card');
    card.innerHTML =
      '<img src="' + track.art + '" alt="' + track.name + '" class="music-art" />' +
      '<div class="music-info">' +
        '<p class="music-track">' + track.name + '</p>' +
        '<p class="music-artist">' + track.artist + '</p>' +
      '</div>' +
      '<button class="music-play" data-preview="' + track.preview + '" aria-label="Play">&#9654;</button>';
    grid.appendChild(card);
  });

  const audio = new Audio();
  let activeBtn = null;

  grid.addEventListener('click', function (e) {
    const btn = e.target.closest('.music-play');
    if (!btn) return;

    if (btn === activeBtn && !audio.paused) {
      audio.pause();
      btn.innerHTML = '&#9654;';
      return;
    }

    if (activeBtn) {
      audio.pause();
      activeBtn.innerHTML = '&#9654;';
    }

    audio.src = btn.dataset.preview;
    audio.play();
    btn.innerHTML = '&#9646;&#9646;';
    activeBtn = btn;

    audio.onended = function () {
      btn.innerHTML = '&#9654;';
      activeBtn = null;
    };
  });
}

loadMusicSection();


// ─── 6. Contact form — send to Formspree via fetch ───────────────────────────
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

  fetch('https://formspree.io/f/xjglqgln', {
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
