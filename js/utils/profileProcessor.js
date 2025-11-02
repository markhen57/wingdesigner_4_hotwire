window.scaleProfile = function(pts, scale) {
  return pts.map(p => ({ ...p, x: p.x * scale, y: p.y * scale }));
};

/*window.matchPointCount = function(ptsA, ptsB) {
  const maxLen = Math.max(ptsA.length, ptsB.length);
  const resample = (pts, targetLen) => {
    const out = [];
    for (let i = 0; i < targetLen; i++) {
      const t = i / (targetLen - 1) * (pts.length - 1);
      const i0 = Math.floor(t), i1 = Math.ceil(t);
      const f = t - i0;
      const p0 = pts[i0] || { x: 0, y: 0 };
      const p1 = pts[i1] || { x: 0, y: 0 };
      out.push({ x: p0.x * (1 - f) + p1.x * f, y: p0.y * (1 - f) + p1.y * f, tag: p0.tag });
    }
    return out;
  };
  return [resample(ptsA, maxLen), resample(ptsB, maxLen)];
};*/

window.matchPointCount = function(ptsA, ptsB) {
  const maxLen = Math.max(ptsA.length, ptsB.length);

  const resampleWithTags = (pts, targetLen) => {
    // Alle neutralen Punkte sammeln (ohne Tag)
    const neutralPts = pts.filter(p => !p.tag);
    const taggedPts = pts.filter(p => p.tag);

    const resampledNeutral = [];
    for (let i = 0; i < targetLen; i++) {
      const t = i / (targetLen - 1) * (neutralPts.length - 1);
      const i0 = Math.floor(t);
      const i1 = Math.ceil(t);
      const f = t - i0;

      const p0 = neutralPts[i0] || { x: 0, y: 0, z: 0 };
      const p1 = neutralPts[i1] || { x: 0, y: 0, z: 0 };

      resampledNeutral.push({
        x: p0.x * (1 - f) + p1.x * f,
        y: p0.y * (1 - f) + p1.y * f,
        z: (p0.z || 0) * (1 - f) + (p1.z || 0) * f,
        tag: null
      });
    }

    // Jetzt die getaggten Punkte wieder an den gleichen Index einfügen
    const result = [];
    let neutralIndex = 0;
    for (let i = 0; i < pts.length; i++) {
      if (pts[i].tag) {
        result.push(pts[i]); // Tagged Point unverändert
      } else {
        result.push(resampledNeutral[neutralIndex]);
        neutralIndex++;
      }
    }

    return result;
  };

  return [resampleWithTags(ptsA, maxLen), resampleWithTags(ptsB, maxLen)];
};

window.offsetOuterProfile = function(pts, verticalOffset, chordOffset) {
  return pts.map(p => ({ ...p, x: p.x + chordOffset, y: p.y + verticalOffset }));
};

window.rotatePoint = function(pt, angleRad) {
  const cosA = Math.cos(angleRad), sinA = Math.sin(angleRad);
  return {
    ...pt,
    x: pt.x * cosA - pt.y * sinA,
    y: pt.x * sinA + pt.y * cosA
  };
};

window.getHolePoints = function(diameter, xPercent, yPercent, profilePts, nPoints) {
  if (!profilePts || profilePts.length === 0) return [];
  const xs = profilePts.map(p => p.x);
  const ys = profilePts.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const centerX = minX + xPercent * (maxX - minX);
  const centerY = minY + yPercent * (maxY - minY);
  const radius = diameter / 2;
  const holePts = [];
  for (let i = 0; i < nPoints; i++) {
    const theta = (i / nPoints) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(theta);
    const y = centerY + radius * Math.sin(theta);
    holePts.push({ x, y, tag: "HOLE" });
  }
  return holePts;
};

window.findClosestHolePoint = function(profilePts, holePts) {
  let minDist = Infinity, closestHoleIdx = 0, closestProfileIdx = 0;
  profilePts.forEach(({ x: px, y: py }, i) => {
    holePts.forEach(({ x: hx, y: hy }, j) => {
      const dx = px - hx, dy = py - hy;
      const dist = dx*dx + dy*dy;
      if (dist < minDist) {
        minDist = dist;
        closestHoleIdx = j;
        closestProfileIdx = i;
      }
    });
  });
  return { closestHoleIdx, closestProfileIdx };
};

window.rotateHolePointsToStart = function(holePts, startIdx, reverse = false) {
  let pts = [...holePts.slice(startIdx), ...holePts.slice(0, startIdx)];
  if (reverse) pts.reverse();
  return pts;
};

