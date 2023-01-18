/**
 * Children listing
 *
 * @module package/quiqqer/gallery/bin/controls/Slider/ImageSlider2
 *
 * @author www.pcsg.de (Henning Leutz)
 * @author www.pcsg.de (Michael Danielczok)
 */
define('package/quiqqer/gallery/bin/controls/ImageSlider2', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Functions'

], function (QUI, QUIControl, QUIFunctionUtils) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/gallery/bin/controls/ImageSlider2',

        Binds: [
            '$onImport',
            '$onScroll',
            'prev',
            'prev2',
            'next',
            'next2',
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
            this.SliderWrapper = null;

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
                this.getElm().addClass('quiqqer-gallery-logoSlider-mobile');
            } else {
                this.$mobile = false;
                this.getElm().removeClass('quiqqer-gallery-logoSlider-mobile');
            }

            this.$scrollLength = (size.x / 1.2).round();
            this.$scrollMax    = this.$Inner.getScrollSize().x - size.x;
            this.$icons.setStyle('line-height', size.y);
            this.$onScroll();

            // new scroll length
            const entrySize = this.getElm().querySelector('.quiqqer-gallery-logoSlider-child').getSize().x;

            this.$scrollLength = entrySize * 5;
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var Elm  = this.getElm();
            this.SliderWrapper = Elm.querySelector('.quiqqer-gallery-logoSlider-wrapper');

            // var Elm  = this.getElm().getElement('.wrapper').getElement('.quiqqer-bricks-children-slider-container'),
            var size = this.SliderWrapper.getSize();


            this.$Next = new Element('div', {
                'class': 'quiqqer-gallery-logoSlider-next hide-on-mobile',
                html   : '<span class="fa fa-angle-right"></span>',
                styles : {
                   // display   : 'none', // direkt display: none, damit der Button beim ersten Laden
                    //lineHeight: size.y  // der Seite kein keinen Slide-Effekt hat
                },
                events : {
                    click: this.next2
                }
            }).inject(this.SliderWrapper);

            this.$Prev = new Element('div', {
                'class': 'quiqqer-gallery-logoSlider-prev hide-on-mobile',
                html   : '<span class="fa fa-angle-left"></span>',
                styles : {
                    //lineHeight: size.y
                },
                events : {
                    click: this.prev2
                }
            }).inject(this.SliderWrapper);

            this.$Inner = Elm.getElement(
                '.quiqqer-gallery-logoSlider-container-inner'
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

        prev2: function () {
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

        next2: function () {
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

            if (left === 0) {
                this.$Prev.classList.add('disabled');
            } else {
                this.$Prev.classList.remove('disabled');
            }

            if (left === this.$scrollMax || left > this.$scrollMax) {
                this.$Next.classList.add('disabled');
            } else {
                this.$Next.classList.remove('disabled');
            }
        }
    });
});
