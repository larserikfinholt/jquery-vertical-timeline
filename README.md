# jQuery Vertical Timeline

Forked from the [Super Awesome Vertical Timeline](https://github.com/balancemedia/Timeline).

jQuery Vertical Timeline utilizes a handful of super cool libraries, including [Tabletop.js](http://github.com/jsoma/tabletop) (for the data storage) and [Isotope](http://isotope.metafizzy.co/) for the layout.

A running example can be found [here](http://minnpost.github.com/jquery-vertical-timeline/example.html).

## How to Use

### Data

Create a Google Spreadsheet with the following columns (see options for different names) and publish it.

* title
* date
* display date
* photo url
* caption
* body 
* read more url

**Please note that the the _display date_ column must be in the format _Month day, Year_ (April 25, 2012) for proper javascript parsing.**

**Also, all columns must be _plain text_ format, including the two date columns.**

### Include CSS and JS

Include the CSS:

    <link rel="stylesheet" href="css/style.css">

Include the Javascript.  Would be beneficial to combine these into a single file.

    <script type="text/javascript" src="js/libs/jquery-1.7.1.min.js"></script>
    <script type="text/javascript" src="js/libs/handlebars-1.0.rc.1.min.js"></script>
    <script type="text/javascript" src="js/libs/tabletop.master-20121204.min.js"></script>
    <script type="text/javascript" src="js/libs/jquery.isotope.v1.5.21.min.js"></script>
    <script type="text/javascript" src="js/libs/jquery.ba-resize.v1.1.min.js"></script>
    <script type="text/javascript" src="js/libs/jquery.imagesloaded.v2.1.0.min.js"></script>
    <script type="text/javascript" src="js/jquery-veritcal-timeline.js"></script>

### Run

First, include a container for the timeline:

    <div class="timeline-jquery-example-1">
    </div>
    
Call timeline with options.  Note that the ```key``` is the ID of the Google Spreadsheet, and the ```sheetname``` is the name of the sheet.

  <script type="text/javascript">
    $(document).ready(function() {
      $('.timeline-jquery-example-1').verticalTimeline({
        key: '0AsmHVq28GtVJdG1fX3dsQlZrY18zTVA2ZG8wTXdtNHc',
        sheetName: 'Posts'
      });
    });
  </script>

## Bugs 

* The original sharing code did not work anymore so that is currently removed.
* Please use the [issue queue](https://github.com/MinnPost/jquery-vertical-timeline/issues) to report any more bugs.

## Credits

[Balance Media](http://www.builtbybalance.com) for the design and coding.

The following plugins/libraries are used:
[jQuery](http://jquery.com/), [Isotope](http://isotope.metafizzy.co), [Tabletop.js](http://github.com/jsoma/tabletop), [Handlebars.js](http://handlebarsjs.com/), [jQuery imagesLoaded plugin](http://github.com/desandro/imagesloaded), and [jQuery resize event](http://benalman.com/projects/jquery-resize-plugin/)

NOTE: All of the elements are free for non-commercial use. Commercial use of [Isotope](http://isotope.metafizzy.co) requires a $25 [license](http://metafizzy.co/#isotope-license).