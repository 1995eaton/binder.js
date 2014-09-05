#What is Binder?

Binder is a JavaScript library that makes it easy to add keyboard mapping to
your web page or web app. If you've used the `keydown` and `keypress` event listeners in
JavaScript before, you've probably noticed how difficult it is to get them to
play nice together. For example, the `keypress` listener will allow you to get
'normal' key presses, or keyboard presses that will appear in a text box (like 'abcdef...'). The
`keypress` listener does not, however, listen for non-text keyboard presses
such as the escape key or the backspace key. If you use the `keydown` listener,
you can listen for these keys, but you cannot reliably obtain pressed characters from
their key codes like you can with the `keypress` listener. Binder bundles both of
these listeners into a single module, allowing you to both easily and reliably map
keyboard bindings to specific callback functions.

#How are non-text keys mapped

Binder uses Vim-like mappings. For example, the escape key is `<Escape>`, the space key is
`<Space>`, and the left key is `<Left>`.

#How do I call event.preventDefault() through binder?

Binder passes the event parameter to its callback functions when they are called.
You can call `preventDefault` like this:

```javascript
var binder = Binder();
binder.bind('<Down>', function(event) {
  event.preventDefault();
  console.log('The default browser action for the down key was prevented');
});
```

#Examples

```javascript
var binder = Binder();

// Mapping a single key
binder.bind('<Down>', function() {
  console.log('Down was pressed');
});
binder.bind('<C-S-f>', function() {
  console.log('Ctrl+Shift+f was pressed');
});

// Mapping a sequence of keys
binder.bind('<Up><Up><Down><Down>', function() {});

// Adding a default callback listener
binder.setCallback(function(code) {
  console.log(code + ' was pressed');
});

// Activate binder
binder.activate();

// Deactivate binder
binder.deactivate();

// Clear all bindings
binder.bindings().length = 0;
```
