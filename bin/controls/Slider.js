/**
 * Component gallery
 *
 * @module package/quiqqer/gallery/bin/controls/Slider
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/loader/Loader
 * @require qui/controls/loader/Progress
 * @require qui/utils/Math
 * @require qui/utils/Functions
 * @require URL_BIN_DIR +'QUI/lib/Assets.js'
 *
 * @event animateOutBegin [self, Element]
 * @event animateOutEnd [self, Element]
 * @event animateInBegin [self, Element]
 * @event animateinEnd [self, Element]
 */
define('package/quiqqer/gallery/bin/controls/Slider', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/controls/loader/Progress',
    'qui/utils/Math',
    'qui/utils/Functions'

], function (QUI, QUIControl, QUILoader, QUIProgress, QUIMath, QUIFunctionUtils) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/gallery/bin/controls/Slider',

        Binds: [
            'next',
            'prev',
            'toggleAutoplay',
            'toggleRandomize',
            '$onImport',
            '$keyup',
            '$onWinResize',
            '$previewLeft',
            '$previewRight',
            '$showPreviewImage'
        ],

        options: {
            controls              : true,
            period                : 5000,
            shadow                : false,
            'show-controls-always': true,
            'show-title-always'   : true,
            'show-title'          : true,
            'previews'            : true
        },

        initialize: function (options) {
            this.parent(options);

            this.$__animate = false;

            this.Loader = new QUILoader();

            this.$Progress  = new QUIProgress();
            this.$Container = null;
            this.$Next      = null;
            this.$Prev      = null;
            this.$Title     = null;
            this.$List      = null;

            this.$Previews       = null;
            this.$PreviewsSlider = null;
            this.$PreviewsFX     = null;

            this.$images  = [];
            this.$current = 0;

            this.$autoplayInterval = false;

            this.addEvents({
                onImport: this.$onImport
            });

            window.addEvent('keyup', this.$keyup);
            window.addEvent('resize', QUIFunctionUtils.debounce(this.$onWinResize));
        },

        /**
         * event on inject
         */
        $onImport: function () {
            var i, len, Entry;

            // read images
            this.$List = new Element('div', {
                html  : this.$Elm.innerHTML.replace('<!--', '').replace('-->', ''),
                styles: {
                    display: "none"
                }
            }).inject(this.$Elm);

            var entries = this.$List.getElements('.entry');

            for (i = 0, len = entries.length; i < len; i++) {
                Entry = entries[i];

                if (Entry.get('data-src') === '') {
                    continue;
                }

                this.$images.push({
                    image: Entry.get('data-src'),
                    title: Entry.getElement('.title').get('html'),
                    text : Entry.getElement('.text').get('html')
                });
            }


            this.create();
            this.showFirst();
        },

        /**
         * Create the DOMNode Element
         *
         * @return {HTMLElement}
         */
        create: function () {
            var self = this;

            if (!this.$Elm) {
                this.$Elm = new Element('div', {
                    'class': 'quiqqer-gallery-slider'
                });

            } else {
                this.$Elm.addClass('quiqqer-gallery-slider');
            }

            this.$Elm.set({
                html: '<div class="quiqqer-gallery-slider-content">' +
                          '<div class="quiqqer-gallery-slider-prev">' +
                              '<span class="fa fa-chevron-left"></span>' +
                          '</div>' +
                          '<div class="quiqqer-gallery-slider-title"></div>' +
                          '<div class="quiqqer-gallery-slider-next">' +
                              '<span class="fa fa-chevron-right"></span>' +
                          '</div>' +
                          '<div class="quiqqer-gallery-slider-controls">' +
                              '<span class="fa fa-play"></span>' +
                              '<span class="fa fa-random"></span>' +
                          '</div>' +
                          '<div class="quiqqer-gallery-slider-previews"></div>' +
                      '</div>'
            });

            this.Loader.inject(this.$Elm);
            this.$Progress.inject(this.$Elm);

            this.$Container = this.$Elm.getElement('.quiqqer-gallery-slider-content');
            this.$Next      = this.$Elm.getElement('.quiqqer-gallery-slider-next');
            this.$Prev      = this.$Elm.getElement('.quiqqer-gallery-slider-prev');
            this.$Title     = this.$Elm.getElement('.quiqqer-gallery-slider-title');
            this.$Controls  = this.$Elm.getElement('.quiqqer-gallery-slider-controls');
            this.$Previews  = this.$Elm.getElement('.quiqqer-gallery-slider-previews');

            this.$Play   = this.$Elm.getElement('.fa-play');
            this.$Random = this.$Elm.getElement('.fa-random');

            this.$Controls.setStyle('display', 'none');

            if (this.getAttribute('controls')) {
                this.$Controls.setStyle('display', null);
            }

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            if (!this.getAttribute('show-title')) {
                this.$Title.setStyle('display', 'none');
            }

            this.$Play.addEvent('click', this.toggleAutoplay);
            this.$Random.addEvent('click', this.toggleRandomize);

            this.$Next.addEvent('click', function () {
                self.stopAutoplay();
                self.next();
            });

            this.$Prev.addEvent('click', function () {
                self.stopAutoplay();
                self.prev();
            });

            if (this.getAttribute('shadow')) {
                this.$Elm.setStyle('boxShadow', '0 0 2px 2px #888');
            }

            if (this.getAttribute('show-controls-always')) {
                this.$Next.setStyle('opacity', 1);
                this.$Prev.setStyle('opacity', 1);
                this.$Controls.setStyle('opacity', 1);
            }

            if (this.getAttribute('show-title-always')) {
                this.$Title.setStyle('opacity', 1);
            }

            if (!this.getAttribute('preview')) {
                this.$Previews.setStyle('display', 'none');
            } else {
                this.$createPreviews();
            }

            this.Loader.show();

            return this.$Elm;
        },

        /**
         * Add an image
         *
         * @param {String} imageSrc
         * @param {String} title
         * @param {String} text
         */
        addImage: function (imageSrc, title, text) {
            this.$images.push({
                image: imageSrc,
                title: title,
                text : text
            });
        },

        /**
         * show the first image
         *
         * @return Promise
         */
        showFirst: function () {
            this.$current = 0;
            return this.next();
        },

        /**
         * show the next image
         *
         * @return Promise
         */
        next: function () {
            return new Promise(function (resolve, reject) {
                if (this.$__animate) {
                    reject();
                    return;
                }

                if (!this.$images.length) {
                    reject();
                    return;
                }

                this.$__animate = true;


                var next = this.$current + 1;

                if (typeof this.$images[next] === 'undefined') {
                    next = 0;
                }

                var self = this,
                    data = this.$images[next];

                this.Loader.show();

                this.loadImage(data.image).then(function (Image) {
                    self.Loader.hide();

                    var OldImage = self.$Container.getElements(
                            '.quiqqer-gallery-slider-image'
                        ),

                        NewImage = self.$createNewImage(Image);


                    NewImage.set('data-no', self.$current);

                    self.animateOut(OldImage, 'left', function () {
                        OldImage.destroy();
                    });

                    return self.animateIn(NewImage, 'right');

                }).then(function () {
                    self.setText(data.title, data.text);

                    self.$current   = next;
                    self.$__animate = false;

                    self.$showPreviewImage();
                    self.Loader.hide();

                    resolve();
                });

            }.bind(this));
        },

        /**
         * show the prev image
         */
        prev: function () {
            return new Promise(function (resolve, reject) {
                if (this.$__animate) {
                    reject();
                    return;
                }

                if (!this.$images.length) {
                    reject();
                    return;
                }

                this.$__animate = true;


                var next = this.$current - 1;

                if (next < 0) {
                    next = this.$images.length - 1;
                }

                var self = this,
                    data = this.$images[next];

                this.Loader.show();

                this.loadImage(data.image).then(function (Image) {
                    self.Loader.hide();

                    var OldImage = self.$Container.getElements(
                            '.quiqqer-gallery-slider-image'
                        ),

                        NewImage = self.$createNewImage(Image);


                    NewImage.set('data-no', self.$current);

                    self.animateOut(OldImage, 'right', function () {
                        OldImage.destroy();
                    });

                    return self.animateIn(NewImage, 'left');

                }).then(function () {
                    self.setText(data.title, data.text);

                    self.$current   = next;
                    self.$__animate = false;

                    self.$showPreviewImage();
                    self.Loader.hide();

                    resolve();
                });
            }.bind(this));
        },

        /**
         * Load the image
         *
         * @param {String} src - Image source
         * @param {Function} [callback] - optional
         *
         * @return Promise
         */
        loadImage: function (src, callback) {

            return new Promise(function (resolve, reject) {

                require(['image!' + src], function (Image) {
                    resolve(Image);

                    if (typeof callback === 'function') {
                        callback(Image);
                    }

                }, reject);
            });
        },

        /**
         * Out animation for an element
         *
         * @param {HTMLElement} Elm
         * @param {String} [direction]  - left|right
         * @param {Function} [callback] - callback function
         *
         * @return Promise
         */
        animateOut: function (Elm, direction, callback) {
            return new Promise(function (resolve) {
                if (!Elm || (typeOf(Elm) === 'elements' && !Elm.length)) {
                    if (typeof callback === 'function') {
                        callback();
                    }

                    resolve();
                    return;
                }

                this.fireEvent('animateOutBegin', [this, Elm]);

                var self = this,
                    left = '-100%';

                if (typeof direction !== 'undefined' && direction == 'right') {
                    left = '100%';
                }

                moofx(Elm).animate({
                    left: left
                }, {
                    callback: function () {
                        if (typeof callback === 'function') {
                            callback();
                        }

                        resolve();

                        self.fireEvent('animateOutEnd', [self, Elm]);
                    }
                });
            }.bind(this));
        },

        /**
         * In animation for an element
         *
         * @param {HTMLElement} Elm
         * @param {String} [direction]  - left|right
         * @param {Function} [callback] - callback function
         *
         * @return Promise
         */
        animateIn: function (Elm, direction, callback) {
            return new Promise(function (resolve) {
                if (!Elm || (typeOf(Elm) === 'elements' && !Elm.length)) {
                    if (typeof callback === 'function') {
                        callback();
                    }

                    resolve();
                    return;
                }

                this.fireEvent('animateInBegin', [this, Elm]);

                var self    = this,
                    elmSize = Elm.getSize(),
                    size    = this.getElm().getSize();

                var top = ((size.y - elmSize.y) / 2).round();

                if (top < 0) {
                    top = 0;
                }

                var leftStart = '-100%';

                if (typeof direction !== 'undefined' && direction == 'right') {
                    leftStart = '100%';
                }

                Elm.setStyles({
                    left: leftStart,
                    top : top
                });


                // center
                var left = ((size.x - elmSize.x) / 2).round();

                if (left < 0) {
                    left = 0;
                }

                moofx(Elm).animate({
                    left: left
                }, {
                    callback: function () {
                        if (typeof callback === 'function') {
                            callback();
                        }

                        resolve();

                        self.fireEvent('animateInEnd', [self, Elm]);
                    }
                });
            }.bind(this));
        },

        /**
         * Set the text fot the image
         *
         * @param {String} title
         * @param {String} text
         */
        setText: function (title, text) {
            title = title || '';
            text  = text || '';

            this.$Title.set(
                'html',

                '<div class="quiqqer-gallery-slider-title-header">' + title + '</div>' +
                '<div class="quiqqer-gallery-slider-title-text">' + text + '</div>'
            );

            var Temp = this.$Title.clone().inject(this.$Title.getParent());

            Temp.setStyles({
                height    : 0,
                visibility: 'hidden'
            });


            var dimensions = Temp.getScrollSize();

            Temp.destroy();

            moofx(this.$Title).animate({
                height: dimensions.y + 10
            });
        },

        /**
         * Return the real image size via the image url
         *
         * @param {HTMLElement} Image
         * @returns {Object} - { x, y }
         */
        $getRealImageSize: function (Image) {
            var src = Image.get('src');

            if (!src.match('__')) {
                return Image.getSize();
            }

            var srcParts = src.split('__');

            srcParts = srcParts[1].split('.');
            srcParts = srcParts[0];

            var sizes = srcParts.split('x');

            sizes[0] = parseInt(sizes[0]);
            sizes[1] = parseInt(sizes[1]);

            return {
                x: sizes[0],
                y: sizes[1]
            };
        },

        /**
         * Create a new image DOMNode
         *
         * @param {HTMLImageElement} Image
         * @returns {HTMLImageElement} New image DOM-Node
         */
        $createNewImage: function (Image) {

            var pc;

            var listSize  = this.$Container.getSize(),
                imageSize = this.$getRealImageSize(Image),
                height    = imageSize.y,
                width     = imageSize.x;

            // set width
            pc = QUIMath.percent(listSize.x, width);

            width  = listSize.x;
            height = ( height * (pc / 100) ).round();

            // set height?
            if (height > listSize.y) {
                pc = QUIMath.percent(listSize.y, height);

                height = listSize.y;
                width  = ( width * (pc / 100) ).round();
            }

            return new Element('img', {
                src    : Image.src,
                'class': 'quiqqer-gallery-slider-image',
                style  : {
                    left     : '110%',
                    height   : height,
                    maxHeight: height,
                    width    : width,
                    maxWidth : width
                }
            }).inject(this.$Container);
        },

        /**
         * key events
         *
         * @param {DOMEvent} event
         */
        $keyup: function (event) {
            if (event.key == 'left') {
                this.prev();
                return;
            }

            if (event.key == 'right') {
                this.next();
            }
        },

        /**
         * event : on window resize
         */
        $onWinResize: function () {
            var Img = this.getElm().getElement('img');

            if (!Img) {
                return;
            }

            // center
            var elmSize = Img.getSize(),
                size    = this.getElm().getSize();

            var left = ((size.x - elmSize.x) / 2).round();

            if (left < 0) {
                left = 0;
            }

            moofx(Img).animate({
                left: left
            });
        },

        /**
         * Start the autoplay
         */
        autoplay: function () {
            this.$Play.addClass('control-background-active');

            if (this.$autoplayInterval) {
                clearInterval(this.$autoplayInterval);
            }

            this.$Progress.increment(this.getAttribute('period'));

            this.$autoplayInterval = (function () {
                this.$Progress.increment(this.getAttribute('period'));

                if (this.$randomize) {
                    this.$current = Number.random(0, this.$images.length - 1);
                }

                this.next();

            }).periodical(this.getAttribute('period'), this);
        },

        /**
         * Stop the autoplay
         */
        stopAutoplay: function () {
            this.$Progress.reset();
            this.$Play.removeClass('control-background-active');
            this.stopRandomize();

            if (this.$autoplayInterval) {
                clearInterval(this.$autoplayInterval);
            }
        },

        /**
         * Toggle the autoplay on / off
         */
        toggleAutoplay: function () {
            if (this.$Play.hasClass('control-background-active')) {
                this.stopAutoplay();
                return;
            }

            this.autoplay();
        },

        /**
         * Set randomize -> on
         */
        randomize: function () {
            this.$randomize = true;
            this.$Random.addClass('control-background-active');
            this.autoplay();
        },

        /**
         * Set randomize -> on
         */
        stopRandomize: function () {
            this.$randomize = false;
            this.$Random.removeClass('control-background-active');
        },

        /**
         * Toggle the randomize on / off
         */
        toggleRandomize: function () {
            if (this.$randomize) {
                this.stopRandomize();
                return;
            }

            this.randomize();
        },

        /**
         * Create the preview
         */
        $createPreviews : function()
        {
            if (!this.$Previews) {
                return;
            }


            this.$Previews.setStyle('bottom', -100);
            this.$Previews.setStyle('zIndex', 10);

            this.$Previews.set(
                'html',

                '<div class="quiqqer-gallery-slider-previews-prev">' +
                    '<span class="fa fa-chevron-left"></span>' +
                '</div>'+
                '<div class="quiqqer-gallery-slider-previews-container">' +
                    '<div class="quiqqer-gallery-slider-previews-containerInner"></div>' +
                '</div>'+
                '<div class="quiqqer-gallery-slider-previews-next">' +
                    '<span class="fa fa-chevron-right"></span>' +
                '</div>'
            );


            var i, len, image, ending;

            var self      = this,
                imageList = [];

            this.$PreviewsSlider = this.$Previews.getElement(
                '.quiqqer-gallery-slider-previews-containerInner'
            );

            this.$PreviewsFX = moofx(this.$PreviewsSlider);

            this.$Previews.getElement(
                '.quiqqer-gallery-slider-previews-prev'
            ).addEvent('click', this.$previewLeft);

            this.$Previews.getElement(
                '.quiqqer-gallery-slider-previews-next'
            ).addEvent('click', this.$previewRight);


            // image click action
            var __click = function(event) {

                var Target = event.target;

                if (!Target.hasClass('quiqqer-gallery-slider-previews-entry')) {
                    Target = Target.getParent('.quiqqer-gallery-slider-previews-entry');
                }

                self.$current = Target.get('data-image').toInt() - 1;
                self.next();
            };


            // get image paths
            for (i = 0, len = this.$images.length; i < len; i++) {

                image  = this.$images[i].image;
                ending = image.slice(image.lastIndexOf('.'));
                image  = image.slice(0, image.indexOf('__')) +'__x80'+ ending;

                imageList.push('image!'+ image);
            }


            // load images
            require(imageList, function() {

                var width = 0;

                for (i = 0, len = arguments.length; i < len; i++) {

                    width = width + arguments[i].width + 10;

                    new Element('div', {
                        'class' : 'quiqqer-gallery-slider-previews-entry',
                        html    : '<img src="'+ arguments[i].src +'" />',
                        events : {
                            click : __click
                        },
                        'data-image' : i
                    }).inject(self.$PreviewsSlider);

                }

                self.$PreviewsSlider.setStyle('width', width);

                moofx(self.$Previews).animate({
                    bottom : 0
                }, {
                    duration : 250
                });

            });
        },

        /**
         * Scrolls to the preview image
         */
        $showPreviewImage : function()
        {
            if (!this.$Previews) {
                return;
            }

            this.$PreviewsSlider.getElements(
                '.quiqqer-gallery-slider-previews-entry'
            ).removeClass(
                'quiqqer-gallery-slider-active-preview'
            );

            var Img = this.$PreviewsSlider.getElement(
                '[data-image="'+ this.$current +'"]'
            );

            Img.addClass('quiqqer-gallery-slider-active-preview');

            this.$PreviewsFX.animate({
                left : Img.getPosition(Img.getParent()).x * -1
            }, {
                duration : 700
            });
        },

        /**
         * preview scroll to the left
         */
        $previewLeft : function()
        {
            var left = this.$PreviewsSlider.getStyle('left').toInt();

            left = left + 300;

            if (!left) {
                left = 300;
            }

            if (left > 0) {
                left = 0;
            }

            this.$PreviewsFX.animate({
                left : left
            }, {
                duration : 700
            });
        },

        /**
         * preview scroll to the right
         */
        $previewRight : function()
        {

            var left = this.$PreviewsSlider.getStyle('left').toInt();

            left = left - 300;

            if (!left) {
                left = -300;
            }


            console.log(left);

            this.$PreviewsFX.animate({
                left : left
            }, {
                duration : 700
            });
        }
    });
});
