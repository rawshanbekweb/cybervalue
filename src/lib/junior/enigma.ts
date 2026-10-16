// A small but faithful Enigma I: rotors I, II and III (left to right), the
// wide B reflector, ring settings at A and no plugboard. Each key press first
// turns the rotors (with the famous middle-rotor double step), then sends the
// signal right → left, off the reflector and back left → right.

const A = 65;

export const ROTORS = {
  I: { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: "Q" },
  II: { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: "E" },
  III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V" },
} as const;
export const REFLECTOR_B = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

const ORDER = ["I", "II", "III"] as const;
const mod = (n: number) => ((n % 26) + 26) % 26;
const code = (letter: string) => letter.charCodeAt(0) - A;
const letter = (n: number) => String.fromCharCode(A + mod(n));

const INVERSE = Object.fromEntries(
  ORDER.map((name) => {
    const inverse = Array<number>(26);
    ROTORS[name].wiring.split("").forEach((out, i) => (inverse[code(out)] = i));
    return [name, inverse];
  }),
) as Record<(typeof ORDER)[number], number[]>;

/** Window letters, left to right, e.g. "AAA". */
export type Positions = [number, number, number];

export function parsePositions(text: string): Positions {
  const letters = text
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .padEnd(3, "A");
  return [code(letters[0]), code(letters[1]), code(letters[2])];
}

export const showPositions = (positions: Positions) =>
  positions.map(letter).join("");

/** Turns the rotors as a key press does, before the letter is enciphered. */
export function step([left, middle, right]: Positions): Positions {
  const middleAtNotch = letter(middle) === ROTORS.II.notch;
  const rightAtNotch = letter(right) === ROTORS.III.notch;
  if (middleAtNotch) return [mod(left + 1), mod(middle + 1), mod(right + 1)];
  if (rightAtNotch) return [left, mod(middle + 1), mod(right + 1)];
  return [left, middle, mod(right + 1)];
}

export type Trace = {
  input: string;
  output: string;
  /** The letter after each stage: III, II, I, reflector, I, II, III. */
  path: string[];
  positions: Positions;
};

/** Presses one key: returns the lit lamp, the path and the new positions. */
export function press(input: string, positions: Positions): Trace {
  const next = step(positions);
  let c = code(input.toUpperCase());
  const path: string[] = [];
  const forward = (index: number) => {
    const name = ORDER[index];
    const p = next[index];
    c = mod(code(ROTORS[name].wiring[mod(c + p)]) - p);
    path.push(letter(c));
  };
  const backward = (index: number) => {
    const name = ORDER[index];
    const p = next[index];
    c = mod(INVERSE[name][mod(c + p)] - p);
    path.push(letter(c));
  };
  forward(2);
  forward(1);
  forward(0);
  c = code(REFLECTOR_B[c]);
  path.push(letter(c));
  backward(0);
  backward(1);
  backward(2);
  return {
    input: input.toUpperCase(),
    output: letter(c),
    path,
    positions: next,
  };
}

/** Enciphers A–Z from a start position; other characters pass through. */
export function enigma(text: string, start: string) {
  let positions = parsePositions(start);
  let out = "";
  for (const char of text.toUpperCase()) {
    if (char < "A" || char > "Z") {
      out += char;
      continue;
    }
    const trace = press(char, positions);
    positions = trace.positions;
    out += trace.output;
  }
  return out;
}
