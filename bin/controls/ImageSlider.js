/**
 * Children listing
 *
 * @module package/quiqqer/gallery/bin/controls/Slider/ImageSlider
 *
 * @author www.pcsg.de (Henning Leutz)
 * @author www.pcsg.de (Michael Danielczok)
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
                this.getElm().addClass('quiqqer-gallery-imageSlider-mobile');
            } else {
                this.$mobile = false;
                this.getElm().removeClass('quiqqer-gallery-imageSlider-mobile');
            }

            this.$scrollLength = (size.x / 1.2).round();
            this.$scrollMax    = this.$Inner.getScrollSize().x - size.x;
            // this.$icons.setStyle('line-height', size.y);
            this.$onScroll();
        },

        /**
         * event : on import
         */
        $onImport: function () {
            const Elm  = this.getElm(),
                SliderElm = Elm.getElement('.quiqqer-gallery-imageSlider-container'),
                size = SliderElm.getSize();

            this.$Next = new Element('div', {
                'class': 'quiqqer-gallery-imageSlider-next hide-on-mobile',
                html   : '<span class="fa fa-angle-right"></span>',
                styles : {
                    display   : 'none', // direkt display: none, damit der Button beim ersten Laden
                    lineHeight: size.y  // der Seite kein keinen Slide-Effekt hat
                },
                events : {
                    click: this.next
                }
            }).inject(SliderElm);

            this.$Prev = new Element('div', {
                'class': 'quiqqer-gallery-imageSlider-prev hide-on-mobile',
                html   : '<span class="fa fa-angle-left"></span>',
                styles : {
                    lineHeight: size.y
                },
                events : {
                    click: this.prev
                }
            }).inject(SliderElm);

            this.$Inner = Elm.getElement(
                '.quiqqer-gallery-imageSlider-container-inner'
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

                this.$Next.addClass('show-next');
                resolve();

            }.bind(this));
        },

        /**
         * Show the previous button
         * @returns {Promise}
         */
        showPrevButton: function () {
            return new Promise(function (resolve) {
                this.$Prev.addClass('show-prev');
                resolve();
            }.bind(this));
        },

        /**
         * Hide the next button
         * @returns {Promise}
         */
        hideNextButton: function () {
            return new Promise(function (resolve) {
                this.$Next.removeClass('show-next');
                resolve();
            }.bind(this));
        },

        /**
         * Hide the prev button
         * @returns {Promise}
         */
        hidePrevButton: function () {
            return new Promise(function (resolve) {
                this.$Prev.removeClass('show-prev');
                resolve();
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
