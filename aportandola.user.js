// ==UserScript==
// @name         Aportando.la
// @namespace    http://platzi.com/
// @version      0.1
// @description  Mejora el editor de aportes de Platzi en los cursos
// @author       David Sánchez
// @match        https://platzi.com/clases/*
// ==/UserScript==

(function() {
  'use strict';

  const ui = {
    buildButton: function () {
      const newButton = document.createElement('button');
      newButton.type = 'button';
      newButton.classList.add('PulseEditor-button');
      return newButton;
    },
    buildDivider: function () {
      const newDivider = document.createElement('div');
      newDivider.classList.add('PulseEditor-divider');
      return newDivider;
    },
    menuBar: function () {
      return document.querySelector('.Pulseeditor-toolbar-left');
    },
    editorInput: function () {
      return document.querySelector('.EditorWrapper-input');
    },
    editorInputClose: function () {
      return document.querySelector('.EditorWrapper-form-close');
    },
    appendMenuButton: function (menuButton) {
      this.menuBar().appendChild(menuButton);
    },
  };

  const onEditorShow = function (cb) {
    ui.editorInput().addEventListener('click', () => {
      setTimeout(cb);
    }, { passive: true, once: true });
  }

  const onEditorHide = function (cb) {
    ui.editorInputClose().addEventListener('click', () => {
      setTimeout(cb);
    }, { passive: true, once: true });
  }

  const buildMenuBar = function () {
    onEditorShow(() => {
      onEditorHide(buildMenuBar);
    });
  }

  buildMenuBar();
})();
