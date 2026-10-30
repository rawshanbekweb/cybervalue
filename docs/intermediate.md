# Academy Intermediate

The second Academy level lives at `/intermediate`, next to Kids, Junior and
the beginner Academy labs. Its roadmap is public; its labs open only to
students placed at the Intermediate or Advanced level, and to staff.

## Pages

| Path                         | What is there                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `/intermediate`              | The roadmap (12 domains in three phases, career paths) and an access card       |
| `/intermediate/http`         | Module 1 of web application security, HTTP in depth (10 lessons, a checkpoint)  |
| `/intermediate/input`        | Module 2, untrusted input (9 lessons, a checkpoint)                             |
| `/intermediate/browser`      | Module 3, browser-side risks (8 lessons, a checkpoint)                          |
| `/intermediate/access`       | Module 4, access control (9 lessons, a checkpoint)                              |
| `/intermediate/api`          | Module 5, API security (8 lessons, a checkpoint)                                |
| `/intermediate/classic`      | Cryptography module 1, classical ciphers (8 lessons, a checkpoint)              |
| `/intermediate/symmetric`    | Cryptography module 2, symmetric encryption (8 lessons, a checkpoint)           |
| `/intermediate/hashes`       | Cryptography module 3, hashes and passwords (8 lessons, a checkpoint)           |
| `/intermediate/pubkey`       | Cryptography module 4, public-key cryptography (8 lessons, a checkpoint)        |
| `/intermediate/tls`          | Cryptography module 5, TLS and certificates (8 lessons, a checkpoint)           |
| `/intermediate/tcpip`        | Network security module 1, TCP/IP in depth (8 lessons, a checkpoint)            |
| `/intermediate/traffic`      | Network security module 2, traffic analysis (8 lessons, a checkpoint)           |
| `/intermediate/firewall`     | Network security module 3, firewalls and segmentation (8 lessons, a checkpoint) |
| `/intermediate/connections`  | Network security module 4, secure connections (8 lessons, a checkpoint)         |
| `/intermediate/ids`          | Network security module 5, intrusion detection (8 lessons, a checkpoint)        |
| `/intermediate/evidence`     | Digital forensics module 1, handling evidence (8 lessons, a checkpoint)         |
| `/intermediate/filesystem`   | Digital forensics module 2, file systems (8 lessons, a checkpoint)              |
| `/intermediate/logs`         | Digital forensics module 3, logs and artefacts (8 lessons, a checkpoint)        |
| `/intermediate/response`     | Digital forensics module 4, incident response (8 lessons, a checkpoint)         |
| `/intermediate/report`       | Digital forensics module 5, writing the report (8 lessons, a checkpoint)        |
| `/intermediate/stego`        | Steganography module 1, the idea (8 lessons, a checkpoint)                      |
| `/intermediate/lsb`          | Steganography module 2, inside images (8 lessons, a checkpoint)                 |
| `/intermediate/metadata`     | Steganography module 3, metadata (8 lessons, a checkpoint)                      |
| `/intermediate/formats`      | Steganography module 4, audio and file formats (8 lessons, a checkpoint)        |
| `/intermediate/steganalysis` | Steganography module 5, steganalysis (8 lessons, a checkpoint)                  |
| `/intermediate/siem`         | Blue team module 1, logs and SIEM (8 lessons, a checkpoint)                     |
| `/intermediate/detection`    | Blue team module 2, detection rules (8 lessons, a checkpoint)                   |
| `/intermediate/triage`       | Blue team module 3, alert triage (8 lessons, a checkpoint)                      |
| `/intermediate/hunting`      | Blue team module 4, threat hunting (8 lessons, a checkpoint)                    |
| `/intermediate/phishing`     | Blue team module 5, phishing analysis (8 lessons, a checkpoint)                 |
| `/intermediate/ethics`       | OSINT module 1, ethics and law (8 lessons, a checkpoint)                        |
| `/intermediate/search`       | OSINT module 2, search technique (8 lessons, a checkpoint)                      |
| `/intermediate/infra`        | OSINT module 3, domains and infrastructure (8 lessons, a checkpoint)            |
| `/intermediate/geo`          | OSINT module 4, images and location (8 lessons, a checkpoint)                   |
| `/intermediate/footprint`    | OSINT module 5, digital footprint (8 lessons, a checkpoint)                     |

The old addresses `/akademiya/intermediate` and `/akademiya/http` redirect
permanently (`next.config.ts`). The section can be switched off in **Admin →
Site settings** (`intermediate`); the HTTP lab keeps its own switch (`http`).

The Intermediate pages load the lab dictionaries (`src/app/[lang]/intermediate/layout.tsx`),
like the Academy, so the labs' interface is translated.

## Module 2: untrusted input

`/intermediate/input` (lab id `input`, checkpoint `input-1`, award
`lab-input`) runs on a pretend back end in the browser
(`src/lib/untrusted-input/tools.ts`): a small SQL engine for one login query,
a file download handler and an HTML template. Nothing reaches a real system.

| Lessons | What the student does                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| 1       | Sorts request parts into “attacker controls” and “server only”                                               |
| 2–4     | Breaks the login query with one quote, signs in without a password, fixes it with parameters                 |
| 5–6     | Sends a file name that leaves the folder, sees a one-pass “../” filter fail and the resolved-path check hold |
| 7       | Writes an anchored allowlist regex for usernames                                                             |
| 8       | Sees why escaping only `<` and `>` is not enough inside an attribute                                         |
| 9       | Final questions                                                                                              |

