# Image reference editing prompt pitfalls

Use this when the user provides multiple images and asks for image edit / composite / generation prompts.

## Source-priority lock

When there are multiple image references, state the authority order in the first sentence. Do not rely on "image 1 / image 2" alone.

Canonical pattern:

```text
Edit the model photo as the primary source. Preserve the same person/outfit from the model photo. Use the chair-tower photo only as pose, composition, framing, and surreal editorial mood reference. Use the magazine photo only for lighting, film tone, and color texture.
```

Why: if the prompt says "composite image 1 into image 2" or treats the scene reference as the base, image models often keep unwanted objects from the scene reference or generate a new person. The user correction in this lane was: **model photo is the source; the chair-tower photo is only the transformation target for pose/composition.**

## Single-block output

For a single image edit, output one paste-ready code block. Merge main instruction, pose/composition, prop replacement, tone/lighting, and constraints into that one block. Do not split "main prompt" and "negative prompt" unless the user explicitly asks for separate fields.

## Pose/composition specificity

For reference-pose transfer, describe the geometry, not only the mood:

- vertical full-body composition
- subject placed in the upper third
- not standing on the floor
- perched sideways on the top mass
- hips anchored
- one knee bent close, the other leg angled downward
- torso twisted back toward camera
- shoulders slightly turned, chin level
- one hand bracing, the other near thigh/waist
- slightly low camera to make the tower feel tall
- clean white negative space around the object

These details prevent the model from defaulting to a floor-standing fashion pose.

## Prop replacement without leakage

If replacing a chair/object tower with another material, explicitly replace the **entire** structure and define all levels:

```text
Replace the entire chair tower with a sculptural tower made only of loose denim jeans. Build base, middle, and top from layered blue denim... every visible part is denim fabric.
```

Then add compact constraints: `no chairs or chair parts, no hidden chair silhouettes`.

## Tone reference extraction

When the user adds a tone/mood reference, extract observable rendering traits and insert them as a dedicated `Tone and lighting:` paragraph. Example for early-2000s magazine scan mood:

```text
Tone and lighting: early-2000s glossy magazine scan, warm cream-white background, direct soft frontal flash with warm top fill, gentle falloff shadows, slightly overexposed whites, low-to-medium contrast, warm beige skin highlights, muted indigo denim, faint yellow cast, subtle film grain, soft halation, printed editorial texture, not digital-clean.
```

Avoid copying unrelated content from the tone reference, such as its clothes, props, text, or pose, unless the user asks for those.

## Composite vs similar generation

If the user says "합성 말고 비슷하게 생성" or similar:

- Start with: `Generate an original image, not a composite.`
- Treat the model/reference photo as **styling inspiration**, not identity lock.
- Avoid exact cloning language such as `preserve her face` unless the user still wants same-person identity.
- Keep the reference model's observable style traits: hair shape, outfit category, silhouette, expression, shoes, posture energy.

## Clothing vs prop collision

When the person's outfit uses the same material as the prop, distinguish them explicitly:

`Her worn jeans stay clothing; the denim pile is a separate sculptural prop.`
