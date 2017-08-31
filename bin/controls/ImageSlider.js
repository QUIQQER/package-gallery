/**
 * Children listing
 *
 * @module package/quiqqer/gallery/bin/controls/Slider/ImageSlider
 * @author www.pcsg.de (Michael Danielczok)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/utils/Functions
 */
define('package/quiqqer/gallery/bin/controls/ImageSlider', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Functions'

], function (QUI, QUIControl, QUIFunctionUtils) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/gallery/bin/controls/ImageSlider',

        Binds: [
            '$onImport',
            '$onScroll',
            'prev',
            'next',
            'resize'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$SlideFX = null;
            this.$Prev    = null;
            this.$Next    = null;
            this.$Inner   = null;

            this.$scrollLength = null;
            this.$scrollMax    = 0;
            this.$mobile       = true;
            this.$icons        = null;

            this.addEvents({
                onImport: this.$onImport
            });

            QUI.addEvent('resize', this.resize);
        },

        /**
         * resize the control and recalc all slide vars
         */
        resize: function () {
            var size    = this.getElm().getSize(),
                winSize = QUI.getWindowSize();

            // display the buttons? if mobile, dont display it
            if (winSize.x < size.x + 100) {
                this.$mobile = true;
                this.getElm().addClass('quiqqer-bricks-children-slider-mobile');
            } else {
                this.$mobile = false;
                this.getElm().removeClass('quiqqer-bricks-children-slider-mobile');
            }

            this.$scrollLength = (size.x / 1.2).round();
            this.$scrollMax    = this.$Inner.getScrollSize().x - size.x;
            this.$icons.setStyle('line-height', size.y);
            this.$onScroll();
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var Elm  = this.getElm(),
                // var Elm  = this.getElm().getElement('.wrapper').getElement('.quiqqer-bricks-children-slider-container'),
                size = Elm.getSize();

            this.$Next = new Element('div', {
                'class': 'quiqqer-bricks-children-slider-next hide-on-mobile',
                html   : '<span class="fa fa-angle-right"></span>',
                styles : {
                    display   : 'none',
                    lineHeight: size.y,
                    opacity   : 0,
                    right     : 0
                },
                events : {
                    click: this.next
                }
            }).inject(Elm);

            this.$Prev = new Element('div', {
                'class': 'quiqqer-bricks-children-slider-prev hide-on-mobile',
                html   : '<span class="fa fa-angle-left"></span>',
                styles : {
                    display   : 'none',
                    left      : 0,
                    lineHeight: size.y,
                    opacity   : 0
                },
                events : {
                    click: this.prev
                }
            }).inject(Elm);

            this.$Inner = Elm.getElement(
                '.quiqqer-bricks-children-slider-container-inner'
            );

            this.$SlideFX = new Fx.Scroll(this.$Inner);
            this.$icons   = Elm.getElements('article a .quiqqer-icon');

            var scrollSpy = QUIFunctionUtils.debounce(this.$onScroll, 200);

            this.$Inner.addEvent('scroll', scrollSpy);

            this.$NextFX = moofx(this.$Next);
            this.$PrevFX = moofx(this.$Prev);

            // calc scrolling vars
            this.resize.delay(200, this);

            if (!this.$icons || !this.$icons.length) {
                return;
            }

            moofx(this.$icons).animate({
                opacity: 1
            }, {
                duration: 200
            });
        },

        /**
         * Show previous articles
         *
         * @return {Promise}
         */
        prev: function () {
            return new Promise(function (resolve) {
                var left = this.$Inner.getScroll().x - this.$scrollLength;

                if (left < 0) {
                    left = 0;
                }

                this.$SlideFX.start(left, 0).chain(resolve);

            }.bind(this));
        },

        /**
         * Show next articles
         *
         * @return {Promise}
         */
        next: function () {
            return new Promise(function (resolve) {
                var left = this.$Inner.getScroll().x + this.$scrollLength;

                this.$SlideFX.start(left, 0).chain(resolve);

            }.bind(this));
        },

        /**
         * Show the next button
         * @returns {Promise}
         */
        showNextButton: function () {
            return new Promise(function (resolve) {
                this.$Next.setStyle('display', null);

                var right   = -50,
                    opacity = 1;

                if (this.$mobile) {
                    right   = 0;
                    opacity = 0.8;
                }

                this.$NextFX.animate({
                    right  : right,
                    opacity: opacity
                }, {
                    duration: 200,
                    callback: resolve
                });
            }.bind(this));
        },

        /**
         * Show the previous button
         * @returns {Promise}
         */
        showPrevButton: function () {
            return new Promise(function (resolve) {
                this.$Prev.setStyle('display', null);

                var left    = -50,
                    opacity = 1;

                if (this.$mobile) {
                    left    = 0;
                    opacity = 0.8;
                }

                this.$PrevFX.animate({
                    left   : left,
                    opacity: opacity
                }, {
                    duration: 200,
                    callback: resolve
                });
            }.bind(this));
        },

        /**
         * Hide the next button
         * @returns {Promise}
         */
        hideNextButton: function () {
            return new Promise(function (resolve) {
                this.$NextFX.animate({
                    right  : 0,
                    opacity: 0
                }, {
                    duration: 200,
                    callback: function () {
                        this.$Next.setStyle('display', 'none');
                        resolve();
                    }.bind(this)
                });
            }.bind(this));
        },

        /**
         * Hide the prev button
         * @returns {Promise}
         */
        hidePrevButton: function () {
            return new Promise(function (resolve) {
                this.$PrevFX.animate({
                    left   : 0,
                    opacity: 0
                }, {
                    duration: 200,
                    callback: function () {
                        this.$Prev.setStyle('display', 'none');
                        resolve();
                    }.bind(this)
                });
            }.bind(this));
        },

        /**
         * event : on scroll
         * look for the prev and next button
         */
        $onScroll: function () {
            var left = this.$Inner.getScroll().x;

            var scrollSize = this.$Inner.getScrollSize().x;
            var domSize    = this.$Inner.getSize().x;

            if (scrollSize <= domSize) {
                this.hidePrevButton();
                this.hideNextButton();
                return;
            }

            if (left === 0) {
                this.hidePrevButton();
            } else {
                this.showPrevButton();
            }

            if (left === this.$scrollMax) {
                this.hideNextButton();
            } else {
                this.showNextButton();
            }
        }
    });
});
