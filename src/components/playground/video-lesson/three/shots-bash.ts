// 3D shots for the Bash lesson: the shop's server under a night attack, Kibi
// cooking from a recipe card, variable boxes on a shelf, the two quote gates,
// the for-loop conveyor, the while-loop rocket, the if fork in the road, the
// log guard with a torch and the gift box hiding rm -rf.
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
  makeKibi,
  seg,
  solid,
  stars,
  type Built,
} from "./world";

const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** Shows one sprite of a set and hides the rest. */
const only = (sprites: THREE.Object3D[], index: number) =>
  sprites.forEach((s, i) => (s.visible = i === index));

/** A crate with a name tag, for files and variables. */
function crate(name: string, color = SPARK) {
  const g = new THREE.Group();
  g.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(1.3, 1, 1, 2, 0.08),
      solid(0x8a6a45, 0.1, 0.7),
    ),
  );
  const tag = label(
    name,
    "#1b1b1f",
    60,
    `#${color.toString(16).padStart(6, "0")}`,
  );
  tag.position.set(0, 0.95, 0.4);
  g.add(tag);
  return g;
}

/** The shop's server: red failed logins stream in (0), or calm green ones (1). */
export function nightserverShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(500, 40));
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 24, 16),
    glow(0xdfe8f5, 0.9),
  );
  moon.position.set(-9, 9, -12);
  scene.add(moon);
  const server = device("server", "shop.uz");
  server.position.set(-3.5, 0, 0);
  scene.add(server);
  const siren = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 12),
    glow(stage === 0 ? RED : GREEN, 2),
  );
  siren.position.set(-3.5, 3.9, 0);
  scene.add(siren);
  const attacker = device("hacker", "45.13.7.91");
  attacker.position.set(8, 0, -3);
  attacker.visible = stage === 0;
  scene.add(attacker);
  const packets = Array.from({ length: 6 }, () => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
      glow(RED, 2),
    );
    m.visible = stage === 0;
    scene.add(m);
    return m;
  });
  const text =
    stage === 0
      ? "Failed password for root from 45.13.7.91"
      : "Accepted publickey for ali";
  const rows = Array.from({ length: 7 }, () => {
    const row = label(text, stage === 0 ? "#ff8b8b" : "#8ff0c8", 56, "#0b1626");
    scene.add(row);
    return row;
  });
  const title = label(
    stage === 0
      ? "/var/log/auth.log · 10 000 qator"
      : "03:00 · skript qo‘riqlaydi",
    "#1b1b1f",
    52,
    stage === 0 ? "#ff4d4d" : "#2fbf8f",
  );
  title.position.set(3, 6.4, 0);
  scene.add(title);
  const { kibi, pose } = makeKibi();
  kibi.scale.setScalar(0.5);
  kibi.visible = stage === 1;
  scene.add(kibi);
  return {
    scene,
    camera,
    frame(p, t, talk) {
      camera.position.set(Math.sin(t * 0.15) * 2, 4.5, 14 - ease(p) * 1.5);
      camera.lookAt(1, 2.8, 0);
      const speed = stage === 0 ? 1.4 : 0.35;
      rows.forEach((row, i) => {
        const y = ((i * 0.75 + t * speed) % 5.25) + 0.6;
        row.position.set(3, y, 0.5);
        row.material.opacity = Math.min(1, (5.85 - y) * 1.5, (y - 0.6) * 3);
      });
      (siren.material as THREE.MeshStandardMaterial).emissiveIntensity =
        stage === 0 ? 1 + Math.abs(Math.sin(t * 6)) * 3 : 1.5;
      packets.forEach((m, i) => {
        const k = (t * 0.6 + i / packets.length) % 1;
        m.position.set(
          lerp(8, -3.5, k),
          1.5 + Math.sin(k * Math.PI) * 2,
          lerp(-3, 0, k),
        );
      });
      pose(t, talk * 0.4, 0);
      kibi.position.x = -1.2;
      kibi.position.z = 1.5;
    },
  };
}

const STEPS = [
  "1. Guruch yuv",
  "2. Sabzi to‘gra",
  "3. Qozonni qizdir",
  "4. Osh dam!",
];

