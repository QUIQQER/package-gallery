<?php

$folder      = $Site->getAttribute( 'quiqqer.settings.gallery.folderId' );
$galleryType = $Site->getAttribute( 'quiqqer.settings.gallery.type' );

try
{
    $Folder = QUI\Projects\Media\Utils::getMediaItemByUrl( $folder );

} catch ( QUI\Exception $Exception )
{
    $Folder = $Site->getProject()->getMedia()->firstChild();
}

switch ( $galleryType )
{
    case 'component-forwardPulse':
        $Gallery = new QUI\Gallery\Controls\Component(array(
            'folderId' => $Folder->getId(),
            'effect'   => 'forwardPulse'
        ));
    break;

    case 'component-coverflow':
        $Gallery = new QUI\Gallery\Controls\Component(array(
            'folderId' => $Folder->getId(),
            'effect'   => 'coverflow'
        ));
    break;

    case 'component-photoBrowse':
        $Gallery = new QUI\Gallery\Controls\Component(array(
            'folderId' => $Folder->getId(),
            'effect'   => 'photoBrowse'
        ));
    break;

    case 'component-ferrisWheel':
        $Gallery = new QUI\Gallery\Controls\Component(array(
            'folderId' => $Folder->getId(),
            'effect'   => 'ferrisWheel'
        ));
    break;

    case 'component-snake':
        $Gallery = new QUI\Gallery\Controls\Component(array(
            'folderId' => $Folder->getId(),
            'effect'   => 'snake'
        ));
    break;

    case 'component-slideBehind':
        $Gallery = new QUI\Gallery\Controls\Component(array(
            'folderId' => $Folder->getId(),
            'effect'   => 'slideBehind'
        ));
    break;
}

$Engine->assign(array(
    'Gallery' => $Gallery
));