window.createCutPoints = function(profilePt, holePt, n = 3) {
  const { x: px, y: py } = profilePt;
  const { x: hx, y: hy } = holePt;
  const points = [];
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const x = px + t * (hx - px);
    const y = py + t * (hy - py);
    points.push({ x, y });
  }
  return points;
};

/*window.insertHoleWithInOut = function(profilePts, holePts, nCutPoints = 3) {
  if (!profilePts.length || !holePts.length) return profilePts;
  const { closestProfileIdx: ipIdx, closestHoleIdx: ihIdx } = window.findClosestHolePoint(profilePts, holePts);
  const profilePt = profilePts[ipIdx];
  const holePt = holePts[ihIdx];
  const inOutProfilePt = { ...profilePt, tag: "HOLE" };
  const inOutHolePt = { ...holePt, tag: "HOLE" };
  const rotatedHolePts = window.rotateHolePointsToStart(holePts, ihIdx, true).map(p => ({ x: p.x, y: p.y, tag: "HOLE" }));
  const cutPts = window.createCutPoints(profilePt, holePt, nCutPoints).map(p => ({ x: p.x, y: p.y, tag: "HOLE" }));
  return [
    ...profilePts.slice(0, ipIdx + 2),
    inOutProfilePt,
    ...cutPts,
    inOutHolePt,
    ...rotatedHolePts.slice(1),
    inOutHolePt,
    ...cutPts.slice().reverse(),
    inOutProfilePt,
    ...profilePts.slice(ipIdx + 2)
  ];
};*/

window.insertHoleWithInOut = function(profilePts, holePts, nCutPoints = 3) {
  if (!profilePts.length || !holePts.length) return profilePts;

  const { closestProfileIdx: ipIdx, closestHoleIdx: ihIdx } = window.findClosestHolePoint(profilePts, holePts);
  const profilePt = profilePts[ipIdx];
  const holePt = holePts[ihIdx];

  const inOutProfilePtStart = { ...profilePt, tag: window.PointTag.HOLE_END };
  const inOutProfilePtEnd = { ...profilePt, tag: window.PointTag.HOLE_END };
  const inOutHolePt = { ...holePt, tag: window.PointTag.HOLE };

  const rotatedHolePts = window.rotateHolePointsToStart(holePts, ihIdx, true)
    .map(p => ({ x: p.x, y: p.y, tag: window.PointTag.HOLE }));

  const cutPts = window.createCutPoints(profilePt, holePt, nCutPoints)
    .map(p => ({ x: p.x, y: p.y, tag: window.PointTag.HOLE }));

  const newProfile = [
  ...profilePts.slice(0, ipIdx), // alle Punkte **bis zum Insert-Punkt**, ohne Tag
  inOutProfilePtStart,                     // erster spezieller Punkt mit Tag
  ...cutPts,                           // Cut-Punkte mit Tag
  inOutHolePt,                         // Start-Hole-Punkt
  ...rotatedHolePts.slice(1),          // alle weiteren Hole-Punkte außer dem ersten (doppeltes vermeiden)
  inOutHolePt,                         // End-Hole-Punkt
  ...cutPts.slice().reverse(),        // Cut-Punkte wieder zurück
  inOutProfilePtEnd,                      // letzter spezieller Punkt mit Tag
  ...profilePts.slice(ipIdx)       // Rest des Profils ab Insert-Punkt
];

  return newProfile;
};

window.smoothProfile = function(points, threshold = 2) {
  const smoothed = [{ ...points[0] }];
  for (let i = 1; i < points.length; i++) {
    const prev = smoothed[smoothed.length - 1];
    const pt = points[i];
    let y = pt.y;
    if (Math.abs(y - prev.y) > threshold) {
      y = prev.y + Math.sign(y - prev.y) * threshold;
    }
    smoothed.push({ ...pt, y });
  }
  return smoothed;
};

window.findTopAtX = function(profilePts, xCut) {
  const n = profilePts.length;
  const half = Math.ceil(n / 2);
  const topPts = profilePts.slice(0, half);
  for (let i = 0; i < topPts.length - 1; i++) {
    const { x: x1, y: y1 } = topPts[i];
    const { x: x2, y: y2 } = topPts[i + 1];
    if ((x1 <= xCut && x2 >= xCut) || (x2 <= xCut && x1 >= xCut)) {
      const t = (xCut - x1) / (x2 - x1);
      return y1 + t * (y2 - y1);
    }
  }
  return topPts[0].y;
};

