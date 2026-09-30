# Native image prompt examples

These files are original, text-only native prompt examples for distinct requests. They use ordinary prompt language rather than a compiled record format.

| File | Request it answers |
|---|---|
| bookshop-opening.prompt.txt | A Korean bookshop opening poster with exact copy |
| greenhouse-portrait.prompt.txt | A documentary portrait of a greenhouse caretaker |
| teacup-still-life.prompt.txt | A handmade teacup still life |
| studio-portrait.prompt.txt | A studio headshot for a team page; the request gives no age, appearance or clothing, and no reference image |
| daily-selfie.prompt.txt | A front-camera morning selfie of a man in his thirties, as the request specifies; no reference image |
| fashion-campaign-reference.prompt.txt | A trench coat campaign photo with two attached images: image 1 is the model, image 2 is the product |

The three portrait requests show the rules in references/image/editorial/portrait-brief.md: no default age, appearance or wardrobe, no preservation wording without a reference, and numbered roles with preserved identity and product construction when references exist.

No images were generated for this set, and the examples make no claims about rendered results. All prompts pass the clean-room validator's native text check. To repeat that check after integration, run:

```sh
node scripts/test_examples.mjs
```

The test must invoke the native GPT Image profile. A pass checks prompt-text rules only; it does not attest to generation quality or output pixels.