/** Kibi the cook follows a recipe card line by line, like Bash runs a script. */
export function recipeShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const card = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 4.4, 0.05),
    solid(0xf4f1ea, 0.05, 0.85),
  );
  card.position.set(-3.2, 3, 0);
  scene.add(card);
  const head = label("osh.sh", "#1b1b1f", 56);
  head.position.set(-3.2, 4.7, 0.1);
  scene.add(head);
  const lines = STEPS.map((s, i) => {
    const l = label(s, "#1b1b1f", 60);
    l.position.set(-3.2, 3.8 - i * 0.8, 0.1);
    scene.add(l);
    return l;
  });
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.62, 0.02),
    glow(SPARK, 0.8),
  );
  scene.add(bar);
  const { kibi, pose } = makeKibi();
  kibi.scale.setScalar(0.6);
  scene.add(kibi);
  const hat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.45, 0.8, 16),
    solid(0xffffff, 0, 0.9),
  );
  scene.add(hat);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 0.85, 1, 24),
    solid(0x8a93a3, 0.8, 0.3),
  );
  pot.position.set(3.6, 0.5, 0.5);
  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 0.6, 12),
    glow(0xff7a1a, 2),
  );
  fire.rotation.x = Math.PI;
  fire.position.set(3.6, 0.05, 0.5);
  scene.add(pot, fire);
  const steam = Array.from({ length: 5 }, () => {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
      }),
    );
    scene.add(s);
    return s;
  });
  return {
    scene,
    camera,
    frame(p, t, talk) {
      camera.position.set(Math.sin(t * 0.2) * 2, 4, 12 - ease(p));
      camera.lookAt(0, 2.4, 0);
      const step = Math.min(3, Math.floor(seg(p, 0.1, 0.9) * 4));
      bar.position.set(-3.2, 3.8 - step * 0.8, 0.05);
      lines.forEach((l, i) => (l.material.opacity = i <= step ? 1 : 0.45));
      pose(t, talk * 0.5, step === 3 ? 1 : 0);
      kibi.position.set(lerp(0.6, 2, step / 3), kibi.position.y, 1);
      hat.position.set(kibi.position.x, kibi.position.y + 2.15, 1);
      fire.visible = step >= 2;
      fire.scale.setScalar(0.9 + Math.sin(t * 12) * 0.1);
      steam.forEach((s, i) => {
        const k = (t * 0.5 + i / steam.length) % 1;
        s.visible = step >= 3;
        s.position.set(3.6 + Math.sin(k * 6 + i) * 0.3, 1.1 + k * 2.5, 0.5);
        (s.material as THREE.MeshStandardMaterial).opacity = 0.5 * (1 - k);
      });
    },
  };
}

/** Variables as labelled boxes on a shelf; with spaces around = the box falls. */
export function shelfShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.2, 1.6),
    solid(0x6b4a33, 0.1, 0.7),
  );
  board.position.set(0, 2.2, 0);
  scene.add(board);
  for (const x of [-4.3, 4.3]) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.2, 1.6),
      solid(0x4a3526),
    );
    post.position.set(x, 1.1, 0);
    scene.add(post);
  }
  const boxes = [
    ["NAME", "Ali", -2.6],
    ["SERVER", "web-1", 0],
  ].map(([name, value, x]) => {
    const box = crate(String(name), CYAN);
    box.position.set(Number(x), 2.8, 0);
    const v = label(String(value), "#1b1b1f", 56, "#ffb829");
    v.scale.multiplyScalar(0.7);
    scene.add(box, v);
    return { box, v, x: Number(x) };
  });
  const bad = crate("NAME = Ali", RED);
  scene.add(bad);
  const error = label(
    "bash: NAME: command not found",
    "#ffffff",
    48,
    "#a32020",
  );
  error.position.set(2.6, 5.2, 0.5);
  scene.add(error);
  const good = label("NAME=Ali  →  $NAME", "#1b1b1f", 52, "#2fbf8f");
  good.position.set(-1.3, 5.2, 0.5);
  scene.add(good);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 2, 4.5, 11.5 - ease(p));
      camera.lookAt(0, 2.6, 0);
      boxes.forEach(({ v, x }, i) => {
        const drop = ease(seg(p, 0.15 + i * 0.2, 0.3 + i * 0.2));
        v.position.set(x, lerp(5.5, 2.9, drop), 0.6);
      });
      good.visible = stage === 0 && p > 0.6;
      bad.visible = stage === 1;
      // The badly written box wobbles on the edge, then falls off.
      const fall = ease(seg(p, 0.5, 0.62));
      bad.position.set(2.8 + fall * 1.8, 2.8 - fall * 2.3, 0);
      bad.rotation.z =
        stage === 1 ? Math.sin(t * 8) * 0.08 * (1 - fall) - fall * 1.2 : 0;
      error.visible = stage === 1 && p > 0.6;
    },
  };
}