window.findBottomAtX = function(profilePts, xCut) {
  const n = profilePts.length;
  const half = Math.ceil(n / 2);
  const bottomPts = profilePts.slice(half);
  for (let i = 0; i < bottomPts.length - 1; i++) {
    const { x: x1, y: y1 } = bottomPts[i];
    const { x: x2, y: y2 } = bottomPts[i + 1];
    if ((x1 <= xCut && x2 >= xCut) || (x2 <= xCut && x1 >= xCut)) {
      const t = (xCut - x1) / (x2 - x1);
      return y1 + t * (y2 - y1);
    }
  }
  return bottomPts[0].y;
};

window.projectToProfile = function(profilePts, x) {
  for (let i = 0; i < profilePts.length - 1; i++) {
    const { x: x0, y: y0 } = profilePts[i];
    const { x: x1, y: y1 } = profilePts[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return profilePts[profilePts.length - 1].y;
};

/*window.addBottomPath = function(profilePts, xPercent = 0.5, gap = 2, forwardAngleDeg = 10, backwardAngleDeg = 10) {
  const forwardAngle = forwardAngleDeg * Math.PI / 180;
  const backwardAngle = backwardAngleDeg * Math.PI / 180;
  const xs = profilePts.map(p => p.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const xCut = minX + xPercent * (maxX - minX);
  const yBottom = window.findBottomAtX(profilePts, xCut);
  const yTop = window.findTopAtX(profilePts, xCut);
  const apexY = yTop - gap;
  const VHeight = apexY - yBottom;
  const dxBack = Math.tan(backwardAngle) * VHeight;
  const dxFwd = Math.tan(forwardAngle) * VHeight;
  const apexPt = { x: xCut, y: apexY, tag: "aileron" };
  const backPt = { x: xCut - dxBack, y: yBottom, tag: "aileron" };
  const fwdPt = { x: xCut + dxFwd, y: yBottom, tag: "aileron" };
  const half = Math.ceil(profilePts.length / 2);
  const bottomPts = profilePts.slice(half);
  fwdPt.y = window.projectToProfile(bottomPts, fwdPt.x);
  backPt.y = window.projectToProfile(bottomPts, backPt.x);
  const left = bottomPts.filter(p => p.x < backPt.x);
  const right = bottomPts.filter(p => p.x > fwdPt.x);
  const newBottom = [...left, backPt, apexPt, fwdPt, ...right];
  return [...profilePts.slice(0, half), ...newBottom];
};*/

window.addBottomPath = function(profilePts, xPercent = 0.5, gap = 2, forwardAngleDeg = 10, backwardAngleDeg = 10) {
  const forwardAngle = forwardAngleDeg * Math.PI / 180;
  const backwardAngle = backwardAngleDeg * Math.PI / 180;

  const xs = profilePts.map(p => p.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const xCut = minX + xPercent * (maxX - minX);

  const yBottom = window.findBottomAtX(profilePts, xCut);
  const yTop = window.findTopAtX(profilePts, xCut);
  const apexY = yTop - gap;
  const VHeight = apexY - yBottom;

  const dxBack = Math.tan(backwardAngle) * VHeight;
  const dxFwd = Math.tan(forwardAngle) * VHeight;

  // Neue Punkte mit Tag
  const apexPt = { x: xCut, y: apexY, tag: window.PointTag.AILERON };
  const backPt = { x: xCut - dxBack, y: yBottom, tag: window.PointTag.AILERON };
  const fwdPt = { x: xCut + dxFwd, y: yBottom, tag: window.PointTag.AILERON };

  const half = Math.ceil(profilePts.length / 2);
  const bottomPts = profilePts.slice(half);

  fwdPt.y = window.projectToProfile(bottomPts, fwdPt.x);
  backPt.y = window.projectToProfile(bottomPts, backPt.x);

  // Filter links/rechts und alle Punkte dazwischen auch taggen
  //const left = bottomPts.filter(p => p.x < backPt.x).map(p => ({ ...p, tag: window.PointTag.AILERON }));
  //const right = bottomPts.filter(p => p.x > fwdPt.x).map(p => ({ ...p, tag: window.PointTag.AILERON }));
  // Bestehende Punkte links/rechts unverändert übernehmen
  const left = bottomPts.filter(p => p.x < backPt.x);
  const right = bottomPts.filter(p => p.x > fwdPt.x);

  const newBottom = [...left, backPt, apexPt, fwdPt, ...right];

  return [...profilePts.slice(0, half), ...newBottom];
};


window.trimAirfoilFront = function(points, trimLEmm) {
  if (!points || points.length < 2 || trimLEmm <= 0) return points;
  const xMin = Math.min(...points.map(p => p.x));
  const xLimit = xMin + trimLEmm;
  let topPoint = null, bottomPoint = null, topIndex = null, bottomIndex = null;
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].x <= xLimit) {
      topPoint = { ...points[i], x: xLimit };
      topIndex = i;
      break;
    }
  }
  for (let i = 0; i < points.length; i++) {
    if (points[i].x <= xLimit) {
      bottomPoint = { ...points[i], x: xLimit };
      bottomIndex = i;
      break;
    }
  }
  if (!topPoint || !bottomPoint) return points;
  return [...points.slice(0, bottomIndex), bottomPoint, topPoint, ...points.slice(topIndex + 1)];
};

