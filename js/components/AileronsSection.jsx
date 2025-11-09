// js/components/AileronsSection.jsx
window.AileronsSection = function AileronsSection(props) {
  // Babel-sichere Übersetzung
  var t = function(key) {
    if (window.i18n && typeof window.i18n._ === 'function') {
      return window.i18n._(key);
    }
    return key;
  };

  var ailerons = props.ailerons;
  var setAilerons = props.setAilerons;
  var isActive = props.isActive;
  var onToggle = props.onToggle;

  // WICHTIG: Reagiere auf Sprachwechsel!
  var langVersion = props.langVersion || 0;
  var forceUpdate = React.useReducer(function(x) { return x + 1; }, 0)[1];

  React.useEffect(function() {
    var handler = function() {
      forceUpdate(); // zwingt komplettes Re-Render
    };
    window.addEventListener('i18n-change', handler);
    return function() {
      window.removeEventListener('i18n-change', handler);
    };
  }, []);

  // Key mit Sprache + Anzahl → zwingt React, alles neu zu bauen
  var uniqueKey = 'ailerons-' + langVersion + '-' + ailerons.length;

  return (
    <ProfileBox 
      title={t('aileronsSection')} 
      color="#000" 
      isActive={isActive} 
      onToggle={onToggle}
      key={uniqueKey}
    >
      {ailerons.map((a, idx) => (
        <div key={idx} style={{ border: '1px solid #aaa', marginBottom: 6, padding: 4 }}>
          <label>{t('thicknessTop')} (mm)
            <input type="number" min="0" step="0.1" value={a.thicknessTop} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].thicknessTop = Number(e.target.value);
              setAilerons(newAilerons);
            }} />
          </label>
          <label>{t('positionFromRear')} (%)
            <input type="range" min="0" max="1" step="0.01" value={a.xPercent} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].xPercent = parseFloat(e.target.value);
              setAilerons(newAilerons);
            }} />
            <input type="number" min="0" max="1" step="0.01" value={a.xPercent} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].xPercent = parseFloat(e.target.value);
              setAilerons(newAilerons);
            }} />
          </label>
          <label>{t('frontAngle')} (°)
            <input type="range" min="0" max="60" step="1" value={a.frontAngleDeg} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].frontAngleDeg = Number(e.target.value);
              setAilerons(newAilerons);
            }} />
            <input type="number" min="0" max="60" step="1" value={a.frontAngleDeg} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].frontAngleDeg = Number(e.target.value);
              setAilerons(newAilerons);
            }} />
          </label>
          <label>{t('rearAngle')} (°)
            <input type="range" min="0" max="60" step="1" value={a.rearAngleDeg} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].rearAngleDeg = Number(e.target.value);
              setAilerons(newAilerons);
            }} />
            <input type="number" min="0" max="60" step="1" value={a.rearAngleDeg} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].rearAngleDeg = Number(e.target.value);
              setAilerons(newAilerons);
            }} />
          </label>
          <button onClick={() => setAilerons(ailerons.filter((_, i) => i !== idx))}>
            {t('delete')}
          </button>
        </div>
      ))}
      <button onClick={() => setAilerons([...ailerons, { thicknessTop: 2, xPercent: 0.7, frontAngleDeg: 15, rearAngleDeg: 15 }])}>
        {t('addAileron')}
      </button>
    </ProfileBox>
  );
};