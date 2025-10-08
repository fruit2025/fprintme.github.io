/* ===========================================================
 * jquery-onepage-scroll.js v1.3.1 (MODERNIZED - NATIVE EVENTS)
 * ===========================================================
 * Copyright 2013 Pete Rojwongsuriya.
 * http://www.thepetedesign.com
 *
 * Create an Apple-like website that let user scroll
 * one page at a time
 *
 * Credit: Eike Send for the awesome swipe event
 * https://github.com/peachananr/onepage-scroll
 *
 * License: GPL v3
 *
 * ========================================================== */

!function($){

  var defaults = {
    sectionContainer: "section",
    easing: "ease",
    animationTime: 700,
    pagination: true,
    updateURL: false,
    keyboard: true,
    beforeMove: null,
    afterMove: null,
    loop: true,
    responsiveFallback: false,
    direction : 'vertical'
  };

 /*------------------------------------------------*/
 /*  Credit: Eike Send for the awesome swipe event */
 /*------------------------------------------------*/

 $.fn.swipeEvents = function() {
  return this.each(function() {
    var startX,
        startY,
        $this = $(this),
        // Get the native DOM element
        element = $this[0];

    function touchstart(event) {
      var touches = event.touches;
      if (touches && touches.length) {
        startX = touches[0].pageX;
        startY = touches[0].pageY;
        // CRITICAL FIX: Use native addEventListener with passive: false
        element.addEventListener('touchmove', touchmove, { passive: false });
      }
    }

    function touchmove(event) {
      var touches = event.touches;
      if (touches && touches.length) {
        var deltaX = startX - touches[0].pageX;
        var deltaY = startY - touches[0].pageY;

        if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
            event.preventDefault();
        }

        if (deltaX >= 50) $this.trigger("swipeLeft");
        if (deltaX <= -50) $this.trigger("swipeRight");
        if (deltaY >= 50) $this.trigger("swipeUp");
        if (deltaY <= -50) $this.trigger("swipeDown");

        if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
          // CRITICAL FIX: Use native removeEventListener
          element.removeEventListener('touchmove', touchmove);
        }
      }
    }

    // Use jQuery for the initial touchstart bind, as it doesn't need to be non-passive
    $this.on('touchstart', touchstart);
  });
};


  $.fn.onepage_scroll = function(options){
    var settings = $.extend({}, defaults, options),
        el = $(this),
        sections = $(settings.sectionContainer),
        total = sections.length,
        topPos = 0,
        leftPos = 0,
        lastAnimation = 0,
        quietPeriod = 100,
        paginationList = "";

    // Define handlers so we can add/remove them later
    function wheelHandler(event) {
      if ($("body").hasClass("disabled-onepage-scroll")) {
        return;
      }
      event.preventDefault();
      // With native listeners, event.originalEvent is not needed
      var delta = event.wheelDelta || -event.detail;
      init_scroll(event, delta);
    }

    function swipeUpHandler(event) {
      if (!$("body").hasClass("disabled-onepage-scroll")) el.moveDown();
    }
    function swipeDownHandler(event) {
      if (!$("body").hasClass("disabled-onepage-scroll")) el.moveUp();
    }


    $.fn.transformPage = function(settings, pos, index) {
      if (typeof settings.beforeMove == 'function') settings.beforeMove(index);
      if($('html').hasClass('ie8')){
        if (settings.direction == 'horizontal') {
          var toppos = (el.width()/100)*pos;
          $(this).animate({left: toppos+'px'},settings.animationTime);
        } else {
          var toppos = (el.height()/100)*pos;
          $(this).animate({top: toppos+'px'},settings.animationTime);
        }
      } else{
        $(this).css({
          "-webkit-transform": ( settings.direction == 'horizontal' ) ? "translate3d(" + pos + "%, 0, 0)" : "translate3d(0, " + pos + "%, 0)",
         "-webkit-transition": "all " + settings.animationTime + "ms " + settings.easing,
         "-moz-transform": ( settings.direction == 'horizontal' ) ? "translate3d(" + pos + "%, 0, 0)" : "translate3d(0, " + pos + "%, 0)",
         "-moz-transition": "all " + settings.animationTime + "ms " + settings.easing,
         "-ms-transform": ( settings.direction == 'horizontal' ) ? "translate3d(" + pos + "%, 0, 0)" : "translate3d(0, " + pos + "%, 0)",
         "-ms-transition": "all " + settings.animationTime + "ms " + settings.easing,
         "transform": ( settings.direction == 'horizontal' ) ? "translate3d(" + pos + "%, 0, 0)" : "translate3d(0, " + pos + "%, 0)",
         "transition": "all " + settings.animationTime + "ms " + settings.easing
        });
      }
      $(this).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
        if (typeof settings.afterMove == 'function') settings.afterMove(index);
      });
    }

    $.fn.moveDown = function() {
      var el = $(this), index = $(settings.sectionContainer +".active").data("index");
      var current = $(settings.sectionContainer + "[data-index='" + index + "']");
      var next = $(settings.sectionContainer + "[data-index='" + (index + 1) + "']");
      if(next.length < 1) {
        if (settings.loop == true) { pos = 0; next = $(settings.sectionContainer + "[data-index='1']"); }
        else { return; }
      } else {
        pos = (index * 100) * -1;
      }
      if (typeof settings.beforeMove == 'function') settings.beforeMove( next.data("index"));
      current.removeClass("active"); next.addClass("active");
      if(settings.pagination == true) {
        $(".onepage-pagination li a" + "[data-index='" + index + "']").removeClass("active");
        $(".onepage-pagination li a" + "[data-index='" + next.data("index") + "']").addClass("active");
      }
      $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
      $("body").addClass("viewing-page-"+next.data("index"));
      if (history.replaceState && settings.updateURL == true) {
        var href = window.location.href.substr(0,window.location.href.indexOf('#')) + "#" + (index + 1);
        history.pushState( {}, document.title, href );
      }
      el.transformPage(settings, pos, next.data("index"));
    }

    $.fn.moveUp = function() {
      var el = $(this), index = $(settings.sectionContainer +".active").data("index");
      var current = $(settings.sectionContainer + "[data-index='" + index + "']");
      var next = $(settings.sectionContainer + "[data-index='" + (index - 1) + "']");
      if(next.length < 1) {
        if (settings.loop == true) { pos = ((total - 1) * 100) * -1; next = $(settings.sectionContainer + "[data-index='"+total+"']"); }
        else { return; }
      } else {
        pos = ((next.data("index") - 1) * 100) * -1;
      }
      if (typeof settings.beforeMove == 'function') settings.beforeMove(next.data("index"));
      current.removeClass("active"); next.addClass("active");
      if(settings.pagination == true) {
        $(".onepage-pagination li a" + "[data-index='" + index + "']").removeClass("active");
        $(".onepage-pagination li a" + "[data-index='" + next.data("index") + "']").addClass("active");
      }
      $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
      $("body").addClass("viewing-page-"+next.data("index"));
      if (history.replaceState && settings.updateURL == true) {
        var href = window.location.href.substr(0,window.location.href.indexOf('#')) + "#" + (index - 1);
        history.pushState( {}, document.title, href );
      }
      el.transformPage(settings, pos, next.data("index"));
    }

    $.fn.moveTo = function(page_index) {
      var current = $(settings.sectionContainer + ".active");
      var next = $(settings.sectionContainer + "[data-index='" + (page_index) + "']");
      if(next.length > 0) {
        if (typeof settings.beforeMove == 'function') settings.beforeMove(next.data("index"));
        current.removeClass("active"); next.addClass("active");
        $(".onepage-pagination li a" + ".active").removeClass("active");
        $(".onepage-pagination li a" + "[data-index='" + (page_index) + "']").addClass("active");
        $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
        $("body").addClass("viewing-page-"+next.data("index"));
        pos = ((page_index - 1) * 100) * -1;
        if (history.replaceState && settings.updateURL == true) {
            var href = window.location.href.substr(0,window.location.href.indexOf('#')) + "#" + (page_index - 1);
            history.pushState( {}, document.title, href );
        }
        el.transformPage(settings, pos, page_index);
      }
    }

    function responsive() {
      var valForTest = false, typeOfRF = typeof settings.responsiveFallback;
      if(typeOfRF == "number") valForTest = $(window).width() < settings.responsiveFallback;
      if(typeOfRF == "boolean") valForTest = settings.responsiveFallback;
      if(typeOfRF == "function") {
        valFunction = settings.responsiveFallback(); valForTest = valFunction;
        typeOFv = typeof valForTest; if(typeOFv == "number") valForTest = $(window).width() < valFunction;
      }

      if (valForTest) {
        $("body").addClass("disabled-onepage-scroll");
        // Use native removeEventListener for mousewheel
        document.removeEventListener("mousewheel", wheelHandler);
        document.removeEventListener("DOMMouseScroll", wheelHandler);
        el.off("swipeDown", swipeDownHandler).off("swipeUp", swipeUpHandler);
      } else {
        if($("body").hasClass("disabled-onepage-scroll")) {
          $("body").removeClass("disabled-onepage-scroll");
          $("html, body, .wrapper").animate({ scrollTop: 0 }, "fast");
        }
        
        // CRITICAL FIX: ALWAYS unbind first to prevent duplicate listeners
        document.removeEventListener("mousewheel", wheelHandler);
        document.removeEventListener("DOMMouseScroll", wheelHandler);
        el.off("swipeDown", swipeDownHandler).off("swipeUp", swipeUpHandler);

        // CRITICAL FIX: Use native addEventListener for mousewheel
        document.addEventListener("mousewheel", wheelHandler, { passive: false });
        document.addEventListener("DOMMouseScroll", wheelHandler, { passive: false }); // for Firefox

        el.on("swipeDown", swipeDownHandler).on("swipeUp", swipeUpHandler);
      }
    }

    function init_scroll(event, delta) {
        deltaOfInterest = delta;
        var timeNow = new Date().getTime();
        if(timeNow - lastAnimation < quietPeriod + settings.animationTime) {
            event.preventDefault();
            return;
        }
        if (deltaOfInterest < 0) { el.moveDown(); } else { el.moveUp(); }
        lastAnimation = timeNow;
    }

    el.addClass("onepage-wrapper").css("position","relative");
    $.each( sections, function(i) {
      $(this).css({
        position: "absolute",
        left: ( settings.direction == 'horizontal' ) ? leftPos + "%" : 0,
        top: ( settings.direction == 'vertical' || settings.direction != 'horizontal' ) ? topPos + "%" : 0
      }).addClass("section").attr("data-index", i+1);
      if (settings.direction == 'horizontal') leftPos = leftPos + 100; else topPos = topPos + 100;
      if(settings.pagination == true) paginationList += "<li><a data-index='"+(i+1)+"' href='#" + (i+1) + "'></a></li>";
    });

    if (settings.pagination == true) {
      if ($('ul.onepage-pagination').length < 1) $("<ul class='onepage-pagination'></ul>").prependTo("body");
      if( settings.direction == 'horizontal' ) {
        posLeft = (el.find(".onepage-pagination").width() / 2) * -1;
        el.find(".onepage-pagination").css("margin-left", posLeft);
      } else {
        posTop = (el.find(".onepage-pagination").height() / 2) * -1;
        el.find(".onepage-pagination").css("margin-top", posTop);
      }
      $('ul.onepage-pagination').html(paginationList);
    }

    if(window.location.hash != "" && window.location.hash != "#1") {
      init_index =  window.location.hash.replace("#", "");
      if (parseInt(init_index) <= total && parseInt(init_index) > 0) {
        $(settings.sectionContainer + "[data-index='" + init_index + "']").addClass("active");
        $("body").addClass("viewing-page-"+ init_index);
        if(settings.pagination == true) $(".onepage-pagination li a" + "[data-index='" + init_index + "']").addClass("active");
        pos = ((init_index - 1) * 100) * -1;
        el.transformPage(settings, pos, init_index);
      } else {
        $(settings.sectionContainer + "[data-index='1']").addClass("active");
        $("body").addClass("viewing-page-1");
        if(settings.pagination == true) $(".onepage-pagination li a" + "[data-index='1']").addClass("active");
      }
    } else {
      $(settings.sectionContainer + "[data-index='1']").addClass("active");
      $("body").addClass("viewing-page-1");
      if(settings.pagination == true) $(".onepage-pagination li a" + "[data-index='1']").addClass("active");
    }

    if(settings.pagination == true) {
      $(".onepage-pagination li a").click(function (){
        var page_index = $(this).data("index");
        el.moveTo(page_index);
      });
    }

    // Initial call to responsive to set up events
    if(settings.responsiveFallback != false) {
      $(window).resize(responsive);
      responsive();
    } else {
        responsive();
    }

    if(settings.keyboard == true) {
      $(document).keydown(function(e) {
        var tag = e.target.tagName.toLowerCase();
        if (!$("body").hasClass("disabled-onepage-scroll")) {
          switch(e.which) {
            case 38: if (tag != 'input' && tag != 'textarea') el.moveUp(); break;
            case 40: if (tag != 'input' && tag != 'textarea') el.moveDown(); break;
            case 32: if (tag != 'input' && tag != 'textarea') el.moveDown(); break;
            case 33: if (tag != 'input' && tag != 'textarea') el.moveUp(); break;
            case 34: if (tag != 'input' && tag != 'textarea') el.moveDown(); break;
            case 36: el.moveTo(1); break;
            case 35: el.moveTo(total); break;
            default: return;
          }
        }
      });
    }
    return false;
  }
}(window.jQuery);