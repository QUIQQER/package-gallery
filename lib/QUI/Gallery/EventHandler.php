<?php

/**
 * This file contains QUI\Gallery\EventHandler
 */
namespace QUI\Gallery;

/**
 * Class EventHandler
 * @package QUI\Gallery
 */
class EventHandler
{
    /**
     * @param \QUI\Template $Template
     */
    public static function onTemplateGetHeader($Template)
    {
        $Template->extendHeaderWithJavaScriptFile(
            URL_OPT_DIR .'quiqqer/gallery/bin/zoom.js',
            true
        );
    }
}
