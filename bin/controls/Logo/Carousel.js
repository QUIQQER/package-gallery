/**
 * Children listing
 *
 * @module package/quiqqer/gallery/bin/controls/Logo/Carousel
 *
 * @author Dominik Chrzanowski
 */
define('package/quiqqer/gallery/bin/controls/Logo/Carousel', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Functions',
    URL_OPT_DIR + 'bin/quiqqer-asset/glidejs-glide/@glidejs/glide/dist/glide.js',
    'css!' + URL_OPT_DIR + 'bin/quiqqer-asset/glidejs-glide/@glidejs/glide/dist/css/glide.core.css'

], function (QUI, QUIControl, QUIFunctionUtils, Glide) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/gallery/bin/controls/Logo/Carousel',

        Binds: [
            '$onImport',
            '$recalcPerView'
        ],

        options: {
            'perview'      : 3,
            'delay'        : 3000,
            'hoverpause'   : false,
            'minslidewidth': 150
        },

        initialize: function (options) {
            this.parent(options);

            this.Glide          = null;
            this.GlideContainer = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            this.GlideContainer = this.getElm().querySelector('.glide');

            var options = {
                type      : 'carousel',
                perView   : this.getAttribute('perview'),
                autoplay  : this.getAttribute('delay'),
                hoverpause: this.getAttribute('hoverpause'),
                gap       : 0
            };

            this.Glide = new Glide('.glide', options);

            this.Glide.on(['mount.after'], () => {
                this.$recalcPerView();

                moofx(this.GlideContainer).animate({
                    opacity: 1
                })
            });

            // use this instead of QUI.addEvent('resize', ...)
            // because of glidejs recalculate issue during resizing
            this.Glide.on(['resize'], this.$recalcPerView);

            this.Glide.mount();
        },

        /**
         * Check the available space and eventually recalculate new perView amount
         */
        $recalcPerView: function () {
            const space = this.GlideContainer.offsetWidth;

            if (space / this.getAttribute('perview') < this.getAttribute('minslidewidth')) {
                const newPerView = Math.floor(space / this.getAttribute('minslidewidth'));
                this.Glide.update({
                    perView: newPerView
                })
            }
        }
    });
});
