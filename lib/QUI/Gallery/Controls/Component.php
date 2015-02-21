<?php

/**
 * This file contains QUI\Gallery\Controls\Component
 */

namespace QUI\Gallery\Controls;

use QUI;

/**
 * Class NewestEntries
 *
 * @package quiqqer/blog
 */
class Component extends QUI\Control
{
    /**
     * constructor
     * @param Array $attributes
     */
    public function __construct($attributes=array())
    {
        // default options
        $this->setAttributes(array(
            'Project'   => false,
            'folderId'  => false,
            'class'     => 'quiqqer-gallery-component control-background',
            'qui-class' => 'package/quiqqer/gallery/bin/controls/Component'
        ));

        parent::setAttributes( $attributes );

        // css files
        $dir = dirname( __FILE__ );

        $this->addCSSFile( $dir .'/Component.css' );

        switch ( $this->getAttribute( 'effect' ) )
        {
            case 'forwardPulse':
                $this->addCSSFile( $dir .'/Component.fx.forwardPulse.css' );
                $this->setAttribute( 'data-effect', 'forwardPulse' );
            break;

            case 'coverflow':
                $this->addCSSFile( $dir .'/Component.fx.coverflow.css' );
                $this->setAttribute( 'data-effect', 'coverflow' );
            break;
        }
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
        try
        {
            $Folder = $Media->get( $this->getAttribute('folderId') );

            if ( !QUI\Projects\Media\Utils::isFolder( $Folder ) ) {
                return '';
            }

        } catch ( QUI\Exception $Exception )
        {

        }

        $Engine->assign(array(
            'Rewrite' => QUI::getRewrite(),
            'this'    => $this,
            'Folder'  => $Folder,
            'images'  => $Folder->getImages(),
            'Site'    => $this->_getSite()
        ));

        return $Engine->fetch( dirname( __FILE__ ) .'/Component.html' );
    }

    /**
     * @return mixed|QUI\Projects\Site
     */
    protected function _getSite()
    {
        if ( $this->getAttribute( 'Site' ) ) {
            return $this->getAttribute( 'Site' );
        }

        $Site = \QUI::getRewrite()->getSite();

        $this->setAttribute( 'Site', $Site );

        return $Site;
    }
}


