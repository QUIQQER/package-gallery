<?php


/**
 * This file contains QUI\Gallery\Controls\GridAdvanced
 */

namespace QUI\Gallery\Controls;

use QUI;

/**
 * Class GridAdvanced
 *
 * Modern way to create a gallery grid
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
            'max'            => 9,
            'start'          => 0,
            'perLine'        => 3,
            'Project'        => false,
            'folderId'       => false,
            'class'          => 'quiqqer-gallery-grid',
            'order'          => 'title ASC',
            'usePagination'  => true,
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
        $Engine       = QUI::getTemplateManager()->getEngine();
        $Project      = $this->getProject();
        $Media        = $Project->getMedia();
        $Pagination   = null;
        $completeList = false;

        /* @var $Folder \QUI\Projects\Media\Folder */
        $Folder = $Media->get($this->getAttribute('folderId'));

        $start = $this->getAttribute('start');
        $max   = $this->getAttribute('max');

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

        if (!is_numeric($start)) {
            $start = 0;
        }

        if (!is_numeric($max)) {
            $max = 9;
        }

        $images = $Folder->getImages([
            'limit' => $start . ',' . $max,
            'order' => $order
        ]);

        if ($this->getAttribute('usePagination')) {
            $completeList = $Folder->getImages([
                'order' => $order
            ]);

            $count = $Folder->getImages([
                'count' => true
            ]);

            $sheets = ceil($count / $max);

            $Pagination = new QUI\Bricks\Controls\Pagination([
                'limit' => false
            ]);

            $Pagination->loadFromRequest();
            $Pagination->setAttribute('Site', $this->getSite());
            $Pagination->setAttribute('sheets', $sheets);
        }

        $Engine->assign([
            'Rewrite'        => QUI::getRewrite(),
            'this'           => $this,
            'Folder'         => $Folder,
            'images'         => $images,
            'Site'           => $this->getSite(),
            'completeList'   => $completeList,
            'Pagination'     => $Pagination,
            'titleClickable' => $this->getAttribute('titleClickable') ? 1 : 0
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
