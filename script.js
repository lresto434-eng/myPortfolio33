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


// ─── 5. Music Section — YouTube IFrame API + iTunes Search API ───────────────
//
// TWO APIs are used here:
//   1. YouTube IFrame API  — embeds a real YouTube player for full-length songs
//   2. iTunes Search API   — lets users search any artist for 30s previews
//
// The YouTube IFrame API works by loading a script from YouTube, which then
// calls window.onYouTubeIframeAPIReady when it's ready. We define that function
// globally so YouTube can find it.

var ytPlayer; // var (not const) so it's truly global

// Featured tracks — YouTube video IDs confirmed and verified
var featuredTracks = [
  { name: 'King of Kings',      artist: 'Hillsong Worship',       ytId: 'Of5IcFWiEpg' },
  { name: 'One',                artist: 'Metallica',               ytId: 'WM8bTdBs-cw' },
  { name: 'Master of Puppets',  artist: 'Metallica',               ytId: 'E0ozmU9cJDg' },
  { name: 'Around the World',   artist: 'Red Hot Chili Peppers',   ytId: 'a9eNQZbjpJk' },
  { name: 'Pride and Joy',      artist: 'Stevie Ray Vaughan',      ytId: 'I3MTGhRC82s' },
  { name: 'Comfortably Numb',   artist: 'Pink Floyd',              ytId: '_FrOQC-zEog' },
  { name: 'Wish You Were Here', artist: 'Pink Floyd',              ytId: 'IXdNnw99-Ic' },
  { name: 'Time',               artist: 'Pink Floyd',              ytId: 'JwYX52BP2Sk' }
];

// Called automatically by the YouTube IFrame API script once it has loaded
window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player', {
    width:  '100%',
    height: '100%',
    videoId: featuredTracks[0].ytId,  // King of Kings
    playerVars: {
      autoplay: 1,
      rel:      0,   // don't show unrelated videos at the end
      modestbranding: 1
    },
    events: {
      onReady: function (e) {
        e.target.playVideo();
      }
    }
  });
};

// Render featured track cards — clicking loads the song into the YouTube player
function loadMusicSection() {
  var grid = document.querySelector('.music-featured-grid');

  featuredTracks.forEach(function (track, index) {
    var card = document.createElement('div');
    card.classList.add('music-card');
    if (index === 0) card.classList.add('active'); // King of Kings starts active

    // YouTube provides free thumbnail images for every video by ID
    card.innerHTML =
      '<img src="https://img.youtube.com/vi/' + track.ytId + '/hqdefault.jpg" alt="' + track.name + '" class="music-art" />' +
      '<div class="music-info">' +
        '<p class="music-track">' + track.name + '</p>' +
        '<p class="music-artist">' + track.artist + '</p>' +
      '</div>';

    card.addEventListener('click', function () {
      // Remove active from all cards, set it on the clicked one
      document.querySelectorAll('.music-featured-grid .music-card').forEach(function (c) {
        c.classList.remove('active');
      });
      card.classList.add('active');

      // Load and play the video in the YouTube player
      if (ytPlayer && ytPlayer.loadVideoById) {
        ytPlayer.loadVideoById(track.ytId);
        document.getElementById('yt-now-playing').textContent = '♪ ' + track.name + ' — ' + track.artist;

        // Scroll the player into view smoothly
        document.querySelector('.yt-player-wrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    grid.appendChild(card);
  });
}

loadMusicSection();


// ─── YouTube Search API ───────────────────────────────────────────────────────
// Uses the YouTube Data API v3 to search for videos.
// Each search result card loads that video into the main YouTube player.
//
// API endpoint: https://www.googleapis.com/youtube/v3/search
// Parameters:
//   part=snippet  — return title, channel, thumbnail
//   type=video    — only return videos (not playlists/channels)
//   q=QUERY       — search term
//   maxResults=9  — how many to return
//   key=API_KEY   — your credential

var YT_API_KEY = 'AIzaSyDhCG33EUGLzJpFC9EwoKUKCcijexGbvLE';

var searchGrid  = document.querySelector('.music-search-grid');
var searchBtn   = document.querySelector('#music-search-btn');
var searchInput = document.querySelector('#music-input');

// Clicking a search result card loads it into the YouTube player
searchGrid.addEventListener('click', function (e) {
  var card = e.target.closest('.music-card');
  if (!card || !card.dataset.ytid) return;

  document.querySelectorAll('.music-featured-grid .music-card').forEach(function (c) {
    c.classList.remove('active');
  });
  document.querySelectorAll('.music-search-grid .music-card').forEach(function (c) {
    c.classList.remove('active');
  });
  card.classList.add('active');

  if (ytPlayer && ytPlayer.loadVideoById) {
    ytPlayer.loadVideoById(card.dataset.ytid);
    document.getElementById('yt-now-playing').textContent = '♪ ' + card.dataset.title;
    document.querySelector('.yt-player-wrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

function searchArtist() {
  var term = searchInput.value.trim();
  if (!term) return;

  searchBtn.textContent = 'Searching…';
  searchBtn.disabled    = true;
  searchGrid.innerHTML  = '<p style="color:rgb(138,127,112);text-align:center;">Loading…</p>';

  // YouTube Data API v3 search request
  fetch(
    'https://www.googleapis.com/youtube/v3/search' +
    '?part=snippet' +
    '&type=video' +
    '&maxResults=9' +
    '&q=' + encodeURIComponent(term) +
    '&key=' + YT_API_KEY
  )
    .then(function (r) { return r.json(); })
    .then(function (data) {
      searchGrid.innerHTML = '';

      if (data.error) {
        searchGrid.innerHTML = '<p style="color:rgb(138,127,112);text-align:center;">API error: ' + data.error.message + '</p>';
        return;
      }

      if (!data.items || data.items.length === 0) {
        searchGrid.innerHTML = '<p style="color:rgb(138,127,112);text-align:center;">No results found.</p>';
        return;
      }

      data.items.forEach(function (item) {
        var videoId   = item.id.videoId;
        var title     = item.snippet.title;
        var channel   = item.snippet.channelTitle;
        var thumbnail = item.snippet.thumbnails.high
                      ? item.snippet.thumbnails.high.url
                      : item.snippet.thumbnails.default.url;

        var card = document.createElement('div');
        card.classList.add('music-card');
        card.dataset.ytid  = videoId;
        card.dataset.title = title;
        card.style.cursor  = 'pointer';

        card.innerHTML =
          '<img src="' + thumbnail + '" alt="' + title + '" class="music-art" />' +
          '<div class="music-info">' +
            '<p class="music-track">' + title + '</p>' +
            '<p class="music-artist">' + channel + '</p>' +
          '</div>';

        searchGrid.appendChild(card);
      });
    })
    .catch(function () {
      searchGrid.innerHTML = '<p style="color:rgb(138,127,112);text-align:center;">Search failed — check your connection.</p>';
    })
    .finally(function () {
      searchBtn.textContent = 'Search';
      searchBtn.disabled    = false;
    });
}

searchBtn.addEventListener('click', searchArtist);
searchInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') searchArtist();
});


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
