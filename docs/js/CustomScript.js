
jQuery(window).load(function () {
    jQuery("#Container").css("opacity", "1");
});


jQuery(document).ready(function(e) {

    //Start Rotating Card code
    jQuery().ready(function () {
        $('[rel="tooltip"]').tooltip();
    });

    function rotateCard(btn) {
        var $card = $(btn).closest('.card-container');
        console.log($card);
        if ($card.hasClass('hover')) {
            $card.removeClass('hover');
        } else {
            $card.addClass('hover');
        }
    } //close Rotating Card code

    jQuery('.counter').counterUp({
        delay: 10,
        time: 1000
    });

    jQuery(function () {
        $('.chart').easyPieChart({    
            barColor: '#999',
            trackColor: '#fff',
            lineWidth: 5,
            trackWidth: 4,
            animate: 2000,
            onStep: function (from, to, percent) {
                $(this.el).find('.percent').text(Math.round(percent));
            }
        });
    });


    /*---------------------------------------------------- */
    /* Final Countdown Settings
	------------------------------------------------------ */
    var finalDate = '2018/12/12';
    jQuery('div#counter').countdown(finalDate)
   	.on('update.countdown', function (event) {
   	    jQuery(this).html(event.strftime('<span>%D <em>days</em></span>' +
   										 	 '<span>%H <em>hours</em></span>' +
   										 	 '<span>%M <em>minutes</em></span>' +
   										 	 '<span>%S <em>seconds</em></span>'));
   	});


    /*-------  All Slider Start  ------*/
    jQuery('.flexslider').flexslider({ animation: "slide" }); 
    jQuery('#slider').nivoSlider();

    jQuery('.bxslider').bxSlider({
        mode: 'fade'
    });

    jQuery('.bxsliderCaption').bxSlider({
        mode: 'horizontal'
    });

    jQuery('.bxslider_slide').bxSlider({
        mode: 'horizontal'
    });

    jQuery('.bxTweets').bxSlider({
        mode: 'horizontal',
        speed: 1000,
        adaptiveHeightSpeed: 2000,
        auto: true 
    });

    /*------- Footer Top Carousel  ------*/
    jQuery('.carousel').slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4500,
      responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                infinite: true,
                dots: true
            }
        },
        {
            breakpoint: 767,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1
            }
        }
    ]
    });


    /*-------  Recent Works Carousel  ------*/

    jQuery('.carouselRW').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2400,
        responsive: [
        {
        breakpoint: 1024,
        settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
            infinite: true,
            dots: true
            }
        },
        {
        breakpoint: 767,
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1
            }
        }
    ]
    });


