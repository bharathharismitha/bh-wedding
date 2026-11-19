# Bharath & Harishmitha wedding site

## Local preview
Open this folder in VS Code. Install Live Server and right-click `index.html` > Open with Live Server.

## GitHub Pages
Create a public repository and upload all files, keeping `assets/` inside it. Go to Settings > Pages > Deploy from branch > main > /(root). Wait for deployment.

## RSVP
`config.js` already contains the supplied Formspree endpoint. Test an RSVP on the published site and check Formspree dashboard. Meal preferences are checkboxes; both may be selected. Event-specific guest numbers are submitted as separate Formspree fields.

## Pending
- The Guest page is NOT live: Firebase secure counting backend has not been built. Do not interpret blank counts as zero.
- Add an appropriately licensed MP3 as `assets/wedding-song.mp3` for music. Autoplay can be blocked by browsers.
- Event timings will be added once confirmed.
- Do not commit private credentials or guest information to a public GitHub repository.
