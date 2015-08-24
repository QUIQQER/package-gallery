
QUIQQER Gallerie Modul
========



Packetname:

    quiqqer/gallery


Features
--------

- Verschiedene Gallerie Seiten Typen
- Verschiedene Gallery PHP / JS Controls

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


ToDo
--------

- Neuer Slider : http://peterkuma.github.io/picture-slider/Demo/