window.trimAirfoilBack = function(points, trimTEmm) {
  if (!points || points.length < 2 || trimTEmm <= 0) return points;
  const xMax = Math.max(...points.map(p => p.x));
  const xLimit = xMax - trimTEmm;
  const interpY = (p1, p2, x) => {
    if (!p1 || !p2 || p1.x === p2.x) return p1 ? p1.y : 0;
    return p1.y + (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x);
  };
  const upper = [];
  let upperDone = false;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.x <= xLimit) upper.push({ ...p });
    if (!upperDone && p.y > 0 && points[i+1]?.x <= xLimit) {
      const yProfile = interpY(points[i+1], p, xLimit);
      upper.push({ x: xLimit, y: points[0].y, tag: "START_POINT" });
      upper.push({ x: xLimit, y: yProfile });
      upperDone = true;
    }
  }
  const lower = [];
  let lowerDone = false;
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    if (!lowerDone && p.y < 0 && points[i-1]?.x <= xLimit) {
      const yProfile = interpY(p, points[i-1], xLimit);
      lower.push({ x: xLimit, y: yProfile });
      lower.push({ x: xLimit, y: points[0].y, tag: "END_POINT" });
      lowerDone = true;
    }
  }
  return [...upper, ...lower];
};

// Funktion: Punkte gleichmäßig entlang der Kurve verteilen (Objekte {x, y})

window.resampleArcLength = function(points, targetLen) {
  if (!points || points.length < 2 || targetLen < 2) return points;

  // 1) kumulative Abstände
  const distances = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    distances.push(distances[i - 1] + Math.hypot(dx, dy));
  }
  const totalLength = distances[distances.length - 1] || 1;

  // 2) Berechne gewünschte Abstände (target distances) für jeden Output-Index
  const targetDistances = new Array(targetLen);
  for (let i = 0; i < targetLen; i++) targetDistances[i] = (i / (targetLen - 1)) * totalLength;

  // 3) Reserviere Slots für getaggte Originalpunkte
  const reserved = new Array(targetLen).fill(null); // reserved[i] = originalIndex oder null
  const used = new Array(targetLen).fill(false);

  // Für jeden Originalpunkt mit Tag -> bestimme gewünschten Slot
  for (let oi = 0; oi < points.length; oi++) {
    const p = points[oi];
    if (!p || !p.tag) continue;
    const d = distances[oi];
    let slot = Math.round((d / totalLength) * (targetLen - 1));
    // in range clampen
    slot = Math.max(0, Math.min(targetLen - 1, slot));

    // Falls belegt, suche den nächsten freien Slot (vorzugsweise nach außen suchen)
    if (!used[slot]) {
      reserved[slot] = oi;
      used[slot] = true;
    } else {
      // Suche nach nächstem freien Slot (links/rechts abwechselnd)
      let offset = 1;
      let placed = false;
      while (!placed) {
        const left = slot - offset;
        const right = slot + offset;
        if (left >= 0 && !used[left]) {
          reserved[left] = oi;
          used[left] = true;
          placed = true;
          break;
        }
        if (right < targetLen && !used[right]) {
          reserved[right] = oi;
          used[right] = true;
          placed = true;
          break;
        }
        offset++;
        if (left < 0 && right >= targetLen) {
          // Kein Platz (sehr unwahrscheinlich) -> abbruch
          placed = true;
          break;
        }
      }
    }
  }

  // 4) Erzeuge Output: für reservierte Slots kopiere exakt den Originalpunkt (inkl. Tag)
  const out = new Array(targetLen).fill(null);

  // Hilfsfunktion: kopiere Originalpunkt (inkl. evtl. z und andere Felder)
  const clonePoint = p => ({ ...p });

  for (let i = 0; i < targetLen; i++) {
    if (reserved[i] !== null) {
      out[i] = clonePoint(points[reserved[i]]);
      continue;
    }
    out[i] = null; // wird später gefüllt per Interpolation
  }

  // 5) Fülle die restlichen Slots per Interpolation entlang des Original-Polylines
  // Wir iterieren die Ziel-Distanzen und finden Segment j mit distances[j] <= s <= distances[j+1]
  let j = 0;
  for (let i = 0; i < targetLen; i++) {
    if (out[i]) continue; // bereits reserviert (tagged)
    const s = targetDistances[i];

    // advance j bis zum Segment passend
    while (j < distances.length - 2 && distances[j + 1] < s) j++;

    const i0 = j;
    const i1 = Math.min(points.length - 1, j + 1);
    const d0 = distances[i0];
    const d1 = distances[i1];

    const segLen = (d1 - d0) || 1;
    const f = (s - d0) / segLen;

    // Linear interpieren und keine Tags setzen
    const p0 = points[i0];
    const p1 = points[i1];

    const x = p0.x * (1 - f) + p1.x * f;
    const y = p0.y * (1 - f) + p1.y * f;

    // Erzeuge Objekt ohne Tag (null)
    out[i] = { x, y, tag: null };
  }

  return out;
};

