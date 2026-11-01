/**
 * The entry point. For now, a placeholder scene that proves the pipeline end
 * to end: a sunny cel-shaded corner of a room, a voxel crate, ink lines, a
 * slowly drifting camera, and the title over it. The game replaces it.
 */
import * as THREE from 'three';
import { common, hexToNumber, voxel } from './content/palettes';
import { installErrorOverlay } from './dev/errorOverlay';
import { View } from './render/view';
import { toonMaterial } from './render/toon';
import { applyPaletteVars } from './ui/paletteVars';
import { getGeometry, voxelMaterial } from './voxel/models';

if (import.meta.env.DEV) installErrorOverlay();

applyPaletteVars();

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const ui = document.querySelector<HTMLDivElement>('#ui');
if (!canvas || !ui) throw new Error('index.html is missing #game or #ui');

// ?outline=0 turns off the cel line art.
const params = new URLSearchParams(location.search);
const view = new View(canvas, { fov: 35, outline: params.get('outline') !== '0' });

/** A box of one flat colour, cel shaded, casting and catching shadows. */
function slab(w: number, h: number, d: number, color: string): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    toonMaterial({ color: hexToNumber(color as `#${string}`) }),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// The corner of a room: a wooden floor, two papered walls with a skirting board.
const floor = slab(6, 0.2, 6, voxel.wood);
floor.position.y = -0.1;
const back = slab(6, 3.2, 0.2, voxel.pinkLight);
back.position.set(0, 1.6, -3.1);
const side = slab(0.2, 3.2, 6, voxel.bone);
side.position.set(-3.1, 1.6, 0);
const skirting = slab(6, 0.25, 0.25, voxel.woodDark);
skirting.position.set(0, 0.12, -2.9);
view.scene.add(floor, back, side, skirting);

const crate = new THREE.Mesh(getGeometry('props/crate'), voxelMaterial);
crate.castShadow = true;
crate.receiveShadow = true;
crate.position.set(-0.4, 0, 0.2);
crate.rotation.y = 0.4;
view.scene.add(crate);

ui.innerHTML = `<h1 class="title">Puzz</h1>`;
document.body.style.setProperty('--backdrop', common.backdrop);

const target = new THREE.Vector3(-0.4, 0.5, 0);
view.renderer.setAnimationLoop((now) => {
  // A slow drift, back and forth across the corner.
  const t = now / 1000;
  const yaw = 0.55 + Math.sin(t * 0.25) * 0.25;
  view.camera.position.set(target.x + Math.sin(yaw) * 7, 3.6, target.z + Math.cos(yaw) * 7);
  view.camera.lookAt(target);
  view.render();
});

// Dev builds expose the view for debugging from the console.
if (import.meta.env.DEV) Object.assign(window, { view });
