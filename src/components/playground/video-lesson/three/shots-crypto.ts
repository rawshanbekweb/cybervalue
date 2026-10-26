// 3D shots for the cryptography lesson: the leaked password vault, letters
// turning into bytes, the Base64 cookie, the three ways (book, fingerprint,
// safe), the hash machine, download mirrors, the wordlist drum, XOR light
// switches, the combination lock and the signed letter.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  BLUE,
  CYAN,
  GREEN,
  RED,
  SPARK,
  base,
  device,
  ease,
  floor,
  glow,
  label,
  seg,
  solid,
  stars,
  type Built,
} from "./world";

const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** Shows one sprite of a set and hides the rest. */
const only = (sprites: THREE.Object3D[], index: number) =>
  sprites.forEach((s, i) => (s.visible = i === index));

/** A database: a stack of glowing disks. */
function database() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const disk = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.6, 32),
      solid(0x132e4d, 0.5, 0.35),
    );
    disk.position.y = 0.4 + i * 0.75;
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.04, 8, 32),
      glow(BLUE, 2.2),
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = disk.position.y + 0.3;
    g.add(disk, rim);
  }
  const tag = label("o‘yin sayti · baza", "#ffffff", 56);
  tag.position.y = 3.2;
  g.add(tag);
  return g;
}

const VAULT = [
  // name, plain password, SHA-256, salt with the salted SHA-256
  ["ali", "qwerty123", "daaad6e560…43b5", "tuz 7Qx · 125f5694f3…7c3d"],
  ["dilnoza", "qwerty123", "daaad6e560…43b5", "tuz k2P · a46b64a741…76c2"],
  ["bek", "salom2024", "7f69d0c118…6c5b", "tuz Zr9 · b2569dd0d5…2d31"],
  ["olim", "12345678", "ef797c8118…a64f", "tuz q4M · ae85ee76b6…6560"],
];

/** The leaked database: plain passwords, then hashes, then salted hashes. */
export function vaultShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const db = database();
  db.position.set(-6, 0, 0);
  const jasur = device("hacker", "Jasur");
  jasur.position.set(6.5, 0, 0);
  scene.add(db, jasur);
  const color = ["#ff8b8b", "#ffd56b", "#8ff0c8"][stage] ?? "#ffffff";
  const rows = VAULT.map(([name, plain, hash, salted]) => {
    const text = `${name} · ${[plain, hash, salted][stage] ?? plain}`;
    const row = label(text, color, 64, "#10233b");
    row.scale.multiplyScalar(1.1);
    scene.add(row);
    return row;
  });
  // Ali's and Dilnoza's equal hashes light up in red.
  const bars = [0, 1].map(() => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.9, 0.05),
      new THREE.MeshBasicMaterial({
        color: RED,
        transparent: true,
        opacity: 0.45,
      }),
    );
    scene.add(bar);
    return bar;
  });
  const title = label(
    [
      "Parollar ochiq!",
      "Faqat hash — lekin ikkitasi bir xil",
      "Tuz bilan — hammasi har xil",
    ][stage] ?? "",
    "#1b1b1f",
    56,
    ["#ff4d4d", "#ffb829", "#2fbf8f"][stage],
  );
  title.position.set(0, 5.6, 0);
  scene.add(title);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 2.5, 4.5, 13.5 - ease(p) * 1.5);
      camera.lookAt(0, 2.2, 0);
      rows.forEach((row, i) => {
        const fly = ease(seg(p, 0.08 + i * 0.08, 0.3 + i * 0.08));
        row.position.set(lerp(-6, 0.5, fly), lerp(2, 4.3 - i * 0.9, fly), 0.5);
        row.material.opacity = Math.min(1, fly * 3);
      });
      const hot = stage === 1 ? seg(p, 0.45, 0.55) : 0;
      bars.forEach((bar, i) => {
        bar.visible = hot > 0;
        bar.position.set(0.5, 4.3 - i * 0.9, 0.3);
        (bar.material as THREE.MeshBasicMaterial).opacity =
          hot * (0.3 + Math.abs(Math.sin(t * 4)) * 0.25);
      });
      title.material.opacity = seg(p, 0.5, 0.6);
      jasur.rotation.y = Math.sin(t * 0.8) * 0.2;
    },
  };
}

