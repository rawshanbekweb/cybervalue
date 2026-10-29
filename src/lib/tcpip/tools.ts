// Academy Intermediate · TCP/IP in depth: the sequence and acknowledgement
// numbers of a TCP handshake and its first data, how a port scan reads the
// replies, and the odds of poisoning a DNS cache with forged answers.

// --- The handshake -------------------------------------------------------------

/** The initial sequence numbers each side picks (real ones are random). */
export const CLIENT_ISN = 1000;
export const SERVER_ISN = 7000;
/** The client's first request, "GET / HTTP/1.1…", in bytes. */
export const REQUEST_BYTES = 100;

export const BLANKS = ["synAckAck", "ackSeq", "ackAck", "dataAck"] as const;
export type Blank = (typeof BLANKS)[number];

/** The right value of each blank in the exchange. */
export const ANSWERS: Record<Blank, number> = {
  // SYN takes one sequence number, so the server expects ISN + 1 next.
  synAckAck: CLIENT_ISN + 1,
  ackSeq: CLIENT_ISN + 1,
  ackAck: SERVER_ISN + 1,
  // Data moves the next expected number on by its length in bytes.
  dataAck: CLIENT_ISN + 1 + REQUEST_BYTES,
};

export const blankRight = (b: Blank, value: string) =>
  /^\d+$/.test(value.trim()) && Number(value) === ANSWERS[b];

// --- Port scans ------------------------------------------------------------------

export type Reply = "synack" | "rst" | "none" | "icmp";
export type PortState = "open" | "closed" | "filtered";

/** What a SYN scan concludes from the reply to its SYN. */
export function portState(reply: Reply): PortState {
  if (reply === "synack") return "open";
  if (reply === "rst") return "closed";
  return "filtered";
}

// --- DNS cache poisoning ----------------------------------------------------------

export type DnsSetup = {
  /** Forged answers the attacker gets in before the real one. */
  forged: number;
  /** Does the resolver send each query from a random source port? */
  randomPort: boolean;
  /** Are the answers signed and checked (DNSSEC)? */
  dnssec: boolean;
};

export const FORGED = [100, 1000, 10_000, 65_536] as const;
/** The 16-bit transaction ID every query carries. */
export const IDS = 65_536;
/** Source ports a resolver picks from (49152–65535 and so on). */
export const PORTS = 28_232;

/** The chance one race poisons the cache. */
export function poisonOdds(s: DnsSetup) {
  if (s.dnssec) return 0;
  const space = IDS * (s.randomPort ? PORTS : 1);
  return 1 - (1 - 1 / space) ** Math.min(s.forged, space);
}

/** Safe when even the strongest attacker here has under one in a thousand. */
export const dnsSafe = (s: DnsSetup) =>
  poisonOdds({ ...s, forged: FORGED[FORGED.length - 1] }) < 0.001;
