# EmbodiSafety

Project website: https://embodisafety.github.io/

Static website served from the root of `main`. Open `index.html` or run `python3 -m http.server 8000` to preview locally.

The complete website is under 5,000,000 bytes, excluding Git history. The cover is one composited video with 96 tasks. The 32 individual gallery clips are optimized for size. Original datasets and source videos are not included.

Model icon sources and license information are in `assets/model-logos/`.

Gallery previews are stored locally. Opening an example loads a separate H.264 HD video from the `hd-demos-v1` Release and loops it. These on-demand videos are excluded from the static-site size budget. Network errors provide a direct HD-video link.
