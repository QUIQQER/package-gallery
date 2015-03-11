
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
    'qui/controls/windows/Popup',
    'qui/utils/Math',
    'qui/utils/Elements',
    URL_BIN_DIR +'QUI/lib/Assets.js',

    'css!package/quiqqer/gallery/bin/controls/Grid.css'

], function(QUI, QUIControl, QUIWin, QUIMath, QUIElementUtils)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/gallery/bin/controls/Grid',

        Binds : [
            '$onImport',
            '$imageClick',
            '$resizeImageWindow',
            '$keyup',
            'loadPrevImage',
            'loadNextImage',
            'resize'
        ],

        initialize : function(options)
        {
            this.parent( options );

            this.$ImageWindow  = false;
            this.$CompleteList = false;

            this.$__resized = false;
            this.$length    = 0;

            this.addEvents({
                onImport : this.$onImport
            });

            window.addEvent( 'resize', this.resize );
        },

        /**
         * resize the control
         */
        resize : function()
        {
            var self = this;

            if ( this.$__resized ) {
                clearTimeout( this.$__resized );
            }

            // clear resize flags
            self.$__resized = (function() {
                self.$resizeImageWindow();
            }).delay( 200 );
        },

        /**
         * event on inject
         */
        $onImport : function()
        {
            var images = this.$Elm.getElements(
                '.quiqqer-gallery-grid-entry-image'
            );

            for ( var i = 0, len = images.length; i < len; i++ ) {
                images[ i ].addEvent( 'click', this.$imageClick );
            }

            // get the complete list
            var completeList = this.$Elm.getElement(
                '.quiqqer-gallery-grid-list-complete'
            );

            this.$CompleteList = new Element('div', {
                html : completeList.innerHTML.replace('<!--', '').replace('-->', ''),
                styles : {
                    display : "none"
                }
            }).inject( this.$Elm );

            this.$length = this.$CompleteList.getElements(
                '.quiqqer-gallery-grid-list-complete-entry'
            ).length;
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

            var ImageEntry = this.$CompleteList.getElement(
                '[data-src="'+ Target.get( 'href' ) +'"]'
            );

            this.$openWindow( ImageEntry );
        },

        /**
         * Create and open the Image window
         *
         * @param {HTMLElement} ImageEntry - Link Node of the Image
         */
        $openWindow : function(ImageEntry)
        {
            if ( this.$ImageWindow )
            {
                this.loadImage( ImageEntry );
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
                                     '</div>' +
                                     '<div class="qui-window-popup-stats"></div>'
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


                        // bind keys
                        window.addEvent( 'keyup', self.$keyup );

                        self.loadImage( ImageEntry );
                    },

                    onClose : function()
                    {
                        self.$ImageWindow = null;
                        window.removeEvent( 'keyup', self.$keyup );
                    }
                }
            });

            this.$ImageWindow.open();
        },

        /**
         * resizes the image window, if the window is open
         */
        $resizeImageWindow : function()
        {
            if ( !this.$ImageWindow ) {
                return;
            }

            var currentSrc = this.$ImageWindow
                                 .getElm()
                                 .getElement( '.qui-window-popup-image-preview' )
                                 .get( 'src' );

            var Current = this.$CompleteList.getElement(
                '[data-src="'+ currentSrc +'"]'
            );

            this.loadImage( Current );
        },

        /**
         * Load an image in a popup
         * @param {HTMLElement} ImageEntry - DIV Node of the Image
         */
        loadImage : function(ImageEntry)
        {
            if ( !this.$ImageWindow )
            {
                this.$openWindow( ImageEntry );
                return;
            }


            var self     = this,
                Win      = this.$ImageWindow,
                Content  = Win.getContent(),
                Buttons  = Win.getElm().getElement( '.qui-window-popup-image-buttons' ),
                BtnText  = Win.getElm().getElement( '.qui-window-popup-buttons-text' ),
                WinStats = Win.getElm().getElement( '.qui-window-popup-stats' ),
                WinImage = Content.getElement( '.qui-window-popup-image-preview' );

            Win.Loader.show();

            if ( WinImage )
            {
                moofx( WinImage ).animate({
                    opacity : 0
                });
            }

            Asset.image(ImageEntry.get( 'data-src' ), {
                onLoad: function(Image)
                {
                    var pc;

                    var height  = Image.get( 'height' ),
                        width   = Image.get( 'width' ),
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
                    if ( height > docHeight )
                    {
                        pc = QUIMath.percent( docHeight, height );

                        height = docHeight;
                        width  = ( width * (pc / 100) ).round();
                    }

                    // resize win
                    Win.setAttribute( 'maxWidth', width );
                    Win.setAttribute( 'maxHeight', height );

                    var header = ImageEntry.getElement( '.title' ).get( 'html'),
                        short  = ImageEntry.getElement( '.short' ).get( 'html' );

                    var text = '<div class="qui-window-popup-image-preview-header">'+ header +'</div>' +
                               '<div class="qui-window-popup-image-preview-text">'+ short +'</div>';

                    BtnText.set( 'html', text );

                    // get dimensions
                    var Temp = BtnText.clone().inject( BtnText.getParent() );

                    Temp.setStyles({
                        height     : 0,
                        visibility : 'hidden'
                    });

                    var dimensions = Temp.getScrollSize(),
                        newHeight  = dimensions.y + 10;

                    Temp.destroy();

                    if ( newHeight < 50 ) {
                        newHeight = 50;
                    }

                    moofx( Buttons ).animate({
                        height : newHeight
                    });


                    var childIndex = QUIElementUtils.getChildIndex( ImageEntry ) + 1;

                    WinStats.set(
                        'html',
                        childIndex +' von '+ self.$length
                    ); // #locale

                    Win.resize(true, function()
                    {
                        Content.set( 'html', '' );

                        var Img = new Element('img', {
                            'class' : 'qui-window-popup-image-preview',
                            src     : ImageEntry.get( 'data-src' ),
                            styles  : {
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

            var Current = this.$CompleteList.getElement(
                '[data-src="'+ currentSrc +'"]'
            );

            var Next = Current.getNext( '.quiqqer-gallery-grid-list-complete-entry' );

            if ( !Next )
            {
                Next = this.$CompleteList.getFirst(
                    '.quiqqer-gallery-grid-list-complete-entry'
                );
            }

            this.loadImage( Next );
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

            var Current = this.$CompleteList.getElement(
                '[data-src="'+ currentSrc +'"]'
            );

            var Prev = Current.getPrevious( '.quiqqer-gallery-grid-list-complete-entry' );

            if ( !Prev ) {
                Prev = this.$CompleteList.getLast( '.quiqqer-gallery-grid-list-complete-entry' );
            }

            this.loadImage( Prev );
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
                this.loadPrevImage();
                return;
            }

            if ( event.key == 'right' ) {
                this.loadNextImage();
            }

            if ( event.key == 'esc' ) {
                this.$ImageWindow.close();
            }
        }
    });
});
