
/**
 * Component gallery
 *
 * @module package/quiqqer/gallery/bin/controls/Slider
 * @author www.pcsg.de (Henning Leutz)
 */

define('package/quiqqer/gallery/bin/controls/Slider', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/utils/Math',

    URL_BIN_DIR +'QUI/lib/Assets.js'

], function(QUI, QUIControl, QUILoader, QUIMath)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/gallery/bin/controls/Slider',

        Binds: [
            'next',
            'prev',
            'toggleAutoplay',
            'toggleRandomize',
            '$onImport',
            '$keyup'
        ],

        options : {
            controls : true,
            period   : 5000
        },

        initialize: function (options)
        {
            this.parent( options );

            this.$__animate = false;

            this.Loader     = new QUILoader();
            this.$Container = null;
            this.$Next      = null;
            this.$Prev      = null;
            this.$Title     = null;

            this.$images   = [];
            this.$current  = 0;

            this.$autoplayInterval = false;

            this.addEvents({
                onImport: this.$onImport
            });

            window.addEvent( 'keyup', this.$keyup );
        },

        /**
         * event on inject
         */
        $onImport: function ()
        {
            var i, len, Entry;

            // read images
            var List = new Element('div', {
                html : this.$Elm.innerHTML.replace('<!--', '').replace('-->', ''),
                styles : {
                    display : "none"
                }
            }).inject( this.$Elm );

            var entries = List.getElements( '.entry' );

            for ( i = 0, len = entries.length; i < len; i++ )
            {
                Entry = entries[ i ];

                this.$images.push({
                    image : Entry.get( 'data-src' ),
                    title : Entry.getElement( '.title' ).get( 'html' ),
                    text  : Entry.getElement( '.text' ).get( 'html' )
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
        create : function()
        {
            if ( !this.$Elm )
            {
                this.$Elm = new Element('div', {
                    'class' : 'quiqqer-gallery-slider'
                });

            } else
            {
                this.$Elm.addClass( 'quiqqer-gallery-slider' );
            }

            this.$Elm.set({
                html : '<div class="quiqqer-gallery-slider-content">' +
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
                       '</div>'
            });

            this.Loader.inject( this.$Elm );

            this.$Container = this.$Elm.getElement( '.quiqqer-gallery-slider-content' );
            this.$Next      = this.$Elm.getElement( '.quiqqer-gallery-slider-next' );
            this.$Prev      = this.$Elm.getElement( '.quiqqer-gallery-slider-prev' );
            this.$Title     = this.$Elm.getElement( '.quiqqer-gallery-slider-title' );
            this.$Controls  = this.$Elm.getElement( '.quiqqer-gallery-slider-controls' );

            this.$Play   = this.$Elm.getElement( '.fa-play' );
            this.$Random = this.$Elm.getElement( '.fa-random' );

            this.$Controls.setStyle( 'display', 'none' );

            if ( this.getAttribute( 'controls' ) ) {
                this.$Controls.setStyle( 'display', null );
            }

            this.$Play.addEvent( 'click', this.toggleAutoplay );
            this.$Random.addEvent( 'click', this.toggleRandomize );

            this.$Next.addEvent( 'click', this.next );
            this.$Prev.addEvent( 'click', this.prev );
        },

        /**
         * show the first image
         */
        showFirst : function()
        {
            this.$current = 0;
            this.next();
        },

        /**
         * show the next image
         */
        next : function()
        {
            if ( this.$__animate ) {
                return;
            }

            if ( !this.$images.length ) {
                return;
            }

            this.$__animate = true;


            var next = this.$current + 1;

            if ( typeof this.$images[ next ] === 'undefined' ) {
                next = 1;
            }

            var self = this,
                data = this.$images[ next ];

            this.Loader.show();

            this.loadImage(data.image, function(Image)
            {
                self.Loader.hide();

                var OldImage = self.$Container.getElements( 'img'),
                    NewImage = self.$createNewImage( Image );


                self.animateOut(OldImage, 'left', function() {
                    OldImage.destroy();
                });

                self.animateIn(NewImage, 'right', function()
                {
                    self.setText( data.title, data.text );

                    self.$current   = next;
                    self.$__animate = false;
                });
            });
        },

        /**
         * show the prev image
         */
        prev : function()
        {
            if ( this.$__animate ) {
                return;
            }

            if ( !this.$images.length ) {
                return;
            }

            this.$__animate = true;


            var next = this.$current - 1;

            if ( next < 0 ) {
                next = this.$images.length - 1;
            }

            var self = this,
                data = this.$images[ next ];

            this.Loader.show();

            this.loadImage(data.image, function(Image)
            {
                self.Loader.hide();

                var OldImage = self.$Container.getElements( 'img'),
                    NewImage = self.$createNewImage( Image );


                self.animateOut(OldImage, 'right', function() {
                    OldImage.destroy();
                });

                self.animateIn(NewImage, 'left', function()
                {
                    self.setText( data.title, data.text );

                    self.$current   = next;
                    self.$__animate = false;
                });
            });
        },

        /**
         * Load the image
         *
         * @param src
         * @param callback
         */
        loadImage : function(src, callback)
        {
            Asset.image(src, {
                onLoad: function(Image) {
                    callback( Image );
                }
            });
        },

        /**
         * Out animation for an element
         *
         * @param {HTMLElement} Elm
         * @param {String} [direction]  - left|right
         * @param {Function} [callback] - callback function
         */
        animateOut : function(Elm, direction, callback)
        {
            if ( !Elm || (typeOf( Elm ) === 'elements' && !Elm.length) )
            {
                if ( typeof callback === 'function' ) {
                    callback();
                }

                return;
            }


            var left = '-100%';

            if ( typeof direction !== 'undefined' && direction == 'right' ) {
                left = '100%';
            }

            moofx( Elm ).animate({
                left : left
            }, {
                callback : function()
                {
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                }
            });
        },

        /**
         * In animation for an element
         *
         * @param {HTMLElement} Elm
         * @param {String} [direction]  - left|right
         * @param {Function} [callback] - callback function
         */
        animateIn : function(Elm, direction, callback)
        {
            if ( !Elm || (typeOf( Elm ) === 'elements' && !Elm.length) )
            {
                if ( typeof callback === 'function' ) {
                    callback();
                }

                return;
            }


            var leftStart = '-100%';

            if ( typeof direction !== 'undefined' && direction == 'right' ) {
                leftStart = '100%';
            }

            Elm.setStyle( 'left', leftStart );


            moofx( Elm ).animate({
                left : 0
            }, {
                callback : function()
                {
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                }
            });
        },

        /**
         * Set the text fot the image
         *
         * @param {String} title
         * @param {String} text
         */
        setText : function(title, text)
        {
            title = title || '';
            text  = text || '';

            this.$Title.set(
                'html',

                '<div class="quiqqer-gallery-slider-title-header">'+ title +'</div>' +
                '<div class="quiqqer-gallery-slider-title-text">'+ text +'</div>'
            );

            var Temp = this.$Title.clone().inject( this.$Title.getParent() );

            Temp.setStyles({
                height     : 0,
                visibility : 'hidden'
            });


            var dimensions = Temp.getScrollSize();

            Temp.destroy();

            moofx( this.$Title ).animate({
                height : dimensions.y + 10
            });
        },

        /**
         * Return the real image size via the image url
         *
         * @param {HTMLElement} Image
         * @returns {Object} - { x, y }
         */
        $getRealImageSize : function(Image)
        {
            var src = Image.get( 'src' );

            if ( !src.match( '__' ) ) {
                return Image.getSize();
            }

            var srcParts = src.split( '__' );

            srcParts = srcParts[ 1 ].split( '.' );
            srcParts = srcParts[ 0 ];

            var sizes = srcParts.split( 'x' );

            sizes[ 0 ] = parseInt( sizes[ 0 ] );
            sizes[ 1 ] = parseInt( sizes[ 1 ] );

            return {
                x : sizes[ 0 ],
                y : sizes[ 1 ]
            };
        },

        /**
         * Create a new image DOMNode
         *
         * @param {HTMLImageElement} Image
         * @returns {HTMLImageElement} New image DOM-Node
         */
        $createNewImage : function(Image)
        {
            var pc;
            var listSize  = this.$Container.getSize(),
                imageSize = this.$getRealImageSize( Image ),
                height    = imageSize.y,
                width     = imageSize.x;

            // set width
            pc = QUIMath.percent( listSize.x, width );

            width  = listSize.x;
            height = ( height * (pc / 100) ).round();

            // set height?
            if ( height > listSize.y )
            {
                pc = QUIMath.percent( listSize.y, height );

                height = listSize.y;
                width  = ( width * (pc / 100) ).round();
            }

            //var left = 0,
            //    top  = 0;
            //
            //if ( width < listSize.x ) {
            //    left = (( listSize.x - width ) / 2).round();
            //}
            //
            //if ( height < listSize.y ) {
            //    top = (( listSize.y - height ) / 2).round();
            //}

            return new Element('img', {
                src     : Image.src,
                'class' : 'quiqqer-gallery-slider-image',
                style   : {
                    left      : '110%',
                    height    : height,
                    maxHeight : height,
                    width     : width,
                    maxWidth  : width
                }
            }).inject( this.$Container );
        },


        /**
         * key events
         *
         * @param {DOMEvent} event
         */
        $keyup : function(event)
        {
            if ( event.key == 'left' )
            {
                this.prev();
                return;
            }

            if ( event.key == 'right' ) {
                this.next();
            }
        },

        /**
         * Start the autoplay
         */
        autoplay : function()
        {
            this.$Play.addClass( 'control-background-active' );

            if ( this.$autoplayInterval ) {
                clearInterval( this.$autoplayInterval );
            }

            this.$autoplayInterval = (function()
            {
                if ( this.$randomize ) {
                    this.$current = Number.random( 0, this.$images.length-1 );
                }

                this.next();

            }).periodical( this.getAttribute('period'), this );
        },

        /**
         * Stop the autoplay
         */
        stopAutoplay : function()
        {
            this.$Play.removeClass( 'control-background-active' );
            this.stopRandomize();

            if ( this.$autoplayInterval ) {
                clearInterval( this.$autoplayInterval );
            }
        },

        /**
         * Toggle the autoplay on / off
         */
        toggleAutoplay : function()
        {
            if ( this.$Play.hasClass( 'control-background-active' ) )
            {
                this.stopAutoplay();
                return;
            }

            this.autoplay();
        },

        /**
         * Set randomize -> on
         */
        randomize : function()
        {
            this.$randomize = true;
            this.$Random.addClass( 'control-background-active' );
            this.autoplay();
        },

        /**
         * Set randomize -> on
         */
        stopRandomize : function()
        {
            this.$randomize = false;
            this.$Random.removeClass( 'control-background-active' );
        },

        /**
         * Toggle the randomize on / off
         */
        toggleRandomize : function()
        {
            if ( this.$randomize )
            {
                this.stopRandomize();
                return;
            }

            this.randomize();
        }
    });
});