
jQuery(document).ready(function(e) {


    // Theme: Color schemes
    // ====================

    var $body = $('body');
    var sidebar = '';
    sidebar += '<div class="sidebar">';
    sidebar += '<div class="dnnsidebar_toggle" role="button"><i class="fa fa-cog"></i></div>';
    sidebar += '<h4 class="dnnsidebar_heading page-header">Color scheme</h4>';
    sidebar += '<ul class="dnnsidebar_colors">';
    sidebar += '<li data-color="aquablue" class="active brand-aquablue"><span></span></li>';
    sidebar += '<li data-color="black" class="brand-black"><span></span></li>';
    sidebar += '<li data-color="blueyellow" class="brand-blueyellow"><span></span></li>';
    sidebar += '<li data-color="brown" class="brand-brown"><span></span></li>';
    sidebar += '<li data-color="cadetblue" class="brand-cadetblue"><span></span></li>';
    sidebar += '<li data-color="chocolate" class="brand-chocolate"><span></span></li>';
    sidebar += '<li data-color="crimson" class="brand-crimson"><span></span></li>';
    sidebar += '<li data-color="darkgoldenrod" class="brand-darkgoldenrod"><span></span></li>';
    sidebar += '<li data-color="deeppink" class="brand-deeppink"><span></span></li>';
    sidebar += '<li data-color="dodgerblue" class="brand-dodgerblue"><span></span></li>';
    sidebar += '<li data-color="forestgreen" class="brand-forestgreen"><span></span></li>';
    sidebar += '<li data-color="gray" class="brand-gray"><span></span></li>';
    sidebar += '<li data-color="green" class="brand-green"><span></span></li>';
    sidebar += '<li data-color="limegreen" class="brand-limegreen"><span></span></li>';
    sidebar += '<li data-color="maroon" class="brand-maroon"><span></span></li>';
    sidebar += '<li data-color="midnightblue" class="brand-midnightblue"><span></span></li>';
    sidebar += '<li data-color="olivedrab" class="brand-olivedrab"><span></span></li>';
    sidebar += '<li data-color="olivegreen" class="brand-olivegreen"><span></span></li>';
    sidebar += '<li data-color="orange" class="brand-orange"><span></span></li>';
    sidebar += '<li data-color="orangered" class="brand-orangered"><span></span></li>';
    sidebar += '<li data-color="pink" class="brand-pink"><span></span></li>';
    sidebar += '<li data-color="purple" class="brand-purple"><span></span></li>';
    sidebar += '<li data-color="red" class="brand-red"><span></span></li>';
    sidebar += '<li data-color="royalblue" class="brand-royalblue"><span></span></li>';
    sidebar += '<li data-color="slateblue" class="brand-slateblue"><span></span></li>';
    sidebar += '<li data-color="slategray" class="brand-slategray"><span></span></li>';
    sidebar += '<li data-color="teal" class="brand-teal"><span></span></li>';
    sidebar += '<li data-color="turquoise" class="brand-turquoise"><span></span></li>';
    sidebar += '<li data-color="violet" class="brand-violet"><span></span></li>';
    sidebar += '<li data-color="yellow" class="brand-yellow"><span></span></li>';  
    sidebar += '</ul>';
    sidebar += '<h4 class="dnnsidebar_heading page-header">Layout Style</h4>';
    sidebar += '<ul class="layout_list">';
    sidebar += '<li data-color="boxed" class="brand-boxed"><span>Boxed Layout</span></li>';
    sidebar += '<li data-color="wide" class="brand-wide WideLayout"><span>Wide Layout</span></li>';
    sidebar += '</ul>';
    sidebar += '<h4 class="dnnsidebar_heading resetstyles page-header"><a class="clickreset">Reset styles</a></h4>';
    sidebar += '</div>';

    if (!$body.hasClass('no-settings')) {
        $body.append(sidebar);
    }

    // Toggle sidebar
    $body.on('click', '.dnnsidebar_toggle', function () {
        $('.sidebar').toggleClass('active');
    });

    // Toggle color schemes
    $body.on('click', '.dnnsidebar_colors > li', function () {
        var $this = $(this);

        // Skin stylesheet
        var color = $this.data('color');
        var linkLink = '<link rel="stylesheet" href="/Portals/_default/Skins/Advance/CSS/skin22_' + color + '.css">';
        $('[href*="/Portals/_default/Skins/Advance/CSS/skin22"]').after(linkLink);

        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');
    });

    jQuery('.brand-aquablue').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_aquablue.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css aquablue');
        return false;
    });

    jQuery('.brand-black').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_black.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css black');
        return false;
    });

    jQuery('.brand-blueyellow').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_blueyellow.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css blueyellow');
        return false;
    });

    jQuery('.brand-brown').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_brown.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css brown');
        return false;
    });

    jQuery('.brand-cadetblue').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_cadetblue.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css cadetblue');
        return false;
    });

    jQuery('.brand-chocolate').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_chocolate.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css chocolate');
        return false;
    });

    jQuery('.brand-crimson').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_crimson.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css crimson');
        return false;
    });

    jQuery('.brand-darkgoldenrod').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_darkgoldenrod.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css darkgoldenrod');
        return false;
    });

    jQuery('.brand-deeppink').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_deeppink.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css deeppink');
        return false;
    });

    jQuery('.brand-dodgerblue').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_dodgerblue.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css 3');
        return false;
    });

    jQuery('.brand-forestgreen').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_forestgreen.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css forestgreen');
        return false;
    });

    jQuery('.brand-gray').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_gray.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css gray');
        return false;
    });

    jQuery('.brand-green').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_green.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css green');
        return false;
    });

    jQuery('.brand-limegreen').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_limegreen.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css limegreen');
        return false;
    });

    jQuery('.brand-maroon').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_maroon.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css maroon');
        return false;
    });

    jQuery('.brand-midnightblue').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_midnightblue.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css midnightblue');
        return false;
    });

    jQuery('.brand-olivedrab').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_olivedrab.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css olivedrab');
        return false;
    });

    jQuery('.brand-olivegreen').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_olivegreen.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css olivegreen');
        return false;
    });

    jQuery('.brand-orange').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_orange.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css orange');
        return false;
    });

    jQuery('.brand-orangered').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_orangered.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css orangered');
        return false;
    });

    jQuery('.brand-pink').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_pink.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css pink');
        return false;
    });

    jQuery('.brand-purple').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_purple.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css purple');
        return false;
    });

    jQuery('.brand-red').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_red.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css red');
        return false;
    });

    jQuery('.brand-royalblue').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_royalblue.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css royalblue');
        return false;
    });

    jQuery('.brand-slateblue').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_slateblue.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css slateblue');
        return false;
    });

    jQuery('.brand-slategray').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_slategray.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css slategray');
        return false;
    });

    jQuery('.brand-teal').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_teal.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css teal');
        return false;
    });

    jQuery('.brand-turquoise').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_turquoise.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css turquoise');
        return false;
    });

    jQuery('.brand-violet').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_violet.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css violet');
        return false;
    });

    jQuery('.brand-yellow').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin_yellow.css');

        var $this = $(this);
        // Color active button
        $this.addClass('active');
        $this.siblings('li').removeClass('active');

        console.log('css yellow');
        return false;
    });

    // boxed color schemes
    jQuery('.brand-boxed').on('click', function () {
        jQuery('#custom').attr('href', '/Portals/_default/Skins/Advance/CSS/custom_boxed.css');
        console.log('css boxed');
        return false;
    });

    // wide color schemes
    jQuery('.brand-wide').on('click', function () {
        jQuery('#custom').attr('href', '/Portals/_default/Skins/Advance/CSS/custom_wide.css');
        console.log('css wide');
        return false;
    });

    // Reset color schemes
    jQuery('.clickreset').on('click', function () {
        jQuery('#skin').attr('href', '/Portals/_default/Skins/Advance/CSS/skin.css');
        jQuery('#custom').attr('href', '/Portals/_default/Skins/Advance/CSS/custom_wide.css');
        console.log('css reset');
        return false;
    });


    /*------- Start Mobile Menu  ------*/
    jQuery('.nav > li.dropdown > a').click(function (e) {
        var $target = $(e.target);
        var activeNav = $(this).siblings();
        if ($target.is('b')) {
            $(this).siblings().toggle("fast");
            $('.nav > li.dropdown > ul.dropdown-menu:visible').not($(this).siblings()).hide("fast");
            return false;
        }
    });

    jQuery('.nav > li > ul > li > a').click(function (e) {
        var $target = $(e.target);
        var activeNav = $(this).siblings();
        if ($target.is('b')) {
            $(this).siblings().toggle("fast");
            $('.nav > li > ul > li > ul.dropdown-menu:visible').not($(this).siblings()).hide("fast");
            return false;
        }
    });
    /*------- Close Mobile Menu  ------*/


}); // Colse DR Script //





