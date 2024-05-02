<?php

/**
 * This file contains the gallery grid site type
 *
 * @var QUI\Projects\Project $Project
 * @var QUI\Projects\Site $Site
 * @var QUI\Interfaces\Template\EngineInterface $Engine
 **/

$start = 0;
$max = $Site->getAttribute('quiqqer.settings.gallery.max');
$folder = $Site->getAttribute('quiqqer.settings.gallery.folderId');

try {
    $Folder = QUI\Projects\Media\Utils::getMediaItemByUrl($folder);
} catch (QUI\Exception $Exception) {
    $Folder = $Site->getProject()->getMedia()->firstChild();
}

if (!$max) {
    $max = 9;
}

if (isset($_REQUEST['sheet'])) {
    $start = ((int)$_REQUEST['sheet'] - 1) * $max;
}

$Gallery = new QUI\Gallery\Controls\Grid([
    'max' => $max,
    'start' => $start,
    'folderId' => $Folder->getId(),
    'order' => $Site->getAttribute('quiqqer.settings.gallery.sort'),
    'titleClickable' => $Site->getAttribute('quiqqer.settings.gallery.titleClickable')
]);

$Engine->assign([
    'Gallery' => $Gallery
]);
