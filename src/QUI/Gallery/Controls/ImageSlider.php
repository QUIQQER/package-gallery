<?php

/**
 * This file contains QUI\Gallery\Controls\ImageSlider
 */

namespace QUI\Gallery\Controls;

use QUI;

/**
 * Class Slider
 * @package QUI\Gallery\Controls\ImageSlider
 */
class ImageSlider extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'class'    => 'quiqqer-bricks-children-slider',
            'nodeName' => 'section',
            'site'     => '',
            'order'    => false,
            'limit'    => false,
            'moreLink' => false,
            'Project'  => false,
            'folderId' => false,
//            'data-qui' => 'package/quiqqer/gallery/bin/controls/Slider/ImageSlider',
            'height'   => 200
        ));

        $this->addCSSFile(
            dirname(__FILE__) . '/ImageSlider.css'
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
        $Engine  = QUI::getTemplateManager()->getEngine();
        $Project = $this->getProject();
        $Media   = $Project->getMedia();

        /* @var $Folder \QUI\Projects\Media\Folder */
        $Folder = $Media->get($this->getAttribute('folderId'));


        $MoreLink = null;

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

        $images = $Folder->getImages(array(
//            'limit' => $start . ',' . $max,
            'order' => $order
        ));


        if (!$this->getAttribute('height')) {
            $this->setAttribute('height', 200);
        }

        if ($this->getAttribute('moreLink')) {
            try {
                $MoreLink = QUI\Projects\Site\Utils::getSiteByLink($this->getAttribute('moreLink'));
            } catch (QUI\Exception $Exception) {
            }
        }

        $Engine->assign(array(
            'this'     => $this,
            'images'   => $images,
            'MoreLink' => $MoreLink
        ));

        echo "<pre>";
        print_r($images);
        echo "</pre>";

        return;

        return $Engine->fetch(dirname(__FILE__) . '/ImageSlider.html');
    }

    /**
     * Return the control template
     *
     * @return string
     */
    protected function getTemplate()
    {
        return dirname(__FILE__) . '/ImageSlider.html';
    }
}
