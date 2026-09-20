# Alert5 — landing page

Static landing page for **Alert5**, a cooperative hex-based tactics board game
in development. Its job is to collect email addresses for a launch/update
mailing list and to hold a place for content that gets added later.

- No build step, no dependencies, no framework.
- Artwork is CSS and inline SVG plus one cut-out photo in `images/`.
- Hosted on GitHub Pages via `.github/workflows/deploy.yml`.

```
index.html   markup and all content slots
styles.css   design tokens, layout, the 80s neon visuals
main.js      email form handling, footer year, scroll reveal
```

---

## Before it goes live

The page ships with **empty content areas on purpose** — every one shows as a
dashed box with a monospace field label so the layout doesn't collapse. Work
through this list and the placeholders disappear as you fill them in.

### 0. Removing the placeholder-art disclaimer

Two notices warn that the visuals are temporary:

- the amber bar above the header (`.art-notice` in `index.html`), which
  shares a sticky wrapper with the header so it cannot be scrolled past
- a callout in the gallery section (`.art-callout`)

Delete both blocks once the real artwork is in, then drop `.art-notice`,
`.art-callout` and `.topbar` from `styles.css` and move `position: sticky`
back onto `.site-header`. The `scroll-padding-top` values in `styles.css`
(132px, and 196px under the 860px breakpoint) are sized for the taller
stack and should come back down to about 90px.

### 0b. The hero jet image

`images/jet.webp` (21 KB) with `images/jet.png` (15 KB) as a fallback, served
via `<picture>`. An F-16 photograph, 1193x697, sky masked out, afterburner
plume kept. It sits centred behind the hero headline.

It is a child of `.title-block` rather than positioned against the hero box,
so it stays centred on the headline as the hero reflows instead of relying on
a hand-tuned offset. `.hero-title` is lifted above it with `z-index`.

**How the cutout was made.** Two subjects needing opposite tests:

- *Airframe* — a near silhouette. Luminance p99 is 32 while the sky bottoms out
  at 58, a clean gap, so hysteresis on absolute luminance: seed below 32, grow
  into anything below 48 connected to that seed.
- *Plume* — brighter than the sky and the only saturated thing in frame (sky
  chroma median 9 / p99 16; plume 81+). Gated on colour **and** brightness,
  with graded alpha so the glow falls off instead of ending on a hard cut.

Two approaches that failed, recorded so they are not retried:

1. *A plain darkness threshold* clipped the sunlit upper surfaces of an earlier
   photo — about 8% of the airframe. Hysteresis fixed it.
2. *Fitting a sky surface and thresholding on the difference* works on a smooth
   gradient sky but not this one: cloud structure defeats the polynomial, and
   the fit error let dark cloud next to the jet into the mask.

Neon rim lighting is CSS `drop-shadow` and `brightness(1.5)` lifts the
silhouette off the near-black page; neither is baked into the file.

**Never display wider than `native_px / 2`** or it upscales on a 2x screen and
goes soft. At 1193px native the cap is ~596; the layout uses 580.

Sourcing notes for a replacement: plain sky, aircraft large in frame, strong
tonal separation, clear of the frame edges.

### 1. Email signup — connected and confirmed working

Wired to the Buttondown list `alert5`
(`BUTTONDOWN_USERNAME` in `main.js`). Both forms POST to
`https://buttondown.com/api/emails/embed-subscribe/alert5`.

A real signup has been submitted through the live site and arrived in
Buttondown, so the round trip is confirmed end to end.

Behaviour, verified against a mocked endpoint:

| Case | Result |
| ---- | ------ |
| Success | "Check your inbox for a confirmation email", field cleared |
| Server error | Error message, email left in the field so it can be retried |
| Invalid / empty | Caught before any request is sent |
| `fetch` blocked | Falls back to a plain form POST to Buttondown's own confirmation page, so nobody is silently dropped |
| Honeypot filled | Silently ignored (a bot) |

If `BUTTONDOWN_USERNAME` is ever blanked or reset to a `YOUR-` placeholder,
the form stops submitting and shows an amber "not connected" notice rather
than a false success.

