/*!
    * Start Bootstrap - Agency v6.0.2 (https://startbootstrap.com/template-overviews/agency)
    * Copyright 2013-2020 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
    */
(function ($) {
    "use strict"; // Start of use strict
    $(document).ready(function () {

        // Activate scrollspy to add active class to navbar items on scroll

        // Collapse Navbar
        var navbarCollapse = function () {
            var windowwidth = $(window).width();
            if ($("#mainNav").offset().top > 100) {
                $("#mainNav").addClass("navbar-shrink");
            } else {
                $("#mainNav").removeClass("navbar-shrink");
            }
        };

        // Collapse now if page is not at top
        navbarCollapse();

        // Collapse the navbar when page is scrolled
        $(window).scroll(navbarCollapse);

    })

})(jQuery); // End of use strict