const WORD: [string, number][] = [
  ["S", 83],
  ["a", 97],
  ["l", 108],
  ["o", 111],
  ["m", 109],
];

/** “Salom” letter by letter: each letter drops into a cube and becomes a number. */
export function bytesShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const items = WORD.map(([ch, n], i) => {
    const x = (i - 2) * 2.3;
    const letter = label(ch, "#ffffff", 120);
    const cube = new THREE.Mesh(
      new RoundedBoxGeometry(1.4, 1.4, 1.4, 3, 0.15),
      glow(BLUE, 0.35),
    );
    cube.position.set(x, 0.9, 0);
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.46, 1.46, 1.46)),
      new THREE.LineBasicMaterial({ color: CYAN }),
    );
    cube.add(edge);
    const num = label(String(n), "#1b1b1f", 64, "#ffb829");
    num.scale.multiplyScalar(0.8);
    num.position.set(x, 2.3, 0.8);
    const bin = label(n.toString(2).padStart(8, "0"), "#7fe3ff", 56);
    bin.position.set(x, -0.25, 1);
    const hex = label(`hex ${n.toString(16)}`, "#ffd56b", 56);
    hex.position.set(x, -0.95, 1);
    scene.add(letter, cube, num, bin, hex);
    return { x, letter, cube, num, bin, hex };
  });
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 3, 3.5, 11.5 - ease(p));
      camera.lookAt(0, 1.2, 0);
      items.forEach((it, i) => {
        const drop = ease(seg(p, 0.08 + i * 0.09, 0.2 + i * 0.09));
        it.letter.position.set(it.x, lerp(5.5, 1.1, drop), 0.8);
        it.letter.visible = drop < 1;
        it.num.material.opacity = seg(p, 0.2 + i * 0.09, 0.26 + i * 0.09);
        it.cube.rotation.y = drop * Math.PI * 2 + Math.sin(t + i) * 0.1;
        it.bin.material.opacity = seg(p, 0.65, 0.75);
        it.hex.material.opacity = seg(p, 0.8, 0.9);
      });
    },
  };
}

/** The Base64 cookie: decoded, changed to admin=true and encoded again. */
export function cookieShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const cookie = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.4, 0.5, 40),
    solid(0xb7834a, 0.05, 0.8),
  );
  cookie.rotation.x = Math.PI / 2;
  cookie.position.set(-3, 2.6, 0);
  for (let i = 0; i < 9; i++) {
    const chip = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 6),
      solid(0x3b2414, 0.1, 0.7),
    );
    const a = i * 2.4;
    const r = 0.5 + (i % 3) * 0.6;
    chip.position.set(Math.cos(a) * r, 0.25, Math.sin(a) * r);
    cookie.add(chip);
  }
  scene.add(cookie);
  const jasur = device("hacker", "Jasur");
  jasur.position.set(5, 0, 0.5);
  scene.add(jasur);
  const texts = [
    label("YWRtaW49ZmFsc2U=", "#ffd56b", 56, "#0e1f35"),
    label("admin=false", "#ffffff", 64, "#0e1f35"),
    label("admin=true", "#ffffff", 64, "#a32020"),
    label("YWRtaW49dHJ1ZQ==", "#ffd56b", 56, "#a32020"),
  ];
  texts.forEach((s) => {
    s.position.set(0.5, 5.4, 0.5);
    scene.add(s);
  });
  const steps = [
    "Base64 cookie",
    "Base64’dan ochildi",
    "false → true",
    "qayta kodlandi",
  ].map((text) => {
    const s = label(text, "#ffffff", 56);
    s.position.set(0.5, 4.3, 0.5);
    scene.add(s);
    return s;
  });
  const crown = label("ADMIN!", "#1b1b1f", 80, "#ff4d4d");
  crown.position.set(5, 3.6, 0.5);
  const crownSize = crown.scale.clone();
  scene.add(crown);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.18) * 2, 4, 13 - ease(p) * 1.5);
      camera.lookAt(0.5, 2.6, 0);
      const i = p < 0.3 ? 0 : p < 0.48 ? 1 : p < 0.65 ? 2 : 3;
      only(texts, i);
      only(steps, i);
      cookie.rotation.y = t * 0.3;
      const pulse = seg(p, 0.8, 0.86);
      crown.visible = pulse > 0;
      crown.scale
        .copy(crownSize)
        .multiplyScalar(0.6 + 0.4 * pulse + Math.sin(t * 5) * 0.03);
    },
  };
}

