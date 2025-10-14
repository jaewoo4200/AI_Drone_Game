// Drone Pilot: Systems Thinker Trial
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';

// --- DOM Elements ---
const hud = document.getElementById('hud');
const overlay = document.getElementById('overlay');
const toast = document.getElementById('toast');
const missionCardEl = document.getElementById('missionCard');
const narrationEl = document.getElementById('narration');
const tuningPanel = document.getElementById('tuning-panel');
const bodyEl = document.body;

// --- Core Three.js Variables ---
let scene, camera, renderer;
let orbit;

// --- Game State ---
let persona = 'optimizer';
let currentMission = 1;
let checklist = { systems: false, prototyping: false, leading: false };
let gameStarted = false;

// --- Drone & Physics ---
let drone, propellers = [];
let velocity = new THREE.Vector3();
let windForce = new THREE.Vector3();
let yaw = 0;
let noiseActive = false;

// --- Course & Mission Objects ---
let courseGroup = new THREE.Group();
let checkpoints = [], currentCheckpoint = 0;
let mission2Obstacles = [];
let mission2Bounds = {};

// --- Timing ---
let startTime = 0, elapsedTime = 0;
let mission2TimeLimit = 60;
let M2FailTimer = null;

// --- Audio ---
const audio = createAudio();

// --- Persona Parameters ---
const paramsSets = {
  optimizer: { thrust: 0.014, drag: 0.975, gravity: -0.0018, speedLimit: 0.16, tiltGain: 0.45 },
  prototyper: { thrust: 0.018, drag: 0.950, gravity: -0.0018, speedLimit: 0.22, tiltGain: 0.65 }
};
let params = paramsSets.optimizer;

const keys = Object.create(null);
const cameraOffset = new THREE.Vector3(0, 4, 8);

// ────────────────────────────────────────────────────────────
// Boot
// ────────────────────────────────────────────────────────────
init();
animate();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 500);
  camera.position.copy(cameraOffset);
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.enableZoom = false;
  orbit.enablePan = false;

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(5,10,6); dir.castShadow = true;
  scene.add(dir);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240,240), new THREE.MeshStandardMaterial({color:0x1a1a1a}));
  ground.rotation.x = -Math.PI/2; ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(240, 240, 0x0a0a0a, 0x101010);
  grid.position.y = 0.001; scene.add(grid);

  drone = makeDrone();
  scene.add(drone);
  scene.add(courseGroup);

  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById('optimizerBtn').addEventListener('click', () => {
    persona = 'optimizer';
    params = { ...paramsSets.optimizer };
    startGame();
  });
  document.getElementById('prototyperBtn').addEventListener('click', () => {
    persona = 'prototyper';
    params = { ...paramsSets.prototyper };
    startGame();
  });

  const dragSlider = document.getElementById('drag-slider');
  const tiltSlider = document.getElementById('tilt-slider');
  dragSlider.addEventListener('input', (e) => { params.drag = parseFloat(e.target.value); });
  tiltSlider.addEventListener('input', (e) => { params.tiltGain = parseFloat(e.target.value); });

  dragSlider.value = params.drag;
  tiltSlider.value = params.tiltGain;

  addEventListener('keydown', onKey);
  addEventListener('keyup', onKey);
  addEventListener('resize', onResize);
}

function startGame() {
    if (gameStarted) return;
    document.getElementById('overlay-title').textContent = "Drone Pilot: Systems Thinker Trial";
    document.getElementById('overlay-subtitle').textContent = "Choose Your Design Philosophy";

    gameStarted = true;
    overlay.style.display = 'none';
    showNarration('"Turn sparks into systems."');
    resetMission();
}

