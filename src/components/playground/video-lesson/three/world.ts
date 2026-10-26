// The 3D shots of the video lessons, built with three.js from simple shapes
// in a low-poly, neon-on-navy style that matches the Cybervalue emblem.
// Every shot is a function of time alone: build() makes the objects once,
// and frame(p, t, talk) poses them and the camera for one moment, so the
// player can seek and the MP4 renderer can step frame by frame.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export const BLUE = 0x3b8be0;
export const NAVY = 0x0b1a2b;
export const CYAN = 0x7fe3ff;
export const SPARK = 0xffb829;
export const GREEN = 0x2fbf8f;
export const RED = 0xff4d4d;

export const clamp = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (p: number, a: number, b: number) =>
  clamp((p - a) / (b - a));
export const ease = (x: number) => x * x * (3 - 2 * x);

export const glow = (color: number, intensity = 1.6) =>
  new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.4,
  });
export const solid = (color: number, metalness = 0.3, roughness = 0.5) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });

/** A flat label drawn on a canvas, always facing the camera. */
export function label(text: string, color = "#ffffff", size = 64, bg?: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `700 ${size}px Inter, Arial, sans-serif`;
  const w = Math.ceil(ctx.measureText(text).width) + size;
  canvas.width = w;
  canvas.height = size * 1.6;
  const c = canvas.getContext("2d")!;
  if (bg) {
    c.fillStyle = bg;
    c.beginPath();
    c.roundRect(0, 0, canvas.width, canvas.height, size * 0.3);
    c.fill();
  }
  c.font = `700 ${size}px Inter, Arial, sans-serif`;
  c.fillStyle = color;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      toneMapped: false,
      color: 0xd8d8d8,
      // Labels annotate the scene, so they stay readable in front of it.
      depthTest: false,
    }),
  );
  sprite.renderOrder = 10;
  sprite.scale.set(canvas.width / 200, canvas.height / 200, 1);
  return sprite;
}

/** Kibi in 3D: head with a screen face, glowing eyes and mouth, antenna. */
export function makeKibi() {
  const kibi = new THREE.Group();
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(1.5, 1.1, 1, 6, 0.3),
    solid(0x132e4d, 0.4, 0.35),
  );
  body.position.y = 0.7;
  kibi.add(body);
  const emblem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.06, 6),
    glow(BLUE, 1.2),
  );
  emblem.rotation.x = Math.PI / 2;
  emblem.rotation.y = Math.PI / 6;
  emblem.position.set(0, 0.75, 0.52);
  kibi.add(emblem);
  const head = new THREE.Group();
  head.position.y = 1.95;
  kibi.add(head);
  head.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(2, 1.5, 1.3, 8, 0.45),
      solid(BLUE, 0.25, 0.35),
    ),
  );
  const face = new THREE.Mesh(
    new RoundedBoxGeometry(1.6, 1.05, 0.1, 4, 0.04),
    solid(NAVY, 0.1, 0.2),
  );
  face.position.z = 0.64;
  head.add(face);
  const eyeL = new THREE.Mesh(
    new RoundedBoxGeometry(0.26, 0.36, 0.06, 4, 0.1),
    glow(CYAN, 2.2),
  );
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.36, 0.1, 0.71);
  eyeR.position.set(0.36, 0.1, 0.71);
  head.add(eyeL, eyeR);
  const mouth = new THREE.Mesh(
    new RoundedBoxGeometry(0.46, 0.1, 0.06, 4, 0.04),
    glow(CYAN, 2.2),
  );
  mouth.position.set(0, -0.25, 0.71);
  head.add(mouth);
  for (const x of [-1.05, 1.05]) {
    const ear = new THREE.Mesh(
      new RoundedBoxGeometry(0.18, 0.5, 0.4, 3, 0.08),
      solid(0x2a6fc0),
    );
    ear.position.set(x, 0, 0);
    head.add(ear);
  }
  const stalk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.45),
    solid(0x9cc3ee),
  );
  stalk.position.y = 0.95;
  head.add(stalk);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 12),
    glow(SPARK, 3),
  );
  bulb.position.y = 1.22;
  head.add(bulb);
  const arms: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.9, 1.1, 0);
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.6, 4, 8),
      solid(BLUE, 0.25, 0.4),
    );
    arm.position.y = -0.4;
    pivot.add(arm);
    kibi.add(pivot);
    arms.push(pivot);
  }
  return {
    kibi,
    pose(t: number, talk: number, wave: number) {
      kibi.position.y = Math.sin(t * 2.2) * 0.06;
      head.rotation.y = Math.sin(t * 0.8) * 0.15;
      head.rotation.z = Math.sin(t * 1.3) * 0.04;
      const blink = t % 4 > 3.85 ? 0.15 : 1;
      eyeL.scale.y = eyeR.scale.y = blink;
      mouth.scale.set(1 + talk * 0.3, 1 + talk * 3.2, 1);
      (bulb.material as THREE.MeshStandardMaterial).emissiveIntensity =
        2 + Math.sin(t * 5) * 1.2;
      arms[0].rotation.z = -0.15 - Math.sin(t * 2) * 0.05;
      arms[1].rotation.z = 0.15 + wave * (2.4 + Math.sin(t * 9) * 0.35);
    },
  };
}