/** One message through two gates: "…" puts Ali in, '…' leaves $NAME as is. */
export function quotesShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const gate = (x: number, color: number, text: string) => {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.14, 10, 32, Math.PI),
      glow(color, 2),
    );
    arch.position.set(x, 0, -1);
    const tag = label(text, "#ffffff", 120);
    tag.position.set(x, 2.3, -1);
    scene.add(arch, tag);
  };
  gate(-3.5, BLUE, '"…"');
  gate(3.5, SPARK, "'…'");
  const start = label("Salom, $NAME", "#ffffff", 72, "#132e4d");
  start.position.set(0, 1.4, 4);
  scene.add(start);
  const left = [
    label("Salom, $NAME", "#ffffff", 68, "#132e4d"),
    label("Salom, Ali", "#1b1b1f", 68, "#7fe3ff"),
  ];
  const right = [
    label("Salom, $NAME", "#ffffff", 68, "#132e4d"),
    label("Salom, $NAME", "#1b1b1f", 68, "#ffb829"),
  ];
  scene.add(...left, ...right);
  const box = crate("NAME", CYAN);
  box.position.set(-6.5, 0.5, -1);
  const ali = label("Ali", "#1b1b1f", 52, "#ffb829");
  ali.scale.multiplyScalar(0.7);
  ali.position.set(-6.5, 1.9, -0.5);
  scene.add(box, ali);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 1.5, 4, 10 - ease(p));
      camera.lookAt(0, 1.2, 0);
      start.visible = p < 0.2;
      const go = ease(seg(p, 0.2, 0.75));
      const through = go > 0.62 ? 1 : 0;
      for (const [side, sprites] of [
        [-1, left],
        [1, right],
      ] as const) {
        only(sprites, p < 0.2 ? -1 : through);
        sprites.forEach((s) =>
          s.position.set(side * lerp(0.5, 3.5, go), 1.4, lerp(4, -3.5, go)),
        );
      }
    },
  };
}

const FILES = ["app.log", "auth.log", "db.log"];

/** The for loop as a conveyor: each file passes Kibi's scanner in turn. */
export function conveyorShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.25, 1.8),
    solid(0x1c2230, 0.3, 0.7),
  );
  belt.position.y = 0.9;
  scene.add(belt);
  const rollers = Array.from({ length: 16 }, (_, i) => {
    const r = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 1.9, 10),
      solid(0x8a93a3, 0.7, 0.3),
    );
    r.rotation.x = Math.PI / 2;
    r.position.set(-7.5 + i, 0.7, 0);
    scene.add(r);
    return r;
  });
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(1.7, 0.1, 8, 24, Math.PI),
    glow(GREEN, 2),
  );
  arch.position.set(0, 0.9, 0);
  arch.rotation.y = Math.PI / 2;
  scene.add(arch);
  const crates = FILES.map((f) => {
    const c = crate(f, SPARK);
    scene.add(c);
    return c;
  });
  const { kibi, pose } = makeKibi();
  kibi.scale.setScalar(0.5);
  scene.add(kibi);
  const vars = FILES.map((f) => {
    const s = label(`FILE=${f}`, "#1b1b1f", 72, "#7fe3ff");
    s.position.set(0, 4.6, 0);
    scene.add(s);
    return s;
  });
  const code = label("for FILE in *.log; do … done", "#ffffff", 64, "#132e4d");
  code.position.set(0, 5.6, -0.5);
  scene.add(code);
  return {
    scene,
    camera,
    frame(p, t, talk) {
      camera.position.set(Math.sin(t * 0.2) * 2, 5, 12.5 - ease(p));
      camera.lookAt(0, 2, 0);
      const flow = seg(p, 0.08, 0.92) * 3;
      crates.forEach((c, i) => {
        const x = (flow - i - 0.5) * 6;
        c.position.set(x, 1.5, 0);
        c.visible = x > -8 && x < 8;
      });
      rollers.forEach((r) => (r.rotation.y = -flow * 10));
      const current = Math.min(2, Math.floor(flow));
      only(vars, p < 0.08 ? -1 : current);
      const near = crates.some((c) => Math.abs(c.position.x) < 0.8);
      (arch.material as THREE.MeshStandardMaterial).emissiveIntensity = near
        ? 4
        : 1.5;
      pose(t, talk * 0.4, near ? 1 : 0);
      kibi.position.set(2, kibi.position.y + 0.9, -1.6);
    },
  };
}