/*window.resampleDualArcLength = function(innerPts, outerPts, targetLen) {

  function computeDistances(points) {
    const dist = [0];
    for (let i = 1; i < points.length; i++) {
      dist.push(dist[i-1] + Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y));
    }
    return dist;
  }

  function resampleSegment(points, distances, startIdx, endIdx, outStart, outEnd) {
    const out = new Array(outEnd - outStart + 1);
    const d0 = distances[startIdx], d1 = distances[endIdx];
    for (let i = 0; i <= outEnd - outStart; i++) {
      const f = (i / (outEnd - outStart));
      const s = d0*(1-f) + d1*f;
      // Finde das Intervall
      let j = startIdx;
      while (j < endIdx && distances[j+1] < s) j++;
      const localF = (distances[j+1]-distances[j]) === 0 ? 0 : (s - distances[j]) / (distances[j+1]-distances[j]);
      out[i] = {
        x: points[j].x*(1-localF) + points[j+1].x*localF,
        y: points[j].y*(1-localF) + points[j+1].y*localF,
        tag: null
      };
    }
    return out;
  }*/

  /*function resampleWithTags(points, distances, targetLen, tagSlots) {
    const out = new Array(targetLen).fill(null);

    // 1️⃣ Tags setzen
    tagSlots.forEach(t => {
      out[t.slot] = { ...points[t.idx] };
    });

    // 2️⃣ Zwischenräume interpolieren
    let lastTagIdx = 0;
    while (lastTagIdx < targetLen && !out[lastTagIdx]) lastTagIdx++;
    let nextTagIdx = lastTagIdx + 1;
    while (nextTagIdx < targetLen) {
      while (nextTagIdx < targetLen && !out[nextTagIdx]) nextTagIdx++;
      if (nextTagIdx >= targetLen) break;

      const segment = resampleSegment(
        points, distances,
        tagSlots.find(t => t.slot === lastTagIdx).idx,
        tagSlots.find(t => t.slot === nextTagIdx).idx,
        lastTagIdx,
        nextTagIdx
      );
      for (let i = 0; i < segment.length; i++) out[lastTagIdx + i] = segment[i];

      lastTagIdx = nextTagIdx;
      nextTagIdx++;
    }

    // 3️⃣ Falls vorne/hinten noch Lücken, mit Randpunkten auffüllen
    for (let i = 0; i < targetLen && !out[i]; i++) out[i] = { ...points[0], tag:null };
    for (let i = targetLen-1; i >=0 && !out[i]; i--) out[i] = { ...points[points.length-1], tag:null };

    return out;
  }

  const dIn = computeDistances(innerPts);
  const dOut = computeDistances(outerPts);
  const lenIn = dIn[dIn.length-1] || 1;
  const lenOut = dOut[dOut.length-1] || 1;

  // 🎯 Alle Tags sammeln und proportional zur Bogenlänge auf Slot-Index mappen
  const tags = [];
  innerPts.forEach((p,i) => { if(p.tag) tags.push({ from:'inner', idx:i, dist:dIn[i]/lenIn, tag:p.tag }); });
  outerPts.forEach((p,i) => { if(p.tag) tags.push({ from:'outer', idx:i, dist:dOut[i]/lenOut, tag:p.tag }); });

  // 1 Tag pro unique Name
  const uniqueTags = [];
  const seen = new Set();
  tags.forEach(t => {
    if(!seen.has(t.tag)) {
      seen.add(t.tag);
      uniqueTags.push(t);
    }
  });

  const tagSlots = uniqueTags.map(t => {
    let slot = Math.round(t.dist * (targetLen-1));
    return {...t, slot};
  });

// Tag-Slots für beide Profile anhand des Tag-Namens berechnen
const tagSlots = uniqueTags.map(t => {
  let slot = Math.round(t.dist * (targetLen-1));
  return {...t, slot};
});

// Inner & Outer resample mit synchronisierten Tag-Indices
const innerNew = resampleWithTags(innerPts, dIn, targetLen,
    tagSlots.map(t => ({...t, idx: innerPts.findIndex(p => p.tag===t.tag)}))
);
const outerNew = resampleWithTags(outerPts, dOut, targetLen,
    tagSlots.map(t => ({...t, idx: outerPts.findIndex(p => p.tag===t.tag)}))
);


  return { innerNew, outerNew };
};*/

