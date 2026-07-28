# Cinematic homepage scene

The homepage uses an original procedural Three.js product made from simplified matte-black geometry. It contains no logos, serial numbers, manufacturer markings, real-model textures or firearm-component labels. It is a branding render only and is not an assembly, operation or construction reference.

## Optional future GLB replacement

No GLB is required for the current scene. If TGA commissions a licensed original model, place the optimised file at:

`public/models/fictional-tga-pistol.glb`

Before replacing the procedural render:

1. Confirm written commercial usage rights and retain the licence record.
2. Confirm the model is fictional, unbranded and not a recognisable copy of a commercial firearm.
3. Remove manufacturer marks, serial numbers, model names and component labels.
4. Keep the compressed download under approximately 3–5 MB and avoid unnecessary geometry or oversized textures.
5. Dynamically import `GLTFLoader` inside `src/cinematic.js`, load the model only for non-mobile users without reduced-motion enabled, and retain the current CSS fallback.
6. Dispose loaded geometry, textures and materials in the existing scene cleanup.

The replacement must not add firing, assembly, modification, operation or component-explanation content.