/** while [ $i -gt 0 ]: the countdown 5…1, then the rocket lifts off. */
export function rocketShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(600, 40));
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2.2, 0.4, 6),
    solid(0x132e4d),
  );
  pad.position.y = 0.2;
  scene.add(pad);
  const rocket = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 3, 24),
    solid(0xeaf2fb, 0.4, 0.3),
  );
  body.position.y = 1.5;
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.6, 1.2, 24),
    glow(RED, 0.8),
  );
  nose.position.y = 3.6;
  const porthole = new THREE.Mesh(
    new THREE.CircleGeometry(0.25, 20),
    glow(CYAN, 2),
  );
  porthole.position.set(0, 2.2, 0.61);
  rocket.add(body, nose, porthole);
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.8, 0.8),
      glow(BLUE, 1),
    );
    const a = (i / 3) * Math.PI * 2;
    fin.position.set(Math.sin(a) * 0.6, 0.4, Math.cos(a) * 0.6);
    fin.rotation.y = a;
    rocket.add(fin);
  }
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.6, 16),
    glow(0xff7a1a, 3),
  );
  flame.rotation.x = Math.PI;
  flame.position.y = -0.7;
  rocket.add(flame);
  rocket.position.y = 0.4;
  scene.add(rocket);
  const counts = ["5", "4", "3", "2", "1", "Start!"].map((n, i) => {
    const s = label(
      i === 5 ? n : `i=${n}`,
      "#1b1b1f",
      96,
      i === 5 ? "#2fbf8f" : "#ffb829",
    );
    s.position.set(-4.5, 4, 0);
    scene.add(s);
    return s;
  });
  const cond = label("while [ $i -gt 0 ]", "#ffffff", 52, "#132e4d");
  cond.position.set(-4.5, 6, 0);
  scene.add(cond);
  return {
    scene,
    camera,
    frame(p, t) {
      const lift = ease(seg(p, 0.75, 1));
      camera.position.set(Math.sin(t * 0.2) * 2, 4 + lift * 4, 13);
      camera.lookAt(-1, 3 + lift * 4, 0);
      const n = Math.min(
        5,
        Math.floor(seg(p, 0.08, 0.75) * 5 + (p >= 0.75 ? 1 : 0)),
      );
      only(counts, p < 0.08 ? -1 : n);
      counts.forEach((c) => (c.position.y = 4 + lift * 4));
      cond.position.y = 6 + lift * 4;
      rocket.position.y = 0.4 + lift * lift * 12;
      rocket.position.x = Math.sin(t * 30) * 0.03 * (p > 0.7 ? 1 : 0);
      flame.visible = p > 0.7;
      flame.scale.set(1, 0.8 + Math.sin(t * 25) * 0.2 + lift, 1);
    },
  };
}

