<?php

/**
 * This file contains QUI\Gallery\Bricks\GridAdvanced
 */

namespace QUI\Gallery\Bricks;

use QUI;

/**
 * Class Grid
 *
 * Brick that displays images in a grid.
 *
 * @author  www.pcsg.de (Michael Danielczok)
 *
 * @package quiqqer/gallery
 */
class GridAdvanced extends QUI\Control
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
            'class'           => 'quiqqer-gallery-brick-gridAdvanced',
            'max'             => 12,
            'start'           => 0,
            'entriesPerLine ' => 3,
            'folder'          => false,
            'scaleImage'      => true,
            'addGap'          => true,
            'showImageTitle'  => false,
            'order'           => 'name ASC',
            'usePagination'   => false,
            'titleClickable'  => 0, // 1 = open image
            'centerImage'     => true,
        ]);

        parent::__construct($attributes);
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        try {
            $Folder = QUI\Projects\Media\Utils::getMediaItemByUrl($this->getAttribute('folderId'));
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::writeException($Exception);

            return '';
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
                $order = 'name ASC';
                break;
        }

        $GridAdvancedGallery = new QUI\Gallery\Controls\GridAdvanced([
            'max'            => $this->getAttribute('max'),
            'start'          => $this->getAttribute('start'),
            'entriesPerLine' => $this->getAttribute('entriesPerLine'),
            'scaleImage'     => $this->getAttribute('scaleImage'),
            'addGap'         => $this->getAttribute('addGap'),
            'showImageTitle' => $this->getAttribute('showImageTitle'),
            'centerImage'    => $this->getAttribute('centerImage'),
            'folderId'       => $Folder->getId(),
            'class'          => 'quiqqer-gallery-grid',
            'order'          => $order,
            'usePagination'  => false,
            'titleClickable' => $this->getAttribute('titleClickable') ? 1 : 0,
            'template'       => '2perRow'
        ]);

        $Engine->assign([
            'this'                    => $this,
            'htmlGridAdvancedGallery' => $GridAdvancedGallery->create()
        ]);

        $this->addCSSFiles($GridAdvancedGallery->getCSSFiles());

        return $Engine->fetch(dirname(__FILE__).'/GridAdvanced.html');
    }
}
