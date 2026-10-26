// 3D shots for the HTTPS lesson: the Caesar wheel, the paint-mixing key
// exchange, the TLS handshake, the eavesdropper's X-ray, the certificate
// passport, the chain of trust and the fake shop front.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  BLUE,
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

/** A small padlock: body and shackle. */
function padlock(color = SPARK) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(0.7, 0.55, 0.3, 4, 0.08),
    solid(color, 0.8, 0.25),
  );
  const shackle = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.05, 8, 16, Math.PI),
    solid(0xcfd6e0, 0.9, 0.2),
  );
  shackle.position.y = 0.27;
  g.add(body, shackle);
  return g;
}

export function caesarShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const outer = new THREE.Group();
  const inner = new THREE.Group();
  scene.add(outer, inner);
  const disc = (r: number, color: number) => {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, 0.2, 64),
      solid(color, 0.4, 0.4),
    );
    m.rotation.x = Math.PI / 2;
    return m;
  };
  outer.add(disc(4.2, 0x132e4d));
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(4.2, 0.05, 8, 64),
    glow(BLUE, 2),
  );
  outer.add(rim);
  inner.add(disc(3.1, 0x1c2a44));
  inner.position.z = 0.15;
  const innerRim = new THREE.Mesh(
    new THREE.TorusGeometry(3.1, 0.05, 8, 64),
    glow(SPARK, 2),
  );
  inner.add(innerRim);
  [...letters].forEach((ch, i) => {
    const a = Math.PI / 2 - (i / 26) * Math.PI * 2;
    const o = label(ch, "#ffffff", 80);
    o.scale.multiplyScalar(0.75);
    o.position.set(Math.cos(a) * 3.7, Math.sin(a) * 3.7, 0.2);
    outer.add(o);
    const n = label(ch, "#ffd56b", 80);
    n.scale.multiplyScalar(0.7);
    n.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0.1);
    inner.add(n);
  });
  const pointer = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, 0.5, 3),
    glow(GREEN, 2.5),
  );
  pointer.rotation.z = Math.PI;
  pointer.position.set(0, 4.7, 0.3);
  scene.add(pointer);
  const hub = label("kalit = 3", "#1b1b1f", 64, "#ffb829");
  hub.position.set(0, 0, 0.4);
  hub.scale.multiplyScalar(0.8);
  scene.add(hub);
  const example = label("A → D   B → E   C → F", "#ffffff", 56, "#132e4d");
  example.position.set(0, -5, 0.5);
  scene.add(example);
  return {
    scene,
    camera,
    frame(p, t) {
      // The inner ring turns three letters back, so A sits over D.
      inner.rotation.z = -ease(seg(p, 0.15, 0.55)) * ((Math.PI * 2) / 26) * 3;
      camera.position.set(
        Math.sin(t * 0.25) * 2,
        -1 + Math.cos(t * 0.2),
        15.5 - ease(p) * 1.5,
      );
      camera.lookAt(0, -0.3, 0);
      hub.material.opacity = seg(p, 0.5, 0.6);
      example.material.opacity = seg(p, 0.6, 0.7);
    },
  };
}

const PAINT = {
  yellow: 0xffd23f,
  red: 0xe63946,
  blue: 0x3b8be0,
  orange: 0xf08a3c,
  green: 0x3fa34d,
  brown: 0x7a4b2a,
};

/** A paint bucket whose liquid colour can change. */
function bucket(color: number) {
  const g = new THREE.Group();
  g.scale.setScalar(1.4);
  const pail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.45, 0.9, 24, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xd8dde6,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    }),
  );
  const paint = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.52, 0.05, 24),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.25,
    }),
  );
  paint.position.y = 0.36;
  g.add(pail, paint);
  return {
    g,
    set(c: THREE.Color) {
      const m = paint.material as THREE.MeshStandardMaterial;
      m.color.copy(c);
      m.emissive.copy(c);
    },
  };
}

const mix = (a: number, b: number, x: number) =>
  new THREE.Color(a).lerp(new THREE.Color(b), x);

