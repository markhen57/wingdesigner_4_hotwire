// js/components/LeftPanel.jsx

// Wir legen die Komponente global an:
window.LeftPanel = function LeftPanel(props) {
  const { 
    cameraPosRef, cameraTargetRef,
    innerDAT, outerDAT, innerName, outerName, handleFile,
    span, setSpan, profilePointsCount, setProfilePointsCount,
    innerColor, setInnerColor, innerScale, setInnerScale, thicknessScaleInner, setThicknessScaleInner, rotationInner, setRotationInner,
    outerColor, setOuterColor, outerScale, setOuterScale, thicknessScaleOuter, setThicknessScaleOuter, rotationOuter, setRotationOuter,
    outerVerticalOffset, setOuterVerticalOffset, outerChordOffset, setOuterChordOffset,
    holes, setHoles, ailerons, setAilerons, trimEnabled, setTrimEnabled, trimLEmm, setTrimLEmm, trimTEmm, setTrimTEmm,
    activeTab, setActiveTab, debugOpen, setDebugOpen, debugPoints
  } = props;

  return (
    <div style={{ flex: '0 0 500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 12, background: '#f7f7f7', padding: 8, border: '1px solid #ccc' }}>
        <b>Kamera:</b> {cameraPosRef.current.x.toFixed(1)}, {cameraPosRef.current.y.toFixed(1)}, {cameraPosRef.current.z.toFixed(1)}<br/>
        <b>Ziel:</b> {cameraTargetRef.current.x.toFixed(1)}, {cameraTargetRef.current.y.toFixed(1)}, {cameraTargetRef.current.z.toFixed(1)}
      </div>

      <label>Inner DAT <input type="file" accept=".dat" onChange={e => handleFile(e, props.setInnerDAT, props.setInnerName)} /> {innerName}</label>
      <label>Outer DAT <input type="file" accept=".dat" onChange={e => handleFile(e, props.setOuterDAT, props.setOuterName)} /> {outerName}</label>

      <label>Spannweite (mm)
        <input type="range" min="10" max="3000" value={span} onChange={e => setSpan(Number(e.target.value))} />
        <input type="number" value={span} onChange={e => setSpan(Number(e.target.value))} />
      </label>

      <label>
        Anzahl Punkte pro Profil
        <input type="number" value={profilePointsCount} min="10" max="1000" onChange={e => setProfilePointsCount(Number(e.target.value))} />
        <input type="range" min="10" max="1000" step="1" value={profilePointsCount} onChange={e => setProfilePointsCount(Number(e.target.value))} />
      </label>

      <ProfileBox title="Inner Profil" color={innerColor} isActive={activeTab === 'inner'} onToggle={() => setActiveTab(activeTab === 'inner' ? null : 'inner')}>
        <label>Farbe <input type="color" value={innerColor} onChange={e => setInnerColor(e.target.value)} /></label>

        <label>Länge (mm)
          <input type="number" value={innerScale} onChange={e => setInnerScale(Number(e.target.value))} />
          <input type="range" min="10" max="1000" value={innerScale} onChange={e => setInnerScale(Number(e.target.value))} />
        </label>

        <label>Dicke
          <input type="number" step="0.01" min="0.5" max="1.5" value={thicknessScaleInner} onChange={e => setThicknessScaleInner(Number(e.target.value))} />
          <input type="range" min="0.5" max="1.5" step="0.01" value={thicknessScaleInner} onChange={e => setThicknessScaleInner(Number(e.target.value))} />
        </label>

        <label>Rotation (°)
          <input type="number" step="1" min="-25" max="25" value={rotationInner * 180 / Math.PI} onChange={e => setRotationInner(Number(e.target.value) * Math.PI / 180)} />
          <input type="range" min="-25" max="25" value={rotationInner * 180 / Math.PI} onChange={e => setRotationInner(e.target.value * Math.PI / 180)} />
        </label>
      </ProfileBox>

      <ProfileBox title="Outer Profil" color={outerColor} isActive={activeTab === 'outer'} onToggle={() => setActiveTab(activeTab === 'outer' ? null : 'outer')}>
        <label>Farbe <input type="color" value={outerColor} onChange={e => setOuterColor(e.target.value)} /></label>

        <label>Länge (mm)
          <input type="number" value={outerScale} onChange={e => setOuterScale(Number(e.target.value))} />
          <input type="range" min="10" max="1000" value={outerScale} onChange={e => setOuterScale(Number(e.target.value))} />
        </label>

        <label>Dicke
          <input type="number" step="0.01" min="0.5" max="1.5" value={thicknessScaleOuter} onChange={e => setThicknessScaleOuter(Number(e.target.value))} />
          <input type="range" min="0.5" max="1.5" step="0.01" value={thicknessScaleOuter} onChange={e => setThicknessScaleOuter(Number(e.target.value))} />
        </label>

        <label>Rotation (°)
          <input type="number" step="1" min="-25" max="25" value={rotationOuter * 180 / Math.PI} onChange={e => setRotationOuter(Number(e.target.value) * Math.PI / 180)} />
          <input type="range" min="-25" max="25" value={rotationOuter * 180 / Math.PI} onChange={e => setRotationOuter(e.target.value * Math.PI / 180)} />
        </label>

        <label>Vertikal (mm)
          <input type="number" value={outerVerticalOffset} onChange={e => setOuterVerticalOffset(Number(e.target.value))} />
          <input type="range" min="-500" max="500" value={outerVerticalOffset} onChange={e => setOuterVerticalOffset(Number(e.target.value))} />
        </label>

        <label>Chord (mm)
          <input type="number" value={outerChordOffset} onChange={e => setOuterChordOffset(Number(e.target.value))} />
          <input type="range" min="-1000" max="1000" value={outerChordOffset} onChange={e => setOuterChordOffset(Number(e.target.value))} />
        </label>
      </ProfileBox>

      <HolesSection holes={holes} setHoles={setHoles} isActive={activeTab === 'holes'} onToggle={() => setActiveTab(activeTab === 'holes' ? null : 'holes')} />
      <AileronsSection ailerons={ailerons} setAilerons={setAilerons} isActive={activeTab === 'ailerons'} onToggle={() => setActiveTab(activeTab === 'ailerons' ? null : 'ailerons')} />
      <TrimSection
        trimEnabled={trimEnabled} setTrimEnabled={setTrimEnabled}
        trimLEmm={trimLEmm} setTrimLEmm={setTrimLEmm}
        trimTEmm={trimTEmm} setTrimTEmm={setTrimTEmm}
        isActive={activeTab === 'trim'} onToggle={() => setActiveTab(activeTab === 'trim' ? null : 'trim')}
      />
      <DebugSection debugPoints={debugPoints} innerName={innerName} outerName={outerName} isOpen={debugOpen} onToggle={() => setDebugOpen(!debugOpen)} />
    </div>
  );
};
