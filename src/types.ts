/** A dot is transparent. Every other cell is a single palette symbol. */
export type SpriteFrame = readonly string[];
export type Palette = Readonly<Record<string, string>>;
export type Point = readonly [number, number];
export type Channel = 'translate' | 'rotate' | 'scale' | 'opacity' | 'frame' | 'motion';
export type Value = number | string | Point;

export interface Tween {
  readonly kind: 'tween';
  readonly channel: Channel;
  readonly duration: number;
  readonly values: readonly Value[];
  /** Fractions of this tween, from 0 to 1. Defaults to evenly spaced. */
  readonly keyTimes?: readonly number[];
  readonly discrete?: boolean;
  readonly path?: string;
}

export type Animation = Tween
  | { readonly kind: 'delay'; readonly duration: number }
  | { readonly kind: 'sequence' | 'parallel'; readonly children: readonly Animation[] }
  | { readonly kind: 'loop'; readonly animation: Animation; readonly count: number };

export interface CharacterDefinition {
  readonly id: string;
  readonly name: string;
  readonly dimensions: { readonly width: number; readonly height: number };
  readonly palette: Palette;
  /** Generic appearance roles map to palette symbols; no species-specific renderer fields. */
  readonly appearance?: Readonly<Record<string, string>>;
  readonly sprites: Readonly<Record<string, SpriteFrame>>;
  readonly animations: Readonly<Record<string, Animation>>;
  readonly defaultFrame: string;
}

export interface PropDefinition extends CharacterDefinition {}
export interface ActorInstance {
  readonly id: string;
  readonly preset: string;
  readonly name?: string;
  /** Coordinates of the bottom-center anchor in scene pixels. */
  readonly position: { readonly x: number; readonly y: number };
  readonly scale?: number;
  readonly appearance?: Readonly<Record<string, string>>;
  readonly palette?: Palette;
  readonly frame?: string;
  readonly animation?: Animation | string;
}

export interface SceneTheme {
  readonly background: string;
  readonly foreground: string;
  readonly muted: string;
  readonly ground: string;
  readonly accent: string;
  readonly panel: string;
}

export interface ProfileConfig {
  readonly canvas: { readonly width: number; readonly height: number; readonly groundY: number };
  readonly theme: { readonly dark: SceneTheme; readonly light: SceneTheme };
  readonly title: string;
  readonly description: string;
  readonly scene: {
    readonly duration: number;
    readonly loop: boolean;
    readonly label?: string;
    readonly eyebrow?: string;
    readonly showTiming?: boolean;
  };
  readonly characters: readonly ActorInstance[];
  readonly props: readonly ActorInstance[];
}

export interface Registry {
  readonly characters: Readonly<Record<string, CharacterDefinition>>;
  readonly props: Readonly<Record<string, PropDefinition>>;
}

export interface Clip { readonly start: number; readonly tween: Tween }
export interface Track {
  readonly channel: Channel;
  readonly values: readonly Value[];
  readonly keyTimes: readonly number[];
  readonly discrete: boolean;
  readonly path?: string;
}