/** if: a fork in the road; COUNT=9800 takes the red branch. */
export function forkShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const road = (
    x: number,
    z: number,
    angle: number,
    length: number,
    color: number,
  ) => {
    const r = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.05, length),
      solid(0x1c2230, 0.2, 0.8),
    );
    r.position.set(x, 0.03, z);
    r.rotation.y = angle;
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.06, length),
      glow(color, 1.5),
    );
    line.position.copy(r.position);
    line.rotation.y = angle;
    scene.add(r, line);
  };
  road(0, 4, 0, 6, BLUE);
  road(-2.5, -2.3, -0.6, 7, RED);
  road(2.5, -2.3, 0.6, 7, GREEN);
  const sign = label("[ $COUNT -gt 100 ] ?", "#1b1b1f", 72, "#ffb829");
  sign.position.set(0, 3.2, 1);
  scene.add(sign);
  const yes = label("ha → ogohlantirish", "#ffffff", 72, "#a32020");
  yes.position.set(-4.6, 2.4, -5);
  const no = label("yo‘q → hammasi joyida", "#1b1b1f", 72, "#2fbf8f");
  no.position.set(4.6, 2.4, -5);
  scene.add(yes, no);
  const car = new THREE.Group();
  car.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(0.9, 0.6, 1.3, 2, 0.1),
      glow(SPARK, 1),
    ),
  );
  const tag = label("COUNT=9800", "#1b1b1f", 64, "#ffd56b");
  tag.position.y = 1;
  car.add(tag);
  scene.add(car);
  const siren = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 12),
    glow(RED, 1),
  );
  siren.position.set(-4.6, 0.6, -5.5);
  scene.add(siren);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.15) * 2, 7, 11 - ease(p));
      camera.lookAt(0, 0.5, -1);
      const a = ease(seg(p, 0.1, 0.4));
      const b = ease(seg(p, 0.45, 0.75));
      if (b === 0) car.position.set(0, 0.4, lerp(6.5, 1, a));
      else car.position.set(lerp(0, -4.4, b), 0.4, lerp(1, -5, b));
      car.rotation.y = b > 0 ? 0.6 : 0;
      const hit = seg(p, 0.75, 0.8);
      (siren.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1 + hit * Math.abs(Math.sin(t * 6)) * 3;
      yes.material.opacity = 0.5 + hit * 0.5;
      no.material.opacity = 0.5;
    },
  };
}

/** A guard with a torch runs along the log, marking failed lines (0); then
 * the firewall blocks the attacker's address (1). */
export function guardShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const LINES = 8;
  const rows = Array.from({ length: LINES }, (_, i) => {
    const failed = i % 4 !== 1;
    const row = label(
      failed
        ? "Failed password for root from 45.13.7.91"
        : "Accepted publickey for ali",
      "#d8e6f5",
      52,
      "#0b1626",
    );
    row.position.set(0.8, 4.6 - i * 0.62, 0);
    const mark = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.35, 0.35),
      glow(failed ? RED : GREEN, 2),
    );
    mark.position.set(-3.6, row.position.y, 0.2);
    scene.add(row, mark);
    return { row, mark, failed };
  });
  const { kibi, pose } = makeKibi();
  kibi.scale.setScalar(0.5);
  scene.add(kibi);
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(7.6, 0.55, 0.05),
    new THREE.MeshBasicMaterial({
      color: 0xfff1b0,
      transparent: true,
      opacity: 0.18,
    }),
  );
  scene.add(beam);
  const counters = [0, 1, 2, 3, 4].map((k) => {
    const s = label(
      `root: ${[0, 2400, 4900, 7300, 9800][k]} urinish`,
      "#1b1b1f",
      68,
      "#ff4d4d",
    );
    s.position.set(0.8, 5.6, 0);
    scene.add(s);
    return s;
  });
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 4, 6),
    new THREE.MeshStandardMaterial({
      color: 0xff7a1a,
      emissive: 0xff7a1a,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.6,
    }),
  );
  wall.position.set(2, 2, 0);
  scene.add(wall);
  const attacker = device("hacker", "45.13.7.91");
  attacker.position.set(8, 0, 0);
  scene.add(attacker);
  const server = device("server", "shop.uz");
  server.position.set(-5, 0, 0);
  scene.add(server);
  const packets = Array.from({ length: 5 }, () => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
      glow(RED, 2),
    );
    scene.add(m);
    return m;
  });
  const blocked = label("45.13.7.91 bloklandi", "#1b1b1f", 72, "#2fbf8f");
  blocked.position.set(0, 5.6, 0);
  const ssh = label("PasswordAuthentication no", "#ffffff", 64, "#132e4d");
  ssh.position.set(-5, 4.6, 0);
  scene.add(blocked, ssh);
  const scanParts = [
    kibi,
    beam,
    ...counters,
    ...rows.flatMap((r) => [r.row, r.mark]),
  ];
  const blockParts = [wall, attacker, server, blocked, ssh, ...packets];
  scanParts.forEach((o) => (o.visible = stage === 0));
  blockParts.forEach((o) => (o.visible = stage === 1));
  return {
    scene,
    camera,
    frame(p, t, talk) {
      camera.position.set(Math.sin(t * 0.15) * 2, 4, 12 - ease(p));
      camera.lookAt(0, stage === 0 ? 2.8 : 2.2, 0);
      if (stage === 0) {
        // The torch sweeps down the log, one line after another.
        const y = lerp(4.9, 0, seg(p, 0.1, 0.8));
        pose(t, talk * 0.4, 1);
        kibi.position.set(-5.2, y - 0.9 + kibi.position.y, 0.5);
        beam.position.set(0.8, Math.max(y, 4.6 - (LINES - 1) * 0.62), 0.1);
        rows.forEach(({ row, mark, failed }) => {
          const seen = row.position.y > y - 0.2;
          mark.visible = seen;
          row.material.color.setHex(seen && failed ? 0xff8b8b : 0xd8d8d8);
        });
        only(counters, Math.min(4, Math.floor(seg(p, 0.1, 0.8) * 4.99)));
      } else {
        const up = ease(seg(p, 0.1, 0.3));
        wall.scale.y = Math.max(0.01, up);
        wall.position.y = 2 * up;
        packets.forEach((m, i) => {
          const k = (t * 0.7 + i / packets.length) % 1;
          // Before the wall rises the packets reach the server; after, they bounce.
          const end = up < 1 ? -5 : 2.3;
          const x = lerp(8, end, Math.min(1, k * 1.6));
          m.position.set(x, 1.5 + Math.sin(k * Math.PI) * 1.2, 0);
          m.visible = k < 0.62 || up < 1;
        });
        blocked.visible = p > 0.35;
        ssh.visible = p > 0.6;
      }
    },
  };
}

