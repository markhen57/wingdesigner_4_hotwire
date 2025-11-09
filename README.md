# WingDesigner 4 Hotwire

**WingDesigner 4 Hotwire** is a web-based tool for designing and planning foam or Styrofoam wing components for FPV wing models, optimized for hotwire cutting. It supports full export/import of build and machine parameters.

Use it: https://hotwireairfoil.coolpixx.de

## 🎯 Key Features

- Input wing profiles (e.g., `.dat` files) for inner and outer sections.
- Define wingspan, sweep, control surfaces (ailerons, flaps), holes, and other wing parameters.
- Input machine parameters: axis names (X, Y, Z, A), axis dimensions (`axisXmm`, `axisYmm`), hotwire length, cutting speed, feed limits (`fMax`, `fMin`), and hotwire power.
- Specify foam block dimensions (`foamLength`, `foamWidth`, `foamHeight`).
- Export options:
  - Full project export (`wing_project.json`)
  - Machine + foam only (`machine_foam.json`)
  - Profile data only (`profile_data.json`)
- Import JSON files to restore or share project setups, including machine, profile, and foam data.
- Modern web interface using React for intuitive parameter management.

## 🚀 Target Users

This tool is ideal for:

- Model builders and FPV wing enthusiasts using hotwire cutting on Styrofoam or PU foam.
- Makers operating small CNC hotwire machines who need simple planning of cut elements including machine parameters.
- Projects requiring parametrization, reproducibility, and documentation of project setups.

## 🧩 Technology & Structure

- **Frontend**: React components (e.g., `ExportImportSection.jsx`) for parameter handling and UI.
- **Data format**: JSON-based export/import with sections for `machine`, `wing`, `profil`, and `foam`.
- **HTML/JS setup**: Includes libraries like Three.js for 3D visualization.
- Simple to use: open HTML in a browser, set parameters, export/import JSON.

## 🛠️ If You Want to Develop

- Clone the repository.
- Open the HTML/JS file in a browser or run a local web server (e.g., `http-server`).
- Set machine, wing, and foam parameters in the GUI.
- Load profile `.dat` files.
- Export project or import an existing JSON file.
- Use exported files for machine configuration or sharing.

## 📝 Notes & Tips

- Ensure `.dat` files are correctly formatted (coordinate points).
- Import overwrites current parameters—backup if necessary.
- Machine parameters must match your physical CNC hotwire setup.
- Full project export includes machine, wing, profile, and foam data.
- The tool is extendable for new wing types or features (React components, JS data model).

## 🔧 Future Development

- Visualization of cross-sections or 3D wing models using Three.js.
- Automatic G-code or hotwire path generation.
- Parameter validation (e.g., axis limits) to prevent errors.
- Community contributions via Pull Requests, Issues, or feature requests are welcome.

## 📜 License

Please see the [LICENSE.md](LICENSE.md) file for license details. Usage is subject to the license terms.
