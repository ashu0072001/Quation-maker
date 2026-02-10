# TechRedo Quotation System

A professional, automated quotation generation system for solar rooftop projects. Features a clean dashboard, persistence, and one-click PDF generation with professional layout.

## 🚀 Simple Setup

To run the application locally, follow these steps:

1.  **Clone or Download** this repository.
2.  **Open in Browser**: Since the app uses some external resources and `localStorage`, it's best to run it through a local server.
    
    If you have Python installed, you can run:
    ```bash
    python -m http.server 8000
    ```
    Then visit: `http://localhost:8000`

3.  **Direct Open**: You can also simply open `index.html` in most modern browsers (Chrome/Edge recommended).

## ✨ Key Features

- **Dashboard**: View, edit, and manage all your saved quotations in one place.
- **Smart Form**:
    - **Auto-generated Date**: Always stays current.
    - **Auto-numbered Quotes**: Professional numbering format (e.g., QTN/25-26/FEB/01).
- **Dynamic Content**:
    - Real-time total calculation and "Amount in Words" conversion.
    - Customizable BOQ (Bill of Quantities) and Scope of Work.
- **Professional PDF Generation**:
    - Generates a multi-paged PDF including Cover Page, Terms, BOQ, and Summary.
    - Opens directly in your browser for instant review.
- **Persistence**: Your data is saved automatically in your browser's Local Storage.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS, JavaScript.
- **PDF Logic**: `html2pdf.js`, `PDFLib`.
- **Icons**: FontAwesome 6.

---
© 2026 TechRedo India Pvt Ltd. All rights reserved.
