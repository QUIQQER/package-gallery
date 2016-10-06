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
    protected $ownImages = array();

    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'Project'          => false,
            'folderId'         => false,
            'class'            => 'quiqqer-gallery-slider',
            'data-qui'         => 'package/quiqqer/gallery/bin/controls/Slider',
            'order'            => false,
            'placeholderimage' => false,
            'placeholdercolor' => false
        ));

        parent::__construct($attributes);

        $this->addCSSFile(
            OPT_DIR . 'quiqqer/gallery/bin/controls/Slider.css'
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
        $Project  = $this->getProject();
        $Media    = $Project->getMedia();
        $folderId = $this->getAttribute('folderId');
        $Folder   = false;
        $images   = array();

        $this->setAttribute(
            'data-qui-options-placeholdercolor',
            $this->getAttribute('placeholdercolor')
        );

        if ($this->getAttribute('placeholderimage')) {
            $this->setAttribute(
                'data-qui-options-placeholderimage',
                $this->getAttribute('placeholderimage')
            );
        } else {
            $Placeholder = $Media->getPlaceholderImage();

            if ($Placeholder) {
                $this->setAttribute(
                    'data-qui-options-placeholderimage',
                    $Placeholder->getSizeCacheUrl()
                );
            }
        }

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

        if ($Folder === false && empty($this->ownImages)) {
            $Placeholder = $Project->getMedia()->getPlaceholderImage();

            if ($Placeholder) {
                $this->ownImages[] = $Placeholder;
            }
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
                if ($Folder) {
                    $order = $Folder->getAttribute('order');
                }

                if (empty($order)) {
                    $order = 'name DESC';
                }

                break;
        }

        if ($Folder) {
            $images = $Folder->getImages(array(
                'order' => $order
            ));
        } elseif (!empty($this->ownImages)) {
            $images = $this->ownImages;
        }


        $Engine->assign(array(
            'Rewrite' => QUI::getRewrite(),
            'this'    => $this,
            'Folder'  => $Folder,
            'images'  => $images,
            'Site'    => $this->getSite()
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
        $this->ownImages[] = $Image;
    }

    /**
     * @return mixed|QUI\Projects\Site
     */
    protected function getSite()
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        $Site = QUI::getRewrite()->getSite();

        $this->setAttribute('Site', $Site);

        return $Site;
    }
}
