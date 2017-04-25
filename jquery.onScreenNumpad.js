/**
 * On-Screen Keyboard jQuery Plugin
 *
 * Provides users with a fluid-width on-screen keyboard.
 *
 * @author Chris Cook <chris@chris-cook.co.uk>
 * @license MIT
 * @version 1.0.2
 */

(function ($) {

	'use strict';

	$.fn.onScreenKeyboard = function (options) {

		var settings = $.extend({
			draggable: false,
			rewireReturn: false,
			rewireTab: false // Remove inline styles
			//topPosition: '20%',
			//leftPosition: '30%'
		}, options);
		var $keyboardTriggers = this;
		var $input = $();
		var $keyboard = renderKeyboard('osk-container');
		var $keys = $keyboard.children('li');
		var $letterKeys = $keyboard.children('li.osk-letter');
		var $symbolKeys = $keyboard.children('li.osk-symbol');
		var $numberKeys = $keyboard.children('li.osk-number');
		var $returnKey = $keyboard.children('li.osk-return');
		var $oneKey = $keyboard.children('li.osk-one');
		var shift = false;
		var capslock = false;
		var inputOptions = [];
		var browserInPercent = $oneKey.css('marginRight').indexOf('%') > -1;

		/**
		 * Focuses and customises the keyboard for the current input object.
		 *
		 * @param {jQueryObject} The input object to focus on.
		 */
		function activateInput($input) {
			var inputOptionsString = $input.attr('data-osk-options');
			$keys.removeClass('osk-disabled');
			$keyboardTriggers.removeClass('osk-focused');
			if (inputOptionsString !== undefined) {
				inputOptions = inputOptionsString.split(' ');
				if ($.inArray('disableSymbols', inputOptions) > -1) {
					$symbolKeys.addClass('osk-disabled');
				}
				if ($.inArray('disableTab', inputOptions) > -1) {
					$tabKey.addClass('osk-disabled');
				}
				if ($.inArray('disableReturn', inputOptions) > -1) {
					$returnKey.addClass('osk-disabled');
				}

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
			$keyboard.children('li.osk-dragger').show();
			$keyboard.css('paddingTop', '0').draggable({
				containment : 'document',
				handle : 'li.osk-dragger'
			});
		}

		if (settings.rewireReturn) {
			$returnKey.html(settings.rewireReturn);
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

		$keyboard.on('click', 'li', function () {
			var $key      = $(this),
				character = $key.html(),
				inputValue,
				indexOfNextInput;

			// Disabled keys/dragger
			if ($key.hasClass('osk-dragger') || $key.hasClass('osk-disabled')) {
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
				$input.val(inputValue.substr(0, inputValue.length - 1));
				$input.trigger('keyup');
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

			$input.focus().val($input.val() + character);
			$input.trigger('keyup');
		});

		return this;

	};

	/**
	 * Renders the keyboard.
	 *
	 * @param {String} id of the keyboard
	 * @return {jQuery} the keyboard jQuery instance
	 */
	function renderKeyboard(keyboardId) {
		var $keyboard = $('#' + keyboardId);

		if ($keyboard.length) {
			return $keyboard;
		}

		$keyboard = $(
			'<ul id="' + keyboardId + '">' +
				'<li class="osk-one osk-left">1</li>' +
				'<li class="osk-off">2</li>' +
				'<li class="osk-off">3</li>' +
				'<li class="osk-backspace osk-last-item">Delete</li>' +

				'<li class="osk-off osk-left">4</li>' +
				'<li class="osk-off">5</li>' +
				'<li class="osk-off">6</li>' +
				'<li class="osk-hide osk-last-item">Hide</li>' +

				'<li class="osk-off osk-left">7</li>' +
				'<li class="osk-off">8</li>' +
				'<li class="osk-off osk-last-item">9</li>' +

				'<li class="osk-off osk-left osk-zero">0</li>' +
				'<li class="osk-off">.</li>' +

			'</ul>'
		);

		$('body').append($keyboard);

		return $keyboard;
	}

})(jQuery);
