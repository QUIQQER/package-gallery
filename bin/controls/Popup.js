/**
 * Image Popup
 * Shows a image popup and the user can navigate through a list of images
 *
 * @module package/quiqqer/gallery/bin/controls/Popup
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/windows/Popup
 * @require qui/utils/Math
 * @require css!package/quiqqer/gallery/bin/controls/Popup.css
 */
define('package/quiqqer/gallery/bin/controls/Popup', [

    'qui/QUI',
    'qui/controls/windows/Popup',
    'qui/utils/Math',

    'css!package/quiqqer/gallery/bin/controls/Popup.css'

], function (QUI, QUIWin, QUIMath) {
    "use strict";

    return new Class({

        Extends: QUIWin,
        Type   : 'package/quiqqer/gallery/bin/controls/Grid',

        Binds: [
            '$onOpen',
            '$onClose',
            '$keyup',

            'showNextImage',
            'showPrevImage'
        ],

        options: {
            images : [],
            zIndex : 1000,
            current: false
        },

        initialize: function (options) {
            this.parent(options);

            // defaults
            this.setAttributes({
                closeButton: false
            });

            this.$isOpen    = false;
            this.__$current = this.getAttribute('current');

            this.$Stats = null;
            this.$Image = null;

            this.$Prev = null;
            this.$Next = null;

            this.$ButtonCnr  = null;
            this.$ButtonText = null;
            this.$ButtonPrev = null;
            this.$ButtonNext = null;

            this.parent(options);

            this.addEvents({
                onOpen : this.$onOpen,
                onClose: this.$onClose
            });
        },

        /**
         * event : on open
         */
        $onOpen: function () {
            var Content = this.getContent(),
                Elm     = this.getElm();

            Elm.getElements('.qui-window-popup-buttons').destroy();

            this.$ButtonCnr = new Element('div', {
                'class': 'qui-gallery-popup-image-buttons',
                html   : '<div class="qui-gallery-popup-buttons-prev">' +
                         '<span class="fa fa-chevron-left icon-chevron-left"></span>' +
                         '</div>' +
                         '<div class="qui-gallery-popup-buttons-text"></div>' +
                         '<div class="qui-gallery-popup-buttons-next">' +
                         '<span class="fa fa-chevron-right icon-chevron-right"></span>' +
                         '</div>' +
                         '<div class="qui-gallery-popup-stats"></div>'
            }).inject(this.getElm());

            this.$ButtonText = this.$ButtonCnr.getElement(
                '.qui-gallery-popup-buttons-text'
            );

            this.$ButtonPrev = this.$ButtonCnr.getElement(
                '.qui-gallery-popup-buttons-prev'
            );

            this.$ButtonNext = this.$ButtonCnr.getElement(
                '.qui-gallery-popup-buttons-next'
            );

            this.$Stats = this.$ButtonCnr.getElement(
                '.qui-gallery-popup-stats'
            );

            this.$Prev = new Element('div', {
                'class': 'qui-gallery-popup-imagePrev',
                events : {
                    click: this.showPrevImage
                }
            }).inject(Elm);

            this.$Next = new Element('div', {
                'class': 'qui-gallery-popup-imageNext',
                events : {
                    click: this.showNextImage
                }
            }).inject(Elm);


            new Element('div', {
                'class': 'icon-remove fa fa-close qui-gallery-popup-close',
                events : {
                    click: function () {
                        this.close();
                    }.bind(this)
                }
            }).inject(Elm);

            Content.setStyles({
                height   : null,
                overflow : 'hidden',
                outline  : 'none',
                padding  : 0,
                textAlign: 'center'
            });

            Elm.setStyles({
                boxShadow: '0 0 0 10px #fff, 0 10px 60px 10px rgba(8, 11, 19, 0.55)',
                outline  : 'none'
            });

            this.Background.setAttribute('styles', {
                zIndex: this.getAttribute('zIndex')
            });

            this.Background.show();

            this.getElm().setStyles({
                zIndex: this.getAttribute('zIndex') + 1
            });

            // events
            this.$ButtonPrev.addEvents({
                click: this.showPrevImage
            });

            this.$ButtonNext.addEvents({
                click: this.showNextImage
            });

            this.$isOpen = true;


            // bind keys
            window.addEvent('keyup', this.$keyup);

            if (!this.__$current) {
                this.showFirstImage();
            } else {
                this.showImage(this.__$current);
            }
        },

        /**
         * event : on close
         */
        $onClose: function () {
            this.$isOpen = false;

            if (this.$ButtonCnr) {
                this.$ButtonCnr.destroy();
            }

            window.removeEvent('keyup', this.$keyup);
        },

        /**
         * Show a specific image
         *
         * @param {String} src - Source of the image
         */
        showImage: function (src) {
            var self = this;

            this.__$current = src;

            this.Loader.show();

            if (this.$isOpen === false) {
                this.open();
                return;
            }

            if (this.$Image) {
                moofx(this.$Image).animate({
                    opacity: 0
                });
            }


            var imageData = this.$getImageData(src);

            var title       = imageData.title,
                short       = imageData.short,
                childIndex  = imageData.index + 1,
                childLength = this.getAttribute('images').length;


            require(['image!' + src], function (Image) {

                var pc;

                var height  = Image.height,
                    width   = Image.width,
                    docSize = document.getSize();

                var docWidth  = docSize.x - 100,
                    docHeight = docSize.y - 100;

                // set width ?
                if (width > docWidth) {
                    pc = QUIMath.percent(docWidth, width);

                    width  = docWidth;
                    height = ( height * (pc / 100) ).round();
                }

                // set height ?
                if (height > docHeight) {
                    pc = QUIMath.percent(docHeight, height);

                    height = docHeight;
                    width  = ( width * (pc / 100) ).round();
                }

                // resize win
                self.setAttribute('maxWidth', width);
                self.setAttribute('maxHeight', height);

                // button resize
                self.$ButtonText.set(
                    'html',

                    '<div class="qui-gallery-popup-image-preview-header">' +
                    title +
                    '</div>' +
                    '<div class="qui-gallery-popup-image-preview-text">' +
                    short +
                    '</div>'
                );

                // get dimensions
                var Temp = self.$ButtonText.clone().inject(
                    self.$ButtonText.getParent()
                );

                Temp.setStyles({
                    height    : 0,
                    visibility: 'hidden'
                });

                var dimensions = Temp.getScrollSize(),
                    newHeight  = dimensions.y + 10;

                Temp.destroy();

                if (newHeight < 50) {
                    newHeight = 50;
                }

                moofx(self.$ButtonCnr).animate({
                    height: newHeight
                });


                self.$Stats.set('html', childIndex + ' von ' + childLength); // #locale

                self.resize(true, function () {
                    self.getContent().set({
                        html  : '',
                        styles: {
                            height  : '100%',
                            overflow: 'hidden'
                        }
                    });


                    self.$Image = new Element('img', {
                        'class': 'qui-gallery-popup-image-preview',
                        src    : src,
                        styles : {
                            opacity: 0
                        }
                    }).inject(self.getContent());

                    moofx(self.$Image).animate({
                        opacity: 1
                    });

                    self.__$current = false;
                    self.Loader.hide();
                });
            });
        },

        /**
         * Shows the next image
         */
        showNextImage: function () {
            if (!this.$Image) {
                this.showFirstImage();
                return;
            }

            var currentSrc = this.$Image.get('src'),
                images     = this.getAttribute('images');

            if (currentSrc.match(window.location.host)) {
                currentSrc = currentSrc.split(window.location.host)[1];
            }

            for (var i = 0, len = images.length; i < len; i++) {
                if (images[i].src === currentSrc) {
                    break;
                }
            }

            if (typeof images[i + 1] !== 'undefined') {
                this.showImage(images[i + 1].src);
                return;
            }

            this.showFirstImage();
        },

        /**
         * Shows the previous image
         */
        showPrevImage: function () {
            if (!this.$Image) {
                this.showLastImage();
                return;
            }

            var currentSrc = this.$Image.get('src'),
                images     = this.getAttribute('images');

            if (currentSrc.match(window.location.host)) {
                currentSrc = currentSrc.split(window.location.host)[1];
            }

            for (var i = 0, len = images.length; i < len; i++) {
                if (images[i].src === currentSrc) {
                    break;
                }
            }

            if (i > 0) {
                this.showImage(images[i - 1].src);
                return;
            }

            this.showLastImage();
        },

        /**
         * Show the first image
         */
        showFirstImage: function () {
            var images = this.getAttribute('images');

            if (typeOf(images) === 'array') {
                this.showImage(images[0].src);
            }
        },

        /**
         * Show the last image
         */
        showLastImage: function () {
            var images = this.getAttribute('images');

            if (typeOf(images) === 'array') {
                this.showImage(images[images.length - 1].src);
            }
        },

        /**
         * return the image data entry
         *
         * @param {String} src - Source of the image
         * @return {Object}
         */
        $getImageData: function (src) {
            var images = this.getAttribute('images');

            if (src.match(window.location.host)) {
                src = src.split(window.location.host)[1];
            }

            for (var i = 0, len = images.length; i < len; i++) {
                if (images[i].src === src) {
                    images[i].index = i;
                    return images[i];
                }
            }

            return {
                src  : src,
                title: '',
                short: '',
                index: 0
            };
        },

        /**
         * key events
         *
         * @param {DOMEvent} event
         */
        $keyup: function (event) {
            if (event.key == 'left') {
                this.showPrevImage();
                return;
            }

            if (event.key == 'right') {
                this.showNextImage();
            }

            if (event.key == 'esc') {
                this.close();
            }
        }
    });
});