// ────────────────────────────────────────────────────────────
// Mission & Game Loop Control
// ────────────────────────────────────────────────────────────
function resetMission(failed = false) {
  while(courseGroup.children.length > 0) courseGroup.remove(courseGroup.children[0]);
  checkpoints.length = 0;
  mission2Obstacles.length = 0;
  currentCheckpoint = 0;

  drone.position.set(0, 1, 0);
  drone.rotation.set(0, 0, 0);
  velocity.set(0, 0, 0);
  yaw = 0;
  noiseActive = false;
  windForce.set(0,0,0);

  if (currentMission === 1) buildMission1();
  else if (currentMission === 2) buildMission2();
  else if (currentMission === 3) buildMission3();

  startTime = performance.now();
  if (failed) toastMsg("Time Over! Retrying...", 2000);
}

function completeMission() {
    playSfx('complete');
    if (currentMission === 1) {
        checklist.leading = true;
        showNarration('"Every failure is data. Every success, a system."');
    } else if (currentMission === 2) {
        checklist.systems = true;
        showNarration('"Complexity mastered is simplicity."');
        noiseActive = false;
        if (M2FailTimer) clearTimeout(M2FailTimer);
    } else if (currentMission === 3) {
        checklist.prototyping = true;
        showNarration('"A well-built system appears to have a life of its own."');
        setTimeout(endGame, 2000);
        return;
    }

    currentMission++;
    setTimeout(resetMission, 3000);
}

function endGame() {
    gameStarted = false;
    currentMission = 1;
    checklist = { systems: false, prototyping: false, leading: false };

    document.getElementById('overlay-title').textContent = "ALL MISSIONS COMPLETE";
    document.getElementById('overlay-subtitle').textContent = "Would you like to try again?";
    overlay.style.display = 'flex';
}

// --- Mission Builders ---
function buildMission1() {
    showMissionCard("M1: From Spark to Flight", "랜덤 생성된 코스를 통과하세요.");
    const ringMat = new THREE.MeshStandardMaterial({ color:0xffff00, emissive:0xff8800, emissiveIntensity:0.7 });
    const ringGeo = new THREE.TorusGeometry(1.8, 0.1, 16, 100);
    let lastPos = new THREE.Vector3(0, 3, -15);
    for(let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat.clone());
      const newPos = new THREE.Vector3((Math.random() - 0.5) * 25, 2 + Math.random() * 6, lastPos.z - (15 + Math.random() * 10));
      ring.position.copy(newPos);
      ring.lookAt(lastPos);
      courseGroup.add(ring);
      checkpoints.push(ring);
      lastPos = newPos.clone();
    }
}

function buildMission2() {
    showMissionCard("M2: Debug Under Pressure", "불안정한 시스템으로 미로를 탈출하세요. (60초)");

    drone.position.set(0, 1.5, 0);

    const endGoalMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.8, transparent: true, opacity: 0.4 });
    const endGoal = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 1), endGoalMat);
    endGoal.position.set(0, 2.5, -35);
    courseGroup.add(endGoal);
    checkpoints.push(endGoal);

    noiseActive = true;
    toastMsg("WARNING: Sensor Noise Detected! Escape the maze!", 2000);

    const pillarMat = new THREE.MeshStandardMaterial({ color:0xaa4444, emissive:0xaa0000, emissiveIntensity:0.5 });
    const pillarHeight = 8;
    const pillarRadius = 0.4;
    const wallThickness = 3.0;

    const maze = [
      "#### ####", "#   #   #", "### ### #", "# #   # #", "# ### ###",
      "#   #   #", "### ### #", "#   #   #", "#### ####",
    ];

    const startZ = -5;

    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[r].length; c++) {
        if (maze[r][c] === '#') {
          const x = (c - maze[r].length / 2 + 0.5) * wallThickness;
          const z = startZ - r * wallThickness;
          const p = new THREE.Mesh(new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 18), pillarMat);
          p.position.set(x, pillarHeight / 2, z);
          courseGroup.add(p);
          mission2Obstacles.push(p);
        }
      }
    }

    const mazeWidth = maze[0].length * wallThickness;
    const mazeDepth = maze.length * wallThickness;
    mission2Bounds = {
        minX: -mazeWidth / 2 - 2,
        maxX: mazeWidth / 2 + 2,
        minZ: startZ - mazeDepth - 5,
        maxZ: startZ + 2,
        maxY: pillarHeight - 0.5 // 보이지 않는 천장 높이 설정
    };

    if (M2FailTimer) clearTimeout(M2FailTimer);
    M2FailTimer = setTimeout(() => {
      if (currentMission === 2) {
        resetMission(true);
      }
    }, mission2TimeLimit * 1000);
}


