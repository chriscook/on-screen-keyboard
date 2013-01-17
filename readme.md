On Screen Keyboard
=============

Version 1.0.1
-----------

### Introduction

__On Screen Keyboard__ is a _jQuery_ plug-in which allows a fluid-width keyboard to be launched when the user clicks on an element.

### Demo

A demo is available [here](http://chriscook.github.com/on-screen-keyboard/).

### How to use it

1. Add `jquery.onScreenKeyboard.js` and `onScreenKeyboard.css` to your project, along with _jQuery_. Optionally also add _jQuery UI_ with the _Draggables_ widget if you would like your users to be able to move the keyboard around the screen.
2. Create your form or input elements.
3. Add the following JavaScript to your page, to be executed on load:

```javascript
	$('.osk-trigger').onScreenKeyboard();
```

...where `.osk-trigger` is a selector for the input elements you would like to trigger the keyboard.

A demo is available in demo.html.

### Additional settings

Additional settings can be used to customise the keyboard, and should be added as a parameter within curly braces:

+ `draggable`: __Requres jQuery UI with Draggables__ Whether or not the keyboard is moveable (default `false`; must be boolean).
+ `rewireReturn`: Make the return key submit the form instead of inserting a linebreak (default `false`; must be either boolean false or a string to replace `'return'` with on the key).
+ `rewireTab`: Make the tab key cycle through input elements in the order they appear in the DOM instead of inserting a tab (default `false`; must be boolean).
+ `topPosition`: The `top` CSS property of the keyboard (default `20%`; must be a string suitable for CSS, i.e. one ending in a measurement unit).
+ `leftPosition`: The `left` CSS property of the keyboard (default `30%`; must be a string suitable for CSS, i.e. one ending in a measurement unit).

An example of these in practice:

```javascript
	$('.osk-trigger').onScreenKeyboard({
		'draggable'    : true,
		'rewireReturn' : 'search',
		'rewireTab'    : true
	});
```

In addition to these universal settings, you can change the keyboard on an input-by-input basis using the following parameters added to your input elements under the attribute `data-osk-options`, separated by spaces:

+ `disableSymbols` allows you to disable the symbol keys.
+ `disableTab` allows you to disable the tab key.
+ `disableReturn` allows you to disable the return key.

An example of these in practice:

```html
	<input type="text" id="input1" class="osk-trigger" data-osk-options="disableReturn disableTab">
```

`jquery.onscreenkeyboard.js` contains the HTML for the keyboard at the top (although it is compressed). As long as class names remain the same, this can be changed however much you like. Keep in mind that the character entered into the input box is taken directly from the contents of the `li` element for the pressed key (with exceptions for special keys such as return and tab, when not overridden, and backspace).

`onscreenkeyboard.css` can also be edited to customise the keyboard's design. The first section, "Keyboard Structure" should be mostly left alone. The second section contains definitions for colour and keyboard position.

### Compatibility

+ Internet Explorer 7, 8, 9
+ Firefox 3, 9
+ Chrome
+ Opera (see note below)
+ Safari

### Issues

+ In Opera, the widths of keys on the upper three rows will not match that of the space bar. This is due to the way Opera deals with sub-pixel values.

### Author and Acknowledgements

+ Written by [Chris Cook](http://chris-cook.co.uk)
+ Based upon [this tutorial from nettuts+](http://net.tutsplus.com/tutorials/javascript-ajax/creating-a-keyboard-with-css-and-jquery/)