The site settings switch is `input`. `tests/untrusted-input.test.ts` checks
every exercise against the engine; `tests/e2e/input-lab.spec.ts` solves the
lessons as an Intermediate student.

## Module 3: browser-side risks

`/intermediate/browser` (lab id `browser`, checkpoint `browser-1`, award
`lab-browser`, site setting `browser`) uses a pretend browser
(`src/lib/browser-risks/tools.ts`). It only describes what would happen and
runs nothing: `readMarkup` lists what `innerHTML` would build from a comment,
`applyPolicy` applies chosen CSP directives to one page's resources, and
`transfer` shows whether the bank accepts its own and a forged transfer.

| Lessons | What the student does                                                         |
| ------- | ----------------------------------------------------------------------------- |
| 1       | Sorts what is trusted code and what can bring foreign code into the page      |
| 2       | Sees a comment become elements with innerHTML, and stay text with textContent |
| 3       | Sorts link addresses: only http(s) and site paths are allowed                 |
| 4       | Builds a CSP that keeps the page working and blocks the three attacks         |
| 5       | Stops a forged transfer with SameSite or a CSRF token                         |
| 6       | Sorts which requests carry a SameSite=Lax cookie                              |
| 7       | Clickjacking and `frame-ancestors`                                            |
| 8       | Final questions                                                               |

## Module 4: access control

`/intermediate/access` (lab id `access`, checkpoint `access-1`, award
`lab-access`, site setting `access`) uses pretend services
(`src/lib/access-control/tools.ts`) that answer in the page: `getOrder` is an
orders API with and without the owner check, `makeToken` and `check` issue and
check JWTs (with a simplified, keyed stand-in for HMAC-SHA256, so the lesson
needs no crypto library), and `stops` says which attacks each way of signing
in stops.

| Lessons | What the student does                                                        |
| ------- | ---------------------------------------------------------------------------- |
| 1       | Sorts checks into “who?” (authentication) and “allowed?” (authorization)     |
| 2       | Opens another person’s order by changing a number, then adds the owner check |
| 3       | Sorts which measures really protect: server checks, not hidden buttons       |
| 4       | Reads the parts of a JWT                                                     |
| 5       | Sets up the server so an edited token and an `alg: none` token are refused   |
| 6       | Sorts what may go in a token payload                                         |
| 7       | Chooses a second factor that stops all four attacks (a security key)         |
| 8       | Questions on password storage, error messages and rate limiting              |
| 9       | Final questions                                                              |

## Module 5: API security

`/intermediate/api` (lab id `api`, checkpoint `api-1`, award `lab-api`, site
setting `api`) uses a pretend API (`src/lib/api-security/tools.ts`): `respond`
builds a profile reply from the chosen fields, `patchMe` applies a profile
update with or without an allowlist, `validateOrder` checks an order body
against its schema, and `limitOutcome` works out how fast a 50-address botnet
gets through 10,000 passwords under a sign-in limit.

| Lessons | What the student does                                                                 |
| ------- | ------------------------------------------------------------------------------------- |
| 1       | Trims a profile reply to the fields the card needs                                    |
| 2       | Makes themselves an admin with an extra field, then switches on an allowlist          |
| 3       | Sorts request bodies the order schema passes or refuses                               |
| 4       | Picks a limit per account that slows the botnet to over a day without blocking a user |
| 5       | Sorts safe and unsafe places for an API key                                           |
| 6       | Questions on old versions, SSRF and CORS                                              |
| 7       | Sorts the points of an API description into gaps and sound choices                    |
| 8       | Final questions                                                                       |

## Cryptography module 1: classical ciphers

`/intermediate/classic` (lab id `classic`, checkpoint `classic-1`, award
`lab-classic`, site setting `classic`) uses `src/lib/classical-ciphers/tools.ts`:
`caesar` and `vigenere` work on the 26 Latin letters and pass everything else
through, so the messages can be ordinary Uzbek; `letterCounts` draws the
frequency chart and `keyUnderCrib` subtracts a guessed first word from a
Vigenère message to show the key under it. The unit test checks that “a”
stands clearly ahead in the frequency text and that only one Caesar shift
reads.

| Lessons | What the student does                                               |
| ------- | ------------------------------------------------------------------- |
| 1       | Breaks a Caesar message by trying shifts (or listing all 26)        |
| 2       | Questions: 25 keys vs 26!, and why many keys are not enough         |
| 3       | Finds the key of a long Caesar text from its most frequent letter   |
| 4       | Sorts claims about Vigenère                                         |
| 5       | Types “salom” to see the key `kalit` and opens the Vigenère message |
| 6       | Sorts when a one-time pad stays secure and when it breaks           |
| 7       | Kerckhoffs’s principle and home-made ciphers                        |
| 8       | Final questions                                                     |

## Cryptography module 2: symmetric encryption

