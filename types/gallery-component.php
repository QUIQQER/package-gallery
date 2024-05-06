<?php

/**
 * This file contains the gallery component site type
 *
 * @var QUI\Projects\Project $Project
 * @var QUI\Projects\Site $Site
 * @var QUI\Interfaces\Template\EngineInterface $Engine
 **/

$folder = $Site->getAttribute('quiqqer.settings.gallery.folderId');
$galleryType = $Site->getAttribute('quiqqer.settings.gallery.type');

try {
    $Folder = QUI\Projects\Media\Utils::getMediaItemByUrl($folder);
} catch (QUI\Exception $Exception) {
    $Folder = $Site->getProject()->getMedia()->firstChild();
}

switch ($galleryType) {
    case 'component-coverflow':
        $Gallery = new QUI\Gallery\Controls\Component([
            'folderId' => $Folder->getId(),
            'effect' => 'coverflow',
            'order' => $Site->getAttribute('quiqqer.settings.gallery.sort')
        ]);
        break;

    case 'component-photoBrowse':
        $Gallery = new QUI\Gallery\Controls\Component([
            'folderId' => $Folder->getId(),
            'effect' => 'photoBrowse',
            'order' => $Site->getAttribute('quiqqer.settings.gallery.sort')
        ]);
        break;

    case 'component-ferrisWheel':
        $Gallery = new QUI\Gallery\Controls\Component([
            'folderId' => $Folder->getId(),
            'effect' => 'ferrisWheel',
            'order' => $Site->getAttribute('quiqqer.settings.gallery.sort')
        ]);
        break;

    case 'component-snake':
        $Gallery = new QUI\Gallery\Controls\Component([
            'folderId' => $Folder->getId(),
            'effect' => 'snake',
            'order' => $Site->getAttribute('quiqqer.settings.gallery.sort')
        ]);
        break;

    case 'component-slideBehind':
        $Gallery = new QUI\Gallery\Controls\Component([
            'folderId' => $Folder->getId(),
            'effect' => 'slideBehind',
            'order' => $Site->getAttribute('quiqqer.settings.gallery.sort')
        ]);
        break;

    default:
    case 'component-forwardPulse':
        $Gallery = new QUI\Gallery\Controls\Component([
            'folderId' => $Folder->getId(),
            'effect' => 'forwardPulse',
            'order' => $Site->getAttribute('quiqqer.settings.gallery.sort')
        ]);
        break;
}

$Engine->assign([
    'Gallery' => $Gallery
]);
