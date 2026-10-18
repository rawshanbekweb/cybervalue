import type { Rule, Value } from "@/lib/kids/lang";

/** What the game lab can ask a running game to do. */
export type GameApi = {
  /** Runs a terminal command such as "qalqon"; false if the game has none. */
  cheat: (name: string) => boolean;
  /** Starts a fresh round with the current settings. */
  restart: () => void;
};

export type GameProps = {
  /** The code's settings (defaults filled in); rules are applied per frame. */
  values: Record<string, Value>;
  rules: Rule[];
  /** False pauses the game loop (e.g. while the child edits the code). */
  running: boolean;
  onScore: (score: number) => void;
  onOver: (score: number) => void;
  /** Short status lines shown under the game, already translated. */
  labels: {
    start: string;
    over: string;
    paused: string;
    controls: string;
  };
  ref?: React.Ref<GameApi>;
};