/** The three ways: a phrase book, a fingerprint and a safe. */
export function trioShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const plinth = (x: number, color: number) => {
    const g = new THREE.Group();
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.6, 0.3, 6),
      solid(0x132e4d),
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.04, 6, 6),
      glow(color, 2.4),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.15;
    g.add(top, ring);
    g.position.x = x;
    scene.add(g);
    return g;
  };
  const book = plinth(-5, SPARK);
  const pages = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.35, 1.2),
    solid(0xf4f1ea, 0.05, 0.8),
  );
  pages.position.y = 0.55;
  const cover = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.08, 1.3),
    solid(0xb07a12, 0.2, 0.6),
  );
  cover.position.y = 0.78;
  book.add(pages, cover);
  const print = plinth(0, CYAN);
  const rings = new THREE.Group();
  for (let i = 1; i <= 5; i++) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(i * 0.22, 0.035, 6, 40, Math.PI * 1.6),
      glow(CYAN, 1.8),
    );
    r.rotation.z = i * 0.6;
    rings.add(r);
  }
  rings.position.y = 1.7;
  print.add(rings);
  const safe = plinth(5, GREEN);
  const box = new THREE.Mesh(
    new RoundedBoxGeometry(1.6, 1.6, 1.4, 3, 0.1),
    solid(0x8a93a3, 0.7, 0.3),
  );
  box.position.y = 1.1;
  const dial = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.12, 24),
    glow(GREEN, 1.2),
  );
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0, 1.1, 0.75);
  safe.add(box, dial);
  const tags = [
    ["Kodlash", "har kim ochadi", "#b07a12", -5],
    ["Hash", "qaytmaydi", "#1b6f86", 0],
    ["Shifr", "faqat kalit ochadi", "#15846e", 5],
  ].map(([name, note, bg, x]) => {
    const head = label(String(name), "#ffffff", 64, String(bg));
    head.position.set(Number(x), 3.4, 0);
    const sub = label(String(note), "#d8e6f5", 44);
    sub.scale.multiplyScalar(0.8);
    sub.position.set(Number(x), 2.75, 0);
    scene.add(head, sub);
    return [head, sub];
  });
  const groups = [book, print, safe];
  return {
    scene,
    camera,
    frame(p, t) {
      // Stage 0 dwells on the book; stage 1 moves to the print, then the safe.
      const focus =
        stage === 0
          ? lerp(-1.5, -4, ease(seg(p, 0.1, 0.5)))
          : lerp(0, 5, ease(seg(p, 0.45, 0.6)));
      camera.position.set(focus * 0.7, 4.5, 12 - ease(seg(p, 0.1, 0.5)) * 2);
      camera.lookAt(focus * 0.6, 1.6, 0);
      const lit =
        stage === 0
          ? [1, 0.25, 0.25]
          : p < 0.5
            ? [0.25, 1, 0.25]
            : [0.25, 0.4, 1];
      groups.forEach((g, i) => {
        g.scale.setScalar(0.85 + lit[i] * 0.15 + Math.sin(t * 2 + i) * 0.01);
      });
      tags.forEach(([head, sub], i) => {
        head.material.opacity = 0.3 + lit[i] * 0.7;
        sub.material.opacity = 0.3 + lit[i] * 0.7;
      });
      cover.rotation.z = -Math.abs(Math.sin(t * 1.4)) * 0.4 * lit[0];
      rings.rotation.z = t * 0.4;
      dial.rotation.y = t * 1.5 * lit[2];
    },
  };
}

