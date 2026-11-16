# GPT Image product multi-cut consistency

Use when the user asks for several product photos delivered as separate images, especially from multi-image product references.

First distinguish new cut generation from editing supplied originals. For one-result-per-input edits, use [lanes.md](lanes.md) §편집·제품 배치 압축: preserve upload order, framing, visible scope, requested colors, and output count. Do not apply the new cut-plan or colorway-distribution rules below to that request.

## Core contract

- **One independent cut = one separate image.** Never compose independent product shots into a collage, grid, or contact sheet unless that sheet itself is requested. Keep the requested output count; a surface's supported batch count, not this document, determines how many images one call can return.
- For a declared **product family**, keep construction fixed across its outputs: component count, silhouette, proportions, dimensions, relative placement, seams, closures, material behavior, patterns, and logo placement. Keep unrelated product sets separate.
- First determine the requested color scope. Lock a specified single colorway even when references contain other colors. For a requested multi-color series, inventory the relevant verified colorways, preserve construction across colors, and select one verified colorway per output. Cover every colorway only when requested; do not add outputs or unrequested colors. If required coverage conflicts with the requested count, resolve that conflict before execution. Never invent, mix, or recolor beyond the authorized reference set.
- Preserve a supplied cut plan, sequence, and framing. Choose only delegated cut-plan axes from product type, set composition, buyer-decision needs, and reference-visible details. When the plan is delegated, include useful silhouette/angle, functional/context, and detail coverage rather than hard-coding a fixed sequence.
- Detail cuts are PDP (product-detail-page) shots, not decorative macros: show buyer-relevant seam, weave, hardware, label, pocket, hem, closure, or finish at useful scale with true color/material readability.

## White-background studio default

When the request specifies pure white + frontal lighting, state: seamless pure-white background without props, gradient, or environmental depth; soft even frontal light. Keep the color as the name the user gave and do not invent a HEX code ([surface-contracts.md](surface-contracts.md) §4.1). Preserve a requested shadowless finish; add a faint contact shadow only when the desired staging calls for it.

## Delivery and QC

These are execution-agent steps, not image-model prompt content; keep that boundary from [surface-contracts.md](surface-contracts.md) §3.2.3. Compare each returned cut against the reference set for silhouette, component count, relative dimensions, colorway accuracy, and material. For a supported batch, review its cuts after it returns. For sequential work that reuses an earlier result, approve that result before using it as the next input. Retry only within the authorized scope, targeting the failed cut rather than accepted outputs. Deliver each image separately in the requested format; use a short `cut number · colorway · scene` label only when compatible with that format. Do not claim QC, saved files, or completed generation when only drafting prompts.

## Prompt skeleton

Use only the conditions needed for the requested cut; this is not a mandatory section set.

1. Separate-image composition and requested cut.
2. Construction identity lock (exclude color when multi-color).
3. Selected colorway and authorized coverage, if applicable.
4. Supplied cut plan, or delegated choices.
5. PDP detail-cut rule.
6. Lighting/background rule.

Keep per-cut QC, retries, file paths, and delivery labels in the separate execution handoff, not this image prompt.