export function paintShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(250, 30));
  const spots = {
    ali: new THREE.Vector3(-5, 0, 0),
    bank: new THREE.Vector3(5, 0, 0),
    jasur: new THREE.Vector3(0, 0, -4),
  };
  for (const [name, at] of Object.entries(spots)) {
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.7, 0.2, 6),
      solid(0x132e4d),
    );
    plinth.position.copy(at);
    const edge = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.03, 6, 6),
      glow(name === "jasur" ? RED : BLUE, 2.2),
    );
    edge.rotation.x = Math.PI / 2;
    edge.position.copy(at).setY(0.1);
    const tag = label(
      name === "ali" ? "Ali" : name === "bank" ? "Bank" : "Jasur",
      name === "jasur" ? "#ff8b8b" : "#ffffff",
      64,
    );
    tag.position.copy(at).setY(2.4);
    scene.add(plinth, edge, tag);
  }
  // Buckets at each place.
  const aliMain = bucket(PAINT.yellow);
  const bankMain = bucket(PAINT.yellow);
  const aliSecret = bucket(PAINT.red);
  const bankSecret = bucket(PAINT.blue);
  const common = bucket(PAINT.yellow);
  const toBank = bucket(PAINT.orange);
  const toAli = bucket(PAINT.green);
  const spyA = bucket(PAINT.orange);
  const spyB = bucket(PAINT.green);
  aliMain.g.position.set(-5, 0.55, 0.6);
  bankMain.g.position.set(5, 0.55, 0.6);
  aliSecret.g.position.set(-6, 0.55, -0.6);
  bankSecret.g.position.set(6, 0.55, -0.6);
  common.g.position.set(0, 0.55, 2.5);
  spyA.g.position.set(-0.7, 0.55, -4);
  spyB.g.position.set(0.7, 0.55, -4);
  scene.add(
    aliMain.g,
    bankMain.g,
    aliSecret.g,
    bankSecret.g,
    common.g,
    toBank.g,
    toAli.g,
    spyA.g,
    spyB.g,
  );
  const secretA = label("yashirin", "#ffffff", 44, "#e63946");
  secretA.position.set(-6, 1.7, -0.6);
  const secretB = label("yashirin", "#ffffff", 44, "#3b8be0");
  secretB.position.set(6, 1.7, -0.6);
  const commonTag = label("umumiy", "#1b1b1f", 44, "#ffd23f");
  commonTag.position.set(0, 1.7, 2.5);
  const question = label("?", "#ff8b8b", 120);
  question.position.set(0, 2.6, -4);
  const same = label("Bir xil kalit!", "#ffffff", 56, "#7a4b2a");
  same.position.set(0, 3.6, 1);
  scene.add(secretA, secretB, commonTag, question, same);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.15) * 2, 6.5, 12);
      camera.lookAt(0, 0.6, -0.5);
      // Stage 0: the shared yellow is agreed in the open.
      common.g.visible = commonTag.visible = stage === 0;
      aliSecret.g.visible = bankSecret.g.visible = stage >= 1;
      secretA.visible = secretB.visible = stage >= 1;
      if (stage === 0) {
        const share = ease(seg(p, 0.35, 0.7));
        aliMain.g.position.set(lerp(0, -5, share), 0.55, lerp(2.5, 0.6, share));
        bankMain.g.position.set(lerp(0, 5, share), 0.55, lerp(2.5, 0.6, share));
        aliMain.set(new THREE.Color(PAINT.yellow));
        bankMain.set(new THREE.Color(PAINT.yellow));
        commonTag.material.opacity = seg(p, 0.05, 0.15);
        for (const b of [toBank, toAli, spyA, spyB]) b.g.visible = false;
        question.visible = same.visible = false;
        return;
      }
      aliMain.g.position.set(-5, 0.55, 0.6);
      bankMain.g.position.set(5, 0.55, 0.6);
      if (stage === 1) {
        const mixing = ease(seg(p, 0.3, 0.5));
        aliMain.set(mix(PAINT.yellow, PAINT.orange, mixing));
        bankMain.set(mix(PAINT.yellow, PAINT.green, mixing));
        aliSecret.g.rotation.z = -Math.sin(mixing * Math.PI) * 1.2;
        bankSecret.g.rotation.z = Math.sin(mixing * Math.PI) * 1.2;
        const fly = ease(seg(p, 0.6, 0.9));
        toBank.g.visible = toAli.g.visible = fly > 0;
        toBank.g.position.set(
          lerp(-5, 4, fly),
          0.55 + Math.sin(fly * Math.PI) * 2.5,
          lerp(0.6, 1.8, fly),
        );
        toAli.g.position.set(
          lerp(5, -4, fly),
          0.55 + Math.sin(fly * Math.PI) * 2.5,
          lerp(0.6, 1.8, fly),
        );
        spyA.g.visible = spyB.g.visible = fly > 0.5;
        question.visible = same.visible = false;
        return;
      }
      // Stage 2: each adds their secret to the other's mixture.
      aliMain.set(new THREE.Color(PAINT.orange));
      bankMain.set(new THREE.Color(PAINT.green));
      toAli.g.visible =
        toBank.g.visible =
        spyA.g.visible =
        spyB.g.visible =
          true;
      toAli.g.position.set(-4, 0.55, 1.8);
      toBank.g.position.set(4, 0.55, 1.8);
      const add = ease(seg(p, 0.2, 0.5));
      toAli.set(mix(PAINT.green, PAINT.brown, add));
      toBank.set(mix(PAINT.orange, PAINT.brown, add));
      aliSecret.g.rotation.z = -Math.sin(add * Math.PI) * 1.2;
      bankSecret.g.rotation.z = Math.sin(add * Math.PI) * 1.2;
      const glowUp = seg(p, 0.5, 0.6);
      toAli.g.scale.setScalar(1.4 * (1 + glowUp * 0.3));
      toBank.g.scale.setScalar(1.4 * (1 + glowUp * 0.3));
      same.visible = glowUp > 0;
      same.material.opacity = glowUp;
      question.visible = p > 0.65;
      question.material.opacity = seg(p, 0.65, 0.75);
    },
  };
}

