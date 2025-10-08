var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

var myMap, r_fallback = false;

$(document).ready(function(){

if(isMobile.any()){
            r_fallback = true; $("#fp0").remove(); $("#fp5").remove();$("#fp00").remove(); $("#fp1").remove(); $("#fp2").remove();
            $("#fp3").remove(); $("#fp4").remove(); $("#fp6").remove(); $(window).trigger('resize');
        }


	var mainNav = $('.main-nav'), ul = $('ul', mainNav), linksMenu = $('a', ul), title = $('.title', mainNav);
    var activeBorder = $('<li />', {'class': 'border'}).hide().appendTo(ul);



	$(window).resize(function() {
	 reSize();
	 activeBorder.hide();
	});

    linksMenu.on('click', function(e){
        if(!r_fallback){ e.preventDefault(); $(".main").moveTo(linksMenu.index(this) + 2);}
    });

    activeBorder.update = function(index){
        if(index == 1) activeBorder.hide();
        else {
            var activeElement = linksMenu.eq(index - 2), li = activeElement.closest('li');
            if (li != undefined) activeBorder.css({width: li.width(), height: li.height(), left: li.position().left}).show();
        }
    };

    $(".main").onepage_scroll({
       sectionContainer: "section",
       easing: "ease",
       animationTime: 700,
       pagination: false,
       updateURL: false,
       beforeMove: function(index) {if(!r_fallback)activeBorder.update(index);},
       afterMove: function(index) {},
       loop: false,
       keyboard: true,
       responsiveFallback: r_fallback
    });

    function reSize() {
        var width = 320;
        var fontSize = 8;
        var bodyWidth = $('html').width();
        var bodyHeight = $('html').height();
        var multiplier = bodyWidth / width;
        if(bodyWidth > bodyHeight)multiplier = multiplier / 3;
        fontSize = Math.floor(fontSize * multiplier);
        $('body').css({fontSize: fontSize + 'px'});
    }


    reSize();
});