`/intermediate/symmetric` (lab id `symmetric`, checkpoint `symmetric-1`, award
`lab-symmetric`, site setting `symmetric`) uses `src/lib/symmetric/tools.ts`:
a toy 8-byte block cipher (a keyed Feistel network) standing in for AES, with
ECB, CBC and CTR. It behaves as AES does in each mode — ECB repeats on
repeated blocks, CTR is XOR with a keystream — and the lessons say it is not
for real protection. `nonceReuse` recovers a second message when two share a
nonce, and `tamper` changes a payment's sum by flipping ciphertext bits,
which a keyed tag (standing in for GCM's) then catches.

| Lessons | What the student does                                                     |
| ------- | ------------------------------------------------------------------------- |
| 1       | Sorts symmetric ciphers from hashes, encodings and RSA                    |
| 2       | Questions on AES block and key sizes, and DES                             |
| 3       | Sees a padlock picture show through ECB and vanish under CBC or CTR       |
| 4       | Reads message B because a nonce was reused, then gives each a fresh one   |
| 5       | Sees a sum changed from 100000 to 900000, then adds a tag that refuses it |
| 6       | Sorts sound and risky ways to keep keys                                   |
| 7       | Questions on choosing AES-GCM and deriving keys from passwords            |
| 8       | Final questions                                                           |

## Cryptography module 3: hashes and passwords

`/intermediate/hashes` (lab id `hashes`, checkpoint `hashes-1`, award
`lab-hashes`, site setting `hashes`) uses real SHA-256 (from
`src/lib/crypto-basics/tools.ts`) and an HMAC-SHA256 checked against
`node:crypto` in `src/lib/hashes/tools.ts`. `leak` shows a user table with and
without salt against a table of common passwords; `costOutcome` compares
SHA-256 with bcrypt at each cost, using round speeds for one graphics card;
`webhook` signs a payment notice with a plain hash or an HMAC and shows
whether a forged amount gets through.

| Lessons | What the student does                                                   |
| ------- | ----------------------------------------------------------------------- |
| 1       | Sorts true and false claims about SHA-256                               |
| 2       | Sees three passwords cracked from an unsalted table, then adds a salt   |
| 3       | Picks bcrypt at a cost (8–12) slow for a GPU and quick for a user       |
| 4       | Sorts what is fit for storing passwords                                 |
| 5       | Sees a plain-hash webhook forged, then signs it with HMAC               |
| 6       | Questions on password policy (length, breach lists, no forced rotation) |
| 7       | Picks the right tool: SHA-256 for files, HMAC for a shared key          |
| 8       | Final questions                                                         |

## Cryptography module 4: public-key cryptography

`/intermediate/pubkey` (lab id `pubkey`, checkpoint `pubkey-1`, award
`lab-pubkey`, site setting `pubkey`) does real BigInt arithmetic on small
numbers in `src/lib/public-key/tools.ts`: `exchange` runs Diffie–Hellman in
three groups (p = 23, 2087 and 2⁶¹ − 1) and `eveSearch` tries exponents up to
100 000; `rsaKey` builds a key from two of the offered primes with e = 17,
and `factor` splits n by trial division; `middle` runs the exchange with
Mallory swapping in her own value, stopped when Bob's value is signed.

| Lessons | What the student does                                                |
| ------- | -------------------------------------------------------------------- |
| 1       | Sorts which key each action uses                                     |
| 2       | Sees Eve find the secret in small groups, then picks p = 2⁶¹ − 1     |
| 3       | Builds an RSA key, encrypts 42 and gets it back, and sees n factored |
| 4       | Questions on key sizes, factoring and quantum-resistant algorithms   |
| 5       | Sees Mallory read both sides, then has Bob sign his value            |
| 6       | Questions on what a signature proves                                 |
| 7       | Questions on hybrid encryption and forward secrecy                   |
| 8       | Final questions                                                      |

## Cryptography module 5: TLS and certificates

`/intermediate/tls` (lab id `tls`, checkpoint `tls-1`, award `lab-tls`, site
setting `tls`) follows the rules browsers and scanners apply, simplified, in
`src/lib/tls/tools.ts`: `nameMatches` covers one label per wildcard;
`checkCert` runs the browser's checks in order (trust, chain, dates, name)
and gives the error the first failure shows; `grade` caps an SSL Labs style
grade by the worst problem; `stripping` says whether a first and a later
visit survive SSL stripping with a redirect, HSTS and preloading. This
completes the Cryptography domain.

| Lessons | What the student does                                            |
| ------- | ---------------------------------------------------------------- |
| 1       | Sorts what TLS hides and what stays visible                      |
| 2       | Sorts which addresses a `*.shop.uz` certificate covers           |
| 3       | Fixes a server's certificate until the browser opens pay.shop.uz |
| 4       | Questions on CAs, Certificate Transparency and short lifetimes   |
| 5       | Raises a TLS setup from C to A+                                  |
| 6       | Protects the first and later visits with HSTS and preloading     |
| 7       | Sorts sound practice from common mistakes                        |
| 8       | Final questions                                                  |

## Network security module 1: TCP/IP in depth

`/intermediate/tcpip` (lab id `tcpip`, checkpoint `tcpip-1`, award
`lab-tcpip`, site setting `tcpip`) uses `src/lib/tcpip/tools.ts`: `ANSWERS`
gives the sequence and acknowledgement numbers of a handshake and its first
100 bytes; `portState` reads a SYN scan's replies as nmap does; `poisonOdds`
gives the chance one race poisons a DNS cache with the 16-bit ID alone, with
a random source port too, or with DNSSEC.

| Lessons | What the student does                                              |
| ------- | ------------------------------------------------------------------ |
| 1       | Sorts what the Ethernet, IP and TCP headers carry                  |
| 2       | Fills in the seq and ack numbers of a handshake and its first data |
| 3       | Sorts services into TCP and UDP                                    |
| 4       | Reads port states from scan replies                                |
| 5       | Questions on ping, traceroute and why not to block all ICMP        |
| 6       | Pushes the odds of DNS cache poisoning below one in a thousand     |
| 7       | Questions on SYN floods and SYN cookies                            |
| 8       | Final questions                                                    |

## Network security module 2: Traffic analysis

`/intermediate/traffic` (lab id `traffic`, checkpoint `traffic-1`, award
`lab-traffic`, site setting `traffic`) uses `src/lib/traffic/tools.ts`:
`CAPTURE` is a fifteen-packet recording with a port scan in it;
`parseFilter` reads a subset of Wireshark's display-filter syntax (`ip.src`,
`ip.dst`, `ip.addr`, `tcp.port`, `tcp.srcport`, `tcp.dstport`, `udp.port`,
the SYN, ACK and RST flags, bare protocol names, `==`/`!=`/`eq`/`ne`,
`&&`/`||`/`!` or `and`/`or`/`not`, brackets) and reports why a filter does
not parse; `decodeBasic` opens Basic credentials; `isBeacon` flags a host
with many connections at nearly equal gaps.

