# Midjourney feed diagnosis and profile ablation

Use this when repeated Midjourney generations show distorted faces, anatomy, unstable identity, or unexplained “monster” results and the user asks to inspect the run history rather than one isolated grid.

Model and reference compatibility follow [midjourney-identity.md](../midjourney-identity.md), checked against official documentation on 2026-09-05. V8 Edit references and V7 Omni runs are different paths; an identity failure alone is not a reason to switch versions.

## Read the feed as an experiment log

Inspect several consecutive grids. Record per grid:

- literal prompt;
- actual model version, web/Discord surface, `chaos`, `stylize`, aspect ratio, and mode;
- each attached image, its role and order, and the reference slot actually used;
- every personalization/profile token;
- fresh Imagine, Edit, or Variation, with its source image and parent result;
- pose complexity, subject count, occlusion, mirrors, and surreal geometry;
- repeated versus grid-local defects in face, neck, hands, limbs, garment boundaries, and identity.

Do not blame vague prose by reflex. Identify settings that covary with failure and check counterexamples. A successful run with the same reference but a different slot or simpler pose can narrow the cause. Correlation across runs is a hypothesis, not causal proof.

## Profile-stack confounder

Treat conflicting personalization profiles as one possible cause. Reference-role mix-ups, a defective parent image, model changes, pose complexity, and styling strength are competing explanations. Do not infer a profile failure merely from unusual anatomy.

## Minimum ablation matrix

Use the smallest comparison supported by the observed failure. For a suspected profile conflict, hold model, prompt, source images, reference slots, and other settings fixed:

- A — no personalization profile;
- B — one primary profile;
- C — current stacked profiles.

Keep the current accepted settings for this comparison. If pose or styling strength is the next suspect, change that axis separately; do not change several controls to a fixed recipe at once. Compare identity, anatomy, clothing, requested traits, and source preservation across the actual outputs. A requested age or presentation change is not itself drift.

- C fails while A/B remain stable → profile stacking is a supported hypothesis; repeat only if the decision still needs evidence.
- All three fail → inspect the shared reference path, source, and prompt before testing another axis.
- Descendants inherit a parent's defect → restart from the last accepted source using its intended Imagine/Edit path.

## Reporting

Lead with the strongest observed finding and its counterexample. Separate direct visual evidence from inference. Keep any proposed prompt correction short and confined to the diagnosed cause. New generations require an execution request; feed inspection alone does not authorize an ablation batch.
