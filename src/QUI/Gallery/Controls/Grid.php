<?php


/**
 * This file contains QUI\Gallery\Controls\Grid
 */

namespace QUI\Gallery\Controls;

use QUI;

/**
 * Class Grid
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
            'entriesPerLine' => 3,
            'scaleImage'     => true,
            'addGap'         => true,
            'showImageTitle' => true,
            'centerImage'    => true,
            'Project'        => false,
            'folderId'       => false,
            'class'          => 'quiqqer-control-gallery-grid',
            'order'          => 'title ASC',
            'usePagination'  => true,
            'titleClickable' => 0, // 1 = open image
            'template'       => 'unsemantic'
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
        $Engine     = QUI::getTemplateManager()->getEngine();
        $Project    = $this->getProject();
        $Media      = $Project->getMedia();
        $Pagination = null;

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

        // completeList is used to navigate in popup per JavaScript (next / prev image)
        $completeList = $images;

        if ($this->getAttribute('usePagination')) {
            // with pagination enabled completeList includes all images from a folder
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

        $scaleImage = '';
        if ($this->getAttribute('scaleImage')) {
            $scaleImage = 'quiqqer-control-gallery__scaleImage';
        }

        $gap = '';
        if ($this->getAttribute('addGap')) {
            $gap = 'quiqqer-control-gallery__gap';
        }

        $centerImage = '';
        if ($this->getAttribute('centerImage')) {
            $centerImage = 'quiqqer-control-gallery__centerImage';
        }

        $Engine->assign([
            'Rewrite'        => QUI::getRewrite(),
            'this'           => $this,
            'perLine'        => $this->getAttribute('entriesPerLine'),
            'images'         => $images,
            'Site'           => $this->getSite(),
            'completeList'   => $completeList,
            'Pagination'     => $Pagination,
            'titleClickable' => $this->getAttribute('titleClickable') ? 1 : 0,
            'scaleImage'     => $scaleImage,
            'gap'            => $gap,
            'centerImage'    => $centerImage
        ]);

        switch ($this->getAttribute('template')) {
            case 'flexbox':
                // new template based on css property flex box
                $css      = dirname(__FILE__) . '/Grid.Flexbox.css';
                $template = dirname(__FILE__) . '/Grid.Flexbox.html';
                break;

            case 'unesmantic':
            default:
                // old template based on unsemantic classes
                $css      = dirname(__FILE__) . '/Grid.Unsemantic.css';
                $template = dirname(__FILE__) . '/Grid.Unsemantic.html';
                break;
        }

        $this->addCSSFile($css);

        return $Engine->fetch($template);
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
