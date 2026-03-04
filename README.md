# SPI FIFO & Interrupt Animation

Motion Canvas animation showing how SPI TX and RX interrupts work on the MSPM0,
based on ELEC 327 Lecture 14.

## What it shows

1. The SPI data path: CPU -> TXDATA -> TX FIFO (4 deep) -> Shift Register -> MOSI
2. The bootstrap trick: enabling the TX interrupt immediately fires a TX ISR
   because the shift register starts empty ("ready to transmit more")
3. Data flowing through the pipeline with bits clocking on MOSI/MISO
4. RX ISR firing when received data is "valid to work with"
5. The cycle repeating as the shift register empties and TX ISR fires again

## Setup

```bash
# install dependencies
npm install

# start the dev server (opens browser editor)
npm run dev
```

Then open http://localhost:9000 in your browser.

## Usage

- Hit the play button in the editor to preview the animation
- Use the timeline at the bottom to scrub through
- Click "Render" in the top right to export frames
- Use ffmpeg to convert frames to video:

```bash
ffmpeg -framerate 60 -i output/project/%06d.png -c:v libx264 -pix_fmt yuv420p spi_animation.mp4
```

## For Twitter

To render at 1080x1080 (square, best for Twitter feed), edit `src/project.ts`:

```ts
export default makeProject({
  scenes: [spiFifo],
  // uncomment for square format:
  // size: {width: 1080, height: 1080},
});
```

## Project structure

```
src/
  project.ts          <- project config, lists scenes
  scenes/
    spiFifo.tsx       <- the animation (start here)
```

## Learning Motion Canvas

The scene file (`src/scenes/spiFifo.tsx`) is heavily commented with
explanations of Motion Canvas concepts. Key things to know:

- Scenes are generator functions. `yield*` plays an animation.
- `createRef<Type>()` gives you a handle to animate a node.
- `all()` plays animations in parallel.
- `sequence(delay, ...)` plays with stagger.
- `waitFor(seconds)` pauses.
- Nodes use JSX. Props like `x`, `y`, `opacity`, `fill` are animatable.

Docs: https://motioncanvas.io/docs/
