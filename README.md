
QUIQQER Gallerie Modul
========



Packetname:

    quiqqer/gallery


Features
--------

- Verschiedene Gallerie Seiten Typen
- Verschiedene Gallery PHP / JS Controls
- Zoom Funktionalität auf Bilder im Inhalt

Installation
------------

Der Paketname ist: quiqqer/gallery


Mitwirken
----------

- Issue Tracker: https://dev.quiqqer.com/quiqqer/package-gallery/issues
- Source Code: https://dev.quiqqer.com/quiqqer/package-gallery/tree/master


Support
-------

Falls Sie ein Fehler gefunden haben oder Verbesserungen wünschen,
Dann können Sie gerne an support@pcsg.de eine E-Mail schreiben.


License
-------

GPL-2.0+


Entwickler
--------

```php
<?php

$Gallery = new QUI\Gallery\Controls\Slider();
$images  = array(); // List of \QUI\Projects\Media\Image

foreach ($images as $Image) {
    $Gallery->addImage($Image);
}

?>
```


```html
{$Gallery->create()}
```


```php
<?php

// gallery optionen
$Gallery->setAttribute('data-qui-options-show-controls-always', 1);
$Gallery->setAttribute('data-qui-options-show-title-always', 0);
$Gallery->setAttribute('data-qui-options-show-title', 0);

$Gallery->setAttribute('data-qui-options-controls', 1);
$Gallery->setAttribute('data-qui-options-period', 5000);
$Gallery->setAttribute('data-qui-options-shadow', 0);
$Gallery->setAttribute('data-qui-options-preview', 1);
$Gallery->setAttribute('data-qui-options-preview-outside', 1);

```



ToDo
--------

- Neuer Slider : http://peterkuma.github.io/picture-slider/Demo/
