# Choreography, without the stopwatch

All timing is in seconds. Every actor has its own animation tree. The compiler puts all actors on the same scene clock, so a dog can react to a pizza at a predictable moment without sharing mutable state.

```ts
import {
  delay, fade, frameSwap, loop, motionPath,
  parallel, rotate, scale, sequence, translate,
} from '../src/animation.ts';
```

| Primitive | Values | Purpose |
| --- | --- | --- |
| `translate(values, seconds, timing?)` | `[[0, 0], [100, 0]]` | Move relative to the starting position |
| `rotate(values, seconds, timing?)` | `[0, 360]` | Rotate in degrees around the bottom-center anchor |
| `scale(values, seconds, timing?)` | `[[1, 1], [1.1, 1.1], [1, 1]]` | Stretch, shrink, or mirror around the anchor |
| `fade(values, seconds, timing?)` | `[0, 1, 0]` | Opacity between zero and one |
| `frameSwap(frames, seconds, keyTimes?)` | `['idle', 'blink', 'idle']` | Discrete sprite switching |
| `motionPath(path, seconds, keyPoints?, keyTimes?)` | `'M 0 0 Q 100 -80 200 0'` | Follow a curved SVG path |
| `delay(seconds)` | — | Wait while holding the preceding value |
| `sequence(children)` | An array of animations | Play one after another |
| `parallel(children)` | An array of animations | Start together; duration is the longest child |
| `loop(animation, count)` | A positive integer count | Repeat a finite number of times |

Set `scene.loop: true` for infinite playback of the entire scene. `loop()` is a finite authoring helper, so every track can fit inside that scene duration.

## A walk, a pause, and a return

```ts
parallel([
  translate([[0, 0], [160, 0], [160, 0], [0, 0]], 8, {
    keyTimes: [0, 0.375, 0.625, 1],
  }),
  sequence([
    loop(frameSwap(['walk-1', 'walk-2', 'walk-1'], 0.5), 6),
    frameSwap(['look-up', 'look-up'], 2),
    loop(frameSwap(['walk-1', 'walk-2', 'walk-1'], 0.5), 6),
  ]),
])
```

An animation can be shorter than the scene: its final value holds until the scene ends. It cannot be longer than the scene. Two parallel animations cannot write to the same channel at the same time.

## Timing and interpolation

`keyTimes` are fractions of a primitive's duration, strictly increasing from `0` to `1`. The number of times must match the number of values. Without them, values are evenly spaced. Numeric tracks interpolate linearly. `{ discrete: true }` switches values instantly; this is useful for turning a character with `scale([[1, 1], [-1, 1]], ...)`.

Sprite tracks are always discrete. The frame at a key time is held until the next key time. To hold a single pose, repeat it: `frameSwap(['look-up', 'look-up'], 2)`.

## Flight plan

```ts
parallel([
  sequence([
    delay(4),
    motionPath('M 170 0 C 80 -38 -120 -48 -340 0 S -700 58 -850 20', 7),
  ]),
  sequence([delay(4), rotate([0, -720], 7)]),
  fade([0, 0, 1, 1, 0, 0], 18, {
    keyTimes: [0, 4 / 18, 4.1 / 18, 10.8 / 18, 11 / 18, 1],
  }),
])
```

Path coordinates are offsets from the actor's configured position, in **canvas pixels**, regardless of sprite scale. Rotation and dynamic scale also sit outside the static sprite magnification. A motion path does not automatically turn the sprite toward its tangent; author rotation separately.

One actor can have one motion path per scene. Join multiple path segments into that path; use `keyPoints` (fractions from `0` to `1`) and `keyTimes` to pause, accelerate, or retrace it. Standard SVG path commands, including cubic curves, quadratic curves, and arcs, are accepted.

## Make the loop invisible

For visible characters, return movement and pose to the opening state. For props, start and end off-screen or at zero opacity. Continuous channel clips must start at the preceding clip's final value; the compiler rejects accidental jumps. At time zero, you can explicitly establish any first value.

The compiler does not prove that your artwork loops smoothly. Use the preview scrubber to compare `0s` and the end of the scene. A prop doing a dramatic reset should do it somewhere nobody can see.

## Future events

The renderer only accepts scene configuration and asset definitions. A future GitHub activity adapter can produce ordinary animation trees or configurations from generic events before generation. Network requests, activity rules, and secrets belong in that adapter, outside the SVG renderer.
