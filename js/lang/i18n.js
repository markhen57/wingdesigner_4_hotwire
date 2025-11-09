window.i18n = {
  lang: {},

  init: function() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith("de")) this.lang = window.langDE || {};
    else this.lang = window.langEN || {};
  },

  setLang: function(langCode) {
    if (langCode === "de") this.lang = window.langDE || {};
    else this.lang = window.langEN || {};

    // Event auslösen, damit React-Komponenten sich aktualisieren
    window.dispatchEvent(new Event('i18n-change'));
  },

  _: function(key) {
    return this.lang[key] || key;
  }
};

window._ = function(key) { return window.i18n._(key); };
window.i18n.init();
