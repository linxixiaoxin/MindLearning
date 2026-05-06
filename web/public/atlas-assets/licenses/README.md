# Atlas Asset Licenses

This directory records licenses and source URLs for external 3D assets used by `SpaceAtlas3D.vue`.

Current prototype status:

- The scene uses procedural Three.js geometry only.
- No external `.glb`, `.gltf`, `.obj`, `.fbx`, texture, or HDRI asset has been bundled yet.

When adding assets:

1. Put models under `web/public/atlas-assets/models/<source>/`.
2. Put textures under `web/public/atlas-assets/textures/<source>/`.
3. Add the asset entry to `web/public/atlas-assets/manifest.json`.
4. Add or update a license note in this directory with source URL, author, license, and download date.