/** A small glowing particle field for depth. */
export function stars(count: number, spread: number, color = 0x9cc3ee) {
  const positions = new Float32Array(count * 3);
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rnd() - 0.5) * spread;
    positions[i * 3 + 1] = (rnd() - 0.2) * spread * 0.5;
    positions[i * 3 + 2] = (rnd() - 0.5) * spread;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
    }),
  );
}

export function floor() {
  const grid = new THREE.GridHelper(60, 60, BLUE, 0x1b3554);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.5;
  return grid;
}

export type Built = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  frame: (p: number, t: number, talk: number) => void;
};

export function base(): Pick<Built, "scene" | "camera"> {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060d18);
  scene.fog = new THREE.Fog(0x060d18, 12, 40);
  scene.add(new THREE.HemisphereLight(0x9cc3ee, 0x0b1a2b, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 8, 6);
  scene.add(key);
  const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 100);
  return { scene, camera };
}

export function kibiShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(400, 30));
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 2, 0.25, 6),
    solid(0x132e4d),
  );
  scene.add(pad);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.04, 8, 6),
    glow(BLUE, 2.5),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.13;
  scene.add(ring);
  const { kibi, pose } = makeKibi();
  kibi.position.y = 0.12;
  scene.add(kibi);
  // The emblem, floating behind Kibi.
  const shield = new THREE.Group();
  shield.add(
    new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.06, 6, 6), glow(BLUE, 2)),
  );
  shield.add(
    new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.04, 6, 6),
      glow(0x9cc3ee, 1.5),
    ),
  );
  const cv = label("CV", "#eaf2fb", 120);
  cv.scale.multiplyScalar(0.9);
  shield.add(cv);
  shield.position.set(0, 3, -3.5);
  scene.add(shield);
  return {
    scene,
    camera,
    frame(p, t, talk) {
      const angle = -0.9 + ease(p) * 0.9;
      const dist = 11 - ease(p) * 1.5;
      camera.position.set(
        Math.sin(angle) * dist,
        3 + (1 - p) * 0.8,
        Math.cos(angle) * dist,
      );
      camera.lookAt(0, 2, 0);
      pose(t, talk, seg(p, 0.05, 0.15) * (1 - seg(p, 0.4, 0.5)));
      ring.rotation.z = t * 0.5;
      shield.rotation.y = Math.sin(t) * 0.3;
      shield.position.y = 3 + Math.sin(t * 1.5) * 0.15;
    },
  };
}

