<?php

/**
 * This file contains QUI\Gallery\Controls\Slider
 */
namespace QUI\Gallery\Controls;

use QUI;

/**
 * Class NewestEntries
 *
 * @package quiqqer/blog
 */
class Slider extends QUI\Control
{
    /**
     * constructor
     * @param Array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'Project'  => false,
            'folderId' => false,
            'class'    => 'quiqqer-gallery-slider'
        ));

        parent::setAttributes( $attributes );

        $this->addCSSFile(
            dirname(__FILE__) . '/Slider.css'
        );
    }

    /**
     * (non-PHPdoc)
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine  = QUI::getTemplateManager()->getEngine();
        $Project = $this->_getProject();
        $Media   = $Project->getMedia();

        /* @var $Folder \QUI\Projects\Media\Folder */
        $Folder = $Media->get( $this->getAttribute( 'folderId' ) );
        $images = $Folder->getImages();

        $Engine->assign(array(
            'Rewrite' => QUI::getRewrite(),
            'this'    => $this,
            'Folder'  => $Folder,
            'images'  => $images,
            'Site'    => $this->_getSite()
        ));

        return $Engine->fetch( dirname( __FILE__ ) .'/Slider.html' );
    }

    /**
     * @return mixed|QUI\Projects\Site
     */
    protected function _getSite()
    {
        if ( $this->getAttribute( 'Site' ) ) {
            return $this->getAttribute( 'Site' );
        }

        $Site = QUI::getRewrite()->getSite();

        $this->setAttribute( 'Site', $Site );

        return $Site;
    }
}


