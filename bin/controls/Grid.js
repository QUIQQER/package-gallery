
/**
 * Grid Gallery
 *
 * @module package/quiqqer/gallery/bin/controls/Grid
 * @author www.pcsg.de (Henning Leutz)
 */

define('package/quiqqer/gallery/bin/controls/Grid', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/windows/Popup',
    'qui/utils/Math',
    URL_BIN_DIR +'QUI/lib/Assets.js',

    'css!package/quiqqer/gallery/bin/controls/Grid.css'

], function(QUI, QUIControl, QUIWin, QUIMath)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/gallery/bin/controls/Grid',

        Binds : [
            '$onImport',
            '$imageClick',
            'loadPrevImage',
            'loadNextImage'
        ],

        initialize : function(options)
        {
            this.parent( options );

            this.addEvents({
                onImport : this.$onImport
            });

            this.$ImageWindow = false;
        },

        /**
         * event on inject
         */
        $onImport : function()
        {
            var images = this.$Elm.getElements( '.quiqqer-gallery-grid-entry-image' );

            for ( var i = 0, len = images.length; i < len; i++ ) {
                images[ i ].addEvent( 'click', this.$imageClick );
            }
        },

        /**
         * event - image click
         *
         * @param {DOMEvent} event
         */
        $imageClick : function(event)
        {
            if ( document.getSize().x < 767 ) {
                return true;
            }

            if ( typeOf( event ) === 'domevent' ) {
                event.stop();
            }

            var Target = event.target;

            if ( Target.nodeName != 'a' ) {
                Target = Target.getParent( 'a' );
            }

            this.$openWindow( Target );
        },

        /**
         * Create and open the Image window
         *
         * @param {HTMLElement} Link - Link Node of the Image
         */
        $openWindow : function(Link)
        {
            if ( this.$ImageWindow )
            {
                this.loadImage( Link );
                return;
            }

            var self = this;

            this.$ImageWindow = new QUIWin({
                closeButton : false,
                events :
                {
                    onOpen : function(Win)
                    {
                        var Content = Win.getContent(),
                            Elm     = Win.getElm();

                        Elm.getElement( '.qui-window-popup-buttons').destroy();

                        new Element('div', {
                            'class' : 'qui-window-popup-image-buttons',
                            html   : '<div class="qui-window-popup-buttons-prev">' +
                                         '<span class="fa fa-chevron-left icon-chevron-left"></span>' +
                                     '</div>' +
                                     '<div class="qui-window-popup-buttons-text"></div>' +
                                     '<div class="qui-window-popup-buttons-next">' +
                                         '<span class="fa fa-chevron-right icon-chevron-right"></span>' +
                                     '</div>'
                        }).inject( Win.getElm() );

                        Content.setStyles({
                            height    : null,
                            overflow  : 'hidden',
                            outline   : 'none',
                            padding   : 0,
                            textAlign : 'center'
                        });

                        Elm.setStyles({
                            boxShadow : '0 0 0 10px #fff, 0 10px 60px 10px rgba(8, 11, 19, 0.55)',
                            outline   : 'none'
                        });

                        // events
                        Elm.getElements( '.qui-window-popup-buttons-prev').addEvents({
                            click : self.loadPrevImage
                        });

                        Elm.getElements( '.qui-window-popup-buttons-next' ).addEvents({
                            click : self.loadNextImage
                        });

                        self.loadImage( Link );
                    },

                    onClose : function() {
                        self.$ImageWindow = null;
                    }
                }
            });

            this.$ImageWindow.open();
        },

        /**
         * Load an image in a popup
         * @param {HTMLElement} Link - Link Node of the Image
         */
        loadImage : function(Link)
        {
            if ( !this.$ImageWindow )
            {
                this.$openWindow( Link );
                return;
            }


            var Win      = this.$ImageWindow,
                Content  = Win.getContent(),
                BtnText  = Win.getElm().getElement( '.qui-window-popup-buttons-text'),
                WinImage = Content.getElement( '.qui-window-popup-image-preview' );

            Win.Loader.show();

            if ( WinImage )
            {
                moofx( WinImage ).animate({
                    opacity : 0
                });
            }

            Asset.image(Link.get( 'href' ), {
                onLoad: function(Image)
                {
                    var pc;

                    var height  = Image.get( 'height' ),
                        width   = Image.get( 'width'),
                        docSize = document.getSize();

                    var docWidth  = docSize.x - 100,
                        docHeight = docSize.y - 100;

                    // set width ?
                    if ( width > docWidth )
                    {
                        pc = QUIMath.percent( docWidth, width );

                        width  = docWidth;
                        height = ( height * (pc / 100) ).round();
                    }

                    // set height ?
                    if ( height < docHeight )
                    {
                        pc = QUIMath.percent( docHeight, height );

                        height = docHeight;
                        width  = ( width * (pc / 100) ).round();
                    }

                    // resize win
                    Win.setAttribute( 'maxWidth', width );
                    Win.setAttribute( 'maxHeight', height );

                    BtnText.set( 'html', Link.getElement( 'img').get( 'title' ) );

                    Win.resize(true, function()
                    {
                        Content.set( 'html', '' );

                        var Img = new Element('img', {
                            'class' : 'qui-window-popup-image-preview',
                            src     : Link.get( 'href' ),
                            styles : {
                                opacity : 0
                            }
                        }).inject( Content );

                        moofx( Img ).animate({
                            opacity : 1
                        });

                        Win.Loader.hide();
                    });
                }
            });
        },

        /**
         * Load the next image
         */
        loadNextImage : function()
        {
            if ( !this.$ImageWindow ) {
                return;
            }

            var currentSrc = this.$ImageWindow
                                 .getElm()
                                 .getElement( '.qui-window-popup-image-preview' )
                                 .get( 'src' );

            var Current = this.getElm().getElement( '[href="'+ currentSrc +'"]'),
                Parent  = Current.getParent( '.quiqqer-gallery-grid-entry'),
                Next    = Parent.getNext( '.quiqqer-gallery-grid-entry' );

            if ( !Next ) {
                Next = this.getElm().getFirst( '.quiqqer-gallery-grid-entry' );
            }

            this.loadImage( Next.getElement( 'a' ) );
        },

        /**
         * Load the pervious image
         */
        loadPrevImage : function()
        {
            if ( !this.$ImageWindow ) {
                return;
            }

            var currentSrc = this.$ImageWindow
                                 .getElm()
                                 .getElement( '.qui-window-popup-image-preview' )
                                 .get( 'src' );

            var Current = this.getElm().getElement( '[href="'+ currentSrc +'"]'),
                Parent  = Current.getParent( '.quiqqer-gallery-grid-entry'),
                Prev    = Parent.getPrevious( '.quiqqer-gallery-grid-entry' );

            if ( !Prev ) {
                Prev = this.getElm().getLast( '.quiqqer-gallery-grid-entry' );
            }

            this.loadImage( Prev.getElement( 'a' ) );
        }
    });
});
