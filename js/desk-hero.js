import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('desk-canvas');
const deskStage = document.querySelector('.desk-stage');
const hero = document.getElementById('hero');
const status = document.getElementById('desk-status');
const MODEL_URL = new URL('../Desk_Hero/Desk_06-hero.glb', import.meta.url).href;
const phoneQuery = window.matchMedia('(max-width: 600px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FOLLOW_YAW = 0.14;
const FOLLOW_PITCH = 0.09;
const FOLLOW_SHIFT = 0.18;
const FOLLOW_EASE = 0.08;
const FIT_PAD = 1.22;

let stopDesk = null;

if (!canvas || !hero) {
  // Case studies and other pages share main.js but do not mount a desk.
}

function startDesk() {
  if (stopDesk || phoneQuery.matches || !canvas || !hero) return;

  const modelBuffer = window.__deskGltf || fetch(MODEL_URL).then((response) => {
    if (!response.ok) throw new Error(String(response.status));
    return response.arrayBuffer();
  });

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.autoRotate = false;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xe8e8e8, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(4, 8, 6);
  scene.add(key);

  const pointer = { x: 0, y: 0, active: false };
  const follow = { yaw: 0, pitch: 0, shiftX: 0, shiftY: 0 };
  let deskPivot = null;
  let deskHome = null;
  let rafId = 0;

  function sizeRenderer() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width < 2 || height < 2) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height || 1;
    camera.updateProjectionMatrix();
  }

  function frameObject(object) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width < 2 || height < 2) return;

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const tanHalf = Math.tan(vFov / 2);
    const aspect = Math.max(camera.aspect, 0.0001);

    const fitH = size.y / (2 * tanHalf);
    const fitW = size.x / (2 * tanHalf * aspect);
    const fitDist = Math.max(fitH, fitW) * FIT_PAD;

    const refW = 1080;
    const refH = 380;
    const preferredFitW = size.x / (2 * tanHalf * (refW / refH));
    const distAtRef = Math.max(fitH, preferredFitW) * 1.32;
    const preferredDist = distAtRef * (height / refH);

    const dist = Math.max(fitDist, preferredDist);
    controls.target.copy(center);
    camera.position.set(center.x, center.y + size.y * 0.08, center.z + dist);
    camera.near = dist / 100;
    camera.far = dist * 100;
    camera.updateProjectionMatrix();
    controls.update();
  }

  function setPointerFromEvent(event) {
    const rect = hero.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    const ny = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
    pointer.x = THREE.MathUtils.clamp(nx, -1, 1);
    pointer.y = THREE.MathUtils.clamp(ny, -1, 1);
    pointer.active = true;
  }

  function onPointerLeave() {
    pointer.x = 0;
    pointer.y = 0;
    pointer.active = false;
  }

  function onResize() {
    sizeRenderer();
    if (deskPivot) frameObject(deskPivot);
  }

  hero.addEventListener('pointermove', setPointerFromEvent);
  hero.addEventListener('pointerenter', setPointerFromEvent);
  hero.addEventListener('pointerleave', onPointerLeave);

  sizeRenderer();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  function mountDesk(gltf) {
    const desk = new THREE.Group();
    desk.add(gltf.scene);
    // glTF is Y-up; 180° around Y turns the desk to face the camera
    // without rolling it upside down.
    desk.rotation.y = Math.PI;

    const pivot = new THREE.Group();
    pivot.add(desk);
    scene.add(pivot);

    const box = new THREE.Box3().setFromObject(desk);
    const center = box.getCenter(new THREE.Vector3());
    desk.position.sub(center);
    pivot.position.copy(center);

    deskPivot = pivot;
    deskHome = center.clone();
    frameObject(pivot);
    if (status) status.classList.add('is-hidden');
  }

  Promise.resolve(modelBuffer)
    .then((buffer) => new Promise((resolve, reject) => {
      loader.parse(buffer, MODEL_URL, resolve, reject);
    }))
    .then(mountDesk)
    .catch(() => {
      if (status) status.textContent = 'Couldn’t load the desk model.';
    });

  const resizeObserver = new ResizeObserver(onResize);
  if (deskStage) resizeObserver.observe(deskStage);
  window.addEventListener('resize', onResize);

  function tick() {
    if (deskPivot && deskHome && !reduceMotion) {
      const targetYaw = pointer.active ? pointer.x * FOLLOW_YAW : 0;
      const targetPitch = pointer.active ? pointer.y * FOLLOW_PITCH : 0;
      const targetShiftX = pointer.active ? pointer.x * FOLLOW_SHIFT : 0;
      const targetShiftY = pointer.active ? -pointer.y * FOLLOW_SHIFT : 0;
      follow.yaw += (targetYaw - follow.yaw) * FOLLOW_EASE;
      follow.pitch += (targetPitch - follow.pitch) * FOLLOW_EASE;
      follow.shiftX += (targetShiftX - follow.shiftX) * FOLLOW_EASE;
      follow.shiftY += (targetShiftY - follow.shiftY) * FOLLOW_EASE;
      deskPivot.rotation.y = follow.yaw;
      deskPivot.rotation.x = follow.pitch;
      deskPivot.position.set(
        deskHome.x + follow.shiftX,
        deskHome.y + follow.shiftY,
        deskHome.z
      );
    }
    controls.update();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }
  tick();

  stopDesk = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    resizeObserver.disconnect();
    window.removeEventListener('resize', onResize);
    hero.removeEventListener('pointermove', setPointerFromEvent);
    hero.removeEventListener('pointerenter', setPointerFromEvent);
    hero.removeEventListener('pointerleave', onPointerLeave);
    controls.dispose();
    pmrem.dispose();
    dracoLoader.dispose();
    renderer.dispose();
    deskPivot = null;
    deskHome = null;
    stopDesk = null;
  };
}

function syncDeskMode() {
  if (!canvas || !hero) return;
  if (phoneQuery.matches) {
    if (stopDesk) stopDesk();
    return;
  }
  startDesk();
}

phoneQuery.addEventListener('change', syncDeskMode);
syncDeskMode();
