
/**
 * Component gallery
 *
 * @module package/quiqqer/gallery/bin/controls/Component
 * @author www.pcsg.de (Henning Leutz)
 */

define('package/quiqqer/gallery/bin/controls/Component', [

    'qui/QUI',
    'qui/controls/Control',
    ''

], function(QUI, QUIControl)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/gallery/bin/controls/Component',

        Binds: [
            '$onImport',
            'next',
            'prev'
        ],

        initialize: function (options)
        {
            this.parent( options );

            this.$List   = null;
            this.$effect = '';

            this.addEvents({
                onImport: this.$onImport
            });
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
                Current = this.$List.getFirst();
            }

            var Next = Current.getNext();

            if ( !Next ) {
                Next = this.$List.getFirst();
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
                Current = this.$List.getLast();
            }


            var Prev = Current.getPrevious();

            if ( !Prev ) {
                Prev = this.$List.getLast();
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
            var fx = this.$effect;

            Elm.addClass( fx +'-in' );

            (function()
            {
                Elm.addClass( 'quiqqer-gallery-component-list-current' );
                Elm.removeClass( fx +'-in' );
            }).delay( 500 );
        }
    });
});