| Lessons | What the student does                                              |
| ------- | ------------------------------------------------------------------ |
| 1       | Clicks through the parts of a tcpdump line                         |
| 2       | Writes a display filter that shows exactly the scanner's bare SYNs |
| 3       | Sorts what TLS hides from what an observer still sees              |
| 4       | Follows a plain-HTTP stream and decodes the Basic password         |
| 5       | Sorts normal traffic from warning signs                            |
| 6       | Finds and isolates the beaconing host                              |
| 7       | Questions on SPAN, TAPs, NetFlow and permission to capture         |
| 8       | Final questions                                                    |

## Network security module 3: Firewalls and segmentation

`/intermediate/firewall` (lab id `firewall`, checkpoint `firewall-1`, award
`lab-firewall`, site setting `firewall`) uses `src/lib/firewall/tools.ts`: a
company with four zones (internet, office LAN, DMZ, internal servers) and
seven endpoints; `decide` applies a rule list first match wins, falling back
to a default policy; `orderResults` checks eight flows against a given order
(only D before E before F, with a default deny, gets all eight right);
`inbound` compares connection tracking with the stateless "allow source port
443" workaround; `narrowCheck` counts the flows a rule for the web server's
database access opens beyond the one it needs.

| Lessons | What the student does                                                    |
| ------- | ------------------------------------------------------------------------ |
| 1       | Clicks through the parts of an iptables rule                             |
| 2       | Reorders a rule list and picks the default policy                        |
| 3       | Lets the reply in and keeps a faked source port out                      |
| 4       | Narrows a rule until it opens nothing but the flow it is for             |
| 5       | Sorts devices into the DMZ, internal servers, office LAN and guest Wi-Fi |
| 6       | Questions on egress filtering, VLANs and logging denies                  |
| 7       | Sorts good practice from common mistakes                                 |
| 8       | Final questions                                                          |

## Network security module 4: Secure connections

`/intermediate/connections` (lab id `connections`, checkpoint
`connections-1`, award `lab-connections`, site setting `connections`) uses
`src/lib/connections/tools.ts`: `wifi` says what an attacker who recorded the
handshake gets under an open network, WEP, WPA2-PSK (an offline search at a
million guesses a second, or one second for a dictionary word) and WPA3-SAE
(no offline attack); `LEAKS` lists what an attacker on café Wi-Fi sees with
no VPN, a split tunnel or a full one, with DNS inside the tunnel or not;
`CONNECTS` are three SSH prompts, one of them a fingerprint that differs from
the published one only in its last character.

| Lessons | What the student does                                                 |
| ------- | --------------------------------------------------------------------- |
| 1       | Matches situations to WPA3, TLS, a VPN or SSH                         |
| 2       | Picks a Wi-Fi mode and password that a recorded handshake can't break |
| 3       | Questions on evil twins, WPS and WPA3-Enterprise                      |
| 4       | Sets up a VPN that leaves nothing visible on café Wi-Fi               |
| 5       | Decides, three times, whether an SSH host key fingerprint is safe     |
| 6       | Sorts safe sshd settings from risky ones                              |
| 7       | Questions on SSH port forwarding, bastion hosts and agent forwarding  |
| 8       | Final questions                                                       |

## Network security module 5: Intrusion detection

`/intermediate/ids` (lab id `ids`, checkpoint `ids-1`, award `lab-ids`, site
setting `ids`) uses `src/lib/ids/tools.ts`: `contentMatches` runs
`content:"/etc/passwd"` over seven request lines, on the raw bytes or on the
normalized `http.uri` buffer (`normalize`: %xx decoded, `//` collapsed), with
or without `nocase`; `peak` and `alerts` apply `threshold: type both, track
by_src` to failed SSH logins from two colleagues and two bots (only a
300-second window with a count from 4 to 12 catches both bots and neither
colleague); `precision` gives the share of real alerts for a base rate. It
completes the Network security domain.

| Lessons | What the student does                                             |
| ------- | ----------------------------------------------------------------- |
| 1       | Sorts detections into signatures and anomalies                    |
| 2       | Clicks through the parts of a Suricata rule                       |
| 3       | Makes a content rule catch encoded and upper-case path traversal  |
| 4       | Tunes a brute-force threshold to catch a slow bot and spare typos |
| 5       | Triages alerts into real and benign                               |
| 6       | Questions on IDS versus IPS and encrypted traffic                 |
| 7       | Questions on base rates and alert fatigue                         |
| 8       | Final questions                                                   |

## Digital forensics module 1: Handling evidence

