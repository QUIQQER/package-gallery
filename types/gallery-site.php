<?php

$start = 0;
$max   = $Site->getAttribute( 'quiqqer.settings.gallery.max' );

$folderId    = $Site->getAttribute( 'quiqqer.settings.gallery.folderId' );
$galleryType = $Site->getAttribute( 'quiqqer.settings.gallery.type' );

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
            'folderId' => $folderId
        ));
    break;

    case 'component-forwardPulse':
        $Gallery = new QUI\Gallery\Controls\Component(array(
            'folderId' => $folderId,
            'effect'   => 'forwardPulse'
        ));
    break;

    case 'component-coverflow':
        $Gallery = new QUI\Gallery\Controls\Component(array(
            'folderId' => $folderId,
            'effect'   => 'coverflow'
        ));
    break;

    case 'component-photoBrowse':
        $Gallery = new QUI\Gallery\Controls\Component(array(
            'folderId' => $folderId,
            'effect'   => 'photoBrowse'
        ));
    break;
}

$Engine->assign(array(
    'Gallery' => $Gallery
));