/** A gift box labelled curl | bash opens to show rm -rf; then: read it first. */
export function trojanShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const box = new THREE.Mesh(
    new RoundedBoxGeometry(2.4, 2, 2.4, 2, 0.08),
    solid(0x2b5bd7, 0.2, 0.5),
  );
  box.position.y = 1;
  const ribbonA = new THREE.Mesh(
    new THREE.BoxGeometry(2.45, 2.05, 0.35),
    glow(SPARK, 0.8),
  );
  ribbonA.position.y = 1;
  const ribbonB = ribbonA.clone();
  ribbonB.rotation.y = Math.PI / 2;
  scene.add(box, ribbonA, ribbonB);
  const lid = new THREE.Group();
  lid.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(2.7, 0.4, 2.7, 2, 0.08),
      solid(0x2b5bd7, 0.2, 0.5),
    ),
  );
  const bow = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.35, 0.12, 40, 8),
    glow(SPARK, 1),
  );
  bow.position.y = 0.5;
  lid.add(bow);
  scene.add(lid);
  const cmd = label("curl https://… | bash", "#ffffff", 68, "#132e4d");
  cmd.position.set(0, 4.4, 0);
  scene.add(cmd);
  const inside = new THREE.PointLight(RED, 0, 8);
  inside.position.set(0, 2.3, 0);
  scene.add(inside);
  const danger = label("rm -rf ~", "#ffffff", 96, "#a32020");
  scene.add(danger);
  const read = label("Avval o‘qing: less install.sh", "#1b1b1f", 68, "#2fbf8f");
  read.position.set(0, 5.6, 0);
  scene.add(read);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 3, 4.5, 11 - ease(p));
      camera.lookAt(0, 3, 0);
      const open = ease(seg(p, 0.12, 0.3));
      lid.position.set(open * 2.5, 2.2 + open * 2, -open * 1.5);
      lid.rotation.z = -open * 1.2;
      inside.intensity = open * (10 + Math.sin(t * 8) * 4);
      danger.visible = open > 0.3;
      danger.position.set(0, 2.2 + open * 1.8, 0.3);
      cmd.visible = open < 0.5;
      read.visible = p > 0.6;
    },
  };
}