`/intermediate/evidence` (lab id `evidence`, checkpoint `evidence-1`, award
`lab-evidence`, site setting `evidence`) opens the Digital forensics domain.
It uses `src/lib/evidence/tools.ts`: `problems` names what a reviewer would
pick on for each missing acquisition step (write blocker, hash of the
original, bit-for-bit image, hash of the image, working on a copy); `COPIES`
are four copies of an image, two of them one hex digit away from the
acquisition hash; `brokenLink` finds the first custody entry that doesn't
start with whoever held the evidence last.

| Lessons | What the student does                                          |
| ------- | -------------------------------------------------------------- |
| 1       | Sorts evidence by the order of volatility                      |
| 2       | Sorts right and wrong actions at the scene                     |
| 3       | Picks every step of an acquisition that stands up              |
| 4       | Clicks through the parts of a dd and a sha256sum command       |
| 5       | Marks copies intact or altered against the report's hash       |
| 6       | Finds where a chain of custody breaks                          |
| 7       | Questions on live systems, encrypted disks and hash algorithms |
| 8       | Final questions                                                |

## Digital forensics module 2: File systems

`/intermediate/filesystem` (lab id `filesystem`, checkpoint `filesystem-1`,
award `lab-filesystem`, site setting `filesystem`) uses
`src/lib/filesystem/tools.ts`: `CHANGES` gives the MACB timestamps that
reading, writing, chmod and a rename change on ext4 with strictatime;
`identify` names a file from its first bytes; `ARTIFACTS` are five events
from a web log in Tashkent time (UTC+5) and a file system in UTC, starting
in the order their clocks suggest, and `timelineSolved` checks them in UTC.

| Lessons | What the student does                                 |
| ------- | ----------------------------------------------------- |
| 1       | Clicks through the parts of stat output               |
| 2       | Ticks the timestamps each command changes             |
| 3       | Questions on deleted files, TRIM and disk images      |
| 4       | Matches file signatures (magic numbers) to file types |
| 5       | Orders an attack's events once every clock is in UTC  |
| 6       | Questions on timestomping                             |
| 7       | Questions on known-file hash sets (NSRL)              |
| 8       | Final questions                                       |

## Digital forensics module 3: Logs and artefacts

`/intermediate/logs` (lab id `logs`, checkpoint `logs-1`, award `lab-logs`,
site setting `logs`) uses `src/lib/logs/tools.ts`: `grep` runs `grep -E`
(with `-i` and `-v`) over an eleven-line auth.log in which 203.0.113.7
guesses root's password, logs in and adds a second UID 0 account; `readAs`
reads a raw number as Unix seconds, Unix milliseconds or Chrome/WebKit
microseconds since 1601, and `RAWS` are one moment written all three ways.

| Lessons | What the student does                                              |
| ------- | ------------------------------------------------------------------ |
| 1       | Clicks through the parts of an auth.log line                       |
| 2       | Greps the log and names the attacker's IP and back-door account    |
| 3       | Sorts Windows event IDs into logons, account changes and red flags |
| 4       | Sorts artefacts that prove a visit from those that prove a run     |
| 5       | Picks the epoch format that makes three numbers one moment         |
| 6       | Questions on cleared logs and central logging                      |
| 7       | Questions on shared accounts and clock sync                        |
| 8       | Final questions                                                    |

## Digital forensics module 4: Incident response

`/intermediate/response` (lab id `response`, checkpoint `response-1`, award
`lab-response`, site setting `response`) uses `src/lib/response/tools.ts`:
`INCIDENTS` are four reports with an impact and an urgency, and
`triageSolved` checks they are ordered by impact × urgency; `OUTCOMES` says
what each of six ransomware containment moves does — three keep the
evidence and stop the spread, three (power off everything, reinstall at
once, discuss it in the company chat) do harm.

| Lessons | What the student does                                   |
| ------- | ------------------------------------------------------- |
| 1       | Sorts actions into the four NIST SP 800-61 phases       |
| 2       | Orders an incident queue by severity                    |
| 3       | Picks only the right moves to contain ransomware        |
| 4       | Clicks through the parts of an incident ticket          |
| 5       | Questions on eradication, clean backups and recovery    |
| 6       | Questions on out-of-band communication and notification |
| 7       | Sorts helpful from harmful lessons-learned practice     |
| 8       | Final questions                                         |

## Digital forensics module 5: Writing the report

`/intermediate/report` (lab id `report`, checkpoint `report-1`, award
`lab-report`, site setting `report`) uses `src/lib/report/tools.ts`:
`SECTIONS` are a report's six sections in order and `DRAFT` the shuffled
order the lesson starts from; `PIECES` are six candidate sentences for one
finding — what happened, the evidence, the impact and a recommendation
belong; a guess about the attacker and the guessed password do not. It
completes the Digital forensics domain.

| Lessons | What the student does                                 |
| ------- | ----------------------------------------------------- |
| 1       | Matches readers to the section they read first        |
| 2       | Puts a draft report's sections in order               |
| 3       | Sorts facts from opinions                             |
| 4       | Builds one finding from the right pieces              |
| 5       | Sorts actionable recommendations from vague ones      |
| 6       | Questions on the executive summary                    |
| 7       | Questions on TLP labels and sending the report safely |
| 8       | Final questions                                       |

## Steganography module 1: The idea

`/intermediate/stego` (lab id `stego`, checkpoint `stego-1`, award
`lab-stego`, site setting `stego`) opens the Steganography domain. It uses
`src/lib/stego/tools.ts`: `POEMS` are two acrostics, one per language, whose
first letters spell the answer; `embed` tucks a secret into a chat message
as zero-width space (0) and zero-width non-joiner (1) characters, eight per
character, and `bitsOf`/`decodeBits` read it back.

