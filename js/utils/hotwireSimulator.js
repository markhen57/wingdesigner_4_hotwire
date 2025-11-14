// js/utils/hotwireSimulator.js

// globales Sim-Objekt sicherstellen
window.hotwireSim = window.hotwireSim || {
  running: false,
  index: 0,
  trail: null,
  cones: [],
  frame: null,
  lastTime: null
};

/**
 * Startet die Hotwire-Simulation
 * @param {THREE.Scene} scene - Die Three.js Szene
 * @param {Array} innerPts - Array von Punkten (links) {x, y}
 * @param {Array} outerPts - Array von Punkten (rechts) {x, y}
 * @param {number} hotwireLength - Länge der Hotwire Linie
 * @param {number} speedMultiplier - Multiplikator für Geschwindigkeit (z.B. 0.1 - 5)
 */
window.startHotwireSimulation = function(scene, innerPts, outerPts, hotwireLength, speedMultiplier = 1) {
  if (!scene || !innerPts?.length || !outerPts?.length) return;

  window.stopHotwireSimulation(scene);

  window.hotwireSim.running = true;
  window.hotwireSim.index = 0;
  window.hotwireSim.lastTime = performance.now();

  const total = Math.min(innerPts.length, outerPts.length);
  const trailLength = 50; // Anzahl der alten Positionen

  // Trail-Linien vorbereiten
  const trailPositions = new Float32Array(trailLength * 6); // 2 Punkte pro Linie, 3 Koordinaten
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffa500, transparent: true, opacity: 0.5 });
  const trailMesh = new THREE.LineSegments(trailGeometry, trailMaterial);
  scene.add(trailMesh);
  window.hotwireSim.trail = { mesh: trailMesh, positions: trailPositions };

  // Kegel vorbereiten
  const coneHeight = 5;
  const coneRadius = 3;
  const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 16);
  coneGeometry.rotateX(Math.PI / 2); // Spitze entlang +Z
  coneGeometry.translate(0, 0, -coneHeight / 2); // Spitze an Ursprung

  const coneMatLeft = new THREE.MeshStandardMaterial({ color: 0xb5a642, metalness: 0.8, roughness: 0.3 });
  const coneMatRight = new THREE.MeshStandardMaterial({ color: 0xffa500, metalness: 0.8, roughness: 0.3 });

  const coneLeft = new THREE.Mesh(coneGeometry, coneMatLeft);
  const coneRight = new THREE.Mesh(coneGeometry, coneMatRight);
  scene.add(coneLeft);
  scene.add(coneRight);
  window.hotwireSim.cones = [coneLeft, coneRight];

  // Licht, falls noch nicht vorhanden
  if (!scene.getObjectByName('hotwireLight')) {
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(0, 0, 50);
    light.name = 'hotwireLight';
    scene.add(light);
  }

  function animate() {
    if (!window.hotwireSim.running) return;

    const now = performance.now();
    const delta = now - window.hotwireSim.lastTime;
    window.hotwireSim.lastTime = now;

    // Punkte pro Sekunde
    const pointsPerSecond = speedMultiplier * 60; // Grundwert: 60 Punkte/sec
    window.hotwireSim.index += pointsPerSecond * (delta / 1000);
    const i = Math.floor(window.hotwireSim.index) % total;

    const pL = innerPts[i];
    const pR = outerPts[i];
    if (!pL || !pR) return;

    const v1 = new THREE.Vector3(pL.x, -hotwireLength / 2, pL.y);
    const v2 = new THREE.Vector3(pR.x, hotwireLength / 2, pR.y);

    // Trail verschieben (alte Positionen nach hinten)
    const positions = window.hotwireSim.trail.positions;
    for (let j = positions.length - 6; j >= 6; j--) {
      positions[j] = positions[j - 6];
      positions[j + 1] = positions[j - 5];
      positions[j + 2] = positions[j - 4];
      positions[j + 3] = positions[j - 3];
      positions[j + 4] = positions[j - 2];
      positions[j + 5] = positions[j - 1];
    }
    // aktuelle Position vorne
    positions[0] = v1.x; positions[1] = v1.y; positions[2] = v1.z;
    positions[3] = v2.x; positions[4] = v2.y; positions[5] = v2.z;
    window.hotwireSim.trail.mesh.geometry.attributes.position.needsUpdate = true;

    // Kegel positionieren & ausrichten
    const leftDir = new THREE.Vector3().subVectors(v2, v1).normalize();
    const rightDir = new THREE.Vector3().subVectors(v1, v2).normalize();

    coneLeft.position.copy(v1);      // Spitze genau auf Punkt
    coneRight.position.copy(v2);     // Spitze genau auf Punkt

    coneLeft.lookAt(v1.clone().add(leftDir));   // Basis Richtung Linie
    coneRight.lookAt(v2.clone().add(rightDir));

    window.hotwireSim.frame = requestAnimationFrame(animate);
  }

  animate();
};

window.stopHotwireSimulation = function(scene) {
  window.hotwireSim.running = false;
  if (window.hotwireSim.frame) cancelAnimationFrame(window.hotwireSim.frame);

  // Trail entfernen
  if (window.hotwireSim.trail?.mesh) {
    scene.remove(window.hotwireSim.trail.mesh);
    window.hotwireSim.trail.mesh.geometry.dispose();
    window.hotwireSim.trail.mesh.material.dispose();
  }

  // Kegel entfernen
  if (window.hotwireSim.cones?.length) {
    window.hotwireSim.cones.forEach(c => {
      scene.remove(c);
      c.geometry.dispose();
      c.material.dispose();
    });
  }

  window.hotwireSim.trail = null;
  window.hotwireSim.cones = [];
  window.hotwireSim.index = 0;
  window.hotwireSim.frame = null;
  window.hotwireSim.lastTime = null;
};