/** The hash machine: words go into the funnel, fingerprints come out. */
export function grinderShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(2.6, 2.2, 2, 3, 0.2),
    solid(0x8a93a3, 0.7, 0.3),
  );
  body.position.y = 1.4;
  const funnel = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 0.35, 1.2, 24, 1, true),
    solid(0xd8e0ea, 0.5, 0.3),
  );
  (funnel.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  funnel.position.y = 3.1;
  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, 1.2, 16),
    solid(0xb8c2d1, 0.8, 0.25),
  );
  spout.rotation.z = Math.PI / 2;
  spout.position.set(1.8, 1.2, 0);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12),
    glow(SPARK, 2),
  );
  lamp.position.set(0, 1.9, 1.05);
  const name = label("SHA-256", "#1b1b1f", 52, "#7fe3ff");
  name.scale.multiplyScalar(0.7);
  name.position.set(0, 1.1, 1.2);
  const machine = new THREE.Group();
  machine.add(body, funnel, spout, lamp, name);
  machine.position.x = -2;
  scene.add(machine);
  const pairs =
    stage === 0
      ? [
          ["salom", "038f270ca6…abbf"],
          ["Butun kitob", "54b94e6248…09f3"],
        ]
      : [
          ["salom", "038f270ca6…abbf"],
          ["Salom", "441f71d48a…7b46"],
        ];
  const items = pairs.map(([word, hash], i) => {
    const input = label(word, "#ffffff", 64, "#132e4d");
    input.scale.multiplyScalar(0.8);
    const output = label(hash, "#1b1b1f", 52, i === 0 ? "#ffb829" : "#7fe3ff");
    output.scale.multiplyScalar(1.25);
    scene.add(input, output);
    return { input, output };
  });
  const note = label(
    stage === 0 ? "har doim 64 ta hex belgi" : "1 harf → butunlay boshqa hash",
    "#1b1b1f",
    56,
    "#7fe3ff",
  );
  note.position.set(1.5, 5.5, 0);
  scene.add(note);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(1 + Math.sin(t * 0.2) * 2, 4, 12.5 - ease(p));
      camera.lookAt(1, 2.2, 0);
      let busy = 0;
      items.forEach(({ input, output }, i) => {
        const a = 0.1 + i * 0.4;
        const fall = ease(seg(p, a, a + 0.12));
        input.position.set(-2, lerp(6.2, 3.2, fall), 0);
        input.visible = fall < 1;
        busy = Math.max(
          busy,
          seg(p, a + 0.12, a + 0.14) * (1 - seg(p, a + 0.22, a + 0.24)),
        );
        const out = ease(seg(p, a + 0.22, a + 0.32));
        output.visible = out > 0;
        output.position.set(
          lerp(0.5, 4.2, out),
          lerp(1.2, 3.6 - i * 1.2, out),
          0.5,
        );
      });
      machine.position.y = busy * Math.sin(t * 40) * 0.05;
      (lamp.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1 + busy * 3;
      note.material.opacity = seg(p, 0.8, 0.88);
    },
  };
}

/** Three download mirrors; the third file's hash does not match. */
export function mirrorsShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 40));
  const official = label("Rasmiy hash: 9f2c1a…e41b", "#1b1b1f", 56, "#2fbf8f");
  official.position.set(0, 6.2, -2);
  scene.add(official);
  const ali = device("laptop", "Ali");
  ali.position.set(0, 0, 4);
  scene.add(ali);
  const mirrors = [-6, 0, 6].map((x, i) => {
    const server = device("server", `Oyna ${i + 1}`);
    server.position.set(x, 0, -3);
    scene.add(server);
    const file = new THREE.Mesh(
      new RoundedBoxGeometry(0.6, 0.8, 0.15, 2, 0.05),
      glow(i === 2 ? RED : SPARK, 1.2),
    );
    scene.add(file);
    const hash = label(
      i === 2 ? "4b7d0e…0c19" : "9f2c1a…e41b",
      "#ffffff",
      56,
      "#10233b",
    );
    hash.position.set(x, 4.1, -3);
    const verdict = label(
      i === 2 ? "SOXTA" : "TO‘G‘RI",
      "#1b1b1f",
      56,
      i === 2 ? "#ff4d4d" : "#2fbf8f",
    );
    verdict.scale.multiplyScalar(1.2);
    verdict.position.set(x, 5, -3);
    scene.add(hash, verdict);
    return { x, file, hash, verdict };
  });
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.15) * 2, 5, 12.5 - ease(p) * 1.5);
      camera.lookAt(0, 2, 0);
      mirrors.forEach((m, i) => {
        const go = ease(seg(p, 0.1 + i * 0.08, 0.3 + i * 0.08));
        m.file.position.set(
          lerp(m.x, 0, go),
          2 + Math.sin(go * Math.PI) * 1.5,
          lerp(-3, 4, go),
        );
        m.file.rotation.y = t * 2;
        m.file.visible = go < 1;
        m.hash.material.opacity = seg(p, 0.35 + i * 0.05, 0.4 + i * 0.05);
        m.verdict.material.opacity = seg(p, 0.5 + i * 0.08, 0.55 + i * 0.08);
      });
    },
  };
}

