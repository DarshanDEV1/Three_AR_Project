import THREE from "https://unpkg.com/three@0.127.0/build/three.module.js"

let xrSession = null;
let hitTestSource = null;
let localReferenceSpace = null;
let viewerReferenceSpace = null;
let hitTestSourceInitialized = false;
const cubes = [];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Add a light to the scene
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// Create a cube
const createCube = () => {
  const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
  return new THREE.Mesh(geometry, material);
};

const initializeHitTestSource = async () => {
  if (hitTestSourceInitialized) return;
  hitTestSourceInitialized = true;

  viewerReferenceSpace = await xrSession.requestReferenceSpace('viewer');
  hitTestSource = await xrSession.requestHitTestSource({ space: viewerReferenceSpace });
};

const onSelect = (event) => {
  if (!hitTestSource) return;

  const frame = event.frame;
  const hitTestResults = frame.getHitTestResults(hitTestSource);
  if (hitTestResults.length > 0) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const hit = hitTestResults[0];
    const pose = hit.getPose(referenceSpace);

    const cube = createCube();
    cube.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
    scene.add(cube);
    cubes.push(cube);
  }
};

const animate = () => {
  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame) {
      if (!hitTestSource) {
        initializeHitTestSource();
      }

      if (hitTestSource) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);
          if (pose) {
            // Optional: visual indicator of hit test results
          }
        }
      }

      cubes.forEach(cube => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
      });

      renderer.render(scene, camera);
    }
  });
};

if (navigator.xr) {
  navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['hit-test']
  }).then((session) => {
    xrSession = session;
    renderer.xr.setSession(session);

    session.addEventListener('select', onSelect);
    session.requestReferenceSpace('local').then((refSpace) => {
      localReferenceSpace = refSpace;
      renderer.xr.setReferenceSpace(refSpace);
    });

    animate();
  });
} else {
  alert('WebXR not supported on this browser');
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
