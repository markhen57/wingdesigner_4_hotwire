// js/utils/gcodeGenerator.js

//const tcpOffset = {x:0, y:0.5, z:0}; // Draht 1mm -> y = 0.5
/*window.generateG93FourAxis = function(innerPoints, outerPoints, feed = 100, machineLimits = {}, tcpOffset = {x:0,y:0}) {
  if (!Array.isArray(innerPoints) || !Array.isArray(outerPoints)) return '';
  if (innerPoints.length !== outerPoints.length) throw new Error("Inner und Outer Points müssen gleiche Länge haben!");
  if (innerPoints.length < 2) return '';

  const Xname = window.xName || 'X';
  const Yname = window.yName || 'Y';
  const Uname = window.uName || 'U';
  const Aname = window.aName || 'A';

  const inverseTimeUnits = 1.0;

  const Xmax = machineLimits.X > 0 ? machineLimits.X : 100;
  const Ymax = machineLimits.Y > 0 ? machineLimits.Y : 100;
  const Umax = machineLimits.U > 0 ? machineLimits.U : 100;
  const Amax = machineLimits.A > 0 ? machineLimits.A : 100;
  const Fmax = machineLimits.Fmax > 0 ? machineLimits.Fmax : 5000;
  const Fmin = machineLimits.Fmin > 0 ? machineLimits.Fmin : 1;

  // TCP-Offset nur auf innerPoints X/Y anwenden
  const applyTCPAndLimits = (p) => {
    let x = p.x + (tcpOffset.x || 0);
    let y = p.y + (tcpOffset.y || 0);

    // Verhältnis X/Y bestimmen
    let scaleX = 1, scaleY = 1;
    if (x < 0) scaleX = 0 / x;
    if (x > Xmax) scaleX = Xmax / x;
    if (y < 0) scaleY = 0 / y;
    if (y > Ymax) scaleY = Ymax / y;

    const scale = Math.min(scaleX, scaleY, 1); // die kritischere Achse bestimmt die Skalierung
    if (scale !== 1) {
      x *= scale;
      y *= scale;
      console.warn(`Punkt X/Y auf Limits geclippt: X=${x}, Y=${y}`);
    }

    return { x, y, tag: p.tag };
  };

  const clipRotary = (u, a) => {
    let corrected = false;
    if (u < 0) { u = 0; corrected = true; }
    if (u > Umax) { u = Umax; corrected = true; }
    if (a < 0) { a = 0; corrected = true; }
    if (a > Amax) { a = Amax; corrected = true; }
    if (corrected) console.warn(`Rotary auf Limits geclippt: U=${u}, A=${a}`);
    return { u, a };
  };

  const getRadialDistance = (start, end) => Math.abs(end - start) * (Math.PI / 180);

  const lines = [];
  lines.push('G90');
  lines.push('G93');

  for (let i = 1; i < innerPoints.length; i++) {
    const Istart = applyTCPAndLimits(innerPoints[i - 1]);
    const Iend   = applyTCPAndLimits(innerPoints[i]);
    const Ostart = outerPoints[i - 1];
    const Oend   = outerPoints[i];

    let { u: Ustart, a: Astart } = clipRotary(Ostart.x, Ostart.y);
    let { u: Uend,   a: Aend }   = clipRotary(Oend.x,   Oend.y);

    // Lineare Distanz X/Y
    const dx = Iend.x - Istart.x;
    const dy = Iend.y - Istart.y;
    const linearLength = Math.sqrt(dx*dx + dy*dy);

    // Rotatorische Distanz
    const radialU = getRadialDistance(Ustart, Uend);
    const radialA = getRadialDistance(Astart, Aend);

    const moveLength = Math.max(linearLength + radialU + radialA, 0.001);

    let F = feed / moveLength / inverseTimeUnits;
    if (F > Fmax) { console.warn(`Feedrate auf Fmax geclippt: ${F} → ${Fmax}`); F = Fmax; }
    if (F < Fmin) { console.warn(`Feedrate auf Fmin geclippt: ${F} → ${Fmin}`); F = Fmin; }

    const tagComment = [
      Istart.tag ? `Istart=${Istart.tag}` : '',
      Iend.tag   ? `Iend=${Iend.tag}`     : '',
      Ostart.tag ? `Ostart=${Ostart.tag}` : '',
      Oend.tag   ? `Oend=${Oend.tag}`     : ''
    ].filter(Boolean).join(' ; ');

    const line = `G1 ${Xname}${Iend.x.toFixed(3)} ${Yname}${Iend.y.toFixed(3)} ${Uname}${Uend.toFixed(3)} ${Aname}${Aend.toFixed(3)} F${F.toFixed(4)}${tagComment ? ' ; ' + tagComment : ''}`;
    lines.push(line);
  }

  lines.push('G94');
  return lines.join('\n');
};*/

