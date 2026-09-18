# Alert5 — landing page

Static landing page for **Alert5**, a fighter-jet-themed tactical RPG board game
in development. Its job is to collect email addresses for a launch/update
mailing list and to hold a place for content that gets added later.

- No build step, no dependencies, no framework.
- All artwork is CSS and inline SVG, so the site needs zero image files today.
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

### 1. Connect the email signup (required — the form does nothing until you do)

1. Create a newsletter at <https://buttondown.com> (free up to 100 subscribers).
2. Your username is the last part of your newsletter URL:
   `https://buttondown.com/<this-part>`.
3. Open `main.js` and replace the placeholder near the top:

   ```js
   var BUTTONDOWN_USERNAME = 'YOUR-BUTTONDOWN-USERNAME';
   ```

Until that is set, submitting the form shows an amber
*"Signup is not connected yet"* notice and logs a console warning. It never
shows a fake success message and never sends the address anywhere.

Once configured, the form POSTs to Buttondown over `fetch`. If that request is
blocked for any reason, it falls back to a plain form submission that lands on
Buttondown's own confirmation page, so a visitor is never silently dropped.

**Switching to ConvertKit or Mailchimp instead?** Replace `ENDPOINT_BASE` and
the request body in `main.js` — the validation, honeypot, status messages and
fallback all stay as they are.

### 2. Fill in the meta tags (required — these are your search and share preview)

The URLs are already set to `alert5game.com`. What remains is text:

- [ ] `<title>`
- [ ] `<meta name="description">` — aim for 150–160 characters
- [ ] `og:title`, `og:description`, `twitter:title`, `twitter:description`
- [ ] `og:image:alt`
- [ ] Add `share-card.png` (1200×630) to the repo root — the meta tags
      already point at it, but the file does not exist yet, so shared
      links currently show no preview image.

### 3. Write the page content

Each empty area is a `<span class="slot" data-label="…">`. Delete the span and
type your text in its place. In rough priority order:

- [ ] **Hero** — headline, tagline, short pitch
- [ ] **Signup** — what subscribers get and how often you'll email
- [ ] **What is Alert5** — premise, four feature cards, the spec strip
      (players / play time / ages / status)
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
