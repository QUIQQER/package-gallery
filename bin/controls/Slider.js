/**
 * Component gallery
 *
 * @module package/quiqqer/gallery/bin/controls/Slider
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onLoaded [self]
 * @event animateOutBegin [self, Element]
 * @event animateOutEnd [self, Element]
 * @event animateInBegin [self, Element]
 * @event animateinEnd [self, Element]
 * @event onImageClick [self, ImageData]
 * @event onImageShow [self, ImageData]
 */
define('package/quiqqer/gallery/bin/controls/Slider', [
    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/controls/loader/Progress',
    'qui/utils/Math',
    'qui/utils/Functions',
    'Locale',
    'package/quiqqer/gallery/bin/controls/Popup',
    URL_OPT_DIR + 'bin/quiqqer-asset/hammerjs/hammerjs/hammer.min.js',

    'text!package/quiqqer/gallery/bin/controls/Slider.html',
    'css!package/quiqqer/gallery/bin/controls/Slider.css'
], function (QUI, QUIControl, QUILoader, QUIProgress, QUIMath, QUIFunctionUtils, QUILocale, GalleryPopup, Hammer, template) {
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
            '$showPreviewImage',
            '$calcSizes',
            'zoom',
            'isLoaded'
        ],

        options: {
            'controls'            : true,   // display controls
            'period'              : 5000,   // play period
            'shadow'              : false,  // display a shadow
            'show-controls-always': true,   // display the controls at mouseleave, dont hide it
            'show-title-always'   : true,   // display the titles at mouseleave, dont hide it
            'show-title'          : true,   // show titles of the images
            'zoom'                : true,   // enable zoom function via click
            'keyevents'           : true,
            'imagefit'            : false,  // if images are center, the effect is a smooth effect, no slide effect
            'placeholderimage'    : false,
            'placeholdercolor'    : false,
            'touch'               : true,   // touch events?

            'previews'                : true,   // show preview images
            'preview-outside'         : false,  // preview to the outside?
            'preview-background-color': 'rgba(0, 0, 0, 0.8)',
            'preview-color'           : '#fff'
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

            this.$Previews          = null;
            this.$PreviewsContainer = null;
            this.$PreviewsSlider    = null;
            this.$PreviewsFX        = null;

            this.$images  = [];
            this.$current = 0;
            this.$loaded  = false;

            // sizes
            this.$pcSize    = {};
            this.$mainSize  = {};
            this.$oldResize = {};

            this.$autoplayInterval = false;

            // events
            //var __winResize = QUIFunctionUtils.debounce(this.$onWinResize);

            this.addEvents({
                onImport : this.$onImport,
                onDestroy: function () {
                    window.removeEvent('keyup', this.$keyup);
                    QUI.removeEvent('resize', this.$onWinResize);
                }.bind(this)
            });

            window.addEvent('keyup', this.$keyup);
            QUI.addEvent('resize', this.$onWinResize);
        },

        /**
         * event on inject
         */
        $onImport: function () {
            var i, len, Entry;

            var self     = this;
            var Template = this.$Elm.getElement('template');

            Template = new Element('div', {
                html: Template.get('html')
            });

            // read images
            this.$List = new Element('div', {
                styles: {
                    display: "none"
                }
            }).inject(this.$Elm);

            Template.inject(this.$List);

            var entries = this.$List.getElementsByClassName('entry');

            for (i = 0, len = entries.length; i < len; i++) {
                Entry = entries[i];

                if (Entry.get('data-src') === '') {
                    continue;
                }

                this.$images.push({
                    src    : Entry.get('data-src'),
                    image  : Entry.get('data-src'),
                    preview: Entry.get('data-preview'),
                    title  : Entry.getElement('.title').get('html'),
                    text   : Entry.getElement('.text').get('html'),
                    short  : Entry.getElement('.text').get('html')
                });
            }

            this.create();
            this.showFirst().then(function () {
                self.Loader.hide();
                self.fireEvent('loaded', [self]);
                self.$loaded = true;
            }).catch(function () {
                self.Loader.hide();
            });
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

            var Header  = this.$Elm.getElement('.control-header');
            var Content = this.$Elm.getElement('.control-content');

            this.$Elm.set({
                html: ''
            });

            if (Header) {
                Header.inject(this.$Elm);
            }

            if (Content) {
                Content.inject(this.$Elm);
            }

            var Container = new Element('div', {
                'class': 'quiqqer-gallery-slider-control',
                html   : template,
                styles : {
                    position: 'relative',
                    width   : '100%'
                }
            }).inject(this.$Elm);

            this.Loader.inject(Container);
            this.$Progress.inject(Container);

            this.$Container = this.$Elm.getElement('.quiqqer-gallery-slider-content');
            this.$Next      = this.$Elm.getElement('.quiqqer-gallery-slider-next');
            this.$Prev      = this.$Elm.getElement('.quiqqer-gallery-slider-prev');
            this.$Title     = this.$Elm.getElement('.quiqqer-gallery-slider-title');
            this.$Controls  = this.$Elm.getElement('.quiqqer-gallery-slider-controls');
            this.$Previews  = this.$Elm.getElement('.quiqqer-gallery-slider-previews');

            this.$Previews.setStyles({
                background: this.getAttribute('preview-background-color'),
                color     : this.getAttribute('preview-color')
            });

            if (this.getAttribute('preview-outside')) {
                this.$Previews.inject(Container);
                this.$Elm.addClass('quiqqer-gallery-slider-previewOutside');
            }

            this.$Play   = this.$Elm.getElement('.fa-play');
            this.$Random = this.$Elm.getElement('.fa-random');
            this.$Zoom   = this.$Elm.getElement('.fa-search');

            this.$Controls.setStyle('display', 'none');

            if (this.getAttribute('controls') && this.$images.length) {
                this.$Controls.setStyle('display', null);
            }

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            if (!this.getAttribute('show-title')) {
                this.$Title.setStyle('display', 'none');
            }

            if (this.getAttribute('touch') && this.$images.length > 1) {
                this.$Touch = new Hammer(this.$Container);

                this.$Touch.on('swipe', function (ev) {
                    if (ev.offsetDirection === 4) {
                        self.prev();
                        return;
                    }

                    if (ev.offsetDirection === 2) {
                        self.next();
                    }
                });
            }

            this.$Play.addEvent('click', this.toggleAutoplay);
            this.$Random.addEvent('click', this.toggleRandomize);
            this.$Zoom.addEvent('click', this.zoom);

            if (this.getAttribute('zoom') === false) {
                this.$Zoom.setStyle('display', 'none');
            }

            this.$Next.addEvent('click', function () {
                self.stopAutoplay();
                self.next();
            });

            this.$Prev.addEvent('click', function () {
                self.stopAutoplay();
                self.prev();
            });

            if (this.$images.length === 1) {
                this.$Play.setStyle('display', 'none');
                this.$Random.setStyle('display', 'none');
            }

            if (this.$images.length <= 1) {
                this.$Next.setStyle('display', 'none');
                this.$Prev.setStyle('display', 'none');

                if (!this.$images.length) {
                    var icon  = '<span class="fa fa-file-image-o"></span>',
                        text  = '<p style="font-size: 20px">' + QUILocale.get('quiqqer/gallery', "quiqqer.gallery.slider.noImages") + '</p>',
                        image = icon + text;

                    if (this.getAttribute('placeholderimage')) {
                        image = '';
                    }

                    var Placeholder = new Element('div', {
                        'class': 'quiqqer-gallery-slider-placeholder',
                        html   : image,
                        styles : {
                            color     : '#fff',
                            background: '#000',
                            fontSize  : 40,
                            height    : '100%',
                            paddingTop: '20%',
                            opacity   : 0.6,
                            position  : 'absolute',
                            textAlign : 'center',
                            top       : 0,
                            width     : '100%'

                        }
                    }).inject(Container);


                    if (this.getAttribute('placeholdercolor')) {
                        Placeholder.setStyle(
                            'backgroundColor',
                            this.getAttribute('placeholdercolor')
                        );
                    }

                    if (this.getAttribute('placeholderimage')) {
                        Placeholder.setStyles({
                            backgroundImage   : 'url("' + this.getAttribute('placeholderimage') + '")',
                            backgroundRepeat  : 'no-repeat',
                            backgroundPosition: 'center center'
                        });
                    }
                }
            }

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

            if (this.getAttribute('imagefit')) {
                this.$Container.addClass(
                    'quiqqer-gallery-slider-content-imagefit'
                );
            }

            if (!this.getAttribute('preview') || this.$images.length <= 1) {
                this.$Previews.setStyle('display', 'none');
            } else {
                this.$createPreviews();
            }

            this.Loader.show();

            return this.$Elm;
        },

        /**
         * resize slider
         */
        resize: function () {
            this.$onWinResize();
            this.parent();
        },

        /**
         * calc internal sizes
         */
        $calcSizes: function () {
            if (!this.$Container) {
                return;
            }

            this.$mainSize = this.$Container.getSize();

            if (this.$PreviewsContainer) {
                this.$pcSize = this.$PreviewsContainer.getSize();
            }
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
                src  : imageSrc,
                image: imageSrc,
                title: title,
                text : text,
                short: text
            });
        },

        /**
         * show the first image
         *
         * @return {Promise}
         */
        showFirst: function () {
            this.$current = -1;
            return this.next();
        },

        /**
         * show the next image
         *
         * @return {Promise}
         */
        next: function () {
            return new Promise(function (resolve) {
                if (this.$__animate) {
                    resolve();
                    return;
                }

                if (!this.$images.length) {
                    this.Loader.hide();
                    resolve();
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

                    self.fireEvent('imageShow', [self, self.$images[self.$current]]);

                    resolve();
                });

            }.bind(this));
        },

        /**
         * show the prev image
         */
        prev: function () {
            return new Promise(function (resolve) {
                if (this.$__animate) {
                    resolve();
                    return;
                }

                if (this.$images.length <= 1) {
                    resolve();
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

                    self.fireEvent('imageShow', [self, self.$images[self.$current]]);

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
         * @return {Promise}
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
         * @return {Promise}
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

                if (typeof direction !== 'undefined' && direction === 'right') {
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
         * @return {Promise}
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

                if (!("x" in this.$mainSize)) {
                    this.$calcSizes();
                }

                var self    = this,
                    elmSize = Elm.getSize(),
                    size    = this.$mainSize;

                var top = ((size.y - elmSize.y) / 2).round();

                if (top < 0) {
                    top = 0;
                }

                var leftStart = '-100%';

                if (typeof direction !== 'undefined' && direction === 'right') {
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
            height = (height * (pc / 100)).round();

            // set height?
            if (height > listSize.y) {
                pc = QUIMath.percent(listSize.y, height);

                height = listSize.y;
                width  = (width * (pc / 100)).round();
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
                },
                events : {
                    click: this.zoom
                }
            }).inject(this.$Container);
        },

        /**
         * key events
         *
         * @param {DOMEvent} event
         */
        $keyup: function (event) {
            if (this.getAttribute('keyevents') === false) {
                return;
            }

            if (this.$images.length <= 1) {
                return;
            }

            if (event.key === 'left') {
                this.prev();
                return;
            }

            if (event.key === 'right') {
                this.next();
            }
        },

        /**
         * event : on window resize
         */
        $onWinResize: function () {
            this.$calcSizes();

            var Img = this.getElm().getElement('img');

            if (!Img) {
                return;
            }

            // center
            var elmSize = Img.getSize(),
                size    = this.$Container.getSize();

            var left = ((size.x - elmSize.x) / 2).round();

            if (left < 0) {
                left = 0;
            }

            var top = ((size.y - elmSize.y) / 2).round();

            if (top < 0) {
                top = 0;
            }


            moofx(Img).animate({
                left: left,
                top : top
            });
        },

        /**
         * Start the autoplay
         */
        autoplay: function () {
            if (this.$images.length <= 1) {
                return;
            }

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
        $createPreviews: function () {
            if (!this.$Previews) {
                return;
            }

            if (this.$images.length <= 1) {
                if (this.$Previews) {
                    this.$Previews.setStyle('display', 'none');
                }
                return;
            }

            this.$Previews.setStyle('bottom', -100);
            this.$Previews.setStyle('zIndex', 10);

            this.$Previews.set(
                'html',

                '<div class="quiqqer-gallery-slider-previews-prev">' +
                '<span class="fa fa-chevron-left"></span>' +
                '</div>' +
                '<div class="quiqqer-gallery-slider-previews-container">' +
                '<div class="quiqqer-gallery-slider-previews-containerInner"></div>' +
                '</div>' +
                '<div class="quiqqer-gallery-slider-previews-next">' +
                '<span class="fa fa-chevron-right"></span>' +
                '</div>'
            );


            var i, len;

            var self      = this,
                imageList = [];

            this.$PreviewsContainer = this.$Previews.getElement(
                '.quiqqer-gallery-slider-previews-container'
            );

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

            this.$pcSize = this.$PreviewsContainer.getSize();


            // image click action
            var imageClick = function (event) {
                var Target = event.target;

                if (!Target.hasClass('quiqqer-gallery-slider-previews-entry')) {
                    Target = Target.getParent('.quiqqer-gallery-slider-previews-entry');
                }

                var imageIndex = Target.get('data-image').toInt();

                self.$current = imageIndex - 1;
                self.next();

                self.fireEvent('imageClick', [self, self.$images[imageIndex]]);
            };


            // get image paths
            for (i = 0, len = this.$images.length; i < len; i++) {
                imageList.push('image!' + this.$images[i].preview);
            }


            // load images
            require(imageList, function () {
                var size, imgSize;
                var Container = null,
                    width     = 0;

                for (i = 0, len = arguments.length; i < len; i++) {
                    Container = new Element('div', {
                        'class'     : 'quiqqer-gallery-slider-previews-entry',
                        html        : '<img src="' + arguments[i].src + '" />',
                        events      : {
                            click: imageClick
                        },
                        'data-image': i
                    }).inject(self.$PreviewsSlider);

                    //console.log(Container.getComputedSize());
                    size    = Container.getComputedSize();
                    imgSize = Container.getElement('img').getComputedSize();

                    if (!size.totalWidth) {
                        size.totalWidth = arguments[i].width;
                    }

                    width = width +
                        size.totalWidth +
                        imgSize['padding-left'] +
                        imgSize['padding-right'];

                    width = width + Container.getStyle('marginLeft').toInt();
                    width = width + Container.getStyle('marginRight').toInt();
                }

                self.$PreviewsSlider.setStyle('width', width);

                moofx(self.$Previews).animate({
                    bottom: 0
                }, {
                    duration: 250
                });
            });
        },

        /**
         * Scrolls to the preview image
         */
        $showPreviewImage: function () {
            if (!this.$Previews) {
                return;
            }

            if (!this.$PreviewsSlider) {
                return;
            }


            this.$PreviewsSlider.getElements(
                '.quiqqer-gallery-slider-previews-entry'
            ).removeClass(
                'quiqqer-gallery-slider-active-preview'
            );

            var Img = this.$PreviewsSlider.getElement(
                '[data-image="' + this.$current + '"]'
            );

            if (!Img) {
                return;
            }

            Img.addClass('quiqqer-gallery-slider-active-preview');

            var imagePosX  = Img.getPosition(Img.getParent()).x,
                imageSizeX = Img.getSize().x,
                leftPoint  = this.$PreviewsSlider.getStyle('left').toInt() * -1,
                rightPoint = leftPoint + this.$pcSize.x,
                maxRight   = this.$PreviewsSlider.getSize().x - this.$pcSize.x;

            if (leftPoint <= imagePosX &&
                rightPoint >= (imagePosX + imageSizeX)) {
                return;
            }

            var left = imagePosX * -1;

            if (imagePosX + imageSizeX > maxRight) {
                left = maxRight * -1;
            }

            this.$PreviewsFX.animate({
                left: left
            }, {
                duration: 700
            });
        },

        /**
         * preview scroll to the left
         */
        $previewLeft: function () {
            var left = this.$PreviewsSlider.getStyle('left').toInt();

            left = left + 300;

            if (!left) {
                left = 300;
            }

            if (left > 0) {
                left = 0;
            }

            this.$PreviewsFX.animate({
                left: left
            }, {
                duration: 700
            });
        },

        /**
         * preview scroll to the right
         */
        $previewRight: function () {
            var left     = this.$PreviewsSlider.getStyle('left').toInt(),
                Last     = this.$PreviewsSlider.getLast(
                    '.quiqqer-gallery-slider-previews-entry'
                ),
                lastPos  = Last.getPosition(this.$PreviewsSlider),
                lastSize = Last.getSize();

            left = left - 300;

            if (!left) {
                left = -300;
            }

            if ((lastPos.x + lastSize.x) <= (left * -1) + this.$pcSize.x) {
                left = (lastPos.x + lastSize.x - this.$pcSize.x) * -1;
            }

            this.$PreviewsFX.animate({
                left: left
            }, {
                duration: 700
            });
        },

        /**
         * Select an image by image file name.
         *
         * @param {String} imgFilename - Full file name including ext; may contain size part (e.g. "__64x128")
         * @return {void}
         */
        selectImageByFilename: function (imgFilename) {
            const imgRegExpRemoveSize    = new RegExp('__\\d+x\\d+', 'ig');
            const imgRegExpParseFilename = new RegExp('\\/([^\\/]*)\\.\\w+$', 'igm');

            for (const [imageIndex, ImageData] of Object.entries(this.$images)) {
                const sliderImgFilename = ImageData.src.replace(imgRegExpRemoveSize, '');
                const filenameMatches   = [...sliderImgFilename.matchAll(imgRegExpParseFilename)];

                if (!filenameMatches.length || typeof filenameMatches[0][1] === 'undefined') {
                    continue;
                }

                const targetImgFilename = filenameMatches[0][1];

                if (imgFilename.indexOf(targetImgFilename) !== -1) {
                    this.$current = imageIndex - 1;
                    this.next();

                    break;
                }
            }
        },

        /**
         * @return {Boolean}
         */
        isLoaded: function () {
            return this.$loaded;
        },

        /**
         * Zoom
         */

        /**
         * execute zoom
         */
        zoom: function () {
            if (!this.getAttribute('zoom')) {
                return;
            }

            var CurrentImage = this.getElm().getElement(
                '.quiqqer-gallery-slider-image'
            );

            this.setAttribute('keyevents', false);

            new GalleryPopup({
                images : this.$images,
                current: CurrentImage.get('src'),
                events : {
                    onClose: function () {
                        this.setAttribute('keyevents', true);
                    }.bind(this)
                }
            }).open();
        }
    });
});