| Lessons | What the student does                                       |
| ------- | ----------------------------------------------------------- |
| 1       | Sorts methods into hiding, encrypting or both               |
| 2       | Reads the word hidden in a poem's first letters             |
| 3       | Finds a secret hidden in invisible characters               |
| 4       | Clicks through the parts of a steghide command              |
| 5       | Sorts legitimate from malicious uses                        |
| 6       | Questions on the signs of hiding and Kerckhoffs's principle |
| 7       | Questions on capacity and stealth                           |
| 8       | Final questions                                             |

## Steganography module 2: Inside images

`/intermediate/lsb` (lab id `lsb`, checkpoint `lsb-1`, award `lab-lsb`, site
setting `lsb`) uses `src/lib/lsb/tools.ts`: `flipRed` shows how far flipping
each bit of a red value moves the colour (only bit 0 is invisible); `ROW` is
24 sky-blue pixels whose red LSBs spell "Hi!"; `picture` draws a 64×32
gradient with the word "CV26" written only into blue bit 0, and `plane`
shows any channel's bit plane on a canvas.

| Lessons | What the student does                                |
| ------- | ---------------------------------------------------- |
| 1       | Clicks through a pixel's channels and bits           |
| 2       | Finds the bit that changes a colour unseen           |
| 3       | Reads a message from the red LSBs of a row of pixels |
| 4       | Questions on capacity                                |
| 5       | Finds the word hidden in one bit plane               |
| 6       | Sorts formats and actions that keep or destroy LSBs  |
| 7       | Questions on statistical detection                   |
| 8       | Final questions                                      |

## Steganography module 3: Metadata

`/intermediate/metadata` (lab id `metadata`, checkpoint `metadata-1`, award
`lab-metadata`, site setting `metadata`) uses `src/lib/metadata/tools.ts`:
`EXIF` is a phone photo's exiftool listing whose GPS (`toDecimal`) lands at
the Registan, and `nearest` picks Samarkand out of four cities; `TAGS` are
six tags, four personal (GPS, Artist, lens serial, original date) to strip
and two (Orientation, colour space) the picture needs to display right.

| Lessons | What the student does                                    |
| ------- | -------------------------------------------------------- |
| 1       | Sorts personal from technical metadata                   |
| 2       | Locates a photo from its GPS tags                        |
| 3       | Clicks through a Word document's exiftool output         |
| 4       | Strips the personal tags but keeps the display ones      |
| 5       | Sorts actions that remove metadata from those that don't |
| 6       | Questions on metadata as evidence                        |
| 7       | Questions on real cases and prevention                   |
| 8       | Final questions                                          |

## Steganography module 4: Audio and file formats

`/intermediate/formats` (lab id `formats`, checkpoint `formats-1`, award
`lab-formats`, site setting `formats`) uses `src/lib/formats/tools.ts`:
`DUMP` is five xxd lines of cat.jpg, one of them holding the FF D9 end marker
followed at byte 48203 by a ZIP signature; `spectrogram` draws "SOS" into
the high frequencies of a 72×28 spectrogram over low-frequency "music",
while `waveform` shows nothing but noise.

| Lessons | What the student does                                          |
| ------- | -------------------------------------------------------------- |
| 1       | Clicks through binwalk output                                  |
| 2       | Finds where the JPEG ends and what is appended                 |
| 3       | Questions on polyglot files                                    |
| 4       | Finds the word in a sound's spectrogram                        |
| 5       | Sorts audio hiding methods by whether a spectrogram shows them |
| 6       | Questions on file and strings                                  |
| 7       | Questions on which tool to use when                            |
| 8       | Final questions                                                |

## Steganography module 5: Steganalysis

`/intermediate/steganalysis` (lab id `steganalysis`, checkpoint
`steganalysis-1`, award `lab-steganalysis`, site setting `steganalysis`)
uses `src/lib/steganalysis/tools.ts`: `natural` builds a photo's histogram
for values 100–115 whose neighbouring pairs differ by chance; `embedded`
evens every pair out (keeping its total), as filling the LSBs with random
bits does; `pairSpread` is the average share by which pairs differ, under
0.05 being too even for chance. It completes the Steganography domain.

| Lessons | What the student does                                 |
| ------- | ----------------------------------------------------- |
| 1       | Sorts strong signs of hiding from ordinary quirks     |
| 2       | Picks the photo whose histogram pairs are too even    |
| 3       | Questions on what statistical tests can and can't say |
| 4       | Matches suspect files to the tool to run first        |
| 5       | Clicks through zsteg output                           |
| 6       | Questions on stegseek and ethics                      |
| 7       | Questions on a methodical check                       |
| 8       | Final questions                                       |

## Blue team module 1: Logs and SIEM

`/intermediate/siem` (lab id `siem`, checkpoint `siem-1`, award `lab-siem`,
site setting `siem`) uses `src/lib/siem/tools.ts`: `RAWS` is one failed
login as sshd, a JSON web app and Windows event 4625 write it, with the
values the student maps onto the ECS fields `source.ip` and `user.name`;
`EVENTS` are twenty minutes of normalised logins in which one address sprays
three systems and then gets into one account; `search` counts them by
`user.name`, `source.ip` or `event.dataset`. It opens the Blue team domain.

| Lessons | What the student does                                  |
| ------- | ------------------------------------------------------ |
| 1       | Matches questions to the log source that answers them  |
| 2       | Maps three log formats onto one schema                 |
| 3       | Questions on time, clocks and forwarding               |
| 4       | Searches across sources for a password-spraying attack |
| 5       | Clicks through a Splunk search                         |
| 6       | Sorts useful dashboard panels from noise               |
| 7       | Questions on source health                             |
| 8       | Final questions                                        |

