<?php

/**
 * This file contains QUI\Gallery\EventHandler
 */

namespace QUI\Gallery;

use QUI\Template;

/**
 * Class EventHandler
 *
 * @package QUI\Gallery
 */
class EventHandler
{
    /**
     * @param Template $Template
     */
    public static function onTemplateGetHeader(Template $Template): void
    {
        $Template->extendHeaderWithJavaScriptFile(URL_OPT_DIR . 'quiqqer/gallery/bin/zoom.js');
    }
}
