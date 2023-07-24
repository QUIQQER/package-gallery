/**
 * Children listing
 *
 * @module package/quiqqer/gallery/bin/controls/Slider/Carousel
 *
 * @author Dominik Chrzanowski
 */
define('package/quiqqer/gallery/bin/controls/Carousel', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Functions',
    URL_OPT_DIR + 'bin/quiqqer-asset/glidejs-glide/@glidejs/glide/dist/glide.js',
    'css!' + URL_OPT_DIR + 'bin/quiqqer-asset/glidejs-glide/@glidejs/glide/dist/css/glide.core.css'

], function (QUI, QUIControl, QUIFunctionUtils, Glide) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/gallery/bin/controls/Carousel',

        Binds: [
            '$onImport',
            '$onScroll',
            'resize'
        ],

        options: {
            'perView'    : 3,
            'delay'      : 2000,
            'hoverpause' : false
        },

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onImport: this.$onImport
            });
            },

        /**
         * event : on import
         */
        $onImport: function () {

            var perView = this.getAttribute('perview');
            var delay = this.getAttribute('delay');
            var hoverpause = this.getAttribute('hoverpause');

            console.log(hoverpause);

            var options = {
                type     : 'carousel',
                perView  : perView,
                autoplay : delay,
                hoverpause : hoverpause
            };

            var glide = new Glide('.glide', options);

            glide.mount();
        }
    });
});
