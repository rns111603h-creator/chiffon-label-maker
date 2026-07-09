# Expiry Label Maker Implementation Plan

**Goal:** Build a local, low-friction app that lets staff choose a chiffon product, choose one expiry date, preview the current A4 landscape 20-label sheet, and print/save a PDF without editing Illustrator/PDF files.

**Architecture:** The app generates the PDF itself from typed paper-layout measurements. Staff use a three-step screen; administrator-only settings hold product templates and label-paper measurements.

**Tech Stack:** Vite, TypeScript, pdf-lib, pdfjs-dist, Electron-ready packaging files.

## Tasks

1. Create a new project under `Projects/expiry-label-maker`.
2. Lock in layout math and product/template validation with tests.
3. Implement PDF generation from fixed A4 landscape coordinates.
4. Build a three-step staff UI: product, date, preview/print.
5. Add administrator settings for label paper dimensions using package-style measurements: left margin, top margin, label width/height, horizontal/vertical pitch, columns, rows.
6. Add Electron-ready wrapper after the local app passes tests and prints correctly.
7. Verify by comparing a generated PDF against the supplied Apple Cinnamon PDF and by printing on the actual label sheet.
