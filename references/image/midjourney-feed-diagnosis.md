# Midjourney feed diagnosis and profile ablation

Use this when repeated Midjourney generations show distorted faces, anatomy, unstable identity, or unexplained “monster” results and the user asks to inspect the run history rather than one isolated grid.

## Read the feed as an experiment log

Inspect several consecutive grids. Record per grid:

- literal prompt;
- `chaos`, `stylize`, aspect ratio, and mode;
- every personalization/profile token;
- fresh Imagine versus Variation;
- pose complexity, subject count, occlusion, mirrors, and surreal geometry;
- repeated versus grid-local defects in face, neck, hands, limbs, garment boundaries, and identity.

Do not blame vague prose by reflex. Find the parameter that covaries with failure across neighboring grids. A nearby low-chaos/simple-pose grid that stays stable is valuable counter-evidence.

## Profile-stack confounder

Stacked personalization profiles may pull facial geometry, age, gender presentation, body proportions, styling, and editorial grammar in different directions. High `chaos` and high `stylize` amplify that conflict, especially with ballet, twisted poses, asymmetrical garments, clouds, or surreal scenes.

## Minimum ablation matrix

Hold the literal prompt and all other settings fixed:

- A — no personalization profile;
- B — one primary profile;
- C — current stacked profiles.

Start with `chaos 0–8`, `stylize 50–100`, one unobstructed subject, and a simple pose **[미확인]**. Treat these as ablation starting bands, not engine limits; evidence status is registered in [surfaces.md](surfaces.md) §7. Compare anatomy, garment boundaries, four-candidate identity consistency, age/gender/ethnic drift, and prompt fidelity versus profile takeover.

- C fails while A/B remain stable → profile stacking is primary.
- All three fail → simplify pose/composition, then inspect prose.
- Variations fail after a defective parent → restart from fresh Imagine; do not propagate the bad lineage.

## Reporting

Lead with the strongest causal finding. Cite the observed parameter pattern and at least one counterexample. Separate direct visual evidence from inference. Recommend the smallest controlled comparison instead of generic negative-prompt clutter.