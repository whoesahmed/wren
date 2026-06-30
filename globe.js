/* Single shared globe — builds once, stays fixed behind all pages */
let globeBuilt = false;

function buildGlobe(canvasId){
  const canvas = document.getElementById(canvasId);
  if(!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 2.6;

  function resize(){
    const s = canvas.clientWidth;
    renderer.setSize(s, s, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  function getColors(){
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return { ink:new THREE.Color(dark ? 0xF2EDE4 : 0x1A1610), gold:new THREE.Color(0x8B6914) };
  }

  const {ink:INK, gold:GOLD} = getColors();
  const globe = new THREE.Group();
  scene.add(globe);

  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(1, 36, 18),
    new THREE.MeshBasicMaterial({color:INK, wireframe:true, transparent:true, opacity:0.07})
  ));
  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.995, 72, 36),
    new THREE.MeshBasicMaterial({color:INK, wireframe:true, transparent:true, opacity:0.04})
  ));

  const N = 420, pos = new Float32Array(N*3), col = new Float32Array(N*3);
  for(let i = 0; i < N; i++){
    const phi   = Math.acos(1 - 2*(i+.5)/N);
    const theta = Math.PI*(1+Math.sqrt(5))*i;
    pos[i*3]   = Math.sin(phi)*Math.cos(theta);
    pos[i*3+1] = Math.cos(phi);
    pos[i*3+2] = Math.sin(phi)*Math.sin(theta);
    const c = Math.random() < 0.08 ? GOLD : INK;
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dg.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  globe.add(new THREE.Points(dg,
    new THREE.PointsMaterial({size:0.018, vertexColors:true, transparent:true, opacity:0.35, sizeAttenuation:true})
  ));

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.002, 0.0012, 4, 120),
    new THREE.MeshBasicMaterial({color:GOLD, transparent:true, opacity:0.18})
  );
  ring.rotation.x = Math.PI/2;
  globe.add(ring);

  globe.rotation.x =  0.28;
  globe.rotation.z = -0.08;

  let f = 0;
  (function loop(){
    requestAnimationFrame(loop);
    f++;
    globe.rotation.y += 0.0018;
    globe.rotation.x  = 0.28 + Math.sin(f*0.004)*0.02;
    renderer.render(scene, camera);
  })();
}

/* Called once — the canvas is always in the DOM so no guard needed */
function initSharedGlobe(){
  if(!globeBuilt){ globeBuilt = true; buildGlobe('shared-globe'); }
}

/* Legacy stubs so any remaining calls in app.js don't throw */
function initHomeGlobe(){ initSharedGlobe(); }
function initAppGlobe(){  initSharedGlobe(); }

initSharedGlobe();