/** A node of the network: a device on a hexagonal plinth with a label. */
export function device(
  kind: "laptop" | "router" | "tower" | "server" | "bank" | "hacker",
  name: string,
) {
  const g = new THREE.Group();
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.2, 0.2, 6),
    solid(0x132e4d),
  );
  g.add(plinth);
  const color = kind === "hacker" ? RED : BLUE;
  const edge = new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.03, 6, 6),
    glow(color, 2.4),
  );
  edge.rotation.x = Math.PI / 2;
  edge.position.y = 0.1;
  g.add(edge);
  if (kind === "laptop") {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.06, 0.8),
      solid(0x8a93a3, 0.6),
    );
    base.position.y = 0.2;
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 0.05),
      solid(0x1c2230),
    );
    screen.position.set(0, 0.62, -0.38);
    screen.rotation.x = -0.25;
    const lit = new THREE.Mesh(
      new THREE.PlaneGeometry(1.05, 0.65),
      glow(0x1f6fd0, 1),
    );
    lit.position.set(0, 0.62, -0.35);
    lit.rotation.x = -0.25;
    g.add(base, screen, lit);
  } else if (kind === "router") {
    const box = new THREE.Mesh(
      new RoundedBoxGeometry(1.1, 0.25, 0.7, 3, 0.08),
      solid(0xe7ecf3, 0.1, 0.6),
    );
    box.position.y = 0.3;
    g.add(box);
    for (const x of [-0.4, 0.4]) {
      const a = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.7),
        solid(0xe7ecf3),
      );
      a.position.set(x, 0.75, -0.2);
      g.add(a);
    }
  } else if (kind === "tower") {
    for (let i = 0; i < 4; i++) {
      const c = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35 - i * 0.07, 0.4 - i * 0.07, 0.5, 6),
        solid(0x8a93a3, 0.6),
      );
      c.position.y = 0.4 + i * 0.5;
      g.add(c);
    }
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12), glow(RED, 3));
    tip.position.y = 2.3;
    g.add(tip);
  } else if (kind === "server" || kind === "bank") {
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 0.8),
      solid(0x1c2230, 0.5),
    );
    rack.position.y = 1.1;
    g.add(rack);
    for (let i = 0; i < 6; i++) {
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.05, 0.02),
        glow(i % 2 ? GREEN : BLUE, 2),
      );
      led.position.set(0, 0.4 + i * 0.28, 0.41);
      g.add(led);
    }
  } else if (kind === "hacker") {
    const dish = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 0.5, 6, 1, true),
      solid(0x2b2b33, 0.5),
    );
    dish.position.y = 1;
    dish.rotation.x = Math.PI;
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.8),
      solid(0x555555),
    );
    pole.position.y = 0.5;
    g.add(dish, pole);
  }
  const tag = label(name, kind === "hacker" ? "#ff8b8b" : "#ffffff", 56);
  tag.position.y =
    kind === "tower" || kind === "server" || kind === "bank" ? 3 : 1.7;
  g.add(tag);
  return g;
}

export function packet(color: number, text: string) {
  const g = new THREE.Group();
  g.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(0.5, 0.5, 0.5, 3, 0.08),
      glow(color, 2),
    ),
  );
  const tag = label(
    text,
    "#1b1b1f",
    48,
    color === GREEN ? "#2fbf8f" : "#ffb829",
  );
  tag.position.y = 0.7;
  tag.scale.multiplyScalar(0.7);
  g.add(tag);
  return g;
}