function buildMission3() {
    showMissionCard("M3: Team Tactics", "강풍 속에서 골대에 득점하세요.");
    const goalMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.5, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const goal = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 1), goalMat);
    goal.position.set(0, 3, -40);
    courseGroup.add(goal);
    checkpoints.push(goal);
    windForce.set((Math.random()-0.5) * 0.005, 0, (Math.random()-0.5) * 0.005);
}

// ────────────────────────────────────────────────────────────
// Loop
// ────────────────────────────────────────────────────────────
function animate(){
  requestAnimationFrame(animate);

  const desiredCameraPosition = drone.position.clone().add(cameraOffset);
  camera.position.lerp(desiredCameraPosition, 0.05);
  orbit.target.copy(drone.position);
  orbit.update();

  if (!gameStarted) {
    renderer.render(scene, camera);
    return;
  }

  handleInput();

  velocity.add(windForce);
  if (noiseActive) {
      velocity.x += (Math.random() - 0.5) * 0.003;
      velocity.z += (Math.random() - 0.5) * 0.003;
  }
  velocity.multiplyScalar(params.drag);
  velocity.y += params.gravity;
  velocity.clampLength(0, params.speedLimit);
  drone.position.add(velocity);

  if (drone.position.y < 1){ drone.position.y = 1; velocity.y = 0; }

  drone.rotation.y = yaw;
  const pitch =  velocity.z * params.tiltGain;
  const roll  = -velocity.x * params.tiltGain;
  drone.rotation.x = THREE.MathUtils.lerp(drone.rotation.x, pitch, 0.15);
  drone.rotation.z = THREE.MathUtils.lerp(drone.rotation.z, roll, 0.15);

  propellers.forEach((p,i)=> p.rotation.z += (i%2===0?0.45:-0.45));

  elapsedTime = (performance.now() - startTime) / 1000;

  if (currentMission === 1 || currentMission === 3) {
      checkGoal();
  } else if (currentMission === 2) {
      checkGoal();
      checkM2Collision();
      checkBounds();
  }

  updateHUD();
  renderer.render(scene, camera);
}

// ────────────────────────────────────────────────────────────
// Game Logic
// ────────────────────────────────────────────────────────────
function checkGoal(){
  if (checkpoints.length === 0 || currentCheckpoint >= checkpoints.length) return;
  const goal = checkpoints[currentCheckpoint];
  const dist = goal.position.distanceTo(drone.position);
  if (dist < 2.5){
    playSfx('pass');
    goal.material.emissive.setHex(0x00ff00);
    currentCheckpoint++;
    if (currentCheckpoint >= checkpoints.length) {
      completeMission();
    }
  }
}

function checkM2Collision() {
    if (currentMission !== 2) return;
    const droneRadius = 0.6;
    const pillarRadius = 0.4;

    for (const obstacle of mission2Obstacles) {
        const dist_x = drone.position.x - obstacle.position.x;
        const dist_z = drone.position.z - obstacle.position.z;
        const distance = Math.sqrt(dist_x*dist_x + dist_z*dist_z);

        if (distance < droneRadius + pillarRadius) {
            applyWarningEffect();
            const overlap = droneRadius + pillarRadius - distance;
            const pushback = new THREE.Vector3(dist_x, 0, dist_z).normalize();
            drone.position.addScaledVector(pushback, overlap);
            velocity.multiplyScalar(0.5);
            return;
        }
    }
    if (elapsedTime >= mission2TimeLimit && currentMission === 2) {
        resetMission(true);
    }
}

