// js/components/ExportImportSection.jsx
const ExportImportSection = ({ 
  xName, setXName, yName, setYName, zName, setZName, aName, setAName,
  axisXmm, setAxisXmm, axisYmm, setAxisYmm,
  hotwireLength, setHotwireLength, speed, setSpeed, fMax, setFMax, fMin, setFMin, hotWirePower, setHotWirePower,
  innerName, setInnerName, innerColor, setInnerColor, innerScale, setInnerScale, thicknessScaleInner, setThicknessScaleInner, rotationInner, setRotationInner,
  outerName, setOuterName, outerColor, setOuterColor, outerScale, setOuterScale, thicknessScaleOuter, setThicknessScaleOuter, rotationOuter, setRotationOuter,
  outerVerticalOffset, setOuterVerticalOffset, outerChordOffset, setOuterChordOffset,
  span, setSpan, trimEnabled, setTrimEnabled, trimLEmm, setTrimLEmm, trimTEmm, setTrimTEmm,
  foamLength, setFoamLength, foamWidth, setFoamWidth, foamHeight, setFoamHeight,
  holes, setHoles, ailerons, setAilerons,
  isOpen, onToggle
}) => {

  const exportData = () => {
    const data = {
      machine: { xName, yName, zName, aName, axisXmm, axisYmm, hotwireLength, speed, fMax, fMin, hotWirePower },
      wing: { innerName, innerColor, innerScale, thicknessScaleInner, rotationInner, outerName, outerColor, outerScale, thicknessScaleOuter, rotationOuter, outerVerticalOffset, outerChordOffset, span, trimEnabled, trimLEmm, trimTEmm, holes, ailerons },
      foam: { foamLength, foamWidth, foamHeight }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wing_project.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.machine) {
          setXName(data.machine.xName);
          setYName(data.machine.yName);
          setZName(data.machine.zName);
          setAName(data.machine.aName);
          setAxisXmm(data.machine.axisXmm);
          setAxisYmm(data.machine.axisYmm);
          setHotwireLength(data.machine.hotwireLength);
          setSpeed(data.machine.speed);
          setFMax(data.machine.fMax);
          setFMin(data.machine.fMin);
          setHotWirePower(data.machine.hotWirePower);
        }
        if (data.wing) {
          setInnerName(data.wing.innerName);
          setInnerColor(data.wing.innerColor);
          setInnerScale(data.wing.innerScale);
          setThicknessScaleInner(data.wing.thicknessScaleInner);
          setRotationInner(data.wing.rotationInner);

          setOuterName(data.wing.outerName);
          setOuterColor(data.wing.outerColor);
          setOuterScale(data.wing.outerScale);
          setThicknessScaleOuter(data.wing.thicknessScaleOuter);
          setRotationOuter(data.wing.rotationOuter);
          setOuterVerticalOffset(data.wing.outerVerticalOffset);
          setOuterChordOffset(data.wing.outerChordOffset);

          setSpan(data.wing.span);
          setTrimEnabled(data.wing.trimEnabled);
          setTrimLEmm(data.wing.trimLEmm);
          setTrimTEmm(data.wing.trimTEmm);
          setHoles(data.holes || []);
          setAilerons(data.ailerons || []);
        }
        if (data.foam) {
          setFoamLength(data.foam.foamLength);
          setFoamWidth(data.foam.foamWidth);
          setFoamHeight(data.foam.foamHeight);
        }
      } catch (e) {
        alert('Ungültige JSON-Datei');
      }
    };
    reader.readAsText(file);
  };

  return (
    <ProfileBox title="Export / Import" color="#000" isActive={isOpen} onToggle={onToggle}>
      <button onClick={exportData}>Export JSON</button>
      <input type="file" accept=".json" onChange={importData} />
    </ProfileBox>
  );
};
