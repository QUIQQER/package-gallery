
/**
 * Component gallery
 *
 * @module package/quiqqer/gallery/bin/controls/Component
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/loader/Loader
 * @require qui/utils/Math
 */

define('package/quiqqer/gallery/bin/controls/Component', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/utils/Math'

], function(QUI, QUIControl, QUILoader, QUIMath)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/gallery/bin/controls/Component',

        Binds: [
            'next',
            'prev',
            'resize',
            '$onImport',
            '$keyup'
        ],

        initialize: function (options)
        {
            this.parent( options );

            this.$effect    = '';
            this.$__resized = false;
            this.$__animate = false;

            this.$List      = null;
            this.$Display   = false;
            this.$FXDisplay = false;
            this.Loader     = new QUILoader();

            this.$parentsOverflowAuto   = new Elements();
            this.$parentsOverflowHidden = new Elements();


            this.addEvents({
                onImport: this.$onImport
            });

            window.addEvent( 'resize', this.resize );
            window.addEvent( 'keyup', this.$keyup );
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
            self.$__resized = (function()
            {
                self.getElm().getElements( 'img' ).set( 'data-resized', null );

                var Current = self.getElm().getElement(
                    '.quiqqer-gallery-component-list-current'
                );

                if ( Current ) {
                    self.animateIn( Current );
                }

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

            this.Loader.inject( Elm );
            this.Loader.show();

            Elm.setStyle( 'overflow', 'hidden' );

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


            var parents = this.getElm().getParents();

            for ( var i = 0, len = parents.length; i < len; i++ )
            {
                if ( parents[ i ].nodeName === 'BODY' ) {
                    break;
                }

                if ( parents[ i ].getStyle( 'overflow-x' ) === 'auto' ) {
                    this.$parentsOverflowAuto.push( parents[ i ] );
                }

                if ( parents[ i ].getStyle( 'overflow-x' ) === 'hidden' ) {
                    this.$parentsOverflowHidden.push( parents[ i ] );
                }
            }

            this.showFirst();

            (function()
            {
                this.Loader.hide();
                Elm.setStyle( 'overflow', null );
            }).delay( 500, this );
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
            if ( this.$__animate ) {
                return;
            }

            this.$__animate = true;

            this.$parentsOverflowAuto.setStyle( 'overflowX', 'visible' );
            this.$parentsOverflowHidden.setStyle( 'overflowX', 'visible' );
            document.body.addClass( '__quiqqer-gallery-component--body' );


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
                this.animateOut( Current, 'left' );
            }

            this.animateIn( Next, 'right' );

            (function()
            {
                this.$__animate = false;
                this.$parentsOverflowAuto.setStyle( 'overflowX', 'auto' );
                this.$parentsOverflowHidden.setStyle( 'overflowX', 'hidden' );
                document.body.removeClass( '__quiqqer-gallery-component--body' );

            }).delay( 500, this );
        },

        /**
         * show the prev image
         */
        prev : function()
        {
            if ( this.$__animate ) {
                return;
            }

            this.$__animate = true;

            this.$parentsOverflowAuto.setStyle( 'overflowX', 'visible' );
            this.$parentsOverflowHidden.setStyle( 'overflowX', 'visible' );
            document.body.addClass( '__quiqqer-gallery-component--body' );

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
                this.animateOut( Current, 'right' );
            }

            this.animateIn( Prev, 'left' );

            (function()
            {
                this.$__animate = false;
                this.$parentsOverflowAuto.setStyle( 'overflowX', 'auto' );
                this.$parentsOverflowHidden.setStyle( 'overflowX', 'hidden' );
                document.body.removeClass( '__quiqqer-gallery-component--body' );

            }).delay( 500, this );
        },

        /**
         * Out Animate for an element
         * @param {HTMLElement} Elm
         * @param {String} [direction] - left|right
         */
        animateOut : function(Elm, direction)
        {
            var fx = this.$effect;

            direction = direction || 'left';

            Elm.removeClass( 'quiqqer-gallery-component-list-current' );
            Elm.removeClass( fx +'-in-left' );
            Elm.removeClass( fx +'-in-right' );

            switch ( direction )
            {
                case 'left':
                    Elm.addClass( fx +'-out-left' );
                break;

                case 'right':
                    Elm.addClass( fx +'-out-right' );
                break;
            }


            this.hideTextDisplay();

            (function()
            {
                Elm.removeClass( fx +'-out-left' );
                Elm.removeClass( fx +'-out-right' );
            }).delay( 500 );
        },

        /**
         * In animation for an element
         * @param {HTMLElement} Elm
         * @param {String} [direction] - left|right
         */
        animateIn : function(Elm, direction)
        {
            var pc;
            var Image = Elm.getElement( 'img' ),
                text  = Image.get( 'alt' ),
                fx    = this.$effect;

            direction = direction || 'right';

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
                if ( height > listSize.y )
                {
                    pc = QUIMath.percent( listSize.y, height );

                    height = listSize.y;
                    width  = ( width * (pc / 100) ).round();
                }

                var left = 0,
                    top  = 0;

                if ( width < listSize.x ) {
                    left = (( listSize.x - width ) / 2).round();
                }

                if ( height < listSize.y ) {
                    top = (( listSize.y - height ) / 2).round();
                }

                // set image proportions
                Image.setStyles({
                    height    : height,
                    maxHeight : height,
                    width     : width,
                    maxWidth  : width,
                    left      : left,
                    top       : top
                });

                Image.set( 'data-resized', 1 );
            }


            // slide in
            switch ( direction )
            {
                case 'left':
                    Elm.addClass( fx +'-in-left' );
                    break;

                case 'right':
                    Elm.addClass( fx +'-in-right' );
                    break;
            }

            if ( !text || text === '' ) {
                text = Image.get( 'title' );
            }

            this.showTextDisplay( text );

            (function()
            {
                Elm.addClass( 'quiqqer-gallery-component-list-current' );
                Elm.removeClass( fx +'-in-left' );
                Elm.removeClass( fx +'-in-right' );

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
        }
    });
});
