<?php

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

$Gallery = new QUI\Gallery\Controls\Slider([
    'folderId' => $Folder->getId(),
    'order' => $Site->getAttribute('quiqqer.settings.gallery.sort')
]);

$Engine->assign([
    'Gallery' => $Gallery
]);