/** A message card flying between the two ends. */
function card(text: string, color: string) {
  const g = new THREE.Group();
  g.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(3.2, 1, 0.08, 3, 0.06),
      glow(parseInt(color.slice(1), 16), 0.8),
    ),
  );
  const tag = label(text, "#1b1b1f", 56);
  tag.position.z = 0.08;
  tag.scale.multiplyScalar(0.9);
  g.add(tag);
  return g;
}

export function handshakeShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 40));
  const browser = device("laptop", "Brauzer");
  browser.position.set(-6, 0, 0);
  browser.scale.setScalar(1.3);
  const server = device("bank", "bank.uz");
  server.position.set(6, 0, 0);
  server.scale.setScalar(1.3);
  scene.add(browser, server);
  const msgs =
    stage === 0
      ? [
          { text: "ClientHello", dir: 1, color: "#ffb829" },
          { text: "ServerHello", dir: -1, color: "#9cc3ee" },
          { text: "Sertifikat", dir: -1, color: "#9cc3ee" },
        ]
      : [
          { text: "Finished", dir: 1, color: "#2fbf8f" },
          { text: "Finished", dir: -1, color: "#2fbf8f" },
        ];
  const cards = msgs.map((m) => {
    const c = card(m.text, m.color);
    scene.add(c);
    return c;
  });
  const keyL = label("kalit ✓", "#1b1b1f", 56, "#ffb829");
  keyL.position.set(-6, 4.4, 0);
  const keyR = label("kalit ✓", "#1b1b1f", 56, "#ffb829");
  keyR.position.set(6, 4.6, 0);
  scene.add(keyL, keyR);
  const tunnel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 1, 6, 1, true),
    new THREE.MeshStandardMaterial({
      color: GREEN,
      emissive: GREEN,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    }),
  );
  tunnel.rotation.z = Math.PI / 2;
  tunnel.position.y = 1.2;
  scene.add(tunnel);
  const lock = padlock();
  lock.position.set(0, 2.6, 0);
  scene.add(lock);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 1.5, 5, 13 - ease(p));
      camera.lookAt(0, 1.4, 0);
      const span = stage === 0 ? 0.85 : 0.5;
      cards.forEach((c, i) => {
        const a = 0.1 + (i / cards.length) * span;
        const x = ease(seg(p, a, a + span / cards.length));
        const dir = msgs[i].dir;
        c.visible = x > 0 && x < 1;
        c.position.set(
          dir > 0 ? lerp(-5, 5, x) : lerp(5, -5, x),
          2 + Math.sin(x * Math.PI) * 2.2,
          0.5,
        );
        c.rotation.y = Math.sin(t * 2 + i) * 0.2;
      });
      const keys = stage === 1 ? seg(p, 0.05, 0.15) : 0;
      keyL.visible = keyR.visible = keys > 0;
      keyL.material.opacity = keyR.material.opacity = keys;
      const build = stage === 1 ? ease(seg(p, 0.62, 0.85)) : 0;
      tunnel.visible = build > 0.01;
      tunnel.scale.set(1, Math.max(0.01, build * 10), 1);
      lock.visible = stage === 1 && p > 0.85;
      lock.rotation.y = t * 1.5;
      lock.scale.setScalar(ease(seg(p, 0.85, 0.95)) * 1.6);
    },
  };
}

