# BizPro+ Design Assets Directory

## Overview
This directory (`stitch_designs/`) and its adjacent companion (`stitch_export/`) contain UI/UX design mockups, wireframes, and export artifacts generated during the Stitch visual design sprint:

1. **`stitch_designs/`**: High-fidelity full-page design references and mobile layout previews.
2. **`stitch_export/`**: Screen exports and token references.

## Runtime Status
- **Non-executable design assets:** These files are retained purely as design and layout references for pair-programming and visual audit.
- **Production Independence:** The active enterprise production application is implemented independently in `frontend/src/app` using Next.js 15 App Router and Tailwind CSS.
- Neither directory is bundled into production Docker containers (`frontend/Dockerfile` and `backend/Dockerfile` do not copy these directories).
