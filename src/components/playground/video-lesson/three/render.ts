// Picks the 3D shot for a scene and draws it with bloom; the shots live in
// world.ts (shared pieces and the first shots) and shots-*.ts.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Shot3D } from "@/lib/video-lessons/types";
import {
  kibiShot,
  lockShot,
  networkShot,
  tunnelShot,
  type Built,
} from "./world";
import {
  caesarShot,
  chainShot,
  handshakeShot,
  passportShot,
  paintShot,
  storefrontShot,
  xrayShot,
} from "./shots-https";
import {
  letterShot,
  methodsShot,
  restaurantShot,
  statusShot,
  tamperShot,
} from "./shots-http";
import {
  bytesShot,
  comboShot,
  cookieShot,
  grinderShot,
  mirrorsShot,
  stampShot,
  trioShot,
  vaultShot,
  wordlistShot,
  xorShot,
} from "./shots-crypto";
import {
  conveyorShot,
  forkShot,
  guardShot,
  nightserverShot,
  quotesShot,
  recipeShot,
  rocketShot,
  shelfShot,
  trojanShot,
} from "./shots-bash";

const SHOTS: Record<Shot3D, (stage: number) => Built> = {
  kibi: kibiShot,
  network: networkShot,
  tunnel: tunnelShot,
  lock: lockShot,
  caesar: caesarShot,
  paint: paintShot,
  handshake: handshakeShot,
  xray: xrayShot,
  passport: passportShot,
  chain: chainShot,
  storefront: storefrontShot,
  restaurant: restaurantShot,
  letter: letterShot,
  methods: methodsShot,
  status: statusShot,
  tamper: tamperShot,
  vault: vaultShot,
  bytes: bytesShot,
  cookie: cookieShot,
  trio: trioShot,
  grinder: grinderShot,
  mirrors: mirrorsShot,
  wordlist: wordlistShot,
  xor: xorShot,
  combo: comboShot,
  stamp: stampShot,
  nightserver: nightserverShot,
  recipe: recipeShot,
  shelf: shelfShot,
  quotes: quotesShot,
  conveyor: conveyorShot,
  rocket: rocketShot,
  fork: forkShot,
  guard: guardShot,
  trojan: trojanShot,
};

/** A renderer for one shot on a canvas; call draw() for each frame. */
export function createWorld(
  canvas: HTMLCanvasElement,
  shot: Shot3D,
  stage = 0,
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const built = SHOTS[shot](stage);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(built.scene, built.camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(640, 360),
    0.55,
    0.35,
    0.92,
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const resize = () => {
    const w = canvas.clientWidth || 1280;
    const h = canvas.clientHeight || 720;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    built.camera.aspect = w / h;
    built.camera.updateProjectionMatrix();
  };
  resize();
  return {
    draw(p: number, t: number, talk: number) {
      built.frame(p, t, talk);
      composer.render();
    },
    resize,
    dispose() {
      renderer.dispose();
      built.scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
      });
    },
  };
}
