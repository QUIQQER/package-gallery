<?php

/**
 * This file contains QUI\Gallery\Controls\Slider
 */
namespace QUI\Gallery\Controls;

use QUI;

/**
 * Class Slider
 *
 * @package quiqqer/gallery
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
            'class'    => 'quiqqer-gallery-slider',
            'data-qui' => 'package/quiqqer/gallery/bin/controls/Slider',
            'order'    => 'title ASC'
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
        $Engine   = QUI::getTemplateManager()->getEngine();
        $Project  = $this->_getProject();
        $Media    = $Project->getMedia();
        $folderId = $this->getAttribute( 'folderId' );

        /* @var $Folder \QUI\Projects\Media\Folder */
        if ( strpos( $folderId, 'image.php' ) !== false )
        {
            try
            {
                $Folder = QUI\Projects\Media\Utils::getMediaItemByUrl( $folderId );

            } catch ( QUI\Exception $Exception )
            {
                $Folder = false;
            }

        } else
        {
            try
            {
                $Folder = $Media->get( (int)$folderId );

            } catch ( QUI\Exception $Exception )
            {
                $Folder = false;
            }
        }

        if ( $Folder === false ) {
            $Folder = $Media->firstChild();
        }

        switch ( $this->getAttribute( 'order' ) )
        {
            case 'title DESC':
            case 'title ASC':

            case 'name DESC':
            case 'name ASC':

            case 'c_date DESC':
            case 'c_date ASC':

            case 'e_date DESC':
            case 'e_date ASC':
                $order = $this->getAttribute( 'order' );
                break;

            default:
                $order = 'name DESC';
                break;
        }

        $images = $Folder->getImages(array(
            'order' => $order
        ));

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
