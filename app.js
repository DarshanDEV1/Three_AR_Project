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
  
      renderer.render(scene, camera);
    };
  
    animate();
  };
  