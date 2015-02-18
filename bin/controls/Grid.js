
/**
 * Grid Gallery
 *
 * @module package/quiqqer/gallery/bin/controls/Grid
 * @author www.pcsg.de (Henning Leutz)
 */

define('package/quiqqer/gallery/bin/controls/Grid', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/windows/Popup'

], function(QUI, QUIControl, QUIWin)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/gallery/bin/controls/Grid',

        Binds : [
            '$onImport',
            '$imageClick'
        ],

        initialize : function(options)
        {
            this.parent( options );

            this.addEvents({
                onImport : this.$onImport
            });
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
            if ( typeOf( event ) === 'domevent' ) {
                event.stop();
            }

            var Target = event.target;

            if ( Target.nodeName != 'a' ) {
                Target = Target.getParent( 'a' );
            }

            new QUIWin({
                title  : Target.getNext( '.quiqqer-gallery-grid-entry-text').get( 'html' ),
                events :
                {
                    onOpen : function(Win)
                    {
                        var Content = Win.getContent();

                        Content.setStyles({
                            textAlign : 'center'
                        });

                        new Element('img', {
                            src    : Target.get( 'href' ),
                            styles : {
                                maxHeight : '100%',
                                maxWidth  : '100%'
                            }
                        }).inject( Content );

                    }
                }
            }).open();
        }
    });

});