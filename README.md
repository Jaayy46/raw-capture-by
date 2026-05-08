# Livio Raschle Photography

Portfolio website for [raw-capture-by.com](https://raw-capture-by.com).

## Structure

```
index.html        # Portfolio v1 — dark, gold accent, Raleway
v2/               # Portfolio v2 — editorial, light/navy, Cormorant Garant
css/style.css     # v1 stylesheet
js/main.js        # v1 scripts: Lenis smooth scroll, lightbox, animations
images/           # All photos (JPG + WebP)
CNAME             # Custom domain config
```

## Local development

```bash
python3 -m http.server 3333
# → http://localhost:3333
```

## Deploy

GitHub Pages from `main` branch root → [raw-capture-by.com](https://raw-capture-by.com)

## Workflow

```
feat/* or fix/*  →  dev  →  PR  →  main
```

`main` is protected — always work on `dev` or a feature branch.