## Blue team module 2: Detection rules

`/intermediate/detection` (lab id `detection`, checkpoint `detection-1`,
award `lab-detection`, site setting `detection`) uses
`src/lib/detection/tools.ts`: `EVENTS` are eight Windows process-creation
events (three attacks, five normal); a `Rule` ticks selection items
(`powershell.exe`, `-enc` in the command line, an Office parent) and a filter
for the `svc_sccm` automation account; `score` counts caught attacks, false
alarms and misses, and `sigma` prints the rule as Sigma YAML. Only
powershell + `-enc` with the filter is perfect.

| Lessons | What the student does                                  |
| ------- | ------------------------------------------------------ |
| 1       | Sorts indicator, behaviour and anomaly rules           |
| 2       | Clicks through a Sigma rule                            |
| 3       | Builds an encoded-PowerShell rule with no false alarms |
| 4       | Questions on thresholds and time windows               |
| 5       | Sorts false positives from false negatives             |
| 6       | Sorts what is easy or hard for an attacker to change   |
| 7       | Questions on testing and keeping rules                 |
| 8       | Final questions                                        |

## Blue team module 3: Alert triage

`/intermediate/triage` (lab id `triage`, checkpoint `triage-1`, award
`lab-triage`, site setting `triage`) uses `src/lib/triage/tools.ts`: `ALERTS`
is a queue of five alerts (impossible travel through the VPN, a macro
spawning encoded PowerShell, a backup job with a stale password, quarantined
Mimikatz on a server, a stale Tor indicator), each with two lines of context
and the right call: escalate, close or tune.

| Lessons | What the student does                      |
| ------- | ------------------------------------------ |
| 1       | Sorts alerts into now and can wait         |
| 2       | Clicks through an alert's parts            |
| 3       | Works a queue of five alerts               |
| 4       | Questions on closing carefully             |
| 5       | Sorts what goes into an escalation         |
| 6       | Questions on SOC tiers, playbooks and SOAR |
| 7       | Questions on SOC metrics                   |
| 8       | Final questions                            |

## Blue team module 4: Threat hunting

`/intermediate/hunting` (lab id `hunting`, checkpoint `hunting-1`, award
`lab-hunting`, site setting `hunting`) uses `src/lib/hunting/tools.ts`:
`MATRIX` is a slice of ATT&CK (six tactics, real technique IDs) on which the
student marks the four techniques of a threat report (`REPORT`); `TASKS` are
scheduled tasks counted across forty computers, and `stacked` puts the rare
one first: a fake `svchost.exe` in `C:\Users\Public` on one machine.

| Lessons | What the student does                        |
| ------- | -------------------------------------------- |
| 1       | Sorts hunting from alert handling            |
| 2       | Sorts good hypotheses from vague ones        |
| 3       | Marks a threat report on the ATT&CK matrix   |
| 4       | Clicks through a technique's page            |
| 5       | Stacks scheduled tasks to find the rogue one |
| 6       | Questions on IOCs, IOAs, TLP and sharing     |
| 7       | Questions on closing a hunt                  |
| 8       | Final questions                              |

## Blue team module 5: Phishing analysis

`/intermediate/phishing` (lab id `phishing`, checkpoint `phishing-1`, award
`lab-phishing`, site setting `phishing`) uses `src/lib/phishing/tools.ts`:
`HEADERS` are the headers of a fake bank email (an invented bank on
`.example` domains, documentation IP ranges) whose first hop is the bottom
`Received` line and whose `Reply-To` points at a free mailbox; `LINKS` are six
links whose shown text and real address may differ, and `registered` takes a
host's last two labels. It completes the Blue team domain.

| Lessons | What the student does                                |
| ------- | ---------------------------------------------------- |
| 1       | Sorts signs of phishing from ordinary traits         |
| 2       | Clicks through the headers that matter               |
| 3       | Traces an email to its first server and reply domain |
| 4       | Questions on SPF, DKIM and DMARC                     |
| 5       | Reveals and judges six links                         |
| 6       | Sorts attachments by risk                            |
| 7       | Questions on responding to a confirmed phish         |
| 8       | Final questions                                      |

## OSINT module 1: Ethics and law

`/intermediate/ethics` (lab id `ethics`, checkpoint `ethics-1`, award
`lab-ethics`, site setting `ethics`) uses `src/lib/ethics/tools.ts`: `LETTER`
is a signed authorisation for an OSINT assessment of an invented company
(scope, exclusions, dates) and `ACTIONS` are seven research steps the student
allows or refuses, each failing on the target, the method or the date when
it fails. It opens the OSINT domain.

| Lessons | What the student does                             |
| ------- | ------------------------------------------------- |
| 1       | Sorts open sources from stolen or private ones    |
| 2       | Questions on personal-data and computer-crime law |
| 3       | Checks seven actions against an authorisation     |
| 4       | Sorts passive from active reconnaissance          |
| 5       | Questions on doing no harm                        |
| 6       | Questions on the researcher's OPSEC               |
| 7       | Clicks through a recorded finding                 |
| 8       | Final questions                                   |

## OSINT module 2: Search technique

`/intermediate/search` (lab id `search`, checkpoint `search-1`, award
`lab-search`, site setting `search`) uses `src/lib/search/tools.ts`: `DOCS`
are twelve invented pages and `search` is a small engine that understands
`site:` (with subdomains), `filetype:`/`ext:`, `intitle:`, quoted phrases and
`-exclusions`; the student narrows a query until only the leaked internal
price list (`TARGET`) is left.

