/*jshint esversion: 6 */

/**
 * On-Screen Keyboard jQuery Plugin
 *
 * Provides users with a fluid-width on-screen keyboard.
 *
 * @author Chris Cook <chris@chris-cook.co.uk>
 * @license MIT
 * @version 1.0.2
 * Modified by Carlo Romero
 */

(function ($) {
	'use strict';
	var settings, languages = {
		en: {
			draggerText: "Drag here to move keyboard",
			backspace: "Backspace",
			tab: "Tab",
			capslock: "Caps lock",
			symbol1: ";",
			symbol2: ":",
			returnKey: "Enter",
			shift: "Shift",
			hidekeyboard: "Hide keyboard",
			space: "Space"
		},
		es: {
			draggerText: "Arrastre aquí para mover el teclado",
			backspace: "Borrar",
			tab: "Tab",
			capslock: "Bloq. Mayús.",
			symbol1: "ñ",
			symbol2: "Ñ",
			returnKey: "Intro",
			shift: "Mayús.",
			hidekeyboard: "Ocultar Teclado",
			space: "Espacio"
		}
	};

	$.fn.onScreenKeyboard = function (options) {
		settings = $.extend({
			draggable: false,
			rewireReturn: false,
			rewireTab: false,
			topPosition: '1%',
			leftPosition: "1%",
			language: "en"
		}, options);
		var $keyboardTriggers = this,
			$input = $(),
			$keyboard = renderKeyboard('osk-container'),
			$keys = $keyboard.children('button'),
			$letterKeys = $keyboard.children('button.osk-letter'),
			$symbolKeys = $keyboard.children('button.osk-symbol'),
			$numberKeys = $keyboard.children('button.osk-number'),
			$returnKey = $keyboard.children('button.osk-return'),
			$tabKey = $keyboard.children('button.osk-tab'),
			shift = false,
			capslock = false,
			inputOptions = [],
			browserInPercent = $tabKey.css('marginRight').indexOf('%') > -1;

		/**
		 * Focuses and customises the keyboard for the current input object.
		 *
		 * @param {jQueryObject} The input object to focus on.
		 */
		function activateInput($input) {
			var inputOptionsString = $input.attr('data-osk-options');
			$keys.prop("disabled", false).removeClass('osk-disabled');
			$keyboardTriggers.removeClass('osk-focused');
			if (inputOptionsString !== undefined) {
				inputOptions = inputOptionsString.split(' ');
				if ($.inArray('disableSymbols', inputOptions) > -1)
					$symbolKeys.prop("disabled", true).addClass('osk-disabled');

				if ($.inArray('disableTab', inputOptions) > -1)
					$tabKey.prop("disabled", true).addClass('osk-disabled');

				if ($.inArray('disableReturn', inputOptions) > -1)
					$returnKey.prop("disabled", true).addClass('osk-disabled');
			}
			$input.addClass('osk-focused').focus();
		}

		/**
		 * Fixes the width of the keyboard in browsers which round down part-pixel
		 * values (all except Firefox). Most browsers which do this return CSS
		 * margins in pixels rather than percent, so this is used to determine
		 * whether or not to use this function. Opera does not however, so for now
		 * this function does not work in that browser.
		 */
		function fixWidths() {
			var $key = $(),
				keyboardWidth = $keyboard.width(),
				totalKeysWidth = 0,
				difference;
			if (browserInPercent) {
				$keys.each(function () {
					$key = $(this);
					if (!$key.hasClass('osk-dragger') && !$key.hasClass('osk-space')) {
						totalKeysWidth += $key.width() + Math.floor((parseFloat($key.css('marginRight')) / 100) * keyboardWidth);
						if ($key.hasClass('osk-last-item')) {
							difference = keyboardWidth - totalKeysWidth;
							if (difference > 0) {
								$key.width($key.width() + difference);
							}
							difference = 0;
							totalKeysWidth = 0;
						}
					}
				});
			}
		}

		if (settings.draggable && jQuery.ui) {
			$keyboard.children('div.osk-dragger').show();
			$keyboard.css('paddingTop', '0').draggable({
				containment: 'document',
				handle: 'div.osk-dragger'
			});
		}

		$keyboard.css('top', settings.topPosition).css('left', settings.leftPosition);

		fixWidths();

		$keyboard.hide().css('visibility', 'visible');

		$(window).resize(function () {
			fixWidths();
		});

		$keyboardTriggers.click(function () {
			$input = $(this);
			activateInput($input);
			$keyboard.fadeIn('fast');
		});

		// Key pressing emulation
		$keyboard.on('click', 'button', function () {
			var $key = $(this),
				character = $key.html(),
				inputValue,
				indexOfNextInput,
				inputElement = document.getElementById($input.attr("id")),
				startPosition = inputElement.selectionStart, // Get the initial position of the cursor (caret) 
				endPosition = inputElement.selectionEnd; // Get the final position of the cursor (caret) 

			// Disabled keys
			if ($key.hasClass('osk-disabled')) {
				$input.focus();
				return false;
			}

			// 'Hide Keyboard' key
			if ($key.hasClass('osk-hide')) {
				$keyboard.fadeOut('fast');
				$input.blur();
				$keyboardTriggers.removeClass('osk-focused');
				return false;
			}

			// 'Shift' key
			if ($key.hasClass('osk-shift')) {
				$letterKeys.toggleClass('osk-uppercase');
				$.merge($symbolKeys.children('span'), $numberKeys.children('span')).toggle();
				if ($symbolKeys.hasClass('osk-disabled')) {
					$numberKeys.toggleClass('osk-disabled');
				}
				shift = !shift;
				capslock = false;
				return false;
			}

			// 'Caps Lock' key
			if ($key.hasClass('osk-capslock')) {
				$letterKeys.toggleClass('osk-uppercase');
				capslock = true;
				return false;
			}

			// 'Backspace' key
			if ($key.hasClass('osk-backspace')) {
				inputValue = $input.val();

				$input.val(inputValue.substr(0, startPosition - (startPosition == endPosition ? 1 : 0)) + inputValue.substr(endPosition));

				$input.trigger('keyup');
				$input.focus();

				if (startPosition == endPosition) {
					// Avoid a bug where caret goes to the end when using backspace at the start of an input
					if (startPosition > 0 || endPosition > 0) {
						inputElement.selectionStart = startPosition - 1;
						inputElement.selectionEnd = endPosition - 1;
					}
				} else {
					inputElement.selectionStart = startPosition;
					inputElement.selectionEnd = startPosition;
				}
				return false;
			}

			// Symbol/number keys
			if ($key.hasClass('osk-symbol') || $key.hasClass('osk-number')) {
				character = $('span:visible', $key).html();
			}

			// Spacebar
			if ($key.hasClass('osk-space')) {
				character = ' ';
			}

			// 'Tab' key - either enter an indent (default) or switch to next form element
			if ($key.hasClass('osk-tab')) {
				if (settings.rewireTab) {
					$input.trigger('onchange');
					indexOfNextInput = $keyboardTriggers.index($input) + 1;
					if (indexOfNextInput < $keyboardTriggers.length) {
						$input = $($keyboardTriggers[indexOfNextInput]);
					} else {
						$input = $($keyboardTriggers[0]);
					}
					activateInput($input);
					return false;
				} else {
					character = '\t';
				}
			}

			// 'Return' key - either linebreak (default) or submit form
			if ($key.hasClass('osk-return')) {
				if (settings.rewireReturn) {
					$keyboardTriggers.parent('form').submit();
					return false;
				} else {
					character = '\n';
				}
			}

			// Uppercase keys
			if ($key.hasClass('osk-uppercase')) {
				character = character.toUpperCase();
			}

			// Handler for when shift is enabled
			if (shift) {
				$.merge($symbolKeys.children('span'), $numberKeys.children('span')).toggle();
				if (!capslock) {
					$letterKeys.toggleClass('osk-uppercase');
				}
				if (settings.disableSymbols) {
					$numberKeys.toggleClass('osk-disabled');
				}
				shift = false;
			}

			inputValue = $input.val();
			// Insert the chosen character between caret positions:
			$input.val(inputValue.substr(0, startPosition) + character + inputValue.substr(endPosition));
			$input.trigger('keyup');
			$input.focus();
			// Locate caret at appropiate position in current input:
			inputElement.selectionStart = startPosition + 1;
			inputElement.selectionEnd = endPosition + 1;
		});

		this.destroy = function () {
			$keyboard.remove();
		};

		return this;
	};

	/**
	 * Renders the keyboard.
	 *
	 * @param {String} id of the keyboard
	 * @return {jQuery} the keyboard jQuery instance
	 */
	function renderKeyboard(keyboardId) {
		var $keyboard = $('#' + keyboardId),
			selectedLanguage = languages[settings.language];

		if ($keyboard.length)
			return $keyboard;

		$keyboard = $(
			'<div id="' + keyboardId + '">' +
			'<div class="osk-dragger osk-last-item"><p>::: ' + selectedLanguage.draggerText + ' :::</p></div>' +
			'<button class="osk-symbol">' +
			'<span class="osk-off">&acute;</span>' +
			'<span class="osk-on">#</span>' +
			'</button>' +
			'<button class="osk-number">' +
			'<span class="osk-off">1</span>' +
			'<span class="osk-on">!</span>' +
			'</button>' +
			'<button class="osk-number">' +
			'<span class="osk-off">2</span>' +
			'<span class="osk-on">&quot;</span>' +
			'</button>' +
			'<button class="osk-number">' +
			'<span class="osk-off">3</span>' +
			'<span class="osk-on">&pound;</span>' +
			'</button>' +
			'<button class="osk-number">' +
			'<span class="osk-off">4</span>' +
			'<span class="osk-on">$</span>' +
			'</button>' +
			'<button class="osk-number">' +
			'<span class="osk-off">5</span>' +
			'<span class="osk-on">%</span>' +
			'</button>' +
			'<button class="osk-number">' +
			'<span class="osk-off">6</span>' +
			'<span class="osk-on">^</span>' +
			'</button>' +
			'<button class="osk-number">' +
			'<span class="osk-off">7</span>' +
			'<span class="osk-on">&amp;</span>' +
			'</button>' +
			'<button class="osk-number">' +
			'<span class="osk-off">8</span>' +
			'<span class="osk-on">*</span></button>' +
			'<button class="osk-number">' +
			'<span class="osk-off">9</span>' +
			'<span class="osk-on">(</span>' +
			'</button>' +
			'<button class="osk-number">' +
			'<span class="osk-off">0</span>' +
			'<span class="osk-on">)</span>' +
			'</button>' +
			'<button class="osk-symbol">' +
			'<span class="osk-off">-</span>' +
			'<span class="osk-on">_</span>' +
			'</button>' +
			'<button class="osk-symbol">' +
			'<span class="osk-off">=</span>' +
			'<span class="osk-on">+</span>' +
			'</button>' +
			'<button class="osk-backspace osk-last-item">' + selectedLanguage.backspace + '</button>' +
			'<button class="osk-tab">' + selectedLanguage.tab + '</button>' +
			'<button class="osk-letter">q</button>' +
			'<button class="osk-letter">w</button>' +
			'<button class="osk-letter">e</button>' +
			'<button class="osk-letter">r</button>' +
			'<button class="osk-letter">t</button>' +
			'<button class="osk-letter">y</button>' +
			'<button class="osk-letter">u</button>' +
			'<button class="osk-letter">i</button>' +
			'<button class="osk-letter">o</button>' +
			'<button class="osk-letter">p</button>' +
			'<button class="osk-symbol">' +
			'<span class="osk-off">[</span>' +
			'<span class="osk-on">{</span>' +
			'</button>' +
			'<button class="osk-symbol">' +
			'<span class="osk-off">]</span>' +
			'<span class="osk-on">}</span>' +
			'</button>' +
			'<button class="osk-symbol osk-last-item">' +
			'<span class="osk-off">\\</span>' +
			'<span class="osk-on">|</span>' +
			'</button>' +
			'<button class="osk-capslock">' + selectedLanguage.capslock + '</button>' +
			'<button class="osk-letter">a</button>' +
			'<button class="osk-letter">s</button>' +
			'<button class="osk-letter">d</button>' +
			'<button class="osk-letter">f</button>' +
			'<button class="osk-letter">g</button>' +
			'<button class="osk-letter">h</button>' +
			'<button class="osk-letter">j</button>' +
			'<button class="osk-letter">k</button>' +
			'<button class="osk-letter">l</button>' +
			'<button class="' + (settings.language == "en" ? 'osk-symbol' : 'osk-letter') + '">' +
			(settings.language == "en" ? '<span class="osk-off">' + selectedLanguage.symbol1 + '</span>' + '<span class="osk-on">' + selectedLanguage.symbol2 + '</span>' : selectedLanguage.symbol1) +
			'</button>' +
			'<button class="osk-symbol">' +
			'<span class="osk-off">\'</span>' +
			'<span class="osk-on">@</span>' +
			'</button>' +
			'<button class="osk-return osk-last-item">' + selectedLanguage.returnKey + '</button>' +
			'<button class="osk-shift">' + selectedLanguage.shift + '</button>' +
			'<button class="osk-letter">z</button>' +
			'<button class="osk-letter">x</button>' +
			'<button class="osk-letter">c</button>' +
			'<button class="osk-letter">v</button>' +
			'<button class="osk-letter">b</button>' +
			'<button class="osk-letter">n</button>' +
			'<button class="osk-letter">m</button>' +
			'<button class="osk-symbol">' +
			'<span class="osk-off">,</span>' +
			'<span class="osk-on">&lt;</span>' +
			'</button>' +
			'<button class="osk-symbol">' +
			'<span class="osk-off">.</span>' +
			'<span class="osk-on">&gt;</span>' +
			'</button>' +
			'<button class="osk-symbol">' +
			'<span class="osk-off">/</span>' +
			'<span class="osk-on">?</span>' +
			'</button>' +
			'<button class="osk-hide osk-last-item">' + selectedLanguage.hidekeyboard + '</button>' +
			'<button class="osk-space osk-last-item">' + selectedLanguage.space + '</button>' +
			'</div>'
		);

		$('body').append($keyboard);
		return $keyboard;
	}

})(jQuery);