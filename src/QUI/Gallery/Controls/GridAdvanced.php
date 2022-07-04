<?php


/**
 * This file contains QUI\Gallery\Controls\GridAdvanced
 */

namespace QUI\Gallery\Controls;

use QUI;

/**
 * Class Grid
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
            'class'              => 'quiqqer-control-gallery-gridAdvanced',
            'max'                => 9,
            'start'              => 0,
            'entriesPerLine'     => 3,
            'addGap'             => true,
            'showImageTitle'     => false,
            'Project'            => false,
            'folderId'           => false,
            'order'              => 'title ASC',
            'scaleImageOnHover'  => true,
            'darkenImageOnHover' => false,
            'iconOnHover'        => false,
            'usePagination'      => false,
            'titleClickable'     => 0, // 1 = open image
            'template'           => '1' // template number or name
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
            case 'random':
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

        if (!is_numeric($start)) {
            $start = 0;
        }

        if (!is_numeric($max)) {
            $max = 12;
        }

        $getImagesParams = [
            'limit' => $start.','.$max,
            'order' => $order
        ];

        if ($order === 'random') {
            unset($getImagesParams['limit']);
        }

        $images = $Folder->getImages($getImagesParams);

        if ($order === 'random') {
            shuffle($images);
            $images = array_slice($images, 0, $max);
        }

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

        $gap = '';
        if ($this->getAttribute('addGap')) {
            $gap = 'quiqqer-control-gallery-gridAdvanced__gap';
        }

        $scaleImageOnHover = '';
        if ($this->getAttribute('scaleImageOnHover')) {
            $scaleImageOnHover = 'quiqqer-control-gallery-gridAdvanced__scaleImageOnHover';
        }

        $darkenImageOnHover = '';
        if ($this->getAttribute('darkenImageOnHover')) {
            $darkenImageOnHover = 'quiqqer-control-gallery-gridAdvanced__darkenImageOnHover';
        }

        $iconOnHover = '';
        if ($this->getAttribute('iconOnHover')) {
            $iconOnHover = 'quiqqer-control-gallery-gridAdvanced__iconOnHover';
        }

        /* template */
        switch ($this->getAttribute('template')) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '10':
            case '2perRow':
            case '3perRow':
            case '4perRow':
            case '5perRow':
            case '6perRow':
                $template = $this->getAttribute('template');
                break;
            default:
                $template = 1;
        }

        $Engine->assign([
            'Rewrite'            => QUI::getRewrite(),
            'this'               => $this,
            'perLine'            => $this->getAttribute('entriesPerLine'),
            'images'             => $images,
            'Site'               => $this->getSite(),
            'completeList'       => $completeList,
            'Pagination'         => $Pagination,
            'titleClickable'     => $this->getAttribute('titleClickable') ? 1 : 0,
            'gap'                => $gap,
            'template'           => $template,
            'scaleImageOnHover'  => $scaleImageOnHover,
            'darkenImageOnHover' => $darkenImageOnHover,
            'iconOnHover'        => $iconOnHover
        ]);


        $this->addCSSFile(dirname(__FILE__).'/GridAdvanced.css');

        return $Engine->fetch(dirname(__FILE__).'/GridAdvanced.html');
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
