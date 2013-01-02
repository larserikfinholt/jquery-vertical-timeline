/**
 * Vertical timeline plugin for jQuery.  Data powered
 * by Google Docs.
 *
 * Sharing is using old APIs and breaks in some browsers.
 */
(function($, w, undefined) {
  $.fn.verticalTimeline = function(options) {
    /**
     * Configuration for timeline.  defaultDirection should be
     * "newest" or "oldest".  groupFunction is a function
     * to handle grouping.
     */
    var defaults = {
      selector: '.timeline-jquery-container',
      key: 'https://docs.google.com/spreadsheet/pub?key=0AsmHVq28GtVJdG1fX3dsQlZrY18zTVA2ZG8wTXdtNHc&output=html',
      sheetName: 'Posts',
      defaultDirection: 'oldest',
      groupFunction: 'groupSegmentByYear',
      sharing: false,
      postTemplate: ' \
        <div class="item post"> \
          <div class="inner"> \
            <div class="timestamp">{{timestamp}}</div> \
            <div class="title"><h3>{{title}}</h3></div> \
            <div class="date">{{display_date}}</div> \
            <div class="body"> \
              {{#if photo_url}} \
                <img src="{{photo_url}}" alt=""> \
              {{/if}} \
              {{#if caption}} \
                <div class="caption">({{caption}})</div> \
              {{/if}} \
              {{#if body}} \
                <div class="text">{{{body}}}</div> \
              {{/if}} \
              <div class="clearfix"> \
                {{#if read_more_url}} \
                  <a target="_blank" class="more" href="{{read_more_url}}">READ MORE</a> \
                  {{#if sharing}} \
                    <div class="share"> \
                      <a href="#" class="share-trigger"></a> \
                      <div class="share-popup"> \
                        <a href="https://twitter.com/share" class="twitter-share-button" data-url="{{read_more_url}}" data-text="{{title}}" data-count="none">Tweet</a> \
                        <a class="facebook-share-button" name="fb_share" type="button" share_url="{{read_more_url}}">Share</a> \
                      </div> \
                    </div> \
                  {{/if}} \
                {{/if}} \
              </div> \
            </div> \
          </div> \
        </div> \
      ',
      groupMarkerTemplate: ' \
        <div class="item group-marker item-group-{{id}}" data-id="{{id}}"> \
          <div class="inner"> \
            <div class="inner2"> \
              <div class="timestamp">{{timestamp}}</div> \
              <div class="group">{{groupDisplay}}</div> \
            </div> \
          </div> \
        </div> \
      ',
      buttonTemplate: ' \
        <div id="buttons"> \
          <div id="expand-collapse-buttons"> \
            <a class="expand-all active" href="#"><span>EXPAND ALL</span></a> \
            <a class="collapse-all" href="#"><span>COLLAPSE ALL</span></a> \
          </div> \
          <div id="sort-buttons"> \
            <a class="sort-newest active" href="#"><span>NEWEST FIRST</span></a> \
            <a class="sort-oldest" href="#"><span>OLDEST FIRST</span></a> \
          </div> \
        </div> \
      ',
      timelineTemplate: ' \
        <div id="timeline"> \
          <div id="line-container"> \
            <div id="line"></div> \
          </div> \
        </div> \
      '
    };
    
    /**
     * Grouping function by Decade.
     */
    function groupSegmentByDecade(segment, groups, direction) {
      // Grouping by decade
      var year = new Date(segment.timestamp).getFullYear();
      var yearStr = year.toString();
      var id = yearStr.slice(0, -1);
      
      groups[id] = {
        id: id,
        groupDisplay: id + '0\'s',
        timestamp: (direction == 'newest') ? 
          Date.parse('December 31, ' + id + '9') :
          Date.parse('January 1, ' + id + '0'),
        timestampStart: Date.parse('January 1, ' + id + '0'),
        timestampEnd: Date.parse('December 31, ' + id + '9')
      };
      
      return groups;
    };
    
    /**
     * Grouping function by year.
     */
    function groupSegmentByYear(segment, groups, direction) {
      // Grouping by decade
      var year = new Date(segment.timestamp).getFullYear();
      
      groups[year] = {
        id: year,
        groupDisplay: year,
        timestamp: (direction == 'newest') ? 
          Date.parse('December 31, ' + year) :
          Date.parse('January 1, ' + year),
        timestampStart: Date.parse('January 1, ' + year),
        timestampEnd: Date.parse('December 31, ' + year)
      };
      
      return groups;
    };
  
    // Mix defaults with options.
    var timelineConfig = $.extend(defaults, options);
    
    // As a niceity, if the group function is a string referring
    // to group function, then use that.
    timelineConfig.groupFunction = (timelineConfig.groupFunction === 'groupSegmentByYear') ?
      groupSegmentByYear : timelineConfig.groupFunction;
    timelineConfig.groupFunction = (timelineConfig.groupFunction === 'groupSegmentByDecade') ?
      groupSegmentByDecade : timelineConfig.groupFunction;
   
    // Go through each jquery object
    return this.each(function() {  
      var $thisObj = $(this);
      
      // Variables used across application (not the best way to
      // do this.
      var groups = {};
      
      // Add in extra markup
      $thisObj.html(timelineConfig.buttonTemplate + 
        timelineConfig.timelineTemplate)
    
      // Get data via Tabletop
      Tabletop.init({
        key: timelineConfig.key,
        callback: setupTimeline,
        wanted: [timelineConfig.sheetName],
        postProcess: function(el) {
          el['timestamp'] = Date.parse(el['date']);
          el['display_date'] = el['displaydate'];
          el['read_more_url'] = el['readmoreurl'];
          el['photo_url'] = el['photourl'];
        }
      });
      
      
      /**
       * Load the data in for isotope processing
       */
      function setupTimeline(data, tabletop) {
        var postTemplate  = Handlebars.compile(timelineConfig.postTemplate);
        var groupMarkerTemplate  = Handlebars.compile(timelineConfig.groupMarkerTemplate);
        
        // Remove load message
        $('.loading-general').slideUp('fast');
        
        // Go through data from the sheet.
        $.each(tabletop.sheets(timelineConfig.sheetName).all(), function(i, val) {
          // Create groups (by year or whatever)
          groups = timelineConfig.groupFunction(val, groups, timelineConfig.defaultDirection);
    
          // Add any other data
          val.sharing = timelineConfig.sharing;
          // Add output to timeline
          $('#timeline').append(postTemplate(val));
        });
  
        // Add a group marker for each group
        $.each(groups, function(i, group) {
          $('#timeline').append(groupMarkerTemplate(group));
        });
        
        // Handle default sort direction
        if (timelineConfig.defaultDirection != 'newest') {
          $('#sort-buttons a').removeClass('active');
          $('#sort-buttons a.sort-oldest').addClass('active');
        }
    
        // Start rendering isotope goodness when images are loaded.
        $('#timeline').imagesLoaded(function() {
          $('#timeline').isotope({
            itemSelector : '.item',
            transformsEnabled: true,
            layoutMode: 'spineAlign',
            spineAlign:{
              gutterWidth: 56
            },
            getSortData: {
              timestamp: function($elem) {
                return parseFloat($elem.find('.timestamp').text());
              }
            },
            sortBy: 'timestamp',
            sortAscending: (timelineConfig.defaultDirection == 'newest') ? false : true,
            itemPositionDataEnabled: true
          });
        });
    
        // load scripts after all the html has been set
        if (timelineConfig.sharing) {
          $.getScript('//static.ak.fbcdn.net/connect.php/js/FB.Share');
          $.getScript('//platform.twitter.com/widgets.js');
        }
    
        // add open/close buttons to each post
        $('#timeline .item.post').each(function() {
          $(this).find('.inner').append('<a href="#" class="open-close"></a>');
        });
    
        $('#timeline .item a.open-close').click(function(e) {
          $(this).siblings('.body').slideToggle(function() {
            $('#timeline').isotope('reLayout');
          });
          $(this).parents('.post').toggleClass('closed');
          $('#expand-collapse-buttons a').removeClass('active');
          e.preventDefault();
        });
    
        $('#timeline .post .share').hover(
          function() {
            $(this).find('.share-trigger').addClass('over');
            $(this).find('.share-popup').show();
          },
          function() {
            $(this).find('.share-trigger').removeClass('over');
            $(this).find('.share-popup').hide();
          }
        );
    
        $('#buttons a.expand-all').click(function(e) {
          $('.post .body').slideDown(function() {
            $('#timeline').isotope('reLayout');
          });
          $('.post').removeClass('closed');
          $('#expand-collapse-buttons a').removeClass('active');
          $(this).addClass('active');
          e.preventDefault();
        });
    
        $('#buttons a.collapse-all').click(function(e) {
          $('.post .body').slideUp(function() {
            $('#timeline').isotope('reLayout');
          });
          $('.post').addClass('closed');
          $('#expand-collapse-buttons a').removeClass('active');
          $(this).addClass('active');
          e.preventDefault();
        });
    
      }
    
      /*
       * Update group markers as they are an interval.
       */
      function updateGroupMarkers(direction) {
        $('.group-marker').each(function() {
          var $this = $(this);
          var id = $this.attr('data-id');
          var timestamp = (direction) ? 
            groups[id].timestampStart : groups[id].timestampEnd;
          
          $this.find('.timestamp').text(timestamp);
        });
      }
    
      /*
       * Keep the actual line from extending beyond the last item's date tab
       */
      function adjustLine() {
        var $lastItem = $('.item.last');
        var itemPosition = $lastItem.data('isotope-item-position');
        var dateHeight = $lastItem.find('.date').height();
        var dateOffset = $lastItem.find('.date').position();
        var innerMargin = parseInt($lastItem.find('.inner').css('marginTop'));
        
        var top = (dateOffset == null) ? 0 : parseInt(dateOffset.top);
        var y = (itemPosition != null && itemPosition.y != null) ? 
          parseInt(itemPosition.y) : 0;
        var lineHeight = y + innerMargin + top + (dateHeight / 2);
        $('#line').height(lineHeight);
      }
    
      $('#sort-buttons a').click(function(e) {
        var $this = $(this);
        // don't proceed if already selected
        if ($this.hasClass('active')) {
          return false;
        }
    
        $('#sort-buttons a').removeClass('active');
        $this.addClass('active');
        if ($this.hasClass('sort-newest')) {
          updateGroupMarkers(false);
          $('#timeline').isotope('reloadItems').isotope({sortAscending: false});
        }
        else{
          updateGroupMarkers(true);
          $('#timeline').isotope('reloadItems').isotope({sortAscending: true});
        }
        e.preventDefault();
      });
    
    
      $('#timeline').resize(function() { // uses "jQuery resize event" plugin
        adjustLine();
      });
    
    
      /*
       * Isotope custom layout mode spineAlign
       */
      $.Isotope.prototype._spineAlignReset = function() {
        this.spineAlign = {
          colA: 0,
          colB: 0,
          lastY: -60
        };
      };
      $.Isotope.prototype._spineAlignLayout = function( $elems ) {
        var instance = this,
          props = this.spineAlign,
          gutterWidth = Math.round( this.options.spineAlign && this.options.spineAlign.gutterWidth ) || 0,
          centerX = Math.round(this.element.width() / 2);
      
        $elems.each(function(i, val) {
          var $this = $(this);
          $this.removeClass('last').removeClass('top');
          if (i == $elems.length - 1)
            $this.addClass('last');
          var x, y;
          if ($this.hasClass('group-marker')) {
            var width = $this.width();
            x = centerX - (width / 2);
            if (props.colA >= props.colB) {
              y = props.colA;
              if (y == 0) $this.addClass('top');
              props.colA += $this.outerHeight(true);
              props.colB = props.colA;
            }
            else{
              y = props.colB;
              if (y == 0) $this.addClass('top');
              props.colB += $this.outerHeight(true);
              props.colA = props.colB;
            }
          }
          else{
            $this.removeClass('left').removeClass('right');
            var isColA = props.colB >= props.colA;
            if (isColA)
              $this.addClass('left');
            else
              $this.addClass('right');
            x = isColA ?
              centerX - ( $this.outerWidth(true) + gutterWidth / 2 ) : // left side
              centerX + (gutterWidth / 2); // right side
            y = isColA ? props.colA : props.colB;
            if (y - props.lastY <= 60) {
              var extraSpacing = 60 - Math.abs(y - props.lastY);
              $this.find('.inner').css('marginTop', extraSpacing);
              props.lastY = y + extraSpacing;
            }
            else{
              $this.find('.inner').css('marginTop', 0);
              props.lastY = y;
            }
            props[( isColA ? 'colA' : 'colB' )] += $this.outerHeight(true);
          }
          instance._pushPosition( $this, x, y );
        });
      };
      $.Isotope.prototype._spineAlignGetContainerSize = function() {
        var size = {};
        size.height = this.spineAlign[( this.spineAlign.colB > this.spineAlign.colA ? 'colB' : 'colA' )];
        return size;
      };
      $.Isotope.prototype._spineAlignResizeChanged = function() {
        return true;
      };
      
    });  
  };  


})(jQuery, window);