export function networkShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 40));
  const points = [
    new THREE.Vector3(-12, 0, 2),
    new THREE.Vector3(-6, 0, -1),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(6, 0, -1),
    new THREE.Vector3(12, 0, 1),
  ];
  const names: [Parameters<typeof device>[0], string][] = [
    ["laptop", "Ali"],
    ["router", "Kafe Wi-Fi"],
    ["tower", "Provayder"],
    ["server", "Internet"],
    ["bank", "bank.uz"],
  ];
  names.forEach(([kind, name], i) => {
    const d = device(kind, name);
    d.position.copy(points[i]);
    scene.add(d);
  });
  const path = new THREE.CatmullRomCurve3(
    points.map((v) => v.clone().setY(0.8)),
  );
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(path, 200, 0.05, 8),
    glow(BLUE, 1.6),
  );
  scene.add(cable);
  const hacker = device("hacker", "Xaker");
  hacker.position.set(2, 0, 5.5);
  scene.add(hacker);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.25, 1, 8, 1, true),
    new THREE.MeshBasicMaterial({
      color: RED,
      transparent: true,
      opacity: 0.6,
    }),
  );
  scene.add(beam);
  const pkt = packet(SPARK, "pass=Qwerty-2026");
  scene.add(pkt);
  const stolen = label("pass=Qwerty-2026", "#ffffff", 56, "#d22");
  stolen.position.set(2, 3.2, 5.5);
  scene.add(stolen);
  return {
    scene,
    camera,
    frame(p) {
      const u = seg(p, 0.08, 0.92);
      const at = path.getPointAt(u);
      pkt.position.copy(at).add(new THREE.Vector3(0, 0.3, 0));
      pkt.rotation.y = p * 12;
      // The camera follows the packet from the side and a little above.
      camera.position.set(at.x - 4, 3.6, at.z + 8.5);
      camera.lookAt(at.x + 1.5, 0.8, at.z);
      const reading = seg(p, 0.45, 0.55) * (1 - seg(p, 0.9, 1));
      beam.visible = reading > 0.01;
      const from = new THREE.Vector3(2, 1, 5.5);
      const mid = from.clone().add(pkt.position).multiplyScalar(0.5);
      beam.position.copy(mid);
      beam.lookAt(pkt.position);
      beam.rotateX(Math.PI / 2);
      beam.scale.set(1, from.distanceTo(pkt.position), 1);
      (beam.material as THREE.MeshBasicMaterial).opacity = 0.6 * reading;
      stolen.visible = p > 0.58;
      stolen.material.opacity = seg(p, 0.58, 0.66);
    },
  };
}

export function tunnelShot(): Built {
  const { scene, camera } = base();
  scene.fog = new THREE.Fog(0x060d18, 4, 30);
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 40; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.05, 6, 6),
      glow(i % 4 === 0 ? GREEN : BLUE, i % 4 === 0 ? 1.6 : 1),
    );
    ring.position.z = -i * 2;
    ring.rotation.z = Math.PI / 6;
    scene.add(ring);
    rings.push(ring);
  }
  // Translucent walls between the rings.
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(2.42, 2.42, 80, 6, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x0f3b2e,
      emissive: GREEN,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    }),
  );
  wall.rotation.x = Math.PI / 2;
  wall.position.z = -39;
  scene.add(wall);
  for (let i = 0; i < 6; i++) {
    const tls = label("TLS", "#2fbf8f", 80);
    const a = (i / 6) * Math.PI * 2;
    tls.position.set(Math.cos(a) * 2.1, Math.sin(a) * 2.1, -6 - i * 9);
    scene.add(tls);
  }
  const packets = [0, 1, 2].map(() => {
    const k = packet(GREEN, "TLS ▓▓▓");
    scene.add(k);
    return k;
  });
  const hacker = device("hacker", "Xaker");
  hacker.position.set(6, -1.5, -22);
  hacker.rotation.z = 0.4;
  scene.add(hacker);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1, 8),
    new THREE.MeshBasicMaterial({
      color: RED,
      transparent: true,
      opacity: 0.8,
    }),
  );
  scene.add(beam);
  const spark = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }),
  );
  scene.add(spark);
  const denied = label("Shifrlangan!", "#ffffff", 56, "#2fbf8f");
  scene.add(denied);
  return {
    scene,
    camera,
    frame(p, t) {
      const z = -ease(p) * 34;
      camera.position.set(
        Math.sin(t * 0.6) * 0.3,
        Math.cos(t * 0.5) * 0.2,
        z + 2,
      );
      camera.lookAt(0, 0, z - 10);
      camera.rotation.z = Math.sin(p * Math.PI) * 0.15;
      packets.forEach((k, i) => {
        k.position.set(
          Math.sin(i * 2.1) * 0.8,
          Math.cos(i * 2.1) * 0.6 - 0.3,
          z - 5 - i * 3 - p * 4,
        );
        k.rotation.y = t * 2 + i;
      });
      rings.forEach((r, i) => {
        const near = Math.abs(r.position.z - (z - 6));
        (r.material as THREE.MeshStandardMaterial).emissiveIntensity =
          (i % 4 === 0 ? 1.6 : 1) + Math.max(0, 2 - near) * 1.2;
      });
      const trying = seg(p, 0.45, 0.55) * (1 - seg(p, 0.85, 0.95));
      const hit = new THREE.Vector3(2.3, -0.6, -21);
      const from = new THREE.Vector3(6, -0.6, -22);
      beam.visible = spark.visible = denied.visible = trying > 0.02;
      beam.position.copy(from).add(hit).multiplyScalar(0.5);
      beam.lookAt(hit);
      beam.rotateX(Math.PI / 2);
      beam.scale.set(1, from.distanceTo(hit), 1);
      (beam.material as THREE.MeshBasicMaterial).opacity = 0.8 * trying;
      spark.position.copy(hit);
      spark.scale.setScalar(0.6 + Math.abs(Math.sin(t * 20)) * 0.8);
      (spark.material as THREE.MeshBasicMaterial).opacity = trying;
      denied.position.set(1.2, 0.8, -19);
      denied.material.opacity = seg(p, 0.55, 0.62) * (1 - seg(p, 0.85, 0.95));
    },
  };
}

