# NodeDots

Connect the dots before you act. NodeDots Code reads a pull request against the whole repository, starting with GitHub pull requests.

## State tokens

All interface tokens live in `app/site.css`. Colors identify a finding state; surfaces and ordinary text remain neutral. State labels accompany the symbols.

| Token | State | Light | Dark | Shape | Meaning |
| --- | --- | --- | --- | --- | --- |
| `--confirmed` | Confirmed | `#187245` | `#71c895` | Filled dot | Matches the repo evidence. |
| `--missing` | Missing | `#936000` | `#e4b65c` | Hollow dot | An expected piece is absent. |
| `--conflicting` | Conflicting | `#bc4036` | `#ff9385` | Slashed dot | Two assumptions disagree. |
| `--uncertain` | Uncertain | `#7458ae` | `#b9a3ef` | Dashed outline | More evidence is needed. |
| `--action` | Action required | `#245ce0` | `#97b5ff` | Dot with outer ring | A next step needs completing. |

Neutral palettes: light canvas `#f7f7f2`, surface `#ffffff`, map `#f0f1ed`, text `#202422`, secondary text `#5b625e`; dark canvas `#151816`, surface `#1c211e`, map `#181d1a`, text `#edf0e9`, secondary text `#b0b8af`.

Use Action required for the solid primary CTA and links. Use each state color on its dot, badge, selected node, and selected relationship. Keep unselected node surfaces neutral. Confirmed describes the illustrative evidence, not an unconditional guarantee that code is safe.

## Type and layout

Two font families: Georgia for the hero only; self-hosted [Recursive](https://www.recursive.design/) for UI and body. Recursive uses its proportional `MONO=0` axis for UI, and `MONO=1` for file paths and small uppercase labels. This supplies true monospace without a third family. License: `public/fonts/OFL.txt`.

| Token | Size |
| --- | --- |
| `--text-caption` | 14px |
| `--text-body` | 16px |
| `--text-lead` | 18px |
| `--text-brand` | 20px |
| `--text-title` | 22px |
| `--text-section` | 24px |
| `--text-hero` | 40–88px, fluid |

Spacing uses the `--s1`–`--s12` scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px. Radii are 8px controls, 10px nodes, 16px panels, and pill badges. Sizes, weights, line heights and colors are centralized with these tokens.

Light is the fallback. The first-paint script respects the OS preference; a manual selection takes precedence and persists locally. The theme changes colors without changing geometry. Only selected graph edges animate, and reduced-motion removes that animation.

## Logo and assets

The mark is a chain of five dots: four Confirmed dots and one Missing dot, fourth in the sequence. Keep `NodeDots` casing and one medium weight. SVG wordmarks contain outlined letters, so recipients need no installed font.

- `public/brand/mark.svg`, `wordmark.svg`, `lockup.svg`: light surfaces.
- Matching `-dark.svg` versions: dark surfaces.
- `mark-mono.svg`, `lockup-mono.svg`: one-color use; preserve the hollow dot.
- `public/favicon.svg`, `favicon-16.png`, `favicon-32.png`, `favicon-48.png`, `favicon.ico`, `apple-touch-icon.png`: compact chain for square formats. SVG responds to OS theme; PNG/ICO use the light palette.
- `public/og.png`: 1200×630 social card, wired into Open Graph and X metadata. Generated with the built-in image-generation tool from the brief: warm-white canvas, five-dot logo, the exact hero headline, “Read your change against the whole repo.”, and the five labeled state shapes. Normalized to the requested export dimensions.

Keep at least one dot diameter of clear space. The full mark is at least 16px tall; use the compact favicon at 16×16. Do not stretch, add glow, change the dot order, or fill the hollow dot.

## Do / don't and copy

Do pair color with shape and label, keep contrast at WCAG AA, show file evidence and a suggested next step, and give Billing the default focal position. Do preserve “Illustrative finding · Product in development”.

Don't add decorative gradients, pulsing effects, blurred blobs, color-only meanings, or promotional claims. Don't imply the demo has read the visitor's repo. Its scenarios, paths, and line references are illustrative.

Write plain developer-to-developer sentences. Name what was found: an old Stripe mapping, a missing test, a role mismatch. Use sentence case except small uppercase labels. No hype or country/region references. Keep the hero “Connect the dots. Before you ship.” and the footer tagline.

The routes, stack, waitlist endpoint, payload, storage schema, WebMCP signup contract, and privacy content remain unchanged. No new product pages or features were introduced.