function checkBounds() {
    if (drone.position.x < mission2Bounds.minX) {
        drone.position.x = mission2Bounds.minX;
        velocity.x *= -0.5;
    } else if (drone.position.x > mission2Bounds.maxX) {
        drone.position.x = mission2Bounds.maxX;
        velocity.x *= -0.5;
    }
    if (drone.position.z < mission2Bounds.minZ) {
        drone.position.z = mission2Bounds.minZ;
        velocity.z *= -0.5;
    } else if (drone.position.z > mission2Bounds.maxZ) {
        drone.position.z = mission2Bounds.maxZ;
        velocity.z *= -0.5;
    }
    // 천장 체크
    if (drone.position.y > mission2Bounds.maxY) {
        drone.position.y = mission2Bounds.maxY;
        velocity.y *= -0.1;
    }
}


function updateHUD() {
  const chk = (flag) => flag ? '✅' : '☐';
  let mission2TimeLeft = '';
  if (currentMission === 2) {
      const remaining = Math.max(0, mission2TimeLimit - elapsedTime);
      mission2TimeLeft = `\nTime Left: ${remaining.toFixed(1)}s`;
  }

  const checklistText = `
[ Why choose me ]
${chk(checklist.systems)} Systems thinking
${chk(checklist.prototyping)} Fast prototyping
${chk(checklist.leading)} Teaching & leading`;

  hud.textContent = `Pilot: ${persona}\nMission ${currentMission}/3${mission2TimeLeft}\n${checklistText}`;
}

// ────────────────────────────────────────────────────────────
// Audio
// ────────────────────────────────────────────────────────────
function createAudio(){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0.15;
    master.connect(ctx.destination);

    const playBeep = (freq=880, dur=0.12, type='sine')=>{
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime + 0.01;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1.0, t+0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t+dur);
      o.connect(g).connect(master);
      o.start(t); o.stop(t+dur+0.02);
    };

    return {
      pass: ()=> playBeep(1046, 0.09, 'triangle'),
      impact: ()=> playBeep(180, 0.14, 'sawtooth'),
      complete: ()=> { playBeep(880, 0.12, 'sine'); setTimeout(()=>playBeep(1175,0.12,'sine'),90); setTimeout(()=>playBeep(1480,0.16,'sine'),180); }
    };
  } catch(e) {
    return { pass: ()=>{}, impact: ()=>{}, complete: ()=>{} };
  }
}

function playSfx(kind){
  try{
    if (kind==='pass') audio.pass();
    else if (kind==='impact') audio.impact();
    else if (kind==='complete') audio.complete();
  }catch(e){}
}

