// 3D shots for the HTTP lesson: the restaurant (browser, waiter, kitchen),
// a request or response opened like a letter, GET from a shelf and POST
// into a mailbox, the status-code traffic light and Jasur changing a price.
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
  makeKibi,
  seg,
  solid,
  stars,
  type Built,
} from "./world";

const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** A small envelope carried around the scene. */
function envelope(color = 0xf4f1ea) {
  const g = new THREE.Group();
  g.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(1, 0.65, 0.06, 2, 0.04),
      solid(color, 0.05, 0.8),
    ),
  );
  const flap = new THREE.Mesh(
    new THREE.ConeGeometry(0.52, 0.3, 3),
    solid(0xe6dfcf, 0.05, 0.8),
  );
  flap.rotation.z = Math.PI;
  flap.scale.set(1, 1, 0.1);
  flap.position.set(0, 0.17, 0.04);
  g.add(flap);
  return g;
}

export function restaurantShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(250, 30));
  // The guest's table with the browser.
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.4, 0.12, 24),
    solid(0x6b4a33, 0.1, 0.7),
  );
  table.position.set(-5, 1.2, 0);
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.2),
    solid(0x4a3526),
  );
  leg.position.set(-5, 0.6, 0);
  const laptop = device("laptop", "Ali · brauzer");
  laptop.position.set(-5, 1.25, 0);
  laptop.scale.setScalar(0.9);
  scene.add(table, leg, laptop);
  // The kitchen: the server.
  const kitchen = new THREE.Group();
  kitchen.position.set(5, 0, -1);
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 1.2, 1.4),
    solid(0x8a93a3, 0.6, 0.3),
  );
  counter.position.y = 0.6;
  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.4, 1.4),
    glow(BLUE, 0.6),
  );
  hood.position.y = 3;
  const sign = label("Oshxona · server", "#ffffff", 56, "#132e4d");
  sign.position.y = 3.8;
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.4, 0.08, 24),
    solid(0xffffff, 0.1, 0.4),
  );
  plate.position.set(0, 1.25, 0);
  const food = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 12),
    glow(SPARK, 0.8),
  );
  food.position.set(0, 1.45, 0);
  kitchen.add(counter, hood, sign, plate, food);
  scene.add(kitchen);
  // Kibi the waiter carries the order there and the dish back.
  const { kibi, pose } = makeKibi();
  kibi.scale.setScalar(0.55);
  scene.add(kibi);
  const order = envelope();
  scene.add(order);
  const dish = new THREE.Group();
  dish.add(plate.clone(), food.clone());
  scene.add(dish);
  const req = label("So‘rov", "#1b1b1f", 56, "#ffb829");
  const res = label("Javob", "#1b1b1f", 56, "#2fbf8f");
  scene.add(req, res);
  return {
    scene,
    camera,
    frame(p, t, talk) {
      camera.position.set(Math.sin(t * 0.15) * 1.5, 4, 9.5);
      camera.lookAt(0, 1.6, -0.5);
      const go = ease(seg(p, 0.15, 0.45));
      const back = ease(seg(p, 0.55, 0.85));
      const x = back > 0 ? lerp(3.4, -3.6, back) : lerp(-3.6, 3.4, go);
      kibi.position.set(x, Math.abs(Math.sin(t * 6)) * 0.08, 1.2);
      kibi.rotation.y = back > 0 ? -Math.PI / 2 : Math.PI / 2;
      pose(t, talk * 0.5, 0);
      order.visible = back === 0 && go < 1;
      order.position.set(x, 2.55, 1.6);
      dish.visible = back > 0 && back < 1;
      dish.position.set(x, 2.3, 1.6);
      food.visible = back === 0;
      req.visible = order.visible;
      req.position.set(x, 3.4, 1.6);
      res.visible = dish.visible;
      res.position.set(x, 3.4, 1.6);
    },
  };
}

const REQUEST = [
  ["POST /login HTTP/1.1", "metod · yo‘l · versiya", "#ffb829"],
  ["Host: shop.uz", "sarlavhalar", "#9cc3ee"],
  ["User-Agent: Firefox/131", "sarlavhalar", "#9cc3ee"],
  ["", "bo‘sh qator", "#555555"],
  ["user=ali&pass=…", "tana", "#2fbf8f"],
];
const RESPONSE = [
  ["HTTP/1.1 200 OK", "versiya · holat kodi", "#2fbf8f"],
  ["Content-Type: text/html", "sarlavhalar", "#9cc3ee"],
  ["Set-Cookie: session=7f2a", "sarlavhalar", "#9cc3ee"],
  ["", "bo‘sh qator", "#555555"],
  ["<h1>Telefonlar</h1>", "tana — sahifa", "#ffb829"],
];

