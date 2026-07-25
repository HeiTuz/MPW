# GPT Image product multi-cut consistency

Use when the user asks for several product photos delivered as separate images, especially from multi-image product references.

## Core contract

- **One call = one image.** Never compose independent product shots into a collage, grid, or contact sheet unless that sheet itself is requested.
- Treat all supplied references as one **product family**. Keep construction fixed across every output: component count, silhouette, proportions, dimensions, relative placement, seams, closures, material behavior, patterns, and logo placement.
- Do not phrase color as part of a universal identity lock when references show multiple colorways. Instead, first inventory the visible colorways; preserve construction across colors, select one verified colorway per output, and distribute every verified colorway across the complete delivery. Never invent, mix, or recolor beyond the reference set.
- Let the generator choose the cut plan from product type, set composition, buyer-decision needs, and reference-visible details. Include enough silhouette/angle, functional/context, and detail coverage rather than hard-coding a fixed sequence.
- Detail cuts are PDP (product-detail-page) shots, not decorative macros: show buyer-relevant seam, weave, hardware, label, pocket, hem, closure, or finish at useful scale with true color/material readability.

## White-background studio default

When the request specifies pure white + frontal lighting, state: seamless pure-white `#FFFFFF` background without props, gradient, or environmental depth; soft even frontal light; only a faint short contact shadow at the product-floor meeting point to retain edge legibility. This avoids white products dissolving into the backdrop without introducing a gray studio look.

## Delivery and QC

Before continuing to the next output, compare against the reference set and preceding accepted cut for silhouette, component count, relative dimensions, colorway accuracy, and material. Regenerate only the failed cut. Deliver each image separately with a short `cut number · colorway · scene` label.

## Prompt skeleton

1. Separate-image production contract.
2. Construction identity lock (exclude color when multi-color).
3. Colorway inventory + coverage rule, if applicable.
4. Autonomous cut-plan rule.
5. PDP detail-cut rule.
6. Lighting/background rule.
7. Per-cut QC and separate delivery rule.
