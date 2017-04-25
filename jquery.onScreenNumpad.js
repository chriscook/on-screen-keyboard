/**
 * On-Screen Numpad jQuery Plugin
 *
 * Provides users with a fluid-width on-screen numpad.
 *
 * @author Chris Cook <chris@chris-cook.co.uk>
 * @license MIT
 * @version 1.0.2
 */

(function ($) {

	'use strict';

	$.fn.onScreenNumpad = function (options) {

		var settings = $.extend({
			draggable: false,
			rewireReturn: false,
			rewireTab: false // Remove inline styles
			//topPosition: '20%',
			//leftPosition: '30%'
		}, options);
		var $numpadTriggers = this;
		var $input = $();
		var $numpad = renderNumpad('osn-container');
		var $keys = $numpad.children('li');
		var $letterKeys = $numpad.children('li.osn-letter');
		var $symbolKeys = $numpad.children('li.osn-symbol');
		var $numberKeys = $numpad.children('li.osn-number');
		var $returnKey = $numpad.children('li.osn-return');
		var $oneKey = $numpad.children('li.osn-one');
		var shift = false;
		var capslock = false;
		var inputOptions = [];
		var browserInPercent = $oneKey.css('marginRight').indexOf('%') > -1;

		/**
		 * Focuses and customises the numpad for the current input object.
		 *
		 * @param {jQueryObject} The input object to focus on.
		 */
		function activateInput($input) {
			var inputOptionsString = $input.attr('data-osn-options');
			$keys.removeClass('osn-disabled');
			$numpadTriggers.removeClass('osn-focused');
			if (inputOptionsString !== undefined) {
				inputOptions = inputOptionsString.split(' ');
				if ($.inArray('disableSymbols', inputOptions) > -1) {
					$symbolKeys.addClass('osn-disabled');
				}
				if ($.inArray('disableTab', inputOptions) > -1) {
					$tabKey.addClass('osn-disabled');
				}
				if ($.inArray('disableReturn', inputOptions) > -1) {
					$returnKey.addClass('osn-disabled');
				}

			}
			$input.addClass('osn-focused').focus();
		}

		/**
		 * Fixes the width of the numpad in browsers which round down part-pixel
		 * values (all except Firefox). Most browsers which do this return CSS
		 * margins in pixels rather than percent, so this is used to determine
		 * whether or not to use this function. Opera does not however, so for now
		 * this function does not work in that browser.
		 */
		function fixWidths() {
			var $key = $(),
				numpadWidth = $numpad.width(),
				totalKeysWidth = 0,
				difference;
			if (browserInPercent) {
				$keys.each(function () {
					$key = $(this);
					if (!$key.hasClass('osn-dragger') && !$key.hasClass('osn-space')) {
						totalKeysWidth += $key.width() + Math.floor((parseFloat($key.css('marginRight')) / 100) * numpadWidth);
						if ($key.hasClass('osn-last-item')) {
							difference = numpadWidth - totalKeysWidth;
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
			$numpad.children('li.osn-dragger').show();
			$numpad.css('paddingTop', '0').draggable({
				containment : 'document',
				handle : 'li.osn-dragger'
			});
		}

		if (settings.rewireReturn) {
			$returnKey.html(settings.rewireReturn);
		}

		$numpad.css('top', settings.topPosition).css('left', settings.leftPosition);

		fixWidths();

		$numpad.hide().css('visibility', 'visible');

		$(window).resize(function () {
			fixWidths();
		});

		$numpadTriggers.click(function () {
			$input = $(this);
			activateInput($input);
			$numpad.fadeIn('fast');
		});

		$numpad.on('click', 'li', function () {
			var $key      = $(this),
				character = $key.html(),
				inputValue,
				indexOfNextInput;

			// Disabled keys/dragger
			if ($key.hasClass('osn-dragger') || $key.hasClass('osn-disabled')) {
				$input.focus();
				return false;
			}

			// 'Hide Numpad' key
			if ($key.hasClass('osn-hide')) {
				$numpad.fadeOut('fast');
				$input.blur();
				$numpadTriggers.removeClass('osn-focused');
				return false;
			}

			// 'Shift' key
			if ($key.hasClass('osn-shift')) {
				$letterKeys.toggleClass('osn-uppercase');
				$.merge($symbolKeys.children('span'), $numberKeys.children('span')).toggle();
				if ($symbolKeys.hasClass('osn-disabled')) {
					$numberKeys.toggleClass('osn-disabled');
				}
				shift = !shift;
				capslock = false;
				return false;
			}

			// 'Caps Lock' key
			if ($key.hasClass('osn-capslock')) {
				$letterKeys.toggleClass('osn-uppercase');
				capslock = true;
				return false;
			}

			// 'Backspace' key
			if ($key.hasClass('osn-backspace')) {
				inputValue = $input.val();
				$input.val(inputValue.substr(0, inputValue.length - 1));
				$input.trigger('keyup');
				return false;
			}

			// Symbol/number keys
			if ($key.hasClass('osn-symbol') || $key.hasClass('osn-number')) {
				character = $('span:visible', $key).html();
			}

			// Spacebar
			if ($key.hasClass('osn-space')) {
				character = ' ';
			}

			// 'Tab' key - either enter an indent (default) or switch to next form element
			if ($key.hasClass('osn-tab')) {
				if (settings.rewireTab) {
					$input.trigger('onchange');
					indexOfNextInput = $numpadTriggers.index($input) + 1;
					if (indexOfNextInput < $numpadTriggers.length) {
						$input = $($numpadTriggers[indexOfNextInput]);
					} else {
						$input = $($numpadTriggers[0]);
					}
					activateInput($input);
					return false;
				} else {
					character = '\t';
				}
			}

			// 'Return' key - either linebreak (default) or submit form
			if ($key.hasClass('osn-return')) {
				if (settings.rewireReturn) {
					$numpadTriggers.parent('form').submit();
					return false;
				} else {
					character = '\n';
				}
			}

			// Uppercase keys
			if ($key.hasClass('osn-uppercase')) {
				character = character.toUpperCase();
			}

			// Handler for when shift is enabled
			if (shift) {
				$.merge($symbolKeys.children('span'), $numberKeys.children('span')).toggle();
				if (!capslock) {
					$letterKeys.toggleClass('osn-uppercase');
				}
				if (settings.disableSymbols) {
					$numberKeys.toggleClass('osn-disabled');
				}
				shift = false;
			}

			$input.focus().val($input.val() + character);
			$input.trigger('keyup');
		});

		return this;

	};

	/**
	 * Renders the numpad.
	 *
	 * @param {String} id of the numpad
	 * @return {jQuery} the numpad jQuery instance
	 */
	function renderNumpad(numpadId) {
		var $numpad = $('#' + numpadId);

		if ($numpad.length) {
			return $numpad;
		}

		$numpad = $(
			'<ul id="' + numpadId + '">' +
				'<li class="osn-one osn-left">1</li>' +
				'<li class="osn-off">2</li>' +
				'<li class="osn-off">3</li>' +
				'<li class="osn-backspace osn-last-item">Delete</li>' +

				'<li class="osn-off osn-left">4</li>' +
				'<li class="osn-off">5</li>' +
				'<li class="osn-off">6</li>' +
				'<li class="osn-hide osn-last-item">Hide</li>' +

				'<li class="osn-off osn-left">7</li>' +
				'<li class="osn-off">8</li>' +
				'<li class="osn-off osn-last-item">9</li>' +

				'<li class="osn-off osn-left osn-zero">0</li>' +
				'<li class="osn-off">.</li>' +

			'</ul>'
		);

		$('body').append($numpad);

		return $numpad;
	}

})(jQuery);
