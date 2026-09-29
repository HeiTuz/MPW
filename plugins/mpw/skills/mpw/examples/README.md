# Native image prompt examples

These three files are original, text-only native prompt examples for distinct requests: a Korean bookshop opening poster, a greenhouse portrait, and a handmade teacup still life. They use ordinary prompt language rather than a compiled record format.

No images were generated for this set, and the examples make no claims about rendered results. All three prompts passed the clean-room validator's native text check. To repeat that check after integration, run:

```sh
node scripts/test_examples.mjs
```

The test must invoke the native GPT Image profile. A pass checks prompt-text rules only; it does not attest to generation quality or output pixels.