const GUESSES: [string, string][] = [
  ["123456", "8d969eef6e…6c92"],
  ["parol", "1c62590c99…9380"],
  ["salom", "038f270ca6…abbf"],
  ["111111", "bcb15f8214…802a"],
  ["iloveyou", "e4ad93ca07…a5ae"],
  ["qwerty", "65e84be335…37c5"],
  ["admin", "8c6976e5b5…a918"],
  ["qwerty123", "daaad6e560…43b5"],
];

/** The dictionary attack: a drum of common passwords, hashed one by one. */
export function wordlistShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const drum = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 3.4, 32, 1, true),
    solid(0x132e4d, 0.4, 0.4),
  );
  drum.add(core);
  GUESSES.forEach(([word], i) => {
    const a = (i / GUESSES.length) * Math.PI * 2;
    const w = label(word, "#ffd56b", 52);
    w.scale.multiplyScalar(1.1);
    w.position.set(Math.sin(a) * 2.3, 1.2 - (i % 3) * 1.1, Math.cos(a) * 2.3);
    drum.add(w);
  });
  drum.position.set(-4.5, 2, 0);
  scene.add(drum);
  const target = label("ali: daaad6e560…43b5", "#ffffff", 72, "#a32020");
  target.position.set(2.5, 5.6, 0);
  scene.add(target);
  const tries = GUESSES.map(([word, hash], i) => {
    const last = i === GUESSES.length - 1;
    const s = label(
      `${word} → ${hash}`,
      last ? "#1b1b1f" : "#ffffff",
      52,
      last ? "#2fbf8f" : "#132e4d",
    );
    s.scale.multiplyScalar(1.3);
    s.position.set(2.5, 3.6, 0);
    scene.add(s);
    return s;
  });
  const found = label("TOPILDI!", "#1b1b1f", 80, "#ff4d4d");
  found.position.set(2.5, 1.8, 0.5);
  scene.add(found);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 2, 4.5, 13 - ease(p));
      camera.lookAt(0, 2.8, 0);
      const i = Math.min(
        GUESSES.length - 1,
        Math.floor(seg(p, 0.1, 0.75) * GUESSES.length),
      );
      only(tries, p < 0.1 ? -1 : i);
      drum.rotation.y = seg(p, 0.05, 0.75) * Math.PI * 6;
      const hit = seg(p, 0.76, 0.8);
      found.visible = hit > 0;
      found.material.opacity = hit;
      found.position.y = 1.8 + Math.sin(t * 6) * 0.05;
    },
  };
}

