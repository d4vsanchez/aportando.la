// ==UserScript==
// @name         Aportando.la
// @namespace    http://platzi.com/
// @version      0.1
// @description  Mejora el editor de aportes de Platzi en los cursos
// @author       David Sánchez
// @match        https://platzi.com/clases/*
// @require      https://kit.fontawesome.com/ee48b15041.js
// ==/UserScript==

(function() {
  'use strict';

  const lib = {
    style: function (selector, rules) {
      const styleTag = document.createElement('style');
      styleTag.textContent = `${selector} { ${rules.join(';')} }`;
      document.getElementsByTagName('head')[0].appendChild(styleTag);
    },
    getCookies: function () {
      const cookies = decodeURIComponent(document.cookie);

      return cookies.split('; ').reduce((result, cookie) => {
        const [name, value] = cookie.split('=');
        return { ...result, [name]: value };
      }, {});
    },
    getCsrfToken: function () {
      return this.getCookies().csrftoken;
    },
    getSelectedText: function (editor) {
      return editor.value.substring(editor.selectionStart, editor.selectionEnd);
    },
    appendTextEditor: function (text) {
      let addedText = text;
      const textEditor = ui.editor();
      const selectedText = this.getSelectedText(textEditor);

      const hasPlaceholder = text.indexOf(this.markdown.placeholder) >= 0;
      const boundaries = text.split(this.markdown.placeholder);

      if (hasPlaceholder) {
        const startBoundary = boundaries[0] || '';
        const endBoundary = boundaries[1] || '';
        addedText = `${startBoundary}${selectedText}${endBoundary}`;
      }

      textEditor.setRangeText(addedText);
      textEditor.focus();
      textEditor.selectionEnd = textEditor.selectionStart + selectedText.length + (boundaries[0].length || 0);
      textEditor.selectionStart = textEditor.selectionEnd;
    },
    markdown: {
      placeholder: '{{placeholder}}',
      image: function (imageName, imagePath) {
        return `![${imageName}](${imagePath})`;
      },
      horizontalLine: function () {
        return `\n---`;
      },
      strikethrough: function () {
        return `~~${this.placeholder}~~`;
      }
    }
  }

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
      return document.querySelector('.PulseEditor-toolbar-left');
    },
    editor: function () {
      return document.querySelector('textarea.PulseEditor-field');
    },
    editorInput: function () {
      return document.querySelector('.EditorWrapper-input');
    },
    editorInputClose: function () {
      return document.querySelector('.EditorWrapper-form-close');
    },
    getOriginalButton: function (buttonName) {
      return document.querySelector(`.PulseEditor-button[name=${buttonName}]`);
    },
    appendMenuButton: function (menuButton) {
      this.menuBar().appendChild(menuButton);
    },
    removeMenuButton: function (element) {
      element.remove();
    }
  };

  const api = {
    inProgress: 0,
    call: function (method, url, body) {
      return fetch(url, {
        method: method,
        body: body,
        credentials: 'same-origin',
        headers: {
          'x-csrftoken': lib.getCsrfToken(),
        }
      }).then(
        response => response.json()
      );
    },
    uploadImage: function (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);

      return this.call('post', '/upload_images/', formData);
    }
  }

  const styles = {
    '.aportandola-upload_image': [
      'opacity: 0',
      'position: absolute',
      'top: 0',
      'bottom: 0',
      'right: 0',
      'left: 0',
    ],
    '.PulseEditor-button': [
      'position: relative',
      'overflow: hidden',
    ]
  }

  for (const selector in styles) {
    lib.style(selector, styles[selector]);
  }

  // #region Menu bar icons

  const renderImageButton = function () {
    const imageButton = ui.buildButton();
    imageButton.innerHTML = `
      <i class="far fa-file-image"></i>
      <input type="file" class="aportandola-upload_image" />
    `;

    const fileInput = imageButton.querySelector('.aportandola-upload_image');
    fileInput.addEventListener('change', function (event) {
      const selectedFile = event.target.files[0];
      if (!selectedFile) return;

      api.uploadImage(selectedFile).then((response) => {
        const markdownText = lib.markdown.image(selectedFile.name, response.path);
        lib.appendTextEditor(markdownText);
      });
    });

    ui.appendMenuButton(imageButton);
    ui.removeMenuButton(ui.getOriginalButton('image'));
  }

  const renderHorizontalRuleButton = function () {
    const horizontalRuleButton = ui.buildButton();
    horizontalRuleButton.innerHTML = `<i class="fa fa-ruler-horizontal"></i>`;
    horizontalRuleButton.addEventListener('click', function () {
      lib.appendTextEditor(lib.markdown.horizontalLine());
    }, { passive: true });

    ui.appendMenuButton(horizontalRuleButton);
  }

  const renderStrikethroughButton = function () {
    const striketroughButton = ui.buildButton();
    striketroughButton.innerHTML = `<i class="fa fa-strikethrough"></i>`;
    striketroughButton.addEventListener('click', function () {
      lib.appendTextEditor(lib.markdown.strikethrough());
    });

    ui.appendMenuButton(striketroughButton);
  }

  // #endregion

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
      renderImageButton();
      renderHorizontalRuleButton();
      renderStrikethroughButton();

      onEditorHide(buildMenuBar);
    });
  }

  buildMenuBar();
})();