/*-------  Meet Our Team Carousel  ------*/

    jQuery('.carouselMOT').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3400,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
     });
    /*-------  All Slider Close  ------*/

    jQuery("#accordion").accordion({ active: false, collapsible: true, autoHeight: false });

    jQuery(".player").mb_YTPlayer();


    /*-------  Photo Gallery Start  ----*/

    jQuery(".gallery:first a[rel^='prettyPhoto']").prettyPhoto({ animation_speed: 'normal', theme: 'light_square', slideshow: 3000, autoplay_slideshow: true });
    jQuery(".gallery:gt(0) a[rel^='prettyPhoto']").prettyPhoto({ animation_speed: 'fast', slideshow: 10000, hideflash: true });

    /*-------  Photo Gallery Close  ----*/


    /*-------  Testimonials Start  ----*/
    jQuery('ul#quotes').quote_rotator();
    jQuery('ul#button_quotes').quote_rotator({
        buttons: { next: '>>', previous: '<<' }
    });
    /*-------  Testimonials Close  ----*/



    /*-------  Search Start  ----------*/
    jQuery(".MainSearchIcon").click(function () {
        jQuery(".SlideSearchButton").slideToggle("first");
    });

    /*-------  Search Close  ----------*/


    jQuery('#da-slider').cslider({
        autoplay: true,
        bgincrement: 450
    });


    /*-------  Touch Layer Slider Start  ----------*/

    jQuery('#example1').sliderPro({
        width: '100%',
        height: 400,
        arrows: true,
        buttons: false,
        waitForLayers: true,
        thumbnailWidth: 200,
        thumbnailHeight: 100,
        thumbnailPointer: true,
        autoplay: true,
        autoScaleLayers: false,
        breakpoints: {
            500: {
                thumbnailWidth: 120,
                thumbnailHeight: 50
            }
        }
    });


    /*-------  Touch Layer Slider Option 2  ----------*/

    jQuery('#example2').sliderPro({
        width: '50%',
        height: 500,
        aspectRatio: 1.5,
        visibleSize: '100%',
        forceSize: 'fullWidth'
    });

    // instantiate fancybox when a link is clicked
    jQuery('#example2 .sp-image').parent('a').on('click', function (event) {
        event.preventDefault();

        // check if the clicked link is also used in swiping the slider
        // by checking if the link has the 'sp-swiping' class attached.
        // if the slider is not being swiped, open the lightbox programmatically,
        // at the correct index
        if (jQuery('#example2').hasClass('sp-swiping') === false) {
            jQuery.fancybox.open($('#example2 .sp-image').parent('a'), { index: $(this).parents('.sp-slide').index() });
        }
    });


    /*-------  Touch Layer Slider Option 3  ----------*/


    /*-------  Carousel Start  --------*/
    jQuery("#flexiselDemo3").flexisel({
        visibleItems: 5,
        animationSpeed: 1000,
        autoPlay: true,
        autoPlaySpeed: 3000,
        pauseOnHover: true,
        enableResponsiveBreakpoints: true,
        responsiveBreakpoints: {
            portrait: {
                changePoint: 480,
                visibleItems: 1
            },
            landscape: {
                changePoint: 640,
                visibleItems: 2
            },
            tablet: {
                changePoint: 768,
                visibleItems: 3
            }
        }
    });

    /*-------  Carousel Close  --------*/


    /*-------  Scroll Start  ----------*/
    jQuery(window).scroll(function () {
        if (jQuery(this).scrollTop() > 200) {
            jQuery('.totop:hidden').stop(true, true).fadeIn();
        }
        else {
            jQuery('.totop').stop(true, true).fadeOut();
        }
    });
    jQuery('.totop span').click(function () {
        jQuery('html,body').animate({ scrollTop: 0 }, 'medium');
        return false;
    });

    /*-------  Scroll Close  --------*/



    /*-------  StickyHeader Start  --*/
    jQuery(window).scroll(function () {
        if (jQuery(this).scrollTop() > 250) {
            jQuery('#logoPart').addClass('sticky');
            jQuery('#Logo').addClass('SmallLogo');
            jQuery('.MainSearchIcon').addClass('LittleSearch');
            jQuery('.Menu').addClass('SmallMenu');
        }
        else {
            jQuery('#logoPart').removeClass('sticky');
            jQuery('#Logo').removeClass('SmallLogo');
            jQuery('.MainSearchIcon').removeClass('LittleSearch');
            jQuery('.Menu').removeClass('SmallMenu');
        }
    }); 

    /*-------  StickyHeader Close  --*/


    /*-------  Main Menu Start ------*/
    jQuery(".mmenu").hide();
    jQuery(".mtoggle").click(function () {
        jQuery(".mmenu").slideToggle(500);
    });


    /*-------  Close Main Menu  -----*/



    /*-------  Start horizontalTab  -----*/

    jQuery('#horizontalTab').easyResponsiveTabs({
        type: 'default', //Types: default, vertical, accordion           
        width: 'auto', //auto or any width like 600px
        fit: true,   // 100% fit in a container
        closed: 'accordion', // Start closed if in accordion view
        activate: function (event) { // Callback function if tab is switched
            var $tab = $(this);
            var $info = $('#tabInfo');
            var $name = $('span', $info);

            $name.text($tab.text());

            $info.show();
        }
    });

    /*-------  Close horizontalTab  -----*/



    /*-------  Start verticalTab  -----*/
    jQuery('#verticalTab').easyResponsiveTabs({
        type: 'vertical',
        width: 'auto',
        fit: true
    });

    /*-------  Close verticalTab  -----*/


    var initialWidth=0; var windowWidth=0; var subMenu; function megaHoverOver() { $(this).addClass('mmItemHover').find(".megaborder").stop().show(); windowWidth=$(window).width(); subMenu=$(this).find(".megaborder"); setDimensions($(this)); } function megaHoverOut() { $(this).removeClass('mmItemHover').find(".megaborder").stop().fadeOut('fast', function () { $(this).hide(); }); }
    function setDimensions(obj) { maxWidth=0;maxHeight=0;numColumns=0;maxColumns=3; obj.find("li.category").each(function(){numColumns++; if (initialWidth == 0) initialWidth = $(this).width() + 10; maxWidth = (initialWidth > maxWidth) ? initialWidth : maxWidth; }); maxWidth = (numColumns > maxColumns) ? (maxWidth * maxColumns) : (maxWidth * numColumns); obj.find("li.category").each(function () { maxHeight = ($(this).height() > maxHeight) ? $(this).height() : maxHeight; }); obj.find(".megaborder").css({ 'width':maxWidth-22 }); var rightPos=subMenu.offset().left+subMenu.width(); console.log(rightPos + " " + windowWidth); if (rightPos > windowWidth) { $(subMenu).css("margin-left",-rightPos+windowWidth-22); } obj.find("li.category").each(function () { var thisPosition=$(this).index()+1; if (thisPosition % 3 == 0) { $(this).addClass("mmRightColumn"); } }); }
    var config = { sensitivity: 2, interval: 100, over: megaHoverOver, timeout: 0, out: megaHoverOut }; $("ul.dnnmega li.mmHasChild").hoverIntent(config); var firstTouch = true; $("ul.dnnmega li.mmHasChild").bind("touchstart", function () { if (firstTouch) { firstTouch = false; setDimensions($(this)); $(this).find(".megaborder").stop().show(); return false; } });


}); // Colse DR Script //


// Reveal Animations When Scrolling
new WOW().init();



