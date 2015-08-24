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
     * list of images
     *
     * @var bool
     */
    protected $_ownImages = array();

    /**
     * constructor
     *
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

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/Slider.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine   = QUI::getTemplateManager()->getEngine();
        $Project  = $this->_getProject();
        $Media    = $Project->getMedia();
        $folderId = $this->getAttribute('folderId');
        $Folder   = false;
        $images   = array();

        /* @var $Folder \QUI\Projects\Media\Folder */
        if (strpos($folderId, 'image.php') !== false) {
            try {
                $Folder = QUI\Projects\Media\Utils::getMediaItemByUrl(
                    $folderId
                );

            } catch (QUI\Exception $Exception) {
                $Folder = false;
            }

        } elseif ($folderId) {

            try {
                $Folder = $Media->get((int)$folderId);

            } catch (QUI\Exception $Exception) {
                $Folder = false;
            }
        }

        if ($Folder === false && empty($this->_ownImages)) {
            $Folder = $Media->firstChild();
        }

        switch ($this->getAttribute('order')) {
            case 'title DESC':
            case 'title ASC':

            case 'name DESC':
            case 'name ASC':

            case 'c_date DESC':
            case 'c_date ASC':

            case 'e_date DESC':
            case 'e_date ASC':

            case 'priority DESC':
            case 'priority ASC':
                $order = $this->getAttribute('order');
                break;

            default:
                $order = 'name DESC';
                break;
        }

        if ($Folder) {

            $images = $Folder->getImages(array(
                'order' => $order
            ));

        } elseif (!empty($this->_ownImages)) {
            $images = $this->_ownImages;
        }


        $Engine->assign(array(
            'Rewrite' => QUI::getRewrite(),
            'this'    => $this,
            'Folder'  => $Folder,
            'images'  => $images,
            'Site'    => $this->_getSite()
        ));

        return $Engine->fetch(dirname(__FILE__) . '/Slider.html');
    }

    /**
     * Add an own image, no folder id needed
     *
     * @param QUI\Projects\Media\Image $Image
     */
    public function addImage(QUI\Projects\Media\Image $Image)
    {
        $this->_ownImages[] = $Image;
    }

    /**
     * @return mixed|QUI\Projects\Site
     */
    protected function _getSite()
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        $Site = QUI::getRewrite()->getSite();

        $this->setAttribute('Site', $Site);

        return $Site;
    }
}