export function letterShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(250, 30));
  const rows = stage === 0 ? REQUEST : RESPONSE;
  const env = envelope();
  env.scale.setScalar(4);
  env.position.set(0, 2.5, -1);
  scene.add(env);
  const layers = rows.map(([text, note, color], i) => {
    const g = new THREE.Group();
    const slab = new THREE.Mesh(
      new RoundedBoxGeometry(6.4, 0.75, 0.12, 3, 0.06),
      solid(parseInt(color.slice(1), 16), 0.2, 0.5),
    );
    g.add(slab);
    if (text) {
      const s = label(text, "#1b1b1f", 52);
      s.scale.multiplyScalar(0.85);
      s.position.z = 0.1;
      g.add(s);
    }
    const n = label(note, "#ffffff", 44, "#132e4d");
    n.position.set(4.6, 0, 0.1);
    n.scale.multiplyScalar(0.8);
    g.add(n);
    scene.add(g);
    return { g, y: 4.4 - i * 0.95 };
  });
  const title = label(
    stage === 0 ? "So‘rov" : "Javob",
    "#ffffff",
    72,
    stage === 0 ? "#b07a12" : "#15846e",
  );
  title.position.set(0, 5.6, 0);
  scene.add(title);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 1.5 + 1.2, 3.4, 11);
      camera.lookAt(1.2, 2.6, 0);
      const open = ease(seg(p, 0.05, 0.2));
      env.position.y = 2.5 - open * 2.2;
      env.rotation.x = -open * 0.6;
      layers.forEach(({ g, y }, i) => {
        const out = ease(seg(p, 0.15 + i * 0.1, 0.3 + i * 0.1));
        g.position.set(0, lerp(1.5, y, out), lerp(-1, 0.6, out));
        g.scale.setScalar(Math.max(0.01, out));
        g.rotation.y = Math.sin(t * 0.8 + i) * 0.05;
      });
    },
  };
}

export function methodsShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(250, 30));
  // GET: a shelf of phones; one is looked at, not taken away.
  const shelf = new THREE.Group();
  shelf.position.set(-4.5, 0, 0);
  for (let r = 0; r < 3; r++) {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.12, 1),
      solid(0x6b4a33, 0.1, 0.7),
    );
    board.position.y = 0.6 + r * 1.2;
    shelf.add(board);
    for (let c = 0; c < 4; c++) {
      const phone = new THREE.Mesh(
        new RoundedBoxGeometry(0.45, 0.85, 0.08, 2, 0.06),
        glow(c % 2 ? BLUE : 0x8052ff, 0.6),
      );
      phone.position.set(-1.4 + c * 0.95, 1.1 + r * 1.2, 0);
      shelf.add(phone);
    }
  }
  const getTag = label("GET — ko‘rish, olish", "#1b1b1f", 56, "#9cc3ee");
  getTag.position.set(-4.5, 5, 0);
  scene.add(shelf, getTag);
  const lens = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.08, 8, 24),
    glow(SPARK, 2),
  );
  scene.add(lens);
  // POST: a parcel dropped into a mailbox.
  const box = new THREE.Group();
  box.position.set(4.5, 0, 0);
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(1.6, 2.2, 1.4, 3, 0.2),
    solid(0x2a6fc0, 0.3, 0.4),
  );
  body.position.y = 1.6;
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.12, 0.1),
    solid(0x0b1a2b),
  );
  slot.position.set(0, 2.3, 0.72);
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.6),
    solid(0x555555),
  );
  post.position.y = 0.3;
  box.add(body, slot, post);
  const postTag = label("POST — yuborish", "#1b1b1f", 56, "#2fbf8f");
  postTag.position.set(4.5, 5, 0);
  scene.add(box, postTag);
  const parcel = new THREE.Mesh(
    new RoundedBoxGeometry(0.8, 0.5, 0.5, 2, 0.05),
    solid(0xc9a46b, 0.1, 0.7),
  );
  scene.add(parcel);
  const parcelTag = label("buyurtma", "#1b1b1f", 40, "#ffb829");
  scene.add(parcelTag);
  return {
    scene,
    camera,
    frame(p, t) {
      const focus = ease(seg(p, 0.45, 0.6));
      camera.position.set(lerp(-3, 3, focus), 4, 10);
      camera.lookAt(lerp(-3.5, 3.5, focus), 2.2, 0);
      // The lens moves over the phones: looking does not change them.
      const look = seg(p, 0.05, 0.45);
      lens.position.set(
        -4.5 + Math.sin(look * Math.PI * 2) * 1.4,
        2.3 + Math.cos(look * Math.PI * 2) * 0.8,
        0.4,
      );
      lens.visible = p < 0.5;
      const drop = ease(seg(p, 0.6, 0.85));
      parcel.position.set(
        lerp(1.5, 4.5, drop),
        lerp(3.6, 2.35, drop) + Math.sin(drop * Math.PI) * 1.2,
        lerp(1.5, 0.75, drop),
      );
      parcel.visible = drop < 0.98 && p > 0.5;
      parcel.rotation.z = drop * 0.8;
      parcelTag.position
        .copy(parcel.position)
        .add(new THREE.Vector3(0, 0.7, 0));
      parcelTag.visible = parcel.visible;
      body.scale.setScalar(1 + (drop > 0.98 ? Math.sin(t * 20) * 0.02 : 0));
    },
  };
}

