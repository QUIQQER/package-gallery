<?php

$start = 0;
$max   = $Site->getAttribute( 'quiqqer.settings.gallery.max' );

$folder      = $Site->getAttribute( 'quiqqer.settings.gallery.folderId' );
$galleryType = $Site->getAttribute( 'quiqqer.settings.gallery.type' );

try
{
    $Folder = QUI\Projects\Media\Utils::getMediaItemByUrl( $folder );

} catch ( QUI\Exception $Exception )
{
    $Folder = $Site->getProject()->getMedia()->firstChild();
}

if ( !$max ) {
    $max = 9;
}

if ( isset( $_REQUEST['sheet'] ) ) {
    $start = ( (int)$_REQUEST['sheet'] - 1 ) * $max;
}


switch ( $galleryType )
{
    case 'grid':
        $Gallery = new QUI\Gallery\Controls\Grid(array(
            'max'      => $max,
            'start'    => $start,
            'folderId' => $Folder->getId()
        ));
    break;

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
}

$Engine->assign(array(
    'Gallery' => $Gallery
));