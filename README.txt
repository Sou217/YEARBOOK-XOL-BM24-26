XLRI BM 24–26 DIGITAL YEARBOOK
================================

GitHub Pages ready. No build step required.

FILES
-----
index.html   Main website
style.css    Visual design + responsive layout
script.js    Navigation, page-turn effect, search, index, swipe
data.js      Yearbook people + notes + photo paths
images/      Normalized photo filenames

GITHUB SETUP
------------
1. Create a NEW PUBLIC GitHub repository, e.g.:
   xlri-bm-yearbook

2. Extract this ZIP on your computer.

3. Upload the CONTENTS of this folder to the ROOT of the GitHub repository.
   The repository must look like:

   index.html
   style.css
   script.js
   data.js
   README.txt
   images/
     ...

   IMPORTANT: Do NOT upload the ZIP itself.
   IMPORTANT: Do NOT put all files inside another nested folder.

4. Commit changes.

5. Go to:
   Repository -> Settings -> Pages

6. Under Build and deployment:
   Source: Deploy from a branch
   Branch: main
   Folder: / (root)

7. Click Save.

8. Your site will be available at:
   https://YOUR-GITHUB-USERNAME.github.io/REPOSITORY-NAME/

IMAGE NOTE
----------
All supplied images have been copied into images/ using safe lowercase filenames.
The HTML references those normalized names, so .jpg/.jpeg/.JPG filename and
case-sensitivity problems on GitHub should not prevent photos from loading.

CONTENT
-------
The Final sheet of the supplied Excel is the source of truth.
Prof. Giridhar Ramachandran is displayed first as Associate Dean.
The 38 students follow.
Student writer/recipient pairings are not displayed.

The website also includes:
- Cover / opening experience
- Two-page profile spreads
- Page-turn animation on desktop
- Responsive stacked book pages on mobile
- Yearbook Index + search
- Surprise Me can be added/activated through the browser console if desired
- Previous/Next
- Keyboard arrows
- Mobile swipe
- Memory Wall
- Missing-photo placeholders