const LIGHTS = [
  { code: "2xx", text: "Muvaffaqiyat", color: GREEN },
  { code: "3xx", text: "Boshqa manzilga", color: BLUE },
  { code: "4xx", text: "Mijoz xatosi", color: SPARK },
  { code: "5xx", text: "Server xatosi", color: RED },
];

export function statusShot(): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 30));
  const tower = new THREE.Mesh(
    new RoundedBoxGeometry(2, 7.4, 1.2, 4, 0.3),
    solid(0x1c2230, 0.5, 0.4),
  );
  tower.position.y = 4;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.6),
    solid(0x555555),
  );
  pole.position.y = 0.3;
  scene.add(tower, pole);
  const lamps = LIGHTS.map((l, i) => {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 24, 16),
      new THREE.MeshStandardMaterial({
        color: l.color,
        emissive: l.color,
        emissiveIntensity: 0.05,
      }),
    );
    lamp.position.set(0, 6.6 - i * 1.7, 0.55);
    const tag = label(`${l.code} · ${l.text}`, "#ffffff", 52, "#132e4d");
    tag.position.set(3.3, 6.6 - i * 1.7, 0.6);
    scene.add(lamp, tag);
    return { lamp, tag };
  });
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(3 + Math.sin(t * 0.2) * 1.5, 4.2, 12);
      camera.lookAt(1.5, 4, 0);
      const on = Math.min(3, Math.floor(seg(p, 0.25, 0.85) * 4));
      lamps.forEach(({ lamp, tag }, i) => {
        const lit = p > 0.25 && i === on;
        (lamp.material as THREE.MeshStandardMaterial).emissiveIntensity = lit
          ? 3 + Math.sin(t * 8) * 0.5
          : 0.08;
        tag.material.opacity = p > 0.25 && i <= on ? 1 : 0.35;
      });
    },
  };
}

export function tamperShot(stage: number): Built {
  const { scene, camera } = base();
  scene.add(floor(), stars(300, 40));
  const hacker = device("hacker", "Jasur");
  hacker.position.set(-6, 0, 0);
  const server = device("server", "shop.uz");
  server.position.set(6, 0, 0);
  scene.add(hacker, server);
  const parcel = new THREE.Group();
  parcel.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(2.6, 1.4, 1, 3, 0.1),
      solid(0xc9a46b, 0.1, 0.7),
    ),
  );
  scene.add(parcel);
  const priceOld = label("narx = 1 500 000", "#1b1b1f", 56, "#ffffff");
  const priceNew = label("narx = 1", "#ffffff", 56, "#d22");
  priceOld.position.set(0, 1.1, 0);
  priceNew.position.set(0, 1.1, 0);
  parcel.add(priceOld, priceNew);
  const pen = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 1.2, 8),
    glow(RED, 2),
  );
  scene.add(pen);
  // The server's guard: a shield that checks against the database.
  const shield = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.4, 0.2, 6),
    glow(GREEN, 1.4),
  );
  shield.rotation.x = Math.PI / 2;
  shield.position.set(3.6, 1.8, 0.5);
  const db = label("Baza: 1 500 000", "#1b1b1f", 52, "#2fbf8f");
  db.position.set(6, 4.6, 0);
  const denied = label("Rad etildi!", "#ffffff", 64, "#d22");
  denied.position.set(3.4, 4, 0.5);
  scene.add(shield, db, denied);
  return {
    scene,
    camera,
    frame(p, t) {
      camera.position.set(Math.sin(t * 0.2) * 1.5, 4.6, 12.5);
      camera.lookAt(0, 1.8, 0);
      if (stage === 0) {
        parcel.position.set(-3, 1.8, 0.5);
        const edit = seg(p, 0.35, 0.6);
        priceOld.visible = edit < 0.5;
        priceNew.visible = edit >= 0.5;
        pen.visible = edit > 0 && edit < 1;
        pen.position.set(-3 + Math.sin(t * 12) * 0.4, 3.2, 0.8);
        pen.rotation.z = 0.6;
        const fly = ease(seg(p, 0.7, 0.95));
        parcel.position.x = lerp(-3, 2, fly);
        shield.visible = db.visible = denied.visible = false;
        return;
      }
      priceOld.visible = false;
      priceNew.visible = true;
      pen.visible = false;
      const hit = ease(seg(p, 0.1, 0.4));
      const bounce = ease(seg(p, 0.45, 0.7));
      parcel.position.set(
        lerp(lerp(-1, 2.3, hit), -3, bounce),
        1.8 + Math.sin(bounce * Math.PI) * 1.5,
        0.5,
      );
      parcel.rotation.z = bounce * -1.5;
      shield.visible = true;
      (shield.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.4 + (p > 0.4 && p < 0.55 ? 2.5 : 0);
      db.visible = p > 0.2;
      db.material.opacity = seg(p, 0.2, 0.3);
      denied.visible = p > 0.45;
      denied.material.opacity = seg(p, 0.45, 0.55);
    },
  };
}
