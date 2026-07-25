# Happy Birthday, Denise 🎉

Plain HTML/CSS/JS birthday surprise — three gifts, each opening into its
own page: a birthday message, a photo gallery, and a letter about your
story together. No build step, just open `index.html`.

## Files
```
index.html   markup + scene structure
style.css    palette, animations, responsive layout
sound.js     Web Audio sound effects + music (no MP3s needed)
fireworks.js canvas fireworks
script.js    scene logic, gifts, photos, cake, easter eggs
```

## Adding Denise's photos

Open `index.html` is fine as-is with placeholders. To add real photos:

1. Create a `photos` folder next to `index.html`.
2. Drop your images in there (e.g. `denise-1.jpg`, `denise-2.jpg`...).
3. In `script.js`, find `setupPhotosScene()` and replace the placeholder
   loop with real `<img>` tags, e.g.:
   ```js
   const files = ['denise-1.jpg', 'denise-2.jpg', 'denise-3.jpg'];
   files.forEach((f) => {
     const slot = document.createElement('div');
     slot.className = 'photo-slot';
     slot.innerHTML = `<img src="photos/${f}" alt="Denise">`;
     photoGrid.appendChild(slot);
   });
   ```

Send me the photos any time and I'll wire this up for you directly.

## Editing the messages

- Birthday message: `BIRTHDAY_MESSAGE` near the top of `script.js`.
- The "Us" letter: edit the text directly inside `<section id="scene-us">`
  in `index.html`.

## Deploying (GitHub Pages)

1. New GitHub repo, upload `index.html`, `style.css`, `sound.js`,
   `fireworks.js`, `script.js` (and `photos/` if added) at the top level.
2. Settings → Pages → Deploy from branch → `main` / root → Save.
3. Your link shows at the top of that Pages settings screen.

## Features

- 3 gift boxes (birthday / pictures / us) that unwrap on tap with confetti
  and sound, then open their own page
- Typewriter birthday message
- Photo gallery page (placeholders until you add real photos)
- Letter page with your JETS/bus story and inside jokes
- "Continue to the celebration" appears once all three gifts are opened
- Final scene: balloons, fireworks, cake you light and blow out (tap or
  optional microphone)
- Easter eggs: click the moon for night mode, type `HAPPY` for a secret
  animation, click a falling star for a shooting star
- Mute toggle, top-left