/** XOR as light switches: H (01001000) with key 00101010 gives b, and back. */
export function xorShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const plain = 72;
  const key = 42;
  const on = glow(SPARK, 2.4);
  const off = solid(0x1c2a44, 0.3, 0.6);
  const bits = (n: number) => [...n.toString(2).padStart(8, "0")].map(Number);
  const keyBits = bits(key);
  const bulbs = bits(plain).map((_, i) => {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 14), off);
    bulb.position.set((i - 3.5) * 1.3, 3.2, 0);
    const sw = new THREE.Mesh(
      new RoundedBoxGeometry(0.6, 0.9, 0.3, 2, 0.08),
      solid(keyBits[i] ? GREEN : 0x3a4558, 0.3, 0.5),
    );
    sw.position.set((i - 3.5) * 1.3, 1, 0);
    const k = label(String(keyBits[i]), "#ffffff", 56);
    k.scale.multiplyScalar(0.7);
    k.position.set((i - 3.5) * 1.3, 1, 0.4);
    scene.add(bulb, sw, k);
    return { bulb, sw };
  });
  const rows = [
    label("Matn:  H = 01001000", "#ffffff", 52, "#132e4d"),
    label("Shifr: b = 01100010", "#1b1b1f", 52, "#ffb829"),
    label("Yana XOR → H = 01001000", "#1b1b1f", 52, "#2fbf8f"),
  ];
  rows.forEach((r) => {
    r.position.set(0, 5, 0);
    scene.add(r);
  });
  const keyTag = label("Kalit: 00101010", "#8ff0c8", 48);
  keyTag.scale.multiplyScalar(1.3);
  keyTag.position.set(0, -0.2, 0.5);
  scene.add(keyTag);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 2, 3.5, 12 - ease(p));
      camera.lookAt(0, 2.4, 0);
      const flips = (p > 0.35 ? 1 : 0) + (p > 0.7 ? 1 : 0);
      const pb = bits(plain);
      bulbs.forEach(({ bulb, sw }, i) => {
        const lit = flips % 2 === 1 ? pb[i] ^ keyBits[i] : pb[i];
        bulb.material = lit ? on : off;
        // The switches with a 1 bit press down at each flip.
        const press = keyBits[i]
          ? Math.max(
              Math.sin(seg(p, 0.3, 0.4) * Math.PI),
              Math.sin(seg(p, 0.65, 0.75) * Math.PI),
            )
          : 0;
        sw.position.z = -press * 0.3;
      });
      only(rows, flips);
    },
  };
}

/** A combination lock that grows from 3 dials to 12, with the time to try all keys. */
export function comboShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const dials = Array.from({ length: 12 }, (_, i) => {
    const g = new THREE.Group();
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.7, 10),
      solid(0x8a93a3, 0.7, 0.3),
    );
    wheel.rotation.z = Math.PI / 2;
    const digit = label(String((i * 7) % 10), "#1b1b1f", 72, "#ffd56b");
    digit.scale.multiplyScalar(0.5);
    digit.position.z = 0.7;
    g.add(wheel, digit);
    g.position.set((i - 5.5) * 0.85, 2.4, 0);
    scene.add(g);
    return { g, wheel };
  });
  const frame = new THREE.Mesh(
    new RoundedBoxGeometry(11, 1.8, 1.2, 3, 0.2),
    solid(0x132e4d, 0.5, 0.4),
  );
  frame.position.set(0, 2.4, -0.4);
  scene.add(frame);
  const tiers = [
    ["40 bit — bir zumda", "#ff4d4d"],
    ["56 bit (DES) — bir necha kun", "#ffb829"],
    ["128 bit (AES) — koinot yoshidan ko‘p", "#2fbf8f"],
  ].map(([text, bg]) => {
    const s = label(text, "#1b1b1f", 56, bg);
    s.position.set(0, 4.6, 0);
    scene.add(s);
    return s;
  });
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 2, 4, 13 - ease(p) * 1.5);
      camera.lookAt(0, 2.6, 0);
      const tier = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
      const count = [3, 6, 12][tier];
      dials.forEach(({ g, wheel }, i) => {
        g.visible = i < count;
        wheel.rotation.x = t * (2 + i * 0.4);
      });
      frame.scale.x = count / 12 + 0.08;
      only(tiers, tier);
    },
  };
}