export function xrayShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(250, 30));
  const envelope = new THREE.Group();
  scene.add(envelope);
  envelope.position.y = 2.2;
  envelope.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(6, 3.6, 0.25, 4, 0.1),
      solid(0xf4f1ea, 0.05, 0.8),
    ),
  );
  const flap = new THREE.Mesh(
    new THREE.ConeGeometry(3.1, 1.4, 3),
    solid(0xe6dfcf, 0.05, 0.8),
  );
  flap.rotation.z = Math.PI;
  flap.scale.set(1, 1, 0.08);
  flap.position.set(0, 1.1, 0.15);
  envelope.add(flap);
  const seal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.1, 24),
    glow(GREEN, 1.4),
  );
  seal.rotation.x = Math.PI / 2;
  seal.position.set(0, 0.6, 0.2);
  envelope.add(seal);
  const outside = label("bank.uz · 203.0.113.10", "#1b1b1f", 56);
  outside.position.set(0, -0.9, 0.3);
  outside.scale.multiplyScalar(1.3);
  const outsideScale = outside.scale.clone();
  envelope.add(outside);
  const plain = ["POST /login", "Cookie: session=7f2a", "pass=Qwerty-2026"];
  const insideTexts = plain.map((line, i) => {
    const s = label(line, "#ff8b8b", 48, "#1b1b1f");
    s.position.set(0, 0.2 - i * 0.55, -0.25);
    s.scale.multiplyScalar(0.8);
    envelope.add(s);
    const g = label("▓▓▓▓▓▓▓▓▓▓▓▓", "#2fbf8f", 48, "#1b1b1f");
    g.position.copy(s.position);
    g.scale.multiplyScalar(0.8);
    envelope.add(g);
    return { s, g };
  });
  // The scanner frame sweeping across.
  const scanner = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.08, 6, 4),
    glow(RED, 2.4),
  );
  scanner.rotation.z = Math.PI / 4;
  scene.add(scanner);
  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 3.6),
    new THREE.MeshBasicMaterial({
      color: RED,
      transparent: true,
      opacity: 0.12,
    }),
  );
  scene.add(beam);
  const seen = label("Ko‘rinadi: domen, IP", "#1b1b1f", 52, "#ffb829");
  seen.position.set(0, 0.7, 1.5);
  const hidden = label("Yashirin: hammasi ichkarida", "#ffffff", 52, "#2fbf8f");
  hidden.position.set(0, 4.9, 0);
  scene.add(seen, hidden);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 1.5, 3, 9);
      camera.lookAt(0, 2, 0);
      envelope.rotation.y = Math.sin(t * 0.5) * 0.12;
      const sweep = stage === 0 ? seg(p, 0.2, 0.8) : 0.5;
      const x = lerp(-3.5, 3.5, sweep);
      scanner.position.set(x, 2.2, 0.8);
      beam.position.set(x, 2.2, 0.5);
      scanner.visible = beam.visible = stage === 0 || p < 0.2;
      // Inside the beam the scanner shows only noise.
      insideTexts.forEach(({ s, g }) => {
        const under = Math.abs(x - 0) < 2.5 && stage === 0 && p > 0.2;
        s.visible = false;
        g.visible = under || stage === 1;
      });
      seen.visible = hidden.visible = stage === 1;
      seen.material.opacity = seg(p, 0.15, 0.3);
      hidden.material.opacity = seg(p, 0.45, 0.6);
      outside.scale
        .copy(outsideScale)
        .multiplyScalar(1 + (stage === 1 ? Math.sin(t * 4) * 0.04 : 0));
    },
  };
}