// js/utils/gcodeGenerator.js

// === Header-Funktion für G93 ===
window.generateG93Header = function({ hotWirePower } = {}) {
  const lines = [
    'G17 ; XY-Ebene auswählen',
    'G21 ; Millimetermaßsystem',
    'G90 ; Absolute Positionierung',
    'G40 ; Cutter Compensation aus',
    'G49 ; Tool Length Offset abbrechen',
    'G64 ; Pfadsteuerung (Path Control Mode)',
    'G1 X0.00 Y0.00 Z0.00 A0.00 ; Zurück zur Maschinen-Null'
  ];

  if (hotWirePower > 0) {
    lines.push(`M3 S${hotWirePower}`); // HotWire Heizen einschalten
  }

  return lines.join('\n');
};

// === Footer-Funktion für G93 ===
window.generateG93Footer = function() {
  const lines = [
    'G1 X0.00 Y0.00 Z0.00 A0.00 ; Zurück zur Maschinen-Null',
    'M5 ; HotWire Heizen ausschalten',
    'G94 ; Normaler Feedrate-Modus wieder aktiv',
    'M2 ; Programm Ende'
  ];

  return lines.join('\n');
};

window.generateG93FourAxis = function(innerPoints, outerPoints, feed = 100, machineLimits = {}, tcpOffset = {x:0,y:0}) {
  if (!Array.isArray(innerPoints) || !Array.isArray(outerPoints)) return '';
  if (innerPoints.length !== outerPoints.length) throw new Error("Inner und Outer Points müssen gleiche Länge haben!");
  if (innerPoints.length < 2) return '';

  const Xname = window.xName || 'X';
  const Yname = window.yName || 'Y';
  const Zname = window.zName || 'Z';
  const Aname = window.aName || 'A';

  const inverseTimeUnits = 1.0;

  const Xmax = machineLimits.X > 0 ? machineLimits.X : 100;
  const Ymax = machineLimits.Y > 0 ? machineLimits.Y : 100;
  const Zmax = machineLimits.Z > 0 ? machineLimits.Z : 100;
  const Amax = machineLimits.A > 0 ? machineLimits.A : 100;
  const Fmax = machineLimits.Fmax > 0 ? machineLimits.Fmax : 5000;
  const Fmin = machineLimits.Fmin > 0 ? machineLimits.Fmin : 1;

  const applyTCPAndLimits = (p) => {
    let x = p.x + (tcpOffset.x || 0);
    let y = p.y + (tcpOffset.y || 0);

    let scaleX = 1, scaleY = 1;
    if (x < 0) scaleX = 0 / x;
    if (x > Xmax) scaleX = Xmax / x;
    if (y < 0) scaleY = 0 / y;
    if (y > Ymax) scaleY = Ymax / y;

    const scale = Math.min(scaleX, scaleY, 1);
    if (scale !== 1) {
      x *= scale;
      y *= scale;
      //console.warn(`Punkt X/Y auf Limits geclippt: X=${x}, Y=${y}`);
    }

    return { x, y, tag: p.tag };
  };

  const clipRotary = (z, a) => {
    let corrected = false;
    if (z < 0) { z = 0; corrected = true; }
    if (z > Zmax) { z = Zmax; corrected = true; }
    if (a < 0) { a = 0; corrected = true; }
    if (a > Amax) { a = Amax; corrected = true; }
    //if (corrected) console.warn(`Rotary auf Limits geclippt: Z=${z}, A=${a}`);
    return { z, a };
  };

  const getRadialDistance = (start, end) => Math.abs(end - start) * (Math.PI / 180);

  const lines = [];
  lines.push('G93 ; Inverse Time Feedrate aktivieren');

  let lastF = feed;
  const maxDeltaF = 30;

  
  for (let i = 1; i < innerPoints.length; i++) {

        // raw Inputpunkte
    const rawIstart = innerPoints[i - 1];
    const rawIend   = innerPoints[i];
    const rawOstart = outerPoints[i - 1];
    const rawOend   = outerPoints[i];

    const Istart = applyTCPAndLimits(innerPoints[i - 1]);
    const Iend   = applyTCPAndLimits(innerPoints[i]);
    const Ostart = outerPoints[i - 1];
    const Oend   = outerPoints[i];

    // Korrektur: Z und A Werte richtig zuweisen
    let { z: Zstart, a: Astart } = clipRotary(Ostart.y, Ostart.x);
    let { z: Zend,   a: Aend }   = clipRotary(Oend.y,   Oend.x);

    const dx = Iend.x - Istart.x;
    const dy = Iend.y - Istart.y;
    const linearLength = Math.sqrt(dx*dx + dy*dy);

    const radialZ = getRadialDistance(Zstart, Zend);
    const radialA = getRadialDistance(Astart, Aend);

    const moveLength = Math.max(linearLength + radialZ + radialA, 0.001);

    let F = feed / moveLength / inverseTimeUnits;
    if (F > Fmax) F = Fmax;
    if (F < Fmin) F = Fmin;

    const deltaF = F - lastF;
    if (deltaF > maxDeltaF) F = lastF + maxDeltaF;
    if (deltaF < -maxDeltaF) F = lastF - maxDeltaF;

    lastF = F;

        // Debug nur für die ersten 5 und letzten 5 Punkte
    if (i <= 3 || i > innerPoints.length - 3) {
        console.log(`Point ${i}:`);
        console.log(`  rawIstart=(${rawIstart.x},${rawIstart.y}) rawIend=(${rawIend.x},${rawIend.y})`);
        console.log(`  rawOstart=(${rawOstart.x},${rawOstart.y}) rawOend=(${rawOend.x},${rawOend.y})`);
        console.log(`  Istart=(${Istart.x.toFixed(3)},${Istart.y.toFixed(3)}) Iend=(${Iend.x.toFixed(3)},${Iend.y.toFixed(3)})`);
        console.log(`  Zstart=${Zstart.toFixed(3)} Zend=${Zend.toFixed(3)} Astart=${Astart.toFixed(3)} Aend=${Aend.toFixed(3)} F=${F.toFixed(3)}`);
    }

    const tagComment = [
      Istart.tag ? `Istart=${Istart.tag}` : '',
      Iend.tag   ? `Iend=${Iend.tag}`     : '',
      Ostart.tag ? `Ostart=${Ostart.tag}` : '',
      Oend.tag   ? `Oend=${Oend.tag}`     : ''
    ].filter(Boolean).join(' ; ');

        // Debug nur für die ersten 5 und letzten 5 Punkte
    //if (i <= 5 || i > innerPoints.length - 5) {
    //    console.log(`Point ${i}: Istart=(${Istart.x.toFixed(3)},${Istart.y.toFixed(3)}) Iend=(${Iend.x.toFixed(3)},${Iend.y.toFixed(3)}) Zstart=${Zstart.toFixed(3)} Zend=${Zend.toFixed(3)} Astart=${Astart.toFixed(3)} Aend=${Aend.toFixed(3)} F=${F.toFixed(3)}`);
    //}

    const line = `G1 ${Xname}${Iend.x.toFixed(3)} ${Yname}${Iend.y.toFixed(3)} ${Aname}${Aend.toFixed(3)} ${Zname}${Zend.toFixed(3)} F${F.toFixed(4)}${tagComment ? ' ; ' + tagComment : ''}`;
    lines.push(line);
  }

  lines.push('G94');
  return lines.join('\n');
};



