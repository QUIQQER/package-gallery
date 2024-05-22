<?php

/**
 * This file contains QUI\Gallery\Controls\ImageSlider
 */

namespace QUI\Gallery\Controls;

use Exception;
use QUI;
use QUI\Projects\Media\Folder;

use function dirname;

/**
 * Class Slider
 * @package QUI\Gallery\Controls\ImageSlider
 */
class ImageSlider extends QUI\Control
{
    private QUI\Projects\Project $Project;

    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'class' => 'quiqqer-gallery-imageSlider',
            'nodeName' => 'section',
            'site' => '',
            'order' => false,
            'limit' => 10,
            'moreLink' => false,
            'Project' => false,
            'folderId' => false,
            'folderIds' => '', // ids comma separated
            'imageBehavior' => '', // '', 'center', 'fill'
            'data-qui' => 'package/quiqqer/gallery/bin/controls/ImageSlider',
            'sliderHeight' => 200
        ]);

        $this->addCSSFile(
            \dirname(__FILE__) . '/ImageSlider.css'
        );

        parent::__construct($attributes);
    }

    /**
     * (non-PHPdoc)
     *
     * @throws Exception
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $this->Project = $this->getProject();
        $MoreLink = null;
        $limit = $this->getAttribute('limit');

        if (!is_numeric($limit)) {
            $limit = 10;
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

        $folderIds = $this->getAttribute('folderIds');

        if (is_string($folderIds)) {
            $folderIds = explode(',', $folderIds);
        }

        if ($folderIds && count($folderIds) > 0) {
            $images = $this->getImagesByFolderIds($folderIds, $order, $limit);
        } else {
            try {
                /* @var $Folder \QUI\Projects\Media\Folder */
                $Folder = QUI\Projects\Media\Utils::getMediaItemByUrl($this->getAttribute('folderId'));
            } catch (QUI\Exception $Exception) {
                QUI\System\Log::writeException($Exception);

                return '';
            }

            $images = $Folder->getImages([
                'limit' => $limit,
                'order' => $order
            ]);
        }


        if (!$this->getAttribute('sliderHeight')) {
            $this->setAttribute('sliderHeight', 200);
        }

        $this->setCustomVariable('sliderHeight', $this->getAttribute('sliderHeight') . 'px');

        if ($this->getAttribute('moreLink')) {
            try {
                $MoreLink = QUI\Projects\Site\Utils::getSiteByLink($this->getAttribute('moreLink'));
            } catch (QUI\Exception) {
            }
        }

        switch ($this->getAttribute('imageBehavior')) {
            case 'center':
                $imageBehavior = 'quiqqer-gallery-imageSlider--image-center';
                break;

            case 'fill':
                $imageBehavior = 'quiqqer-gallery-imageSlider--image-fill';
                break;

            default:
                $imageBehavior = '';
        }

        $Engine->assign([
            'this' => $this,
            'images' => $images,
            'MoreLink' => $MoreLink,
            'imageBehavior' => $imageBehavior
        ]);

        return $Engine->fetch($this->getTemplate());
    }

    /**
     * Return the control template
     *
     * @return string
     */
    protected function getTemplate(): string
    {
        return \dirname(__FILE__) . '/ImageSlider.html';
    }

    /**
     * Set custom css variable to the control as inline style
     * --_qui-gridAdvanced-$name: var(--qui-gridAdvanced-$name, $value);
     *
     * @param $name
     * @param $value
     * @return void
     */
    private function setCustomVariable($name, $value): void
    {
        if (!$name || !$value) {
            return;
        }

        $this->setStyle(
            '--_qui-gallery-imageSlider-' . $name,
            'var(--qui-gallery-imageSlider-' . $name . ', ' . $value . ')'
        );
    }

    /**
     * Get images from multiple folders (direct SQL query).
     *
     * @param array $folderIds
     * @param string $order
     * @param int $limit
     * @return array
     */
    private function getImagesByFolderIds(array $folderIds, string $order, int $limit): array
    {
        $table = QUI::getDBTableName($this->Project->getAttribute('name') . '_media');
        $table_rel = QUI::getDBTableName($this->Project->getAttribute('name') . '_media_relations');

        $whereClause = [
            $table_rel . '.child = ' . $table . '.id',
            $table . '.deleted = 0 ',
            $table . '.type = \'image\''
        ];

        $folderConditions = [];

        foreach ($folderIds as $folderId) {
            $folderConditions[] = $table_rel . '.parent = ' . (int)$folderId;
        }

        $whereClause[] = '(' . implode(' OR ', $folderConditions) . ')';
        $whereClauseString = implode(' AND ', $whereClause);

        $dbQuery = [
            'select' => 'id',
            'from' => [
                $table,
                $table_rel
            ],
            'limit' => $limit,
            'active' => 1,
            'where' => $whereClauseString
        ];

        $dbQuery['order'] = $order;

        // database
        try {
            $fetch = QUI::getDataBase()->fetch($dbQuery);
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::writeException($Exception);

            return [];
        }

        $result = [];

        foreach ($fetch as $entry) {
            try {
                $Media = $this->Project->getMedia();
                $result[] = $Media->get((int)$entry['id']);
            } catch (QUI\Exception $Exception) {
                QUI\System\Log::addDebug($Exception->getMessage());
            }
        }

        return $result;
    }
}