export function passportShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const book = new THREE.Group();
  book.position.y = 2.3;
  scene.add(book);
  const cover = new THREE.Mesh(
    new RoundedBoxGeometry(3.4, 4.4, 0.2, 4, 0.12),
    solid(0x132e4d, 0.3, 0.4),
  );
  book.add(cover);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.05, 6, 6),
    glow(BLUE, 2),
  );
  rim.position.set(0, 0.6, 0.12);
  book.add(rim);
  const title = label("SERTIFIKAT", "#eaf2fb", 64);
  title.position.set(0, -0.9, 0.14);
  const cv = label("CV", "#eaf2fb", 96);
  cv.position.set(0, 0.6, 0.14);
  book.add(title, cv);
  const page = new THREE.Group();
  page.position.set(4.2, 2.3, 0);
  scene.add(page);
  page.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(4.4, 4.4, 0.1, 3, 0.08),
      solid(0xf4f1ea, 0.05, 0.8),
    ),
  );
  const fields = [
    ["Nomi", "bank.uz"],
    ["Bergan", "R3 Intermediate CA"],
    ["Muddati", "2026-11-30 gacha"],
    ["Ochiq kalit", "04:8f:3a:…"],
  ].map(([k, v], i) => {
    const s = label(`${k}: ${v}`, "#1b1b1f", 44);
    s.position.set(0, 1.5 - i * 0.75, 0.1);
    s.scale.multiplyScalar(0.8);
    page.add(s);
    return s;
  });
  const stamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.3, 32),
    glow(SPARK, 1),
  );
  stamp.rotation.x = Math.PI / 2;
  page.add(stamp);
  const signed = label("Imzo ✓", "#1b1b1f", 56, "#2fbf8f");
  signed.position.set(0.9, -1.75, 0.3);
  page.add(signed);
  const noPrivate = label(
    "Yopiq kalit yo‘q — u serverda",
    "#ffffff",
    44,
    "#d22",
  );
  noPrivate.position.set(4.2, -0.2, 0.5);
  scene.add(noPrivate);
  return {
    scene,
    camera,
    frame(p, t) {
      if (stage === 0) {
        book.position.x = 0;
        book.rotation.y =
          (1 - ease(seg(p, 0.05, 0.4))) * Math.PI * 1.5 + Math.sin(t) * 0.1;
        page.visible = false;
        noPrivate.visible = false;
        camera.position.set(0, 3, 8.5);
        camera.lookAt(0, 2.3, 0);
        return;
      }
      book.position.x = -2.4;
      book.rotation.y = 0.5;
      page.visible = true;
      fields.forEach(
        (f, i) => (f.material.opacity = seg(p, 0.05 + i * 0.1, 0.15 + i * 0.1)),
      );
      const press = seg(p, 0.5, 0.65);
      stamp.position.set(0.9, -1.75, 2 - ease(press) * 1.85);
      stamp.visible = press < 1;
      signed.visible = press >= 1;
      noPrivate.visible = p > 0.75;
      noPrivate.material.opacity = seg(p, 0.75, 0.85);
      camera.position.set(Math.sin(t * 0.2) + 1.5, 3, 10);
      camera.lookAt(1, 2.2, 0);
    },
  };
}