// ────────────────────────────────────────────────────────────
// UI Effects & Boilerplate
// ────────────────────────────────────────────────────────────
function showMissionCard(title, subtitle) {
  missionCardEl.innerHTML = `<h3>${title}</h3><p>${subtitle}</p>`;
  missionCardEl.style.opacity = 1;
  missionCardEl.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    missionCardEl.style.opacity = 0;
    missionCardEl.style.transform = 'translateX(-50%) translateY(-20px)';
  }, 4000);
}
function showNarration(text) {
  narrationEl.textContent = `“${text}”`;
  narrationEl.style.opacity = 1;
  narrationEl.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    narrationEl.style.opacity = 0;
    narrationEl.style.transform = 'translateX(-50%) translateY(20px)';
  }, 4000);
}
function toastMsg(msg, duration=1400){
  toast.textContent = msg;
  toast.style.opacity = 1;
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> toast.style.opacity = 0, duration);
}
function applyWarningEffect() {
    playSfx('impact');
    bodyEl.classList.add('flash-red');
    toastMsg("COLLISION!", 1000);
    setTimeout(() => {
        bodyEl.classList.remove('flash-red');
    }, 200);
}
function onKey(e){
  const k = e.key.toLowerCase();
  if (e.type==='keydown') keys[k] = true; else keys[k] = false;
  if (k==='r' && e.type==='keydown' && gameStarted) { resetMission(); }
}
function onResize(){ camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
function handleInput(){
  const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  if (drone.position.y > 1.01) {
    if (keys['w']) velocity.addScaledVector(fwd, -params.thrust);
    if (keys['s']) velocity.addScaledVector(fwd, params.thrust);
    if (keys['a']) velocity.addScaledVector(right, -params.thrust);
    if (keys['d']) velocity.addScaledVector(right, params.thrust);
  }
  if (keys[' ']) velocity.y += params.thrust * 1.2;
  if (keys['shift']) velocity.y -= params.thrust;
  if (keys['q']) yaw += 0.022;
  if (keys['e']) yaw -= 0.022;
}
function makeDrone(){
  const group = new THREE.Group();
  const bodyShape = new THREE.Shape();
  const r = 0.7;
  bodyShape.moveTo(r * Math.cos(0), r * Math.sin(0));
  for (let i = 1; i <= 6; i++) { bodyShape.lineTo(r * Math.cos(i * Math.PI / 3), r * Math.sin(i * Math.PI / 3)); }
  const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
  const core = new THREE.Mesh(bodyGeo, bodyMat);
  core.rotation.x = -Math.PI / 2;
  core.castShadow = true;
  group.add(core);
  const camGeo = new THREE.SphereGeometry(0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const camMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0, roughness: 0.2 });
  const cameraDome = new THREE.Mesh(camGeo, camMat);
  cameraDome.position.set(0, 0.05, 0.4);
  group.add(cameraDome);
  const armMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.5 });
  const armGeo = new THREE.BoxGeometry(1.8, 0.06, 0.12);
  const arm1 = new THREE.Mesh(armGeo, armMat);
  arm1.rotation.y = Math.PI / 4;
  const arm2 = new THREE.Mesh(armGeo, armMat);
  arm2.rotation.y = -Math.PI / 4;
  arm1.castShadow = true; arm2.castShadow = true;
  group.add(arm1, arm2);
  const motorMat = new THREE.MeshStandardMaterial({ color: 0x3ec7b7, emissive: 0x147a6e, emissiveIntensity: 0.6 });
  const propMat  = new THREE.MeshStandardMaterial({ color: 0x99e9ff, emissive: 0x1188ff, emissiveIntensity: 0.9, transparent: true, opacity: 0.62 });
  const motorPositions = [
    new THREE.Vector3( 0.85, 0.08,  0.85), new THREE.Vector3(-0.85, 0.08,  0.85),
    new THREE.Vector3( 0.85, 0.08, -0.85), new THREE.Vector3(-0.85, 0.08, -0.85)
  ];
  propellers = [];
  for (let i=0; i<4; i++){
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.12, 16), motorMat);
    m.position.copy(motorPositions[i]);
    m.castShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.03, 12, 64), propMat);
    ring.position.copy(motorPositions[i]);
    ring.rotation.x = -Math.PI / 2;
    group.add(m, ring);
    propellers.push(ring);
  }
  const ledGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const ledFront = new THREE.Mesh(ledGeo, new THREE.MeshStandardMaterial({ emissive: 0x00ffcc, emissiveIntensity: 2.0 }));
  const ledBack = new THREE.Mesh(ledGeo, new THREE.MeshStandardMaterial({ emissive: 0xff2255, emissiveIntensity: 2.0 }));
  ledFront.position.set(0, -0.05, 0.6);
  ledBack.position.set(0, -0.05, -0.6);
  group.add(ledFront, ledBack);
  return group;
}