export function lockShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const lock = new THREE.Group();
  scene.add(lock);
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(2.4, 2, 1, 6, 0.25),
    solid(SPARK, 0.8, 0.25),
  );
  body.position.y = 1.6;
  lock.add(body);
  const hole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16),
    solid(0x1b1b1f),
  );
  hole.rotation.x = Math.PI / 2;
  hole.position.set(0, 1.7, 0.52);
  lock.add(hole);
  const shackle = new THREE.Mesh(
    new THREE.TorusGeometry(0.8, 0.14, 12, 24, Math.PI),
    solid(0xcfd6e0, 0.9, 0.2),
  );
  shackle.position.y = 2.6;
  lock.add(shackle);
  const pub = label("Ochiq kalit → qulflaydi", "#ffffff", 48, "#3b8be0");
  pub.position.set(-3.2, 3.6, 0);
  const priv = label("Yopiq kalit → ochadi", "#1b1b1f", 48, "#ffb829");
  priv.position.set(3.2, 3.6, 0);
  scene.add(pub, priv);
  const key = new THREE.Group();
  const bow = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.1, 8, 20),
    glow(SPARK, 1.4),
  );
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 1.4, 0.1),
    glow(SPARK, 1.4),
  );
  blade.position.y = -0.95;
  const tooth = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.14, 0.1),
    glow(SPARK, 1.4),
  );
  tooth.position.set(0.15, -1.45, 0);
  key.add(bow, blade, tooth);
  key.rotation.x = Math.PI / 2;
  scene.add(key);
  const server = label("Faqat serverda", "#ffb829", 44);
  scene.add(server);
  return {
    scene,
    camera,
    frame(p, t) {
      const angle = 0.6 - ease(p) * 0.9;
      camera.position.set(Math.sin(angle) * 8, 3.2, Math.cos(angle) * 8);
      camera.lookAt(0, 1.8, 0);
      lock.rotation.y = Math.sin(t * 0.7) * 0.15;
      // The key flies in, turns, and the shackle opens.
      const fly = ease(seg(p, 0.35, 0.6));
      const turn = ease(seg(p, 0.6, 0.72));
      key.position.set(0, 1.7, 0.53 + (1 - fly) * 4 + 1.45 * 0);
      key.position.z = 0.6 + 1.5 + (1 - fly) * 4;
      key.rotation.z = (turn * Math.PI) / 2;
      shackle.position.y = 2.6 + ease(seg(p, 0.72, 0.85)) * 0.6;
      shackle.rotation.y = ease(seg(p, 0.75, 0.9)) * 0.9;
      pub.material.opacity = seg(p, 0.05, 0.15);
      priv.material.opacity = seg(p, 0.25, 0.35);
      server.position.set(0, 0.2, 2.6 + (1 - fly) * 4);
      server.material.opacity = seg(p, 0.3, 0.4) * (1 - seg(p, 0.6, 0.65));
    },
  };
}