/*window.syncTaggedPointsNoDuplicates = function(innerPts, outerPts) {
  function addPoint(arr, p) {
    const last = arr[arr.length - 1];
    const eps = 1e-8;
    if (!last ||
        Math.abs(last.x - p.x) > eps ||
        Math.abs(last.y - p.y) > eps ||
        last.tag !== p.tag) {
      arr.push(p);
    }
  }

  function interpolateSegment(seg, targetLen, skipLast = false) {
    if (seg.length === 1) return [seg[0]];
    const out = [];
    const len = skipLast ? targetLen - 1 : targetLen;

    for (let i = 0; i < len; i++) {
      const t = targetLen === 1 ? 0 : i / (targetLen - 1);
      const idxF = t * (seg.length - 1);
      const idx0 = Math.floor(idxF);
      const idx1 = Math.min(seg.length - 1, Math.ceil(idxF));
      const f = idxF - idx0;

      const tag = i === 0 ? seg[0].tag :
                  i === len - 1 && skipLast ? null :
                  i === targetLen - 1 ? seg[seg.length - 1].tag : null;

      out.push({
        x: seg[idx0].x * (1 - f) + seg[idx1].x * f,
        y: seg[idx0].y * (1 - f) + seg[idx1].y * f,
        tag: tag
      });
    }
    return out;
  }

  // --- Alle getaggten Indizes sammeln ---
  const innerTags = innerPts.map((p, i) => p.tag ? i : null).filter(i => i !== null);
  const outerTags = outerPts.map((p, i) => p.tag ? i : null).filter(i => i !== null);
  let allTagIndices = Array.from(new Set([...innerTags, ...outerTags]));

  const maxIdx = Math.max(innerPts.length, outerPts.length) - 1;
  if (!allTagIndices.includes(maxIdx)) {
    allTagIndices.push(maxIdx);
  }
  allTagIndices.sort((a, b) => a - b);

  const innerNew = [];
  const outerNew = [];
  let prevTag = 0;

  allTagIndices.forEach((tagIdx, segmentIdx) => {
    const innerSeg = innerPts.slice(prevTag, tagIdx + 1);
    const outerSeg = outerPts.slice(prevTag, tagIdx + 1);
    const n = Math.max(innerSeg.length, outerSeg.length);

    const isLastSegment = segmentIdx === allTagIndices.length - 1;

    // Im letzten Segment: nur bis n-1 interpolieren → kein 97.96-Punkt
    const innerInterp = interpolateSegment(innerSeg, n, isLastSegment);
    const outerInterp = interpolateSegment(outerSeg, n, isLastSegment);

    innerInterp.forEach(p => addPoint(innerNew, p));
    outerInterp.forEach(p => addPoint(outerNew, p));

    prevTag = tagIdx;

    // Nach dem letzten Segment: exakten END_POINT hinzufügen (nur einmal!)
    if (isLastSegment) {
      const endInner = innerPts[innerPts.length - 1];
      const endOuter = outerPts[outerPts.length - 1];
      addPoint(innerNew, endInner);
      addPoint(outerNew, endOuter);
    }
  });

  return { innerNew, outerNew };
};*/

