<?php

/**
 * This file contains \QUI\Gallery\Controls\Logo\Slider
 */

namespace QUI\Gallery\Controls\Logo;

use QUI;

/**
 * Class Slider
 * @package QUI\Gallery\Controls\Logo\Slider
 */
class Slider extends QUI\Control
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
            'class'         => 'quiqqer-gallery-logoSlider',
            'nodeName'      => 'section',
            'site'          => '',
            'order'         => false,
            'max'           => false,
            'moreLink'      => false,
            'Project'       => false,
            'folderId'      => false,
            'data-qui'      => 'package/quiqqer/gallery/bin/controls/ImageSlider2',
            'desktopHeight' => 200,
            'mobileHeight'  => 100
        ]);

        $this->addCSSFile(
            \dirname(__FILE__).'/Slider.css'
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
        $Engine        = QUI::getTemplateManager()->getEngine();
        $Project       = $this->getProject();
        $Media         = $Project->getMedia();
        $folderId      = $this->getAttribute('folderId');
        $Folder        = false;
        $desktopHeight = '200px';
        $mobileHeight  = '100px';

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

        $images = $Folder->getImages([
            'order' => $order
        ]);

        if ($this->getAttribute('max') && \count($images) > $this->getAttribute('max')) {
            $images = \array_slice($images, 0, $this->getAttribute('max'));
        }

        if ($this->getAttribute('desktopHeight')) {
            $desktopHeight = $this->getAttribute('desktopHeight').'px';
        }

        if ($this->getAttribute('mobileHeight')) {
            $mobileHeight = $this->getAttribute('mobileHeight').'px';
        }

        $this->setStyles([
            '--qui--logoSlider-desktopHeight' => $desktopHeight,
            '--qui--logoSlider-mobileHeight'  => $mobileHeight,
            '--qui--logoSlider-height'        => $desktopHeight
        ]);

        if ($this->getAttribute('moreLink')) {
            try {
                $MoreLink = QUI\Projects\Site\Utils::getSiteByLink($this->getAttribute('moreLink'));
            } catch (QUI\Exception $Exception) {
            }
        }

        $Engine->assign([
            'this'     => $this,
            'images'   => $images,
            'MoreLink' => $MoreLink
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
        return \dirname(__FILE__).'/Slider.html';
    }
}