**Switching to ConvertKit or Mailchimp instead?** Replace `ENDPOINT_BASE` and
the request body in `main.js` — the validation, honeypot, status messages and
fallback all stay as they are.

### 2. Meta tags — written

Title, description, Open Graph and Twitter tags are all filled in and
point at `alert5game.com`. Lengths are inside the limits search engines
and social cards truncate at (title 53 chars, descriptions ~148).

One thing outstanding:

- [ ] Add `share-card.png` (1200×630) to the repo root. The meta tags
      already reference it, but the file does not exist, so shared links
      currently render without a preview image.

### 3. Write the page content

Each empty area is a `<span class="slot" data-label="…">`. Delete the span and
type your text in its place. In rough priority order:

- [ ] **Hero** — headline, tagline, short pitch
- [ ] **Signup** — what subscribers get and how often you'll email
- [ ] **What is Alert5** — premise and the four feature cards. The spec
      strip is partly done: players (2–5) and status are set, play time
      and ages are marked `TBD` and need real values.
- [ ] **Gallery** — swap each `.media-slot` for a real `<img>`; keep the `alt`
      text, it matters for accessibility and search
- [ ] **Roadmap** — four milestones; mark progress by adding `is-done` or
      `is-current` to a `<li class="milestone">`
- [ ] **FAQ** — rewrite the four questions and fill in the answers
- [ ] **Footer** — studio/creator name, rights holder, and the four social
      links (every one is `href="#"` right now; delete any platform you
      don't use)

When every slot is gone you can delete the `CONTENT SLOTS` block in
`styles.css`. To hide them all temporarily instead, add this at the end of that
file:

```css
.slot, .media-slot { display: none; }
```

---

## Deploying

The workflow publishes the repository root on every push to `main`.

**One-time setup:** repo **Settings → Pages → Build and deployment → Source:
"GitHub Actions"**. Without that, the workflow runs but nothing goes live.

`.nojekyll` is present so GitHub serves the files as-is rather than running
them through Jekyll.

### Custom domain (alert5game.com, DNS on Cloudflare)

The `CNAME` file at the repo root holds the apex domain. It is part of the
uploaded Pages artifact, so the custom domain survives every deploy rather
than depending only on the repo setting.

Cloudflare DNS records, all **DNS only (grey cloud)**:

| Type  | Name  | Value |
| ----- | ----- | ----- |
| A     | `@`   | `185.199.108.153` |
| A     | `@`   | `185.199.109.153` |
| A     | `@`   | `185.199.110.153` |
| A     | `@`   | `185.199.111.153` |
| AAAA  | `@`   | `2606:50c0:8000::153` |
| AAAA  | `@`   | `2606:50c0:8001::153` |
| AAAA  | `@`   | `2606:50c0:8002::153` |
| AAAA  | `@`   | `2606:50c0:8003::153` |
| CNAME | `www` | `goodapollo32.github.io` |

The `www` target is the user subdomain with no repo path. GitHub redirects
`www` to the apex automatically once the apex is set as the custom domain.

Then **Settings → Pages → Custom domain** → `alert5game.com`, wait for the
certificate to issue, and tick **Enforce HTTPS**.

If the proxy (orange cloud) is ever turned on, **SSL/TLS must be set to Full
(strict)** first. On Flexible, GitHub forces HTTPS while Cloudflare speaks
HTTP to it and requests bounce between them forever.

## Working on it locally

No tooling required — open `index.html` in a browser. For a local server that
behaves more like production:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Notes

- Fonts (Orbitron, Rajdhani, Share Tech Mono) load from Google Fonts, so the
  page needs a network connection to look right. To go fully self-hosted,
  download the files and swap the `<link>` in `index.html` for `@font-face`
  rules.
- Animations respect `prefers-reduced-motion`. The scroll-reveal effect is
  applied by JavaScript only, so content is never hidden if scripts fail.
- Colors live as CSS custom properties at the top of `styles.css` — change
  `--magenta`, `--cyan` and `--violet` to reskin the whole page.