/*window.syncTaggedPointsNoDuplicates = function(innerPts, outerPts) {
  function addPoint(arr, p) {
    const last = arr[arr.length - 1];
    const eps = 1e-8;
    if (!last ||
        Math.abs(last.x - p.x) > eps ||
        Math.abs(last.y - p.y) > eps ||
        last.tag !== p.tag) {
      arr.push(p);
    }
  }

  function interpolateSegment(seg, targetLen, skipLast = false) {
    if (seg.length === 1) return [seg[0]];
    const out = [];
    const len = skipLast ? targetLen - 1 : targetLen;

    for (let i = 0; i < len; i++) {
      const t = i / (targetLen - 1);
      const idxF = t * (seg.length - 1);
      const idx0 = Math.floor(idxF);
      const idx1 = Math.min(seg.length - 1, Math.ceil(idxF));
      const f = idxF - idx0;

      let tag = null;
      if (i === 0) tag = seg[0].tag;
      else if (!skipLast && i === targetLen - 1) tag = seg[seg.length - 1].tag;
      // Im letzten Segment: letzter interpolierter Punkt hat KEIN Tag

      out.push({
        x: seg[idx0].x * (1 - f) + seg[idx1].x * f,
        y: seg[idx0].y * (1 - f) + seg[idx1].y * f,
        tag: tag
      });
    }
    return out;
  }

  // --- Alle getaggten Indizes sammeln ---
  const innerTags = innerPts.map((p, i) => p.tag ? i : null).filter(i => i !== null);
  const outerTags = outerPts.map((p, i) => p.tag ? i : null).filter(i => i !== null);
  let allTagIndices = Array.from(new Set([...innerTags, ...outerTags]));

  const maxIdx = Math.max(innerPts.length, outerPts.length) - 1;
  if (!allTagIndices.includes(maxIdx)) {
    allTagIndices.push(maxIdx);
  }
  allTagIndices.sort((a, b) => a - b);

  const innerNew = [];
  const outerNew = [];
  let prevTag = 0;

  allTagIndices.forEach((tagIdx, segmentIdx) => {
    const innerSeg = innerPts.slice(prevTag, tagIdx + 1);
    const outerSeg = outerPts.slice(prevTag, tagIdx + 1);
    const n = Math.max(innerSeg.length, outerSeg.length);

    const isLastSegment = segmentIdx === allTagIndices.length - 1;

    // Im letzten Segment: skipLast = true → nur n-1 Punkte
    const innerInterp = interpolateSegment(innerSeg, n, isLastSegment);
    const outerInterp = interpolateSegment(outerSeg, n, isLastSegment);

    innerInterp.forEach(p => addPoint(innerNew, p));
    outerInterp.forEach(p => addPoint(outerNew, p));

    prevTag = tagIdx;

    // --- NUR IM LETZTEN SEGMENT: exakten END_POINT hinzufügen ---
    if (isLastSegment) {
      const endInner = innerPts[innerPts.length - 1];
      const endOuter = outerPts[outerPts.length - 1];
      addPoint(innerNew, { ...endInner, tag: 'END_POINT' }); // Sicherstellen, dass Tag da ist
      addPoint(outerNew, { ...endOuter, tag: 'END_POINT' });
    }
  });

  return { innerNew, outerNew };
};*/

