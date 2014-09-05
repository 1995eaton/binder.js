var Binder = function(callback) {

  'use strict';

  var codeMap = {
    0:   '\\',
    8:   'bs',
    9:   'tab',
    12:  'num',
    13:  'enter',
    19:  'pause',
    20:  'caps',
    27:  'esc',
    32:  'space',
    33:  'pageup',
    34:  'pagedown',
    35:  'end',
    36:  'home',
    37:  'left',
    38:  'up',
    39:  'right',
    40:  'down',
    42:  'printscreen',
    44:  'printscreen',
    45:  'insert',
    46:  'delete',
    48:  ['0', ')'],
    49:  ['1', '!'],
    50:  ['2', '@'],
    51:  ['3', '#'],
    52:  ['4', '$'],
    53:  ['5', '%'],
    54:  ['6', '^'],
    55:  ['7', '&'],
    56:  ['8', '*'],
    57:  ['9', '('],
    96:  '0',
    97:  '1',
    98:  '2',
    99:  '3',
    100: '4',
    101: '5',
    102: '6',
    103: '7',
    104: '8',
    105: ['9', ''],
    106: '*',
    107: '+',
    109: '-',
    111: '/',
    144: 'num',
    186: [';', ':'],
    188: [',', '<'],
    189: ['-', '_'],
    190: ['.', '>'],
    187: ['=', '+'],
    191: ['/', '?'],
    192: ['`', '~'],
    219: ['[', '{'],
    221: [']', '}'],
    220: ['\\', '|'],
    222: ['\'', '"']
  };

  var keyBindings = {};
  var keyQueue = '';

  var parseKeyDown = function(event) {
    var key, map;
    var modifiers = [
      event.ctrlKey  ? 'c' : '',
      event.altKey   ? 'a' : '',
      event.metaKey  ? 'm' : '',
      event.shiftKey ? 's' : ''
    ].join('').split('');
    if (codeMap.hasOwnProperty(event.which.toString())) {
      map = codeMap[event.which.toString()];
      if (Array.isArray(map)) {
        if (!modifiers.length) {
          modifiers.splice(modifiers.indexOf('s'), 1);
        }
        key = map[+(event.shiftKey && !modifiers.length)];
      } else {
        key = map;
      }
    } else if (/^F[0-9]+$/.test(event.keyIdentifier)) {
      key = event.keyIdentifier.toLowerCase();
    } else {
      key = String.fromCharCode(event.which).toLowerCase();
      if (event.shiftKey && !modifiers.length) {
        key = key.toUpperCase();
      }
    }
    modifiers = modifiers.filter(function(e) { return e; });
    if (modifiers.length && modifiers.length) {
      return '<' + modifiers.join('-') + '-' + key + '>';
    }
    if (typeof codeMap[event.which.toString()] === 'string') {
      return '<' + (event.shiftKey ? 's-' : '') + key + '>';
    }
    return key;
  };

  var normalizeKeySequence = function(sequence) {
    return sequence.replace(/<[^>]+>/g, function(e) {
      return e.toLowerCase();
    }).replace(/<([a-z]+-)+/g, function(e) {
      return '<' + e.slice(1).split('-').sort().join('') + '-';
    });
  };

  var callSequenceFunctions = function(code, event) {
    keyQueue += code;
    var matchingSequence = false;
    var nqueue = normalizeKeySequence(keyQueue);
    for (var key in keyBindings) {
      var nkey = normalizeKeySequence(key);
      if (nkey === nqueue) {
        keyQueue = '';
        return keyBindings[key](event);
      }
      if (nkey.indexOf(nqueue) === 0) {
        matchingSequence = true;
      }
    }
    if (!matchingSequence) {
      keyQueue = '';
    }
  };

  var KeyEvents = {

    keypress: function(callback, event) {
      if (typeof callback === 'function') {
        callback(event);
      }
    },

    keyhandle: function(event, type) {
      if (type === 'keypress') {
        // ascii representation of keycode
        return String.fromCharCode(event.which);
      } else {
        // Vim-like representation
        return parseKeyDown(event);
      }
    },

    keydown: function(callback, event) {

      var code;
      // Modifier keys C-A-S-M
      if ([16,17,18,91].indexOf(event.which) !== -1) {
        return true;
      }

      // Don't let the keypress listener attempt to parse the key event
      // if it contains a modifier (or is <Return>)
      if (event.which === 13 || event.ctrlKey || event.metaKey || event.altKey) {
        code = KeyEvents.keyhandle(event, 'keydown');
        callSequenceFunctions(code, event);
        return callback(code, event);
      }

      // Create a temporary keypress listener to check if a keycode contains an
      // ascii-representable character
      var keypressTriggered = false;
      var boundMethod = KeyEvents.keypress.bind(KeyEvents, function(event) {
        if (!keypressTriggered) {
          // found a matching character...
          // use it if the setTimeout function below hasn't already timed out
          keypressTriggered = true;
          code = KeyEvents.keyhandle(event, 'keypress');
          callSequenceFunctions(code, event);
          callback(code, event);
        }
      });
      window.addEventListener('keypress', boundMethod, true);
      // Wait for the keypress listener to find a match
      window.setTimeout(function() {
        window.removeEventListener('keypress', boundMethod, true);
        if (!keypressTriggered) { // keypress match wasn't found
          code = KeyEvents.keyhandle(event, 'keydown');
          callSequenceFunctions(code, event);
          callback(code, event);
        }
      }, 0);

    }

  };

  callback = callback || function() {};
  var eventFN = KeyEvents.keydown.bind(null, callback);
  var isActive = false;

  var _ = {
    activate: function() {
      if (!isActive) {
        isActive = true;
        window.addEventListener('keydown', eventFN, true);
      }
    },
    deactivate: function() {
      if (isActive) {
        isActive = false;
        window.removeEventListener('keydown', eventFN, true);
      }
    },
    setCallback: function(_callback) {
      callback = _callback;
      if (isActive) {
        _.deactivate();
      }
      eventFN = KeyEvents.keydown.bind(null, callback);
      if (isActive) {
        _.activate();
      }
    },
    bindings: function() {
      return keyBindings;
    },
    bind: function(sequence, callback) {
      if (typeof callback === 'function') {
        keyBindings[normalizeKeySequence(sequence)] = callback;
      }
    }
  };
  return _;

};
