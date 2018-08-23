/**
 * Loads zoom functionality
 */
var needles = ['package/quiqqer/gallery/bin/utils/ZoomImages'];

if (typeof loadMootools !== 'undefined') {
    needles.push('MooTools');
}

require(needles, function (Zoom) {
    "use strict";

    window.addEvent('domready', function () {
        Zoom.parseElement(document.body);
    });
});