| Lessons | What the student does                               |
| ------- | --------------------------------------------------- |
| 1       | Questions on what search engines index              |
| 2       | Clicks through a dork                               |
| 3       | Narrows a search to one exposed file                |
| 4       | Questions on dating archived pages                  |
| 5       | Sorts strong sources from ones needing confirmation |
| 6       | Questions on independent confirmation               |
| 7       | Questions on local languages and registers          |
| 8       | Final questions                                     |

## OSINT module 3: Domains and infrastructure

`/intermediate/infra` (lab id `infra`, checkpoint `infra-1`, award
`lab-infra`, site setting `infra`) uses `src/lib/infra/tools.ts`: `RECORDS`
is an invented company's DNS zone (Google mail, a Shopify shop, a CNAME left
pointing at a deleted Ghost blog) with three `QUESTIONS` answered from it;
`CERTS` are crt.sh-style rows and `subdomains` turns them into unique names
without wildcards, of which the student flags the three build and test
systems (`INTERNAL`).

| Lessons | What the student does                            |
| ------- | ------------------------------------------------ |
| 1       | Clicks through a WHOIS record                    |
| 2       | Sorts DNS records by what they reveal            |
| 3       | Reads a zone for providers and a dangling record |
| 4       | Turns certificate logs into a subdomain list     |
| 5       | Questions on ASNs and passive scanners           |
| 6       | Questions on third-party ownership               |
| 7       | Questions on assembling the map                  |
| 8       | Final questions                                  |

## OSINT module 4: Images and location

`/intermediate/geo` (lab id `geo`, checkpoint `geo-1`, award `lab-geo`, site
setting `geo`) uses `src/lib/geo/tools.ts`: `HITS` are reverse-search matches
for a "flood today" photo whose earliest copy (`ORIGIN`, 2019) exposes the
claim; `CLUES` are four hotspots on a drawn street (an Uzbek Latin sign, a
01 plate, right-hand traffic, a blue dome) and `sceneRight` wants at least
three of them read and Tashkent chosen.

| Lessons | What the student does                           |
| ------- | ----------------------------------------------- |
| 1       | Questions on reverse image search               |
| 2       | Finds a recycled photo's original and judges it |
| 3       | Sorts strong location clues from weak ones      |
| 4       | Reads a street scene and picks the city         |
| 5       | Questions on shadows and weather archives       |
| 6       | Questions on metadata as a claim                |
| 7       | Questions on who not to locate                  |
| 8       | Final questions                                 |

## OSINT module 5: Digital footprint

`/intermediate/footprint` (lab id `footprint`, checkpoint `footprint-1`,
award `lab-footprint`, site setting `footprint`) uses
`src/lib/footprint/tools.ts`: `FINDINGS` are six things an invented student's
self-audit turns up (geotagged photos, a breached reused password, a public
phone number, one handle on three sites, an olympiad note, a portfolio), each
with the right step — hide, secure or keep. It completes the OSINT domain.

| Lessons | What the student does                         |
| ------- | --------------------------------------------- |
| 1       | Sorts active from passive traces              |
| 2       | Questions on username reuse                   |
| 3       | Decides what to hide, secure or keep          |
| 4       | Questions on breaches and credential stuffing |
| 5       | Sorts privacy settings to change              |
| 6       | Questions on removal requests                 |
| 7       | Sorts steps into today and this month         |
| 8       | Final questions                               |

## Who gets in

`intermediateAccess()` (`src/lib/intermediate/access.ts`) decides:

- a signed-in student whose level is `intermediate` or `advanced`
  (`opensIntermediate`, `src/lib/student/levels.ts`) — the lab opens and its
  progress is saved to their account;
- a signed-in staff member — the lab opens as a preview;
- everyone else sees the lab's lock screen: a sign-in button for visitors, or,
  for a beginner student, what opens Intermediate (the beginner labs and the
  entrance test, then the teacher's placement).

Teachers place students in three ways:

- **Students** list (`/teacher/students`): the Level column and filter show
  who is where; tick students (or the header box for the whole list or group)
  and choose **Move the ticked students to → Intermediate**;
- a student's page: **Move to Intermediate** on the Level card, or the Level
  field of the details form;
- **Results** (`/teacher/results`): the level suggested by the entrance test,
  one by one or for everyone not placed yet.

Students outside a teacher's groups are never changed, and every change is
written to the audit log as `student.level`.

## Sessions

The student cookie `cv_student` is scoped to `/` so `/intermediate` can read
it. Sign-in buttons on Intermediate pages go to `/student/continue?to=…`, a
Route Handler under `/student`: it re-issues a session cookie that an older
browser still holds for `/student` only, or sends the visitor to
`/student/login?next=…` and back. `next` is limited to `/student` and
`/intermediate` paths.

## Teacher panel

**Teacher → Academy Intermediate** (`/teacher/intermediate`) lists the
students at the Intermediate and Advanced levels in the teacher's groups, with
lessons done in each open lab, their best checkpoint score and last sign-in.

## Adding a module

Give the module an `href` under `/intermediate/` and its `lab` id in
`src/lib/intermediate/roadmap.ts`, add the lab to `src/lib/lab-progress.ts`,
and render the page through `intermediateAccess()` and `IntermediateLocked`
like `src/app/[lang]/intermediate/http/page.tsx`. The roadmap card, the
access card's "Open" button and the teacher table pick it up from there.
