---
description: Generate a new High-Fidelity Course Page based on the course.html template
---

This workflow allows you to instantly generate a new course page (e.g., Volcano, Quantum, Genetics) with a unique visual theme and content, borrowing the advanced features (AI, Notes, Fireworks) from the master template.

1.  **Analyze Request**:
    *   Identify **Theme Name** (e.g., "Volcano Exploration").
    *   Identify **Slug** (e.g., `volcano`).
    *   Identify **Color Palette** (Primary: `#ef4444` Red, Secondary: `#f97316` Orange).
    *   Draft 5-8 **Lesson Titles**.

2.  **Clone Template**:
    *   Command: `cp course.html course-[slug].html`

3.  **Theme Customization (The "One-Click" Magic)**:
    *   **Update Title**: Change `<title>` and `h2` course title.
    *   **Update Colors**: 
        *   In `tailwind.config`: Update `odyssey.purple` to Primary Color, `odyssey.cyan` to Secondary.
        *   In HTML: Global replace `indigo` with the closest Tailwind color for the theme (e.g., `red` or `orange`).
        *   Global replace `purple` (if used outside odyssey) to Primary.
    *   **Update Icons**: Replace `🤖` (AI avatar placeholder) or Navbar icons if needed.

4.  **Inject Content**:
    *   Replace the `course` object in `setup()` with the new description.
    *   Replace the `lessons` array with the drafted lessons.
    *   *Optional*: Update `userAvatar` default if theme-specific (usually keep `bot_avatar_vip.png`).

5.  **Register Course**:
    *   Add a new entrycard in `learn.html` linking to `course-[slug].html`.

6.  **Final Polish**:
    *   Ensure `deepseek-proxy.js` is still valid for the new page (it is, structurally).
    *   Verify "Study Notes" and "Fireworks" logic (inherited from template).

