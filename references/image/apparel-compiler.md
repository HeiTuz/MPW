# Apparel Prompt Compiler

Use this reference when a validated Vision role map describes apparel sources and the requested result is a coherent pure-white product-image family.

## Ownership and input gate

Vision analysis owns pixel observations, role labels, occlusion maps, source-evidence coverage, and explicit color identities. The prompt compiler alone authors final generation prompts. An execution adapter consumes the compiled handoff without rewriting product facts.

The portable request format is `apparel-compile-request/v1`. It contains a product-folder identifier, source-folder location, complete source basename inventory, `vision_role_map`, and complete `requested_outputs` inventory. Every role-map source must occur in the inventory and every inventory source must exist. Filenames are identifiers, never color evidence.

Count colors only from records whose `role` is exactly `color_front`. Each such record requires `color_identity`; normalize it with Unicode NFKC, collapsed whitespace, and case folding, then count unique normalized values. Back and detail records do not add colors. Zero unique front colors is `blocked`; no default count is allowed.

## Prompt and evidence contract

Compile one self-contained `IMAGE` prompt per requested output. Each prompt is at most 2,000 Unicode code points and contains:

1. the cut declaration — `ghost_cut` for a worn-shape garment with the wearer removed, `clean_product_cut` for a flat or laid product. Naming the cut is what separates a hollow garment holding its own shape from a flat cutout; leaving it implicit is the most common cause of the wrong one coming back;
2. exact requested view, normalized color, and product description;
3. source-supported construction, silhouette, proportions, material, trim, print, and visible details;
4. complete removal of mannequin, hanger, stand, rod, cord, clip, hand, prop, and remnants;
5. uniform `#FFFFFF` with no cast/contact shadow, halo, floor line, or gradient;
6. source-only hidden-area reconstruction with no invented seam, lining, label, panel, button, print, embroidery, pocket, fastener, or hem;
7. coherent series canvas, occupancy, centerline, scale, and lighting, with the silhouette and the shoulder, neck, and hem anchors locked to the pilot.

A prompt never contains a local path. If complete evidence cannot fit within 2,000 characters, return `self_contained_prompt_overflow`; do not drop a lock or move image instructions to another file.

## Pilot, references, and evidence floor

The main-color front is the pilot unless the validated role map names another. Every other output inherits the pilot's canvas, occupancy, centerline, silhouette, and anchors — that inheritance is what makes the family coherent rather than six unrelated cutouts.

When several sources compete for the same output, order them: the authority for that view first, then construction or back, then fabric and detail, then whichever remaining source covers the largest critical occlusion. Keep the count small enough that each reference has a stated job; a reference nobody can name a job for is noise that pulls the result toward the wrong garment.

If a critical hidden region has no source evidence, return `insufficient_source_evidence` rather than compiling an invented construction, and never merge unrelated garments to fill the gap. Failing closed here costs one round trip; an invented seam ships a product photograph of something that does not exist.

## Multi-folder dispatch

A root of independent product folders may be split one worker per folder. Workers return disjoint records; a coordinator validates unique IDs, output paths, reference existence, prompt length, and role-map fidelity before any downstream dry run.

Report compiler completion as compiled prompts, never as generation progress — the two are different stages and conflating them has produced status reports claiming images exist when only prompts do.

## Portable handoff

`scripts/compile_apparel_handoff.py` emits the contract defined by `contracts/v1/apparel-handoff.schema.json`. The handoff preserves the complete `sources`, the contract-defined `vision_role_map` fields (`file`, `role`, and optional `color_identity`), normalized front-color identities, `unique_color_count`, folder master, QC contract, complete output inventory, and each output's ID, filename, and final prompt. Unknown role-map fields are rejected rather than forwarded.

The handoff is sufficient for a network-free consumer to prepare isolated candidate tasks. Unknown versions, missing sources, missing front identities, zero colors, duplicate output ownership, or an overlong prompt fail closed. Runtime-specific installation and consumer routing belong only in `references/adapters.md`.
