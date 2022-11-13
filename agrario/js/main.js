/* Enovo Theme Scripts */

(function($){ "use strict";
             
    $(window).on('load', function() {
        $('body').addClass('loaded');
    });

             
/*=========================================================================
	Sticky Header
=========================================================================*/ 
	$(function() {
		var header = $("#header"),
			yOffset = 0,
			triggerPoint = 80;
		$(window).on( 'scroll', function() {
			yOffset = $(window).scrollTop();

			if (yOffset >= triggerPoint) {
				header.addClass("navbar-fixed-top");
			} else {
				header.removeClass("navbar-fixed-top");
			}

		});
	});

/*=========================================================================
    Mobile Menu
=========================================================================*/  
    $('.menu-wrap ul.nav').slicknav({
        prependTo: '.header_section .navbar',
        label: '',
        allowParentLinks: true
    });

/*=========================================================================
    ScreenShot Carousel
=========================================================================*/       
    function getSlide() {
        var wW = $(window).width();
        if (wW < 601) {
            return 1;
        }
        return 3;
    }
    var mySwiper = $('.screen_carousel').swiper({
        mode:'horizontal',
        loop: true,
        speed: 1000,
        autoplay: 1000,
        effect: 'coverflow',
        slidesPerView: getSlide(),
        grabCursor: true,
        pagination: '.screen-pagination',
        paginationClickable: true,
        nextButton: '.arrow-right',
        prevButton: '.arrow-left',
        keyboardControl: true,
        coverflow: {
            rotate: 0,
            stretch: 90,
            depth: 200,
            modifier: 1,
            slideShadows : true
        }
    });            

/*=========================================================================
	Testimonial Carousel
=========================================================================
	var testiSelector = $('#testimonial_carousel');
	testiSelector.owlCarousel({
        loop: true,
        autoplay: false,
        smartSpeed: 500,
        margin: 20,
        nav: true,
        dots: false,
        navText: ['<i class="ti-arrow-left"></i>', '<i class="ti-arrow-right"></i>'],
        responsive : {
		    // breakpoint from 0 up
		    0 : {
		        items: 1
		    },
		    // breakpoint from 480 up
		    480 : {
		       items: 2
		    },
		    // breakpoint from 768 up
		    768 : {
		       items: 3
		    }
		}
    });
*/
             
/*=========================================================================
	Initialize smoothscroll plugin
=========================================================================*/
	smoothScroll.init({
		offset: 60
	});
	 
/*=========================================================================
	Scroll To Top
=========================================================================*/ 
    $(window).on( 'scroll', function () {
        if ($(this).scrollTop() > 100) {
            $('#scroll-to-top').fadeIn();
        } else {
            $('#scroll-to-top').fadeOut();
        }
    });

/*=========================================================================
	WOW Active
=========================================================================*/ 
   new WOW().init();
             

})(jQuery);
