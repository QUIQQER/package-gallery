
/**
 * Component gallery
 *
 * @module package/quiqqer/gallery/bin/controls/Component
 * @author www.pcsg.de (Henning Leutz)
 */

define('package/quiqqer/gallery/bin/controls/Component', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Math'

], function(QUI, QUIControl, QUIMath)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/gallery/bin/controls/Component',

        Binds: [
            '$onImport',
            'next',
            'prev',
            'resize'
        ],

        initialize: function (options)
        {
            this.parent( options );

            this.$effect    = '';
            this.$__resized = false;

            this.$List      = null;
            this.$Display   = false;
            this.$FXDisplay = false;

            this.addEvents({
                onImport: this.$onImport
            });

            window.addEvent( 'resize', this.resize );
        },

        /**
         * Resize the control
         */
        resize : function()
        {
            var self = this;

            if ( this.$__resized ) {
                clearTimeout( this.$__resized );
            }

            // clear resize flags
            self.$__resized = (function() {
                self.getElm().getElements( 'img' ).set( 'data-resized', null );
            }).delay( 200 );
        },

        /**
         * event on inject
         */
        $onImport: function ()
        {
            var Elm  = this.getElm(),
                Prev = Elm.getElement( '.quiqqer-gallery-component-prev'),
                Next = Elm.getElement( '.quiqqer-gallery-component-next' );

            this.$List   = Elm.getElement( 'ul' );
            this.$effect = Elm.get( 'data-effect' );

            Prev.addEvent( 'click', this.prev );
            Next.addEvent( 'click', this.next );

            // text display
            this.$Display = new Element('div', {
                'class' : 'quiqqer-gallery-component-textdisplay',
                styles  : {
                    opacity : 0
                }
            }).inject( this.$List );

            this.$FXDisplay = moofx( this.$Display );

            this.showFirst();
        },

        /**
         * show the first image
         */
        showFirst : function()
        {
            var Current = this.getElm().getElement(
                '.quiqqer-gallery-component-list-current'
            );

            if ( Current ) {
                this.animateOut( Current );
            }

            this.animateIn( this.$List.getFirst() );
        },

        /**
         * show the next image
         */
        next : function()
        {
            var Current = this.getElm().getElement(
                '.quiqqer-gallery-component-list-current'
            );

            if ( !Current ) {
                Current = this.$List.getFirst( 'li' );
            }

            var Next = Current.getNext( 'li' );

            if ( !Next ) {
                Next = this.$List.getFirst( 'li' );
            }

            if ( Current ) {
                this.animateOut( Current );
            }

            this.animateIn( Next );
        },

        /**
         * show the prev image
         */
        prev : function()
        {
            var Current = this.getElm().getElement(
                '.quiqqer-gallery-component-list-current'
            );

            if ( !Current ) {
                Current = this.$List.getLast( 'li' );
            }


            var Prev = Current.getPrevious( 'li' );

            if ( !Prev ) {
                Prev = this.$List.getLast( 'li' );
            }


            if ( Current ) {
                this.animateOut( Current );
            }

            this.animateIn( Prev );
        },

        /**
         * Out Animate for an element
         * @param {HTMLElement} Elm
         */
        animateOut : function(Elm)
        {
            var fx = this.$effect;

            Elm.removeClass( fx +'-in' );
            Elm.addClass( fx +'-out' );

            this.hideTextDisplay();

            (function()
            {
                Elm.removeClass( fx +'-out' );
                Elm.removeClass( 'quiqqer-gallery-component-list-current' );

            }).delay( 500 );
        },

        /**
         * In animation for an element
         * @param {HTMLElement} Elm
         */
        animateIn : function(Elm)
        {
            var pc;
            var Image = Elm.getElement( 'img' ),
                text  = Image.get( 'alt' ),
                fx    = this.$effect;


            if ( !Image.get( 'data-resized' ) )
            {
                var listSize  = this.$List.getSize(),
                    imageSize = this.$getRealImageSize( Image ),
                    height    = imageSize.y,
                    width     = imageSize.x;


                // set width
                pc = QUIMath.percent( listSize.x, width );

                width  = listSize.x;
                height = ( height * (pc / 100) ).round();

                // set height?
                if ( height < listSize.y )
                {
                    pc = QUIMath.percent( listSize.y, height );

                    height = listSize.y;
                    width  = ( width * (pc / 100) ).round();
                }


                // set image proportions
                Image.setStyles({
                    height    : height,
                    maxHeight : height,
                    width     : width,
                    maxWidth  : width
                });

                Image.set( 'data-resized', 1 );
            }


            // slide in
            Elm.addClass( fx +'-in' );

            if ( !text || text === '' ) {
                text = Image.get( 'title' );
            }

            this.showTextDisplay( text );

            (function()
            {
                Elm.addClass( 'quiqqer-gallery-component-list-current' );
                Elm.removeClass( fx +'-in' );

            }).delay( 500 );
        },

        /**
         * Show the text display
         *
         * @param {String} text
         */
        showTextDisplay : function(text)
        {
            this.$Display.set( 'html', text );

            this.$FXDisplay.animate({
                opacity : 1
            });
        },

        /**
         * hide the text display
         */
        hideTextDisplay : function()
        {
            var self = this;

            this.$FXDisplay.animate({
                opacity : 0
            }, {
                callback : function() {
                    self.$Display.set( 'html', '' );
                }
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
        }
    });
});
