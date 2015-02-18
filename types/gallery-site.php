<?php

$start    = 0;
$max      = $Site->getAttribute( 'quiqqer.settings.gallery.max' );
$folderId = $Site->getAttribute( 'quiqqer.settings.gallery.folderId' );

if ( !$max ) {
    $max = 9;
}

if ( isset( $_REQUEST['sheet'] ) ) {
    $start = ( (int)$_REQUEST['sheet'] - 1 ) * $max;
}


$Gallery = new QUI\Gallery\Controls\Grid(array(
    'max'      => $max,
    'start'    => $start,
    'folderId' => $folderId
));

$Engine->assign(array(
    'Gallery' => $Gallery
));