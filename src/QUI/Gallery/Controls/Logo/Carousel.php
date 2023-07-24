<?php

/**
 * This file contains \QUI\Gallery\Controls\Logo\Carousel
 */

namespace QUI\Gallery\Controls\Logo;

use QUI;

/**
 * Class Carousel
 * @package QUI\Gallery\Controls\Logo\Carousel
 */
class Carousel extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'class'               => 'quiqqer-gallery-logoCarousel',
            'nodeName'            => 'section',
            'site'                => '',
            'Project'             => false,
            'folderId'            => false,
            'perView'             => 3,
            'maxImgHeight'        => 100,
            'delay'               => 3000,
            'minSlideWidth'       => 150,
            'logoBackgroundColor' => false,
            'order'               => false,
            'data-qui'            => 'package/quiqqer/gallery/bin/controls/Logo/Carousel',
            'grayscale'           => false,
            'hoverpause'          => false
        ]);

        $this->addCSSFile(
            \dirname(__FILE__).'/Carousel.css'
        );

        parent::__construct($attributes);
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

        $maxImageHeight = '200px';
        if ($this->getAttribute('maxImgHeight') != '') {
            $maxImageHeight = $this->getAttribute('maxImgHeight');
        }

        $perView = 3;
        if ($this->getAttribute('perView') != '') {
            $perView = $this->getAttribute('perView');
        }

        $delay = 2000;
        if ($this->getAttribute('delay') != '') {
            $delay = $this->getAttribute('delay');
        }

        $grayscale = false;
        if ($this->getAttribute('grayscale') != '') {
            $grayscale = $this->getAttribute('grayscale');
        }

        $hoverpause = false;
        if ($this->getAttribute('hoverpause') != '') {
            $hoverpause = $this->getAttribute('hoverpause');
        }

        $minSlideWidth = 150;
        if ($this->getAttribute('minSlideWidth') != '') {
            $minSlideWidth = $this->getAttribute('minSlideWidth');
        }

        $this->setJavaScriptControlOption('perview', intval($perView));
        $this->setJavaScriptControlOption('delay', intval($delay));
        $this->setJavaScriptControlOption('hoverpause', boolval($hoverpause));
        $this->setJavaScriptControlOption('minslidewidth', boolval($minSlideWidth));

        /* @var $Folder \QUI\Projects\Media\Folder */
        if (\strpos($folderId, 'image.php') !== false) {
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

        $images = $Folder->getImages([
            'order' => $order
        ]);

        if ($this->getAttribute('max') && \count($images) > $this->getAttribute('max')) {
            $images = \array_slice($images, 0, $this->getAttribute('max'));
        }

        $this->setStyles([
            '--qui--logoCarousel-height' => $maxImageHeight."px"
        ]);

        $Engine->assign([
            'this'                => $this,
            'images'              => $images,
            'maxImgHeight'        => $maxImageHeight,
            'grayscale'           => $grayscale,
            'logoBackgroundColor' => $this->getAttribute('logoBackgroundColor')
        ]);

        return $Engine->fetch($this->getTemplate());
    }

    /**
     * Return the control template
     *
     * @return string
     */
    protected function getTemplate()
    {
        return \dirname(__FILE__).'/Carousel.html';
    }
}
