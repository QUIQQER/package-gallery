<?php

/**
 * This file contains QUI\Gallery\Bricks\Grid
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
class Grid extends QUI\Control
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
            'max'            => 9,
            'start'          => 0,
            'perLine '       => 3,
            'Project'        => false,
            'folderId'       => false,
            'class'          => 'quiqqer-gallery-brick-grid',
            'order'          => 'title ASC',
            'usePagination'  => false,
            'titleClickable' => 0 // 1 = open image
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/Grid.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

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

        $GridGallery = new QUI\Gallery\Controls\GridAdvanced([
            'max'            => $this->getAttribute('max'),
            'start'          => $this->getAttribute('start'),
            'perLine'        => $this->getAttribute('perLine'),
            'Project'        => false,
            'folderId'       => $this->getAttribute('folderId'),
            'class'          => 'quiqqer-gallery-grid',
            'order'          => $order,
            'usePagination'  => false,
            'titleClickable' => $this->getAttribute('titleClickable') ? 1 : 0
        ]);

        $Engine->assign([
            'this'         => $this,
            '$GridGallery' => $GridGallery
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Grid.html');
    }

    /**
     * @return mixed|QUI\Projects\Site
     */
    protected function getSite()
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        $Site = \QUI::getRewrite()->getSite();

        $this->setAttribute('Site', $Site);

        return $Site;
    }
}
