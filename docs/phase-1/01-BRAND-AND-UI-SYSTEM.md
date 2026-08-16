# Phase 1.1 — Drive the Market Brand and UI System

## Brand idea

Drive the Market combines structured education with disciplined market learning. The identity should feel trustworthy, mature, clear, and instructional—not speculative or promotional.

The sample logo combines an open book, market-chart bars, and a learning symbol. It is a concept asset for approval and later vector refinement.

![Drive the Market logo concept](../../assets/trade-tuter-logo-concept.png)

## Name usage

- Product name: **Drive the Market**
- Do not use: Trade Tutor, TradeTuter, TRADETUTER, or Drive the Market LMS in the primary wordmark.
- Use the full wordmark on public pages and authentication screens.
- Use the symbol alone only where space is restricted after the identity is established.

## Color tokens

| CSS token      |     Value | Intended use               |
| -------------- | --------: | -------------------------- |
| `--olive-950`  | `#20270C` | Deep navigation and footer |
| `--olive-900`  | `#2C3612` | Dark branded surfaces      |
| `--olive-800`  | `#3D4A18` | Sidebar and headings       |
| `--olive-700`  | `#556B2F` | Primary action             |
| `--olive-600`  | `#687C3B` | Primary hover              |
| `--olive-500`  | `#819653` | Data visualization accent  |
| `--olive-200`  | `#D9E0C7` | Selected surface           |
| `--olive-100`  | `#EEF1E5` | Soft brand surface         |
| `--silver-800` | `#62676C` | Strong neutral             |
| `--silver-600` | `#8D9399` | Secondary content          |
| `--silver-400` | `#B8BDC3` | Borders and icons          |
| `--silver-200` | `#DDE0E3` | Dividers and disabled UI   |
| `--silver-100` | `#ECEEEF` | Neutral background         |
| `--silver-50`  | `#F7F8F8` | Application canvas         |
| `--charcoal`   | `#1E221B` | Body text                  |
| `--white`      | `#FFFFFF` | Cards and inverse text     |
| `--danger`     | `#B8443C` | Destructive action         |
| `--warning`    | `#B47724` | Pending/attention state    |

## Gradients

```css
--silver-gradient: linear-gradient(
  135deg,
  #f8f9f9 0%,
  #d9dde0 42%,
  #aeb4ba 72%,
  #f1f3f3 100%
);
--olive-gradient: linear-gradient(
  135deg,
  #2c3612 0%,
  #556b2f 58%,
  #819653 100%
);
--olive-silver-gradient: linear-gradient(
  135deg,
  #2c3612 0%,
  #556b2f 48%,
  #b8bdc3 100%
);
```

Silver gradients are decorative. Body copy and critical controls must always sit on solid, high-contrast surfaces.

## Typography

- UI family: Inter, Geist, or a comparable modern sans-serif
- Display weight: 700–800
- Heading weight: 650–750
- Body weight: 400–500
- Data/tabular figures: enable tabular numerals
- Minimum body text: 14px in dense admin tables; 16px in public and student content

## Spacing and geometry

- Base spacing unit: 4px
- Standard control height: 40px
- Touch control height: 44–48px
- Card radius: 16px
- Control radius: 10px
- Badge radius: full/pill
- Application content maximum: 1440px
- Public reading width: 720px for long text
- Border: 1px silver-200
- Focus ring: 2px olive-500 with 2px offset

## Iconography

- Use a consistent outlined icon family.
- Use icons with text for unfamiliar or high-risk actions.
- Locked content always shows a lock plus the word “Locked.”
- Release uses an unlock/check icon plus “Release materials.”
- Destructive operations do not use olive success styling.

## Status system

| Status              | Treatment                        |
| ------------------- | -------------------------------- |
| Draft               | Silver neutral badge             |
| Scheduled           | Olive outline badge              |
| Conducted           | Blue-neutral informational badge |
| Awaiting approval   | Amber badge                      |
| Completed           | Olive soft badge                 |
| Released            | Solid olive badge                |
| Locked              | Silver badge with lock icon      |
| Suspended/Cancelled | Red badge                        |

## Responsive breakpoints

- Mobile: below 640px
- Tablet: 640–1023px
- Desktop: 1024px and above
- Wide admin: 1280px and above

The final implementation uses content-driven layout changes rather than relying only on device names.

## Accessibility rules

- Target WCAG AA contrast for text and controls.
- Never communicate state using color alone.
- Every interactive element receives a visible focus state.
- Dialog focus remains trapped until closed.
- Data tables provide a mobile card alternative for essential tasks.
- Motion respects reduced-motion preferences.
- Form errors are associated with the relevant field and summarized when useful.
