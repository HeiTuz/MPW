# Image reference editing pitfall — subject identity vs wardrobe preservation

Use when the user asks to make Image 1 “like Image 2” or transfer a magazine-cover/layout/style from one fashion reference to another.

## Lesson

Do not assume “preserve Image 1 subject” only means face/body identity. If Image 1 contains a clear outfit and the user did not explicitly ask to restyle it, preserve **both the model identity and Image 1 wardrobe**. Use Image 2 only for the requested transferable layer: layout, props, typography, lighting, color, print texture, pose grammar, or mood.

## Prompt ordering

Put wardrobe preservation in the first paragraph, before the style-transfer instruction:

```text
Use Image 1 as the main subject and wardrobe reference. Preserve the same adult model look, haircut, expression, body proportions, and outfit from Image 1: <garment list>. Use Image 2 only for <layout/props/typography/lighting/mood>, not for wardrobe or identity.
```

Then describe the Image 2 transformation:

```text
Recompose the Image 1 model into <Image 2 layout/style>. Keep her Image 1 outfit unchanged while adopting <props/background/cover typography/lighting> from Image 2.
```

## Extraction checklist

Before writing the final prompt, explicitly extract:

- Image 1 identity anchors: hair, face/expression, body proportions, pose attitude.
- Image 1 wardrobe anchors: garment type, color, material, shoes, accessories, visible marks/tattoos.
- Image 2 transfer layer: composition, background, props, typography, lighting, palette, print texture.
- Negative boundary: do not copy Image 2 wardrobe unless the user asked for restyling.

## Common failure

Bad:

```text
Preserve Image 1 model identity, transform into Image 2 cover styling...
```

This often lets the generator borrow Image 2’s outfit.

Better:

```text
Preserve Image 1 model identity and Image 1 outfit: backward blue cap, white cropped rib tank, white high-waisted shorts, bare legs, black pointed mid-calf boots. Use Image 2 only for cover layout, tire props, rough yellow masthead, white studio, flash, and print texture.
```

## Safe wording

Prefer `use Image 2 only for layout, props, color, typography style, lighting, and mood` over broad phrases like `inspired by Image 2` when wardrobe must be preserved.