window.syncTaggedPointsNoDuplicates = function(innerPts, outerPts) {
  console.log("=== DEBUG SYNC ===");
  console.log("Input: inner=", innerPts.length, "outer=", outerPts.length);

  const POINTS_PER_SEGMENT = 20;

  function addPoint(arr, p) {
    const last = arr[arr.length - 1];
    const eps = 1e-10;
    const duplicate = last &&
      Math.abs(last.x - p.x) < eps &&
      Math.abs(last.y - p.y) < eps;
    if (!duplicate) {
      arr.push(p);
    }
  }

  function interpolateSegment(seg, n, skipLast = false) {
    if (seg.length === 0) return [];
    if (seg.length === 1) {
      return [{ x: seg[0].x, y: seg[0].y, tag: seg[0].tag }];
    }

    const out = [];
    const steps = skipLast ? n : n + 1;

    for (let i = 0; i < steps; i++) {
      const t = i / n;
      const idxF = t * (seg.length - 1);
      const idx0 = Math.floor(idxF);
      const idx1 = Math.min(seg.length - 1, Math.ceil(idxF));
      const f = idxF - idx0;

      let tag = null;
      if (i === 0) tag = seg[0].tag;
      else if (!skipLast && i === n) tag = seg[seg.length - 1].tag;

      const x = seg[idx0].x * (1 - f) + seg[idx1].x * f;
      const y = seg[idx0].y * (1 - f) + seg[idx1].y * f;

      out.push({ x, y, tag });
    }
    return out;
  }

  const innerTags = innerPts.map((p, i) => p.tag ? i : null).filter(Boolean);
  const outerTags = outerPts.map((p, i) => p.tag ? i : null).filter(Boolean);
  let allTagIndices = [...new Set([...innerTags, ...outerTags])];
  const maxIdx = Math.max(innerPts.length - 1, outerPts.length - 1);
  if (!allTagIndices.includes(maxIdx)) allTagIndices.push(maxIdx);
  allTagIndices.sort((a, b) => a - b);

  console.log("Tag indices:", allTagIndices);
  console.log("Segments:", allTagIndices.length);

  const innerNew = [];
  const outerNew = [];
  let prevTag = 0;

  allTagIndices.forEach((tagIdx, segmentIdx) => {
    const innerSeg = innerPts.slice(prevTag, tagIdx + 1);
    const outerSeg = outerPts.slice(prevTag, tagIdx + 1);
    const isLast = segmentIdx === allTagIndices.length - 1;

    const n = isLast ? POINTS_PER_SEGMENT - 1 : POINTS_PER_SEGMENT;

    console.log(`\nSegment ${segmentIdx}: ${prevTag}-${tagIdx} | inner:${innerSeg.length} outer:${outerSeg.length} → n=${n} | last=${isLast}`);

    const innerInterp = interpolateSegment(innerSeg, n, isLast);
    const outerInterp = interpolateSegment(outerSeg, n, isLast);

    innerInterp.forEach(p => addPoint(innerNew, p));
    outerInterp.forEach(p => addPoint(outerNew, p));

    if (isLast) {
      const endInner = innerPts[innerPts.length - 1];
      const endOuter = outerPts[outerPts.length - 1];
      console.log(`  Füge END_POINT hinzu:`);
      addPoint(innerNew, { ...endInner, tag: 'END_POINT' });
      addPoint(outerNew, { ...endOuter, tag: 'END_POINT' });
    }

    prevTag = tagIdx;
  });

  // ---------- Neuer Code: gleiche Länge, dabei Tags erhalten ----------
  function removeUntaggedFromEnd(arr, count) {
    // entfernt bis zu `count` Elemente vom Ende, aber niemals ein Element mit tag (truthy)
    let removed = 0;
    while (removed < count && arr.length > 0) {
      // suche von hinten das erste Element ohne tag
      let i = arr.length - 1;
      while (i >= 0 && arr[i].tag) i--;
      if (i < 0) break; // kein ungetaggtes Element mehr
      // entferne genau das Element an Index i (nicht nur das letzte), um tags zu behalten
      arr.splice(i, 1);
      removed++;
    }
    return removed;
  }

  function padByDuplicatingEnd(arr, targetLength) {
    if (arr.length === 0) return; // nichts zu duplizieren
    const last = arr[arr.length - 1];
    while (arr.length < targetLength) {
      // Dupliziere das letzte Element (inkl. tag), um tags nicht zu verlieren
      arr.push({ ...last });
    }
  }

  // gleiche Länge anstreben, aber Tags nicht entfernen
  let lenInner = innerNew.length;
  let lenOuter = outerNew.length;

  if (lenInner !== lenOuter) {
    console.warn(`⚠️ Punktanzahl mismatch vor Anpassung (inner=${lenInner}, outer=${lenOuter})`);

    if (lenInner > lenOuter) {
      const diff = lenInner - lenOuter;
      const removed = removeUntaggedFromEnd(innerNew, diff);
      if (removed < diff) {
        // konnten nicht genug ungetaggte Punkte entfernen → pad outer
        const need = diff - removed;
        console.warn(`Konnte nur ${removed}/${diff} ungetaggte Punkte aus inner entfernen. Auffüllen von outer um ${need} Punkt(e).`);
        padByDuplicatingEnd(outerNew, outerNew.length + need);
      }
    } else { // outer länger
      const diff = lenOuter - lenInner;
      const removed = removeUntaggedFromEnd(outerNew, diff);
      if (removed < diff) {
        const need = diff - removed;
        console.warn(`Konnte nur ${removed}/${diff} ungetaggte Punkte aus outer entfernen. Auffüllen von inner um ${need} Punkt(e).`);
        padByDuplicatingEnd(innerNew, innerNew.length + need);
      }
    }
  }

  // letzte Sicherheitsanpassung (falls durch Rundungen noch minimal Unterschied)
  const finalMin = Math.min(innerNew.length, outerNew.length);
  innerNew.length = finalMin;
  outerNew.length = finalMin;

  console.log("\n=== FINAL ===");
  console.log("Output: inner=", innerNew.length, "outer=", outerNew.length);
  console.log("✅ Punktanzahl identisch (Tags wurden erhalten)");

  return { innerNew, outerNew };
};





