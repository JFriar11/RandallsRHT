# The Raised Hand Take

A mobile-first baseball pitch recognition and swing decision trainer built with React + Vite.

The app is designed for solo tee work and reaction training. Players hear a voice cue (“Pitch”), then react to a full-screen color flash:

* Green = Swing
* Red = Take

The drill helps train:

* Pitch recognition
* Swing/take discipline
* Reaction timing
* Load timing
* Mental reset between pitches

---

# Features

* Fullscreen training display
* Responsive layout for phones, tablets, and desktops
* Randomized swing/take calls
* Voice pitch cue
* Optional vibration support on mobile
* Adjustable timing settings
* Mobile-friendly design
* Deployable as a web app (PWA-ready)

---

# Tech Stack

* React
* Vite
* Framer Motion
* Lucide React Icons

---

# Use Web App

Visit the Link [RHT](https://randallsrht.vercel.app)

---

# Timing Configuration
## If you want to change the timings yourself

These constants control the drill timing:

```js
const PITCH_COOLDOWN_SECONDS = 15;
const MIN_DECISION_DELAY_MS = 300;
const MAX_DECISION_DELAY_MS = 650;
const MIN_CUE_DURATION_MS = 400;
const MAX_CUE_DURATION_MS = 900;
```

## PITCH_COOLDOWN_SECONDS

How long between pitches.

Example:

```js
const PITCH_COOLDOWN_SECONDS = 10;
```

Creates faster reps.

---

## MIN/MAX_DECISION_DELAY_MS

Controls how long after the “Pitch” voice cue before the color appears.

Example:

```js
const MIN_DECISION_DELAY_MS = 200;
const MAX_DECISION_DELAY_MS = 500;
```

Creates faster reaction training.

---

## MIN/MAX_CUE_DURATION_MS

Controls how long the screen stays red or green.

Example:

```js
const MIN_CUE_DURATION_MS = 300;
const MAX_CUE_DURATION_MS = 700;
```

Creates shorter visual flashes.

---

# Strike / Ball Percentage

The app uses random swing/take generation:

```js
function getRandomCall() {
  return Math.random() < 0.5 ? "SWING" : "TAKE";
}
```

## Examples

### Mostly strikes

```js
Math.random() < 0.75
```

### Balanced

```js
Math.random() < 0.5
```

### Mostly takes

```js
Math.random() < 0.3
```

---



# Future Ideas

* Result tracking
* Accuracy percentage
* Customize your own timing
* Multiplayer/team leaderboards
* PWA install support

