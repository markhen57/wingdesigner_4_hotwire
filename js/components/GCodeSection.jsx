// js/components/GCodeSection.jsx
window.GCodeSection = function GCodeSection(props) {
  // Babel-sichere Übersetzung
  var t = function(key) {
    if (window.i18n && typeof window.i18n._ === 'function') {
      return window.i18n._(key);
    }
    return key;
  };

  var gcode = props.gcode;
  var title = props.title || t('gcodeSection');
  var isOpen = props.isOpen;
  var onToggle = props.onToggle;
  var fileName = props.fileName || "program.nc";

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

  // Key mit Sprache → zwingt React, alles neu zu bauen
  var uniqueKey = 'gcode-' + langVersion;

  var saveFile = function() {
    var blob = new Blob([gcode], { type: "text/plain;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <ProfileBox title={title} color="#000" isActive={isOpen} onToggle={onToggle} key={uniqueKey}>
    <button onClick={saveFile}>{t('save')}</button>
    <div style={{display:'flex', gap:16, fontSize:12, fontFamily:'monospace', whiteSpace:'pre', overflow:'auto', maxHeight:200}}><div>{gcode}</div></div>
  </ProfileBox>;
};
