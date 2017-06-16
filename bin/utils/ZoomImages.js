/**
 * Search images to zoom
 *
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/gallery/bin/utils/ZoomImages', function () {
    "use strict";

    var imageList = {};

    return {
        /**
         * Parse the parent element and search images to zoom
         *
         * @param {HTMLElement} Parent
         */
        parseElement: function (Parent) {
            var images    = Parent.getElements('[data-zoom="1"]'),
                imageData = [],
                galleryId = String.uniqueID();

            if (!images.length) {
                return;
            }

            var imageClick = function (event) {
                event.stop();

                require([
                    'package/quiqqer/gallery/bin/utils/ZoomImages'
                ], function (ZoomImages) {
                    ZoomImages.imageClick(event.target);
                });
            };

            var i, len, src;

            for (i = 0, len = images.length; i < len; i++) {
                images[i].setStyle('cursor', 'pointer');
                images[i].set('data-gallery-id', galleryId);

                src = images[i].get('src');

                if (images[i].get('data-src')) {
                    src = images[i].get('data-src');
                }

                imageData.push({
                    src  : src,
                    title: images[i].get('alt'),
                    short: ''
                });

                images[i].addEvent('click', imageClick);
            }

            imageList[galleryId] = imageData;
        },

        /**
         * Execute an image click
         * opens the zoom popup
         *
         * @param {Object} Image
         */
        imageClick: function (Image) {
            var galleryId = Image.get('data-gallery-id');

            if (!galleryId) {
                return;
            }

            if (typeof imageList[galleryId] === 'undefined') {
                return;
            }

            require([
                'package/quiqqer/gallery/bin/controls/Popup'
            ], function (ImagePopup) {
                new ImagePopup({
                    images : imageList[galleryId],
                    current: Image.get('data-src')
                }).open();
            });
        }
    };
});