export function chainShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 40));
  const levels = [
    { name: "Ildiz CA", sub: "brauzer seyfida", y: 7.4 },
    { name: "Oraliq CA", sub: "ildiz imzolagan", y: 4.6 },
    { name: "bank.uz", sub: "oraliq imzolagan", y: 1.8 },
  ];
  const cards = levels.map((l, i) => {
    const g = new THREE.Group();
    g.position.set(0, l.y, 0);
    g.add(
      new THREE.Mesh(
        new RoundedBoxGeometry(4.6, 1.6, 0.2, 4, 0.1),
        solid(i === 0 ? 0x2a2140 : 0x132e4d, 0.3, 0.4),
      ),
    );
    const n = label(l.name, "#ffffff", 64);
    n.position.set(0, 0.25, 0.15);
    const s = label(l.sub, "#9cc3ee", 44);
    s.position.set(0, -0.35, 0.15);
    s.scale.multiplyScalar(0.8);
    g.add(n, s);
    const ok = label("✓", "#2fbf8f", 120);
    ok.position.set(2.8, 0, 0.3);
    g.add(ok);
    scene.add(g);
    return { g, ok };
  });
  // The vault around the root.
  const vault = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 2.4, 1.2),
    new THREE.MeshStandardMaterial({
      color: 0x8052ff,
      transparent: true,
      opacity: 0.12,
      emissive: 0x8052ff,
      emissiveIntensity: 0.4,
    }),
  );
  vault.position.set(0, 7.4, 0);
  scene.add(vault);
  const links = [0, 1].map((i) => {
    const g = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const link = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.06, 8, 16),
        solid(0x9cc3ee, 0.8, 0.2),
      );
      link.position.y = k * 0.38;
      link.rotation.y = k % 2 ? Math.PI / 2 : 0;
      g.add(link);
    }
    g.position.set(0, levels[i + 1].y + 0.75, 0);
    scene.add(g);
    return g;
  });
  const bar = label("https://bank.uz", "#ffffff", 56, "#132e4d");
  bar.position.set(0, -0.4, 1.5);
  const lock = padlock(GREEN);
  lock.position.set(-2.4, -0.4, 1.6);
  lock.scale.setScalar(0.7);
  scene.add(bar, lock);
  return {
    scene,
    camera,
    frame(p, t) {
      // The camera climbs from the site to the root, then back down.
      const climb = ease(seg(p, 0.05, 0.75));
      camera.position.set(Math.sin(t * 0.3) * 2, 2.5 + climb * 4, 15);
      camera.lookAt(0, 1.8 + climb * 5.4 - ease(seg(p, 0.8, 1)) * 4, 0);
      cards.forEach(({ ok }, i) => {
        const at = 0.25 + (2 - i) * 0.17;
        ok.visible = p > at;
        ok.material.opacity = seg(p, at, at + 0.05);
      });
      links.forEach((g, i) => {
        g.children.forEach((m) => {
          const mat = (m as THREE.Mesh).material as THREE.MeshStandardMaterial;
          const lit = p > 0.3 + (1 - i) * 0.17;
          mat.emissive.set(lit ? GREEN : 0x000000);
          mat.emissiveIntensity = lit ? 1.5 : 0;
        });
      });
      lock.visible = bar.visible = p > 0.8;
      lock.rotation.y = t;
    },
  };
}

/** A shop front with a sign, a padlock on top and a verdict. */
function shop(name: string, x: number) {
  const g = new THREE.Group();
  g.position.x = x;
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 3.6, 1.2),
    solid(0x1c2230, 0.3, 0.6),
  );
  wall.position.y = 1.8;
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2, 0.1),
    glow(0x1f6fd0, 0.8),
  );
  door.position.set(0, 1, 0.65);
  const sign = label(name, "#ffffff", 72, "#132e4d");
  sign.position.set(0, 3.2, 0.8);
  const lock = padlock();
  lock.position.set(0, 4.3, 0);
  g.add(wall, door, sign, lock);
  return { g, lock };
}

export function storefrontShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 40));
  const real = shop("bank.uz", -3.4);
  const fake = shop("bank-uz.top", 3.4);
  scene.add(real.g, fake.g);
  const ok = label("Rasmiy ✓", "#ffffff", 56, "#2fbf8f");
  ok.position.set(-3.4, 5.4, 0.5);
  const bad = label("Soxta!", "#ffffff", 64, "#d22");
  bad.position.set(3.4, 5.4, 0.5);
  const both = label("Ikkalasida ham qulf bor", "#1b1b1f", 52, "#ffb829");
  both.position.set(0, 6.6, 0);
  scene.add(ok, bad, both);
  const outline = new THREE.Mesh(
    new THREE.BoxGeometry(4.9, 3.9, 1.3),
    new THREE.MeshBasicMaterial({ color: RED, wireframe: true }),
  );
  outline.position.set(3.4, 1.8, 0);
  scene.add(outline);
  return {
    scene,
    camera,
    frame(p, t) {
      const pan = ease(seg(p, 0.05, 0.6));
      camera.position.set(lerp(-4, 4, pan) * 0.6, 4, 13.5);
      camera.lookAt(lerp(-2, 2, pan) * 0.6, 2.6, 0);
      real.lock.rotation.y = fake.lock.rotation.y = t;
      both.material.opacity = seg(p, 0.15, 0.25) * (1 - seg(p, 0.6, 0.65));
      const verdict = seg(p, 0.65, 0.75);
      ok.visible = bad.visible = outline.visible = verdict > 0;
      ok.material.opacity = bad.material.opacity = verdict;
      outline.scale.setScalar(1 + Math.sin(t * 6) * 0.01);
      camera.position.x += verdict * 0;
    },
  };
}
