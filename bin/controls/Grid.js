/**
 * Grid Gallery
 * Functionality for the PHP Grid Control
 *
 * @module package/quiqqer/gallery/bin/controls/Grid
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/gallery/bin/controls/Grid', [

    'qui/QUI',
    'qui/controls/Control',
    'package/quiqqer/gallery/bin/controls/Popup',

    'css!package/quiqqer/gallery/bin/controls/Grid.css'

], function (QUI, QUIControl, ImagePopup) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/gallery/bin/controls/Grid',

        Binds: [
            '$onImport',
            '$imageClick'
        ],

        options: {
            'titleclickable': 0 // 1 = open image
        },

        initialize: function (options) {
            this.parent(options);

            this.$ImageWindow  = false;
            this.$CompleteList = false;

            this.$__resized = false;
            this.$images    = [];

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event on inject
         */
        $onImport: function () {
            var images = this.$Elm.getElements(
                '.quiqqer-gallery-grid-entry-image'
            );

            if (this.$Elm.get('data-qui-titleclickable') == "1") {
                this.setAttribute('titleclickable', this.$Elm.get('data-qui-titleclickable'));
            }

            if (this.getAttribute('titleclickable')) {
                var titles = this.$Elm.getElements(
                    '.quiqqer-gallery-grid-entry-text a'
                );

                images = images.concat(titles)
            }

            for (var i = 0, len = images.length; i < len; i++) {
                images[i].addEvent('click', this.$imageClick);
            }

            // get the complete list
            var completeList = this.$Elm.getElement(
                '.quiqqer-gallery-grid-list-complete'
            );

            this.$CompleteList = new Element('div', {
                html  : completeList.innerHTML.replace('<template>', '').replace('</template>', ''),
                styles: {
                    display: "none"
                }
            }).inject(this.$Elm);

            this.$images = this.$CompleteList.getElements(
                '.quiqqer-gallery-grid-list-complete-entry'
            ).map(function (Elm) {
                return {
                    src  : Elm.get('data-src'),
                    title: Elm.getElement('.title').get('html'),
                    short: Elm.getElement('.short').get('html')
                };
            });
        },

        /**
         * event - image click
         *
         * @param {DOMEvent} event
         */
        $imageClick: function (event) {
            var Target = event.target;

            if (typeOf(event) === 'domevent') {
                event.stop();
            }

            if (Target.nodeName != 'a') {
                Target = Target.getParent('a');
            }

            this.$ImageWindow = new ImagePopup({
                images: this.$images
            });

            this.$ImageWindow.showImage(Target.get('href'));
        }
    });
});
