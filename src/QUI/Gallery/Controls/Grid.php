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
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'max'      => 9,
            'start'    => 0,
            'Project'  => false,
            'folderId' => false,
            'class'    => 'quiqqer-gallery-grid',
            'order'    => 'title ASC'
        ));

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
        $Engine  = QUI::getTemplateManager()->getEngine();
        $Project = $this->getProject();
        $Media   = $Project->getMedia();

        /* @var $Folder \QUI\Projects\Media\Folder */
        $Folder = $Media->get($this->getAttribute('folderId'));

        $start = $this->getAttribute('start');
        $max   = $this->getAttribute('max');

        $Pagination = new QUI\Bricks\Controls\Pagination(array(
            'limit' => false
        ));

        $Pagination->loadFromRequest();

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

        $completeList = $Folder->getImages(array(
            'order' => $order
        ));

        $images = $Folder->getImages(array(
            'limit' => $start . ',' . $max,
            'order' => $order
        ));

        $count = $Folder->getImages(array(
            'count' => true
        ));

        $sheets = ceil($count / $max);


        $Pagination->setAttribute('Site', $this->getSite());
        $Pagination->setAttribute('sheets', $sheets);

        $Engine->assign(array(
            'Rewrite'      => QUI::getRewrite(),
            'this'         => $this,
            'Folder'       => $Folder,
            'images'       => $images,
            'Site'         => $this->getSite(),
            'sheets'       => $sheets,
            'completeList' => $completeList,
            'Pagination'   => $Pagination
        ));

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
