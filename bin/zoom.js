/**
 * Loads zoom functionality
 */
require(['package/quiqqer/gallery/bin/utils/ZoomImages'], function (Zoom) {
    "use strict";

    window.addEvent('domready', function() {
        Zoom.parseElement(document.body);
    });
});
