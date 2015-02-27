<?php


/**
 * This file contains QUI\Gallery\Controls\Grid
 */
namespace QUI\Gallery\Controls;

use QUI;

/**
 * Class NewestEntries
 *
 * @package quiqqer/blog
 */
class Grid extends QUI\Control
{
    /**
     * constructor
     * @param Array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'max'      => 9,
            'start'    => 0,
            'Project'  => false,
            'folderId' => false,
            'class'    => 'quiqqer-gallery-grid'
        ));

        parent::setAttributes( $attributes );

        $this->addCSSFile(
            dirname(__FILE__) . '/Grid.css'
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
        $start  = $this->getAttribute( 'start' );
        $max    = $this->getAttribute( 'max' );

        if ( !is_numeric( $start ) ) {
            $start = 0;
        }

        if ( !is_numeric( $max ) ) {
            $max = 9;
        }

        $completeList = $Folder->getImages();

        $images = $Folder->getImages(array(
            'limit' => $start .','. $max
        ));

        $count = $Folder->getImages(array(
            'count' => true
        ));

        $sheets = ceil( $count / $max );

        $Engine->assign(array(
            'Rewrite' => QUI::getRewrite(),
            'this'    => $this,
            'Folder'  => $Folder,
            'images'  => $images,
            'Site'    => $this->_getSite(),
            'sheets'  => $sheets,
            'completeList' => $completeList
        ));

        return $Engine->fetch( dirname( __FILE__ ) .'/Grid.html' );
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