/** A letter sealed with a signature; in stage 1 Jasur changes the link and the seal breaks. */
export function stampShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const paper = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 6.4, 0.05),
    solid(0xf4f1ea, 0.05, 0.85),
  );
  paper.position.set(-1, 3.3, 0);
  scene.add(paper);
  const lines = [
    label("o‘yin sayti → Ali", "#1b1b1f", 52),
    label("Parolingizni almashtiring:", "#1b1b1f", 48),
  ];
  lines[0].position.set(-1, 5.8, 0.1);
  lines[1].position.set(-1, 4.9, 0.1);
  const link = label("oyin.uz/reset", "#1d4f91", 52);
  link.position.set(-1, 4.1, 0.1);
  const fake = label("oyin-uz.xyz/reset", "#c41f1f", 52);
  fake.position.set(-1, 4.1, 0.1);
  scene.add(...lines, link, fake);
  for (let i = 0; i < 3; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(3.6 - i * 0.6, 0.12, 0.02),
      solid(0xc9c2b2),
    );
    bar.position.set(-1.4, 3.1 - i * 0.5, 0.05);
    scene.add(bar);
  }
  const seal = new THREE.Group();
  const wax = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.12, 32),
    glow(SPARK, 0.9),
  );
  wax.rotation.x = Math.PI / 2;
  const sealTag = label("IMZO", "#1b1b1f", 52);
  sealTag.scale.multiplyScalar(0.6);
  sealTag.position.z = 0.1;
  seal.add(wax, sealTag);
  seal.position.set(0.6, 1.2, 0.1);
  scene.add(seal);
  const stamp = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 1.4, 16),
    solid(0x6b4a33, 0.1, 0.7),
  );
  handle.position.z = 1.2;
  handle.rotation.x = Math.PI / 2;
  const foot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 0.3, 32),
    solid(0x8a93a3, 0.7, 0.3),
  );
  foot.rotation.x = Math.PI / 2;
  foot.position.z = 0.3;
  stamp.add(handle, foot);
  scene.add(stamp);
  const keyTag = label("yopiq kalit", "#1b1b1f", 44, "#ffb829");
  keyTag.scale.multiplyScalar(0.7);
  scene.add(keyTag);
  const verdict = [
    label("Ochiq kalit: imzo TO‘G‘RI", "#1b1b1f", 52, "#2fbf8f"),
    label("Imzo MOS EMAS — soxta!", "#1b1b1f", 52, "#ff4d4d"),
  ];
  verdict.forEach((v) => {
    v.position.set(4.6, 5.2, 0.5);
    scene.add(v);
  });
  const jasur = device("hacker", "Jasur");
  jasur.position.set(6, 0, -1);
  jasur.visible = stage === 1;
  scene.add(jasur);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1, 8),
    glow(RED, 3),
  );
  scene.add(beam);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(1 + Math.sin(t * 0.2) * 2, 4, 12.5 - ease(p));
      camera.lookAt(1, 3, 0);
      const waxMat = wax.material as THREE.MeshStandardMaterial;
      if (stage === 0) {
        const down = Math.sin(seg(p, 0.25, 0.5) * Math.PI);
        stamp.visible = p > 0.15 && p < 0.6;
        stamp.position.set(0.6, 1.2, 0.2 + (1 - down) * 2.5);
        seal.visible = p > 0.38;
        keyTag.visible = stamp.visible;
        keyTag.position.set(0.6, 2.4, 3);
        link.visible = true;
        fake.visible = false;
        beam.visible = false;
        const ok = seg(p, 0.7, 0.78);
        waxMat.color.setHex(ok > 0 ? GREEN : SPARK);
        waxMat.emissive.setHex(ok > 0 ? GREEN : SPARK);
        verdict[0].visible = ok > 0;
        verdict[1].visible = false;
      } else {
        stamp.visible = keyTag.visible = false;
        seal.visible = true;
        const zap = seg(p, 0.15, 0.35);
        beam.visible = zap > 0 && zap < 1;
        const from = new THREE.Vector3(6, 1.5, -1);
        const to = new THREE.Vector3(-1, 4.1, 0.1);
        beam.position.copy(from).lerp(to, 0.5);
        beam.scale.y = from.distanceTo(to);
        beam.lookAt(to);
        beam.rotateX(Math.PI / 2);
        link.visible = p < 0.3;
        fake.visible = p >= 0.3;
        const bad = seg(p, 0.55, 0.62);
        waxMat.color.setHex(bad > 0 ? RED : SPARK);
        waxMat.emissive.setHex(bad > 0 ? RED : SPARK);
        waxMat.emissiveIntensity = 0.9 + bad * Math.abs(Math.sin(t * 6));
        verdict[0].visible = false;
        verdict[1].visible = bad > 0;
      }
    },
  };
}
