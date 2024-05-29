<<<<<<< HEAD
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

=======
import THREE from "https://unpkg.com/three@0.127.0/build/three.module.js"

// Wait for the page to load
window.onload = () => {
    // Initialize the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    scene.add(camera);
  
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);
  
    // Initialize AR.js
    const arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam'
    });
  
    arToolkitSource.init(() => {
      setTimeout(() => {
        onResize();
      }, 2000);
    });
  
    // Handle resizing
    window.addEventListener('resize', () => {
      onResize();
    });
  
    const onResize = () => {
      arToolkitSource.onResizeElement();
      arToolkitSource.copyElementSizeTo(renderer.domElement);
      if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
      }
    };
  
    // Create AR toolkit context
    const arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: 'https://raw.githack.com/AR-js-org/AR.js/master/three.js/data/camera_para.dat',
      detectionMode: 'mono'
    });
  
    arToolkitContext.init(() => {
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });
  
    // Create a marker
    const markerRoot = new THREE.Group();
    scene.add(markerRoot);
  
    const arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
      type: 'pattern',
      patternUrl: 'https://raw.githack.com/AR-js-org/AR.js/master/three.js/data/patt.hiro',
    });
  
    // Add a cube to the marker
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0.5;
    markerRoot.add(cube);
  
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
  
      if (arToolkitSource.ready) {
        arToolkitContext.update(arToolkitSource.domElement);
      }
  
      // Rotate the cube
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
  
>>>>>>> parent of 40270e1 (Tried Updating and Adding new Cube On Click)
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
