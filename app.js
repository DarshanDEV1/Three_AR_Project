if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
      if (supported) {
        initializeAR();
      } else {
        alert('AR not supported on this device');
      }
    });
  } else {
    alert('WebXR not supported on this browser');
  }
  
  function initializeAR() {
    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
  
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
  
    // Add a light to the scene
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);
  
    // Initialize WebXR
    const xrSessionInit = { requiredFeatures: ['hit-test', 'dom-overlay'], domOverlay: { root: document.body } };
  
    // Handle click events to add cubes
    const cubes = [];
    renderer.domElement.addEventListener('click', (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      const hitTestSourceRequested = xrSession.requestReferenceSpace('viewer').then((refSpace) => {
        xrSession.requestHitTestSource({ space: refSpace }).then((hitTestSource) => {
          const frame = xrSession.requestAnimationFrame((timestamp, xrFrame) => {
            const viewerPose = xrFrame.getViewerPose(refSpace);
            if (viewerPose) {
              const hitTestResults = xrFrame.getHitTestResults(hitTestSource);
              if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(refSpace);
                const cube = createCube();
                cube.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
                scene.add(cube);
                cubes.push(cube);
              }
            }
          });
        });
      });
    });
  
    // Create a cube
    const createCube = () => {
      const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
      return new THREE.Mesh(geometry, material);
    };
  
    // Animation loop
    const animate = () => {
      renderer.setAnimationLoop((timestamp, frame) => {
        if (frame) {
          const session = renderer.xr.getSession();
          const refSpace = renderer.xr.getReferenceSpace();
          session.requestAnimationFrame(animate);
          renderer.render(scene, camera);
        }
      });
    };
  
    navigator.xr.requestSession('immersive-ar', xrSessionInit).then((session) => {
      renderer.xr.setSession(session);
      animate();
    });
  }
  