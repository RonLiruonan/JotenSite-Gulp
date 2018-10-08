

/*   _ _      _       _
___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
|__/

Version: 1.5.7
Author: Ken Wheeler
Website: http://kenwheeler.github.io
Docs: http://kenwheeler.github.io/slick
Repo: http://github.com/kenwheeler/slick
Issues: http://github.com/kenwheeler/slick/issues
*/

/* global window, document, define, jQuery, setInterval, clearInterval */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function ($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function () {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function (slider, i) {
                    return '<button type="button" data-role="none" role="button" aria-required="false" tabindex="0">' + (i + 1) + '</button>';
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.hidden = 'hidden';
            _.paused = false;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, dataSettings, settings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);
            _.checkResponsive(true);

        }

        return Slick;

    }());

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

        var _ = this;

        if (typeof (index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof (index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function () {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function (targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                        duration: _.options.speed,
                        easing: _.options.easing,
                        step: function (now) {
                            now = Math.ceil(now);
                            if (_.options.vertical === false) {
                                animProps[_.animType] = 'translate(' +
                                    now + 'px, 0px)';
                                _.$slideTrack.css(animProps);
                            } else {
                                animProps[_.animType] = 'translate(0px,' +
                                    now + 'px)';
                                _.$slideTrack.css(animProps);
                            }
                        },
                        complete: function () {
                            if (callback) {
                                callback.call();
                            }
                        }
                    });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function () {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.asNavFor = function (index) {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if (asNavFor && asNavFor !== null) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        if (asNavFor !== null && typeof asNavFor === 'object') {
            asNavFor.each(function () {
                var target = $(this).slick('getSlick');
                if (!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function (slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function () {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

        if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator,
                _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function () {

        var _ = this;
        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function () {

        var _ = this;

        if (_.options.infinite === false) {

            if (_.direction === 1) {

                if ((_.currentSlide + 1) === _.slideCount -
                    1) {
                    _.direction = 0;
                }

                _.slideHandler(_.currentSlide + _.options.slidesToScroll);

            } else {

                if ((_.currentSlide - 1 === 0)) {

                    _.direction = 1;

                }

                _.slideHandler(_.currentSlide - _.options.slidesToScroll);

            }

        } else {

            _.slideHandler(_.currentSlide + _.options.slidesToScroll);

        }

    };

    Slick.prototype.buildArrows = function () {

        var _ = this;

        if (_.options.arrows === true) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if (_.slideCount > _.options.slidesToShow) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add(_.$nextArrow)

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function () {

        var _ = this,
            i, dotString;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            dotString = '<ul class="' + _.options.dotsClass + '">';

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dotString += '<li>' + _.options.customPaging.call(this, _, i) + '</li>';
            }

            dotString += '</ul>';

            _.$dots = $(dotString).appendTo(
                _.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.buildOut = function () {

        var _ = this;

        _.$slides =
            _.$slider
                .children(_.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function (index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slidesCache = _.$slides;

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div aria-live="polite" class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function () {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides, slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if (_.options.rows > 1) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement('div');
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.html(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width': (100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function (initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if (_.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                            targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if (!initial && triggerBreakpoint !== false) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function (event, dontAnimate) {

        var _ = this,
            $target = $(event.target),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if ($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if (!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function (index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function () {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots).off('click.slick', _.changeSlide);

            if (_.options.pauseOnDotsHover === true && _.options.autoplay === true) {

                $('li', _.$dots)
                    .off('mouseenter.slick', $.proxy(_.setPaused, _, true))
                    .off('mouseleave.slick', $.proxy(_.setPaused, _, false));

            }

        }

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.$list.off('mouseenter.slick', $.proxy(_.setPaused, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.setPaused, _, false));

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);
    };

    Slick.prototype.cleanUpRows = function () {

        var _ = this, originalSlides;

        if (_.options.rows > 1) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.html(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function (event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function (refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.options.arrows === true) {

            if (_.$prevArrow && _.$prevArrow.length) {

                _.$prevArrow
                    .removeClass('slick-disabled slick-arrow slick-hidden')
                    .removeAttr('aria-hidden aria-disabled tabindex')
                    .css("display", "");

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.remove();
                }
            }

            if (_.$nextArrow && _.$nextArrow.length) {

                _.$nextArrow
                    .removeClass('slick-disabled slick-arrow slick-hidden')
                    .removeAttr('aria-hidden aria-disabled tabindex')
                    .css("display", "");

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.remove();
                }
            }

        }

        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function () {
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');

        _.unslicked = true;

        if (!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function (slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function (slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function () {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function (slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

        var _ = this;

        if (filter !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function () {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToShow;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToShow;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function (slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;

            if (_.options.centerMode === true) {
                if (_.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function () {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function () {

        return this;

    };

    Slick.prototype.getSlideCount = function () {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function (index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function (creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

    };

    Slick.prototype.initArrowEvents = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.on('click.slick', {
                message: 'previous'
            }, _.changeSlide);
            _.$nextArrow.on('click.slick', {
                message: 'next'
            }, _.changeSlide);
        }

    };

    Slick.prototype.initDotEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.setPaused, _, true))
                .on('mouseleave.slick', $.proxy(_.setPaused, _, false));
        }

    };

    Slick.prototype.initializeEvents = function () {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        _.$list.on('mouseenter.slick', $.proxy(_.setPaused, _, true));
        _.$list.on('mouseleave.slick', $.proxy(_.setPaused, _, false));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.initUI = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

        if (_.options.autoplay === true) {

            _.autoPlay();

        }

    };

    Slick.prototype.keyHandler = function (event) {

        var _ = this;
        //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: 'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function () {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {
            $('img[data-lazy]', imagesScope).each(function () {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {
                    image
                        .animate({ opacity: 0 }, 100, function () {
                            image
                                .attr('src', imageSource)
                                .animate({ opacity: 1 }, 200, function () {
                                    image
                                        .removeAttr('data-lazy')
                                        .removeClass('slick-loading');
                                });
                        });
                };

                imageToLoad.src = imageSource;

            });
        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = rangeStart + _.options.slidesToShow;
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
            if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
                cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
                loadImages(cloneRange);
            } else if (_.currentSlide === 0) {
                cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
                loadImages(cloneRange);
            }

    };

    Slick.prototype.loadSlider = function () {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function () {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function () {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function () {

        var _ = this;

        _.paused = false;
        _.autoPlay();

    };

    Slick.prototype.postSlide = function (index) {

        var _ = this;

        _.$slider.trigger('afterChange', [_, index]);

        _.animating = false;

        _.setPosition();

        _.swipeLeft = null;

        if (_.options.autoplay === true && _.paused === false) {
            _.autoPlay();
        }
        if (_.options.accessibility === true) {
            _.initADA();
        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function (e) {
        e.preventDefault();
    };

    Slick.prototype.progressiveLazyLoad = function () {

        var _ = this,
            imgCount, targetImage;

        imgCount = $('img[data-lazy]', _.$slider).length;

        if (imgCount > 0) {
            targetImage = $('img[data-lazy]', _.$slider).first();
            targetImage.attr('src', targetImage.attr('data-lazy')).removeClass('slick-loading').load(function () {
                targetImage.removeAttr('data-lazy');
                _.progressiveLazyLoad();

                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }
            })
                .error(function () {
                    targetImage.removeAttr('data-lazy');
                    _.progressiveLazyLoad();
                });
        }

    };

    Slick.prototype.refresh = function (initializing) {

        var _ = this,
            currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if (!initializing) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function () {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ($.type(responsiveSettings) === "array" && responsiveSettings.length) {

            _.respondTo = _.options.respondTo || 'window';

            for (breakpoint in responsiveSettings) {

                l = _.breakpoints.length - 1;
                currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while (l >= 0) {
                        if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
                            _.breakpoints.splice(l, 1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function (a, b) {
                return (_.options.mobileFirst) ? a - b : b - a;
            });

        }

    };

    Slick.prototype.reinit = function () {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(0);

        _.setPosition();

        _.$slider.trigger('reInit', [_]);

        if (_.options.autoplay === true) {
            _.focusHandler();
        }

    };

    Slick.prototype.resize = function () {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function () {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if (!_.unslicked) { _.setPosition(); }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

        var _ = this;

        if (typeof (index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function (position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function () {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function () {

        var _ = this,
            targetLeft;

        _.$slides.each(function (index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function () {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption = Slick.prototype.slickSetOption = function (option, value, refresh) {

        var _ = this, l, item;

        if (option === "responsive" && $.type(value) === "array") {
            for (item in value) {
                if ($.type(_.options.responsive) !== "array") {
                    _.options.responsive = [value[item]];
                } else {
                    l = _.options.responsive.length - 1;
                    // loop through the responsive object and splice out duplicates.
                    while (l >= 0) {
                        if (_.options.responsive[l].breakpoint === value[item].breakpoint) {
                            _.options.responsive.splice(l, 1);
                        }
                        l--;
                    }
                    _.options.responsive.push(value[item]);
                }
            }
        } else {
            _.options[option] = value;
        }

        if (refresh === true) {
            _.unload();
            _.reinit();
        }

    };

    Slick.prototype.setPosition = function () {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function () {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (_.options.fade) {
            if (typeof _.options.zIndex === 'number') {
                if (_.options.zIndex < 3) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = (_.animType !== null && _.animType !== false);

    };


    Slick.prototype.setSlideClasses = function (index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {

                    _.$slides
                        .slice(index - centerOffset, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }

    };

    Slick.prototype.setupInfinite = function () {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                    infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.setPaused = function (paused) {

        var _ = this;

        if (_.options.autoplay === true && _.options.pauseOnHover === true) {
            _.paused = paused;
            if (!paused) {
                _.autoPlay();
            } else {
                _.autoPlayClear();
            }
        }
    };

    Slick.prototype.selectHandler = function (event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.setSlideClasses(index);
            _.asNavFor(index);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay === true) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function () {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true) {
            _.animateSlide(targetLeft, function () {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function () {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'left';
            } else {
                return 'right';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function (event) {

        var _ = this,
            slideCount;

        _.dragging = false;

        _.shouldClick = (_.touchObject.swipeLength > 10) ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger('edge', [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            switch (_.swipeDirection()) {
                case 'left':
                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();
                    _.slideHandler(slideCount);
                    _.currentDirection = 0;
                    _.touchObject = {};
                    _.$slider.trigger('swipe', [_, 'left']);
                    break;

                case 'right':
                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();
                    _.slideHandler(slideCount);
                    _.currentDirection = 1;
                    _.touchObject = {};
                    _.$slider.trigger('swipe', [_, 'right']);
                    break;
            }
        } else {
            if (_.touchObject.startX !== _.touchObject.curX) {
                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }

    };

    Slick.prototype.swipeHandler = function (event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function (event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = Math.round(Math.sqrt(
                Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
        }

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function (event) {

        var _ = this,
            touches;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function () {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function (fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function () {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if (_.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function () {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                .removeClass('slick-active')
                .attr('aria-hidden', 'true');

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active')
                .attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.visibility = function () {

        var _ = this;

        if (document[_.hidden]) {
            _.paused = true;
            _.autoPlayClear();
        } else {
            if (_.options.autoplay === true) {
                _.paused = false;
                _.autoPlay();
            }
        }

    };
    Slick.prototype.initADA = function () {
        var _ = this;
        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        _.$slideTrack.attr('role', 'listbox');

        _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
            $(this).attr({
                'role': 'option',
                'aria-describedby': 'slick-slide' + _.instanceUid + i + ''
            });
        });

        if (_.$dots !== null) {
            _.$dots.attr('role', 'tablist').find('li').each(function (i) {
                $(this).attr({
                    'role': 'presentation',
                    'aria-selected': 'false',
                    'aria-controls': 'navigation' + _.instanceUid + i + '',
                    'id': 'slick-slide' + _.instanceUid + i + ''
                });
            })
                .first().attr('aria-selected', 'true').end()
                .find('button').attr('role', 'button').end()
                .closest('div').attr('role', 'toolbar');
        }
        _.activateADA();

    };

    Slick.prototype.activateADA = function () {
        var _ = this,
            _isSlideOnFocus = _.$slider.find('*').is(':focus');
        // _isSlideOnFocus = _.$slides.is(':focus') || _.$slides.find('*').is(':focus');

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false',
            'tabindex': '0'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

        (_isSlideOnFocus) && _.$slideTrack.find('.slick-active').focus();

    };

    Slick.prototype.focusHandler = function () {
        var _ = this;
        _.$slider.on('focus.slick blur.slick', '*', function (event) {
            event.stopImmediatePropagation();
            var sf = $(this);
            setTimeout(function () {
                if (_.isPlay) {
                    if (sf.is(':focus')) {
                        _.autoPlayClear();
                        _.paused = true;
                    } else {
                        _.paused = false;
                        _.autoPlay();
                    }
                }
            }, 0);
        });
    };

    $.fn.slick = function () {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i = 0,
            ret;
        for (i; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));

/********************** Close Slick Slider ***************************/



(function ($, undefined) {

    /*
    * Slider object.
    */
    $.Slider = function (options, element) {

        this.$el = $(element);

        this._init(options);

    };

    $.Slider.defaults = {
        current: 0, 	// index of current slide
        bgincrement: 50, // increment the bg position (parallax effect) when sliding
        autoplay: false, // slideshow on / off
        interval: 4000  // time between transitions
    };

    $.Slider.prototype = {
        _init: function (options) {

            this.options = $.extend(true, {}, $.Slider.defaults, options);

            this.$slides = this.$el.children('div.da-slide');
            this.slidesCount = this.$slides.length;

            this.current = this.options.current;

            if (this.current < 0 || this.current >= this.slidesCount) {

                this.current = 0;

            }

            this.$slides.eq(this.current).addClass('da-slide-current');

            var $navigation = $('<nav class="da-dots"/>');
            for (var i = 0; i < this.slidesCount; ++i) {

                $navigation.append('<span/>');

            }
            $navigation.appendTo(this.$el);

            this.$pages = this.$el.find('nav.da-dots > span');
            this.$navNext = this.$el.find('span.da-arrows-next');
            this.$navPrev = this.$el.find('span.da-arrows-prev');

            this.isAnimating = false;

            this.bgpositer = 0;

            this.cssAnimations = Modernizr.cssanimations;
            this.cssTransitions = Modernizr.csstransitions;

            if (!this.cssAnimations || !this.cssAnimations) {

                this.$el.addClass('da-slider-fb');

            }

            this._updatePage();

            // load the events
            this._loadEvents();

            // slideshow
            if (this.options.autoplay) {

                this._startSlideshow();

            }

        },
        _navigate: function (page, dir) {

            var $current = this.$slides.eq(this.current), $next, _self = this;

            if (this.current === page || this.isAnimating) return false;

            this.isAnimating = true;

            // check dir
            var classTo, classFrom, d;

            if (!dir) {

                (page > this.current) ? d = 'next' : d = 'prev';

            }
            else {

                d = dir;

            }

            if (this.cssAnimations && this.cssAnimations) {

                if (d === 'next') {

                    classTo = 'da-slide-toleft';
                    classFrom = 'da-slide-fromright';
                    ++this.bgpositer;

                }
                else {

                    classTo = 'da-slide-toright';
                    classFrom = 'da-slide-fromleft';
                    --this.bgpositer;

                }

                this.$el.css('background-position', this.bgpositer * this.options.bgincrement + '% 0%');

            }

            this.current = page;

            $next = this.$slides.eq(this.current);

            if (this.cssAnimations && this.cssAnimations) {

                var rmClasses = 'da-slide-toleft da-slide-toright da-slide-fromleft da-slide-fromright';
                $current.removeClass(rmClasses);
                $next.removeClass(rmClasses);

                $current.addClass(classTo);
                $next.addClass(classFrom);

                $current.removeClass('da-slide-current');
                $next.addClass('da-slide-current');

            }

            // fallback
            if (!this.cssAnimations || !this.cssAnimations) {

                $next.css('left', (d === 'next') ? '100%' : '-100%').stop().animate({
                    left: '0%'
                }, 1000, function () {
                    _self.isAnimating = false;
                });

                $current.stop().animate({
                    left: (d === 'next') ? '-100%' : '100%'
                }, 1000, function () {
                    $current.removeClass('da-slide-current');
                });

            }

            this._updatePage();

        },
        _updatePage: function () {

            this.$pages.removeClass('da-dots-current');
            this.$pages.eq(this.current).addClass('da-dots-current');

        },
        _startSlideshow: function () {

            var _self = this;

            this.slideshow = setTimeout(function () {

                var page = (_self.current < _self.slidesCount - 1) ? page = _self.current + 1 : page = 0;
                _self._navigate(page, 'next');

                if (_self.options.autoplay) {

                    _self._startSlideshow();

                }

            }, this.options.interval);

        },
        page: function (idx) {

            if (idx >= this.slidesCount || idx < 0) {

                return false;

            }

            if (this.options.autoplay) {

                clearTimeout(this.slideshow);
                this.options.autoplay = false;

            }

            this._navigate(idx);

        },
        _loadEvents: function () {

            var _self = this;

            this.$pages.on('click.cslider', function (event) {

                _self.page($(this).index());
                return false;

            });

            this.$navNext.on('click.cslider', function (event) {

                if (_self.options.autoplay) {

                    clearTimeout(_self.slideshow);
                    _self.options.autoplay = false;

                }

                var page = (_self.current < _self.slidesCount - 1) ? page = _self.current + 1 : page = 0;
                _self._navigate(page, 'next');
                return false;

            });

            this.$navPrev.on('click.cslider', function (event) {

                if (_self.options.autoplay) {

                    clearTimeout(_self.slideshow);
                    _self.options.autoplay = false;

                }

                var page = (_self.current > 0) ? page = _self.current - 1 : page = _self.slidesCount - 1;
                _self._navigate(page, 'prev');
                return false;

            });

            if (this.cssTransitions) {

                if (!this.options.bgincrement) {

                    this.$el.on('webkitAnimationEnd.cslider animationend.cslider OAnimationEnd.cslider', function (event) {

                        if (event.originalEvent.animationName === 'toRightAnim4' || event.originalEvent.animationName === 'toLeftAnim4') {

                            _self.isAnimating = false;

                        }

                    });

                }
                else {

                    this.$el.on('webkitTransitionEnd.cslider transitionend.cslider OTransitionEnd.cslider', function (event) {

                        if (event.target.id === _self.$el.attr('id'))
                            _self.isAnimating = false;

                    });

                }

            }

        }
    };

    var logError = function (message) {
        if (this.console) {
            console.error(message);
        }
    };

    $.fn.cslider = function (options) {

        if (typeof options === 'string') {

            var args = Array.prototype.slice.call(arguments, 1);

            this.each(function () {

                var instance = $.data(this, 'cslider');

                if (!instance) {
                    logError("cannot call methods on cslider prior to initialization; " +
                        "attempted to call method '" + options + "'");
                    return;
                }

                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for cslider instance");
                    return;
                }

                instance[options].apply(instance, args);

            });

        }
        else {

            this.each(function () {

                var instance = $.data(this, 'cslider');
                if (!instance) {
                    $.data(this, 'cslider', new $.Slider(options, this));
                }
            });

        }

        return this;

    };

})(jQuery);



/*
* File: jquery.flexisel.js
* Version: 1.0.0
* Description: Responsive carousel jQuery plugin
* Author: 9bit Studios
* Copyright 2012, 9bit Studios
* http://www.9bitstudios.com
* Free to use and abuse under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
*/

(function ($) {

    $.fn.flexisel = function (options) {

        var defaults = $.extend({
            visibleItems: 4,
            animationSpeed: 200,
            autoPlay: false,
            autoPlaySpeed: 3000,
            pauseOnHover: true,
            setMaxWidthAndHeight: false,
            enableResponsiveBreakpoints: false,
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
        }, options);

        /******************************
        Private Variables
        *******************************/

        var object = $(this);
        var settings = $.extend(defaults, options);
        var itemsWidth; // Declare the global width of each item in carousel
        var canNavigate = true;
        var itemsVisible = settings.visibleItems;

        /******************************
        Public Methods
        *******************************/

        var methods = {

            init: function () {

                return this.each(function () {
                    methods.appendHTML();
                    methods.setEventHandlers();
                    methods.initializeItems();
                });
            },

            /******************************
            Initialize Items
            *******************************/

            initializeItems: function () {

                var listParent = object.parent();
                var innerHeight = listParent.height();
                var childSet = object.children();

                var innerWidth = listParent.width(); // Set widths
                itemsWidth = (innerWidth) / itemsVisible;
                childSet.width(itemsWidth);
                childSet.last().insertBefore(childSet.first());
                childSet.last().insertBefore(childSet.first());
                object.css({ 'left': -itemsWidth });

                object.fadeIn();
                $(window).trigger("resize"); // needed to position arrows correctly

            },


            /******************************
            Append HTML
            *******************************/

            appendHTML: function () {

                object.addClass("nbs-flexisel-ul");
                object.wrap("<div class='nbs-flexisel-container'><div class='nbs-flexisel-inner'></div></div>");
                object.find("li").addClass("nbs-flexisel-item");

                if (settings.setMaxWidthAndHeight) {
                    var baseWidth = $(".nbs-flexisel-item > img").width();
                    var baseHeight = $(".nbs-flexisel-item > img").height();
                    $(".nbs-flexisel-item > img").css("max-width", baseWidth);
                    $(".nbs-flexisel-item > img").css("max-height", baseHeight);
                }

                $("<div class='nbs-flexisel-nav-left'></div><div class='nbs-flexisel-nav-right'></div>").insertAfter(object);
                var cloneContent = object.children().clone();
                object.append(cloneContent);
            },


            /******************************
            Set Event Handlers
            *******************************/
            setEventHandlers: function () {

                var listParent = object.parent();
                var childSet = object.children();
                var leftArrow = listParent.find($(".nbs-flexisel-nav-left"));
                var rightArrow = listParent.find($(".nbs-flexisel-nav-right"));

                $(window).on("resize", function (event) {

                    methods.setResponsiveEvents();

                    var innerWidth = $(listParent).width();
                    var innerHeight = $(listParent).height();

                    itemsWidth = (innerWidth) / itemsVisible;

                    childSet.width(itemsWidth);
                    object.css({ 'left': -itemsWidth });

                    var halfArrowHeight = (leftArrow.height()) / 2;
                    var arrowMargin = (innerHeight / 2) - halfArrowHeight;
                    leftArrow.css("top", arrowMargin + "px");
                    rightArrow.css("top", arrowMargin + "px");

                });

                $(leftArrow).on("click", function (event) {
                    methods.scrollLeft();
                });

                $(rightArrow).on("click", function (event) {
                    methods.scrollRight();
                });

                if (settings.pauseOnHover == true) {
                    $(".nbs-flexisel-item").on({
                        mouseenter: function () {
                            canNavigate = false;
                        },
                        mouseleave: function () {
                            canNavigate = true;
                        }
                    });
                }

                if (settings.autoPlay == true) {

                    setInterval(function () {
                        if (canNavigate == true)
                            methods.scrollRight();
                    }, settings.autoPlaySpeed);
                }

            },

            /******************************
            Set Responsive Events
            *******************************/

            setResponsiveEvents: function () {
                var contentWidth = $('html').width();

                if (settings.enableResponsiveBreakpoints == true) {
                    if (contentWidth < settings.responsiveBreakpoints.portrait.changePoint) {
                        itemsVisible = settings.responsiveBreakpoints.portrait.visibleItems;
                    }
                    else if (contentWidth > settings.responsiveBreakpoints.portrait.changePoint && contentWidth < settings.responsiveBreakpoints.landscape.changePoint) {
                        itemsVisible = settings.responsiveBreakpoints.landscape.visibleItems;
                    }
                    else if (contentWidth > settings.responsiveBreakpoints.landscape.changePoint && contentWidth < settings.responsiveBreakpoints.tablet.changePoint) {
                        itemsVisible = settings.responsiveBreakpoints.tablet.visibleItems;
                    }
                    else {
                        itemsVisible = settings.visibleItems;
                    }
                }
            },

            /******************************
            Scroll Left
            *******************************/

            scrollLeft: function () {

                if (canNavigate == true) {
                    canNavigate = false;

                    var listParent = object.parent();
                    var innerWidth = listParent.width();

                    itemsWidth = (innerWidth) / itemsVisible;

                    var childSet = object.children();

                    object.animate({
                        'left': "+=" + itemsWidth
                    },
                        {
                            queue: false,
                            duration: settings.animationSpeed,
                            easing: "linear",
                            complete: function () {
                                childSet.last().insertBefore(childSet.first()); // Get the first list item and put it after the last list item (that's how the infinite effects is made)   								
                                methods.adjustScroll();
                                canNavigate = true;
                            }
                        }
                    );
                }
            },

            /******************************
            Scroll Right
            *******************************/

            scrollRight: function () {

                if (canNavigate == true) {
                    canNavigate = false;

                    var listParent = object.parent();
                    var innerWidth = listParent.width();

                    itemsWidth = (innerWidth) / itemsVisible;

                    var childSet = object.children();

                    object.animate({
                        'left': "-=" + itemsWidth
                    },
                        {
                            queue: false,
                            duration: settings.animationSpeed,
                            easing: "linear",
                            complete: function () {
                                childSet.first().insertAfter(childSet.last()); // Get the first list item and put it after the last list item (that's how the infinite effects is made)   
                                methods.adjustScroll();
                                canNavigate = true;
                            }
                        }
                    );
                }
            },

            /******************************
            Adjust Scroll 
            *******************************/

            adjustScroll: function () {

                var listParent = object.parent();
                var childSet = object.children();

                var innerWidth = listParent.width();
                itemsWidth = (innerWidth) / itemsVisible;
                childSet.width(itemsWidth);
                object.css({ 'left': -itemsWidth });
            }

        };

        if (methods[options]) { 	// $("#element").pluginName('methodName', 'arg1', 'arg2');
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) { 	// $("#element").pluginName({ option: 1, option:2 });
            return methods.init.apply(this);
        } else {
            $.error('Method "' + method + '" does not exist in flexisel plugin!');
        }
    };

})(jQuery);




/*
* ******************************************************************************
*  jquery.mb.components
*  file: jquery.mb.YTPlayer.js
*
*  Copyright (c) 2001-2013. Matteo Bicocchi (Pupunzi);
*  Open lab srl, Firenze - Italy
*  email: matteo@open-lab.com
*  site: 	http://pupunzi.com
*  blog:	http://pupunzi.open-lab.com
* 	http://open-lab.com
*
*  Licences: MIT, GPL
*  http://www.opensource.org/licenses/mit-license.php
*  http://www.gnu.org/licenses/gpl.html
*
*  last modified: 16/12/13 23.46
*  *****************************************************************************
*/

if (typeof ytp != "object")
    ytp = {};

function onYouTubePlayerAPIReady() {

    if (ytp.YTAPIReady)
        return;

    ytp.YTAPIReady = true;
    jQuery(document).trigger("YTAPIReady");
}

(function (jQuery, ytp) {

    ytp.isDevice = 'ontouchstart' in window;

    /*Browser detection patch*/
    if (!jQuery.browser) {
        jQuery.browser = {};
        jQuery.browser.mozilla = !1;
        jQuery.browser.webkit = !1;
        jQuery.browser.opera = !1;
        jQuery.browser.msie = !1;
        var nAgt = navigator.userAgent;
        jQuery.browser.ua = nAgt;
        jQuery.browser.name = navigator.appName;
        jQuery.browser.fullVersion = "" + parseFloat(navigator.appVersion);
        jQuery.browser.majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;
        if (-1 != (verOffset = nAgt.indexOf("Opera"))) jQuery.browser.opera = !0, jQuery.browser.name = "Opera", jQuery.browser.fullVersion = nAgt.substring(verOffset + 6), -1 != (verOffset = nAgt.indexOf("Version")) && (jQuery.browser.fullVersion = nAgt.substring(verOffset + 8)); else if (-1 != (verOffset = nAgt.indexOf("MSIE"))) jQuery.browser.msie = !0, jQuery.browser.name = "Microsoft Internet Explorer", jQuery.browser.fullVersion = nAgt.substring(verOffset + 5); else if (-1 != nAgt.indexOf("Trident")) {
            jQuery.browser.msie = !0;
            jQuery.browser.name = "Microsoft Internet Explorer";
            var start = nAgt.indexOf("rv:") + 3, end = start + 4;
            jQuery.browser.fullVersion = nAgt.substring(start, end)
        } else -1 != (verOffset = nAgt.indexOf("Chrome")) ? (jQuery.browser.webkit = !0, jQuery.browser.name = "Chrome", jQuery.browser.fullVersion = nAgt.substring(verOffset + 7)) : -1 != (verOffset = nAgt.indexOf("Safari")) ? (jQuery.browser.webkit = !0, jQuery.browser.name = "Safari", jQuery.browser.fullVersion = nAgt.substring(verOffset + 7), -1 != (verOffset = nAgt.indexOf("Version")) && (jQuery.browser.fullVersion = nAgt.substring(verOffset + 8))) : -1 != (verOffset = nAgt.indexOf("AppleWebkit")) ? (jQuery.browser.webkit = !0, jQuery.browser.name = "Safari", jQuery.browser.fullVersion = nAgt.substring(verOffset + 7), -1 != (verOffset = nAgt.indexOf("Version")) && (jQuery.browser.fullVersion = nAgt.substring(verOffset + 8))) : -1 != (verOffset = nAgt.indexOf("Firefox")) ? (jQuery.browser.mozilla = !0, jQuery.browser.name = "Firefox", jQuery.browser.fullVersion = nAgt.substring(verOffset + 8)) : (nameOffset = nAgt.lastIndexOf(" ") + 1) < (verOffset = nAgt.lastIndexOf("/")) && (jQuery.browser.name = nAgt.substring(nameOffset, verOffset), jQuery.browser.fullVersion = nAgt.substring(verOffset + 1), jQuery.browser.name.toLowerCase() == jQuery.browser.name.toUpperCase() && (jQuery.browser.name = navigator.appName));
        -1 != (ix = jQuery.browser.fullVersion.indexOf(";")) && (jQuery.browser.fullVersion = jQuery.browser.fullVersion.substring(0, ix));
        -1 != (ix = jQuery.browser.fullVersion.indexOf(" ")) && (jQuery.browser.fullVersion = jQuery.browser.fullVersion.substring(0, ix));
        jQuery.browser.majorVersion = parseInt("" + jQuery.browser.fullVersion, 10);
        isNaN(jQuery.browser.majorVersion) && (jQuery.browser.fullVersion = "" + parseFloat(navigator.appVersion), jQuery.browser.majorVersion = parseInt(navigator.appVersion, 10));
        jQuery.browser.version = jQuery.browser.majorVersion
    }

    /*******************************************************************************
    * jQuery.mb.components: jquery.mb.CSSAnimate
    ******************************************************************************/

    jQuery.fn.CSSAnimate = function (a, b, k, l, f) { return this.each(function () { var c = jQuery(this); if (0 !== c.length && a) { "function" == typeof b && (f = b, b = jQuery.fx.speeds._default); "function" == typeof k && (f = k, k = 0); "function" == typeof l && (f = l, l = "cubic-bezier(0.65,0.03,0.36,0.72)"); if ("string" == typeof b) for (var j in jQuery.fx.speeds) if (b == j) { b = jQuery.fx.speeds[j]; break } else b = null; if (jQuery.support.transition) { var e = "", h = "transitionEnd"; jQuery.browser.webkit ? (e = "-webkit-", h = "webkitTransitionEnd") : jQuery.browser.mozilla ? (e = "-moz-", h = "transitionend") : jQuery.browser.opera ? (e = "-o-", h = "otransitionend") : jQuery.browser.msie && (e = "-ms-", h = "msTransitionEnd"); j = []; for (d in a) { var g = d; "transform" === g && (g = e + "transform", a[g] = a[d], delete a[d]); "transform-origin" === g && (g = e + "transform-origin", a[g] = a[d], delete a[d]); j.push(g); c.css(g) || c.css(g, 0) } d = j.join(","); c.css(e + "transition-property", d); c.css(e + "transition-duration", b + "ms"); c.css(e + "transition-delay", k + "ms"); c.css(e + "transition-timing-function", l); c.css(e + "backface-visibility", "hidden"); setTimeout(function () { c.css(a) }, 0); setTimeout(function () { c.called || !f ? c.called = !1 : f() }, b + 20); c.on(h, function (a) { c.off(h); c.css(e + "transition", ""); a.stopPropagation(); "function" == typeof f && (c.called = !0, f()); return !1 }) } else { for (var d in a) "transform" === d && delete a[d], "transform-origin" === d && delete a[d], "auto" === a[d] && delete a[d]; if (!f || "string" === typeof f) f = "linear"; c.animate(a, b, f) } } }) }; jQuery.fn.CSSAnimateStop = function () { var a = "", b = "transitionEnd"; jQuery.browser.webkit ? (a = "-webkit-", b = "webkitTransitionEnd") : jQuery.browser.mozilla ? (a = "-moz-", b = "transitionend") : jQuery.browser.opera ? (a = "-o-", b = "otransitionend") : jQuery.browser.msie && (a = "-ms-", b = "msTransitionEnd"); jQuery(this).css(a + "transition", ""); jQuery(this).off(b) }; jQuery.support.transition = function () { var a = (document.body || document.documentElement).style; return void 0 !== a.transition || void 0 !== a.WebkitTransition || void 0 !== a.MozTransition || void 0 !== a.MsTransition || void 0 !== a.OTransition }();

    /*
    * Metadata - jQuery plugin for parsing metadata from elements
    * Copyright (c) 2006 John Resig, Yehuda Katz, Jörn Zaefferer, Paul McLanahan
    * Dual licensed under the MIT and GPL licenses:
    *   http://www.opensource.org/licenses/mit-license.php
    *   http://www.gnu.org/licenses/gpl.html
    */

    (function (c) { c.extend({ metadata: { defaults: { type: "class", name: "metadata", cre: /({.*})/, single: "metadata" }, setType: function (b, c) { this.defaults.type = b; this.defaults.name = c }, get: function (b, f) { var d = c.extend({}, this.defaults, f); d.single.length || (d.single = "metadata"); var a = c.data(b, d.single); if (a) return a; a = "{}"; if ("class" == d.type) { var e = d.cre.exec(b.className); e && (a = e[1]) } else if ("elem" == d.type) { if (!b.getElementsByTagName) return; e = b.getElementsByTagName(d.name); e.length && (a = c.trim(e[0].innerHTML)) } else void 0 != b.getAttribute && (e = b.getAttribute(d.name)) && (a = e); 0 > a.indexOf("{") && (a = "{" + a + "}"); a = eval("(" + a + ")"); c.data(b, d.single, a); return a } } }); c.fn.metadata = function (b) { return c.metadata.get(this[0], b) } })(jQuery);


    var getYTPVideoID = function (url) {
        var movieURL;
        if (url.substr(0, 16) == "http://youtu.be/") {
            movieURL = url.replace("http://youtu.be/", "");
        } else if (url.indexOf("http") > -1) {
            movieURL = url.match(/[\\?&]v=([^&#]*)/)[1];
        } else {
            movieURL = url
        }
        return movieURL;
    };


    jQuery.mbYTPlayer = {
        name: "jquery.mb.YTPlayer",
        version: "2.6.0",
        author: "Matteo Bicocchi",
        defaults: {
            containment: "body",
            ratio: "16/9",
            showYTLogo: false,
            videoURL: null,
            startAt: 0,
            stopAt: 0,
            autoPlay: true,
            vol: 100,
            addRaster: false,
            opacity: 1,
            quality: "default", //or “small”, “medium”, “large”, “hd720”, “hd1080”, “highres”
            mute: false,
            loop: true,
            showControls: true,
            showAnnotations: false,
            printUrl: true,
            stopMovieOnClick: false,
            realfullscreen: true,
            onReady: function (player) { },
            onStateChange: function (player) { },
            onPlaybackQualityChange: function (player) { },
            onError: function (player) { }
        },
        controls: {
            play: "P",
            pause: "p",
            mute: "M",
            unmute: "A",
            onlyYT: "O",
            showSite: "R",
            ytLogo: "Y"
        },
        rasterImg: "images/raster.png",
        rasterImgRetina: "images/raster@2x.png",

        locationProtocol: location.protocol != "file:" ? location.protocol : "http:",

        buildPlayer: function (options) {

            return this.each(function () {
                var YTPlayer = this;
                var $YTPlayer = jQuery(YTPlayer);

                YTPlayer.loop = 0;
                YTPlayer.opt = {};
                var property = {};

                $YTPlayer.addClass("mb_YTVPlayer");

                if (jQuery.metadata) {
                    jQuery.metadata.setType("class");
                    property = $YTPlayer.metadata();
                }

                if (jQuery.isEmptyObject(property))
                    property = $YTPlayer.data("property") && typeof $YTPlayer.data("property") == "string" ? eval('(' + $YTPlayer.data("property") + ')') : $YTPlayer.data("property");

                jQuery.extend(YTPlayer.opt, jQuery.mbYTPlayer.defaults, options, property);

                var canGoFullscreen = !(jQuery.browser.msie || jQuery.browser.opera || self.location.href != top.location.href);

                if (!canGoFullscreen)
                    YTPlayer.opt.realfullscreen = false;

                if (!$YTPlayer.attr("id"))
                    $YTPlayer.attr("id", "id_" + new Date().getTime());

                YTPlayer.opt.id = YTPlayer.id;
                YTPlayer.isAlone = false;

                /*to maintain back compatibility
                * ***********************************************************/
                if (YTPlayer.opt.isBgndMovie)
                    YTPlayer.opt.containment = "body";

                if (YTPlayer.opt.isBgndMovie && YTPlayer.opt.isBgndMovie.mute != undefined)
                    YTPlayer.opt.mute = YTPlayer.opt.isBgndMovie.mute;

                if (!YTPlayer.opt.videoURL)
                    YTPlayer.opt.videoURL = $YTPlayer.attr("href");

                /************************************************************/

                var playerID = "mbYTP_" + YTPlayer.id;
                var videoID = this.opt.videoURL ? getYTPVideoID(this.opt.videoURL) : $YTPlayer.attr("href") ? getYTPVideoID($YTPlayer.attr("href")) : false;
                YTPlayer.videoID = videoID;


                YTPlayer.opt.showAnnotations = (YTPlayer.opt.showAnnotations) ? '0' : '3';
                var playerVars = { 'autoplay': 0, 'modestbranding': 1, 'controls': 0, 'showinfo': 0, 'rel': 0, 'enablejsapi': 1, 'version': 3, 'playerapiid': playerID, 'origin': '*', 'allowfullscreen': true, 'wmode': "transparent", 'iv_load_policy': YTPlayer.opt.showAnnotations };

                var canPlayHTML5 = false;
                var v = document.createElement('video');
                if (v.canPlayType) { // && !jQuery.browser.msie
                    canPlayHTML5 = true;
                }

                if (canPlayHTML5) //  && !(YTPlayer.isPlayList && jQuery.browser.msie)
                    jQuery.extend(playerVars, { 'html5': 1 });

                if (jQuery.browser.msie && jQuery.browser.version < 9) {
                    this.opt.opacity = 1;
                }

                var playerBox = jQuery("<div/>").attr("id", playerID).addClass("playerBox");
                var overlay = jQuery("<div/>").css({ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }).addClass("YTPOverlay"); //YTPlayer.isBackground ? "fixed" :

                YTPlayer.opt.containment = YTPlayer.opt.containment == "self" ? jQuery(this) : jQuery(YTPlayer.opt.containment);

                YTPlayer.isBackground = YTPlayer.opt.containment.get(0).tagName.toLowerCase() == "body";

                if (ytp.isDevice && YTPlayer.isBackground) {
                    $YTPlayer.hide();
                    return;
                }

                if (YTPlayer.opt.addRaster) {
                    var retina = (window.retina || window.devicePixelRatio > 1);
                    overlay.addClass(retina ? "raster retina" : "raster");
                } else {
                    overlay.removeClass("raster retina");
                }

                var wrapper = jQuery("<div/>").addClass("mbYTP_wrapper").attr("id", "wrapper_" + playerID);
                wrapper.css({ position: "absolute", zIndex: 0, minWidth: "100%", minHeight: "100%", left: 0, top: 0, overflow: "hidden", opacity: 0 });
                playerBox.css({ position: "absolute", zIndex: 0, width: "100%", height: "100%", top: 0, left: 0, overflow: "hidden", opacity: this.opt.opacity });
                wrapper.append(playerBox);

                if (YTPlayer.isBackground && ytp.isInit)
                    return;

                YTPlayer.opt.containment.children().each(function () {
                    if (jQuery(this).css("position") == "static")
                        jQuery(this).css("position", "relative");
                });

                if (YTPlayer.isBackground) {
                    jQuery("body").css({ position: "relative", minWidth: "100%", minHeight: "100%", zIndex: 1, boxSizing: "border-box" });
                    wrapper.css({ position: "fixed", top: 0, left: 0, zIndex: 0 });
                    $YTPlayer.hide();
                    YTPlayer.opt.containment.prepend(wrapper);
                } else
                    YTPlayer.opt.containment.prepend(wrapper);

                YTPlayer.wrapper = wrapper;

                playerBox.css({ opacity: 1 });

                if (!ytp.isDevice) {
                    playerBox.after(overlay);
                    YTPlayer.overlay = overlay;
                }


                if (!YTPlayer.isBackground) {
                    overlay.on("mouseenter", function () {
                        $YTPlayer.find(".mb_YTVPBar").addClass("visible");
                    }).on("mouseleave", function () {
                        $YTPlayer.find(".mb_YTVPBar").removeClass("visible");
                    })
                }

                // add YT API to the header
                //jQuery("#YTAPI").remove();

                if (!ytp.YTAPIReady) {
                    jQuery("#YTAPI").remove();
                    var tag = jQuery("<script></script>").attr({ "src": jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/player_api?v=" + jQuery.mbYTPlayer.version, "id": "YTAPI" });
                    jQuery("head title").after(tag);

                    /*
                    var tag = document.createElement('script');
                    tag.src = jQuery.mbYTPlayer.locationProtocol+"//www.youtube.com/player_api";
                    tag.id = "YTAPI";
                    var firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    */

                } else {
                    setTimeout(function () {
                        jQuery(document).trigger("YTAPIReady");
                    }, 100)
                }

                jQuery(document).on("YTAPIReady", function () {

                    if ((YTPlayer.isBackground && ytp.isInit) || YTPlayer.opt.isInit)
                        return;

                    if (YTPlayer.isBackground && YTPlayer.opt.stopMovieOnClick)
                        jQuery(document).off("mousedown.ytplayer").on("mousedown,.ytplayer", function (e) {
                            var target = jQuery(e.target);
                            if (target.is("a") || target.parents().is("a")) {
                                $YTPlayer.pauseYTP();
                            }
                        });

                    if (YTPlayer.isBackground)
                        ytp.isInit = true;

                    YTPlayer.opt.isInit = true;

                    YTPlayer.opt.vol = YTPlayer.opt.vol ? YTPlayer.opt.vol : 100;

                    jQuery.mbYTPlayer.getDataFromFeed(YTPlayer.videoID, YTPlayer);

                    jQuery(YTPlayer).on("getVideoInfo_" + YTPlayer.opt.id, function () {

                        if (ytp.isDevice && !YTPlayer.isBackground) {
                            new YT.Player(playerID, {
                                height: '100%',
                                width: '100%',
                                videoId: YTPlayer.videoID,
                                events: {
                                    'onReady': function () {
                                        playerBox.css({ opacity: 1 });
                                        YTPlayer.wrapper.css({ opacity: 1 });
                                        $YTPlayer.optimizeDisplay();
                                    },
                                    'onStateChange': function () { }
                                }
                            });
                            return;
                        }

                        new YT.Player(playerID, {
                            videoId: YTPlayer.videoID.toString(),
                            playerVars: playerVars,
                            events: {
                                'onReady': function (event) {

                                    YTPlayer.player = event.target;

                                    if (YTPlayer.isReady)
                                        return;

                                    YTPlayer.isReady = true;

                                    YTPlayer.playerEl = YTPlayer.player.getIframe();
                                    $YTPlayer.optimizeDisplay();

                                    YTPlayer.videoID = videoID;

                                    jQuery(window).on("resize.YTP", function () {
                                        $YTPlayer.optimizeDisplay();
                                    });

                                    if (YTPlayer.opt.showControls)
                                        jQuery(YTPlayer).buildYTPControls();

                                    YTPlayer.player.setPlaybackQuality(YTPlayer.opt.quality);

                                    if (YTPlayer.opt.startAt > 0)
                                        YTPlayer.player.seekTo(parseFloat(YTPlayer.opt.startAt), true);

                                    YTPlayer.player.setVolume(YTPlayer.opt.vol);

                                    if (!YTPlayer.opt.autoPlay) {
                                        YTPlayer.player.pauseVideo();
                                        YTPlayer.checkForStartAt = setInterval(function () {
                                            if (YTPlayer.player.getCurrentTime() >= YTPlayer.opt.startAt) {
                                                clearInterval(YTPlayer.checkForStartAt);

                                                if (YTPlayer.opt.mute) {
                                                    jQuery(YTPlayer).muteYTPVolume();
                                                } else {
                                                    jQuery(YTPlayer).unmuteYTPVolume();
                                                }
                                            }
                                        }, 1);

                                    } else {
                                        $YTPlayer.playYTP();

                                        if (YTPlayer.opt.mute) {
                                            jQuery(YTPlayer).muteYTPVolume();
                                        } else {
                                            jQuery(YTPlayer).unmuteYTPVolume();
                                        }
                                    }

                                    if (typeof YTPlayer.opt.onReady == "function")
                                        YTPlayer.opt.onReady($YTPlayer);

                                    clearInterval(YTPlayer.getState);
                                    jQuery.mbYTPlayer.checkForState(YTPlayer);

                                },

                                'onStateChange': function (event) {

                                    /*
                                    -1 (unstarted)
                                    0 (ended)
                                    1 (playing)
                                    2 (paused)
                                    3 (buffering)
                                    5 (video cued).
                                    */

                                    if (typeof event.target.getPlayerState != "function")
                                        return;
                                    var state = event.target.getPlayerState();

                                    if (typeof YTPlayer.opt.onStateChange == "function")
                                        YTPlayer.opt.onStateChange($YTPlayer, state);

                                    var controls = jQuery("#controlBar_" + YTPlayer.id);

                                    var data = YTPlayer.opt;

                                    if (state == 0) { // end
                                        if (YTPlayer.state == state)
                                            return;

                                        YTPlayer.state = state;
                                        YTPlayer.player.pauseVideo();
                                        var startAt = YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 1;

                                        if (data.loop) {
                                            YTPlayer.wrapper.css({ opacity: 0 });
                                            $YTPlayer.playYTP();
                                            YTPlayer.player.seekTo(startAt, true);

                                        } else if (!YTPlayer.isBackground) {
                                            YTPlayer.player.seekTo(startAt, true);
                                            $YTPlayer.playYTP();
                                            setTimeout(function () {
                                                $YTPlayer.pauseYTP();
                                            }, 10);
                                        }

                                        if (!data.loop && YTPlayer.isBackground)
                                            YTPlayer.wrapper.CSSAnimate({ opacity: 0 }, 2000);
                                        else if (data.loop) {
                                            YTPlayer.wrapper.css({ opacity: 0 });
                                            YTPlayer.loop++;
                                        }

                                        controls.find(".mb_YTVPPlaypause").html(jQuery.mbYTPlayer.controls.play);
                                        jQuery(YTPlayer).trigger("YTPEnd");
                                    }

                                    if (state == 3) { // buffering
                                        if (YTPlayer.state == state)
                                            return;
                                        YTPlayer.state = state;
                                        YTPlayer.player.setPlaybackQuality(YTPlayer.opt.quality);
                                        controls.find(".mb_YTVPPlaypause").html(jQuery.mbYTPlayer.controls.play);
                                        jQuery(YTPlayer).trigger("YTPBuffering");
                                    }

                                    if (state == -1) { // unstarted
                                        if (YTPlayer.state == state)
                                            return;
                                        YTPlayer.state = state;

                                        YTPlayer.wrapper.css({ opacity: 0 });

                                        jQuery(YTPlayer).trigger("YTPUnstarted");
                                    }

                                    if (state == 1) { // play
                                        if (YTPlayer.state == state)
                                            return;
                                        YTPlayer.state = state;
                                        YTPlayer.player.setPlaybackQuality(YTPlayer.opt.quality);

                                        if (YTPlayer.opt.mute) {
                                            $YTPlayer.muteYTPVolume();
                                            YTPlayer.opt.mute = false;
                                        }

                                        if (YTPlayer.opt.autoPlay && YTPlayer.loop == 0) {
                                            YTPlayer.wrapper.CSSAnimate({ opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity }, 2000);
                                        } else if (!YTPlayer.isBackground) {
                                            YTPlayer.wrapper.css({ opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity });
                                            $YTPlayer.css({ background: "rgba(0,0,0,0.5)" });
                                        } else {
                                            setTimeout(function () {
                                                jQuery(YTPlayer.playerEl).CSSAnimate({ opacity: 1 }, 2000);
                                                YTPlayer.wrapper.CSSAnimate({ opacity: YTPlayer.opt.opacity }, 2000);
                                            }, 1000);
                                        }

                                        controls.find(".mb_YTVPPlaypause").html(jQuery.mbYTPlayer.controls.pause);

                                        jQuery(YTPlayer).trigger("YTPStart");

                                        if (typeof _gaq != "undefined")
                                            _gaq.push(['_trackEvent', 'YTPlayer', 'Play', (YTPlayer.title || YTPlayer.videoID.toString())]);

                                    }

                                    if (state == 2) { // pause
                                        if (YTPlayer.state == state)
                                            return;
                                        YTPlayer.state = state;
                                        controls.find(".mb_YTVPPlaypause").html(jQuery.mbYTPlayer.controls.play);
                                        jQuery(YTPlayer).trigger("YTPPause");
                                    }
                                },
                                'onPlaybackQualityChange': function (e) {
                                    if (typeof YTPlayer.opt.onPlaybackQualityChange == "function")
                                        YTPlayer.opt.onPlaybackQualityChange($YTPlayer);
                                },
                                'onError': function (err) {

                                    if (err.data == 2 && YTPlayer.isPlayList)
                                        jQuery(YTPlayer).playNext();

                                    if (typeof YTPlayer.opt.onError == "function")
                                        YTPlayer.opt.onError($YTPlayer, err);
                                }
                            }
                        });
                    });
                })
            });
        },

        getDataFromFeed: function (videoID, YTPlayer) {
            //Get video info from FEEDS API

            YTPlayer.videoID = videoID;
            if (!jQuery.browser.msie) { //!(jQuery.browser.msie && jQuery.browser.version<9)

                jQuery.getJSON(jQuery.mbYTPlayer.locationProtocol + '//gdata.youtube.com/feeds/api/videos/' + videoID + '?v=2&alt=jsonc', function (data, status, xhr) {

                    YTPlayer.dataReceived = true;

                    var videoData = data.data;

                    YTPlayer.title = videoData.title;
                    YTPlayer.videoData = videoData;

                    if (YTPlayer.opt.ratio == "auto")
                        if (videoData.aspectRatio && videoData.aspectRatio === "widescreen")
                            YTPlayer.opt.ratio = "16/9";
                        else
                            YTPlayer.opt.ratio = "4/3";

                    if (!YTPlayer.hasData) {
                        YTPlayer.hasData = true;

                        if (!YTPlayer.isBackground) {
                            var bgndURL = YTPlayer.videoData.thumbnail.hqDefault;
                            jQuery(YTPlayer).css({ background: "rgba(0,0,0,0.5) url(" + bgndURL + ") center center", backgroundSize: "cover" });
                        }
                        jQuery(YTPlayer).trigger("getVideoInfo_" + YTPlayer.opt.id);
                    }
                    jQuery(YTPlayer).trigger("YTPChanged");
                });

                setTimeout(function () {
                    if (!YTPlayer.dataReceived && !YTPlayer.hasData) {
                        YTPlayer.hasData = true;
                        jQuery(YTPlayer).trigger("getVideoInfo_" + YTPlayer.opt.id);
                    }
                    jQuery(YTPlayer).trigger("YTPChanged");
                }, 1500)

            } else {
                YTPlayer.opt.ratio == "auto" ? YTPlayer.opt.ratio = "16/9" : YTPlayer.opt.ratio;

                if (!YTPlayer.hasData) {
                    YTPlayer.hasData = true;
                    setTimeout(function () {
                        jQuery(YTPlayer).trigger("getVideoInfo_" + YTPlayer.opt.id);
                    }, 100)
                }
                jQuery(YTPlayer).trigger("YTPChanged");
            }
        },

        getVideoID: function () {
            var YTPlayer = this.get(0);
            return YTPlayer.videoID || false;
        },

        setVideoQuality: function (quality) {
            var YTPlayer = this.get(0);
            YTPlayer.player.setPlaybackQuality(quality);
        },

        YTPlaylist: function (videos, shuffle, callback) {
            var YTPlayer = this.get(0);

            YTPlayer.isPlayList = true;

            if (shuffle)
                videos = jQuery.shuffle(videos);

            if (!YTPlayer.videoID) {
                YTPlayer.videos = videos;
                YTPlayer.videoCounter = 0;
                YTPlayer.videoLength = videos.length;

                jQuery(YTPlayer).data("property", videos[0]);
                jQuery(YTPlayer).mb_YTPlayer();
            }

            if (typeof callback == "function")
                jQuery(YTPlayer).on("YTPChanged", function () {
                    callback(YTPlayer);
                });

            jQuery(YTPlayer).on("YTPEnd", function () {
                jQuery(YTPlayer).playNext();
            });
        },

        playNext: function () {
            var YTPlayer = this.get(0);
            YTPlayer.videoCounter++;
            if (YTPlayer.videoCounter >= YTPlayer.videoLength)
                YTPlayer.videoCounter = 0;
            jQuery(YTPlayer.playerEl).css({ opacity: 0 });
            jQuery(YTPlayer).changeMovie(YTPlayer.videos[YTPlayer.videoCounter]);
        },

        playPrev: function () {
            var YTPlayer = this.get(0);
            YTPlayer.videoCounter--;
            if (YTPlayer.videoCounter < 0)
                YTPlayer.videoCounter = YTPlayer.videoLength - 1;
            jQuery(YTPlayer.playerEl).css({ opacity: 0 });
            jQuery(YTPlayer).changeMovie(YTPlayer.videos[YTPlayer.videoCounter]);
        },

        changeMovie: function (opt) {
            var YTPlayer = this.get(0);

            var data = YTPlayer.opt;

            YTPlayer.opt.startAt = 0;
            YTPlayer.opt.stopAt = 0;

            if (opt) {
                jQuery.extend(data, opt);
            }

            YTPlayer.videoID = getYTPVideoID(data.videoURL);

            jQuery(YTPlayer).pauseYTP();
            var timer = jQuery.browser.msie ? 1000 : 0;
            jQuery(YTPlayer.playerEl).CSSAnimate({ opacity: 0 }, timer);

            setTimeout(function () {
                jQuery(YTPlayer).getPlayer().cueVideoByUrl(encodeURI(jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/v/" + YTPlayer.videoID), YTPlayer.opt.startAt, YTPlayer.opt.quality);
                jQuery(YTPlayer).playYTP();
                jQuery(YTPlayer).one("YTPStart", function () {
                    jQuery(YTPlayer.playerEl).CSSAnimate({ opacity: 1 }, timer);
                });
            }, timer)

            if (YTPlayer.opt.mute) {
                jQuery(YTPlayer).muteYTPVolume();
            } else {
                jQuery(YTPlayer).unmuteYTPVolume();
            }

            if (YTPlayer.opt.addRaster) {
                var retina = (window.retina || window.devicePixelRatio > 1);
                YTPlayer.overlay.addClass(retina ? "raster retina" : "raster");
            } else {
                YTPlayer.overlay.removeClass("raster");
                YTPlayer.overlay.removeClass("retina");
            }

            jQuery("#controlBar_" + YTPlayer.id).remove();

            if (YTPlayer.opt.showControls)
                jQuery(YTPlayer).buildYTPControls();

            jQuery.mbYTPlayer.getDataFromFeed(YTPlayer.videoID, YTPlayer);
            jQuery(YTPlayer).optimizeDisplay();
            clearInterval(YTPlayer.getState);
            jQuery.mbYTPlayer.checkForState(YTPlayer);

        },

        getPlayer: function () {
            return jQuery(this).get(0).player;
        },

        playerDestroy: function () {
            var YTPlayer = this.get(0);
            ytp.YTAPIReady = false;
            ytp.isInit = false;
            YTPlayer.opt.isInit = false;
            YTPlayer.videoID = null;

            var playerBox = YTPlayer.wrapper;
            playerBox.remove();
            jQuery("#controlBar_" + YTPlayer.id).remove();
        },

        fullscreen: function (real) {

            var YTPlayer = this.get(0);

            var controls = jQuery("#controlBar_" + YTPlayer.id);
            var fullScreenBtn = controls.find(".mb_OnlyYT");
            var videoWrapper = YTPlayer.isBackground ? jQuery(YTPlayer.wrapper) : jQuery(YTPlayer);


            if (real) {
                var fullscreenchange = jQuery.browser.mozilla ? "mozfullscreenchange" : jQuery.browser.webkit ? "webkitfullscreenchange" : "fullscreenchange";
                jQuery(document).off(fullscreenchange).on(fullscreenchange, function () {
                    var isFullScreen = RunPrefixMethod(document, "IsFullScreen") || RunPrefixMethod(document, "FullScreen");

                    if (!isFullScreen) {
                        YTPlayer.isAlone = false;
                        fullScreenBtn.html(jQuery.mbYTPlayer.controls.onlyYT)
                        jQuery(YTPlayer).setVideoQuality(YTPlayer.opt.quality);
                        jQuery(YTPlayer).removeClass("fullscreen");

                        if (YTPlayer.isBackground) {
                            jQuery("body").after(controls);
                        } else {
                            YTPlayer.wrapper.before(controls);
                        }
                        jQuery(window).resize();


                    } else {

                        jQuery(YTPlayer).setVideoQuality("default");
                    }
                });
            }

            if (!YTPlayer.isAlone) {

                if (YTPlayer.player.getPlayerState() != 1 && YTPlayer.player.getPlayerState() != 2)
                    jQuery(YTPlayer).playYTP();

                if (real) {
                    YTPlayer.wrapper.append(controls);

                    launchFullscreen(videoWrapper.get(0));
                    jQuery(YTPlayer).addClass("fullscreen");

                } else
                    videoWrapper.css({ zIndex: 10000 }).CSSAnimate({ opacity: 1 }, 1000, 0);


                jQuery(YTPlayer).trigger("YTPFullScreenStart");

                fullScreenBtn.html(jQuery.mbYTPlayer.controls.showSite)
                YTPlayer.isAlone = true;

            } else {

                if (real) {
                    cancelFullscreen();
                } else {
                    videoWrapper.CSSAnimate({ opacity: YTPlayer.opt.opacity }, 500);
                    videoWrapper.css({ zIndex: 0 });
                }

                jQuery(YTPlayer).trigger("YTPFullScreenEnd");

                fullScreenBtn.html(jQuery.mbYTPlayer.controls.onlyYT)
                YTPlayer.isAlone = false;
            }

            function RunPrefixMethod(obj, method) {
                var pfx = ["webkit", "moz", "ms", "o", ""];
                var p = 0, m, t;
                while (p < pfx.length && !obj[m]) {
                    m = method;
                    if (pfx[p] == "") {
                        m = m.substr(0, 1).toLowerCase() + m.substr(1);
                    }
                    m = pfx[p] + m;
                    t = typeof obj[m];
                    if (t != "undefined") {
                        pfx = [pfx[p]];
                        return (t == "function" ? obj[m]() : obj[m]);
                    }
                    p++;
                }
            }

            function launchFullscreen(element) {
                RunPrefixMethod(element, "RequestFullScreen");
            }

            function cancelFullscreen() {
                if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
                    RunPrefixMethod(document, "CancelFullScreen");
                }
            }
        },

        playYTP: function () {
            var YTPlayer = this.get(0);

            if (typeof YTPlayer.player === "undefined")
                return;

            var controls = jQuery("#controlBar_" + YTPlayer.id);
            var playBtn = controls.find(".mb_YTVPPlaypause");
            playBtn.html(jQuery.mbYTPlayer.controls.pause);
            YTPlayer.player.playVideo();

            YTPlayer.wrapper.CSSAnimate({ opacity: YTPlayer.opt.opacity }, 2000);
            jQuery(YTPlayer).on("YTPStart", function () {
                jQuery(YTPlayer).css("background", "none");
            })
        },

        toggleLoops: function () {
            var YTPlayer = this.get(0);
            var data = YTPlayer.opt;
            if (data.loop == 1) {
                data.loop = 0;
            } else {
                if (data.startAt) {
                    YTPlayer.player.seekTo(data.startAt);
                } else {
                    YTPlayer.player.playVideo();
                }
                data.loop = 1;
            }
        },

        stopYTP: function () {
            var YTPlayer = this.get(0);
            var controls = jQuery("#controlBar_" + YTPlayer.id);
            var playBtn = controls.find(".mb_YTVPPlaypause");
            playBtn.html(jQuery.mbYTPlayer.controls.play);
            YTPlayer.player.stopVideo();
        },

        pauseYTP: function () {
            var YTPlayer = this.get(0);
            var data = YTPlayer.opt;
            var controls = jQuery("#controlBar_" + YTPlayer.id);
            var playBtn = controls.find(".mb_YTVPPlaypause");
            playBtn.html(jQuery.mbYTPlayer.controls.play);
            YTPlayer.player.pauseVideo();
        },

        seekToYTP: function (val) {
            var YTPlayer = this.get(0);
            YTPlayer.player.seekTo(val, true);
        },

        setYTPVolume: function (val) {
            var YTPlayer = this.get(0);
            if (!val && !YTPlayer.opt.vol && player.getVolume() == 0)
                jQuery(YTPlayer).unmuteYTPVolume();
            else if ((!val && YTPlayer.player.getVolume() > 0) || (val && YTPlayer.player.getVolume() == val))
                jQuery(YTPlayer).muteYTPVolume();
            else
                YTPlayer.opt.vol = val;
            YTPlayer.player.setVolume(YTPlayer.opt.vol);
        },

        muteYTPVolume: function () {
            var YTPlayer = this.get(0);
            YTPlayer.opt.vol = YTPlayer.player.getVolume() || 50;
            YTPlayer.player.mute();
            YTPlayer.player.setVolume(0);
            var controls = jQuery("#controlBar_" + YTPlayer.id);
            var muteBtn = controls.find(".mb_YTVPMuteUnmute");
            muteBtn.html(jQuery.mbYTPlayer.controls.unmute);
        },

        unmuteYTPVolume: function () {
            var YTPlayer = this.get(0);

            YTPlayer.player.unMute();
            YTPlayer.player.setVolume(YTPlayer.opt.vol);

            var controls = jQuery("#controlBar_" + YTPlayer.id);
            var muteBtn = controls.find(".mb_YTVPMuteUnmute");
            muteBtn.html(jQuery.mbYTPlayer.controls.mute);
        },

        manageYTPProgress: function () {
            var YTPlayer = this.get(0);
            var controls = jQuery("#controlBar_" + YTPlayer.id);
            var progressBar = controls.find(".mb_YTVPProgress");
            var loadedBar = controls.find(".mb_YTVPLoaded");
            var timeBar = controls.find(".mb_YTVTime");
            var totW = progressBar.outerWidth();

            var currentTime = Math.floor(YTPlayer.player.getCurrentTime());
            var totalTime = Math.floor(YTPlayer.player.getDuration());
            var timeW = (currentTime * totW) / totalTime;
            var startLeft = 0;

            var loadedW = YTPlayer.player.getVideoLoadedFraction() * 100;

            loadedBar.css({ left: startLeft, width: loadedW + "%" });
            timeBar.css({ left: 0, width: timeW });
            return { totalTime: totalTime, currentTime: currentTime };
        },

        buildYTPControls: function () {
            var YTPlayer = this.get(0);
            var data = YTPlayer.opt;

            if (jQuery("#controlBar_" + YTPlayer.id).length)
                return;

            var controlBar = jQuery("<span/>").attr("id", "controlBar_" + YTPlayer.id).addClass("mb_YTVPBar").css({ whiteSpace: "noWrap", position: YTPlayer.isBackground ? "fixed" : "absolute", zIndex: YTPlayer.isBackground ? 10000 : 1000 }).hide();
            var buttonBar = jQuery("<div/>").addClass("buttonBar");
            var playpause = jQuery("<span>" + jQuery.mbYTPlayer.controls.play + "</span>").addClass("mb_YTVPPlaypause ytpicon").click(function () {
                if (YTPlayer.player.getPlayerState() == 1)
                    jQuery(YTPlayer).pauseYTP();
                else
                    jQuery(YTPlayer).playYTP();
            });

            var MuteUnmute = jQuery("<span>" + jQuery.mbYTPlayer.controls.mute + "</span>").addClass("mb_YTVPMuteUnmute ytpicon").click(function () {
                if (YTPlayer.player.getVolume() == 0) {
                    jQuery(YTPlayer).unmuteYTPVolume();
                } else {
                    jQuery(YTPlayer).muteYTPVolume();
                }
            });

            var idx = jQuery("<span/>").addClass("mb_YTVPTime");

            var vURL = data.videoURL;
            if (vURL.indexOf("http") < 0)
                vURL = jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/watch?v=" + data.videoURL;
            var movieUrl = jQuery("<span/>").html(jQuery.mbYTPlayer.controls.ytLogo).addClass("mb_YTVPUrl ytpicon").attr("title", "view on YouTube").on("click", function () { window.open(vURL, "viewOnYT") });
            var onlyVideo = jQuery("<span/>").html(jQuery.mbYTPlayer.controls.onlyYT).addClass("mb_OnlyYT ytpicon").on("click", function () { jQuery(YTPlayer).fullscreen(data.realfullscreen); });

            var progressBar = jQuery("<div/>").addClass("mb_YTVPProgress").css("position", "absolute").click(function (e) {
                timeBar.css({ width: (e.clientX - timeBar.offset().left) });
                YTPlayer.timeW = e.clientX - timeBar.offset().left;
                controlBar.find(".mb_YTVPLoaded").css({ width: 0 });
                var totalTime = Math.floor(YTPlayer.player.getDuration());
                YTPlayer.goto = (timeBar.outerWidth() * totalTime) / progressBar.outerWidth();

                YTPlayer.player.seekTo(parseFloat(YTPlayer.goto), true);
                controlBar.find(".mb_YTVPLoaded").css({ width: 0 });
            });

            var loadedBar = jQuery("<div/>").addClass("mb_YTVPLoaded").css("position", "absolute");
            var timeBar = jQuery("<div/>").addClass("mb_YTVTime").css("position", "absolute");

            progressBar.append(loadedBar).append(timeBar);
            buttonBar.append(playpause).append(MuteUnmute).append(idx);

            if (data.printUrl) {
                buttonBar.append(movieUrl);
            }

            if (YTPlayer.isBackground || (YTPlayer.opt.realfullscreen && !YTPlayer.isBackground))
                buttonBar.append(onlyVideo);

            controlBar.append(buttonBar).append(progressBar);

            if (!YTPlayer.isBackground) {
                controlBar.addClass("inlinePlayer");
                YTPlayer.wrapper.before(controlBar);
            } else {
                jQuery("body").after(controlBar);
            }
            controlBar.fadeIn();
        },

        checkForState: function (YTPlayer) {

            var controlBar = jQuery("#controlBar_" + YTPlayer.id);
            var data = YTPlayer.opt;
            var startAt = YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 1;
            var stopAt = YTPlayer.opt.stopAt > YTPlayer.opt.startAt ? YTPlayer.opt.stopAt : 0;
            stopAt = stopAt < YTPlayer.player.getDuration() ? stopAt : 0;

            YTPlayer.getState = setInterval(function () {
                var prog = jQuery(YTPlayer).manageYTPProgress();

                controlBar.find(".mb_YTVPTime").html(jQuery.mbYTPlayer.formatTime(prog.currentTime) + " / " + jQuery.mbYTPlayer.formatTime(prog.totalTime));

                if (YTPlayer.player.getPlayerState() == 1 && (parseFloat(YTPlayer.player.getDuration() - 3) < YTPlayer.player.getCurrentTime() || (stopAt > 0 && parseFloat(YTPlayer.player.getCurrentTime()) > stopAt))) {

                    if (!data.loop) {
                        YTPlayer.player.pauseVideo();
                        YTPlayer.wrapper.CSSAnimate({ opacity: 0 }, 2000, function () {
                            YTPlayer.player.seekTo(startAt, true);

                            if (!YTPlayer.isBackground) {
                                var bgndURL = YTPlayer.videoData.thumbnail.hqDefault;
                                jQuery(YTPlayer).css({ background: "rgba(0,0,0,0.5) url(" + bgndURL + ") center center", backgroundSize: "cover" });
                            }
                        });
                    } else
                        YTPlayer.player.seekTo(startAt);
                    jQuery(YTPlayer).trigger("YTPEnd");
                }
            }, 1);

        },

        formatTime: function (s) {
            var min = Math.floor(s / 60);
            var sec = Math.floor(s - (60 * min));
            return (min < 9 ? "0" + min : min) + " : " + (sec < 9 ? "0" + sec : sec);
        }
    };

    jQuery.fn.toggleVolume = function () {
        var YTPlayer = this.get(0);
        if (!YTPlayer)
            return;

        if (YTPlayer.player.isMuted()) {
            jQuery(YTPlayer).unmuteYTPVolume();
            return true;
        } else {
            jQuery(YTPlayer).muteYTPVolume();
            return false;
        }
    };

    jQuery.fn.optimizeDisplay = function () {

        var YTPlayer = this.get(0);
        var data = YTPlayer.opt;
        var playerBox = jQuery(YTPlayer.playerEl);
        var win = {};
        var el = !YTPlayer.isBackground ? data.containment : jQuery(window);

        win.width = el.width();
        win.height = el.height();

        var margin = 24;
        var vid = {};
        vid.width = win.width + ((win.width * margin) / 100);
        vid.height = data.ratio == "16/9" ? Math.ceil((9 * win.width) / 16) : Math.ceil((3 * win.width) / 4);
        vid.marginTop = -((vid.height - win.height) / 2);
        vid.marginLeft = -((win.width * (margin / 2)) / 100);

        if (vid.height < win.height) {
            vid.height = win.height + ((win.height * margin) / 100);
            vid.width = data.ratio == "16/9" ? Math.floor((16 * win.height) / 9) : Math.floor((4 * win.height) / 3);
            vid.marginTop = -((win.height * (margin / 2)) / 100);
            vid.marginLeft = -((vid.width - win.width) / 2);
        }
        playerBox.css({ width: vid.width, height: vid.height, marginTop: vid.marginTop, marginLeft: vid.marginLeft });
    };

    jQuery.shuffle = function (arr) {
        var newArray = arr.slice();
        var len = newArray.length;
        var i = len;
        while (i--) {
            var p = parseInt(Math.random() * len);
            var t = newArray[i];
            newArray[i] = newArray[p];
            newArray[p] = t;
        }
        return newArray;
    };

    /*Exposed method for external use*/

    jQuery.fn.mb_YTPlayer = jQuery.mbYTPlayer.buildPlayer;
    jQuery.fn.YTPlaylist = jQuery.mbYTPlayer.YTPlaylist;
    jQuery.fn.playNext = jQuery.mbYTPlayer.playNext;
    jQuery.fn.playPrev = jQuery.mbYTPlayer.playPrev;
    jQuery.fn.changeMovie = jQuery.mbYTPlayer.changeMovie;
    jQuery.fn.getVideoID = jQuery.mbYTPlayer.getVideoID;
    jQuery.fn.getPlayer = jQuery.mbYTPlayer.getPlayer;
    jQuery.fn.playerDestroy = jQuery.mbYTPlayer.playerDestroy;
    jQuery.fn.fullscreen = jQuery.mbYTPlayer.fullscreen;
    jQuery.fn.buildYTPControls = jQuery.mbYTPlayer.buildYTPControls;
    jQuery.fn.playYTP = jQuery.mbYTPlayer.playYTP;
    jQuery.fn.toggleLoops = jQuery.mbYTPlayer.toggleLoops;
    jQuery.fn.stopYTP = jQuery.mbYTPlayer.stopYTP;
    jQuery.fn.pauseYTP = jQuery.mbYTPlayer.pauseYTP;
    jQuery.fn.seekToYTP = jQuery.mbYTPlayer.seekToYTP;
    jQuery.fn.muteYTPVolume = jQuery.mbYTPlayer.muteYTPVolume;
    jQuery.fn.unmuteYTPVolume = jQuery.mbYTPlayer.unmuteYTPVolume;
    jQuery.fn.setYTPVolume = jQuery.mbYTPlayer.setYTPVolume;
    jQuery.fn.setVideoQuality = jQuery.mbYTPlayer.setVideoQuality;
    jQuery.fn.manageYTPProgress = jQuery.mbYTPlayer.manageYTPProgress;

})(jQuery, ytp);


/*
tabSlideOUt v1.3
    
By William Paoli: http://wpaoli.building58.com

To use you must have an image ready to go as your tab
Make sure to pass in at minimum the path to the image and its dimensions:
*/

(function ($) {
    $.fn.tabSlideOut = function (callerSettings) {
        var settings = $.extend({
            tabHandle: '.handle',
            speed: 300,
            action: 'click',
            tabLocation: 'left',
            topPos: '200px',
            leftPos: '20px',
            fixedPosition: false,
            positioning: 'absolute',
            pathToTabImage: null,
            imageHeight: null,
            imageWidth: null,
            onLoadSlideOut: false
        }, callerSettings || {});

        settings.tabHandle = $(settings.tabHandle);
        var obj = this;
        if (settings.fixedPosition === true) {
            settings.positioning = 'fixed';
        } else {
            settings.positioning = 'absolute';
        }

        //ie6 doesn't do well with the fixed option
        if (document.all && !window.opera && !window.XMLHttpRequest) {
            settings.positioning = 'absolute';
        }



        //set initial tabHandle css

        if (settings.pathToTabImage != null) {
            settings.tabHandle.css({
                'background': 'url(' + settings.pathToTabImage + ') no-repeat',
                'width': settings.imageWidth,
                'height': settings.imageHeight
            });
        }

        settings.tabHandle.css({
            'display': 'block',
            'textIndent': '-99999px',
            'outline': 'none',
            'position': 'absolute'
        });

        obj.css({
            'line-height': '1',
            'position': settings.positioning
        });


        var properties = {
            containerWidth: parseInt(obj.outerWidth(), 10) + 'px',
            containerHeight: parseInt(obj.outerHeight(), 10) + 'px',
            tabWidth: parseInt(settings.tabHandle.outerWidth(), 10) + 'px',
            tabHeight: parseInt(settings.tabHandle.outerHeight(), 10) + 'px'
        };

        //set calculated css
        if (settings.tabLocation === 'top' || settings.tabLocation === 'bottom') {
            obj.css({ 'left': settings.leftPos });
            settings.tabHandle.css({ 'right': 0 });
        }

        if (settings.tabLocation === 'top') {
            obj.css({ 'top': '-' + properties.containerHeight });
            settings.tabHandle.css({ 'bottom': '-' + properties.tabHeight });
        }

        if (settings.tabLocation === 'bottom') {
            obj.css({ 'bottom': '-' + properties.containerHeight, 'position': 'fixed' });
            settings.tabHandle.css({ 'top': '-' + properties.tabHeight });

        }

        if (settings.tabLocation === 'left' || settings.tabLocation === 'right') {
            obj.css({
                'height': properties.containerHeight,
                'top': settings.topPos
            });

            settings.tabHandle.css({ 'top': 0 });
        }

        if (settings.tabLocation === 'left') {
            obj.css({ 'left': '-' + properties.containerWidth });
            settings.tabHandle.css({ 'right': '-' + properties.tabWidth });
        }

        if (settings.tabLocation === 'right') {
            obj.css({ 'right': '-' + properties.containerWidth });
            settings.tabHandle.css({ 'left': '-' + properties.tabWidth });

            $('html').css('overflow-x', 'hidden');
        }

        //functions for animation events

        settings.tabHandle.click(function (event) {
            event.preventDefault();
        });

        var slideIn = function () {

            if (settings.tabLocation === 'top') {
                obj.animate({ top: '-' + properties.containerHeight }, settings.speed).removeClass('open');
            } else if (settings.tabLocation === 'left') {
                obj.animate({ left: '-' + properties.containerWidth }, settings.speed).removeClass('open');
            } else if (settings.tabLocation === 'right') {
                obj.animate({ right: '-' + properties.containerWidth }, settings.speed).removeClass('open');
            } else if (settings.tabLocation === 'bottom') {
                obj.animate({ bottom: '-' + properties.containerHeight }, settings.speed).removeClass('open');
            }

        };

        var slideOut = function () {

            if (settings.tabLocation == 'top') {
                obj.animate({ top: '-3px' }, settings.speed).addClass('open');
            } else if (settings.tabLocation == 'left') {
                obj.animate({ left: '-3px' }, settings.speed).addClass('open');
            } else if (settings.tabLocation == 'right') {
                obj.animate({ right: '-3px' }, settings.speed).addClass('open');
            } else if (settings.tabLocation == 'bottom') {
                obj.animate({ bottom: '-3px' }, settings.speed).addClass('open');
            }
        };

        var clickScreenToClose = function () {
            obj.click(function (event) {
                event.stopPropagation();
            });

            $(document).click(function () {
                slideIn();
            });
        };

        var clickAction = function () {
            settings.tabHandle.click(function (event) {
                if (obj.hasClass('open')) {
                    slideIn();
                } else {
                    slideOut();
                }
            });

            clickScreenToClose();
        };

        var hoverAction = function () {
            obj.hover(
                function () {
                    slideOut();
                },

                function () {
                    slideIn();
                });

            settings.tabHandle.click(function (event) {
                if (obj.hasClass('open')) {
                    slideIn();
                }
            });
            clickScreenToClose();

        };

        var slideOutOnLoad = function () {
            slideIn();
            setTimeout(slideOut, 500);
        };

        //choose which type of action to bind
        if (settings.action === 'click') {
            clickAction();
        }

        if (settings.action === 'hover') {
            hoverAction();
        }

        if (settings.onLoadSlideOut) {
            slideOutOnLoad();
        };

    };
})(jQuery);




// Easy Responsive Tabs Plugin
// Author: Samson.Onna <Email : samson3d@gmail.com>
(function ($) {
    $.fn.extend({
        easyResponsiveTabs: function (options) {
            //Set the default values, use comma to separate the settings, example:
            var defaults = {
                type: 'default', //default, vertical, accordion;
                width: 'auto',
                fit: true,
                closed: false,
                activate: function () { }
            }
            //Variables
            var options = $.extend(defaults, options);
            var opt = options, jtype = opt.type, jfit = opt.fit, jwidth = opt.width, vtabs = 'vertical', accord = 'accordion';
            var hash = window.location.hash;
            var historyApi = !!(window.history && history.replaceState);

            //Events
            $(this).bind('tabactivate', function (e, currentTab) {
                if (typeof options.activate === 'function') {
                    options.activate.call(currentTab, e)
                }
            });

            //Main function
            this.each(function () {
                var $respTabs = $(this);
                var $respTabsList = $respTabs.find('ul.resp-tabs-list');
                var respTabsId = $respTabs.attr('id');
                $respTabs.find('ul.resp-tabs-list li').addClass('resp-tab-item');
                $respTabs.css({
                    'display': 'block',
                    'width': jwidth
                });

                $respTabs.find('.resp-tabs-container > div').addClass('resp-tab-content');
                jtab_options();
                //Properties Function
                function jtab_options() {
                    if (jtype == vtabs) {
                        $respTabs.addClass('resp-vtabs');
                    }
                    if (jfit == true) {
                        $respTabs.css({ width: '100%', margin: '0px' });
                    }
                    if (jtype == accord) {
                        $respTabs.addClass('resp-easy-accordion');
                        $respTabs.find('.resp-tabs-list').css('display', 'none');
                    }
                }

                //Assigning the h2 markup to accordion title
                var $tabItemh2;
                $respTabs.find('.resp-tab-content').before("<h2 class='resp-accordion' role='tab'><span class='resp-arrow'></span></h2>");

                var itemCount = 0;
                $respTabs.find('.resp-accordion').each(function () {
                    $tabItemh2 = $(this);
                    var $tabItem = $respTabs.find('.resp-tab-item:eq(' + itemCount + ')');
                    var $accItem = $respTabs.find('.resp-accordion:eq(' + itemCount + ')');
                    $accItem.append($tabItem.html());
                    $accItem.data($tabItem.data());
                    $tabItemh2.attr('aria-controls', 'tab_item-' + (itemCount));
                    itemCount++;
                });

                //Assigning the 'aria-controls' to Tab items
                var count = 0,
                    $tabContent;
                $respTabs.find('.resp-tab-item').each(function () {
                    $tabItem = $(this);
                    $tabItem.attr('aria-controls', 'tab_item-' + (count));
                    $tabItem.attr('role', 'tab');

                    //Assigning the 'aria-labelledby' attr to tab-content
                    var tabcount = 0;
                    $respTabs.find('.resp-tab-content').each(function () {
                        $tabContent = $(this);
                        $tabContent.attr('aria-labelledby', 'tab_item-' + (tabcount));
                        tabcount++;
                    });
                    count++;
                });

                // Show correct content area
                var tabNum = 0;
                if (hash != '') {
                    var matches = hash.match(new RegExp(respTabsId + "([0-9]+)"));
                    if (matches !== null && matches.length === 2) {
                        tabNum = parseInt(matches[1], 10) - 1;
                        if (tabNum > count) {
                            tabNum = 0;
                        }
                    }
                }

                //Active correct tab
                $($respTabs.find('.resp-tab-item')[tabNum]).addClass('resp-tab-active');

                //keep closed if option = 'closed' or option is 'accordion' and the element is in accordion mode
                if (options.closed !== true && !(options.closed === 'accordion' && !$respTabsList.is(':visible')) && !(options.closed === 'tabs' && $respTabsList.is(':visible'))) {
                    $($respTabs.find('.resp-accordion')[tabNum]).addClass('resp-tab-active');
                    $($respTabs.find('.resp-tab-content')[tabNum]).addClass('resp-tab-content-active').attr('style', 'display:block');
                }
                //assign proper classes for when tabs mode is activated before making a selection in accordion mode
                else {
                    $($respTabs.find('.resp-tab-content')[tabNum]).addClass('resp-tab-content-active resp-accordion-closed')
                }

                //Tab Click action function
                $respTabs.find("[role=tab]").each(function () {

                    var $currentTab = $(this);
                    $currentTab.click(function () {

                        var $currentTab = $(this);
                        var $tabAria = $currentTab.attr('aria-controls');

                        if ($currentTab.hasClass('resp-accordion') && $currentTab.hasClass('resp-tab-active')) {
                            $respTabs.find('.resp-tab-content-active').slideUp('', function () { $(this).addClass('resp-accordion-closed'); });
                            $currentTab.removeClass('resp-tab-active');
                            return false;
                        }
                        if (!$currentTab.hasClass('resp-tab-active') && $currentTab.hasClass('resp-accordion')) {
                            $respTabs.find('.resp-tab-active').removeClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content-active').slideUp().removeClass('resp-tab-content-active resp-accordion-closed');
                            $respTabs.find("[aria-controls=" + $tabAria + "]").addClass('resp-tab-active');

                            $respTabs.find('.resp-tab-content[aria-labelledby = ' + $tabAria + ']').slideDown().addClass('resp-tab-content-active');
                        } else {
                            $respTabs.find('.resp-tab-active').removeClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content-active').removeAttr('style').removeClass('resp-tab-content-active').removeClass('resp-accordion-closed');
                            $respTabs.find("[aria-controls=" + $tabAria + "]").addClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content[aria-labelledby = ' + $tabAria + ']').addClass('resp-tab-content-active').attr('style', 'display:block');
                        }
                        //Trigger tab activation event
                        $currentTab.trigger('tabactivate', $currentTab);

                        //Update Browser History
                        if (historyApi) {
                            var currentHash = window.location.hash;
                            var newHash = respTabsId + (parseInt($tabAria.substring(9), 10) + 1).toString();
                            if (currentHash != "") {
                                var re = new RegExp(respTabsId + "[0-9]+");
                                if (currentHash.match(re) != null) {
                                    newHash = currentHash.replace(re, newHash);
                                }
                                else {
                                    newHash = currentHash + "|" + newHash;
                                }
                            }
                            else {
                                newHash = '#' + newHash;
                            }

                            history.replaceState(null, null, newHash);
                        }
                    });

                });

                //Window resize function                   
                $(window).resize(function () {
                    $respTabs.find('.resp-accordion-closed').removeAttr('style');
                });
            });
        }
    });
})(jQuery);



/**
* Quote Rotator - Simple jQuery plugin which cause a set of list
* items to fade-in and fade-out. 
* 
* Homepage: http://coryschires.com/jquery-quote-rotator-plugin/
* Source Code: https://github.com/coryschires/quote-rotator
* 
* Copyright (c) 2011 Cory Schires (coryschires.com)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
* Version: 1.0.0
*/

(function ($) {

    $.quote_rotator = {
        defaults: {
            rotation_speed: 15000,
            pause_on_hover: true,
            randomize_first_quote: false,
            buttons: false
        }
    }

    $.fn.extend({
        quote_rotator: function (config) {

            var config = $.extend({}, $.quote_rotator.defaults, config);

            return this.each(function () {
                var rotation;
                var quote_list = $(this);
                var list_items = quote_list.find('li');
                var rotation_active = true;
                var rotation_speed = config.rotation_speed < 2000 ? 2000 : config.rotation_speed;

                var add_active_class = function () {
                    var active_class_not_already_applied = quote_list.find('li.active').length === 0;
                    if (config.randomize_first_quote) {
                        var random_list_item = $(list_items[Math.floor(Math.random() * (list_items.length))]);
                        random_list_item.addClass('active');
                    } else if (active_class_not_already_applied) {
                        quote_list.find('li:first').addClass('active');
                    }
                }();

                var get_next_quote = function (quote) {
                    return quote.next('li').length ? quote.next('li') : quote_list.find('li:first');
                }

                var get_previous_quote = function (quote) {
                    return quote.prev('li').length ? quote.prev('li') : quote_list.find('li:last');
                }

                var rotate_quotes = function (direction) {
                    var active_quote = quote_list.find('li.active');
                    var next_quote = direction === 'forward' ? get_next_quote(active_quote) : get_previous_quote(active_quote)

                    active_quote.animate({
                        opacity: 0
                    }, 1000, function () {
                        active_quote.hide();
                        list_items.css('opacity', 1);
                        next_quote.fadeIn(1000);
                    });

                    active_quote.removeClass('active');
                    next_quote.addClass('active');
                };

                var start_automatic_rotation = function () {
                    rotation = setInterval(function () {
                        if (rotation_active) { rotate_quotes('forward'); }
                    }, rotation_speed);
                };

                var pause_rotation_on_hover = function () {
                    quote_list.hover(function () {
                        rotation_active = false;
                    }, function () {
                        rotation_active = true;
                    });
                };

                var include_next_previous_buttons = function () {
                    quote_list.append(
                        '<div class="qr_buttons">\
              <button class="qr_previous">' + config.buttons.previous + '</button>\
              <button class="qr_next">' + config.buttons.next + '</button>\
            </div>'
                    );
                    quote_list.find('button').click(function () {
                        clearInterval(rotation);
                        rotate_quotes($(this).hasClass('qr_next') ? 'forward' : 'backward');
                        start_automatic_rotation();
                    });
                };

                if (config.buttons) { include_next_previous_buttons(); }
                if (config.pause_on_hover) { pause_rotation_on_hover(); }

                list_items.not('.active').hide();

                start_automatic_rotation();
            })
        }
    })

})(jQuery);



/**
* BxSlider v4.1.1 - Fully loaded, responsive content slider
* http://bxslider.com
*
* Copyright 2013, Steven Wanderski - http://stevenwanderski.com - http://bxcreative.com
* Written while drinking Belgian ales and listening to jazz
*
* Released under the MIT license - http://opensource.org/licenses/MIT
*/

; (function ($) {

    var plugin = {};

    var defaults = {

        // GENERAL
        mode: 'fade',
        slideSelector: '',
        infiniteLoop: true,
        hideControlOnEnd: false,
        speed: 500,
        easing: null,
        slideMargin: 0,
        startSlide: 0,
        randomStart: false,
        captions: false,
        ticker: false,
        tickerHover: false,
        adaptiveHeight: false,
        adaptiveHeightSpeed: 500,
        video: false,
        useCSS: true,
        preloadImages: 'visible',
        responsive: true,

        // TOUCH
        touchEnabled: true,
        swipeThreshold: 50,
        oneToOneTouch: true,
        preventDefaultSwipeX: true,
        preventDefaultSwipeY: false,

        // PAGER
        pager: true,
        pagerType: 'full',
        pagerShortSeparator: ' / ',
        pagerSelector: null,
        buildPager: null,
        pagerCustom: null,

        // CONTROLS
        controls: true,
        nextText: 'Next',
        prevText: 'Prev',
        nextSelector: null,
        prevSelector: null,
        autoControls: false,
        startText: 'Start',
        stopText: 'Stop',
        autoControlsCombine: false,
        autoControlsSelector: null,

        // AUTO
        auto: true,
        pause: 4000,
        autoStart: true,
        autoDirection: 'next',
        autoHover: false,
        autoDelay: 0,

        // CAROUSEL
        minSlides: 1,
        maxSlides: 1,
        moveSlides: 0,
        slideWidth: 0,

        // CALLBACKS
        onSliderLoad: function () { },
        onSlideBefore: function () { },
        onSlideAfter: function () { },
        onSlideNext: function () { },
        onSlidePrev: function () { }
    }

    $.fn.bxSlider = function (options) {

        if (this.length == 0) return this;

        // support mutltiple elements
        if (this.length > 1) {
            this.each(function () { $(this).bxSlider(options) });
            return this;
        }

        // create a namespace to be used throughout the plugin
        var slider = {};
        // set a reference to our slider element
        var el = this;
        plugin.el = this;

        /**
        * Makes slideshow responsive
        */
        // first get the original window dimens (thanks alot IE)
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();



        /**
        * ===================================================================================
        * = PRIVATE FUNCTIONS
        * ===================================================================================
        */

        /**
        * Initializes namespace settings to be used throughout plugin
        */
        var init = function () {
            // merge user-supplied options with the defaults
            slider.settings = $.extend({}, defaults, options);
            // parse slideWidth setting
            slider.settings.slideWidth = parseInt(slider.settings.slideWidth);
            // store the original children
            slider.children = el.children(slider.settings.slideSelector);
            // check if actual number of slides is less than minSlides / maxSlides
            if (slider.children.length < slider.settings.minSlides) slider.settings.minSlides = slider.children.length;
            if (slider.children.length < slider.settings.maxSlides) slider.settings.maxSlides = slider.children.length;
            // if random start, set the startSlide setting to random number
            if (slider.settings.randomStart) slider.settings.startSlide = Math.floor(Math.random() * slider.children.length);
            // store active slide information
            slider.active = { index: slider.settings.startSlide }
            // store if the slider is in carousel mode (displaying / moving multiple slides)
            slider.carousel = slider.settings.minSlides > 1 || slider.settings.maxSlides > 1;
            // if carousel, force preloadImages = 'all'
            if (slider.carousel) slider.settings.preloadImages = 'all';
            // calculate the min / max width thresholds based on min / max number of slides
            // used to setup and update carousel slides dimensions
            slider.minThreshold = (slider.settings.minSlides * slider.settings.slideWidth) + ((slider.settings.minSlides - 1) * slider.settings.slideMargin);
            slider.maxThreshold = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
            // store the current state of the slider (if currently animating, working is true)
            slider.working = false;
            // initialize the controls object
            slider.controls = {};
            // initialize an auto interval
            slider.interval = null;
            // determine which property to use for transitions
            slider.animProp = slider.settings.mode == 'vertical' ? 'top' : 'left';
            // determine if hardware acceleration can be used
            slider.usingCSS = slider.settings.useCSS && slider.settings.mode != 'fade' && (function () {
                // create our test div element
                var div = document.createElement('div');
                // css transition properties
                var props = ['WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
                // test for each property
                for (var i in props) {
                    if (div.style[props[i]] !== undefined) {
                        slider.cssPrefix = props[i].replace('Perspective', '').toLowerCase();
                        slider.animProp = '-' + slider.cssPrefix + '-transform';
                        return true;
                    }
                }
                return false;
            }());
            // if vertical mode always make maxSlides and minSlides equal
            if (slider.settings.mode == 'vertical') slider.settings.maxSlides = slider.settings.minSlides;
            // save original style data
            el.data("origStyle", el.attr("style"));
            el.children(slider.settings.slideSelector).each(function () {
                $(this).data("origStyle", $(this).attr("style"));
            });
            // perform all DOM / CSS modifications
            setup();
        }

        /**
        * Performs all DOM and CSS modifications
        */
        var setup = function () {
            // wrap el in a wrapper
            el.wrap('<div class="bx-wrapper"><div class="bx-viewport"></div></div>');
            // store a namspace reference to .bx-viewport
            slider.viewport = el.parent();
            // add a loading div to display while images are loading
            slider.loader = $('<div class="bx-loading" />');
            slider.viewport.prepend(slider.loader);
            // set el to a massive width, to hold any needed slides
            // also strip any margin and padding from el
            el.css({
                width: slider.settings.mode == 'horizontal' ? (slider.children.length * 100 + 215) + '%' : 'auto',
                position: 'relative'
            });
            // if using CSS, add the easing property
            if (slider.usingCSS && slider.settings.easing) {
                el.css('-' + slider.cssPrefix + '-transition-timing-function', slider.settings.easing);
                // if not using CSS and no easing value was supplied, use the default JS animation easing (swing)
            } else if (!slider.settings.easing) {
                slider.settings.easing = 'swing';
            }
            var slidesShowing = getNumberSlidesShowing();
            // make modifications to the viewport (.bx-viewport)
            slider.viewport.css({
                width: '100%',
                overflow: 'hidden',
                position: 'relative'
            });
            slider.viewport.parent().css({
                maxWidth: getViewportMaxWidth()
            });
            // make modification to the wrapper (.bx-wrapper)
            if (!slider.settings.pager) {
                slider.viewport.parent().css({
                    margin: '0 auto 0px'
                });
            }
            // apply css to all slider children
            slider.children.css({
                'float': slider.settings.mode == 'horizontal' ? 'left' : 'none',
                listStyle: 'none',
                position: 'relative'
            });
            // apply the calculated width after the float is applied to prevent scrollbar interference
            slider.children.css('width', getSlideWidth());
            // if slideMargin is supplied, add the css
            if (slider.settings.mode == 'horizontal' && slider.settings.slideMargin > 0) slider.children.css('marginRight', slider.settings.slideMargin);
            if (slider.settings.mode == 'vertical' && slider.settings.slideMargin > 0) slider.children.css('marginBottom', slider.settings.slideMargin);
            // if "fade" mode, add positioning and z-index CSS
            if (slider.settings.mode == 'fade') {
                slider.children.css({
                    position: 'absolute',
                    zIndex: 0,
                    display: 'none'
                });
                // prepare the z-index on the showing element
                slider.children.eq(slider.settings.startSlide).css({ zIndex: 50, display: 'block' });
            }
            // create an element to contain all slider controls (pager, start / stop, etc)
            slider.controls.el = $('<div class="bx-controls" />');
            // if captions are requested, add them
            if (slider.settings.captions) appendCaptions();
            // check if startSlide is last slide
            slider.active.last = slider.settings.startSlide == getPagerQty() - 1;
            // if video is true, set up the fitVids plugin
            if (slider.settings.video) el.fitVids();
            // set the default preload selector (visible)
            var preloadSelector = slider.children.eq(slider.settings.startSlide);
            if (slider.settings.preloadImages == "all") preloadSelector = slider.children;
            // only check for control addition if not in "ticker" mode
            if (!slider.settings.ticker) {
                // if pager is requested, add it
                if (slider.settings.pager) appendPager();
                // if controls are requested, add them
                if (slider.settings.controls) appendControls();
                // if auto is true, and auto controls are requested, add them
                if (slider.settings.auto && slider.settings.autoControls) appendControlsAuto();
                // if any control option is requested, add the controls wrapper
                if (slider.settings.controls || slider.settings.autoControls || slider.settings.pager) slider.viewport.after(slider.controls.el);
                // if ticker mode, do not allow a pager
            } else {
                slider.settings.pager = false;
            }
            // preload all images, then perform final DOM / CSS modifications that depend on images being loaded
            loadElements(preloadSelector, start);
        }

        var loadElements = function (selector, callback) {
            var total = selector.find('img, iframe').length;
            if (total == 0) {
                callback();
                return;
            }
            var count = 0;
            selector.find('img, iframe').each(function () {
                $(this).one('load', function () {
                    if (++count == total) callback();
                }).each(function () {
                    if (this.complete) $(this).load();
                });
            });
        }

        /**
        * Start the slider
        */
        var start = function () {
            // if infinite loop, prepare additional slides
            if (slider.settings.infiniteLoop && slider.settings.mode != 'fade' && !slider.settings.ticker) {
                var slice = slider.settings.mode == 'vertical' ? slider.settings.minSlides : slider.settings.maxSlides;
                var sliceAppend = slider.children.slice(0, slice).clone().addClass('bx-clone');
                var slicePrepend = slider.children.slice(-slice).clone().addClass('bx-clone');
                el.append(sliceAppend).prepend(slicePrepend);
            }
            // remove the loading DOM element
            slider.loader.remove();
            // set the left / top position of "el"
            setSlidePosition();
            // if "vertical" mode, always use adaptiveHeight to prevent odd behavior
            if (slider.settings.mode == 'vertical') slider.settings.adaptiveHeight = true;
            // set the viewport height
            slider.viewport.height(getViewportHeight());
            // make sure everything is positioned just right (same as a window resize)
            el.redrawSlider();
            // onSliderLoad callback
            slider.settings.onSliderLoad(slider.active.index);
            // slider has been fully initialized
            slider.initialized = true;
            // bind the resize call to the window
            if (slider.settings.responsive) $(window).bind('resize', resizeWindow);
            // if auto is true, start the show
            if (slider.settings.auto && slider.settings.autoStart) initAuto();
            // if ticker is true, start the ticker
            if (slider.settings.ticker) initTicker();
            // if pager is requested, make the appropriate pager link active
            if (slider.settings.pager) updatePagerActive(slider.settings.startSlide);
            // check for any updates to the controls (like hideControlOnEnd updates)
            if (slider.settings.controls) updateDirectionControls();
            // if touchEnabled is true, setup the touch events
            if (slider.settings.touchEnabled && !slider.settings.ticker) initTouch();
        }

        /**
        * Returns the calculated height of the viewport, used to determine either adaptiveHeight or the maxHeight value
        */
        var getViewportHeight = function () {
            var height = 0;
            // first determine which children (slides) should be used in our height calculation
            var children = $();
            // if mode is not "vertical" and adaptiveHeight is false, include all children
            if (slider.settings.mode != 'vertical' && !slider.settings.adaptiveHeight) {
                children = slider.children;
            } else {
                // if not carousel, return the single active child
                if (!slider.carousel) {
                    children = slider.children.eq(slider.active.index);
                    // if carousel, return a slice of children
                } else {
                    // get the individual slide index
                    var currentIndex = slider.settings.moveSlides == 1 ? slider.active.index : slider.active.index * getMoveBy();
                    // add the current slide to the children
                    children = slider.children.eq(currentIndex);
                    // cycle through the remaining "showing" slides
                    for (i = 1; i <= slider.settings.maxSlides - 1; i++) {
                        // if looped back to the start
                        if (currentIndex + i >= slider.children.length) {
                            children = children.add(slider.children.eq(i - 1));
                        } else {
                            children = children.add(slider.children.eq(currentIndex + i));
                        }
                    }
                }
            }
            // if "vertical" mode, calculate the sum of the heights of the children
            if (slider.settings.mode == 'vertical') {
                children.each(function (index) {
                    height += $(this).outerHeight();
                });
                // add user-supplied margins
                if (slider.settings.slideMargin > 0) {
                    height += slider.settings.slideMargin * (slider.settings.minSlides - 1);
                }
                // if not "vertical" mode, calculate the max height of the children
            } else {
                height = Math.max.apply(Math, children.map(function () {
                    return $(this).outerHeight(false);
                }).get());
            }
            return height;
        }

        /**
        * Returns the calculated width to be used for the outer wrapper / viewport
        */
        var getViewportMaxWidth = function () {
            var width = '100%';
            if (slider.settings.slideWidth > 0) {
                if (slider.settings.mode == 'horizontal') {
                    width = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
                } else {
                    width = slider.settings.slideWidth;
                }
            }
            return width;
        }

        /**
        * Returns the calculated width to be applied to each slide
        */
        var getSlideWidth = function () {
            // start with any user-supplied slide width
            var newElWidth = slider.settings.slideWidth;
            // get the current viewport width
            var wrapWidth = slider.viewport.width();
            // if slide width was not supplied, or is larger than the viewport use the viewport width
            if (slider.settings.slideWidth == 0 ||
                (slider.settings.slideWidth > wrapWidth && !slider.carousel) ||
                slider.settings.mode == 'vertical') {
                newElWidth = wrapWidth;
                // if carousel, use the thresholds to determine the width
            } else if (slider.settings.maxSlides > 1 && slider.settings.mode == 'horizontal') {
                if (wrapWidth > slider.maxThreshold) {
                    // newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.maxSlides - 1))) / slider.settings.maxSlides;
                } else if (wrapWidth < slider.minThreshold) {
                    newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.minSlides - 1))) / slider.settings.minSlides;
                }
            }
            return newElWidth;
        }

        /**
        * Returns the number of slides currently visible in the viewport (includes partially visible slides)
        */
        var getNumberSlidesShowing = function () {
            var slidesShowing = 1;
            if (slider.settings.mode == 'horizontal' && slider.settings.slideWidth > 0) {
                // if viewport is smaller than minThreshold, return minSlides
                if (slider.viewport.width() < slider.minThreshold) {
                    slidesShowing = slider.settings.minSlides;
                    // if viewport is larger than minThreshold, return maxSlides
                } else if (slider.viewport.width() > slider.maxThreshold) {
                    slidesShowing = slider.settings.maxSlides;
                    // if viewport is between min / max thresholds, divide viewport width by first child width
                } else {
                    var childWidth = slider.children.first().width();
                    slidesShowing = Math.floor(slider.viewport.width() / childWidth);
                }
                // if "vertical" mode, slides showing will always be minSlides
            } else if (slider.settings.mode == 'vertical') {
                slidesShowing = slider.settings.minSlides;
            }
            return slidesShowing;
        }

        /**
        * Returns the number of pages (one full viewport of slides is one "page")
        */
        var getPagerQty = function () {
            var pagerQty = 0;
            // if moveSlides is specified by the user
            if (slider.settings.moveSlides > 0) {
                if (slider.settings.infiniteLoop) {
                    pagerQty = slider.children.length / getMoveBy();
                } else {
                    // use a while loop to determine pages
                    var breakPoint = 0;
                    var counter = 0
                    // when breakpoint goes above children length, counter is the number of pages
                    while (breakPoint < slider.children.length) {
                        ++pagerQty;
                        breakPoint = counter + getNumberSlidesShowing();
                        counter += slider.settings.moveSlides <= getNumberSlidesShowing() ? slider.settings.moveSlides : getNumberSlidesShowing();
                    }
                }
                // if moveSlides is 0 (auto) divide children length by sides showing, then round up
            } else {
                pagerQty = Math.ceil(slider.children.length / getNumberSlidesShowing());
            }
            return pagerQty;
        }

        /**
        * Returns the number of indivual slides by which to shift the slider
        */
        var getMoveBy = function () {
            // if moveSlides was set by the user and moveSlides is less than number of slides showing
            if (slider.settings.moveSlides > 0 && slider.settings.moveSlides <= getNumberSlidesShowing()) {
                return slider.settings.moveSlides;
            }
            // if moveSlides is 0 (auto)
            return getNumberSlidesShowing();
        }

        /**
        * Sets the slider's (el) left or top position
        */
        var setSlidePosition = function () {
            // if last slide, not infinite loop, and number of children is larger than specified maxSlides
            if (slider.children.length > slider.settings.maxSlides && slider.active.last && !slider.settings.infiniteLoop) {
                if (slider.settings.mode == 'horizontal') {
                    // get the last child's position
                    var lastChild = slider.children.last();
                    var position = lastChild.position();
                    // set the left position
                    setPositionProperty(-(position.left - (slider.viewport.width() - lastChild.width())), 'reset', 0);
                } else if (slider.settings.mode == 'vertical') {
                    // get the last showing index's position
                    var lastShowingIndex = slider.children.length - slider.settings.minSlides;
                    var position = slider.children.eq(lastShowingIndex).position();
                    // set the top position
                    setPositionProperty(-position.top, 'reset', 0);
                }
                // if not last slide
            } else {
                // get the position of the first showing slide
                var position = slider.children.eq(slider.active.index * getMoveBy()).position();
                // check for last slide
                if (slider.active.index == getPagerQty() - 1) slider.active.last = true;
                // set the repective position
                if (position != undefined) {
                    if (slider.settings.mode == 'horizontal') setPositionProperty(-position.left, 'reset', 0);
                    else if (slider.settings.mode == 'vertical') setPositionProperty(-position.top, 'reset', 0);
                }
            }
        }

        /**
        * Sets the el's animating property position (which in turn will sometimes animate el).
        * If using CSS, sets the transform property. If not using CSS, sets the top / left property.
        *
        * @param value (int)
        *  - the animating property's value
        *
        * @param type (string) 'slider', 'reset', 'ticker'
        *  - the type of instance for which the function is being
        *
        * @param duration (int)
        *  - the amount of time (in ms) the transition should occupy
        *
        * @param params (array) optional
        *  - an optional parameter containing any variables that need to be passed in
        */
        var setPositionProperty = function (value, type, duration, params) {
            // use CSS transform
            if (slider.usingCSS) {
                // determine the translate3d value
                var propValue = slider.settings.mode == 'vertical' ? 'translate3d(0, ' + value + 'px, 0)' : 'translate3d(' + value + 'px, 0, 0)';
                // add the CSS transition-duration
                el.css('-' + slider.cssPrefix + '-transition-duration', duration / 1000 + 's');
                if (type == 'slide') {
                    // set the property value
                    el.css(slider.animProp, propValue);
                    // bind a callback method - executes when CSS transition completes
                    el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function () {
                        // unbind the callback
                        el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
                        updateAfterSlideTransition();
                    });
                } else if (type == 'reset') {
                    el.css(slider.animProp, propValue);
                } else if (type == 'ticker') {
                    // make the transition use 'linear'
                    el.css('-' + slider.cssPrefix + '-transition-timing-function', 'linear');
                    el.css(slider.animProp, propValue);
                    // bind a callback method - executes when CSS transition completes
                    el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function () {
                        // unbind the callback
                        el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
                        // reset the position
                        setPositionProperty(params['resetValue'], 'reset', 0);
                        // start the loop again
                        tickerLoop();
                    });
                }
                // use JS animate
            } else {
                var animateObj = {};
                animateObj[slider.animProp] = value;
                if (type == 'slide') {
                    el.animate(animateObj, duration, slider.settings.easing, function () {
                        updateAfterSlideTransition();
                    });
                } else if (type == 'reset') {
                    el.css(slider.animProp, value)
                } else if (type == 'ticker') {
                    el.animate(animateObj, speed, 'linear', function () {
                        setPositionProperty(params['resetValue'], 'reset', 0);
                        // run the recursive loop after animation
                        tickerLoop();
                    });
                }
            }
        }

        /**
        * Populates the pager with proper amount of pages
        */
        var populatePager = function () {
            var pagerHtml = '';
            var pagerQty = getPagerQty();
            // loop through each pager item
            for (var i = 0; i < pagerQty; i++) {
                var linkContent = '';
                // if a buildPager function is supplied, use it to get pager link value, else use index + 1
                if (slider.settings.buildPager && $.isFunction(slider.settings.buildPager)) {
                    linkContent = slider.settings.buildPager(i);
                    slider.pagerEl.addClass('bx-custom-pager');
                } else {
                    linkContent = i + 1;
                    slider.pagerEl.addClass('bx-default-pager');
                }
                // var linkContent = slider.settings.buildPager && $.isFunction(slider.settings.buildPager) ? slider.settings.buildPager(i) : i + 1;
                // add the markup to the string
                pagerHtml += '<div class="bx-pager-item"><a href="" data-slide-index="' + i + '" class="bx-pager-link">' + linkContent + '</a></div>';
            };
            // populate the pager element with pager links
            slider.pagerEl.html(pagerHtml);
        }

        /**
        * Appends the pager to the controls element
        */
        var appendPager = function () {
            if (!slider.settings.pagerCustom) {
                // create the pager DOM element
                slider.pagerEl = $('<div class="bx-pager" />');
                // if a pager selector was supplied, populate it with the pager
                if (slider.settings.pagerSelector) {
                    $(slider.settings.pagerSelector).html(slider.pagerEl);
                    // if no pager selector was supplied, add it after the wrapper
                } else {
                    slider.controls.el.addClass('bx-has-pager').append(slider.pagerEl);
                }
                // populate the pager
                populatePager();
            } else {
                slider.pagerEl = $(slider.settings.pagerCustom);
            }
            // assign the pager click binding
            slider.pagerEl.delegate('a', 'click', clickPagerBind);
        }

        /**
        * Appends prev / next controls to the controls element
        */
        var appendControls = function () {
            slider.controls.next = $('<a class="bx-next" href="">' + slider.settings.nextText + '</a>');
            slider.controls.prev = $('<a class="bx-prev" href="">' + slider.settings.prevText + '</a>');
            // bind click actions to the controls
            slider.controls.next.bind('click', clickNextBind);
            slider.controls.prev.bind('click', clickPrevBind);
            // if nextSlector was supplied, populate it
            if (slider.settings.nextSelector) {
                $(slider.settings.nextSelector).append(slider.controls.next);
            }
            // if prevSlector was supplied, populate it
            if (slider.settings.prevSelector) {
                $(slider.settings.prevSelector).append(slider.controls.prev);
            }
            // if no custom selectors were supplied
            if (!slider.settings.nextSelector && !slider.settings.prevSelector) {
                // add the controls to the DOM
                slider.controls.directionEl = $('<div class="bx-controls-direction" />');
                // add the control elements to the directionEl
                slider.controls.directionEl.append(slider.controls.prev).append(slider.controls.next);
                // slider.viewport.append(slider.controls.directionEl);
                slider.controls.el.addClass('bx-has-controls-direction').append(slider.controls.directionEl);
            }
        }

        /**
        * Appends start / stop auto controls to the controls element
        */
        var appendControlsAuto = function () {
            slider.controls.start = $('<div class="bx-controls-auto-item"><a class="bx-start" href="">' + slider.settings.startText + '</a></div>');
            slider.controls.stop = $('<div class="bx-controls-auto-item"><a class="bx-stop" href="">' + slider.settings.stopText + '</a></div>');
            // add the controls to the DOM
            slider.controls.autoEl = $('<div class="bx-controls-auto" />');
            // bind click actions to the controls
            slider.controls.autoEl.delegate('.bx-start', 'click', clickStartBind);
            slider.controls.autoEl.delegate('.bx-stop', 'click', clickStopBind);
            // if autoControlsCombine, insert only the "start" control
            if (slider.settings.autoControlsCombine) {
                slider.controls.autoEl.append(slider.controls.start);
                // if autoControlsCombine is false, insert both controls
            } else {
                slider.controls.autoEl.append(slider.controls.start).append(slider.controls.stop);
            }
            // if auto controls selector was supplied, populate it with the controls
            if (slider.settings.autoControlsSelector) {
                $(slider.settings.autoControlsSelector).html(slider.controls.autoEl);
                // if auto controls selector was not supplied, add it after the wrapper
            } else {
                slider.controls.el.addClass('bx-has-controls-auto').append(slider.controls.autoEl);
            }
            // update the auto controls
            updateAutoControls(slider.settings.autoStart ? 'stop' : 'start');
        }

        /**
        * Appends image captions to the DOM
        */
        var appendCaptions = function () {
            // cycle through each child
            slider.children.each(function (index) {
                // get the image title attribute
                var title = $(this).find('img:first').attr('title');
                // append the caption
                if (title != undefined && ('' + title).length) {
                    $(this).append('<div class="bx-caption"><span>' + title + '</span></div>');
                }
            });
        }

        /**
        * Click next binding
        *
        * @param e (event)
        *  - DOM event object
        */
        var clickNextBind = function (e) {
            // if auto show is running, stop it
            if (slider.settings.auto) el.stopAuto();
            el.goToNextSlide();
            e.preventDefault();
        }

        /**
        * Click prev binding
        *
        * @param e (event)
        *  - DOM event object
        */
        var clickPrevBind = function (e) {
            // if auto show is running, stop it
            if (slider.settings.auto) el.stopAuto();
            el.goToPrevSlide();
            e.preventDefault();
        }

        /**
        * Click start binding
        *
        * @param e (event)
        *  - DOM event object
        */
        var clickStartBind = function (e) {
            el.startAuto();
            e.preventDefault();
        }

        /**
        * Click stop binding
        *
        * @param e (event)
        *  - DOM event object
        */
        var clickStopBind = function (e) {
            el.stopAuto();
            e.preventDefault();
        }

        /**
        * Click pager binding
        *
        * @param e (event)
        *  - DOM event object
        */
        var clickPagerBind = function (e) {
            // if auto show is running, stop it
            if (slider.settings.auto) el.stopAuto();
            var pagerLink = $(e.currentTarget);
            var pagerIndex = parseInt(pagerLink.attr('data-slide-index'));
            // if clicked pager link is not active, continue with the goToSlide call
            if (pagerIndex != slider.active.index) el.goToSlide(pagerIndex);
            e.preventDefault();
        }

        /**
        * Updates the pager links with an active class
        *
        * @param slideIndex (int)
        *  - index of slide to make active
        */
        var updatePagerActive = function (slideIndex) {
            // if "short" pager type
            var len = slider.children.length; // nb of children
            if (slider.settings.pagerType == 'short') {
                if (slider.settings.maxSlides > 1) {
                    len = Math.ceil(slider.children.length / slider.settings.maxSlides);
                }
                slider.pagerEl.html((slideIndex + 1) + slider.settings.pagerShortSeparator + len);
                return;
            }
            // remove all pager active classes
            slider.pagerEl.find('a').removeClass('active');
            // apply the active class for all pagers
            slider.pagerEl.each(function (i, el) { $(el).find('a').eq(slideIndex).addClass('active'); });
        }

        /**
        * Performs needed actions after a slide transition
        */
        var updateAfterSlideTransition = function () {
            // if infinte loop is true
            if (slider.settings.infiniteLoop) {
                var position = '';
                // first slide
                if (slider.active.index == 0) {
                    // set the new position
                    position = slider.children.eq(0).position();
                    // carousel, last slide
                } else if (slider.active.index == getPagerQty() - 1 && slider.carousel) {
                    position = slider.children.eq((getPagerQty() - 1) * getMoveBy()).position();
                    // last slide
                } else if (slider.active.index == slider.children.length - 1) {
                    position = slider.children.eq(slider.children.length - 1).position();
                }
                if (slider.settings.mode == 'horizontal') { setPositionProperty(-position.left, 'reset', 0);; }
                else if (slider.settings.mode == 'vertical') { setPositionProperty(-position.top, 'reset', 0);; }
            }
            // declare that the transition is complete
            slider.working = false;
            // onSlideAfter callback
            slider.settings.onSlideAfter(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
        }

        /**
        * Updates the auto controls state (either active, or combined switch)
        *
        * @param state (string) "start", "stop"
        *  - the new state of the auto show
        */
        var updateAutoControls = function (state) {
            // if autoControlsCombine is true, replace the current control with the new state
            if (slider.settings.autoControlsCombine) {
                slider.controls.autoEl.html(slider.controls[state]);
                // if autoControlsCombine is false, apply the "active" class to the appropriate control
            } else {
                slider.controls.autoEl.find('a').removeClass('active');
                slider.controls.autoEl.find('a:not(.bx-' + state + ')').addClass('active');
            }
        }

        /**
        * Updates the direction controls (checks if either should be hidden)
        */
        var updateDirectionControls = function () {
            if (getPagerQty() == 1) {
                slider.controls.prev.addClass('disabled');
                slider.controls.next.addClass('disabled');
            } else if (!slider.settings.infiniteLoop && slider.settings.hideControlOnEnd) {
                // if first slide
                if (slider.active.index == 0) {
                    slider.controls.prev.addClass('disabled');
                    slider.controls.next.removeClass('disabled');
                    // if last slide
                } else if (slider.active.index == getPagerQty() - 1) {
                    slider.controls.next.addClass('disabled');
                    slider.controls.prev.removeClass('disabled');
                    // if any slide in the middle
                } else {
                    slider.controls.prev.removeClass('disabled');
                    slider.controls.next.removeClass('disabled');
                }
            }
        }

        /**
        * Initialzes the auto process
        */
        var initAuto = function () {
            // if autoDelay was supplied, launch the auto show using a setTimeout() call
            if (slider.settings.autoDelay > 0) {
                var timeout = setTimeout(el.startAuto, slider.settings.autoDelay);
                // if autoDelay was not supplied, start the auto show normally
            } else {
                el.startAuto();
            }
            // if autoHover is requested
            if (slider.settings.autoHover) {
                // on el hover
                el.hover(function () {
                    // if the auto show is currently playing (has an active interval)
                    if (slider.interval) {
                        // stop the auto show and pass true agument which will prevent control update
                        el.stopAuto(true);
                        // create a new autoPaused value which will be used by the relative "mouseout" event
                        slider.autoPaused = true;
                    }
                }, function () {
                    // if the autoPaused value was created be the prior "mouseover" event
                    if (slider.autoPaused) {
                        // start the auto show and pass true agument which will prevent control update
                        el.startAuto(true);
                        // reset the autoPaused value
                        slider.autoPaused = null;
                    }
                });
            }
        }

        /**
        * Initialzes the ticker process
        */
        var initTicker = function () {
            var startPosition = 0;
            // if autoDirection is "next", append a clone of the entire slider
            if (slider.settings.autoDirection == 'next') {
                el.append(slider.children.clone().addClass('bx-clone'));
                // if autoDirection is "prev", prepend a clone of the entire slider, and set the left position
            } else {
                el.prepend(slider.children.clone().addClass('bx-clone'));
                var position = slider.children.first().position();
                startPosition = slider.settings.mode == 'horizontal' ? -position.left : -position.top;
            }
            setPositionProperty(startPosition, 'reset', 0);
            // do not allow controls in ticker mode
            slider.settings.pager = false;
            slider.settings.controls = false;
            slider.settings.autoControls = false;
            // if autoHover is requested
            if (slider.settings.tickerHover && !slider.usingCSS) {
                // on el hover
                slider.viewport.hover(function () {
                    el.stop();
                }, function () {
                    // calculate the total width of children (used to calculate the speed ratio)
                    var totalDimens = 0;
                    slider.children.each(function (index) {
                        totalDimens += slider.settings.mode == 'horizontal' ? $(this).outerWidth(true) : $(this).outerHeight(true);
                    });
                    // calculate the speed ratio (used to determine the new speed to finish the paused animation)
                    var ratio = slider.settings.speed / totalDimens;
                    // determine which property to use
                    var property = slider.settings.mode == 'horizontal' ? 'left' : 'top';
                    // calculate the new speed
                    var newSpeed = ratio * (totalDimens - (Math.abs(parseInt(el.css(property)))));
                    tickerLoop(newSpeed);
                });
            }
            // start the ticker loop
            tickerLoop();
        }

        /**
        * Runs a continuous loop, news ticker-style
        */
        var tickerLoop = function (resumeSpeed) {
            speed = resumeSpeed ? resumeSpeed : slider.settings.speed;
            var position = { left: 0, top: 0 };
            var reset = { left: 0, top: 0 };
            // if "next" animate left position to last child, then reset left to 0
            if (slider.settings.autoDirection == 'next') {
                position = el.find('.bx-clone').first().position();
                // if "prev" animate left position to 0, then reset left to first non-clone child
            } else {
                reset = slider.children.first().position();
            }
            var animateProperty = slider.settings.mode == 'horizontal' ? -position.left : -position.top;
            var resetValue = slider.settings.mode == 'horizontal' ? -reset.left : -reset.top;
            var params = { resetValue: resetValue };
            setPositionProperty(animateProperty, 'ticker', speed, params);
        }

        /**
        * Initializes touch events
        */
        var initTouch = function () {
            // initialize object to contain all touch values
            slider.touch = {
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 }
            }
            slider.viewport.bind('touchstart', onTouchStart);
        }

        /**
        * Event handler for "touchstart"
        *
        * @param e (event)
        *  - DOM event object
        */
        var onTouchStart = function (e) {
            if (slider.working) {
                e.preventDefault();
            } else {
                // record the original position when touch starts
                slider.touch.originalPos = el.position();
                var orig = e.originalEvent;
                // record the starting touch x, y coordinates
                slider.touch.start.x = orig.changedTouches[0].pageX;
                slider.touch.start.y = orig.changedTouches[0].pageY;
                // bind a "touchmove" event to the viewport
                slider.viewport.bind('touchmove', onTouchMove);
                // bind a "touchend" event to the viewport
                slider.viewport.bind('touchend', onTouchEnd);
            }
        }

        /**
        * Event handler for "touchmove"
        *
        * @param e (event)
        *  - DOM event object
        */
        var onTouchMove = function (e) {
            var orig = e.originalEvent;
            // if scrolling on y axis, do not prevent default
            var xMovement = Math.abs(orig.changedTouches[0].pageX - slider.touch.start.x);
            var yMovement = Math.abs(orig.changedTouches[0].pageY - slider.touch.start.y);
            // x axis swipe
            if ((xMovement * 3) > yMovement && slider.settings.preventDefaultSwipeX) {
                e.preventDefault();
                // y axis swipe
            } else if ((yMovement * 3) > xMovement && slider.settings.preventDefaultSwipeY) {
                e.preventDefault();
            }
            if (slider.settings.mode != 'fade' && slider.settings.oneToOneTouch) {
                var value = 0;
                // if horizontal, drag along x axis
                if (slider.settings.mode == 'horizontal') {
                    var change = orig.changedTouches[0].pageX - slider.touch.start.x;
                    value = slider.touch.originalPos.left + change;
                    // if vertical, drag along y axis
                } else {
                    var change = orig.changedTouches[0].pageY - slider.touch.start.y;
                    value = slider.touch.originalPos.top + change;
                }
                setPositionProperty(value, 'reset', 0);
            }
        }

        /**
        * Event handler for "touchend"
        *
        * @param e (event)
        *  - DOM event object
        */
        var onTouchEnd = function (e) {
            slider.viewport.unbind('touchmove', onTouchMove);
            var orig = e.originalEvent;
            var value = 0;
            // record end x, y positions
            slider.touch.end.x = orig.changedTouches[0].pageX;
            slider.touch.end.y = orig.changedTouches[0].pageY;
            // if fade mode, check if absolute x distance clears the threshold
            if (slider.settings.mode == 'fade') {
                var distance = Math.abs(slider.touch.start.x - slider.touch.end.x);
                if (distance >= slider.settings.swipeThreshold) {
                    slider.touch.start.x > slider.touch.end.x ? el.goToNextSlide() : el.goToPrevSlide();
                    el.stopAuto();
                }
                // not fade mode
            } else {
                var distance = 0;
                // calculate distance and el's animate property
                if (slider.settings.mode == 'horizontal') {
                    distance = slider.touch.end.x - slider.touch.start.x;
                    value = slider.touch.originalPos.left;
                } else {
                    distance = slider.touch.end.y - slider.touch.start.y;
                    value = slider.touch.originalPos.top;
                }
                // if not infinite loop and first / last slide, do not attempt a slide transition
                if (!slider.settings.infiniteLoop && ((slider.active.index == 0 && distance > 0) || (slider.active.last && distance < 0))) {
                    setPositionProperty(value, 'reset', 200);
                } else {
                    // check if distance clears threshold
                    if (Math.abs(distance) >= slider.settings.swipeThreshold) {
                        distance < 0 ? el.goToNextSlide() : el.goToPrevSlide();
                        el.stopAuto();
                    } else {
                        // el.animate(property, 200);
                        setPositionProperty(value, 'reset', 200);
                    }
                }
            }
            slider.viewport.unbind('touchend', onTouchEnd);
        }

        /**
        * Window resize event callback
        */
        var resizeWindow = function (e) {
            // get the new window dimens (again, thank you IE)
            var windowWidthNew = $(window).width();
            var windowHeightNew = $(window).height();
            // make sure that it is a true window resize
            // *we must check this because our dinosaur friend IE fires a window resize event when certain DOM elements
            // are resized. Can you just die already?*
            if (windowWidth != windowWidthNew || windowHeight != windowHeightNew) {
                // set the new window dimens
                windowWidth = windowWidthNew;
                windowHeight = windowHeightNew;
                // update all dynamic elements
                el.redrawSlider();
            }
        }

        /**
        * ===================================================================================
        * = PUBLIC FUNCTIONS
        * ===================================================================================
        */

        /**
        * Performs slide transition to the specified slide
        *
        * @param slideIndex (int)
        *  - the destination slide's index (zero-based)
        *
        * @param direction (string)
        *  - INTERNAL USE ONLY - the direction of travel ("prev" / "next")
        */
        el.goToSlide = function (slideIndex, direction) {
            // if plugin is currently in motion, ignore request
            if (slider.working || slider.active.index == slideIndex) return;
            // declare that plugin is in motion
            slider.working = true;
            // store the old index
            slider.oldIndex = slider.active.index;
            // if slideIndex is less than zero, set active index to last child (this happens during infinite loop)
            if (slideIndex < 0) {
                slider.active.index = getPagerQty() - 1;
                // if slideIndex is greater than children length, set active index to 0 (this happens during infinite loop)
            } else if (slideIndex >= getPagerQty()) {
                slider.active.index = 0;
                // set active index to requested slide
            } else {
                slider.active.index = slideIndex;
            }
            // onSlideBefore, onSlideNext, onSlidePrev callbacks
            slider.settings.onSlideBefore(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
            if (direction == 'next') {
                slider.settings.onSlideNext(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
            } else if (direction == 'prev') {
                slider.settings.onSlidePrev(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
            }
            // check if last slide
            slider.active.last = slider.active.index >= getPagerQty() - 1;
            // update the pager with active class
            if (slider.settings.pager) updatePagerActive(slider.active.index);
            // // check for direction control update
            if (slider.settings.controls) updateDirectionControls();
            // if slider is set to mode: "fade"
            if (slider.settings.mode == 'fade') {
                // if adaptiveHeight is true and next height is different from current height, animate to the new height
                if (slider.settings.adaptiveHeight && slider.viewport.height() != getViewportHeight()) {
                    slider.viewport.animate({ height: getViewportHeight() }, slider.settings.adaptiveHeightSpeed);
                }
                // fade out the visible child and reset its z-index value
                slider.children.filter(':visible').fadeOut(slider.settings.speed).css({ zIndex: 0 });
                // fade in the newly requested slide
                slider.children.eq(slider.active.index).css('zIndex', 51).fadeIn(slider.settings.speed, function () {
                    $(this).css('zIndex', 50);
                    updateAfterSlideTransition();
                });
                // slider mode is not "fade"
            } else {
                // if adaptiveHeight is true and next height is different from current height, animate to the new height
                if (slider.settings.adaptiveHeight && slider.viewport.height() != getViewportHeight()) {
                    slider.viewport.animate({ height: getViewportHeight() }, slider.settings.adaptiveHeightSpeed);
                }
                var moveBy = 0;
                var position = { left: 0, top: 0 };
                // if carousel and not infinite loop
                if (!slider.settings.infiniteLoop && slider.carousel && slider.active.last) {
                    if (slider.settings.mode == 'horizontal') {
                        // get the last child position
                        var lastChild = slider.children.eq(slider.children.length - 1);
                        position = lastChild.position();
                        // calculate the position of the last slide
                        moveBy = slider.viewport.width() - lastChild.outerWidth();
                    } else {
                        // get last showing index position
                        var lastShowingIndex = slider.children.length - slider.settings.minSlides;
                        position = slider.children.eq(lastShowingIndex).position();
                    }
                    // horizontal carousel, going previous while on first slide (infiniteLoop mode)
                } else if (slider.carousel && slider.active.last && direction == 'prev') {
                    // get the last child position
                    var eq = slider.settings.moveSlides == 1 ? slider.settings.maxSlides - getMoveBy() : ((getPagerQty() - 1) * getMoveBy()) - (slider.children.length - slider.settings.maxSlides);
                    var lastChild = el.children('.bx-clone').eq(eq);
                    position = lastChild.position();
                    // if infinite loop and "Next" is clicked on the last slide
                } else if (direction == 'next' && slider.active.index == 0) {
                    // get the last clone position
                    position = el.find('> .bx-clone').eq(slider.settings.maxSlides).position();
                    slider.active.last = false;
                    // normal non-zero requests
                } else if (slideIndex >= 0) {
                    var requestEl = slideIndex * getMoveBy();
                    position = slider.children.eq(requestEl).position();
                }

                /* If the position doesn't exist
                * (e.g. if you destroy the slider on a next click),
                * it doesn't throw an error.
                */
                if ("undefined" !== typeof (position)) {
                    var value = slider.settings.mode == 'horizontal' ? -(position.left - moveBy) : -position.top;
                    // plugin values to be animated
                    setPositionProperty(value, 'slide', slider.settings.speed);
                }
            }
        }

        /**
        * Transitions to the next slide in the show
        */
        el.goToNextSlide = function () {
            // if infiniteLoop is false and last page is showing, disregard call
            if (!slider.settings.infiniteLoop && slider.active.last) return;
            var pagerIndex = parseInt(slider.active.index) + 1;
            el.goToSlide(pagerIndex, 'next');
        }

        /**
        * Transitions to the prev slide in the show
        */
        el.goToPrevSlide = function () {
            // if infiniteLoop is false and last page is showing, disregard call
            if (!slider.settings.infiniteLoop && slider.active.index == 0) return;
            var pagerIndex = parseInt(slider.active.index) - 1;
            el.goToSlide(pagerIndex, 'prev');
        }

        /**
        * Starts the auto show
        *
        * @param preventControlUpdate (boolean)
        *  - if true, auto controls state will not be updated
        */
        el.startAuto = function (preventControlUpdate) {
            // if an interval already exists, disregard call
            if (slider.interval) return;
            // create an interval
            slider.interval = setInterval(function () {
                slider.settings.autoDirection == 'next' ? el.goToNextSlide() : el.goToPrevSlide();
            }, slider.settings.pause);
            // if auto controls are displayed and preventControlUpdate is not true
            if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('stop');
        }

        /**
        * Stops the auto show
        *
        * @param preventControlUpdate (boolean)
        *  - if true, auto controls state will not be updated
        */
        el.stopAuto = function (preventControlUpdate) {
            // if no interval exists, disregard call
            if (!slider.interval) return;
            // clear the interval
            clearInterval(slider.interval);
            slider.interval = null;
            // if auto controls are displayed and preventControlUpdate is not true
            if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('start');
        }

        /**
        * Returns current slide index (zero-based)
        */
        el.getCurrentSlide = function () {
            return slider.active.index;
        }

        /**
        * Returns number of slides in show
        */
        el.getSlideCount = function () {
            return slider.children.length;
        }

        /**
        * Update all dynamic slider elements
        */
        el.redrawSlider = function () {
            // resize all children in ratio to new screen size
            slider.children.add(el.find('.bx-clone')).outerWidth(getSlideWidth());
            // adjust the height
            slider.viewport.css('height', getViewportHeight());
            // update the slide position
            if (!slider.settings.ticker) setSlidePosition();
            // if active.last was true before the screen resize, we want
            // to keep it last no matter what screen size we end on
            if (slider.active.last) slider.active.index = getPagerQty() - 1;
            // if the active index (page) no longer exists due to the resize, simply set the index as last
            if (slider.active.index >= getPagerQty()) slider.active.last = true;
            // if a pager is being displayed and a custom pager is not being used, update it
            if (slider.settings.pager && !slider.settings.pagerCustom) {
                populatePager();
                updatePagerActive(slider.active.index);
            }
        }

        /**
        * Destroy the current instance of the slider (revert everything back to original state)
        */
        el.destroySlider = function () {
            // don't do anything if slider has already been destroyed
            if (!slider.initialized) return;
            slider.initialized = false;
            $('.bx-clone', this).remove();
            slider.children.each(function () {
                $(this).data("origStyle") != undefined ? $(this).attr("style", $(this).data("origStyle")) : $(this).removeAttr('style');
            });
            $(this).data("origStyle") != undefined ? this.attr("style", $(this).data("origStyle")) : $(this).removeAttr('style');
            $(this).unwrap().unwrap();
            if (slider.controls.el) slider.controls.el.remove();
            if (slider.controls.next) slider.controls.next.remove();
            if (slider.controls.prev) slider.controls.prev.remove();
            if (slider.pagerEl) slider.pagerEl.remove();
            $('.bx-caption', this).remove();
            if (slider.controls.autoEl) slider.controls.autoEl.remove();
            clearInterval(slider.interval);
            if (slider.settings.responsive) $(window).unbind('resize', resizeWindow);
        }

        /**
        * Reload the slider (revert all DOM changes, and re-initialize)
        */
        el.reloadSlider = function (settings) {
            if (settings != undefined) options = settings;
            el.destroySlider();
            init();
        }

        init();

        // returns the current jQuery object
        return this;
    }

})(jQuery);



/*
* jQuery Nivo Slider v3.1
* http://nivo.dev7studios.com
*
* Copyright 2012, Dev7studios
* Free to use and abuse under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
*/

(function ($) {
    var NivoSlider = function (element, options) {
        // Defaults are below
        var settings = $.extend({}, $.fn.nivoSlider.defaults, options);

        // Useful variables. Play carefully.
        var vars = {
            currentSlide: 0,
            currentImage: '',
            totalSlides: 0,
            running: false,
            paused: false,
            stop: false,
            controlNavEl: false
        };

        // Get this slider
        var slider = $(element);
        slider.data('nivo:vars', vars).addClass('nivoSlider');

        // Find our slider children
        var kids = slider.children();
        kids.each(function () {
            var child = $(this);
            var link = '';
            if (!child.is('img')) {
                if (child.is('a')) {
                    child.addClass('nivo-imageLink');
                    link = child;
                }
                child = child.find('img:first');
            }
            // Get img width & height
            var childWidth = (childWidth === 0) ? child.attr('width') : child.width(),
                childHeight = (childHeight === 0) ? child.attr('height') : child.height();

            if (link !== '') {
                link.css('display', 'none');
            }
            child.css('display', 'none');
            vars.totalSlides++;
        });

        // If randomStart
        if (settings.randomStart) {
            settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
        }

        // Set startSlide
        if (settings.startSlide > 0) {
            if (settings.startSlide >= vars.totalSlides) { settings.startSlide = vars.totalSlides - 1; }
            vars.currentSlide = settings.startSlide;
        }

        // Get initial image
        if ($(kids[vars.currentSlide]).is('img')) {
            vars.currentImage = $(kids[vars.currentSlide]);
        } else {
            vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
        }

        // Show initial link
        if ($(kids[vars.currentSlide]).is('a')) {
            $(kids[vars.currentSlide]).css('display', 'block');
        }

        // Set first background
        var sliderImg = $('<img class="nivo-main-image" src="#" />');
        sliderImg.attr('src', vars.currentImage.attr('src')).show();
        slider.append(sliderImg);

        // Detect Window Resize
        $(window).resize(function () {
            slider.children('img').width(slider.width());
            sliderImg.attr('src', vars.currentImage.attr('src'));
            sliderImg.stop().height('auto');
            $('.nivo-slice').remove();
            $('.nivo-box').remove();
        });

        //Create caption
        slider.append($('<div class="nivo-caption"></div>'));

        // Process caption function
        var processCaption = function (settings) {
            var nivoCaption = $('.nivo-caption', slider);
            if (vars.currentImage.attr('title') != '' && vars.currentImage.attr('title') != undefined) {
                var title = vars.currentImage.attr('title');
                if (title.substr(0, 1) == '#') title = $(title).html();

                if (nivoCaption.css('display') == 'block') {
                    setTimeout(function () {
                        nivoCaption.html(title);
                    }, settings.animSpeed);
                } else {
                    nivoCaption.html(title);
                    nivoCaption.stop().fadeIn(settings.animSpeed);
                }
            } else {
                nivoCaption.stop().fadeOut(settings.animSpeed);
            }
        }

        //Process initial  caption
        processCaption(settings);

        // In the words of Super Mario "let's a go!"
        var timer = 0;
        if (!settings.manualAdvance && kids.length > 1) {
            timer = setInterval(function () { nivoRun(slider, kids, settings, false); }, settings.pauseTime);
        }

        // Add Direction nav
        if (settings.directionNav) {
            slider.append('<div class="nivo-directionNav"><a class="nivo-prevNav">' + settings.prevText + '</a><a class="nivo-nextNav">' + settings.nextText + '</a></div>');

            $('a.nivo-prevNav', slider).live('click', function () {
                if (vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                vars.currentSlide -= 2;
                nivoRun(slider, kids, settings, 'prev');
            });

            $('a.nivo-nextNav', slider).live('click', function () {
                if (vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                nivoRun(slider, kids, settings, 'next');
            });
        }

        // Add Control nav
        if (settings.controlNav) {
            vars.controlNavEl = $('<div class="nivo-controlNav"></div>');
            slider.after(vars.controlNavEl);
            for (var i = 0; i < kids.length; i++) {
                if (settings.controlNavThumbs) {
                    vars.controlNavEl.addClass('nivo-thumbs-enabled');
                    var child = kids.eq(i);
                    if (!child.is('img')) {
                        child = child.find('img:first');
                    }
                    if (child.attr('data-thumb')) vars.controlNavEl.append('<a class="nivo-control" rel="' + i + '"><img src="' + child.attr('data-thumb') + '" alt="" /></a>');
                } else {
                    vars.controlNavEl.append('<a class="nivo-control" rel="' + i + '">' + (i + 1) + '</a>');
                }
            }

            //Set initial active link
            $('a:eq(' + vars.currentSlide + ')', vars.controlNavEl).addClass('active');

            $('a', vars.controlNavEl).bind('click', function () {
                if (vars.running) return false;
                if ($(this).hasClass('active')) return false;
                clearInterval(timer);
                timer = '';
                sliderImg.attr('src', vars.currentImage.attr('src'));
                vars.currentSlide = $(this).attr('rel') - 1;
                nivoRun(slider, kids, settings, 'control');
            });
        }

        //For pauseOnHover setting
        if (settings.pauseOnHover) {
            slider.hover(function () {
                vars.paused = true;
                clearInterval(timer);
                timer = '';
            }, function () {
                vars.paused = false;
                // Restart the timer
                if (timer === '' && !settings.manualAdvance) {
                    timer = setInterval(function () { nivoRun(slider, kids, settings, false); }, settings.pauseTime);
                }
            });
        }

        // Event when Animation finishes
        slider.bind('nivo:animFinished', function () {
            sliderImg.attr('src', vars.currentImage.attr('src'));
            vars.running = false;
            // Hide child links
            $(kids).each(function () {
                if ($(this).is('a')) {
                    $(this).css('display', 'none');
                }
            });
            // Show current link
            if ($(kids[vars.currentSlide]).is('a')) {
                $(kids[vars.currentSlide]).css('display', 'block');
            }
            // Restart the timer
            if (timer === '' && !vars.paused && !settings.manualAdvance) {
                timer = setInterval(function () { nivoRun(slider, kids, settings, false); }, settings.pauseTime);
            }
            // Trigger the afterChange callback
            settings.afterChange.call(this);
        });

        // Add slices for slice animations
        var createSlices = function (slider, settings, vars) {
            if ($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display', 'block');
            $('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var sliceHeight = ($('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').parent().is('a')) ? $('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').parent().height() : $('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').height();

            for (var i = 0; i < settings.slices; i++) {
                var sliceWidth = Math.round(slider.width() / settings.slices);

                if (i === settings.slices - 1) {
                    slider.append(
                        $('<div class="nivo-slice" name="' + i + '"><img src="' + vars.currentImage.attr('src') + '" style="position:absolute; width:' + slider.width() + 'px; height:auto; display:block !important; top:0; left:-' + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + 'px;" /></div>').css({
                            left: (sliceWidth * i) + 'px',
                            width: (slider.width() - (sliceWidth * i)) + 'px',
                            height: sliceHeight + 'px',
                            opacity: '0',
                            overflow: 'hidden'
                        })
                    );
                } else {
                    slider.append(
                        $('<div class="nivo-slice" name="' + i + '"><img src="' + vars.currentImage.attr('src') + '" style="position:absolute; width:' + slider.width() + 'px; height:auto; display:block !important; top:0; left:-' + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + 'px;" /></div>').css({
                            left: (sliceWidth * i) + 'px',
                            width: sliceWidth + 'px',
                            height: sliceHeight + 'px',
                            opacity: '0',
                            overflow: 'hidden'
                        })
                    );
                }
            }

            $('.nivo-slice', slider).height(sliceHeight);
            sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        };

        // Add boxes for box animations
        var createBoxes = function (slider, settings, vars) {
            if ($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display', 'block');
            $('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var boxWidth = Math.round(slider.width() / settings.boxCols),
                boxHeight = Math.round($('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').height() / settings.boxRows);


            for (var rows = 0; rows < settings.boxRows; rows++) {
                for (var cols = 0; cols < settings.boxCols; cols++) {
                    if (cols === settings.boxCols - 1) {
                        slider.append(
                            $('<div class="nivo-box" name="' + cols + '" rel="' + rows + '"><img src="' + vars.currentImage.attr('src') + '" style="position:absolute; width:' + slider.width() + 'px; height:auto; display:block; top:-' + (boxHeight * rows) + 'px; left:-' + (boxWidth * cols) + 'px;" /></div>').css({
                                opacity: 0,
                                left: (boxWidth * cols) + 'px',
                                top: (boxHeight * rows) + 'px',
                                width: (slider.width() - (boxWidth * cols)) + 'px'

                            })
                        );
                        $('.nivo-box[name="' + cols + '"]', slider).height($('.nivo-box[name="' + cols + '"] img', slider).height() + 'px');
                    } else {
                        slider.append(
                            $('<div class="nivo-box" name="' + cols + '" rel="' + rows + '"><img src="' + vars.currentImage.attr('src') + '" style="position:absolute; width:' + slider.width() + 'px; height:auto; display:block; top:-' + (boxHeight * rows) + 'px; left:-' + (boxWidth * cols) + 'px;" /></div>').css({
                                opacity: 0,
                                left: (boxWidth * cols) + 'px',
                                top: (boxHeight * rows) + 'px',
                                width: boxWidth + 'px'
                            })
                        );
                        $('.nivo-box[name="' + cols + '"]', slider).height($('.nivo-box[name="' + cols + '"] img', slider).height() + 'px');
                    }
                }
            }

            sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        };

        // Private run method
        var nivoRun = function (slider, kids, settings, nudge) {
            // Get our vars
            var vars = slider.data('nivo:vars');

            // Trigger the lastSlide callback
            if (vars && (vars.currentSlide === vars.totalSlides - 1)) {
                settings.lastSlide.call(this);
            }

            // Stop
            if ((!vars || vars.stop) && !nudge) { return false; }

            // Trigger the beforeChange callback
            settings.beforeChange.call(this);

            // Set current background before change
            if (!nudge) {
                sliderImg.attr('src', vars.currentImage.attr('src'));
            } else {
                if (nudge === 'prev') {
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
                if (nudge === 'next') {
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
            }

            vars.currentSlide++;
            // Trigger the slideshowEnd callback
            if (vars.currentSlide === vars.totalSlides) {
                vars.currentSlide = 0;
                settings.slideshowEnd.call(this);
            }
            if (vars.currentSlide < 0) { vars.currentSlide = (vars.totalSlides - 1); }
            // Set vars.currentImage
            if ($(kids[vars.currentSlide]).is('img')) {
                vars.currentImage = $(kids[vars.currentSlide]);
            } else {
                vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
            }

            // Set active links
            if (settings.controlNav) {
                $('a', vars.controlNavEl).removeClass('active');
                $('a:eq(' + vars.currentSlide + ')', vars.controlNavEl).addClass('active');
            }

            // Process caption
            processCaption(settings);

            // Remove any slices from last transition
            $('.nivo-slice', slider).remove();

            // Remove any boxes from last transition
            $('.nivo-box', slider).remove();

            var currentEffect = settings.effect,
                anims = '';

            // Generate random effect
            if (settings.effect === 'random') {
                anims = new Array('sliceDownRight', 'sliceDownLeft', 'sliceUpRight', 'sliceUpLeft', 'sliceUpDown', 'sliceUpDownLeft', 'fold', 'fade',
                    'boxRandom', 'boxRain', 'boxRainReverse', 'boxRainGrow', 'boxRainGrowReverse');
                currentEffect = anims[Math.floor(Math.random() * (anims.length + 1))];
                if (currentEffect === undefined) { currentEffect = 'fade'; }
            }

            // Run random effect from specified set (eg: effect:'fold,fade')
            if (settings.effect.indexOf(',') !== -1) {
                anims = settings.effect.split(',');
                currentEffect = anims[Math.floor(Math.random() * (anims.length))];
                if (currentEffect === undefined) { currentEffect = 'fade'; }
            }

            // Custom transition as defined by "data-transition" attribute
            if (vars.currentImage.attr('data-transition')) {
                currentEffect = vars.currentImage.attr('data-transition');
            }

            // Run effects
            vars.running = true;
            var timeBuff = 0,
                i = 0,
                slices = '',
                firstSlice = '',
                totalBoxes = '',
                boxes = '';

            if (currentEffect === 'sliceDown' || currentEffect === 'sliceDownRight' || currentEffect === 'sliceDownLeft') {
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', slider);
                if (currentEffect === 'sliceDownLeft') { slices = $('.nivo-slice', slider)._reverse(); }

                slices.each(function () {
                    var slice = $(this);
                    slice.css({ 'top': '0px' });
                    if (i === settings.slices - 1) {
                        setTimeout(function () {
                            slice.animate({ opacity: '1.0' }, settings.animSpeed, '', function () { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function () {
                            slice.animate({ opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if (currentEffect === 'sliceUp' || currentEffect === 'sliceUpRight' || currentEffect === 'sliceUpLeft') {
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', slider);
                if (currentEffect === 'sliceUpLeft') { slices = $('.nivo-slice', slider)._reverse(); }

                slices.each(function () {
                    var slice = $(this);
                    slice.css({ 'bottom': '0px' });
                    if (i === settings.slices - 1) {
                        setTimeout(function () {
                            slice.animate({ opacity: '1.0' }, settings.animSpeed, '', function () { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function () {
                            slice.animate({ opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if (currentEffect === 'sliceUpDown' || currentEffect === 'sliceUpDownRight' || currentEffect === 'sliceUpDownLeft') {
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                var v = 0;
                slices = $('.nivo-slice', slider);
                if (currentEffect === 'sliceUpDownLeft') { slices = $('.nivo-slice', slider)._reverse(); }

                slices.each(function () {
                    var slice = $(this);
                    if (i === 0) {
                        slice.css('top', '0px');
                        i++;
                    } else {
                        slice.css('bottom', '0px');
                        i = 0;
                    }

                    if (v === settings.slices - 1) {
                        setTimeout(function () {
                            slice.animate({ opacity: '1.0' }, settings.animSpeed, '', function () { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function () {
                            slice.animate({ opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    v++;
                });
            } else if (currentEffect === 'fold') {
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;

                $('.nivo-slice', slider).each(function () {
                    var slice = $(this);
                    var origWidth = slice.width();
                    slice.css({ top: '0px', width: '0px' });
                    if (i === settings.slices - 1) {
                        setTimeout(function () {
                            slice.animate({ width: origWidth, opacity: '1.0' }, settings.animSpeed, '', function () { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function () {
                            slice.animate({ width: origWidth, opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if (currentEffect === 'fade') {
                createSlices(slider, settings, vars);

                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': slider.width() + 'px'
                });

                firstSlice.animate({ opacity: '1.0' }, (settings.animSpeed * 2), '', function () { slider.trigger('nivo:animFinished'); });
            } else if (currentEffect === 'slideInRight') {
                createSlices(slider, settings, vars);

                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': '0px',
                    'opacity': '1'
                });

                firstSlice.animate({ width: slider.width() + 'px' }, (settings.animSpeed * 2), '', function () { slider.trigger('nivo:animFinished'); });
            } else if (currentEffect === 'slideInLeft') {
                createSlices(slider, settings, vars);

                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': '0px',
                    'opacity': '1',
                    'left': '',
                    'right': '0px'
                });

                firstSlice.animate({ width: slider.width() + 'px' }, (settings.animSpeed * 2), '', function () {
                    // Reset positioning
                    firstSlice.css({
                        'left': '0px',
                        'right': ''
                    });
                    slider.trigger('nivo:animFinished');
                });
            } else if (currentEffect === 'boxRandom') {
                createBoxes(slider, settings, vars);

                totalBoxes = settings.boxCols * settings.boxRows;
                i = 0;
                timeBuff = 0;

                boxes = shuffle($('.nivo-box', slider));
                boxes.each(function () {
                    var box = $(this);
                    if (i === totalBoxes - 1) {
                        setTimeout(function () {
                            box.animate({ opacity: '1' }, settings.animSpeed, '', function () { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function () {
                            box.animate({ opacity: '1' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 20;
                    i++;
                });
            } else if (currentEffect === 'boxRain' || currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse') {
                createBoxes(slider, settings, vars);

                totalBoxes = settings.boxCols * settings.boxRows;
                i = 0;
                timeBuff = 0;

                // Split boxes into 2D array
                var rowIndex = 0;
                var colIndex = 0;
                var box2Darr = [];
                box2Darr[rowIndex] = [];
                boxes = $('.nivo-box', slider);
                if (currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrowReverse') {
                    boxes = $('.nivo-box', slider)._reverse();
                }
                boxes.each(function () {
                    box2Darr[rowIndex][colIndex] = $(this);
                    colIndex++;
                    if (colIndex === settings.boxCols) {
                        rowIndex++;
                        colIndex = 0;
                        box2Darr[rowIndex] = [];
                    }
                });

                // Run animation
                for (var cols = 0; cols < (settings.boxCols * 2); cols++) {
                    var prevCol = cols;
                    for (var rows = 0; rows < settings.boxRows; rows++) {
                        if (prevCol >= 0 && prevCol < settings.boxCols) {
                            /* Due to some weird JS bug with loop vars 
                            being used in setTimeout, this is wrapped
                            with an anonymous function call */
                            (function (row, col, time, i, totalBoxes) {
                                var box = $(box2Darr[row][col]);
                                var w = box.width();
                                var h = box.height();
                                if (currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse') {
                                    box.width(0).height(0);
                                }
                                if (i === totalBoxes - 1) {
                                    setTimeout(function () {
                                        box.animate({ opacity: '1', width: w, height: h }, settings.animSpeed / 1.3, '', function () { slider.trigger('nivo:animFinished'); });
                                    }, (100 + time));
                                } else {
                                    setTimeout(function () {
                                        box.animate({ opacity: '1', width: w, height: h }, settings.animSpeed / 1.3);
                                    }, (100 + time));
                                }
                            })(rows, prevCol, timeBuff, i, totalBoxes);
                            i++;
                        }
                        prevCol--;
                    }
                    timeBuff += 100;
                }
            }
        };

        // Shuffle an array
        var shuffle = function (arr) {
            for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i, 10), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        };

        // For debugging
        var trace = function (msg) {
            if (this.console && typeof console.log !== 'undefined') { console.log(msg); }
        };

        // Start / Stop
        this.stop = function () {
            if (!$(element).data('nivo:vars').stop) {
                $(element).data('nivo:vars').stop = true;
                trace('Stop Slider');
            }
        };

        this.start = function () {
            if ($(element).data('nivo:vars').stop) {
                $(element).data('nivo:vars').stop = false;
                trace('Start Slider');
            }
        };

        // Trigger the afterLoad callback
        settings.afterLoad.call(this);

        return this;
    };

    $.fn.nivoSlider = function (options) {
        return this.each(function (key, value) {
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('nivoslider')) { return element.data('nivoslider'); }
            // Pass options to plugin constructor
            var nivoslider = new NivoSlider(this, options);
            // Store plugin object in this element's data
            element.data('nivoslider', nivoslider);
        });
    };

    //Default settings
    $.fn.nivoSlider.defaults = {
        effect: 'random',
        slices: 12,
        boxCols: 8,
        boxRows: 4,
        animSpeed: 800,
        pauseTime: 3000,
        startSlide: 0,
        directionNav: true,
        controlNav: true,
        controlNavThumbs: false,
        pauseOnHover: true,
        manualAdvance: false,
        prevText: 'Prev',
        nextText: 'Next',
        randomStart: false,
        beforeChange: function () { },
        afterChange: function () { },
        slideshowEnd: function () { },
        lastSlide: function () { },
        afterLoad: function () { }
    };

    $.fn._reverse = [].reverse;

})(jQuery);


/*
* jQuery FlexSlider v2.1
* http://www.woothemes.com/flexslider/
*
* Copyright 2012 WooThemes
* Free to use under the GPLv2 license.
* http://www.gnu.org/licenses/gpl-2.0.html
*
* Contributing author: Tyler Smith (@mbmufffin)
*/

; (function ($) {

    //FlexSlider: Object Instance
    $.flexslider = function (el, options) {
        var slider = $(el),
            vars = $.extend({}, $.flexslider.defaults, options),
            namespace = vars.namespace,
            touch = ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch,
            eventType = (touch) ? "touchend" : "click",
            vertical = vars.direction === "vertical",
            reverse = vars.reverse,
            carousel = (vars.itemWidth > 0),
            fade = vars.animation === "fade",
            asNav = vars.asNavFor !== "",
            methods = {};

        // Store a reference to the slider object
        $.data(el, "flexslider", slider);

        // Privat slider methods
        methods = {
            init: function () {
                slider.animating = false;
                slider.currentSlide = vars.startAt;
                slider.animatingTo = slider.currentSlide;
                slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
                slider.containerSelector = vars.selector.substr(0, vars.selector.search(' '));
                slider.slides = $(vars.selector, slider);
                slider.container = $(slider.containerSelector, slider);
                slider.count = slider.slides.length;
                // SYNC:
                slider.syncExists = $(vars.sync).length > 0;
                // SLIDE:
                if (vars.animation === "slide") vars.animation = "swing";
                slider.prop = (vertical) ? "top" : "marginLeft";
                slider.args = {};
                // SLIDESHOW:
                slider.manualPause = false;
                // TOUCH/USECSS:
                slider.transitions = !vars.video && !fade && vars.useCSS && (function () {
                    var obj = document.createElement('div'),
                        props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
                    for (var i in props) {
                        if (obj.style[props[i]] !== undefined) {
                            slider.pfx = props[i].replace('Perspective', '').toLowerCase();
                            slider.prop = "-" + slider.pfx + "-transform";
                            return true;
                        }
                    }
                    return false;
                }());
                // CONTROLSCONTAINER:
                if (vars.controlsContainer !== "") slider.controlsContainer = $(vars.controlsContainer).length > 0 && $(vars.controlsContainer);
                // MANUAL:
                if (vars.manualControls !== "") slider.manualControls = $(vars.manualControls).length > 0 && $(vars.manualControls);

                // RANDOMIZE:
                if (vars.randomize) {
                    slider.slides.sort(function () { return (Math.round(Math.random()) - 0.5); });
                    slider.container.empty().append(slider.slides);
                }

                slider.doMath();

                // ASNAV:
                if (asNav) methods.asNav.setup();

                // INIT
                slider.setup("init");

                // CONTROLNAV:
                if (vars.controlNav) methods.controlNav.setup();

                // DIRECTIONNAV:
                if (vars.directionNav) methods.directionNav.setup();

                // KEYBOARD:
                if (vars.keyboard && ($(slider.containerSelector).length === 1 || vars.multipleKeyboard)) {
                    $(document).bind('keyup', function (event) {
                        var keycode = event.keyCode;
                        if (!slider.animating && (keycode === 39 || keycode === 37)) {
                            var target = (keycode === 39) ? slider.getTarget('next') :
                                (keycode === 37) ? slider.getTarget('prev') : false;
                            slider.flexAnimate(target, vars.pauseOnAction);
                        }
                    });
                }
                // MOUSEWHEEL:
                if (vars.mousewheel) {
                    slider.bind('mousewheel', function (event, delta, deltaX, deltaY) {
                        event.preventDefault();
                        var target = (delta < 0) ? slider.getTarget('next') : slider.getTarget('prev');
                        slider.flexAnimate(target, vars.pauseOnAction);
                    });
                }

                // PAUSEPLAY
                if (vars.pausePlay) methods.pausePlay.setup();

                // SLIDSESHOW
                if (vars.slideshow) {
                    if (vars.pauseOnHover) {
                        slider.hover(function () {
                            if (!slider.manualPlay && !slider.manualPause) slider.pause();
                        }, function () {
                            if (!slider.manualPause && !slider.manualPlay) slider.play();
                        });
                    }
                    // initialize animation
                    (vars.initDelay > 0) ? setTimeout(slider.play, vars.initDelay) : slider.play();
                }

                // TOUCH
                if (touch && vars.touch) methods.touch();

                // FADE&&SMOOTHHEIGHT || SLIDE:
                if (!fade || (fade && vars.smoothHeight)) $(window).bind("resize focus", methods.resize);


                // API: start() Callback
                setTimeout(function () {
                    vars.start(slider);
                }, 200);
            },
            asNav: {
                setup: function () {
                    slider.asNav = true;
                    slider.animatingTo = Math.floor(slider.currentSlide / slider.move);
                    slider.currentItem = slider.currentSlide;
                    slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");
                    slider.slides.click(function (e) {
                        e.preventDefault();
                        var $slide = $(this),
                            target = $slide.index();
                        if (!$(vars.asNavFor).data('flexslider').animating && !$slide.hasClass('active')) {
                            slider.direction = (slider.currentItem < target) ? "next" : "prev";
                            slider.flexAnimate(target, vars.pauseOnAction, false, true, true);
                        }
                    });
                }
            },
            controlNav: {
                setup: function () {
                    if (!slider.manualControls) {
                        methods.controlNav.setupPaging();
                    } else { // MANUALCONTROLS:
                        methods.controlNav.setupManual();
                    }
                },
                setupPaging: function () {
                    var type = (vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
                        j = 1,
                        item;

                    slider.controlNavScaffold = $('<ol class="' + namespace + 'control-nav ' + namespace + type + '"></ol>');

                    if (slider.pagingCount > 1) {
                        for (var i = 0; i < slider.pagingCount; i++) {
                            item = (vars.controlNav === "thumbnails") ? '<img src="' + slider.slides.eq(i).attr("data-thumb") + '"/>' : '<a>' + j + '</a>';
                            slider.controlNavScaffold.append('<li>' + item + '</li>');
                            j++;
                        }
                    }

                    // CONTROLSCONTAINER:
                    (slider.controlsContainer) ? $(slider.controlsContainer).append(slider.controlNavScaffold) : slider.append(slider.controlNavScaffold);
                    methods.controlNav.set();

                    methods.controlNav.active();

                    slider.controlNavScaffold.delegate('a, img', eventType, function (event) {
                        event.preventDefault();
                        var $this = $(this),
                            target = slider.controlNav.index($this);

                        if (!$this.hasClass(namespace + 'active')) {
                            slider.direction = (target > slider.currentSlide) ? "next" : "prev";
                            slider.flexAnimate(target, vars.pauseOnAction);
                        }
                    });
                    // Prevent iOS click event bug
                    if (touch) {
                        slider.controlNavScaffold.delegate('a', "click touchstart", function (event) {
                            event.preventDefault();
                        });
                    }
                },
                setupManual: function () {
                    slider.controlNav = slider.manualControls;
                    methods.controlNav.active();

                    slider.controlNav.live(eventType, function (event) {
                        event.preventDefault();
                        var $this = $(this),
                            target = slider.controlNav.index($this);

                        if (!$this.hasClass(namespace + 'active')) {
                            (target > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
                            slider.flexAnimate(target, vars.pauseOnAction);
                        }
                    });
                    // Prevent iOS click event bug
                    if (touch) {
                        slider.controlNav.live("click touchstart", function (event) {
                            event.preventDefault();
                        });
                    }
                },
                set: function () {
                    var selector = (vars.controlNav === "thumbnails") ? 'img' : 'a';
                    slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
                },
                active: function () {
                    slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
                },
                update: function (action, pos) {
                    if (slider.pagingCount > 1 && action === "add") {
                        slider.controlNavScaffold.append($('<li><a>' + slider.count + '</a></li>'));
                    } else if (slider.pagingCount === 1) {
                        slider.controlNavScaffold.find('li').remove();
                    } else {
                        slider.controlNav.eq(pos).closest('li').remove();
                    }
                    methods.controlNav.set();
                    (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action) : methods.controlNav.active();
                }
            },
            directionNav: {
                setup: function () {
                    var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li><a class="' + namespace + 'prev" href="#">' + vars.prevText + '</a></li><li><a class="' + namespace + 'next" href="#">' + vars.nextText + '</a></li></ul>');

                    // CONTROLSCONTAINER:
                    if (slider.controlsContainer) {
                        $(slider.controlsContainer).append(directionNavScaffold);
                        slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
                    } else {
                        slider.append(directionNavScaffold);
                        slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
                    }

                    methods.directionNav.update();

                    slider.directionNav.bind(eventType, function (event) {
                        event.preventDefault();
                        var target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
                        slider.flexAnimate(target, vars.pauseOnAction);
                    });
                    // Prevent iOS click event bug
                    if (touch) {
                        slider.directionNav.bind("click touchstart", function (event) {
                            event.preventDefault();
                        });
                    }
                },
                update: function () {
                    var disabledClass = namespace + 'disabled';
                    if (slider.pagingCount === 1) {
                        slider.directionNav.addClass(disabledClass);
                    } else if (!vars.animationLoop) {
                        if (slider.animatingTo === 0) {
                            slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass);
                        } else if (slider.animatingTo === slider.last) {
                            slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass);
                        } else {
                            slider.directionNav.removeClass(disabledClass);
                        }
                    } else {
                        slider.directionNav.removeClass(disabledClass);
                    }
                }
            },
            pausePlay: {
                setup: function () {
                    var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a></a></div>');

                    // CONTROLSCONTAINER:
                    if (slider.controlsContainer) {
                        slider.controlsContainer.append(pausePlayScaffold);
                        slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
                    } else {
                        slider.append(pausePlayScaffold);
                        slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
                    }

                    methods.pausePlay.update((vars.slideshow) ? namespace + 'pause' : namespace + 'play');

                    slider.pausePlay.bind(eventType, function (event) {
                        event.preventDefault();
                        if ($(this).hasClass(namespace + 'pause')) {
                            slider.manualPause = true;
                            slider.manualPlay = false;
                            slider.pause();
                        } else {
                            slider.manualPause = false;
                            slider.manualPlay = true;
                            slider.play();
                        }
                    });
                    // Prevent iOS click event bug
                    if (touch) {
                        slider.pausePlay.bind("click touchstart", function (event) {
                            event.preventDefault();
                        });
                    }
                },
                update: function (state) {
                    (state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').text(vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').text(vars.pauseText);
                }
            },
            touch: function () {
                var startX,
                    startY,
                    offset,
                    cwidth,
                    dx,
                    startT,
                    scrolling = false;

                el.addEventListener('touchstart', onTouchStart, false);
                function onTouchStart(e) {
                    if (slider.animating) {
                        e.preventDefault();
                    } else if (e.touches.length === 1) {
                        slider.pause();
                        // CAROUSEL: 
                        cwidth = (vertical) ? slider.h : slider.w;
                        startT = Number(new Date());
                        // CAROUSEL:
                        offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                            (carousel && reverse) ? slider.limit - (((slider.itemW + vars.itemMargin) * slider.move) * slider.animatingTo) :
                                (carousel && slider.currentSlide === slider.last) ? slider.limit :
                                    (carousel) ? ((slider.itemW + vars.itemMargin) * slider.move) * slider.currentSlide :
                                        (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                        startX = (vertical) ? e.touches[0].pageY : e.touches[0].pageX;
                        startY = (vertical) ? e.touches[0].pageX : e.touches[0].pageY;

                        el.addEventListener('touchmove', onTouchMove, false);
                        el.addEventListener('touchend', onTouchEnd, false);
                    }
                }

                function onTouchMove(e) {
                    dx = (vertical) ? startX - e.touches[0].pageY : startX - e.touches[0].pageX;
                    scrolling = (vertical) ? (Math.abs(dx) < Math.abs(e.touches[0].pageX - startY)) : (Math.abs(dx) < Math.abs(e.touches[0].pageY - startY));

                    if (!scrolling || Number(new Date()) - startT > 500) {
                        e.preventDefault();
                        if (!fade && slider.transitions) {
                            if (!vars.animationLoop) {
                                dx = dx / ((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx) / cwidth + 2) : 1);
                            }
                            slider.setProps(offset + dx, "setTouch");
                        }
                    }
                }

                function onTouchEnd(e) {
                    // finish the touch by undoing the touch session
                    el.removeEventListener('touchmove', onTouchMove, false);

                    if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                        var updateDx = (reverse) ? -dx : dx,
                            target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                        if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
                            slider.flexAnimate(target, vars.pauseOnAction);
                        } else {
                            if (!fade) slider.flexAnimate(slider.currentSlide, vars.pauseOnAction, true);
                        }
                    }
                    el.removeEventListener('touchend', onTouchEnd, false);
                    startX = null;
                    startY = null;
                    dx = null;
                    offset = null;
                }
            },
            resize: function () {
                if (!slider.animating && slider.is(':visible')) {
                    if (!carousel) slider.doMath();

                    if (fade) {
                        // SMOOTH HEIGHT:
                        methods.smoothHeight();
                    } else if (carousel) { //CAROUSEL:
                        slider.slides.width(slider.computedW);
                        slider.update(slider.pagingCount);
                        slider.setProps();
                    }
                    else if (vertical) { //VERTICAL:
                        slider.viewport.height(slider.h);
                        slider.setProps(slider.h, "setTotal");
                    } else {
                        // SMOOTH HEIGHT:
                        if (vars.smoothHeight) methods.smoothHeight();
                        slider.newSlides.width(slider.computedW);
                        slider.setProps(slider.computedW, "setTotal");
                    }
                }
            },
            smoothHeight: function (dur) {
                if (!vertical || fade) {
                    var $obj = (fade) ? slider : slider.viewport;
                    (dur) ? $obj.animate({ "height": slider.slides.eq(slider.animatingTo).height() }, dur) : $obj.height(slider.slides.eq(slider.animatingTo).height());
                }
            },
            sync: function (action) {
                var $obj = $(vars.sync).data("flexslider"),
                    target = slider.animatingTo;

                switch (action) {
                    case "animate": $obj.flexAnimate(target, vars.pauseOnAction, false, true); break;
                    case "play": if (!$obj.playing && !$obj.asNav) { $obj.play(); } break;
                    case "pause": $obj.pause(); break;
                }
            }
        }

        // public methods
        slider.flexAnimate = function (target, pause, override, withSync, fromNav) {
            if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

            if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
                if (asNav && withSync) {
                    var master = $(vars.asNavFor).data('flexslider');
                    slider.atEnd = target === 0 || target === slider.count - 1;
                    master.flexAnimate(target, true, false, true, fromNav);
                    slider.direction = (slider.currentItem < target) ? "next" : "prev";
                    master.direction = slider.direction;

                    if (Math.ceil((target + 1) / slider.visible) - 1 !== slider.currentSlide && target !== 0) {
                        slider.currentItem = target;
                        slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
                        target = Math.floor(target / slider.visible);
                    } else {
                        slider.currentItem = target;
                        slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
                        return false;
                    }
                }

                slider.animating = true;
                slider.animatingTo = target;
                // API: before() animation Callback
                vars.before(slider);

                // SLIDESHOW:
                if (pause) slider.pause();

                // SYNC:
                if (slider.syncExists && !fromNav) methods.sync("animate");

                // CONTROLNAV
                if (vars.controlNav) methods.controlNav.active();

                // !CAROUSEL:
                // CANDIDATE: slide active class (for add/remove slide)
                if (!carousel) slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');

                // INFINITE LOOP:
                // CANDIDATE: atEnd
                slider.atEnd = target === 0 || target === slider.last;

                // DIRECTIONNAV:
                if (vars.directionNav) methods.directionNav.update();

                if (target === slider.last) {
                    // API: end() of cycle Callback
                    vars.end(slider);
                    // SLIDESHOW && !INFINITE LOOP:
                    if (!vars.animationLoop) slider.pause();
                }

                // SLIDE:
                if (!fade) {
                    var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
                        margin, slideString, calcNext;

                    // INFINITE LOOP / REVERSE:
                    if (carousel) {
                        margin = (vars.itemWidth > slider.w) ? vars.itemMargin * 2 : vars.itemMargin;
                        calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
                        slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
                    } else if (slider.currentSlide === 0 && target === slider.count - 1 && vars.animationLoop && slider.direction !== "next") {
                        slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
                    } else if (slider.currentSlide === slider.last && target === 0 && vars.animationLoop && slider.direction !== "prev") {
                        slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
                    } else {
                        slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
                    }
                    slider.setProps(slideString, "", vars.animationSpeed);
                    if (slider.transitions) {
                        if (!vars.animationLoop || !slider.atEnd) {
                            slider.animating = false;
                            slider.currentSlide = slider.animatingTo;
                        }
                        slider.container.unbind("webkitTransitionEnd transitionend");
                        slider.container.bind("webkitTransitionEnd transitionend", function () {
                            slider.wrapup(dimension);
                        });
                    } else {
                        slider.container.animate(slider.args, vars.animationSpeed, vars.easing, function () {
                            slider.wrapup(dimension);
                        });
                    }
                } else { // FADE:
                    if (!touch) {
                        slider.slides.eq(slider.currentSlide).fadeOut(vars.animationSpeed, vars.easing);
                        slider.slides.eq(target).fadeIn(vars.animationSpeed, vars.easing, slider.wrapup);
                    } else {
                        slider.slides.eq(slider.currentSlide).css({ "opacity": 0, "zIndex": 1 });
                        slider.slides.eq(target).css({ "opacity": 1, "zIndex": 2 });

                        slider.slides.unbind("webkitTransitionEnd transitionend");
                        slider.slides.eq(slider.currentSlide).bind("webkitTransitionEnd transitionend", function () {
                            // API: after() animation Callback
                            vars.after(slider);
                        });

                        slider.animating = false;
                        slider.currentSlide = slider.animatingTo;
                    }
                }
                // SMOOTH HEIGHT:
                if (vars.smoothHeight) methods.smoothHeight(vars.animationSpeed);
            }
        }
        slider.wrapup = function (dimension) {
            // SLIDE:
            if (!fade && !carousel) {
                if (slider.currentSlide === 0 && slider.animatingTo === slider.last && vars.animationLoop) {
                    slider.setProps(dimension, "jumpEnd");
                } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && vars.animationLoop) {
                    slider.setProps(dimension, "jumpStart");
                }
            }
            slider.animating = false;
            slider.currentSlide = slider.animatingTo;
            // API: after() animation Callback
            vars.after(slider);
        }

        // SLIDESHOW:
        slider.animateSlides = function () {
            if (!slider.animating) slider.flexAnimate(slider.getTarget("next"));
        }
        // SLIDESHOW:
        slider.pause = function () {
            clearInterval(slider.animatedSlides);
            slider.playing = false;
            // PAUSEPLAY:
            if (vars.pausePlay) methods.pausePlay.update("play");
            // SYNC:
            if (slider.syncExists) methods.sync("pause");
        }
        // SLIDESHOW:
        slider.play = function () {
            slider.animatedSlides = setInterval(slider.animateSlides, vars.slideshowSpeed);
            slider.playing = true;
            // PAUSEPLAY:
            if (vars.pausePlay) methods.pausePlay.update("pause");
            // SYNC:
            if (slider.syncExists) methods.sync("play");
        }
        slider.canAdvance = function (target, fromNav) {
            // ASNAV:
            var last = (asNav) ? slider.pagingCount - 1 : slider.last;
            return (fromNav) ? true :
                (asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
                    (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
                        (target === slider.currentSlide && !asNav) ? false :
                            (vars.animationLoop) ? true :
                                (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
                                    (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
                                        true;
        }
        slider.getTarget = function (dir) {
            slider.direction = dir;
            if (dir === "next") {
                return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
            } else {
                return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
            }
        }

        // SLIDE:
        slider.setProps = function (pos, special, dur) {
            var target = (function () {
                var posCheck = (pos) ? pos : ((slider.itemW + vars.itemMargin) * slider.move) * slider.animatingTo,
                    posCalc = (function () {
                        if (carousel) {
                            return (special === "setTouch") ? pos :
                                (reverse && slider.animatingTo === slider.last) ? 0 :
                                    (reverse) ? slider.limit - (((slider.itemW + vars.itemMargin) * slider.move) * slider.animatingTo) :
                                        (slider.animatingTo === slider.last) ? slider.limit : posCheck;
                        } else {
                            switch (special) {
                                case "setTotal": return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
                                case "setTouch": return (reverse) ? pos : pos;
                                case "jumpEnd": return (reverse) ? pos : slider.count * pos;
                                case "jumpStart": return (reverse) ? slider.count * pos : pos;
                                default: return pos;
                            }
                        }
                    }());
                return (posCalc * -1) + "px";
            }());

            if (slider.transitions) {
                target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + target + ",0,0)";
                dur = (dur !== undefined) ? (dur / 1000) + "s" : "0s";
                slider.container.css("-" + slider.pfx + "-transition-duration", dur);
            }

            slider.args[slider.prop] = target;
            if (slider.transitions || dur === undefined) slider.container.css(slider.args);
        }

        slider.setup = function (type) {
            // SLIDE:
            if (!fade) {
                var sliderOffset, arr;

                if (type === "init") {
                    slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({ "overflow": "hidden", "position": "relative" }).appendTo(slider).append(slider.container);
                    // INFINITE LOOP:
                    slider.cloneCount = 0;
                    slider.cloneOffset = 0;
                    // REVERSE:
                    if (reverse) {
                        arr = $.makeArray(slider.slides).reverse();
                        slider.slides = $(arr);
                        slider.container.empty().append(slider.slides);
                    }
                }
                // INFINITE LOOP && !CAROUSEL:
                if (vars.animationLoop && !carousel) {
                    slider.cloneCount = 2;
                    slider.cloneOffset = 1;
                    // clear out old clones
                    if (type !== "init") slider.container.find('.clone').remove();
                    slider.container.append(slider.slides.first().clone().addClass('clone')).prepend(slider.slides.last().clone().addClass('clone'));
                }
                slider.newSlides = $(vars.selector, slider);

                sliderOffset = (reverse) ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;
                // VERTICAL:
                if (vertical && !carousel) {
                    slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
                    setTimeout(function () {
                        slider.newSlides.css({ "display": "block" });
                        slider.doMath();
                        slider.viewport.height(slider.h);
                        slider.setProps(sliderOffset * slider.h, "init");
                    }, (type === "init") ? 100 : 0);
                } else {
                    slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
                    slider.setProps(sliderOffset * slider.computedW, "init");
                    setTimeout(function () {
                        slider.doMath();
                        slider.newSlides.css({ "width": slider.computedW, "float": "left", "display": "block" });
                        // SMOOTH HEIGHT:
                        if (vars.smoothHeight) methods.smoothHeight();
                    }, (type === "init") ? 100 : 0);
                }
            } else { // FADE: 
                slider.slides.css({ "width": "100%", "float": "left", "marginRight": "-100%", "position": "relative" });
                if (type === "init") {
                    if (!touch) {
                        slider.slides.eq(slider.currentSlide).fadeIn(vars.animationSpeed, vars.easing);
                    } else {
                        slider.slides.css({ "opacity": 0, "display": "block", "webkitTransition": "opacity " + vars.animationSpeed / 1000 + "s ease", "zIndex": 1 }).eq(slider.currentSlide).css({ "opacity": 1, "zIndex": 2 });
                    }
                }
                // SMOOTH HEIGHT:
                if (vars.smoothHeight) methods.smoothHeight();
            }
            // !CAROUSEL:
            // CANDIDATE: active slide
            if (!carousel) slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide");
        }

        slider.doMath = function () {
            var slide = slider.slides.first(),
                slideMargin = vars.itemMargin,
                minItems = vars.minItems,
                maxItems = vars.maxItems;

            slider.w = slider.width();
            slider.h = slide.height();
            slider.boxPadding = slide.outerWidth() - slide.width();

            // CAROUSEL:
            if (carousel) {
                slider.itemT = vars.itemWidth + slideMargin;
                slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
                slider.maxW = (maxItems) ? maxItems * slider.itemT : slider.w;
                slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * minItems)) / minItems :
                    (slider.maxW < slider.w) ? (slider.w - (slideMargin * maxItems)) / maxItems :
                        (vars.itemWidth > slider.w) ? slider.w : vars.itemWidth;
                slider.visible = Math.floor(slider.w / (slider.itemW + slideMargin));
                slider.move = (vars.move > 0 && vars.move < slider.visible) ? vars.move : slider.visible;
                slider.pagingCount = Math.ceil(((slider.count - slider.visible) / slider.move) + 1);
                slider.last = slider.pagingCount - 1;
                slider.limit = (slider.pagingCount === 1) ? 0 :
                    (vars.itemWidth > slider.w) ? ((slider.itemW + (slideMargin * 2)) * slider.count) - slider.w - slideMargin : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
            } else {
                slider.itemW = slider.w;
                slider.pagingCount = slider.count;
                slider.last = slider.count - 1;
            }
            slider.computedW = slider.itemW - slider.boxPadding;
        }

        slider.update = function (pos, action) {
            slider.doMath();

            // update currentSlide and slider.animatingTo if necessary
            if (!carousel) {
                if (pos < slider.currentSlide) {
                    slider.currentSlide += 1;
                } else if (pos <= slider.currentSlide && pos !== 0) {
                    slider.currentSlide -= 1;
                }
                slider.animatingTo = slider.currentSlide;
            }

            // update controlNav
            if (vars.controlNav && !slider.manualControls) {
                if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
                    methods.controlNav.update("add");
                } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
                    if (carousel && slider.currentSlide > slider.last) {
                        slider.currentSlide -= 1;
                        slider.animatingTo -= 1;
                    }
                    methods.controlNav.update("remove", slider.last);
                }
            }
            // update directionNav
            if (vars.directionNav) methods.directionNav.update();

        }

        slider.addSlide = function (obj, pos) {
            var $obj = $(obj);

            slider.count += 1;
            slider.last = slider.count - 1;

            // append new slide
            if (vertical && reverse) {
                (pos !== undefined) ? slider.slides.eq(slider.count - pos).after($obj) : slider.container.prepend($obj);
            } else {
                (pos !== undefined) ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
            }

            // update currentSlide, animatingTo, controlNav, and directionNav
            slider.update(pos, "add");

            // update slider.slides
            slider.slides = $(vars.selector + ':not(.clone)', slider);
            // re-setup the slider to accomdate new slide
            slider.setup();

            //FlexSlider: added() Callback
            vars.added(slider);
        }
        slider.removeSlide = function (obj) {
            var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

            // update count
            slider.count -= 1;
            slider.last = slider.count - 1;

            // remove slide
            if (isNaN(obj)) {
                $(obj, slider.slides).remove();
            } else {
                (vertical && reverse) ? slider.slides.eq(slider.last).remove() : slider.slides.eq(obj).remove();
            }

            // update currentSlide, animatingTo, controlNav, and directionNav
            slider.doMath();
            slider.update(pos, "remove");

            // update slider.slides
            slider.slides = $(vars.selector + ':not(.clone)', slider);
            // re-setup the slider to accomdate new slide
            slider.setup();

            // FlexSlider: removed() Callback
            vars.removed(slider);
        }

        //FlexSlider: Initialize
        methods.init();
    }

    //FlexSlider: Default Settings
    $.flexslider.defaults = {
        namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
        selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
        animation: "fade",              //String: Select your animation type, "fade" or "slide"
        easing: "swing",               //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
        direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
        reverse: false,                 //{NEW} Boolean: Reverse the animation direction
        animationLoop: true,             //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
        smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode  
        startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
        slideshow: true,                //Boolean: Animate slider automatically
        slideshowSpeed: 3200,           //Integer: Set the speed of the slideshow cycling, in milliseconds
        animationSpeed: 1200,            //Integer: Set the speed of animations, in milliseconds
        initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
        randomize: false,               //Boolean: Randomize slide order

        // Usability features
        pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
        pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
        useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
        touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
        video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

        // Primary Controls
        controlNav: true,               //Boolean: Create navigation for paging control of each clide? Note: Leave true for manualControls usage
        directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
        prevText: "Previous",           //String: Set the text for the "previous" directionNav item
        nextText: "Next",               //String: Set the text for the "next" directionNav item

        // Secondary Navigation
        keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
        multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
        mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
        pausePlay: false,               //Boolean: Create pause/play dynamic element
        pauseText: "Pause",             //String: Set the text for the "pause" pausePlay item
        playText: "Play",               //String: Set the text for the "play" pausePlay item

        // Special properties
        controlsContainer: "",          //{UPDATED} jQuery Object/Selector: Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be $(".flexslider-container"). Property is ignored if given element is not found.
        manualControls: "",             //{UPDATED} jQuery Object/Selector: Declare custom control navigation. Examples would be $(".flex-control-nav li") or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
        sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
        asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

        // Carousel Options
        itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
        itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
        minItems: 0,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
        maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
        move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.

        // Callback API
        start: function () { },            //Callback: function(slider) - Fires when the slider loads the first slide
        before: function () { },           //Callback: function(slider) - Fires asynchronously with each slider animation
        after: function () { },            //Callback: function(slider) - Fires after each slider animation completes
        end: function () { },              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
        added: function () { },            //{NEW} Callback: function(slider) - Fires after a slide is added
        removed: function () { }           //{NEW} Callback: function(slider) - Fires after a slide is removed
    }


    //FlexSlider: Plugin Function
    $.fn.flexslider = function (options) {
        if (options === undefined) options = {};

        if (typeof options === "object") {
            return this.each(function () {
                var $this = $(this),
                    selector = (options.selector) ? options.selector : ".slides > li",
                    $slides = $this.find(selector);

                if ($slides.length === 1) {
                    $slides.fadeIn(400);
                    if (options.start) options.start($this);
                } else if ($this.data('flexslider') == undefined) {
                    new $.flexslider(this, options);
                }
            });
        } else {
            // Helper strings to quickly perform functions on the slider
            var $slider = $(this).data('flexslider');
            switch (options) {
                case "play": $slider.play(); break;
                case "pause": $slider.pause(); break;
                case "next": $slider.flexAnimate($slider.getTarget("next"), true); break;
                case "prev":
                case "previous": $slider.flexAnimate($slider.getTarget("prev"), true); break;
                default: if (typeof options === "number") $slider.flexAnimate(options, true);
            }
        }
    }

})(jQuery);




/*
* File: jquery.flexisel.js
* Version: 1.0.2
* Description: Responsive carousel jQuery plugin
* Author: 9bit Studios
* Copyright 2012, 9bit Studios
* http://www.9bitstudios.com
* Free to use and abuse under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
*/
(function ($) {
    $.fn.flexisel = function (options) {

        var defaults = $.extend({
            visibleItems: 4,
            animationSpeed: 200,
            autoPlay: false,
            autoPlaySpeed: 3000,
            pauseOnHover: true,
            setMaxWidthAndHeight: false,
            enableResponsiveBreakpoints: true,
            clone: true,
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
        }, options);

        /******************************
        Private Variables
        *******************************/

        var object = $(this);
        var settings = $.extend(defaults, options);
        var itemsWidth; // Declare the global width of each item in carousel
        var canNavigate = true;
        var itemsVisible = settings.visibleItems; // Get visible items
        var totalItems = object.children().length; // Get number of elements
        var responsivePoints = [];

        /******************************
        Public Methods
        *******************************/
        var methods = {
            init: function () {
                return this.each(function () {
                    methods.appendHTML();
                    methods.setEventHandlers();
                    methods.initializeItems();
                });
            },

            /******************************
            Initialize Items
            Fully initialize everything. Plugin is loaded and ready after finishing execution
            *******************************/
            initializeItems: function () {

                var listParent = object.parent();
                var innerHeight = listParent.height();
                var childSet = object.children();
                methods.sortResponsiveObject(settings.responsiveBreakpoints);

                var innerWidth = listParent.width(); // Set widths
                itemsWidth = (innerWidth) / itemsVisible;
                childSet.width(itemsWidth);
                if (settings.clone) {
                    childSet.last().insertBefore(childSet.first());
                    childSet.last().insertBefore(childSet.first());
                    object.css({
                        'left': -itemsWidth
                    });
                }

                object.fadeIn();
                $(window).trigger("resize"); // needed to position arrows correctly

            },

            /******************************
            Append HTML
            Add additional markup needed by plugin to the DOM
            *******************************/
            appendHTML: function () {
                object.addClass("nbs-flexisel-ul");
                object.wrap("<div class='nbs-flexisel-container'><div class='nbs-flexisel-inner'></div></div>");
                object.find("li").addClass("nbs-flexisel-item");

                if (settings.setMaxWidthAndHeight) {
                    var baseWidth = $(".nbs-flexisel-item img").width();
                    var baseHeight = $(".nbs-flexisel-item img").height();
                    $(".nbs-flexisel-item img").css("max-width", baseWidth);
                    $(".nbs-flexisel-item img").css("max-height", baseHeight);
                }
                $("<div class='nbs-flexisel-nav-left'></div><div class='nbs-flexisel-nav-right'></div>").insertAfter(object);
                if (settings.clone) {
                    var cloneContent = object.children().clone();
                    object.append(cloneContent);
                }
            },
            /******************************
            Set Event Handlers
            Set events: click, resize, etc
            *******************************/
            setEventHandlers: function () {

                var listParent = object.parent();
                var childSet = object.children();
                var leftArrow = listParent.find($(".nbs-flexisel-nav-left"));
                var rightArrow = listParent.find($(".nbs-flexisel-nav-right"));

                $(window).on("resize", function (event) {

                    methods.setResponsiveEvents();

                    var innerWidth = $(listParent).width();
                    var innerHeight = $(listParent).height();

                    itemsWidth = (innerWidth) / itemsVisible;

                    childSet.width(itemsWidth);
                    if (settings.clone) {
                        object.css({
                            'left': -itemsWidth
                        });
                    } else {
                        object.css({
                            'left': 0
                        });
                    }

                    var halfArrowHeight = (leftArrow.height()) / 2;
                    var arrowMargin = (innerHeight / 2) - halfArrowHeight;
                    leftArrow.css("top", arrowMargin + "px");
                    rightArrow.css("top", arrowMargin + "px");

                });
                $(leftArrow).on("click", function (event) {
                    methods.scrollLeft();
                });
                $(rightArrow).on("click", function (event) {
                    methods.scrollRight();
                });
                if (settings.pauseOnHover == true) {
                    $(".nbs-flexisel-item").on({
                        mouseenter: function () {
                            canNavigate = false;
                        },
                        mouseleave: function () {
                            canNavigate = true;
                        }
                    });
                }
                if (settings.autoPlay == true) {

                    setInterval(function () {
                        if (canNavigate == true)
                            methods.scrollRight();
                    }, settings.autoPlaySpeed);
                }

            },
            /******************************
            Set Responsive Events
            Set breakpoints depending on responsiveBreakpoints
            *******************************/

            setResponsiveEvents: function () {
                var contentWidth = $('html').width();

                if (settings.enableResponsiveBreakpoints) {

                    var largestCustom = responsivePoints[responsivePoints.length - 1].changePoint; // sorted array 

                    for (var i in responsivePoints) {

                        if (contentWidth >= largestCustom) { // set to default if width greater than largest custom responsiveBreakpoint 
                            itemsVisible = settings.visibleItems;
                            break;
                        }
                        else { // determine custom responsiveBreakpoint to use

                            if (contentWidth < responsivePoints[i].changePoint) {
                                itemsVisible = responsivePoints[i].visibleItems;
                                break;
                            }
                            else
                                continue;
                        }
                    }
                }
            },

            /******************************
            Sort Responsive Object
            Gets all the settings in resposiveBreakpoints and sorts them into an array
            *******************************/

            sortResponsiveObject: function (obj) {

                var responsiveObjects = [];

                for (var i in obj) {
                    responsiveObjects.push(obj[i]);
                }

                responsiveObjects.sort(function (a, b) {
                    return a.changePoint - b.changePoint;
                });

                responsivePoints = responsiveObjects;
            },

            /******************************
            Scroll Left
            *******************************/
            scrollLeft: function () {
                if (object.position().left < 0) {
                    if (canNavigate == true) {
                        canNavigate = false;

                        var listParent = object.parent();
                        var innerWidth = listParent.width();

                        itemsWidth = (innerWidth) / itemsVisible;

                        var childSet = object.children();

                        object.animate({
                            'left': "+=" + itemsWidth
                        }, {
                                queue: false,
                                duration: settings.animationSpeed,
                                easing: "linear",
                                complete: function () {
                                    if (settings.clone) {
                                        childSet.last().insertBefore(
                                            childSet.first()); // Get the first list item and put it after the last list item (that's how the infinite effects is made)                                   
                                    }
                                    methods.adjustScroll();
                                    canNavigate = true;
                                }
                            });
                    }
                }
            },
            /******************************
            Scroll Right
            *******************************/
            scrollRight: function () {
                var listParent = object.parent();
                var innerWidth = listParent.width();

                itemsWidth = (innerWidth) / itemsVisible;

                var difObject = (itemsWidth - innerWidth);
                var objPosition = (object.position().left + ((totalItems - itemsVisible) * itemsWidth) - innerWidth);

                if ((difObject < Math.ceil(objPosition)) && (!settings.clone)) {
                    if (canNavigate == true) {
                        canNavigate = false;

                        object.animate({
                            'left': "-=" + itemsWidth
                        }, {
                                queue: false,
                                duration: settings.animationSpeed,
                                easing: "linear",
                                complete: function () {
                                    methods.adjustScroll();
                                    canNavigate = true;
                                }
                            });
                    }
                } else if (settings.clone) {
                    if (canNavigate == true) {
                        canNavigate = false;

                        var childSet = object.children();

                        object.animate({
                            'left': "-=" + itemsWidth
                        }, {
                                queue: false,
                                duration: settings.animationSpeed,
                                easing: "linear",
                                complete: function () {
                                    childSet.first().insertAfter(childSet.last()); // Get the first list item and put it after the last list item (that's how the infinite effects is made)                                
                                    methods.adjustScroll();
                                    canNavigate = true;
                                }
                            });
                    }
                };
            },
            /******************************
            Adjust Scroll 
            *******************************/
            adjustScroll: function () {
                var listParent = object.parent();
                var childSet = object.children();

                var innerWidth = listParent.width();
                itemsWidth = (innerWidth) / itemsVisible;
                childSet.width(itemsWidth);
                if (settings.clone) {
                    object.css({
                        'left': -itemsWidth
                    });
                }
            }
        };
        if (methods[options]) { // $("#element").pluginName('methodName', 'arg1', 'arg2');
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) { // $("#element").pluginName({ option: 1, option:2 });
            return methods.init.apply(this);
        } else {
            $.error('Method "' + method + '" does not exist in flexisel plugin!');
        }
    };
})(jQuery);


/* ------------------------------------------------------------------------
	Class: prettyPhoto
	Use: Lightbox clone for jQuery
	Author: Stephane Caron (http://www.no-margin-for-errors.com)
	Version: 3.1.5
------------------------------------------------------------------------- */
(function (e) {
    function t() {
        var e = location.href;
        hashtag = e.indexOf("#prettyPhoto") !== -1 ? decodeURI(e.substring(e.indexOf("#prettyPhoto") + 1, e.length)) : false;
        return hashtag
    }
    function n() {
        if (typeof theRel == "undefined") return;
        location.hash = theRel + "/" + rel_index + "/"
    }
    function r() { if (location.href.indexOf("#prettyPhoto") !== -1) location.hash = "prettyPhoto" }
    function i(e, t) { e = e.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]"); var n = "[\\?&]" + e + "=([^&#]*)"; var r = new RegExp(n); var i = r.exec(t); return i == null ? "" : i[1] } e.prettyPhoto = { version: "3.1.5" }; e.fn.prettyPhoto = function (s) { function g() { e(".pp_loaderIcon").hide(); projectedTop = scroll_pos["scrollTop"] + (d / 2 - a["containerHeight"] / 2); if (projectedTop < 0) projectedTop = 0; $ppt.fadeTo(settings.animation_speed, 1); $pp_pic_holder.find(".pp_content").animate({ height: a["contentHeight"], width: a["contentWidth"] }, settings.animation_speed); $pp_pic_holder.animate({ top: projectedTop, left: v / 2 - a["containerWidth"] / 2 < 0 ? 0 : v / 2 - a["containerWidth"] / 2, width: a["containerWidth"] }, settings.animation_speed, function () { $pp_pic_holder.find(".pp_hoverContainer,#fullResImage").height(a["height"]).width(a["width"]); $pp_pic_holder.find(".pp_fade").fadeIn(settings.animation_speed); if (isSet && S(pp_images[set_position]) == "image") { $pp_pic_holder.find(".pp_hoverContainer").show() } else { $pp_pic_holder.find(".pp_hoverContainer").hide() } if (settings.allow_expand) { if (a["resized"]) { e("a.pp_expand,a.pp_contract").show() } else { e("a.pp_expand").hide() } } if (settings.autoplay_slideshow && !m && !f) e.prettyPhoto.startSlideshow(); settings.changepicturecallback(); f = true }); C(); s.ajaxcallback() } function y(t) { $pp_pic_holder.find("#pp_full_res object,#pp_full_res embed").css("visibility", "hidden"); $pp_pic_holder.find(".pp_fade").fadeOut(settings.animation_speed, function () { e(".pp_loaderIcon").show(); t() }) } function b(t) { t > 1 ? e(".pp_nav").show() : e(".pp_nav").hide() } function w(e, t) { resized = false; E(e, t); imageWidth = e, imageHeight = t; if ((p > v || h > d) && doresize && settings.allow_resize && !u) { resized = true, fitting = false; while (!fitting) { if (p > v) { imageWidth = v - 200; imageHeight = t / e * imageWidth } else if (h > d) { imageHeight = d - 200; imageWidth = e / t * imageHeight } else { fitting = true } h = imageHeight, p = imageWidth } if (p > v || h > d) { w(p, h) } E(imageWidth, imageHeight) } return { width: Math.floor(imageWidth), height: Math.floor(imageHeight), containerHeight: Math.floor(h), containerWidth: Math.floor(p) + settings.horizontal_padding * 2, contentHeight: Math.floor(l), contentWidth: Math.floor(c), resized: resized } } function E(t, n) { t = parseFloat(t); n = parseFloat(n); $pp_details = $pp_pic_holder.find(".pp_details"); $pp_details.width(t); detailsHeight = parseFloat($pp_details.css("marginTop")) + parseFloat($pp_details.css("marginBottom")); $pp_details = $pp_details.clone().addClass(settings.theme).width(t).appendTo(e("body")).css({ position: "absolute", top: -1e4 }); detailsHeight += $pp_details.height(); detailsHeight = detailsHeight <= 34 ? 36 : detailsHeight; $pp_details.remove(); $pp_title = $pp_pic_holder.find(".ppt"); $pp_title.width(t); titleHeight = parseFloat($pp_title.css("marginTop")) + parseFloat($pp_title.css("marginBottom")); $pp_title = $pp_title.clone().appendTo(e("body")).css({ position: "absolute", top: -1e4 }); titleHeight += $pp_title.height(); $pp_title.remove(); l = n + detailsHeight; c = t; h = l + titleHeight + $pp_pic_holder.find(".pp_top").height() + $pp_pic_holder.find(".pp_bottom").height(); p = t } function S(e) { if (e.match(/youtube\.com\/watch/i) || e.match(/youtu\.be/i)) { return "youtube" } else if (e.match(/vimeo\.com/i)) { return "vimeo" } else if (e.match(/\b.mov\b/i)) { return "quicktime" } else if (e.match(/\b.swf\b/i)) { return "flash" } else if (e.match(/\biframe=true\b/i)) { return "iframe" } else if (e.match(/\bajax=true\b/i)) { return "ajax" } else if (e.match(/\bcustom=true\b/i)) { return "custom" } else if (e.substr(0, 1) == "#") { return "inline" } else { return "image" } } function x() { if (doresize && typeof $pp_pic_holder != "undefined") { scroll_pos = T(); contentHeight = $pp_pic_holder.height(), contentwidth = $pp_pic_holder.width(); projectedTop = d / 2 + scroll_pos["scrollTop"] - contentHeight / 2; if (projectedTop < 0) projectedTop = 0; if (contentHeight > d) return; $pp_pic_holder.css({ top: projectedTop, left: v / 2 + scroll_pos["scrollLeft"] - contentwidth / 2 }) } } function T() { if (self.pageYOffset) { return { scrollTop: self.pageYOffset, scrollLeft: self.pageXOffset } } else if (document.documentElement && document.documentElement.scrollTop) { return { scrollTop: document.documentElement.scrollTop, scrollLeft: document.documentElement.scrollLeft } } else if (document.body) { return { scrollTop: document.body.scrollTop, scrollLeft: document.body.scrollLeft } } } function N() { d = e(window).height(), v = e(window).width(); if (typeof $pp_overlay != "undefined") $pp_overlay.height(e(document).height()).width(v) } function C() { if (isSet && settings.overlay_gallery && S(pp_images[set_position]) == "image") { itemWidth = 52 + 5; navWidth = settings.theme == "facebook" || settings.theme == "pp_default" ? 50 : 30; itemsPerPage = Math.floor((a["containerWidth"] - 100 - navWidth) / itemWidth); itemsPerPage = itemsPerPage < pp_images.length ? itemsPerPage : pp_images.length; totalPage = Math.ceil(pp_images.length / itemsPerPage) - 1; if (totalPage == 0) { navWidth = 0; $pp_gallery.find(".pp_arrow_next,.pp_arrow_previous").hide() } else { $pp_gallery.find(".pp_arrow_next,.pp_arrow_previous").show() } galleryWidth = itemsPerPage * itemWidth; fullGalleryWidth = pp_images.length * itemWidth; $pp_gallery.css("margin-left", -(galleryWidth / 2 + navWidth / 2)).find("div:first").width(galleryWidth + 5).find("ul").width(fullGalleryWidth).find("li.selected").removeClass("selected"); goToPage = Math.floor(set_position / itemsPerPage) < totalPage ? Math.floor(set_position / itemsPerPage) : totalPage; e.prettyPhoto.changeGalleryPage(goToPage); $pp_gallery_li.filter(":eq(" + set_position + ")").addClass("selected") } else { $pp_pic_holder.find(".pp_content").unbind("mouseenter mouseleave") } } function k(t) { if (settings.social_tools) facebook_like_link = settings.social_tools.replace("{location_href}", encodeURIComponent(location.href)); settings.markup = settings.markup.replace("{pp_social}", ""); e("body").append(settings.markup); $pp_pic_holder = e(".pp_pic_holder"), $ppt = e(".ppt"), $pp_overlay = e("div.pp_overlay"); if (isSet && settings.overlay_gallery) { currentGalleryPage = 0; toInject = ""; for (var n = 0; n < pp_images.length; n++) { if (!pp_images[n].match(/\b(jpg|jpeg|png|gif)\b/gi)) { classname = "default"; img_src = "" } else { classname = ""; img_src = pp_images[n] } toInject += "<li class='" + classname + "'><a href='#'><img src='" + img_src + "' width='50' alt='' /></a></li>" } toInject = settings.gallery_markup.replace(/{gallery}/g, toInject); $pp_pic_holder.find("#pp_full_res").after(toInject); $pp_gallery = e(".pp_pic_holder .pp_gallery"), $pp_gallery_li = $pp_gallery.find("li"); $pp_gallery.find(".pp_arrow_next").click(function () { e.prettyPhoto.changeGalleryPage("next"); e.prettyPhoto.stopSlideshow(); return false }); $pp_gallery.find(".pp_arrow_previous").click(function () { e.prettyPhoto.changeGalleryPage("previous"); e.prettyPhoto.stopSlideshow(); return false }); $pp_pic_holder.find(".pp_content").hover(function () { $pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeIn() }, function () { $pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeOut() }); itemWidth = 52 + 5; $pp_gallery_li.each(function (t) { e(this).find("a").click(function () { e.prettyPhoto.changePage(t); e.prettyPhoto.stopSlideshow(); return false }) }) } if (settings.slideshow) { $pp_pic_holder.find(".pp_nav").prepend('<a href="#" class="pp_play">Play</a>'); $pp_pic_holder.find(".pp_nav .pp_play").click(function () { e.prettyPhoto.startSlideshow(); return false }) } $pp_pic_holder.attr("class", "pp_pic_holder " + settings.theme); $pp_overlay.css({ opacity: 0, height: e(document).height(), width: e(window).width() }).bind("click", function () { if (!settings.modal) e.prettyPhoto.close() }); e("a.pp_close").bind("click", function () { e.prettyPhoto.close(); return false }); if (settings.allow_expand) { e("a.pp_expand").bind("click", function (t) { if (e(this).hasClass("pp_expand")) { e(this).removeClass("pp_expand").addClass("pp_contract"); doresize = false } else { e(this).removeClass("pp_contract").addClass("pp_expand"); doresize = true } y(function () { e.prettyPhoto.open() }); return false }) } $pp_pic_holder.find(".pp_previous, .pp_nav .pp_arrow_previous").bind("click", function () { e.prettyPhoto.changePage("previous"); e.prettyPhoto.stopSlideshow(); return false }); $pp_pic_holder.find(".pp_next, .pp_nav .pp_arrow_next").bind("click", function () { e.prettyPhoto.changePage("next"); e.prettyPhoto.stopSlideshow(); return false }); x() } s = jQuery.extend({ hook: "rel", animation_speed: "fast", ajaxcallback: function () { }, slideshow: 5e3, autoplay_slideshow: false, opacity: .8, show_title: true, allow_resize: true, allow_expand: true, default_width: 500, default_height: 344, counter_separator_label: "/", theme: "pp_default", horizontal_padding: 20, hideflash: false, wmode: "opaque", autoplay: true, modal: false, deeplinking: true, overlay_gallery: true, overlay_gallery_max: 30, keyboard_shortcuts: true, changepicturecallback: function () { }, callback: function () { }, ie6_fallback: true, markup: '<div class="pp_pic_holder"> 						<div class="ppt">?</div> 						<div class="pp_top"> 							<div class="pp_left"></div> 							<div class="pp_middle"></div> 							<div class="pp_right"></div> 						</div> 						<div class="pp_content_container"> 							<div class="pp_left"> 							<div class="pp_right"> 								<div class="pp_content"> 									<div class="pp_loaderIcon"></div> 									<div class="pp_fade"> 										<a href="#" class="pp_expand" title="Expand the image">Expand</a> 										<div class="pp_hoverContainer"> 											<a class="pp_next" href="#">next</a> 											<a class="pp_previous" href="#">previous</a> 										</div> 										<div id="pp_full_res"></div> 										<div class="pp_details"> 											<div class="pp_nav"> 												<a href="#" class="pp_arrow_previous">Previous</a> 												<p class="currentTextHolder">0/0</p> 												<a href="#" class="pp_arrow_next">Next</a> 											</div> 											<p class="pp_description"></p> 											<div class="pp_social">{pp_social}</div> 											<a class="pp_close" href="#">Close</a> 										</div> 									</div> 								</div> 							</div> 							</div> 						</div> 						<div class="pp_bottom"> 							<div class="pp_left"></div> 							<div class="pp_middle"></div> 							<div class="pp_right"></div> 						</div> 					</div> 					<div class="pp_overlay"></div>', gallery_markup: '<div class="pp_gallery"> 								<a href="#" class="pp_arrow_previous">Previous</a> 								<div> 									<ul> 										{gallery} 									</ul> 								</div> 								<a href="#" class="pp_arrow_next">Next</a> 							</div>', image_markup: '<img id="fullResImage" src="{path}" />', flash_markup: '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>', quicktime_markup: '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>', iframe_markup: '<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>', inline_markup: '<div class="pp_inline">{content}</div>', custom_markup: "", social_tools: '<div class="twitter"><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></div><div class="facebook"><iframe src="//www.facebook.com/plugins/like.php?locale=en_US&href={location_href}&layout=button_count&show_faces=true&width=500&action=like&font&colorscheme=light&height=23" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:500px; height:23px;" allowTransparency="true"></iframe></div>' }, s); var o = this, u = false, a, f, l, c, h, p, d = e(window).height(), v = e(window).width(), m; doresize = true, scroll_pos = T(); e(window).unbind("resize.prettyphoto").bind("resize.prettyphoto", function () { x(); N() }); if (s.keyboard_shortcuts) { e(document).unbind("keydown.prettyphoto").bind("keydown.prettyphoto", function (t) { if (typeof $pp_pic_holder != "undefined") { if ($pp_pic_holder.is(":visible")) { switch (t.keyCode) { case 37: e.prettyPhoto.changePage("previous"); t.preventDefault(); break; case 39: e.prettyPhoto.changePage("next"); t.preventDefault(); break; case 27: if (!settings.modal) e.prettyPhoto.close(); t.preventDefault(); break } } } }) } e.prettyPhoto.initialize = function () { settings = s; if (settings.theme == "pp_default") settings.horizontal_padding = 16; theRel = e(this).attr(settings.hook); galleryRegExp = /\[(?:.*)\]/; isSet = galleryRegExp.exec(theRel) ? true : false; pp_images = isSet ? jQuery.map(o, function (t, n) { if (e(t).attr(settings.hook).indexOf(theRel) != -1) return e(t).attr("href") }) : e.makeArray(e(this).attr("href")); pp_titles = isSet ? jQuery.map(o, function (t, n) { if (e(t).attr(settings.hook).indexOf(theRel) != -1) return e(t).find("img").attr("alt") ? e(t).find("img").attr("alt") : "" }) : e.makeArray(e(this).find("img").attr("alt")); pp_descriptions = isSet ? jQuery.map(o, function (t, n) { if (e(t).attr(settings.hook).indexOf(theRel) != -1) return e(t).attr("title") ? e(t).attr("title") : "" }) : e.makeArray(e(this).attr("title")); if (pp_images.length > settings.overlay_gallery_max) settings.overlay_gallery = false; set_position = jQuery.inArray(e(this).attr("href"), pp_images); rel_index = isSet ? set_position : e("a[" + settings.hook + "^='" + theRel + "']").index(e(this)); k(this); if (settings.allow_resize) e(window).bind("scroll.prettyphoto", function () { x() }); e.prettyPhoto.open(); return false }; e.prettyPhoto.open = function (t) { if (typeof settings == "undefined") { settings = s; pp_images = e.makeArray(arguments[0]); pp_titles = arguments[1] ? e.makeArray(arguments[1]) : e.makeArray(""); pp_descriptions = arguments[2] ? e.makeArray(arguments[2]) : e.makeArray(""); isSet = pp_images.length > 1 ? true : false; set_position = arguments[3] ? arguments[3] : 0; k(t.target) } if (settings.hideflash) e("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css("visibility", "hidden"); b(e(pp_images).size()); e(".pp_loaderIcon").show(); if (settings.deeplinking) n(); if (settings.social_tools) { facebook_like_link = settings.social_tools.replace("{location_href}", encodeURIComponent(location.href)); $pp_pic_holder.find(".pp_social").html(facebook_like_link) } if ($ppt.is(":hidden")) $ppt.css("opacity", 0).show(); $pp_overlay.show().fadeTo(settings.animation_speed, settings.opacity); $pp_pic_holder.find(".currentTextHolder").text(set_position + 1 + settings.counter_separator_label + e(pp_images).size()); if (typeof pp_descriptions[set_position] != "undefined" && pp_descriptions[set_position] != "") { $pp_pic_holder.find(".pp_description").show().html(unescape(pp_descriptions[set_position])) } else { $pp_pic_holder.find(".pp_description").hide() } movie_width = parseFloat(i("width", pp_images[set_position])) ? i("width", pp_images[set_position]) : settings.default_width.toString(); movie_height = parseFloat(i("height", pp_images[set_position])) ? i("height", pp_images[set_position]) : settings.default_height.toString(); u = false; if (movie_height.indexOf("%") != -1) { movie_height = parseFloat(e(window).height() * parseFloat(movie_height) / 100 - 150); u = true } if (movie_width.indexOf("%") != -1) { movie_width = parseFloat(e(window).width() * parseFloat(movie_width) / 100 - 150); u = true } $pp_pic_holder.fadeIn(function () { settings.show_title && pp_titles[set_position] != "" && typeof pp_titles[set_position] != "undefined" ? $ppt.html(unescape(pp_titles[set_position])) : $ppt.html("?"); imgPreloader = ""; skipInjection = false; switch (S(pp_images[set_position])) { case "image": imgPreloader = new Image; nextImage = new Image; if (isSet && set_position < e(pp_images).size() - 1) nextImage.src = pp_images[set_position + 1]; prevImage = new Image; if (isSet && pp_images[set_position - 1]) prevImage.src = pp_images[set_position - 1]; $pp_pic_holder.find("#pp_full_res")[0].innerHTML = settings.image_markup.replace(/{path}/g, pp_images[set_position]); imgPreloader.onload = function () { a = w(imgPreloader.width, imgPreloader.height); g() }; imgPreloader.onerror = function () { alert("Image cannot be loaded. Make sure the path is correct and image exist."); e.prettyPhoto.close() }; imgPreloader.src = pp_images[set_position]; break; case "youtube": a = w(movie_width, movie_height); movie_id = i("v", pp_images[set_position]); if (movie_id == "") { movie_id = pp_images[set_position].split("youtu.be/"); movie_id = movie_id[1]; if (movie_id.indexOf("?") > 0) movie_id = movie_id.substr(0, movie_id.indexOf("?")); if (movie_id.indexOf("&") > 0) movie_id = movie_id.substr(0, movie_id.indexOf("&")) } movie = "http://www.youtube.com/embed/" + movie_id; i("rel", pp_images[set_position]) ? movie += "?rel=" + i("rel", pp_images[set_position]) : movie += "?rel=1"; if (settings.autoplay) movie += "&autoplay=1"; toInject = settings.iframe_markup.replace(/{width}/g, a["width"]).replace(/{height}/g, a["height"]).replace(/{wmode}/g, settings.wmode).replace(/{path}/g, movie); break; case "vimeo": a = w(movie_width, movie_height); movie_id = pp_images[set_position]; var t = /http(s?):\/\/(www\.)?vimeo.com\/(\d+)/; var n = movie_id.match(t); movie = "http://player.vimeo.com/video/" + n[3] + "?title=0&byline=0&portrait=0"; if (settings.autoplay) movie += "&autoplay=1;"; vimeo_width = a["width"] + "/embed/?moog_width=" + a["width"]; toInject = settings.iframe_markup.replace(/{width}/g, vimeo_width).replace(/{height}/g, a["height"]).replace(/{path}/g, movie); break; case "quicktime": a = w(movie_width, movie_height); a["height"] += 15; a["contentHeight"] += 15; a["containerHeight"] += 15; toInject = settings.quicktime_markup.replace(/{width}/g, a["width"]).replace(/{height}/g, a["height"]).replace(/{wmode}/g, settings.wmode).replace(/{path}/g, pp_images[set_position]).replace(/{autoplay}/g, settings.autoplay); break; case "flash": a = w(movie_width, movie_height); flash_vars = pp_images[set_position]; flash_vars = flash_vars.substring(pp_images[set_position].indexOf("flashvars") + 10, pp_images[set_position].length); filename = pp_images[set_position]; filename = filename.substring(0, filename.indexOf("?")); toInject = settings.flash_markup.replace(/{width}/g, a["width"]).replace(/{height}/g, a["height"]).replace(/{wmode}/g, settings.wmode).replace(/{path}/g, filename + "?" + flash_vars); break; case "iframe": a = w(movie_width, movie_height); frame_url = pp_images[set_position]; frame_url = frame_url.substr(0, frame_url.indexOf("iframe") - 1); toInject = settings.iframe_markup.replace(/{width}/g, a["width"]).replace(/{height}/g, a["height"]).replace(/{path}/g, frame_url); break; case "ajax": doresize = false; a = w(movie_width, movie_height); doresize = true; skipInjection = true; e.get(pp_images[set_position], function (e) { toInject = settings.inline_markup.replace(/{content}/g, e); $pp_pic_holder.find("#pp_full_res")[0].innerHTML = toInject; g() }); break; case "custom": a = w(movie_width, movie_height); toInject = settings.custom_markup; break; case "inline": myClone = e(pp_images[set_position]).clone().append('<br clear="all" />').css({ width: settings.default_width }).wrapInner('<div id="pp_full_res"><div class="pp_inline"></div></div>').appendTo(e("body")).show(); doresize = false; a = w(e(myClone).width(), e(myClone).height()); doresize = true; e(myClone).remove(); toInject = settings.inline_markup.replace(/{content}/g, e(pp_images[set_position]).html()); break } if (!imgPreloader && !skipInjection) { $pp_pic_holder.find("#pp_full_res")[0].innerHTML = toInject; g() } }); return false }; e.prettyPhoto.changePage = function (t) { currentGalleryPage = 0; if (t == "previous") { set_position--; if (set_position < 0) set_position = e(pp_images).size() - 1 } else if (t == "next") { set_position++; if (set_position > e(pp_images).size() - 1) set_position = 0 } else { set_position = t } rel_index = set_position; if (!doresize) doresize = true; if (settings.allow_expand) { e(".pp_contract").removeClass("pp_contract").addClass("pp_expand") } y(function () { e.prettyPhoto.open() }) }; e.prettyPhoto.changeGalleryPage = function (e) { if (e == "next") { currentGalleryPage++; if (currentGalleryPage > totalPage) currentGalleryPage = 0 } else if (e == "previous") { currentGalleryPage--; if (currentGalleryPage < 0) currentGalleryPage = totalPage } else { currentGalleryPage = e } slide_speed = e == "next" || e == "previous" ? settings.animation_speed : 0; slide_to = currentGalleryPage * itemsPerPage * itemWidth; $pp_gallery.find("ul").animate({ left: -slide_to }, slide_speed) }; e.prettyPhoto.startSlideshow = function () { if (typeof m == "undefined") { $pp_pic_holder.find(".pp_play").unbind("click").removeClass("pp_play").addClass("pp_pause").click(function () { e.prettyPhoto.stopSlideshow(); return false }); m = setInterval(e.prettyPhoto.startSlideshow, settings.slideshow) } else { e.prettyPhoto.changePage("next") } }; e.prettyPhoto.stopSlideshow = function () { $pp_pic_holder.find(".pp_pause").unbind("click").removeClass("pp_pause").addClass("pp_play").click(function () { e.prettyPhoto.startSlideshow(); return false }); clearInterval(m); m = undefined }; e.prettyPhoto.close = function () { if ($pp_overlay.is(":animated")) return; e.prettyPhoto.stopSlideshow(); $pp_pic_holder.stop().find("object,embed").css("visibility", "hidden"); e("div.pp_pic_holder,div.ppt,.pp_fade").fadeOut(settings.animation_speed, function () { e(this).remove() }); $pp_overlay.fadeOut(settings.animation_speed, function () { if (settings.hideflash) e("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css("visibility", "visible"); e(this).remove(); e(window).unbind("scroll.prettyphoto"); r(); settings.callback(); doresize = true; f = false; delete settings }) }; if (!pp_alreadyInitialized && t()) { pp_alreadyInitialized = true; hashIndex = t(); hashRel = hashIndex; hashIndex = hashIndex.substring(hashIndex.indexOf("/") + 1, hashIndex.length - 1); hashRel = hashRel.substring(0, hashRel.indexOf("/")); setTimeout(function () { e("a[" + s.hook + "^='" + hashRel + "']:eq(" + hashIndex + ")").trigger("click") }, 50) } return this.unbind("click.prettyphoto").bind("click.prettyphoto", e.prettyPhoto.initialize) };
})(jQuery); var pp_alreadyInitialized = false



    /*!
    *  - v1.0.6
    * Homepage: http://bqworks.com/slider-pro/
    * Author: bqworks
    * Author URL: http://bqworks.com/
    */
    ; (function (window, $) {

        "use strict";

        // Static methods for Slider Pro
        $.SliderPro = {

            // List of added modules
            modules: [],

            // Add a module by extending the core prototype
            addModule: function (name, module) {
                this.modules.push(name);
                $.extend(SliderPro.prototype, module);
            }
        };

        // namespace
        var NS = $.SliderPro.namespace = 'SliderPro';

        var SliderPro = function (instance, options) {

            // Reference to the slider instance
            this.instance = instance;

            // Reference to the slider jQuery element
            this.$slider = $(this.instance);

            // Reference to the slides (sp-slides) jQuery element
            this.$slides = null;

            // Reference to the mask (sp-mask) jQuery element
            this.$slidesMask = null;

            // Reference to the slides (sp-slides-container) jQuery element
            this.$slidesContainer = null;

            // Array of SliderProSlide objects, ordered by their DOM index
            this.slides = [];

            // Array of SliderProSlide objects, ordered by their left/top position in the slider.
            // This will be updated continuously if the slider is loopable.
            this.slidesOrder = [];

            // Holds the options passed to the slider when it was instantiated
            this.options = options;

            // Holds the final settings of the slider after merging the specified
            // ones with the default ones.
            this.settings = {};

            // Another reference to the settings which will not be altered by breakpoints or by other means
            this.originalSettings = {};

            // Reference to the original 'gotoSlide' method
            this.originalGotoSlide = null;

            // The index of the currently selected slide (starts with 0)
            this.selectedSlideIndex = 0;

            // The index of the previously selected slide
            this.previousSlideIndex = 0;

            // Indicates the position of the slide considered to be in the middle.
            // If there are 5 slides (0, 1, 2, 3, 4) the middle position will be 2.
            // If there are 6 slides (0, 1, 2, 3, 4, 5) the middle position will be approximated to 2.
            this.middleSlidePosition = 0;

            // Indicates the type of supported transition (CSS3 2D, CSS3 3D or JavaScript)
            this.supportedAnimation = null;

            // Indicates the required vendor prefix for CSS (i.e., -webkit, -moz, etc.)
            this.vendorPrefix = null;

            // Indicates the name of the CSS transition's complete event (i.e., transitionend, webkitTransitionEnd, etc.)
            this.transitionEvent = null;

            // Indicates the 'left' or 'top' position
            this.positionProperty = null;

            // The position of the slides container
            this.slidesPosition = 0;

            // The width of the individual slide
            this.slideWidth = 0;

            // The height of the individual slide
            this.slideHeight = 0;

            // The width or height, depending on the orientation, of the individual slide
            this.slideSize = 0;

            // Reference to the old slide width, used to check if the width has changed
            this.previousSlideWidth = 0;

            // Reference to the old slide height, used to check if the height has changed
            this.previousSlideHeight = 0;

            // Reference to the old window width, used to check if the window width has changed
            this.previousWindowWidth = 0;

            // Reference to the old window height, used to check if the window height has changed
            this.previousWindowHeight = 0;

            // The distance from the margin of the slider to the left/top of the selected slide.
            // This is useful in calculating the position of the selected slide when there are 
            // more visible slides.
            this.visibleOffset = 0;

            // Property used for deferring the resizing of the slider
            this.allowResize = true;

            // Unique ID to be used for event listening
            this.uniqueId = new Date().valueOf();

            // Stores size breakpoints
            this.breakpoints = [];

            // Indicates the current size breakpoint
            this.currentBreakpoint = -1;

            // An array of shuffled indexes, based on which the slides will be shuffled
            this.shuffledIndexes = [];

            // Initialize the slider
            this._init();
        };

        SliderPro.prototype = {

            // The starting place for the slider
            _init: function () {
                var that = this;

                this.supportedAnimation = SliderProUtils.getSupportedAnimation();
                this.vendorPrefix = SliderProUtils.getVendorPrefix();
                this.transitionEvent = SliderProUtils.getTransitionEvent();

                // Remove the 'sp-no-js' when the slider's JavaScript code starts running
                this.$slider.removeClass('sp-no-js');

                // Add the 'ios' class if it's an iOS device
                if (window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
                    this.$slider.addClass('ios');
                }

                // Check if IE is used and add the version number as a class to the slider since
                // older IE versions might need extra CSS code.
                var rmsie = /(msie) ([\w.]+)/,
                    ieVersion = rmsie.exec(window.navigator.userAgent.toLowerCase());

                if (ieVersion !== null) {
                    this.$slider.addClass('ie ie' + parseInt(ieVersion[2], 10));
                }

                // Set up the slides containers
                // slider-pro > sp-slides-container > sp-mask > sp-slides > sp-slide
                this.$slidesContainer = $('<div class="sp-slides-container"></div>').appendTo(this.$slider);
                this.$slidesMask = $('<div class="sp-mask"></div>').appendTo(this.$slidesContainer);
                this.$slides = this.$slider.find('.sp-slides').appendTo(this.$slidesMask);
                this.$slider.find('.sp-slide').appendTo(this.$slides);

                var modules = $.SliderPro.modules;

                // Merge the modules' default settings with the core's default settings
                if (typeof modules !== 'undefined') {
                    for (var i in modules) {
                        var defaults = modules[i].substring(0, 1).toLowerCase() + modules[i].substring(1) + 'Defaults';

                        if (typeof this[defaults] !== 'undefined') {
                            $.extend(this.defaults, this[defaults]);
                        }
                    }
                }

                // Merge the specified setting with the default ones
                this.settings = $.extend({}, this.defaults, this.options);

                // Initialize the modules
                if (typeof modules !== 'undefined') {
                    for (var j in modules) {
                        if (typeof this['init' + modules[j]] !== 'undefined') {
                            this['init' + modules[j]]();
                        }
                    }
                }

                // Keep a reference of the original settings and use it
                // to restore the settings when the breakpoints are used.
                this.originalSettings = $.extend({}, this.settings);

                // Get the reference to the 'gotoSlide' method
                this.originalGotoSlide = this.gotoSlide;

                // Parse the breakpoints object and store the values into an array,
                // sorting them in ascending order based on the specified size.
                if (this.settings.breakpoints !== null) {
                    for (var sizes in this.settings.breakpoints) {
                        this.breakpoints.push({ size: parseInt(sizes, 10), properties: this.settings.breakpoints[sizes] });
                    }

                    this.breakpoints = this.breakpoints.sort(function (a, b) {
                        return a.size >= b.size ? 1 : -1;
                    });
                }

                // Set which slide should be selected initially
                this.selectedSlideIndex = this.settings.startSlide;

                // Shuffle/randomize the slides
                if (this.settings.shuffle === true) {
                    var slides = this.$slides.find('.sp-slide'),
                        shuffledSlides = [];

                    // Populate the 'shuffledIndexes' with index numbers
                    slides.each(function (index) {
                        that.shuffledIndexes.push(index);
                    });

                    for (var k = this.shuffledIndexes.length - 1; k > 0; k--) {
                        var l = Math.floor(Math.random() * (k + 1)),
                            temp = this.shuffledIndexes[k];

                        this.shuffledIndexes[k] = this.shuffledIndexes[l];
                        this.shuffledIndexes[l] = temp;
                    }

                    // Reposition the slides based on the order of the indexes in the
                    // 'shuffledIndexes' array
                    $.each(this.shuffledIndexes, function (index, element) {
                        shuffledSlides.push(slides[element]);
                    });

                    // Append the sorted slides to the slider
                    this.$slides.empty().append(shuffledSlides);
                }

                // Resize the slider when the browser window resizes.
                // Also, deffer the resizing in order to not allow multiple
                // resizes in a 200 milliseconds interval.
                $(window).on('resize.' + this.uniqueId + '.' + NS, function () {

                    // Get the current width and height of the window
                    var newWindowWidth = $(window).width(),
                        newWindowHeight = $(window).height();

                    // If the resize is not allowed yet or if the window size hasn't changed (this needs to be verified
                    // because in IE8 and lower the resize event is triggered whenever an element from the page changes
                    // its size) return early.
                    if (that.allowResize === false ||
                        (that.previousWindowWidth === newWindowWidth && that.previousWindowHeight === newWindowHeight)) {
                        return;
                    }

                    // Asign the new values for the window width and height
                    that.previousWindowWidth = newWindowWidth;
                    that.previousWindowHeight = newWindowHeight;

                    that.allowResize = false;

                    setTimeout(function () {
                        that.resize();
                        that.allowResize = true;
                    }, 200);
                });

                // Resize the slider when the 'update' method is called.
                this.on('update.' + NS, function () {

                    // Reset the previous slide width
                    that.previousSlideWidth = 0;

                    // Some updates might require a resize
                    that.resize();
                });

                this.update();

                // Fire the 'init' event
                this.trigger({ type: 'init' });
                if ($.isFunction(this.settings.init)) {
                    this.settings.init.call(this, { type: 'init' });
                }
            },

            // Update the slider by checking for setting changes and for slides
            // that weren't initialized yet.
            update: function () {
                var that = this;

                // Check the current slider orientation and reset CSS that might have been
                // added for a different orientation, since the orientation can be changed
                // at runtime.
                if (this.settings.orientation === 'horizontal') {
                    this.$slider.removeClass('sp-vertical').addClass('sp-horizontal');
                    this.$slider.css({ 'height': '', 'max-height': '' });
                    this.$slides.find('.sp-slide').css('top', '');
                } else if (this.settings.orientation === 'vertical') {
                    this.$slider.removeClass('sp-horizontal').addClass('sp-vertical');
                    this.$slides.find('.sp-slide').css('left', '');
                }

                // Set the position that will be used to arrange elements, like the slides,
                // based on the orientation.
                this.positionProperty = this.settings.orientation === 'horizontal' ? 'left' : 'top';

                // Reset the 'gotoSlide' method
                this.gotoSlide = this.originalGotoSlide;

                // Loop through the array of SliderProSlide objects and if a stored slide is found
                // which is not in the DOM anymore, destroy that slide.
                for (var i = this.slides.length - 1; i >= 0; i--) {
                    if (this.$slider.find('.sp-slide[data-index="' + i + '"]').length === 0) {
                        var slide = this.slides[i];

                        slide.destroy();
                        this.slides.splice(i, 1);
                    }
                }

                this.slidesOrder.length = 0;

                // Loop through the list of slides and initialize newly added slides if any,
                // and reset the index of each slide.
                this.$slider.find('.sp-slide').each(function (index) {
                    var $slide = $(this);

                    if (typeof $slide.attr('data-init') === 'undefined') {
                        that._createSlide(index, $slide);
                    } else {
                        that.slides[index].setIndex(index);
                    }

                    that.slidesOrder.push(index);
                });

                // Calculate the position/index of the middle slide
                this.middleSlidePosition = parseInt((that.slidesOrder.length - 1) / 2, 10);

                // Arrange the slides in a loop
                if (this.settings.loop === true) {
                    this._updateSlidesOrder();
                }

                // Fire the 'update' event
                this.trigger({ type: 'update' });
                if ($.isFunction(this.settings.update)) {
                    this.settings.update.call(this, { type: 'update' });
                }
            },

            // Create a SliderProSlide instance for the slide passed as a jQuery element
            _createSlide: function (index, element) {
                var that = this,
                    slide = new SliderProSlide($(element), index, this.settings);

                this.slides.splice(index, 0, slide);
            },

            // Arrange the slide elements in a loop inside the 'slidesOrder' array
            _updateSlidesOrder: function () {
                var slicedItems,
                    i,

                    // Calculate the distance between the selected element and the middle position
                    distance = $.inArray(this.selectedSlideIndex, this.slidesOrder) - this.middleSlidePosition;

                // If the distance is negative it means that the selected slider is before the middle position, so
                // slides from the end of the array will be added at the beginning, in order to shift the selected slide
                // forward.
                // 
                // If the distance is positive, slides from the beginning of the array will be added at the end.
                if (distance < 0) {
                    slicedItems = this.slidesOrder.splice(distance, Math.abs(distance));

                    for (i = slicedItems.length - 1; i >= 0; i--) {
                        this.slidesOrder.unshift(slicedItems[i]);
                    }
                } else if (distance > 0) {
                    slicedItems = this.slidesOrder.splice(0, distance);

                    for (i = 0; i <= slicedItems.length - 1; i++) {
                        this.slidesOrder.push(slicedItems[i]);
                    }
                }
            },

            // Set the left/top position of the slides based on their position in the 'slidesOrder' array
            _updateSlidesPosition: function () {
                var selectedSlidePixelPosition = parseInt(this.$slides.find('.sp-slide').eq(this.selectedSlideIndex).css(this.positionProperty), 10);

                for (var slideIndex in this.slidesOrder) {
                    var slide = this.$slides.find('.sp-slide').eq(this.slidesOrder[slideIndex]);
                    slide.css(this.positionProperty, selectedSlidePixelPosition + (slideIndex - this.middleSlidePosition) * (this.slideSize + this.settings.slideDistance));
                }
            },

            // Set the left/top position of the slides based on their position in the 'slidesOrder' array,
            // and also set the position of the slides container.
            _resetSlidesPosition: function () {
                for (var slideIndex in this.slidesOrder) {
                    var slide = this.$slides.find('.sp-slide').eq(this.slidesOrder[slideIndex]);
                    slide.css(this.positionProperty, slideIndex * (this.slideSize + this.settings.slideDistance));
                }

                var newSlidesPosition = -parseInt(this.$slides.find('.sp-slide').eq(this.selectedSlideIndex).css(this.positionProperty), 10) + this.visibleOffset;
                this._moveTo(newSlidesPosition, true);
            },

            // Called when the slider needs to resize
            resize: function () {
                var that = this;

                // Check if the current window width is bigger than the biggest breakpoint
                // and if necessary reset the properties to the original settings.
                // 
                // If the window width is smaller than a certain breakpoint, apply the settings specified
                // for that breakpoint but only after merging them with the original settings
                // in order to make sure that only the specified settings for the breakpoint are applied
                if (this.settings.breakpoints !== null && this.breakpoints.length > 0) {
                    if ($(window).width() > this.breakpoints[this.breakpoints.length - 1].size && this.currentBreakpoint !== -1) {
                        this.currentBreakpoint = -1;
                        this._setProperties(this.originalSettings, false);
                    } else {
                        for (var i = 0, n = this.breakpoints.length; i < n; i++) {
                            if ($(window).width() <= this.breakpoints[i].size) {
                                if (this.currentBreakpoint !== this.breakpoints[i].size) {
                                    var eventObject = { type: 'breakpointReach', size: this.breakpoints[i].size, settings: this.breakpoints[i].properties };
                                    this.trigger(eventObject);
                                    if ($.isFunction(this.settings.breakpointReach))
                                        this.settings.breakpointReach.call(this, eventObject);

                                    this.currentBreakpoint = this.breakpoints[i].size;
                                    var settings = $.extend({}, this.originalSettings, this.breakpoints[i].properties);
                                    this._setProperties(settings, false);

                                    return;
                                }

                                break;
                            }
                        }
                    }
                }

                // Set the width of the main slider container based on whether or not the slider is responsive,
                // full width or full size
                if (this.settings.responsive === true) {
                    if ((this.settings.forceSize === 'fullWidth' || this.settings.forceSize === 'fullWindow') &&
                        (this.settings.visibleSize === 'auto' || this.settings.visibleSize !== 'auto' && this.settings.orientation === 'vertical')
                    ) {
                        this.$slider.css('margin', 0);
                        this.$slider.css({ 'width': $(window).width(), 'max-width': '', 'marginLeft': -this.$slider.offset().left });
                    } else {
                        this.$slider.css({ 'width': '100%', 'max-width': this.settings.width, 'marginLeft': '' });
                    }
                } else {
                    this.$slider.css({ 'width': this.settings.width });
                }

                // Calculate the aspect ratio of the slider
                if (this.settings.aspectRatio === -1) {
                    this.settings.aspectRatio = this.settings.width / this.settings.height;
                }

                // Initially set the slide width to the size of the slider.
                // Later, this will be set to less if there are multiple visible slides.
                this.slideWidth = this.$slider.width();

                // Set the height to the same size as the browser window if the slider is set to be 'fullWindow',
                // or calculate the height based on the width and the aspect ratio.
                if (this.settings.forceSize === 'fullWindow') {
                    this.slideHeight = $(window).height();
                } else {
                    this.slideHeight = isNaN(this.settings.aspectRatio) ? this.settings.height : this.slideWidth / this.settings.aspectRatio;
                }

                // Resize the slider only if the size of the slider has changed
                // If it hasn't, return.
                if (this.previousSlideWidth !== this.slideWidth ||
                    this.previousSlideHeight !== this.slideHeight ||
                    this.settings.visibleSize !== 'auto' ||
                    this.$slider.outerWidth() > this.$slider.parent().width() ||
                    this.$slider.width() !== this.$slidesMask.width()
                ) {
                    this.previousSlideWidth = this.slideWidth;
                    this.previousSlideHeight = this.slideHeight;
                } else {
                    return;
                }

                // The slide width or slide height is needed for several calculation, so create a reference to it
                // based on the current orientation.
                this.slideSize = this.settings.orientation === 'horizontal' ? this.slideWidth : this.slideHeight;

                // Initially set the visible size of the slides and the offset of the selected slide as if there is only
                // on visible slide.
                // If there will be multiple visible slides (when 'visibleSize' is different than 'auto'), these will
                // be updated accordingly.
                this.visibleSlidesSize = this.slideSize;
                this.visibleOffset = 0;

                // Loop through the existing slides and reset their size.
                $.each(this.slides, function (index, element) {
                    element.setSize(that.slideWidth, that.slideHeight);
                });

                // Set the initial size of the mask container to the size of an individual slide
                this.$slidesMask.css({ 'width': this.slideWidth, 'height': this.slideHeight });

                // Adjust the height if it's set to 'auto'
                if (this.settings.autoHeight === true) {

                    // Delay the resizing of the height to allow for other resize handlers
                    // to execute first before calculating the final height of the slide
                    setTimeout(function () {
                        that._resizeHeight();
                    }, 1);
                } else {
                    this.$slidesMask.css(this.vendorPrefix + 'transition', '');
                }

                // The 'visibleSize' option can be set to fixed or percentage size to make more slides
                // visible at a time.
                // By default it's set to 'auto'.
                if (this.settings.visibleSize !== 'auto') {
                    if (this.settings.orientation === 'horizontal') {

                        // If the size is forced to full width or full window, the 'visibleSize' option will be
                        // ignored and the slider will become as wide as the browser window.
                        if (this.settings.forceSize === 'fullWidth' || this.settings.forceSize === 'fullWindow') {
                            this.$slider.css('margin', 0);
                            this.$slider.css({ 'width': $(window).width(), 'max-width': '', 'marginLeft': -this.$slider.offset().left });
                        } else {
                            this.$slider.css({ 'width': this.settings.visibleSize, 'max-width': '100%', 'marginLeft': 0 });
                        }

                        this.$slidesMask.css('width', this.$slider.width());

                        this.visibleSlidesSize = this.$slidesMask.width();
                        this.visibleOffset = Math.round((this.$slider.width() - this.slideWidth) / 2);
                    } else {

                        // If the size is forced to full window, the 'visibleSize' option will be
                        // ignored and the slider will become as high as the browser window.
                        if (this.settings.forceSize === 'fullWindow') {
                            this.$slider.css({ 'height': $(window).height(), 'max-height': '' });
                        } else {
                            this.$slider.css({ 'height': this.settings.visibleSize, 'max-height': '100%' });
                        }

                        this.$slidesMask.css('height', this.$slider.height());

                        this.visibleSlidesSize = this.$slidesMask.height();
                        this.visibleOffset = Math.round((this.$slider.height() - this.slideHeight) / 2);
                    }
                }

                this._resetSlidesPosition();

                // Fire the 'sliderResize' event
                this.trigger({ type: 'sliderResize' });
                if ($.isFunction(this.settings.sliderResize)) {
                    this.settings.sliderResize.call(this, { type: 'sliderResize' });
                }
            },

            // Resize the height of the slider to the height of the selected slide.
            // It's used when the 'autoHeight' option is set to 'true'.
            _resizeHeight: function () {
                var that = this,
                    selectedSlide = this.getSlideAt(this.selectedSlideIndex),
                    size = selectedSlide.getSize();

                selectedSlide.off('imagesLoaded.' + NS);
                selectedSlide.on('imagesLoaded.' + NS, function (event) {
                    if (event.index === that.selectedSlideIndex) {
                        var size = selectedSlide.getSize();
                        that._resizeHeightTo(size.height);
                    }
                });

                // If the selected slide contains images which are still loading,
                // wait for the loading to complete and then request the size again.
                if (size !== 'loading') {
                    this._resizeHeightTo(size.height);
                }
            },

            // Open the slide at the specified index
            gotoSlide: function (index) {
                if (index === this.selectedSlideIndex || typeof this.slides[index] === 'undefined') {
                    return;
                }

                var that = this;

                this.previousSlideIndex = this.selectedSlideIndex;
                this.selectedSlideIndex = index;

                // Re-assign the 'as-selected' class to the currently selected slide
                this.$slides.find('.sp-selected').removeClass('sp-selected');
                this.$slides.find('.sp-slide').eq(this.selectedSlideIndex).addClass('sp-selected');

                // If the slider is loopable reorder the slides to have the selected slide in the middle
                // and update the slides' position.
                if (this.settings.loop === true) {
                    this._updateSlidesOrder();
                    this._updateSlidesPosition();
                }

                // Adjust the height of the slider
                if (this.settings.autoHeight === true) {
                    this._resizeHeight();
                }

                // Calculate the new position that the slides container need to take
                var newSlidesPosition = -parseInt(this.$slides.find('.sp-slide').eq(this.selectedSlideIndex).css(this.positionProperty), 10) + this.visibleOffset;

                // Move the slides container to the new position
                this._moveTo(newSlidesPosition, false, function () {
                    if (that.settings.loop === true) {
                        that._resetSlidesPosition();
                    }

                    // Fire the 'gotoSlideComplete' event
                    that.trigger({ type: 'gotoSlideComplete', index: index, previousIndex: that.previousSlideIndex });
                    if ($.isFunction(that.settings.gotoSlideComplete)) {
                        that.settings.gotoSlideComplete.call(that, { type: 'gotoSlideComplete', index: index, previousIndex: that.previousSlideIndex });
                    }
                });

                // Fire the 'gotoSlide' event
                this.trigger({ type: 'gotoSlide', index: index, previousIndex: this.previousSlideIndex });
                if ($.isFunction(this.settings.gotoSlide)) {
                    this.settings.gotoSlide.call(this, { type: 'gotoSlide', index: index, previousIndex: this.previousSlideIndex });
                }
            },

            // Open the next slide
            nextSlide: function () {
                var index = (this.selectedSlideIndex >= this.getTotalSlides() - 1) ? 0 : (this.selectedSlideIndex + 1);
                this.gotoSlide(index);
            },

            // Open the previous slide
            previousSlide: function () {
                var index = this.selectedSlideIndex <= 0 ? (this.getTotalSlides() - 1) : (this.selectedSlideIndex - 1);
                this.gotoSlide(index);
            },

            // Move the slides container to the specified position.
            // The movement can be instant or animated.
            _moveTo: function (position, instant, callback) {
                var that = this,
                    css = {};

                if (position === this.slidesPosition) {
                    return;
                }

                this.slidesPosition = position;

                if (this.supportedAnimation === 'css-3d' || this.supportedAnimation === 'css-2d') {
                    var transition,
                        left = this.settings.orientation === 'horizontal' ? position : 0,
                        top = this.settings.orientation === 'horizontal' ? 0 : position;

                    if (this.supportedAnimation === 'css-3d') {
                        css[this.vendorPrefix + 'transform'] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
                    } else {
                        css[this.vendorPrefix + 'transform'] = 'translate(' + left + 'px, ' + top + 'px)';
                    }

                    if (typeof instant !== 'undefined' && instant === true) {
                        transition = '';
                    } else {
                        this.$slides.addClass('sp-animated');
                        transition = this.vendorPrefix + 'transform ' + this.settings.slideAnimationDuration / 1000 + 's';

                        this.$slides.on(this.transitionEvent, function (event) {
                            if (event.target !== event.currentTarget) {
                                return;
                            }

                            that.$slides.off(that.transitionEvent);
                            that.$slides.removeClass('sp-animated');

                            if (typeof callback === 'function') {
                                callback();
                            }
                        });
                    }

                    css[this.vendorPrefix + 'transition'] = transition;

                    this.$slides.css(css);
                } else {
                    css['margin-' + this.positionProperty] = position;

                    if (typeof instant !== 'undefined' && instant === true) {
                        this.$slides.css(css);
                    } else {
                        this.$slides.addClass('sp-animated');
                        this.$slides.animate(css, this.settings.slideAnimationDuration, function () {
                            that.$slides.removeClass('sp-animated');

                            if (typeof callback === 'function') {
                                callback();
                            }
                        });
                    }
                }
            },

            // Stop the movement of the slides
            _stopMovement: function () {
                var css = {};

                if (this.supportedAnimation === 'css-3d' || this.supportedAnimation === 'css-2d') {

                    // Get the current position of the slides by parsing the 'transform' property
                    var matrixString = this.$slides.css(this.vendorPrefix + 'transform'),
                        matrixType = matrixString.indexOf('matrix3d') !== -1 ? 'matrix3d' : 'matrix',
                        matrixArray = matrixString.replace(matrixType, '').match(/-?[0-9\.]+/g),
                        left = matrixType === 'matrix3d' ? parseInt(matrixArray[12], 10) : parseInt(matrixArray[4], 10),
                        top = matrixType === 'matrix3d' ? parseInt(matrixArray[13], 10) : parseInt(matrixArray[5], 10);

                    // Set the transform property to the value that the transform had when the function was called
                    if (this.supportedAnimation === 'css-3d') {
                        css[this.vendorPrefix + 'transform'] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
                    } else {
                        css[this.vendorPrefix + 'transform'] = 'translate(' + left + 'px, ' + top + 'px)';
                    }

                    css[this.vendorPrefix + 'transition'] = '';

                    this.$slides.css(css);
                    this.$slides.off(this.transitionEvent);
                    this.slidesPosition = this.settings.orientation === 'horizontal' ? left : top;
                } else {
                    this.$slides.stop();
                    this.slidesPosition = parseInt(this.$slides.css('margin-' + this.positionProperty), 10);
                }

                this.$slides.removeClass('sp-animated');
            },

            // Resize the height of the slider to the specified value
            _resizeHeightTo: function (height) {
                var css = { 'height': height };

                if (this.supportedAnimation === 'css-3d' || this.supportedAnimation === 'css-2d') {
                    css[this.vendorPrefix + 'transition'] = 'height ' + this.settings.heightAnimationDuration / 1000 + 's';
                    this.$slidesMask.css(css);
                } else {
                    this.$slidesMask.animate(css, this.settings.heightAnimationDuration);
                }
            },

            // Destroy the slider instance
            destroy: function () {
                // Remove the stored reference to this instance
                this.$slider.removeData('sliderPro');

                // Clean the CSS
                this.$slider.removeAttr('style');
                this.$slides.removeAttr('style');

                // Remove event listeners
                this.off('update.' + NS);
                $(window).off('resize.' + this.uniqueId + '.' + NS);

                // Destroy modules
                var modules = $.SliderPro.modules;

                if (typeof modules !== 'undefined') {
                    for (var i in modules) {
                        if (typeof this['destroy' + modules[i]] !== 'undefined') {
                            this['destroy' + modules[i]]();
                        }
                    }
                }

                // Destroy all slides
                $.each(this.slides, function (index, element) {
                    element.destroy();
                });

                this.slides.length = 0;

                // Move the slides to their initial position in the DOM and 
                // remove the container elements created dynamically.
                this.$slides.prependTo(this.$slider);
                this.$slidesContainer.remove();
            },

            // Set properties on runtime
            _setProperties: function (properties, store) {
                // Parse the properties passed as an object
                for (var prop in properties) {
                    this.settings[prop] = properties[prop];

                    // Alter the original settings as well unless 'false' is passed to the 'store' parameter
                    if (store !== false) {
                        this.originalSettings[prop] = properties[prop];
                    }
                }

                this.update();
            },

            // Attach an event handler to the slider
            on: function (type, callback) {
                return this.$slider.on(type, callback);
            },

            // Detach an event handler
            off: function (type) {
                return this.$slider.off(type);
            },

            // Trigger an event on the slider
            trigger: function (data) {
                return this.$slider.triggerHandler(data);
            },

            // Return the slide at the specified index
            getSlideAt: function (index) {
                return this.slides[index];
            },

            // Return the index of the currently opened slide
            getSelectedSlide: function () {
                return this.selectedSlideIndex;
            },

            // Return the total amount of slides
            getTotalSlides: function () {
                return this.slides.length;
            },

            // The default options of the slider
            defaults: {
                // Width of the slide
                width: 500,

                // Height of the slide
                height: 300,

                // Indicates if the slider is responsive
                responsive: true,

                // The aspect ratio of the slider (width/height)
                aspectRatio: -1,

                // The scale mode for images (cover, contain, exact and none)
                imageScaleMode: 'cover',

                // Indicates if the image will be centered
                centerImage: true,

                // Indicates if height of the slider will be adjusted to the
                // height of the selected slide
                autoHeight: false,

                // Indicates the initially selected slide
                startSlide: 0,

                // Indicates if the slides will be shuffled
                shuffle: false,

                // Indicates whether the slides will be arranged horizontally
                // or vertically. Can be set to 'horizontal' or 'vertical'.
                orientation: 'horizontal',

                // Indicates if the size of the slider will be forced to 'fullWidth' or 'fullWindow'
                forceSize: 'none',

                // Indicates if the slider will be loopable
                loop: true,

                // The distance between slides
                slideDistance: 10,

                // The duration of the slide animation
                slideAnimationDuration: 700,

                // The duration of the height animation
                heightAnimationDuration: 700,

                // Sets the size of the visible area, allowing the increase of it in order
                // to make more slides visible.
                // By default, only the selected slide will be visible. 
                visibleSize: 'auto',

                // Breakpoints for allowing the slider's options to be changed
                // based on the size of the window.
                breakpoints: null,

                // Called when the slider is initialized
                init: function () { },

                // Called when the slider is updates
                update: function () { },

                // Called when the slider is resized
                sliderResize: function () { },

                // Called when a new slide is selected
                gotoSlide: function () { },

                // Called when the navigation to the newly selected slide is complete
                gotoSlideComplete: function () { },

                // Called when a breakpoint is reached
                breakpointReach: function () { }
            }
        };

        var SliderProSlide = function (slide, index, settings) {

            // Reference to the slide jQuery element
            this.$slide = slide;

            // Reference to the main slide image
            this.$mainImage = null;

            // Reference to the container that will hold the main image
            this.$imageContainer = null;

            // Indicates whether the slide has a main image
            this.hasMainImage = false;

            // Indicates whether the main image is loaded
            this.isMainImageLoaded = false;

            // Indicates whether the main image is in the process of being loaded
            this.isMainImageLoading = false;

            // Indicates whether the slide has any image. There could be other images (i.e., in layers)
            // besides the main slide image.
            this.hasImages = false;

            // Indicates if all the images in the slide are loaded
            this.areImagesLoaded = false;

            // The width and height of the slide
            this.width = 0;
            this.height = 0;

            // Reference to the global settings of the slider
            this.settings = settings;

            // Set the index of the slide
            this.setIndex(index);

            // Initialize the slide
            this._init();
        };

        SliderProSlide.prototype = {

            // The starting point for the slide
            _init: function () {
                var that = this;

                // Mark the slide as initialized
                this.$slide.attr('data-init', true);

                // Get the main slide image if there is one
                this.$mainImage = this.$slide.find('.sp-image').length !== 0 ? this.$slide.find('.sp-image') : null;

                // If there is a main slide image, create a container for it and add the image to this container.
                // The container will allow the isolation of the image from the rest of the slide's content. This is
                // helpful when you want to show some content below the image and not cover it.
                if (this.$mainImage !== null) {
                    this.hasMainImage = true;

                    this.$imageContainer = $('<div class="sp-image-container"></div>').prependTo(this.$slide);

                    if (this.$mainImage.parent('a').length !== 0) {
                        this.$mainImage.parent('a').appendTo(this.$imageContainer);
                    } else {
                        this.$mainImage.appendTo(this.$imageContainer);
                    }
                }

                this.hasImages = this.$slide.find('img').length !== 0 ? true : false;
            },

            // Set the size of the slide
            setSize: function (width, height) {
                var that = this;

                this.width = width;
                this.height = this.settings.autoHeight === true ? 'auto' : height;

                this.$slide.css({
                    'width': this.width,
                    'height': this.height
                });

                if (this.hasMainImage === true) {
                    this.$imageContainer.css({
                        'width': this.width,
                        'height': this.height
                    });

                    // Resize the main image if it's loaded. If the 'data-src' attribute is present it means
                    // that the image will be lazy-loaded
                    if (typeof this.$mainImage.attr('data-src') === 'undefined') {
                        this.resizeMainImage();
                    }
                }
            },

            // Get the size (width and height) of the slide
            getSize: function () {
                var that = this,
                    size;

                // Check if all images have loaded, and if they have, return the size, else, return 'loading'
                if (this.hasImages === true && this.areImagesLoaded === false && typeof this.$slide.attr('data-loading') === 'undefined') {
                    this.$slide.attr('data-loading', true);

                    var status = SliderProUtils.checkImagesComplete(this.$slide, function () {
                        that.areImagesLoaded = true;
                        that.$slide.removeAttr('data-loading');
                        that.trigger({ type: 'imagesLoaded.' + NS, index: that.index });
                    });

                    if (status === 'complete') {
                        size = this.calculateSize();

                        return {
                            'width': size.width,
                            'height': size.height
                        };
                    } else {
                        return 'loading';
                    }
                } else {
                    size = this.calculateSize();

                    return {
                        'width': size.width,
                        'height': size.height
                    };
                }
            },

            // Calculate the width and height of the slide by going
            // through all the child elements and measuring their 'bottom'
            // and 'right' properties. The element with the biggest
            // 'right'/'bottom' property will determine the slide's
            // width/height.
            calculateSize: function () {
                var width = this.$slide.width(),
                    height = this.$slide.height();

                this.$slide.children().each(function (index, element) {
                    var child = $(element),
                        rect = element.getBoundingClientRect(),
                        bottom = child.position().top + (rect.bottom - rect.top),
                        right = child.position().left + (rect.right - rect.left);

                    if (bottom > height) {
                        height = bottom;
                    }

                    if (right > width) {
                        width = right;
                    }
                });

                return { width: width, height: height };
            },

            // Resize the main image.
            // 
            // Call this when the slide resizes or when the main image has changed to a different image.
            resizeMainImage: function (isNewImage) {
                var that = this;

                // If the main image has changed, reset the 'flags'
                if (isNewImage === true) {
                    this.isMainImageLoaded = false;
                    this.isMainImageLoading = false;
                }

                // If the image was not loaded yet and it's not in the process of being loaded, load it
                if (this.isMainImageLoaded === false && this.isMainImageLoading === false) {
                    this.isMainImageLoading = true;

                    SliderProUtils.checkImagesComplete(this.$mainImage, function () {
                        that.isMainImageLoaded = true;
                        that.isMainImageLoading = false;
                        that.resizeMainImage();
                        that.trigger({ type: 'imagesLoaded.' + NS, index: that.index });
                    });

                    return;
                }

                // After the main image has loaded, resize it
                if (this.settings.autoHeight === true) {
                    this.$mainImage.css({ width: '100%', height: 'auto', 'marginLeft': '', 'marginTop': '' });
                } else {
                    if (this.settings.imageScaleMode === 'cover') {
                        if (this.$mainImage.width() / this.$mainImage.height() <= this.width / this.height) {
                            this.$mainImage.css({ width: '100%', height: 'auto' });
                        } else {
                            this.$mainImage.css({ width: 'auto', height: '100%' });
                        }
                    } else if (this.settings.imageScaleMode === 'contain') {
                        if (this.$mainImage.width() / this.$mainImage.height() >= this.width / this.height) {
                            this.$mainImage.css({ width: '100%', height: 'auto' });
                        } else {
                            this.$mainImage.css({ width: 'auto', height: '100%' });
                        }
                    } else if (this.settings.imageScaleMode === 'exact') {
                        this.$mainImage.css({ width: '100%', height: '100%' });
                    }

                    if (this.settings.centerImage === true) {
                        this.$mainImage.css({ 'marginLeft': (this.$imageContainer.width() - this.$mainImage.width()) * 0.5, 'marginTop': (this.$imageContainer.height() - this.$mainImage.height()) * 0.5 });
                    }
                }
            },

            // Destroy the slide
            destroy: function () {
                // Clean the slide element from attached styles and data
                this.$slide.removeAttr('style');
                this.$slide.removeAttr('data-init');
                this.$slide.removeAttr('data-index');
                this.$slide.removeAttr('data-loaded');

                // If there is a main image, remove its container
                if (this.hasMainImage === true) {
                    this.$slide.find('.sp-image')
                        .removeAttr('style')
                        .appendTo(this.$slide);

                    this.$slide.find('.sp-image-container').remove();
                }
            },

            // Return the index of the slide
            getIndex: function () {
                return this.index;
            },

            // Set the index of the slide
            setIndex: function (index) {
                this.index = index;
                this.$slide.attr('data-index', this.index);
            },

            // Attach an event handler to the slide
            on: function (type, callback) {
                return this.$slide.on(type, callback);
            },

            // Detach an event handler to the slide
            off: function (type) {
                return this.$slide.off(type);
            },

            // Trigger an event on the slide
            trigger: function (data) {
                return this.$slide.triggerHandler(data);
            }
        };

        window.SliderPro = SliderPro;
        window.SliderProSlide = SliderProSlide;

        $.fn.sliderPro = function (options) {
            var args = Array.prototype.slice.call(arguments, 1);

            return this.each(function () {
                // Instantiate the slider or alter it
                if (typeof $(this).data('sliderPro') === 'undefined') {
                    var newInstance = new SliderPro(this, options);

                    // Store a reference to the instance created
                    $(this).data('sliderPro', newInstance);
                } else if (typeof options !== 'undefined') {
                    var currentInstance = $(this).data('sliderPro');

                    // Check the type of argument passed
                    if (typeof currentInstance[options] === 'function') {
                        currentInstance[options].apply(currentInstance, args);
                    } else if (typeof currentInstance.settings[options] !== 'undefined') {
                        var obj = {};
                        obj[options] = args[0];
                        currentInstance._setProperties(obj);
                    } else if (typeof options === 'object') {
                        currentInstance._setProperties(options);
                    } else {
                        $.error(options + ' does not exist in sliderPro.');
                    }
                }
            });
        };

        // Contains useful utility functions
        var SliderProUtils = {

            // Indicates what type of animations are supported in the current browser
            // Can be CSS 3D, CSS 2D or JavaScript
            supportedAnimation: null,

            // Indicates the required vendor prefix for the current browser
            vendorPrefix: null,

            // Indicates the name of the transition's complete event for the current browser
            transitionEvent: null,

            // Check whether CSS3 3D or 2D transforms are supported. If they aren't, use JavaScript animations
            getSupportedAnimation: function () {
                if (this.supportedAnimation !== null) {
                    return this.supportedAnimation;
                }

                var element = document.body || document.documentElement,
                    elementStyle = element.style,
                    isCSSTransitions = typeof elementStyle.transition !== 'undefined' ||
                        typeof elementStyle.WebkitTransition !== 'undefined' ||
                        typeof elementStyle.MozTransition !== 'undefined' ||
                        typeof elementStyle.OTransition !== 'undefined';

                if (isCSSTransitions === true) {
                    var div = document.createElement('div');

                    // Check if 3D transforms are supported
                    if (typeof div.style.WebkitPerspective !== 'undefined' || typeof div.style.perspective !== 'undefined') {
                        this.supportedAnimation = 'css-3d';
                    }

                    // Additional checks for Webkit
                    if (this.supportedAnimation === 'css-3d' && typeof div.styleWebkitPerspective !== 'undefined') {
                        var style = document.createElement('style');
                        style.textContent = '@media (transform-3d),(-webkit-transform-3d){#test-3d{left:9px;position:absolute;height:5px;margin:0;padding:0;border:0;}}';
                        document.getElementsByTagName('head')[0].appendChild(style);

                        div.id = 'test-3d';
                        document.body.appendChild(div);

                        if (!(div.offsetLeft === 9 && div.offsetHeight === 5)) {
                            this.supportedAnimation = null;
                        }

                        style.parentNode.removeChild(style);
                        div.parentNode.removeChild(div);
                    }

                    // If CSS 3D transforms are not supported, check if 2D transforms are supported
                    if (this.supportedAnimation === null && (typeof div.style['-webkit-transform'] !== 'undefined' || typeof div.style.transform !== 'undefined')) {
                        this.supportedAnimation = 'css-2d';
                    }
                } else {
                    this.supportedAnimation = 'javascript';
                }

                return this.supportedAnimation;
            },

            // Check what vendor prefix should be used in the current browser
            getVendorPrefix: function () {
                if (this.vendorPrefix !== null) {
                    return this.vendorPrefix;
                }

                var div = document.createElement('div'),
                    prefixes = ['Webkit', 'Moz', 'ms', 'O'];

                if ('transform' in div.style) {
                    this.vendorPrefix = '';
                    return this.vendorPrefix;
                }

                for (var i = 0; i < prefixes.length; i++) {
                    if ((prefixes[i] + 'Transform') in div.style) {
                        this.vendorPrefix = '-' + prefixes[i].toLowerCase() + '-';
                        break;
                    }
                }

                return this.vendorPrefix;
            },

            // Check the name of the transition's complete event in the current browser
            getTransitionEvent: function () {
                if (this.transitionEvent !== null) {
                    return this.transitionEvent;
                }

                var div = document.createElement('div'),
                    transitions = {
                        'transition': 'transitionend',
                        'WebkitTransition': 'webkitTransitionEnd',
                        'MozTransition': 'transitionend',
                        'OTransition': 'oTransitionEnd'
                    };

                for (var transition in transitions) {
                    if (transition in div.style) {
                        this.transitionEvent = transitions[transition];
                        break;
                    }
                }

                return this.transitionEvent;
            },

            // If a single image is passed, check if it's loaded.
            // If a different element is passed, check if there are images
            // inside it, and check if these images are loaded.
            checkImagesComplete: function (target, callback) {
                var that = this,

                    // Check the initial status of the image(s)
                    status = this.checkImagesStatus(target);

                // If there are loading images, wait for them to load.
                // If the images are loaded, call the callback function directly.
                if (status === 'loading') {
                    var checkImages = setInterval(function () {
                        status = that.checkImagesStatus(target);

                        if (status === 'complete') {
                            clearInterval(checkImages);

                            if (typeof callback === 'function') {
                                callback();
                            }
                        }
                    }, 100);
                } else if (typeof callback === 'function') {
                    callback();
                }

                return status;
            },

            checkImagesStatus: function (target) {
                var status = 'complete';

                if (target.is('img') && target[0].complete === false) {
                    status = 'loading';
                } else {
                    target.find('img').each(function (index) {
                        var image = $(this)[0];

                        if (image.complete === false) {
                            status = 'loading';
                        }
                    });
                }

                return status;
            }
        };

        window.SliderProUtils = SliderProUtils;

    })(window, jQuery);

// Thumbnails module for Slider Pro.
// 
// Adds the possibility to create a thumbnail scroller, each thumbnail
// corresponding to a slide.
; (function (window, $) {

    "use strict";

    var NS = 'Thumbnails.' + $.SliderPro.namespace;

    var Thumbnails = {

        // Reference to the thumbnail scroller 
        $thumbnails: null,

        // Reference to the container of the thumbnail scroller
        $thumbnailsContainer: null,

        // List of Thumbnail objects
        thumbnails: null,

        // Index of the selected thumbnail
        selectedThumbnailIndex: 0,

        // Total size (width or height, depending on the orientation) of the thumbnails
        thumbnailsSize: 0,

        // Size of the thumbnail's container
        thumbnailsContainerSize: 0,

        // The position of the thumbnail scroller inside its container
        thumbnailsPosition: 0,

        // Orientation of the thumbnails
        thumbnailsOrientation: null,

        // Indicates the 'left' or 'top' position based on the orientation of the thumbnails
        thumbnailsPositionProperty: null,

        // Indicates if there are thumbnails in the slider
        isThumbnailScroller: false,

        initThumbnails: function () {
            var that = this;

            this.thumbnails = [];

            this.on('update.' + NS, $.proxy(this._thumbnailsOnUpdate, this));
            this.on('sliderResize.' + NS, $.proxy(this._thumbnailsOnResize, this));
            this.on('gotoSlide.' + NS, function (event) {
                that._gotoThumbnail(event.index);
            });
        },

        // Called when the slider is updated
        _thumbnailsOnUpdate: function () {
            var that = this;

            if (this.$slider.find('.sp-thumbnail').length === 0 && this.thumbnails.length === 0) {
                this.isThumbnailScroller = false;
                return;
            }

            this.isThumbnailScroller = true;

            // Create the container of the thumbnail scroller, if it wasn't created yet
            if (this.$thumbnailsContainer === null) {
                this.$thumbnailsContainer = $('<div class="sp-thumbnails-container"></div>').insertAfter(this.$slidesContainer);
            }

            // If the thumbnails' main container doesn't exist, create it, and get a reference to it
            if (this.$thumbnails === null) {
                if (this.$slider.find('.sp-thumbnails').length !== 0) {
                    this.$thumbnails = this.$slider.find('.sp-thumbnails').appendTo(this.$thumbnailsContainer);

                    // Shuffle/randomize the thumbnails
                    if (this.settings.shuffle === true) {
                        var thumbnails = this.$thumbnails.find('.sp-thumbnail'),
                            shuffledThumbnails = [];

                        // Reposition the thumbnails based on the order of the indexes in the
                        // 'shuffledIndexes' array
                        $.each(this.shuffledIndexes, function (index, element) {
                            var thumbnail = $(thumbnails[element]);

                            if (thumbnail.parent('a').length !== 0) {
                                thumbnail = thumbnail.parent('a');
                            }

                            shuffledThumbnails.push(thumbnail);
                        });

                        // Append the sorted thumbnails to the thumbnail scroller
                        this.$thumbnails.empty().append(shuffledThumbnails);
                    }
                } else {
                    this.$thumbnails = $('<div class="sp-thumbnails"></div>').appendTo(this.$thumbnailsContainer);
                }
            }

            // Check if there are thumbnails inside the slides and move them in the thumbnails container
            this.$slides.find('.sp-thumbnail').each(function (index) {
                var $thumbnail = $(this),
                    thumbnailIndex = $thumbnail.parents('.sp-slide').index(),
                    lastThumbnailIndex = that.$thumbnails.find('.sp-thumbnail').length - 1;

                // If the index of the slide that contains the thumbnail is greater than the total number
                // of thumbnails from the thumbnails container, position the thumbnail at the end.
                // Otherwise, add the thumbnails at the corresponding position.
                if (thumbnailIndex > lastThumbnailIndex) {
                    $thumbnail.appendTo(that.$thumbnails);
                } else {
                    $thumbnail.insertBefore(that.$thumbnails.find('.sp-thumbnail').eq(thumbnailIndex));
                }
            });

            // Loop through the Thumbnail objects and if a corresponding element is not found in the DOM,
            // it means that the thumbnail might have been removed. In this case, destroy that Thumbnail instance.
            for (var i = this.thumbnails.length - 1; i >= 0; i--) {
                if (this.$thumbnails.find('.sp-thumbnail[data-index="' + i + '"]').length === 0) {
                    var thumbnail = this.thumbnails[i];

                    thumbnail.destroy();
                    this.thumbnails.splice(i, 1);
                }
            }

            // Loop through the thumbnails and if there is any uninitialized thumbnail,
            // initialize it, else update the thumbnail's index.
            this.$thumbnails.find('.sp-thumbnail').each(function (index) {
                var $thumbnail = $(this);

                if (typeof $thumbnail.attr('data-init') === 'undefined') {
                    that._createThumbnail($thumbnail, index);
                } else {
                    that.thumbnails[index].setIndex(index);
                }
            });

            // Remove the previous class that corresponds to the position of the thumbnail scroller
            this.$thumbnailsContainer.removeClass('sp-top-thumbnails sp-bottom-thumbnails sp-left-thumbnails sp-right-thumbnails');

            // Check the position of the thumbnail scroller and assign it the appropriate class and styling
            if (this.settings.thumbnailsPosition === 'top') {
                this.$thumbnailsContainer.addClass('sp-top-thumbnails');
                this.thumbnailsOrientation = 'horizontal';
            } else if (this.settings.thumbnailsPosition === 'bottom') {
                this.$thumbnailsContainer.addClass('sp-bottom-thumbnails');
                this.thumbnailsOrientation = 'horizontal';
            } else if (this.settings.thumbnailsPosition === 'left') {
                this.$thumbnailsContainer.addClass('sp-left-thumbnails');
                this.thumbnailsOrientation = 'vertical';
            } else if (this.settings.thumbnailsPosition === 'right') {
                this.$thumbnailsContainer.addClass('sp-right-thumbnails');
                this.thumbnailsOrientation = 'vertical';
            }

            // Check if the pointer needs to be created
            if (this.settings.thumbnailPointer === true) {
                this.$thumbnailsContainer.addClass('sp-has-pointer');
            } else {
                this.$thumbnailsContainer.removeClass('sp-has-pointer');
            }

            // Mark the thumbnail that corresponds to the selected slide
            this.selectedThumbnailIndex = this.selectedSlideIndex;
            this.$thumbnails.find('.sp-thumbnail-container').eq(this.selectedThumbnailIndex).addClass('sp-selected-thumbnail');

            // Calculate the total size of the thumbnails
            this.thumbnailsSize = 0;

            $.each(this.thumbnails, function (index, thumbnail) {
                thumbnail.setSize(that.settings.thumbnailWidth, that.settings.thumbnailHeight);
                that.thumbnailsSize += that.thumbnailsOrientation === 'horizontal' ? thumbnail.getSize().width : thumbnail.getSize().height;
            });

            // Set the size of the thumbnails
            if (this.thumbnailsOrientation === 'horizontal') {
                this.$thumbnails.css({ 'width': this.thumbnailsSize, 'height': this.settings.thumbnailHeight });
                this.$thumbnailsContainer.css('height', '');
                this.thumbnailsPositionProperty = 'left';
            } else {
                this.$thumbnails.css({ 'width': this.settings.thumbnailWidth, 'height': this.thumbnailsSize });
                this.$thumbnailsContainer.css('width', '');
                this.thumbnailsPositionProperty = 'top';
            }

            // Fire the 'thumbnailsUpdate' event
            this.trigger({ type: 'thumbnailsUpdate' });
            if ($.isFunction(this.settings.thumbnailsUpdate)) {
                this.settings.thumbnailsUpdate.call(this, { type: 'thumbnailsUpdate' });
            }
        },

        // Create an individual thumbnail
        _createThumbnail: function (element, index) {
            var that = this,
                thumbnail = new Thumbnail(element, this.$thumbnails, index);

            // When the thumbnail is clicked, navigate to the corresponding slide
            thumbnail.on('thumbnailClick.' + NS, function (event) {
                that.gotoSlide(event.index);
            });

            // Add the thumbnail at the specified index
            this.thumbnails.splice(index, 0, thumbnail);
        },

        // Called when the slider is resized.
        // Resets the size and position of the thumbnail scroller container.
        _thumbnailsOnResize: function () {
            if (this.isThumbnailScroller === false) {
                return;
            }

            var that = this,
                newThumbnailsPosition;

            if (this.thumbnailsOrientation === 'horizontal') {
                this.thumbnailsContainerSize = Math.min(this.$slidesMask.width(), this.thumbnailsSize);
                this.$thumbnailsContainer.css('width', this.thumbnailsContainerSize);

                // Reduce the slide mask's height, to make room for the thumbnails
                if (this.settings.forceSize === 'fullWindow') {
                    this.$slidesMask.css('height', this.$slidesMask.height() - this.$thumbnailsContainer.outerHeight(true));

                    // Resize the slide
                    this.slideHeight = this.$slidesMask.height();

                    $.each(this.slides, function (index, element) {
                        element.setSize(that.slideWidth, that.slideHeight);
                    });
                }
            } else if (this.thumbnailsOrientation === 'vertical') {

                // Check if the width of the slide mask plus the width of the thumbnail scroller is greater than
                // the width of the slider's container and if that's the case, reduce the slides container width
                // in order to make the entire slider fit inside the slider's container.
                if (this.$slidesMask.width() + this.$thumbnailsContainer.outerWidth(true) > this.$slider.parent().width()) {
                    // Reduce the slider's width, to make room for the thumbnails
                    if (this.settings.forceSize === 'fullWidth' || this.settings.forceSize === 'fullWindow') {
                        this.$slider.css('max-width', $(window).width() - this.$thumbnailsContainer.outerWidth(true));
                    } else {
                        this.$slider.css('max-width', this.$slider.parent().width() - this.$thumbnailsContainer.outerWidth(true));
                    }

                    this.$slidesMask.css('width', this.$slider.width());

                    // If the slides are horizontally oriented, update the visible size and the offset
                    // of the selected slide, since the slider's size was reduced to make room for the thumbnails.
                    // 
                    // If the slides are vertically oriented, update the width and height (to maintain the aspect ratio)
                    // of the slides.
                    if (this.settings.orientation === 'horizontal') {
                        this.visibleOffset = Math.round((this.$slider.width() - this.slideSize) / 2);
                        this.visibleSlidesSize = this.$slidesMask.width();
                    } else if (this.settings.orientation === 'vertical') {
                        this.slideWidth = this.$slider.width();

                        $.each(this.slides, function (index, element) {
                            element.setSize(that.slideWidth, that.slideHeight);
                        });
                    }

                    // Re-arrange the slides
                    this._resetSlidesPosition();
                }

                this.thumbnailsContainerSize = Math.min(this.$slidesMask.height(), this.thumbnailsSize);
                this.$thumbnailsContainer.css('height', this.thumbnailsContainerSize);
            }

            // If the total size of the thumbnails is smaller than the thumbnail scroller' container (which has
            // the same size as the slides container), it means that all the thumbnails will be visible, so set
            // the position of the thumbnail scroller to 0.
            // 
            // If that's not the case, the thumbnail scroller will be positioned based on which thumbnail is selected.
            if (this.thumbnailsSize <= this.thumbnailsContainerSize || this.$thumbnails.find('.sp-selected-thumbnail').length === 0) {
                newThumbnailsPosition = 0;
            } else {
                newThumbnailsPosition = Math.max(-this.thumbnails[this.selectedThumbnailIndex].getPosition()[this.thumbnailsPositionProperty], this.thumbnailsContainerSize - this.thumbnailsSize);
            }

            // Add a padding to the slider, based on the thumbnail scroller's orientation, to make room
            // for the thumbnails.
            if (this.settings.thumbnailsPosition === 'top') {
                this.$slider.css({ 'paddingTop': this.$thumbnailsContainer.outerHeight(true), 'paddingLeft': '', 'paddingRight': '' });
            } else if (this.settings.thumbnailsPosition === 'bottom') {
                this.$slider.css({ 'paddingTop': '', 'paddingLeft': '', 'paddingRight': '' });
            } else if (this.settings.thumbnailsPosition === 'left') {
                this.$slider.css({ 'paddingTop': '', 'paddingLeft': this.$thumbnailsContainer.outerWidth(true), 'paddingRight': '' });
            } else if (this.settings.thumbnailsPosition === 'right') {
                this.$slider.css({ 'paddingTop': '', 'paddingLeft': '', 'paddingRight': this.$thumbnailsContainer.outerWidth(true) });
            }

            this._moveThumbnailsTo(newThumbnailsPosition, true);
        },

        // Selects the thumbnail at the indicated index and moves the thumbnail scroller
        // accordingly.
        _gotoThumbnail: function (index) {
            if (this.isThumbnailScroller === false || typeof this.thumbnails[index] === 'undefined') {
                return;
            }

            var previousIndex = this.selectedThumbnailIndex,
                newThumbnailsPosition = this.thumbnailsPosition;

            this.selectedThumbnailIndex = index;

            // Set the 'selected' class to the appropriate thumbnail
            this.$thumbnails.find('.sp-selected-thumbnail').removeClass('sp-selected-thumbnail');
            this.$thumbnails.find('.sp-thumbnail-container').eq(this.selectedThumbnailIndex).addClass('sp-selected-thumbnail');

            // Calculate the new position that the thumbnail scroller needs to go to.
            // 
            // If the selected thumbnail has a higher index than the previous one, make sure that the thumbnail
            // that comes after the selected thumbnail will be visible, if the selected thumbnail is not the
            // last thumbnail in the list.
            // 
            // If the selected thumbnail has a lower index than the previous one, make sure that the thumbnail
            // that's before the selected thumbnail will be visible, if the selected thumbnail is not the
            // first thumbnail in the list.
            if (this.selectedThumbnailIndex >= previousIndex) {
                var nextThumbnailIndex = this.selectedThumbnailIndex === this.thumbnails.length - 1 ? this.selectedThumbnailIndex : this.selectedThumbnailIndex + 1,
                    nextThumbnail = this.thumbnails[nextThumbnailIndex],
                    nextThumbnailPosition = this.thumbnailsOrientation === 'horizontal' ? nextThumbnail.getPosition().right : nextThumbnail.getPosition().bottom,
                    thumbnailsRightPosition = -this.thumbnailsPosition + this.thumbnailsContainerSize;

                if (nextThumbnailPosition > thumbnailsRightPosition) {
                    newThumbnailsPosition = this.thumbnailsPosition - (nextThumbnailPosition - thumbnailsRightPosition);
                }
            } else if (this.selectedThumbnailIndex < previousIndex) {
                var previousThumbnailIndex = this.selectedThumbnailIndex === 0 ? this.selectedThumbnailIndex : this.selectedThumbnailIndex - 1,
                    previousThumbnail = this.thumbnails[previousThumbnailIndex],
                    previousThumbnailPosition = this.thumbnailsOrientation === 'horizontal' ? previousThumbnail.getPosition().left : previousThumbnail.getPosition().top;

                if (previousThumbnailPosition < -this.thumbnailsPosition) {
                    newThumbnailsPosition = -previousThumbnailPosition;
                }
            }

            // Move the thumbnail scroller to the calculated position
            this._moveThumbnailsTo(newThumbnailsPosition);

            // Fire the 'gotoThumbnail' event
            this.trigger({ type: 'gotoThumbnail' });
            if ($.isFunction(this.settings.gotoThumbnail)) {
                this.settings.gotoThumbnail.call(this, { type: 'gotoThumbnail' });
            }
        },

        // Move the thumbnail scroller to the indicated position
        _moveThumbnailsTo: function (position, instant, callback) {
            var that = this,
                css = {};

            // Return if the position hasn't changed
            if (position === this.thumbnailsPosition) {
                return;
            }

            this.thumbnailsPosition = position;

            // Use CSS transitions if they are supported. If not, use JavaScript animation
            if (this.supportedAnimation === 'css-3d' || this.supportedAnimation === 'css-2d') {
                var transition,
                    left = this.thumbnailsOrientation === 'horizontal' ? position : 0,
                    top = this.thumbnailsOrientation === 'horizontal' ? 0 : position;

                if (this.supportedAnimation === 'css-3d') {
                    css[this.vendorPrefix + 'transform'] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
                } else {
                    css[this.vendorPrefix + 'transform'] = 'translate(' + left + 'px, ' + top + 'px)';
                }

                if (typeof instant !== 'undefined' && instant === true) {
                    transition = '';
                } else {
                    this.$thumbnails.addClass('sp-animated');
                    transition = this.vendorPrefix + 'transform ' + 700 / 1000 + 's';

                    this.$thumbnails.on(this.transitionEvent, function (event) {
                        if (event.target !== event.currentTarget) {
                            return;
                        }

                        that.$thumbnails.off(that.transitionEvent);
                        that.$thumbnails.removeClass('sp-animated');

                        if (typeof callback === 'function') {
                            callback();
                        }

                        // Fire the 'thumbnailsMoveComplete' event
                        that.trigger({ type: 'thumbnailsMoveComplete' });
                        if ($.isFunction(that.settings.thumbnailsMoveComplete)) {
                            that.settings.thumbnailsMoveComplete.call(that, { type: 'thumbnailsMoveComplete' });
                        }
                    });
                }

                css[this.vendorPrefix + 'transition'] = transition;

                this.$thumbnails.css(css);
            } else {
                css['margin-' + this.thumbnailsPositionProperty] = position;

                if (typeof instant !== 'undefined' && instant === true) {
                    this.$thumbnails.css(css);
                } else {
                    this.$thumbnails
                        .addClass('sp-animated')
                        .animate(css, 700, function () {
                            that.$thumbnails.removeClass('sp-animated');

                            if (typeof callback === 'function') {
                                callback();
                            }

                            // Fire the 'thumbnailsMoveComplete' event
                            that.trigger({ type: 'thumbnailsMoveComplete' });
                            if ($.isFunction(that.settings.thumbnailsMoveComplete)) {
                                that.settings.thumbnailsMoveComplete.call(that, { type: 'thumbnailsMoveComplete' });
                            }
                        });
                }
            }
        },

        // Stop the movement of the thumbnail scroller
        _stopThumbnailsMovement: function () {
            var css = {};

            if (this.supportedAnimation === 'css-3d' || this.supportedAnimation === 'css-2d') {
                var matrixString = this.$thumbnails.css(this.vendorPrefix + 'transform'),
                    matrixType = matrixString.indexOf('matrix3d') !== -1 ? 'matrix3d' : 'matrix',
                    matrixArray = matrixString.replace(matrixType, '').match(/-?[0-9\.]+/g),
                    left = matrixType === 'matrix3d' ? parseInt(matrixArray[12], 10) : parseInt(matrixArray[4], 10),
                    top = matrixType === 'matrix3d' ? parseInt(matrixArray[13], 10) : parseInt(matrixArray[5], 10);

                if (this.supportedAnimation === 'css-3d') {
                    css[this.vendorPrefix + 'transform'] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
                } else {
                    css[this.vendorPrefix + 'transform'] = 'translate(' + left + 'px, ' + top + 'px)';
                }

                css[this.vendorPrefix + 'transition'] = '';

                this.$thumbnails.css(css);
                this.$thumbnails.off(this.transitionEvent);
                this.thumbnailsPosition = this.thumbnailsOrientation === 'horizontal' ? parseInt(matrixArray[4], 10) : parseInt(matrixArray[5], 10);
            } else {
                this.$thumbnails.stop();
                this.thumbnailsPosition = parseInt(this.$thumbnails.css('margin-' + this.thumbnailsPositionProperty), 10);
            }

            this.$thumbnails.removeClass('sp-animated');
        },

        // Destroy the module
        destroyThumbnails: function () {
            var that = this;

            // Remove event listeners
            this.off('update.' + NS);

            if (this.isThumbnailScroller === false) {
                return;
            }

            this.off('sliderResize.' + NS);
            this.off('gotoSlide.' + NS);
            $(window).off('resize.' + this.uniqueId + '.' + NS);

            // Destroy the individual thumbnails
            this.$thumbnails.find('.sp-thumbnail').each(function () {
                var $thumbnail = $(this),
                    index = parseInt($thumbnail.attr('data-index'), 10),
                    thumbnail = that.thumbnails[index];

                thumbnail.off('thumbnailClick.' + NS);
                thumbnail.destroy();
            });

            this.thumbnails.length = 0;

            // Add the thumbnail scroller directly in the slider and
            // remove the thumbnail scroller container
            this.$thumbnails.appendTo(this.$slider);
            this.$thumbnailsContainer.remove();

            // Remove any created padding
            this.$slider.css({ 'paddingTop': '', 'paddingLeft': '', 'paddingRight': '' });
        },

        thumbnailsDefaults: {

            // Sets the width of the thumbnail
            thumbnailWidth: 100,

            // Sets the height of the thumbnail
            thumbnailHeight: 80,

            // Sets the position of the thumbnail scroller (top, bottom, right, left)
            thumbnailsPosition: 'bottom',

            // Indicates if a pointer will be displayed for the selected thumbnail
            thumbnailPointer: false,

            // Called when the thumbnails are updated
            thumbnailsUpdate: function () { },

            // Called when a new thumbnail is selected
            gotoThumbnail: function () { },

            // Called when the thumbnail scroller has moved
            thumbnailsMoveComplete: function () { }
        }
    };

    var Thumbnail = function (thumbnail, thumbnails, index) {

        // Reference to the thumbnail jQuery element
        this.$thumbnail = thumbnail;

        // Reference to the thumbnail scroller
        this.$thumbnails = thumbnails;

        // Reference to the thumbnail's container, which will be 
        // created dynamically.
        this.$thumbnailContainer = null;

        // The width and height of the thumbnail
        this.width = 0;
        this.height = 0;

        // Indicates whether the thumbnail's image is loaded
        this.isImageLoaded = false;

        // Set the index of the slide
        this.setIndex(index);

        // Initialize the thumbnail
        this._init();
    };

    Thumbnail.prototype = {

        _init: function () {
            var that = this;

            // Mark the thumbnail as initialized
            this.$thumbnail.attr('data-init', true);

            // Create a container for the thumbnail and add the original thumbnail to this container.
            // Having a container will help crop the thumbnail image if it's too large.
            this.$thumbnailContainer = $('<div class="sp-thumbnail-container"></div>').appendTo(this.$thumbnails);

            if (this.$thumbnail.parent('a').length !== 0) {
                this.$thumbnail.parent('a').appendTo(this.$thumbnailContainer);
            } else {
                this.$thumbnail.appendTo(this.$thumbnailContainer);
            }

            // When the thumbnail container is clicked, fire an event
            this.$thumbnailContainer.on('click.' + NS, function () {
                that.trigger({ type: 'thumbnailClick.' + NS, index: that.index });
            });
        },

        // Set the width and height of the thumbnail
        setSize: function (width, height) {
            this.width = width;
            this.height = height;

            // Apply the width and height to the thumbnail's container
            this.$thumbnailContainer.css({ 'width': this.width, 'height': this.height });

            // If there is an image, resize it to fit the thumbnail container
            if (this.$thumbnail.is('img') && typeof this.$thumbnail.attr('data-src') === 'undefined') {
                this.resizeImage();
            }
        },

        // Return the width and height of the thumbnail
        getSize: function () {
            return {
                width: this.$thumbnailContainer.outerWidth(true),
                height: this.$thumbnailContainer.outerHeight(true)
            };
        },

        // Return the top, bottom, left and right position of the thumbnail
        getPosition: function () {
            return {
                left: this.$thumbnailContainer.position().left + parseInt(this.$thumbnailContainer.css('marginLeft'), 10),
                right: this.$thumbnailContainer.position().left + parseInt(this.$thumbnailContainer.css('marginLeft'), 10) + this.$thumbnailContainer.outerWidth(),
                top: this.$thumbnailContainer.position().top + parseInt(this.$thumbnailContainer.css('marginTop'), 10),
                bottom: this.$thumbnailContainer.position().top + parseInt(this.$thumbnailContainer.css('marginTop'), 10) + this.$thumbnailContainer.outerHeight()
            };
        },

        // Set the index of the thumbnail
        setIndex: function (index) {
            this.index = index;
            this.$thumbnail.attr('data-index', this.index);
        },

        // Resize the thumbnail's image
        resizeImage: function () {
            var that = this;

            // If the image is not loaded yet, load it
            if (this.isImageLoaded === false) {
                SliderProUtils.checkImagesComplete(this.$thumbnailContainer, function () {
                    that.isImageLoaded = true;
                    that.resizeImage();
                });

                return;
            }

            // Get the reference to the thumbnail image again because it was replaced by
            // another img element during the loading process
            this.$thumbnail = this.$thumbnailContainer.find('.sp-thumbnail');

            // Calculate whether the image should stretch horizontally or vertically
            var imageWidth = this.$thumbnail.width(),
                imageHeight = this.$thumbnail.height();

            if (imageWidth / imageHeight <= this.width / this.height) {
                this.$thumbnail.css({ width: '100%', height: 'auto' });
            } else {
                this.$thumbnail.css({ width: 'auto', height: '100%' });
            }

            this.$thumbnail.css({ 'marginLeft': (this.$thumbnailContainer.width() - this.$thumbnail.width()) * 0.5, 'marginTop': (this.$thumbnailContainer.height() - this.$thumbnail.height()) * 0.5 });
        },

        // Destroy the thumbnail
        destroy: function () {
            this.$thumbnailContainer.off('click.' + NS);

            // Remove added attributes
            this.$thumbnail.removeAttr('data-init');
            this.$thumbnail.removeAttr('data-index');

            // Remove the thumbnail's container and add the thumbnail
            // back to the thumbnail scroller container
            if (this.$thumbnail.parent('a').length !== 0) {
                this.$thumbnail.parent('a').insertBefore(this.$thumbnailContainer);
            } else {
                this.$thumbnail.insertBefore(this.$thumbnailContainer);
            }

            this.$thumbnailContainer.remove();
        },

        // Attach an event handler to the slide
        on: function (type, callback) {
            return this.$thumbnailContainer.on(type, callback);
        },

        // Detach an event handler to the slide
        off: function (type) {
            return this.$thumbnailContainer.off(type);
        },

        // Trigger an event on the slide
        trigger: function (data) {
            return this.$thumbnailContainer.triggerHandler(data);
        }
    };

    $.SliderPro.addModule('Thumbnails', Thumbnails);

})(window, jQuery);

// ConditionalImages module for Slider Pro.
// 
// Adds the possibility to specify multiple sources for each image and
// load the image that's the most appropriate for the size of the slider.
// For example, instead of loading a large image even if the slider will be small
// you can specify a smaller image that will be loaded instead.
; (function (window, $) {

    "use strict";

    var NS = 'ConditionalImages.' + $.SliderPro.namespace;

    var ConditionalImages = {

        // Reference to the previous size
        previousImageSize: null,

        // Reference to the current size
        currentImageSize: null,

        // Indicates if the current display supports high PPI
        isRetinaScreen: false,

        initConditionalImages: function () {
            this.currentImageSize = this.previousImageSize = 'default';
            this.isRetinaScreen = (typeof this._isRetina !== 'undefined') && (this._isRetina() === true);

            this.on('update.' + NS, $.proxy(this._conditionalImagesOnUpdate, this));
            this.on('sliderResize.' + NS, $.proxy(this._conditionalImagesOnResize, this));
        },

        // Loop through all the existing images and specify the original path of the image
        // inside the 'data-default' attribute.
        _conditionalImagesOnUpdate: function () {
            $.each(this.slides, function (index, element) {
                var $slide = element.$slide;

                $slide.find('img:not([ data-default ])').each(function () {
                    var $image = $(this);

                    if (typeof $image.attr('data-src') !== 'undefined') {
                        $image.attr('data-default', $image.attr('data-src'));
                    } else {
                        $image.attr('data-default', $image.attr('src'));
                    }
                });
            });
        },

        // When the window resizes, identify the applyable image size based on the current size of the slider
        // and apply it to all images that have a version of the image specified for this size.
        _conditionalImagesOnResize: function () {
            if (this.slideWidth <= this.settings.smallSize) {
                this.currentImageSize = 'small';
            } else if (this.slideWidth <= this.settings.mediumSize) {
                this.currentImageSize = 'medium';
            } else if (this.slideWidth <= this.settings.largeSize) {
                this.currentImageSize = 'large';
            } else {
                this.currentImageSize = 'default';
            }

            if (this.previousImageSize !== this.currentImageSize) {
                var that = this;

                $.each(this.slides, function (index, element) {
                    var $slide = element.$slide;

                    $slide.find('img').each(function () {
                        var $image = $(this),
                            imageSource = '';

                        // Check if the current display supports high PPI and if a retina version of the current size was specified
                        if (that.isRetinaScreen === true && typeof $image.attr('data-retina' + that.currentImageSize) !== 'undefined') {
                            imageSource = $image.attr('data-retina' + that.currentImageSize);

                            // If the retina image was not loaded yet, replace the default image source with the one
                            // that corresponds to the current slider size
                            if (typeof $image.attr('data-retina') !== 'undefined') {
                                $image.attr('data-retina', imageSource);
                            }
                        } else if (typeof $image.attr('data-' + that.currentImageSize) !== 'undefined') {
                            imageSource = $image.attr('data-' + that.currentImageSize);

                            // If the image is set to lazy load, replace the image source with the one
                            // that corresponds to the current slider size
                            if (typeof $image.attr('data-src') !== 'undefined') {
                                $image.attr('data-src', imageSource);
                            }
                        }

                        // If a new image was found
                        if (imageSource !== '') {

                            // The existence of the 'data-src' attribute indicates that the image
                            // will be lazy loaded, so don't load the new image yet
                            if (typeof $image.attr('data-src') === 'undefined') {
                                that._loadConditionalImage($image, imageSource, function (newImage) {
                                    if (newImage.hasClass('sp-image')) {
                                        element.$mainImage = newImage;
                                        element.resizeMainImage(true);
                                    }
                                });
                            }
                        }
                    });
                });

                this.previousImageSize = this.currentImageSize;
            }
        },

        // Replace the target image with a new image
        _loadConditionalImage: function (image, source, callback) {

            // Create a new image element
            var newImage = $(new Image());

            // Copy the class(es) and inline style
            newImage.attr('class', image.attr('class'));
            newImage.attr('style', image.attr('style'));

            // Copy the data attributes
            $.each(image.data(), function (name, value) {
                newImage.attr('data-' + name, value);
            });

            // Copy the width and height attributes if they exist
            if (typeof image.attr('width') !== 'undefined') {
                newImage.attr('width', image.attr('width'));
            }

            if (typeof image.attr('height') !== 'undefined') {
                newImage.attr('height', image.attr('height'));
            }

            if (typeof image.attr('alt') !== 'undefined') {
                newImage.attr('alt', image.attr('alt'));
            }

            if (typeof image.attr('title') !== 'undefined') {
                newImage.attr('title', image.attr('title'));
            }

            newImage.attr('src', source);

            // Add the new image in the same container and remove the older image
            newImage.insertAfter(image);
            image.remove();
            image = null;

            if (typeof callback === 'function') {
                callback(newImage);
            }
        },

        // Destroy the module
        destroyConditionalImages: function () {
            this.off('update.' + NS);
            this.off('sliderResize.' + NS);
        },

        conditionalImagesDefaults: {

            // If the slider size is below this size, the small version of the images will be used
            smallSize: 480,

            // If the slider size is below this size, the small version of the images will be used
            mediumSize: 768,

            // If the slider size is below this size, the small version of the images will be used
            largeSize: 1024
        }
    };

    $.SliderPro.addModule('ConditionalImages', ConditionalImages);

})(window, jQuery);

// Lazy Loading module for Slider Pro.
// 
// Adds the possibility to delay the loading of the images until the slides/thumbnails
// that contain them become visible. This technique improves the initial loading
// performance.
; (function (window, $) {

    "use strict";

    var NS = 'LazyLoading.' + $.SliderPro.namespace;

    var LazyLoading = {

        allowLazyLoadingCheck: true,

        initLazyLoading: function () {
            var that = this;

            // The 'resize' event is fired after every update, so it's possible to use it for checking
            // if the update made new slides become visible
            // 
            // Also, resizing the slider might make new slides or thumbnails visible
            this.on('sliderResize.' + NS, $.proxy(this._lazyLoadingOnResize, this));

            // Check visible images when a new slide is selected
            this.on('gotoSlide.' + NS, $.proxy(this._checkAndLoadVisibleImages, this));

            // Check visible thumbnail images when the thumbnails are updated because new thumbnail
            // might have been added or the settings might have been changed so that more thumbnail
            // images become visible
            // 
            // Also, check visible thumbnail images after the thumbnails have moved because new thumbnails might
            // have become visible
            this.on('thumbnailsUpdate.' + NS + ' ' + 'thumbnailsMoveComplete.' + NS, $.proxy(this._checkAndLoadVisibleThumbnailImages, this));
        },

        _lazyLoadingOnResize: function () {
            var that = this;

            if (this.allowLazyLoadingCheck === false) {
                return;
            }

            this.allowLazyLoadingCheck = false;

            this._checkAndLoadVisibleImages();

            if (this.$slider.find('.sp-thumbnail').length !== 0) {
                this._checkAndLoadVisibleThumbnailImages();
            }

            // Use a timer to deffer the loading of images in order to prevent too many
            // checking attempts
            setTimeout(function () {
                that.allowLazyLoadingCheck = true;
            }, 500);
        },

        // Check visible slides and load their images
        _checkAndLoadVisibleImages: function () {
            if (this.$slider.find('.sp-slide:not([ data-loaded ])').length === 0) {
                return;
            }

            var that = this,

                // Use either the middle position or the index of the selected slide as a reference, depending on
                // whether the slider is loopable
                referencePosition = this.settings.loop === true ? this.middleSlidePosition : this.selectedSlideIndex,

                // Calculate how many slides are visible at the sides of the selected slide
                visibleOnSides = Math.ceil((this.visibleSlidesSize - this.slideSize) / 2 / this.slideSize),

                // Calculate the indexes of the first and last slide that will be checked
                from = referencePosition - visibleOnSides - 1 > 0 ? referencePosition - visibleOnSides - 1 : 0,
                to = referencePosition + visibleOnSides + 1 < this.getTotalSlides() - 1 ? referencePosition + visibleOnSides + 1 : this.getTotalSlides() - 1,

                // Get all the slides that need to be checked
                slidesToCheck = this.slidesOrder.slice(from, to + 1);

            // Loop through the selected slides and if the slide is not marked as having
            // been loaded yet, loop through its images and load them.
            $.each(slidesToCheck, function (index, element) {
                var slide = that.slides[element],
                    $slide = slide.$slide;

                if (typeof $slide.attr('data-loaded') === 'undefined') {
                    $slide.attr('data-loaded', true);

                    $slide.find('img[ data-src ]').each(function () {
                        var image = $(this);
                        that._loadImage(image, function (newImage) {
                            if (newImage.hasClass('sp-image')) {
                                slide.$mainImage = newImage;
                                slide.resizeMainImage(true);
                            }
                        });
                    });
                }
            });
        },

        // Check visible thumbnails and load their images
        _checkAndLoadVisibleThumbnailImages: function () {
            if (this.$slider.find('.sp-thumbnail-container:not([ data-loaded ])').length === 0) {
                return;
            }

            var that = this,
                thumbnailSize = this.thumbnailsSize / this.thumbnails.length,

                // Calculate the indexes of the first and last thumbnail that will be checked
                from = Math.floor(Math.abs(this.thumbnailsPosition / thumbnailSize)),
                to = Math.floor((-this.thumbnailsPosition + this.thumbnailsContainerSize) / thumbnailSize),

                // Get all the thumbnails that need to be checked
                thumbnailsToCheck = this.thumbnails.slice(from, to + 1);

            // Loop through the selected thumbnails and if the thumbnail is not marked as having
            // been loaded yet, load its image.
            $.each(thumbnailsToCheck, function (index, element) {
                var $thumbnailContainer = element.$thumbnailContainer;

                if (typeof $thumbnailContainer.attr('data-loaded') === 'undefined') {
                    $thumbnailContainer.attr('data-loaded', true);

                    $thumbnailContainer.find('img[ data-src ]').each(function () {
                        var image = $(this);

                        that._loadImage(image, function () {
                            element.resizeImage();
                        });
                    });
                }
            });
        },

        // Load an image
        _loadImage: function (image, callback) {
            // Create a new image element
            var newImage = $(new Image());

            // Copy the class(es) and inline style
            newImage.attr('class', image.attr('class'));
            newImage.attr('style', image.attr('style'));

            // Copy the data attributes
            $.each(image.data(), function (name, value) {
                newImage.attr('data-' + name, value);
            });

            // Copy the width and height attributes if they exist
            if (typeof image.attr('width') !== 'undefined') {
                newImage.attr('width', image.attr('width'));
            }

            if (typeof image.attr('height') !== 'undefined') {
                newImage.attr('height', image.attr('height'));
            }

            if (typeof image.attr('alt') !== 'undefined') {
                newImage.attr('alt', image.attr('alt'));
            }

            if (typeof image.attr('title') !== 'undefined') {
                newImage.attr('title', image.attr('title'));
            }

            // Assign the source of the image
            newImage.attr('src', image.attr('data-src'));
            newImage.removeAttr('data-src');

            // Add the new image in the same container and remove the older image
            newImage.insertAfter(image);
            image.remove();
            image = null;

            if (typeof callback === 'function') {
                callback(newImage);
            }
        },

        // Destroy the module
        destroyLazyLoading: function () {
            this.off('update.' + NS);
            this.off('gotoSlide.' + NS);
            this.off('sliderResize.' + NS);
            this.off('thumbnailsUpdate.' + NS);
            this.off('thumbnailsMoveComplete.' + NS);
        }
    };

    $.SliderPro.addModule('LazyLoading', LazyLoading);

})(window, jQuery);

// Retina module for Slider Pro.
// 
// Adds the possibility to load a different image when the slider is
// viewed on a retina screen.
; (function (window, $) {

    "use strict";

    var NS = 'Retina.' + $.SliderPro.namespace;

    var Retina = {

        initRetina: function () {
            var that = this;

            // Return if it's not a retina screen
            if (this._isRetina() === false) {
                return;
            }

            // Check if the Lazy Loading module is enabled and overwrite its loading method.
            // If not, replace all images with their retina version directly.
            if (typeof this._loadImage !== 'undefined') {
                this._loadImage = this._loadRetinaImage;
            } else {
                this.on('update.' + NS, $.proxy(this._checkRetinaImages, this));

                if (this.$slider.find('.sp-thumbnail').length !== 0) {
                    this.on('update.Thumbnails.' + NS, $.proxy(this._checkRetinaThumbnailImages, this));
                }
            }
        },

        // Checks if the current display supports high PPI
        _isRetina: function () {
            if (window.devicePixelRatio >= 2) {
                return true;
            }

            if (window.matchMedia && (window.matchMedia("(-webkit-min-device-pixel-ratio: 2),(min-resolution: 2dppx)").matches)) {
                return true;
            }

            return false;
        },

        // Loop through the slides and replace the images with their retina version
        _checkRetinaImages: function () {
            var that = this;

            $.each(this.slides, function (index, element) {
                var $slide = element.$slide;

                if (typeof $slide.attr('data-loaded') === 'undefined') {
                    $slide.attr('data-loaded', true);

                    $slide.find('img').each(function () {
                        var image = $(this);
                        that._loadRetinaImage(image, function (newImage) {
                            if (newImage.hasClass('sp-image')) {
                                element.$mainImage = newImage;
                                element.resizeMainImage(true);
                            }
                        });
                    });
                }
            });
        },

        // Loop through the thumbnails and replace the images with their retina version
        _checkRetinaThumbnailImages: function () {
            var that = this;

            this.$thumbnails.find('.sp-thumbnail-container').each(function () {
                var $thumbnail = $(this);

                if (typeof $thumbnail.attr('data-loaded') === 'undefined') {
                    $thumbnail.attr('data-loaded', true);
                    that._loadRetinaImage($thumbnail.find('img'));
                }
            });
        },

        // Load the retina image
        _loadRetinaImage: function (image, callback) {
            var retinaFound = false,
                newImagePath = '';

            // Check if there is a retina image specified
            if (typeof image.attr('data-retina') !== 'undefined') {
                retinaFound = true;

                newImagePath = image.attr('data-retina');
                image.removeAttr('data-retina');
            }

            // Check if there is a lazy loaded, non-retina, image specified
            if (typeof image.attr('data-src') !== 'undefined') {
                if (retinaFound === false) {
                    newImagePath = image.attr('data-src');
                }

                image.removeAttr('data-src');
            }

            // Return if there isn't a retina or lazy loaded image
            if (newImagePath === '') {
                return;
            }

            // Create a new image element
            var newImage = $(new Image());

            // Copy the class(es) and inline style
            newImage.attr('class', image.attr('class'));
            newImage.attr('style', image.attr('style'));

            // Copy the data attributes
            $.each(image.data(), function (name, value) {
                newImage.attr('data-' + name, value);
            });

            // Copy the width and height attributes if they exist
            if (typeof image.attr('width') !== 'undefined') {
                newImage.attr('width', image.attr('width'));
            }

            if (typeof image.attr('height') !== 'undefined') {
                newImage.attr('height', image.attr('height'));
            }

            if (typeof image.attr('alt') !== 'undefined') {
                newImage.attr('alt', image.attr('alt'));
            }

            if (typeof image.attr('title') !== 'undefined') {
                newImage.attr('title', image.attr('title'));
            }

            // Add the new image in the same container and remove the older image
            newImage.insertAfter(image);
            image.remove();
            image = null;

            // Assign the source of the image
            newImage.attr('src', newImagePath);

            if (typeof callback === 'function') {
                callback(newImage);
            }
        },

        // Destroy the module
        destroyRetina: function () {
            this.off('update.' + NS);
            this.off('update.Thumbnails.' + NS);
        }
    };

    $.SliderPro.addModule('Retina', Retina);

})(window, jQuery);

// Layers module for Slider Pro.
// 
// Adds support for animated and static layers. The layers can contain any content,
// from simple text for video elements.
; (function (window, $) {

    "use strict";

    var NS = 'Layers.' + $.SliderPro.namespace;

    var Layers = {

        // Reference to the original 'gotoSlide' method
        layersGotoSlideReference: null,

        // Reference to the timer that will delay the overriding
        // of the 'gotoSlide' method
        waitForLayersTimer: null,

        initLayers: function () {
            this.on('update.' + NS, $.proxy(this._layersOnUpdate, this));
            this.on('sliderResize.' + NS, $.proxy(this._layersOnResize, this));
            this.on('gotoSlide.' + NS, $.proxy(this._layersOnGotoSlide, this));
        },

        // Loop through the slides and initialize all layers
        _layersOnUpdate: function (event) {
            var that = this;

            $.each(this.slides, function (index, element) {
                var $slide = element.$slide;

                // Initialize the layers and add them to the the layers container
                this.$slide.find('.sp-layer:not([ data-init ])').each(function () {
                    var layer = new Layer($(this));

                    // Add the 'layers' array to the slide objects (instance of SliderProSlide)
                    if (typeof element.layers === 'undefined') {
                        element.layers = [];
                    }

                    element.layers.push(layer);

                    if ($(this).hasClass('sp-static') === false) {

                        // Add the 'animatedLayers' array to the slide objects (instance of SliderProSlide)
                        if (typeof element.animatedLayers === 'undefined') {
                            element.animatedLayers = [];
                        }

                        element.animatedLayers.push(layer);
                    }

                    $(this).appendTo($slide);
                });
            });

            // If the 'waitForLayers' option is enabled, the slider will not move to another slide
            // until all the layers from the previous slide will be hidden. To achieve this,
            // replace the current 'gotoSlide' function with another function that will include the 
            // required functionality.
            // 
            // Since the 'gotoSlide' method might be overridden by other modules as well, delay this
            // override to make sure it's the last override.
            if (this.settings.waitForLayers === true) {
                clearTimeout(this.waitForLayersTimer);

                this.waitForLayersTimer = setTimeout(function () {
                    that.layersGotoSlideReference = that.gotoSlide;
                    that.gotoSlide = that._layersGotoSlide;
                }, 1);
            }
        },

        // When the slider resizes, try to scale down the layers proportionally. The automatic scaling
        // will make use of an option, 'autoScaleReference', by comparing the current width of the slider
        // with the reference width. So, if the reference width is 1000 pixels and the current width is
        // 500 pixels, it means that the layers will be scaled down to 50% of their size.
        _layersOnResize: function () {
            var that = this,
                autoScaleReference,
                useAutoScale = this.settings.autoScaleLayers,
                scaleRatio;

            if (this.settings.autoScaleLayers === false) {
                // Show the layers for the initial slide
                this.showLayers(this.selectedSlideIndex);

                return;
            }

            // If there isn't a reference for how the layers should scale down automatically, use the 'width'
            // option as a reference, unless the width was set to a percentage. If there isn't a set reference and
            // the width was set to a percentage, auto scaling will not be used because it's not possible to
            // calculate how much should the layers scale.
            if (this.settings.autoScaleReference === -1) {
                if (typeof this.settings.width === 'string' && this.settings.width.indexOf('%') !== -1) {
                    useAutoScale = false;
                } else {
                    autoScaleReference = parseInt(this.settings.width, 10);
                }
            } else {
                autoScaleReference = this.settings.autoScaleReference;
            }

            if (useAutoScale === true && this.slideWidth < autoScaleReference) {
                scaleRatio = that.slideWidth / autoScaleReference;
            } else {
                scaleRatio = 1;
            }

            $.each(this.slides, function (index, slide) {
                if (typeof slide.layers !== 'undefined') {
                    $.each(slide.layers, function (index, layer) {
                        layer.scale(scaleRatio);
                    });
                }
            });

            // Show the layers for the initial slide
            this.showLayers(this.selectedSlideIndex);
        },

        // Replace the 'gotoSlide' method with this one, which makes it possible to 
        // change the slide only after the layers from the previous slide are hidden.
        _layersGotoSlide: function (index) {
            var that = this,
                animatedLayers = this.slides[this.selectedSlideIndex].animatedLayers;

            // If the slider is dragged, don't wait for the layer to hide
            if (this.$slider.hasClass('sp-swiping') || typeof animatedLayers === 'undefined' || animatedLayers.length === 0) {
                this.layersGotoSlideReference(index);
            } else {
                this.on('hideLayersComplete.' + NS, function () {
                    that.off('hideLayersComplete.' + NS);
                    that.layersGotoSlideReference(index);
                });

                this.hideLayers(this.selectedSlideIndex);
            }
        },

        // When a new slide is selected, hide the layers from the previous slide
        // and show the layers from the current slide.
        _layersOnGotoSlide: function (event) {
            if (this.previousSlideIndex !== this.selectedSlideIndex) {
                this.hideLayers(this.previousSlideIndex);
            }

            this.showLayers(this.selectedSlideIndex);
        },

        // Show the animated layers from the slide at the specified index,
        // and fire an event when all the layers from the slide become visible.
        showLayers: function (index) {
            var that = this,
                animatedLayers = this.slides[index].animatedLayers,
                layerCounter = 0;

            if (typeof animatedLayers === 'undefined') {
                return;
            }

            $.each(animatedLayers, function (index, element) {

                // If the layer is already visible, increment the counter directly, else wait 
                // for the layer's showing animation to complete.
                if (element.isVisible() === true) {
                    layerCounter++;

                    if (layerCounter === animatedLayers.length) {
                        that.trigger({ type: 'showLayersComplete', index: index });
                        if ($.isFunction(that.settings.showLayersComplete)) {
                            that.settings.showLayersComplete.call(that, { type: 'showLayersComplete', index: index });
                        }
                    }
                } else {
                    element.show(function () {
                        layerCounter++;

                        if (layerCounter === animatedLayers.length) {
                            that.trigger({ type: 'showLayersComplete', index: index });
                            if ($.isFunction(that.settings.showLayersComplete)) {
                                that.settings.showLayersComplete.call(that, { type: 'showLayersComplete', index: index });
                            }
                        }
                    });
                }
            });
        },

        // Hide the animated layers from the slide at the specified index,
        // and fire an event when all the layers from the slide become invisible.
        hideLayers: function (index) {
            var that = this,
                animatedLayers = this.slides[index].animatedLayers,
                layerCounter = 0;

            if (typeof animatedLayers === 'undefined') {
                return;
            }

            $.each(animatedLayers, function (index, element) {

                // If the layer is already invisible, increment the counter directly, else wait 
                // for the layer's hiding animation to complete.
                if (element.isVisible() === false) {
                    layerCounter++;

                    if (layerCounter === animatedLayers.length) {
                        that.trigger({ type: 'hideLayersComplete', index: index });
                        if ($.isFunction(that.settings.hideLayersComplete)) {
                            that.settings.hideLayersComplete.call(that, { type: 'hideLayersComplete', index: index });
                        }
                    }
                } else {
                    element.hide(function () {
                        layerCounter++;

                        if (layerCounter === animatedLayers.length) {
                            that.trigger({ type: 'hideLayersComplete', index: index });
                            if ($.isFunction(that.settings.hideLayersComplete)) {
                                that.settings.hideLayersComplete.call(that, { type: 'hideLayersComplete', index: index });
                            }
                        }
                    });
                }
            });
        },

        // Destroy the module
        destroyLayers: function () {
            this.off('update.' + NS);
            this.off('resize.' + NS);
            this.off('gotoSlide.' + NS);
            this.off('hideLayersComplete.' + NS);
        },

        layersDefaults: {

            // Indicates whether the slider will wait for the layers to disappear before
            // going to a new slide
            waitForLayers: false,

            // Indicates whether the layers will be scaled automatically
            autoScaleLayers: true,

            // Sets a reference width which will be compared to the current slider width
            // in order to determine how much the layers need to scale down. By default,
            // the reference width will be equal to the slide width. However, if the slide width
            // is set to a percentage value, then it's necessary to set a specific value for 'autoScaleReference'.
            autoScaleReference: -1,

            // Called when all animated layers become visible
            showLayersComplete: function () { },

            // Called when all animated layers become invisible
            hideLayersComplete: function () { }
        }
    };

    // Override the slide's 'destroy' method in order to destroy the 
    // layers that where added to the slide as well.
    var slideDestroy = window.SliderProSlide.prototype.destroy;

    window.SliderProSlide.prototype.destroy = function () {
        if (typeof this.layers !== 'undefined') {
            $.each(this.layers, function (index, element) {
                element.destroy();
            });

            this.layers.length = 0;
        }

        if (typeof this.animatedLayers !== 'undefined') {
            this.animatedLayers.length = 0;
        }

        slideDestroy.apply(this);
    };

    var Layer = function (layer) {

        // Reference to the layer jQuery element
        this.$layer = layer;

        // Indicates whether a layer is currently visible or hidden
        this.visible = false;

        // Indicates whether the layer was styled
        this.styled = false;

        // Holds the data attributes added to the layer
        this.data = null;

        // Indicates the layer's reference point (topLeft, bottomLeft, topRight or bottomRight)
        this.position = null;

        // Indicates which CSS property (left or right) will be used for positioning the layer 
        this.horizontalProperty = null;

        // Indicates which CSS property (top or bottom) will be used for positioning the layer 
        this.verticalProperty = null;

        // Indicates the value of the horizontal position
        this.horizontalPosition = null;

        // Indicates the value of the vertical position
        this.verticalPosition = null;

        // Indicates how much the layers needs to be scaled
        this.scaleRatio = 1;

        // Indicates the type of supported transition (CSS3 2D, CSS3 3D or JavaScript)
        this.supportedAnimation = SliderProUtils.getSupportedAnimation();

        // Indicates the required vendor prefix for CSS (i.e., -webkit, -moz, etc.)
        this.vendorPrefix = SliderProUtils.getVendorPrefix();

        // Indicates the name of the CSS transition's complete event (i.e., transitionend, webkitTransitionEnd, etc.)
        this.transitionEvent = SliderProUtils.getTransitionEvent();

        // Reference to the timer that will be used to hide the layers automatically after a given time interval
        this.stayTimer = null;

        this._init();
    };

    Layer.prototype = {

        // Initialize the layers
        _init: function () {
            this.$layer.attr('data-init', true);

            if (this.$layer.hasClass('sp-static')) {
                this._setStyle();
            } else {
                this.$layer.css({ 'visibility': 'hidden', 'display': 'none' });
            }
        },

        // Set the size and position of the layer
        _setStyle: function () {
            this.styled = true;

            this.$layer.css('display', '');

            // Get the data attributes specified in HTML
            this.data = this.$layer.data();

            if (typeof this.data.width !== 'undefined') {
                this.$layer.css('width', this.data.width);
            }

            if (typeof this.data.height !== 'undefined') {
                this.$layer.css('height', this.data.height);
            }

            if (typeof this.data.depth !== 'undefined') {
                this.$layer.css('z-index', this.data.depth);
            }

            this.position = this.data.position ? (this.data.position).toLowerCase() : 'topleft';

            if (this.position.indexOf('right') !== -1) {
                this.horizontalProperty = 'right';
            } else if (this.position.indexOf('left') !== -1) {
                this.horizontalProperty = 'left';
            } else {
                this.horizontalProperty = 'center';
            }

            if (this.position.indexOf('bottom') !== -1) {
                this.verticalProperty = 'bottom';
            } else if (this.position.indexOf('top') !== -1) {
                this.verticalProperty = 'top';
            } else {
                this.verticalProperty = 'center';
            }

            this._setPosition();

            this.scale(this.scaleRatio);
        },

        // Set the position of the layer
        _setPosition: function () {
            var inlineStyle = this.$layer.attr('style');

            this.horizontalPosition = typeof this.data.horizontal !== 'undefined' ? this.data.horizontal : 0;
            this.verticalPosition = typeof this.data.vertical !== 'undefined' ? this.data.vertical : 0;

            // Set the horizontal position of the layer based on the data set
            if (this.horizontalProperty === 'center') {

                // prevent content wrapping while setting the width
                if (typeof inlineStyle === 'undefined' || (typeof inlineStyle !== 'undefined' && inlineStyle.indexOf('width') === -1)) {
                    this.$layer.css('white-space', 'nowrap');
                    this.$layer.css('width', this.$layer.outerWidth(true));
                }

                this.$layer.css({ 'marginLeft': 'auto', 'marginRight': 'auto', 'left': this.horizontalPosition, 'right': 0 });
            } else {
                this.$layer.css(this.horizontalProperty, this.horizontalPosition);
            }

            // Set the vertical position of the layer based on the data set
            if (this.verticalProperty === 'center') {

                // prevent content wrapping while setting the height
                if (typeof inlineStyle === 'undefined' || (typeof inlineStyle !== 'undefined' && inlineStyle.indexOf('height') === -1)) {
                    this.$layer.css('white-space', 'nowrap');
                    this.$layer.css('height', this.$layer.outerHeight(true));
                }

                this.$layer.css({ 'marginTop': 'auto', 'marginBottom': 'auto', 'top': this.verticalPosition, 'bottom': 0 });
            } else {
                this.$layer.css(this.verticalProperty, this.verticalPosition);
            }
        },

        // Scale the layer
        scale: function (ratio) {

            // Return if the layer is set to be unscalable
            if (this.$layer.hasClass('sp-no-scale')) {
                return;
            }

            // Store the ratio (even if the layer is not ready to be scaled yet)
            this.scaleRatio = ratio;

            // Return if the layer is not styled yet
            if (this.styled === false) {
                return;
            }

            var horizontalProperty = this.horizontalProperty === 'center' ? 'left' : this.horizontalProperty,
                verticalProperty = this.verticalProperty === 'center' ? 'top' : this.verticalProperty,
                css = {};

            // Apply the scaling
            css[this.vendorPrefix + 'transform-origin'] = this.horizontalProperty + ' ' + this.verticalProperty;
            css[this.vendorPrefix + 'transform'] = 'scale(' + this.scaleRatio + ')';

            // If the position is not set to a percentage value, apply the scaling to the position
            if (typeof this.horizontalPosition !== 'string') {
                css[horizontalProperty] = this.horizontalPosition * this.scaleRatio;
            }

            // If the position is not set to a percentage value, apply the scaling to the position
            if (typeof this.verticalPosition !== 'string') {
                css[verticalProperty] = this.verticalPosition * this.scaleRatio;
            }

            // If the width or height is set to a percentage value, increase the percentage in order to
            // maintain the same layer to slide proportions. This is necessary because otherwise the scaling
            // transform would minimize the layers more than intended.
            if (typeof this.data.width === 'string' && this.data.width.indexOf('%') !== -1) {
                css.width = (parseInt(this.data.width, 10) / this.scaleRatio).toString() + '%';
            }

            if (typeof this.data.height === 'string' && this.data.height.indexOf('%') !== -1) {
                css.height = (parseInt(this.data.height, 10) / this.scaleRatio).toString() + '%';
            }

            this.$layer.css(css);
        },

        // Show the layer
        show: function (callback) {
            if (this.visible === true) {
                return;
            }

            this.visible = true;

            // First, style the layer if it's not already styled
            if (this.styled === false) {
                this._setStyle();
            }

            var that = this,
                offset = typeof this.data.showOffset !== 'undefined' ? this.data.showOffset : 50,
                duration = typeof this.data.showDuration !== 'undefined' ? this.data.showDuration / 1000 : 0.4,
                delay = typeof this.data.showDelay !== 'undefined' ? this.data.showDelay : 10,
                stayDuration = typeof that.data.stayDuration !== 'undefined' ? parseInt(that.data.stayDuration, 10) : -1;

            // Animate the layers with CSS3 or with JavaScript
            if (this.supportedAnimation === 'javascript') {
                this.$layer
                    .stop()
                    .delay(delay)
                    .css({ 'opacity': 0, 'visibility': 'visible' })
                    .animate({ 'opacity': 1 }, duration * 1000, function () {

                        // Hide the layer after a given time interval
                        if (stayDuration !== -1) {
                            that.stayTimer = setTimeout(function () {
                                that.hide();
                                that.stayTimer = null;
                            }, stayDuration);
                        }

                        if (typeof callback !== 'undefined') {
                            callback();
                        }
                    });
            } else {
                var start = { 'opacity': 0, 'visibility': 'visible' },
                    target = { 'opacity': 1 },
                    transformValues = '';

                start[this.vendorPrefix + 'transform'] = 'scale(' + this.scaleRatio + ')';
                target[this.vendorPrefix + 'transform'] = 'scale(' + this.scaleRatio + ')';
                target[this.vendorPrefix + 'transition'] = 'opacity ' + duration + 's';

                if (typeof this.data.showTransition !== 'undefined') {
                    if (this.data.showTransition === 'left') {
                        transformValues = offset + 'px, 0';
                    } else if (this.data.showTransition === 'right') {
                        transformValues = '-' + offset + 'px, 0';
                    } else if (this.data.showTransition === 'up') {
                        transformValues = '0, ' + offset + 'px';
                    } else if (this.data.showTransition === 'down') {
                        transformValues = '0, -' + offset + 'px';
                    }

                    start[this.vendorPrefix + 'transform'] += this.supportedAnimation === 'css-3d' ? ' translate3d(' + transformValues + ', 0)' : ' translate(' + transformValues + ')';
                    target[this.vendorPrefix + 'transform'] += this.supportedAnimation === 'css-3d' ? ' translate3d(0, 0, 0)' : ' translate(0, 0)';
                    target[this.vendorPrefix + 'transition'] += ', ' + this.vendorPrefix + 'transform ' + duration + 's';
                }

                // Listen when the layer animation is complete
                this.$layer.on(this.transitionEvent, function (event) {
                    if (event.target !== event.currentTarget) {
                        return;
                    }

                    that.$layer
                        .off(that.transitionEvent)
                        .css(that.vendorPrefix + 'transition', '');

                    // Hide the layer after a given time interval
                    if (stayDuration !== -1) {
                        that.stayTimer = setTimeout(function () {
                            that.hide();
                            that.stayTimer = null;
                        }, stayDuration);
                    }

                    if (typeof callback !== 'undefined') {
                        callback();
                    }
                });

                this.$layer.css(start);

                setTimeout(function () {
                    that.$layer.css(target);
                }, delay);
            }
        },

        // Hide the layer
        hide: function (callback) {
            if (this.visible === false) {
                return;
            }

            var that = this,
                offset = typeof this.data.hideOffset !== 'undefined' ? this.data.hideOffset : 50,
                duration = typeof this.data.hideDuration !== 'undefined' ? this.data.hideDuration / 1000 : 0.4,
                delay = typeof this.data.hideDelay !== 'undefined' ? this.data.hideDelay : 10;

            this.visible = false;

            // If the layer is hidden before it hides automatically, clear the timer
            if (this.stayTimer !== null) {
                clearTimeout(this.stayTimer);
            }

            // Animate the layers with CSS3 or with JavaScript
            if (this.supportedAnimation === 'javascript') {
                this.$layer
                    .stop()
                    .delay(delay)
                    .animate({ 'opacity': 0 }, duration * 1000, function () {
                        $(this).css('visibility', 'hidden');

                        if (typeof callback !== 'undefined') {
                            callback();
                        }
                    });
            } else {
                var transformValues = '',
                    target = { 'opacity': 0 };

                target[this.vendorPrefix + 'transform'] = 'scale(' + this.scaleRatio + ')';
                target[this.vendorPrefix + 'transition'] = 'opacity ' + duration + 's';

                if (typeof this.data.hideTransition !== 'undefined') {
                    if (this.data.hideTransition === 'left') {
                        transformValues = '-' + offset + 'px, 0';
                    } else if (this.data.hideTransition === 'right') {
                        transformValues = offset + 'px, 0';
                    } else if (this.data.hideTransition === 'up') {
                        transformValues = '0, -' + offset + 'px';
                    } else if (this.data.hideTransition === 'down') {
                        transformValues = '0, ' + offset + 'px';
                    }

                    target[this.vendorPrefix + 'transform'] += this.supportedAnimation === 'css-3d' ? ' translate3d(' + transformValues + ', 0)' : ' translate(' + transformValues + ')';
                    target[this.vendorPrefix + 'transition'] += ', ' + this.vendorPrefix + 'transform ' + duration + 's';
                }

                // Listen when the layer animation is complete
                this.$layer.on(this.transitionEvent, function (event) {
                    if (event.target !== event.currentTarget) {
                        return;
                    }

                    that.$layer
                        .off(that.transitionEvent)
                        .css(that.vendorPrefix + 'transition', '');

                    // Hide the layer after transition
                    if (that.visible === false) {
                        that.$layer.css('visibility', 'hidden');
                    }

                    if (typeof callback !== 'undefined') {
                        callback();
                    }
                });

                setTimeout(function () {
                    that.$layer.css(target);
                }, delay);
            }
        },

        isVisible: function () {
            if (this.visible === false || this.$layer.is(':hidden')) {
                return false;
            }

            return true;
        },

        // Destroy the layer
        destroy: function () {
            this.$layer.removeAttr('style');
            this.$layer.removeAttr('data-init');
        }
    };

    $.SliderPro.addModule('Layers', Layers);

})(window, jQuery);

// Fade module for Slider Pro.
// 
// Adds the possibility to navigate through slides using a cross-fade effect.
; (function (window, $) {

    "use strict";

    var NS = 'Fade.' + $.SliderPro.namespace;

    var Fade = {

        // Reference to the original 'gotoSlide' method
        fadeGotoSlideReference: null,

        initFade: function () {
            this.on('update.' + NS, $.proxy(this._fadeOnUpdate, this));
        },

        // If fade is enabled, store a reference to the original 'gotoSlide' method
        // and then assign a new function to 'gotoSlide'.
        _fadeOnUpdate: function () {
            if (this.settings.fade === true) {
                this.fadeGotoSlideReference = this.gotoSlide;
                this.gotoSlide = this._fadeGotoSlide;
            }
        },

        // Will replace the original 'gotoSlide' function by adding a cross-fade effect
        // between the previous and the next slide.
        _fadeGotoSlide: function (index) {
            if (index === this.selectedSlideIndex) {
                return;
            }

            // If the slides are being swiped/dragged, don't use fade, but call the original method instead.
            // If not, which means that a new slide was selected through a button, arrows or direct call, then
            // use fade.
            if (this.$slider.hasClass('sp-swiping')) {
                this.fadeGotoSlideReference(index);
            } else {
                var that = this,
                    $nextSlide,
                    $previousSlide,
                    newIndex = index;

                // Loop through all the slides and overlap the the previous and next slide,
                // and hide the other slides.
                $.each(this.slides, function (index, element) {
                    var slideIndex = element.getIndex(),
                        $slide = element.$slide;

                    if (slideIndex === newIndex) {
                        $slide.css({ 'opacity': 0, 'left': 0, 'top': 0, 'z-index': 20 });
                        $nextSlide = $slide;
                    } else if (slideIndex === that.selectedSlideIndex) {
                        $slide.css({ 'opacity': 1, 'left': 0, 'top': 0, 'z-index': 10 });
                        $previousSlide = $slide;
                    } else {
                        $slide.css('visibility', 'hidden');
                    }
                });

                // Set the new indexes for the previous and selected slides
                this.previousSlideIndex = this.selectedSlideIndex;
                this.selectedSlideIndex = index;

                // Rearrange the slides if the slider is loopable
                if (that.settings.loop === true) {
                    that._updateSlidesOrder();
                }

                // Move the slides container so that the cross-fading slides (which now have the top and left
                // position set to 0) become visible and in the center of the slider.
                this._moveTo(this.visibleOffset, true);

                // Fade out the previous slide, if indicated, in addition to fading in the next slide
                if (this.settings.fadeOutPreviousSlide === true) {
                    this._fadeSlideTo($previousSlide, 0);
                }

                // Fade in the selected slide
                this._fadeSlideTo($nextSlide, 1, function () {

                    // After the animation is over, make all the slides visible again
                    $.each(that.slides, function (index, element) {
                        var $slide = element.$slide;
                        $slide.css({ 'visibility': '', 'opacity': '', 'z-index': '' });
                    });

                    // Reset the position of the slides and slides container
                    that._resetSlidesPosition();

                    // Fire the 'gotoSlideComplete' event
                    that.trigger({ type: 'gotoSlideComplete', index: index, previousIndex: that.previousSlideIndex });
                    if ($.isFunction(that.settings.gotoSlideComplete)) {
                        that.settings.gotoSlideComplete.call(that, { type: 'gotoSlideComplete', index: index, previousIndex: that.previousSlideIndex });
                    }
                });

                if (this.settings.autoHeight === true) {
                    this._resizeHeight();
                }

                // Fire the 'gotoSlide' event
                this.trigger({ type: 'gotoSlide', index: index, previousIndex: this.previousSlideIndex });
                if ($.isFunction(this.settings.gotoSlide)) {
                    this.settings.gotoSlide.call(this, { type: 'gotoSlide', index: index, previousIndex: this.previousSlideIndex });
                }
            }
        },

        // Fade the target slide to the specified opacity (0 or 1)
        _fadeSlideTo: function (target, opacity, callback) {
            var that = this;

            // Use CSS transitions if they are supported. If not, use JavaScript animation.
            if (this.supportedAnimation === 'css-3d' || this.supportedAnimation === 'css-2d') {

                // There needs to be a delay between the moment the opacity is set
                // and the moment the transitions starts.
                setTimeout(function () {
                    var css = { 'opacity': opacity };
                    css[that.vendorPrefix + 'transition'] = 'opacity ' + that.settings.fadeDuration / 1000 + 's';
                    target.css(css);
                }, 1);

                target.on(this.transitionEvent, function (event) {
                    if (event.target !== event.currentTarget) {
                        return;
                    }

                    target.off(that.transitionEvent);
                    target.css(that.vendorPrefix + 'transition', '');

                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            } else {
                target.stop().animate({ 'opacity': opacity }, this.settings.fadeDuration, function () {
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            }
        },

        // Destroy the module
        destroyFade: function () {
            this.off('update.' + NS);

            if (this.fadeGotoSlideReference !== null) {
                this.gotoSlide = this.fadeGotoSlideReference;
            }
        },

        fadeDefaults: {

            // Indicates if fade will be used
            fade: false,

            // Indicates if the previous slide will be faded out (in addition to the next slide being faded in)
            fadeOutPreviousSlide: true,

            // Sets the duration of the fade effect
            fadeDuration: 500
        }
    };

    $.SliderPro.addModule('Fade', Fade);

})(window, jQuery);

// Touch Swipe module for Slider Pro.
// 
// Adds touch-swipe functionality for slides.
; (function (window, $) {

    "use strict";

    var NS = 'TouchSwipe.' + $.SliderPro.namespace;

    var TouchSwipe = {

        // Indicates if touch is supported
        isTouchSupport: false,

        // The x and y coordinates of the pointer/finger's starting position
        touchStartPoint: { x: 0, y: 0 },

        // The x and y coordinates of the pointer/finger's end position
        touchEndPoint: { x: 0, y: 0 },

        // The distance from the starting to the end position on the x and y axis
        touchDistance: { x: 0, y: 0 },

        // The position of the slides when the touch swipe starts
        touchStartPosition: 0,

        // Indicates if the slides are being swiped
        isTouchMoving: false,

        // Stores the names of the events
        touchSwipeEvents: { startEvent: '', moveEvent: '', endEvent: '' },

        initTouchSwipe: function () {
            var that = this;

            // check if touch swipe is enabled
            if (this.settings.touchSwipe === false) {
                return;
            }

            // check if there is touch support
            this.isTouchSupport = 'ontouchstart' in window;

            // Get the names of the events
            if (this.isTouchSupport === true) {
                this.touchSwipeEvents.startEvent = 'touchstart';
                this.touchSwipeEvents.moveEvent = 'touchmove';
                this.touchSwipeEvents.endEvent = 'touchend';
            } else {
                this.touchSwipeEvents.startEvent = 'mousedown';
                this.touchSwipeEvents.moveEvent = 'mousemove';
                this.touchSwipeEvents.endEvent = 'mouseup';
            }

            // Listen for touch swipe/mouse move events
            this.$slidesMask.on(this.touchSwipeEvents.startEvent + '.' + NS, $.proxy(this._onTouchStart, this));
            this.$slidesMask.on('dragstart.' + NS, function (event) {
                event.preventDefault();
            });

            // Add the grabbing icon
            this.$slidesMask.addClass('sp-grab');
        },

        // Called when the slides starts being dragged
        _onTouchStart: function (event) {

            // Disable dragging if the element is set to allow selections
            if ($(event.target).closest('.sp-selectable').length >= 1) {
                return;
            }

            var that = this,
                eventObject = this.isTouchSupport ? event.originalEvent.touches[0] : event.originalEvent;

            // Prevent default behavior only for mouse events
            if (this.isTouchSupport === false) {
                event.preventDefault();
            }

            // Disable click events on links
            $(event.target).parents('.sp-slide').find('a').one('click.' + NS, function (event) {
                event.preventDefault();
            });

            // Get the initial position of the mouse pointer and the initial position
            // of the slides' container
            this.touchStartPoint.x = eventObject.pageX || eventObject.clientX;
            this.touchStartPoint.y = eventObject.pageY || eventObject.clientY;
            this.touchStartPosition = this.slidesPosition;

            // Clear the previous distance values
            this.touchDistance.x = this.touchDistance.y = 0;

            // If the slides are being grabbed while they're still animating, stop the
            // current movement
            if (this.$slides.hasClass('sp-animated')) {
                this.isTouchMoving = true;
                this._stopMovement();
                this.touchStartPosition = this.slidesPosition;
            }

            // Listen for move and end events
            this.$slidesMask.on(this.touchSwipeEvents.moveEvent + '.' + NS, $.proxy(this._onTouchMove, this));
            $(document).on(this.touchSwipeEvents.endEvent + '.' + this.uniqueId + '.' + NS, $.proxy(this._onTouchEnd, this));

            // Swap grabbing icons
            this.$slidesMask.removeClass('sp-grab').addClass('sp-grabbing');

            // Add 'sp-swiping' class to indicate that the slides are being swiped
            this.$slider.addClass('sp-swiping');
        },

        // Called during the slides' dragging
        _onTouchMove: function (event) {
            var eventObject = this.isTouchSupport ? event.originalEvent.touches[0] : event.originalEvent;

            // Indicate that the move event is being fired
            this.isTouchMoving = true;

            // Get the current position of the mouse pointer
            this.touchEndPoint.x = eventObject.pageX || eventObject.clientX;
            this.touchEndPoint.y = eventObject.pageY || eventObject.clientY;

            // Calculate the distance of the movement on both axis
            this.touchDistance.x = this.touchEndPoint.x - this.touchStartPoint.x;
            this.touchDistance.y = this.touchEndPoint.y - this.touchStartPoint.y;

            // Calculate the distance of the swipe that takes place in the same direction as the orientation of the slides
            // and calculate the distance from the opposite direction.
            // 
            // For a swipe to be valid there should more distance in the same direction as the orientation of the slides.
            var distance = this.settings.orientation === 'horizontal' ? this.touchDistance.x : this.touchDistance.y,
                oppositeDistance = this.settings.orientation === 'horizontal' ? this.touchDistance.y : this.touchDistance.x;

            // If the movement is in the same direction as the orientation of the slides, the swipe is valid
            if (Math.abs(distance) > Math.abs(oppositeDistance)) {
                event.preventDefault();
            } else {
                return;
            }

            if (this.settings.loop === false) {
                // Make the slides move slower if they're dragged outside its bounds
                if ((this.slidesPosition > this.touchStartPosition && this.selectedSlideIndex === 0) ||
                    (this.slidesPosition < this.touchStartPosition && this.selectedSlideIndex === this.getTotalSlides() - 1)
                ) {
                    distance = distance * 0.2;
                }
            }

            this._moveTo(this.touchStartPosition + distance, true);
        },

        // Called when the slides are released
        _onTouchEnd: function (event) {
            var that = this,
                touchDistance = this.settings.orientation === 'horizontal' ? this.touchDistance.x : this.touchDistance.y;

            // Remove the move and end listeners
            this.$slidesMask.off(this.touchSwipeEvents.moveEvent + '.' + NS);
            $(document).off(this.touchSwipeEvents.endEvent + '.' + this.uniqueId + '.' + NS);

            // Swap grabbing icons
            this.$slidesMask.removeClass('sp-grabbing').addClass('sp-grab');

            // Check if there is intention for a tap
            if (this.isTouchMoving === false || this.isTouchMoving === true && Math.abs(this.touchDistance.x) < 10 && Math.abs(this.touchDistance.y) < 10) {
                // Re-enable click events on links
                $(event.target).parents('.sp-slide').find('a').off('click.' + NS);
                this.$slider.removeClass('sp-swiping');
            }

            // Remove the 'sp-swiping' class but with a delay
            // because there might be other event listeners that check
            // the existence of this class, and this class should still be 
            // applied for those listeners, since there was a swipe event
            setTimeout(function () {
                that.$slider.removeClass('sp-swiping');
            }, 1);

            // Return if the slides didn't move
            if (this.isTouchMoving === false) {
                return;
            }

            this.isTouchMoving = false;

            $(event.target).parents('.sp-slide').one('click', function (event) {
                event.preventDefault();
            });

            // Calculate the old position of the slides in order to return to it if the swipe
            // is below the threshold
            var oldSlidesPosition = -parseInt(this.$slides.find('.sp-slide').eq(this.selectedSlideIndex).css(this.positionProperty), 10) + this.visibleOffset;

            if (Math.abs(touchDistance) < this.settings.touchSwipeThreshold) {
                this._moveTo(oldSlidesPosition);
            } else {

                // Calculate by how many slides the slides container has moved
                var slideArrayDistance = touchDistance / (this.slideSize + this.settings.slideDistance);

                // Floor the obtained value and add or subtract 1, depending on the direction of the swipe
                slideArrayDistance = parseInt(slideArrayDistance, 10) + (slideArrayDistance > 0 ? 1 : -1);

                // Get the index of the currently selected slide and subtract the position index in order to obtain
                // the new index of the selected slide. 
                var nextSlideIndex = this.slidesOrder[$.inArray(this.selectedSlideIndex, this.slidesOrder) - slideArrayDistance];

                if (this.settings.loop === true) {
                    this.gotoSlide(nextSlideIndex);
                } else {
                    if (typeof nextSlideIndex !== 'undefined') {
                        this.gotoSlide(nextSlideIndex);
                    } else {
                        this._moveTo(oldSlidesPosition);
                    }
                }
            }
        },

        // Destroy the module
        destroyTouchSwipe: function () {
            this.$slidesMask.off(this.touchSwipeEvents.startEvent + '.' + NS);
            this.$slidesMask.off(this.touchSwipeEvents.moveEvent + '.' + NS);
            this.$slidesMask.off('dragstart.' + NS);
            $(document).off(this.touchSwipeEvents.endEvent + '.' + this.uniqueId + '.' + NS);
            this.$slidesMask.removeClass('sp-grab');
        },

        touchSwipeDefaults: {

            // Indicates whether the touch swipe will be enabled
            touchSwipe: true,

            // Sets the minimum amount that the slides should move
            touchSwipeThreshold: 50
        }
    };

    $.SliderPro.addModule('TouchSwipe', TouchSwipe);

})(window, jQuery);

// Caption module for Slider Pro.
// 
// Adds a corresponding caption for each slide. The caption
// will appear and disappear with the slide.
; (function (window, $) {

    "use strict";

    var NS = 'Caption.' + $.SliderPro.namespace;

    var Caption = {

        // Reference to the container element that will hold the caption
        $captionContainer: null,

        // The caption content/text
        captionContent: '',

        initCaption: function () {
            this.on('update.' + NS, $.proxy(this._captionOnUpdate, this));
            this.on('gotoSlide.' + NS, $.proxy(this._updateCaptionContent, this));
        },

        // Create the caption container and hide the captions inside the slides
        _captionOnUpdate: function () {
            this.$captionContainer = this.$slider.find('.sp-caption-container');

            if (this.$slider.find('.sp-caption').length && this.$captionContainer.length === 0) {
                this.$captionContainer = $('<div class="sp-caption-container"></div>').appendTo(this.$slider);

                // Show the caption for the selected slide
                this._updateCaptionContent();
            }

            // Hide the captions inside the slides
            this.$slides.find('.sp-caption').each(function () {
                $(this).css('display', 'none');
            });
        },

        // Show the caption content for the selected slide
        _updateCaptionContent: function () {
            var that = this,
                newCaptionField = this.$slider.find('.sp-slide').eq(this.selectedSlideIndex).find('.sp-caption'),
                newCaptionContent = newCaptionField.length !== 0 ? newCaptionField.html() : '';

            // Either use a fade effect for swapping the captions or use an instant change
            if (this.settings.fadeCaption === true) {

                // If the previous slide had a caption, fade out that caption first and when the animation is over
                // fade in the current caption.
                // If the previous slide didn't have a caption, fade in the current caption directly.
                if (this.captionContent !== '') {

                    // If the caption container has 0 opacity when the fade out transition starts, set it
                    // to 1 because the transition wouldn't work if the initial and final values are the same,
                    // and the callback functions wouldn't fire in this case.
                    if (parseFloat(this.$captionContainer.css('opacity'), 10) === 0) {
                        this.$captionContainer.css(this.vendorPrefix + 'transition', '');
                        this.$captionContainer.css('opacity', 1);
                    }

                    this._fadeCaptionTo(0, function () {
                        that.captionContent = newCaptionContent;

                        if (newCaptionContent !== '') {
                            that.$captionContainer.html(that.captionContent);
                            that._fadeCaptionTo(1);
                        } else {
                            that.$captionContainer.empty();
                        }
                    });
                } else {
                    this.captionContent = newCaptionContent;
                    this.$captionContainer.html(this.captionContent);
                    this.$captionContainer.css('opacity', 0);
                    this._fadeCaptionTo(1);
                }
            } else {
                this.captionContent = newCaptionContent;
                this.$captionContainer.html(this.captionContent);
            }
        },

        // Fade the caption container to the specified opacity
        _fadeCaptionTo: function (opacity, callback) {
            var that = this;

            // Use CSS transitions if they are supported. If not, use JavaScript animation.
            if (this.supportedAnimation === 'css-3d' || this.supportedAnimation === 'css-2d') {

                // There needs to be a delay between the moment the opacity is set
                // and the moment the transitions starts.
                setTimeout(function () {
                    var css = { 'opacity': opacity };
                    css[that.vendorPrefix + 'transition'] = 'opacity ' + that.settings.captionFadeDuration / 1000 + 's';
                    that.$captionContainer.css(css);
                }, 1);

                this.$captionContainer.on(this.transitionEvent, function (event) {
                    if (event.target !== event.currentTarget) {
                        return;
                    }

                    that.$captionContainer.off(that.transitionEvent);
                    that.$captionContainer.css(that.vendorPrefix + 'transition', '');

                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            } else {
                this.$captionContainer.stop().animate({ 'opacity': opacity }, this.settings.captionFadeDuration, function () {
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            }
        },

        // Destroy the module
        destroyCaption: function () {
            this.off('update.' + NS);
            this.off('gotoSlide.' + NS);

            this.$captionContainer.remove();

            this.$slider.find('.sp-caption').each(function () {
                $(this).css('display', '');
            });
        },

        captionDefaults: {

            // Indicates whether or not the captions will be faded
            fadeCaption: true,

            // Sets the duration of the fade animation
            captionFadeDuration: 500
        }
    };

    $.SliderPro.addModule('Caption', Caption);

})(window, jQuery);

// Deep Linking module for Slider Pro.
// 
// Updates the hash of the URL as the user navigates through the slides.
// Also, allows navigating to a specific slide by indicating it in the hash.
; (function (window, $) {

    "use strict";

    var NS = 'DeepLinking.' + $.SliderPro.namespace;

    var DeepLinking = {

        initDeepLinking: function () {
            var that = this,

                // Use this variable as a flag to prevent the slider to call 'gotoSlide' after a hash update
                // if that hash update was triggered by another 'gotoSlide' call.
                allowGotoHash = true;

            // Parse the initial hash
            this.on('init.' + NS, function () {
                that._gotoHash(window.location.hash);
            });

            // Update the hash when a new slide is selected
            this.on('gotoSlide.' + NS, function (event) {
                allowGotoHash = false;

                if (that.settings.updateHash === true) {
                    window.location.hash = that.$slider.attr('id') + '/' + event.index;
                }
            });

            // Check when the hash changes and navigate to the indicated slide
            $(window).on('hashchange.' + this.uniqueId + '.' + NS, function () {
                if (allowGotoHash === true) {
                    that._gotoHash(window.location.hash);
                }

                allowGotoHash = true;
            });
        },

        // Parse the hash and return the slider id and the slide id
        _parseHash: function (hash) {
            if (hash !== '') {
                // Eliminate the # symbol
                hash = hash.substring(1);

                // Get the specified slider id and slide id
                var values = hash.split('/'),
                    slideId = values.pop(),
                    sliderId = hash.slice(0, -slideId.toString().length - 1);

                if (this.$slider.attr('id') === sliderId) {
                    return { 'sliderID': sliderId, 'slideId': slideId };
                }
            }

            return false;
        },

        // Navigate to the appropriate slide, based on the specified hash
        _gotoHash: function (hash) {
            var result = this._parseHash(hash);

            if (result === false) {
                return;
            }

            var slideId = result.slideId,
                slideIdNumber = parseInt(slideId, 10);

            // check if the specified slide id is a number or string
            if (isNaN(slideIdNumber)) {
                // get the index of the slide based on the specified id
                var slideIndex = this.$slider.find('.sp-slide#' + slideId).index();

                if (slideIndex !== -1) {
                    this.gotoSlide(slideIndex);
                }
            } else {
                this.gotoSlide(slideIdNumber);
            }
        },

        // Destroy the module
        destroyDeepLinking: function () {
            this.off('init.' + NS);
            this.off('gotoSlide.' + NS);
            $(window).off('hashchange.' + this.uniqueId + '.' + NS);
        },

        deepLinkingDefaults: {

            // Indicates whether the hash will be updated when a new slide is selected
            updateHash: false
        }
    };

    $.SliderPro.addModule('DeepLinking', DeepLinking);

})(window, jQuery);

// Autoplay module for Slider Pro.
// 
// Adds automatic navigation through the slides by calling the
// 'nextSlide' or 'previousSlide' methods at certain time intervals.
; (function (window, $) {

    "use strict";

    var NS = 'Autoplay.' + $.SliderPro.namespace;

    var Autoplay = {

        autoplayTimer: null,

        isTimerRunning: false,

        isTimerPaused: false,

        initAutoplay: function () {
            this.on('update.' + NS, $.proxy(this._autoplayOnUpdate, this));
        },

        // Start the autoplay if it's enabled, or stop it if it's disabled but running 
        _autoplayOnUpdate: function (event) {
            if (this.settings.autoplay === true) {
                this.on('gotoSlide.' + NS, $.proxy(this._autoplayOnGotoSlide, this));
                this.on('mouseenter.' + NS, $.proxy(this._autoplayOnMouseEnter, this));
                this.on('mouseleave.' + NS, $.proxy(this._autoplayOnMouseLeave, this));

                this.startAutoplay();
            } else {
                this.off('gotoSlide.' + NS);
                this.off('mouseenter.' + NS);
                this.off('mouseleave.' + NS);

                this.stopAutoplay();
            }
        },

        // Restart the autoplay timer when a new slide is selected
        _autoplayOnGotoSlide: function (event) {
            // stop previous timers before starting a new one
            if (this.isTimerRunning === true) {
                this.stopAutoplay();
            }

            if (this.isTimerPaused === false) {
                this.startAutoplay();
            }
        },

        // Pause the autoplay when the slider is hovered
        _autoplayOnMouseEnter: function (event) {
            if (this.isTimerRunning && (this.settings.autoplayOnHover === 'pause' || this.settings.autoplayOnHover === 'stop')) {
                this.stopAutoplay();
                this.isTimerPaused = true;
            }
        },

        // Start the autoplay when the mouse moves away from the slider
        _autoplayOnMouseLeave: function (event) {
            if (this.settings.autoplay === true && this.isTimerRunning === false && this.settings.autoplayOnHover !== 'stop') {
                this.startAutoplay();
                this.isTimerPaused = false;
            }
        },

        // Starts the autoplay
        startAutoplay: function () {
            var that = this;

            this.isTimerRunning = true;

            this.autoplayTimer = setTimeout(function () {
                if (that.settings.autoplayDirection === 'normal') {
                    that.nextSlide();
                } else if (that.settings.autoplayDirection === 'backwards') {
                    that.previousSlide();
                }
            }, this.settings.autoplayDelay);
        },

        // Stops the autoplay
        stopAutoplay: function () {
            this.isTimerRunning = false;

            clearTimeout(this.autoplayTimer);
        },

        // Destroy the module
        destroyAutoplay: function () {
            clearTimeout(this.autoplayTimer);

            this.off('update.' + NS);
            this.off('gotoSlide.' + NS);
            this.off('mouseenter.' + NS);
            this.off('mouseleave.' + NS);
        },

        autoplayDefaults: {
            // Indicates whether or not autoplay will be enabled
            autoplay: true,

            // Sets the delay/interval at which the autoplay will run
            autoplayDelay: 5000,

            // Indicates whether autoplay will navigate to the next slide or previous slide
            autoplayDirection: 'normal',

            // Indicates if the autoplay will be paused or stopped when the slider is hovered.
            // Possible values are 'pause', 'stop' or 'none'.
            autoplayOnHover: 'pause'
        }
    };

    $.SliderPro.addModule('Autoplay', Autoplay);

})(window, jQuery);

// Keyboard module for Slider Pro.
// 
// Adds the possibility to navigate through slides using the keyboard arrow keys, or
// open the link attached to the main slide image by using the Enter key.
; (function (window, $) {

    "use strict";

    var NS = 'Keyboard.' + $.SliderPro.namespace;

    var Keyboard = {

        initKeyboard: function () {
            var that = this,
                hasFocus = false;

            if (this.settings.keyboard === false) {
                return;
            }

            // Detect when the slide is in focus and when it's not, and, optionally, make it
            // responsive to keyboard input only when it's in focus
            this.$slider.on('focus.' + NS, function () {
                hasFocus = true;
            });

            this.$slider.on('blur.' + NS, function () {
                hasFocus = false;
            });

            $(document).on('keydown.' + this.uniqueId + '.' + NS, function (event) {
                if (that.settings.keyboardOnlyOnFocus === true && hasFocus === false) {
                    return;
                }

                // If the left arrow key is pressed, go to the previous slide.
                // If the right arrow key is pressed, go to the next slide.
                // If the Enter key is pressed, open the link attached to the main slide image.
                if (event.which === 37) {
                    that.previousSlide();
                } else if (event.which === 39) {
                    that.nextSlide();
                } else if (event.which === 13) {
                    that.$slider.find('.sp-slide').eq(that.selectedSlideIndex).find('.sp-image-container a')[0].click();
                }
            });
        },

        // Destroy the module
        destroyKeyboard: function () {
            this.$slider.off('focus.' + NS);
            this.$slider.off('blur.' + NS);
            $(document).off('keydown.' + this.uniqueId + '.' + NS);
        },

        keyboardDefaults: {

            // Indicates whether keyboard navigation will be enabled
            keyboard: true,

            // Indicates whether the slider will respond to keyboard input only when
            // the slider is in focus.
            keyboardOnlyOnFocus: false
        }
    };

    $.SliderPro.addModule('Keyboard', Keyboard);

})(window, jQuery);

// Full Screen module for Slider Pro.
// 
// Adds the possibility to open the slider full-screen, using the HMTL5 FullScreen API.
; (function (window, $) {

    "use strict";

    var NS = 'FullScreen.' + $.SliderPro.namespace;

    var FullScreen = {

        // Indicates whether the slider is currently in full-screen mode
        isFullScreen: false,

        // Reference to the full-screen button
        $fullScreenButton: null,

        // Reference to a set of settings that influence the slider's size
        // before it goes full-screen
        sizeBeforeFullScreen: {},

        initFullScreen: function () {
            if (!(document.fullscreenEnabled ||
                document.webkitFullscreenEnabled ||
                document.mozFullScreenEnabled ||
                document.msFullscreenEnabled)) {
                return;
            }

            this.on('update.' + NS, $.proxy(this._fullScreenOnUpdate, this));
        },

        // Create or remove the full-screen button depending on the value of the 'fullScreen' option
        _fullScreenOnUpdate: function () {
            if (this.settings.fullScreen === true && this.$fullScreenButton === null) {
                this._addFullScreen();
            } else if (this.settings.fullScreen === false && this.$fullScreenButton !== null) {
                this._removeFullScreen();
            }

            if (this.settings.fullScreen === true) {
                if (this.settings.fadeFullScreen === true) {
                    this.$fullScreenButton.addClass('sp-fade-full-screen');
                } else if (this.settings.fadeFullScreen === false) {
                    this.$fullScreenButton.removeClass('sp-fade-full-screen');
                }
            }
        },

        // Create the full-screen button
        _addFullScreen: function () {
            this.$fullScreenButton = $('<div class="sp-full-screen-button"></div>').appendTo(this.$slider);
            this.$fullScreenButton.on('click.' + NS, $.proxy(this._onFullScreenButtonClick, this));

            document.addEventListener('fullscreenchange', $.proxy(this._onFullScreenChange, this));
            document.addEventListener('mozfullscreenchange', $.proxy(this._onFullScreenChange, this));
            document.addEventListener('webkitfullscreenchange', $.proxy(this._onFullScreenChange, this));
            document.addEventListener('MSFullscreenChange', $.proxy(this._onFullScreenChange, this));
        },

        // Remove the full-screen button
        _removeFullScreen: function () {
            if (this.$fullScreenButton !== null) {
                this.$fullScreenButton.off('click.' + NS);
                this.$fullScreenButton.remove();
                this.$fullScreenButton = null;
                document.removeEventListener('fullscreenchange', this._onFullScreenChange);
                document.removeEventListener('mozfullscreenchange', this._onFullScreenChange);
                document.removeEventListener('webkitfullscreenchange', this._onFullScreenChange);
                document.removeEventListener('MSFullscreenChange', this._onFullScreenChange);
            }
        },

        // When the full-screen button is clicked, put the slider into full-screen mode, and
        // take it out of the full-screen mode when it's clicked again.
        _onFullScreenButtonClick: function () {
            if (this.isFullScreen === false) {
                if (this.instance.requestFullScreen) {
                    this.instance.requestFullScreen();
                } else if (this.instance.mozRequestFullScreen) {
                    this.instance.mozRequestFullScreen();
                } else if (this.instance.webkitRequestFullScreen) {
                    this.instance.webkitRequestFullScreen();
                } else if (this.instance.msRequestFullscreen) {
                    this.instance.msRequestFullscreen();
                }
            } else {
                if (document.exitFullScreen) {
                    document.exitFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        },

        // This will be called whenever the full-screen mode changes.
        // If the slider is in full-screen mode, set it to 'full window', and if it's
        // not in full-screen mode anymore, set it back to the original size.
        _onFullScreenChange: function () {
            this.isFullScreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement ? true : false;

            if (this.isFullScreen === true) {
                this.sizeBeforeFullScreen = { forceSize: this.settings.forceSize, autoHeight: this.settings.autoHeight };
                this.$slider.addClass('sp-full-screen');
                this.settings.forceSize = 'fullWindow';
                this.settings.autoHeight = false;
            } else {
                this.$slider.css('margin', '');
                this.$slider.removeClass('sp-full-screen');
                this.settings.forceSize = this.sizeBeforeFullScreen.forceSize;
                this.settings.autoHeight = this.sizeBeforeFullScreen.autoHeight;
            }

            this.resize();
        },

        // Destroy the module
        destroyFullScreen: function () {
            this.off('update.' + NS);
            this._removeFullScreen();
        },

        fullScreenDefaults: {

            // Indicates whether the full-screen button is enabled
            fullScreen: false,

            // Indicates whether the button will fade in only on hover
            fadeFullScreen: true
        }
    };

    $.SliderPro.addModule('FullScreen', FullScreen);

})(window, jQuery);

// Buttons module for Slider Pro.
// 
// Adds navigation buttons at the bottom of the slider.
; (function (window, $) {

    "use strict";

    var NS = 'Buttons.' + $.SliderPro.namespace;

    var Buttons = {

        // Reference to the buttons container
        $buttons: null,

        initButtons: function () {
            this.on('update.' + NS, $.proxy(this._buttonsOnUpdate, this));
        },

        _buttonsOnUpdate: function () {
            this.$buttons = this.$slider.find('.sp-buttons');

            // If there is more that one slide but the buttons weren't created yet, create the buttons.
            // If the buttons were created but their number differs from the total number of slides, re-create the buttons.
            // If the buttons were created but there are less than one slide, remove the buttons.s
            if (this.settings.buttons === true && this.getTotalSlides() > 1 && this.$buttons.length === 0) {
                this._createButtons();
            } else if (this.settings.buttons === true && this.getTotalSlides() !== this.$buttons.find('.sp-button').length && this.$buttons.length !== 0) {
                this._adjustButtons();
            } else if (this.settings.buttons === false || (this.getTotalSlides() <= 1 && this.$buttons.length !== 0)) {
                this._removeButtons();
            }
        },

        // Create the buttons
        _createButtons: function () {
            var that = this;

            // Create the buttons' container
            this.$buttons = $('<div class="sp-buttons"></div>').appendTo(this.$slider);

            // Create the buttons
            for (var i = 0; i < this.getTotalSlides(); i++) {
                $('<div class="sp-button"></div>').appendTo(this.$buttons);
            }

            // Listen for button clicks 
            this.$buttons.on('click.' + NS, '.sp-button', function () {
                that.gotoSlide($(this).index());
            });

            // Set the initially selected button
            this.$buttons.find('.sp-button').eq(this.selectedSlideIndex).addClass('sp-selected-button');

            // Select the corresponding button when the slide changes
            this.on('gotoSlide.' + NS, function (event) {
                that.$buttons.find('.sp-selected-button').removeClass('sp-selected-button');
                that.$buttons.find('.sp-button').eq(event.index).addClass('sp-selected-button');
            });

            // Indicate that the slider has buttons 
            this.$slider.addClass('sp-has-buttons');
        },

        // Re-create the buttons. This is calles when the number of slides changes.
        _adjustButtons: function () {
            this.$buttons.empty();

            // Create the buttons
            for (var i = 0; i < this.getTotalSlides(); i++) {
                $('<div class="sp-button"></div>').appendTo(this.$buttons);
            }

            // Change the selected the buttons
            this.$buttons.find('.sp-selected-button').removeClass('sp-selected-button');
            this.$buttons.find('.sp-button').eq(this.selectedSlideIndex).addClass('sp-selected-button');
        },

        // Remove the buttons
        _removeButtons: function () {
            this.$buttons.off('click.' + NS, '.sp-button');
            this.off('gotoSlide.' + NS);
            this.$buttons.remove();
            this.$slider.removeClass('sp-has-buttons');
        },

        destroyButtons: function () {
            this._removeButtons();
            this.off('update.' + NS);
        },

        buttonsDefaults: {

            // Indicates whether the buttons will be created
            buttons: true
        }
    };

    $.SliderPro.addModule('Buttons', Buttons);

})(window, jQuery);

// Arrows module for Slider Pro.
// 
// Adds arrows for navigating to the next or previous slide.
; (function (window, $) {

    "use strict";

    var NS = 'Arrows.' + $.SliderPro.namespace;

    var Arrows = {

        // Reference to the arrows container
        $arrows: null,

        // Reference to the previous arrow
        $previousArrow: null,

        // Reference to the next arrow
        $nextArrow: null,

        initArrows: function () {
            this.on('update.' + NS, $.proxy(this._arrowsOnUpdate, this));
            this.on('gotoSlide.' + NS, $.proxy(this._checkArrowsVisibility, this));
        },

        _arrowsOnUpdate: function () {
            var that = this;

            // Create the arrows if the 'arrows' option is set to true
            if (this.settings.arrows === true && this.$arrows === null) {
                this.$arrows = $('<div class="sp-arrows"></div>').appendTo(this.$slidesContainer);

                this.$previousArrow = $('<div class="sp-arrow sp-previous-arrow"></div>').appendTo(this.$arrows);
                this.$nextArrow = $('<div class="sp-arrow sp-next-arrow"></div>').appendTo(this.$arrows);

                this.$previousArrow.on('click.' + NS, function () {
                    that.previousSlide();
                });

                this.$nextArrow.on('click.' + NS, function () {
                    that.nextSlide();
                });

                this._checkArrowsVisibility();
            } else if (this.settings.arrows === false && this.$arrows !== null) {
                this._removeArrows();
            }

            if (this.settings.arrows === true) {
                if (this.settings.fadeArrows === true) {
                    this.$arrows.addClass('sp-fade-arrows');
                } else if (this.settings.fadeArrows === false) {
                    this.$arrows.removeClass('sp-fade-arrows');
                }
            }
        },

        // Show or hide the arrows depending on the position of the selected slide
        _checkArrowsVisibility: function () {
            if (this.settings.arrows === false || this.settings.loop === true) {
                return;
            }

            if (this.selectedSlideIndex === 0) {
                this.$previousArrow.css('display', 'none');
            } else {
                this.$previousArrow.css('display', 'block');
            }

            if (this.selectedSlideIndex === this.getTotalSlides() - 1) {
                this.$nextArrow.css('display', 'none');
            } else {
                this.$nextArrow.css('display', 'block');
            }
        },

        _removeArrows: function () {
            if (this.$arrows !== null) {
                this.$previousArrow.off('click.' + NS);
                this.$nextArrow.off('click.' + NS);
                this.$arrows.remove();
                this.$arrows = null;
            }
        },

        destroyArrows: function () {
            this._removeArrows();
            this.off('update.' + NS);
            this.off('gotoSlide.' + NS);
        },

        arrowsDefaults: {

            // Indicates whether the arrow buttons will be created
            arrows: false,

            // Indicates whether the arrows will fade in only on hover
            fadeArrows: true
        }
    };

    $.SliderPro.addModule('Arrows', Arrows);

})(window, jQuery);

// Thumbnail Touch Swipe module for Slider Pro.
// 
// Adds touch-swipe functionality for thumbnails.
; (function (window, $) {

    "use strict";

    var NS = 'ThumbnailTouchSwipe.' + $.SliderPro.namespace;

    var ThumbnailTouchSwipe = {

        // Indicates if touch is supported
        isThumbnailTouchSupport: false,

        // The x and y coordinates of the pointer/finger's starting position
        thumbnailTouchStartPoint: { x: 0, y: 0 },

        // The x and y coordinates of the pointer/finger's end position
        thumbnailTouchEndPoint: { x: 0, y: 0 },

        // The distance from the starting to the end position on the x and y axis
        thumbnailTouchDistance: { x: 0, y: 0 },

        // The position of the thumbnail scroller when the touch swipe starts
        thumbnailTouchStartPosition: 0,

        // Indicates if the thumbnail scroller is being swiped
        isThumbnailTouchMoving: false,

        // Indicates if the touch swipe was initialized
        isThumbnailTouchSwipe: false,

        // Stores the names of the events
        thumbnailTouchSwipeEvents: { startEvent: '', moveEvent: '', endEvent: '' },

        initThumbnailTouchSwipe: function () {
            this.on('update.' + NS, $.proxy(this._thumbnailTouchSwipeOnUpdate, this));
        },

        _thumbnailTouchSwipeOnUpdate: function () {

            // Return if there are no thumbnails
            if (this.isThumbnailScroller === false) {
                return;
            }

            // Initialize the touch swipe functionality if it wasn't initialized yet
            if (this.settings.thumbnailTouchSwipe === true && this.isThumbnailTouchSwipe === false) {
                this.isThumbnailTouchSwipe = true;

                // Check if there is touch support
                this.isThumbnailTouchSupport = 'ontouchstart' in window;

                // Get the names of the events
                if (this.isThumbnailTouchSupport === true) {
                    this.thumbnailTouchSwipeEvents.startEvent = 'touchstart';
                    this.thumbnailTouchSwipeEvents.moveEvent = 'touchmove';
                    this.thumbnailTouchSwipeEvents.endEvent = 'touchend';
                } else {
                    this.thumbnailTouchSwipeEvents.startEvent = 'mousedown';
                    this.thumbnailTouchSwipeEvents.moveEvent = 'mousemove';
                    this.thumbnailTouchSwipeEvents.endEvent = 'mouseup';
                }

                // Listen for touch swipe/mouse move events
                this.$thumbnails.on(this.thumbnailTouchSwipeEvents.startEvent + '.' + NS, $.proxy(this._onThumbnailTouchStart, this));
                this.$thumbnails.on('dragstart.' + NS, function (event) {
                    event.preventDefault();
                });

                // Add the grabbing icon
                this.$thumbnails.addClass('sp-grab');
            }

            // Remove the default thumbnailClick
            $.each(this.thumbnails, function (index, thumbnail) {
                thumbnail.off('thumbnailClick');
            });
        },

        // Called when the thumbnail scroller starts being dragged
        _onThumbnailTouchStart: function (event) {
            // Disable dragging if the element is set to allow selections
            if ($(event.target).closest('.sp-selectable').length >= 1) {
                return;
            }

            var that = this,
                eventObject = this.isThumbnailTouchSupport ? event.originalEvent.touches[0] : event.originalEvent;

            // Prevent default behavior for mouse events
            if (this.isThumbnailTouchSupport === false) {
                event.preventDefault();
            }

            // Disable click events on links
            $(event.target).parents('.sp-thumbnail-container').find('a').one('click.' + NS, function (event) {
                event.preventDefault();
            });

            // Get the initial position of the mouse pointer and the initial position
            // of the thumbnail scroller
            this.thumbnailTouchStartPoint.x = eventObject.pageX || eventObject.clientX;
            this.thumbnailTouchStartPoint.y = eventObject.pageY || eventObject.clientY;
            this.thumbnailTouchStartPosition = this.thumbnailsPosition;

            // Clear the previous distance values
            this.thumbnailTouchDistance.x = this.thumbnailTouchDistance.y = 0;

            // If the thumbnail scroller is being grabbed while it's still animating, stop the
            // current movement
            if (this.$thumbnails.hasClass('sp-animated')) {
                this.isThumbnailTouchMoving = true;
                this._stopThumbnailsMovement();
                this.thumbnailTouchStartPosition = this.thumbnailsPosition;
            }

            // Listen for move and end events
            this.$thumbnails.on(this.thumbnailTouchSwipeEvents.moveEvent + '.' + NS, $.proxy(this._onThumbnailTouchMove, this));
            $(document).on(this.thumbnailTouchSwipeEvents.endEvent + '.' + this.uniqueId + '.' + NS, $.proxy(this._onThumbnailTouchEnd, this));

            // Swap grabbing icons
            this.$thumbnails.removeClass('sp-grab').addClass('sp-grabbing');

            // Add 'sp-swiping' class to indicate that the thumbnail scroller is being swiped
            this.$thumbnailsContainer.addClass('sp-swiping');
        },

        // Called during the thumbnail scroller's dragging
        _onThumbnailTouchMove: function (event) {
            var eventObject = this.isThumbnailTouchSupport ? event.originalEvent.touches[0] : event.originalEvent;

            // Indicate that the move event is being fired
            this.isThumbnailTouchMoving = true;

            // Get the current position of the mouse pointer
            this.thumbnailTouchEndPoint.x = eventObject.pageX || eventObject.clientX;
            this.thumbnailTouchEndPoint.y = eventObject.pageY || eventObject.clientY;

            // Calculate the distance of the movement on both axis
            this.thumbnailTouchDistance.x = this.thumbnailTouchEndPoint.x - this.thumbnailTouchStartPoint.x;
            this.thumbnailTouchDistance.y = this.thumbnailTouchEndPoint.y - this.thumbnailTouchStartPoint.y;

            // Calculate the distance of the swipe that takes place in the same direction as the orientation of the thumbnails
            // and calculate the distance from the opposite direction.
            // 
            // For a swipe to be valid there should more distance in the same direction as the orientation of the thumbnails.
            var distance = this.thumbnailsOrientation === 'horizontal' ? this.thumbnailTouchDistance.x : this.thumbnailTouchDistance.y,
                oppositeDistance = this.thumbnailsOrientation === 'horizontal' ? this.thumbnailTouchDistance.y : this.thumbnailTouchDistance.x;

            // If the movement is in the same direction as the orientation of the thumbnails, the swipe is valid
            if (Math.abs(distance) > Math.abs(oppositeDistance)) {
                event.preventDefault();
            } else {
                return;
            }

            // Make the thumbnail scroller move slower if it's dragged outside its bounds
            if (this.thumbnailsPosition >= 0) {
                var infOffset = -this.thumbnailTouchStartPosition;
                distance = infOffset + (distance - infOffset) * 0.2;
            } else if (this.thumbnailsPosition <= -this.thumbnailsSize + this.thumbnailsContainerSize) {
                var supOffset = this.thumbnailsSize - this.thumbnailsContainerSize + this.thumbnailTouchStartPosition;
                distance = -supOffset + (distance + supOffset) * 0.2;
            }

            this._moveThumbnailsTo(this.thumbnailTouchStartPosition + distance, true);
        },

        // Called when the thumbnail scroller is released
        _onThumbnailTouchEnd: function (event) {
            var that = this,
                thumbnailTouchDistance = this.thumbnailsOrientation === 'horizontal' ? this.thumbnailTouchDistance.x : this.thumbnailTouchDistance.y;

            // Remove the move and end listeners
            this.$thumbnails.off(this.thumbnailTouchSwipeEvents.moveEvent + '.' + NS);
            $(document).off(this.thumbnailTouchSwipeEvents.endEvent + '.' + this.uniqueId + '.' + NS);

            // Swap grabbing icons
            this.$thumbnails.removeClass('sp-grabbing').addClass('sp-grab');

            // Check if there is intention for a tap/click
            if (this.isThumbnailTouchMoving === false ||
                this.isThumbnailTouchMoving === true &&
                Math.abs(this.thumbnailTouchDistance.x) < 10 &&
                Math.abs(this.thumbnailTouchDistance.y) < 10
            ) {
                var targetThumbnail = $(event.target).hasClass('sp-thumbnail-container') ? $(event.target) : $(event.target).parents('.sp-thumbnail-container'),
                    index = targetThumbnail.index();

                // If a link is cliked, navigate to that link, else navigate to the slide that corresponds to the thumbnail
                if ($(event.target).parents('a').length !== 0) {
                    $(event.target).parents('a').off('click.' + NS);
                    this.$thumbnailsContainer.removeClass('sp-swiping');
                } else if (index !== this.selectedThumbnailIndex && index !== -1) {
                    this.gotoSlide(index);
                }

                return;
            }

            this.isThumbnailTouchMoving = false;

            $(event.target).parents('.sp-thumbnail').one('click', function (event) {
                event.preventDefault();
            });

            // Remove the 'sp-swiping' class but with a delay
            // because there might be other event listeners that check
            // the existence of this class, and this class should still be 
            // applied for those listeners, since there was a swipe event
            setTimeout(function () {
                that.$thumbnailsContainer.removeClass('sp-swiping');
            }, 1);

            // Keep the thumbnail scroller inside the bounds
            if (this.thumbnailsPosition > 0) {
                this._moveThumbnailsTo(0);
            } else if (this.thumbnailsPosition < this.thumbnailsContainerSize - this.thumbnailsSize) {
                this._moveThumbnailsTo(this.thumbnailsContainerSize - this.thumbnailsSize);
            }

            // Fire the 'thumbnailsMoveComplete' event
            this.trigger({ type: 'thumbnailsMoveComplete' });
            if ($.isFunction(this.settings.thumbnailsMoveComplete)) {
                this.settings.thumbnailsMoveComplete.call(this, { type: 'thumbnailsMoveComplete' });
            }
        },

        // Destroy the module
        destroyThumbnailTouchSwipe: function () {
            this.off('update.' + NS);

            if (this.isThumbnailScroller === false) {
                return;
            }

            this.$thumbnails.off(this.thumbnailTouchSwipeEvents.startEvent + '.' + NS);
            this.$thumbnails.off(this.thumbnailTouchSwipeEvents.moveEvent + '.' + NS);
            this.$thumbnails.off('dragstart.' + NS);
            $(document).off(this.thumbnailTouchSwipeEvents.endEvent + '.' + this.uniqueId + '.' + NS);
            this.$thumbnails.removeClass('sp-grab');
        },

        thumbnailTouchSwipeDefaults: {

            // Indicates whether the touch swipe will be enabled for thumbnails
            thumbnailTouchSwipe: true
        }
    };

    $.SliderPro.addModule('ThumbnailTouchSwipe', ThumbnailTouchSwipe);

})(window, jQuery);

// Thumbnail Arrows module for Slider Pro.
// 
// Adds thumbnail arrows for moving the thumbnail scroller.
; (function (window, $) {

    "use strict";

    var NS = 'ThumbnailArrows.' + $.SliderPro.namespace;

    var ThumbnailArrows = {

        // Reference to the arrows container
        $thumbnailArrows: null,

        // Reference to the 'previous' thumbnail arrow
        $previousThumbnailArrow: null,

        // Reference to the 'next' thumbnail arrow
        $nextThumbnailArrow: null,

        initThumbnailArrows: function () {
            var that = this;

            this.on('update.' + NS, $.proxy(this._thumbnailArrowsOnUpdate, this));

            // Check if the arrows need to be visible or invisible when the thumbnail scroller
            // resizes and when the thumbnail scroller moves.
            this.on('sliderResize.' + NS + ' ' + 'thumbnailsMoveComplete.' + NS, function () {
                if (that.isThumbnailScroller === true && that.settings.thumbnailArrows === true) {
                    that._checkThumbnailArrowsVisibility();
                }
            });
        },

        // Called when the slider is updated
        _thumbnailArrowsOnUpdate: function () {
            var that = this;

            if (this.isThumbnailScroller === false) {
                return;
            }

            // Create or remove the thumbnail scroller arrows
            if (this.settings.thumbnailArrows === true && this.$thumbnailArrows === null) {
                this.$thumbnailArrows = $('<div class="sp-thumbnail-arrows"></div>').appendTo(this.$thumbnailsContainer);

                this.$previousThumbnailArrow = $('<div class="sp-thumbnail-arrow sp-previous-thumbnail-arrow"></div>').appendTo(this.$thumbnailArrows);
                this.$nextThumbnailArrow = $('<div class="sp-thumbnail-arrow sp-next-thumbnail-arrow"></div>').appendTo(this.$thumbnailArrows);

                this.$previousThumbnailArrow.on('click.' + NS, function () {
                    var previousPosition = Math.min(0, that.thumbnailsPosition + that.thumbnailsContainerSize);
                    that._moveThumbnailsTo(previousPosition);
                });

                this.$nextThumbnailArrow.on('click.' + NS, function () {
                    var nextPosition = Math.max(that.thumbnailsContainerSize - that.thumbnailsSize, that.thumbnailsPosition - that.thumbnailsContainerSize);
                    that._moveThumbnailsTo(nextPosition);
                });
            } else if (this.settings.thumbnailArrows === false && this.$thumbnailArrows !== null) {
                this._removeThumbnailArrows();
            }

            // Add fading functionality and check if the arrows need to be visible or not
            if (this.settings.thumbnailArrows === true) {
                if (this.settings.fadeThumbnailArrows === true) {
                    this.$thumbnailArrows.addClass('sp-fade-thumbnail-arrows');
                } else if (this.settings.fadeThumbnailArrows === false) {
                    this.$thumbnailArrows.removeClass('sp-fade-thumbnail-arrows');
                }

                this._checkThumbnailArrowsVisibility();
            }
        },

        // Checks if the 'next' or 'previous' arrows need to be visible or hidden,
        // based on the position of the thumbnail scroller
        _checkThumbnailArrowsVisibility: function () {
            if (this.thumbnailsPosition === 0) {
                this.$previousThumbnailArrow.css('display', 'none');
            } else {
                this.$previousThumbnailArrow.css('display', 'block');
            }

            if (this.thumbnailsPosition === this.thumbnailsContainerSize - this.thumbnailsSize) {
                this.$nextThumbnailArrow.css('display', 'none');
            } else {
                this.$nextThumbnailArrow.css('display', 'block');
            }
        },

        // Remove the thumbnail arrows
        _removeThumbnailArrows: function () {
            if (this.$thumbnailArrows !== null) {
                this.$previousThumbnailArrow.off('click.' + NS);
                this.$nextThumbnailArrow.off('click.' + NS);
                this.$thumbnailArrows.remove();
                this.$thumbnailArrows = null;
            }
        },

        // Destroy the module
        destroyThumbnailArrows: function () {
            this._removeThumbnailArrows();
            this.off('update.' + NS);
            this.off('sliderResize.' + NS);
            this.off('thumbnailsMoveComplete.' + NS);
        },

        thumbnailArrowsDefaults: {

            // Indicates whether the thumbnail arrows will be enabled
            thumbnailArrows: false,

            // Indicates whether the thumbnail arrows will be faded
            fadeThumbnailArrows: true
        }
    };

    $.SliderPro.addModule('ThumbnailArrows', ThumbnailArrows);

})(window, jQuery);

// Video module for Slider Pro
//
// Adds automatic control for several video players and providers
; (function (window, $) {

    "use strict";

    var NS = 'Video.' + $.SliderPro.namespace;

    var Video = {

        initVideo: function () {
            this.on('update.' + NS, $.proxy(this._videoOnUpdate, this));
            this.on('gotoSlideComplete.' + NS, $.proxy(this._videoOnGotoSlideComplete, this));
        },

        _videoOnUpdate: function () {
            var that = this;

            // Find all the inline videos and initialize them
            this.$slider.find('.sp-video').not('a, [data-init]').each(function () {
                var video = $(this);
                that._initVideo(video);
            });

            // Find all the lazy-loaded videos and preinitialize them. They will be initialized
            // only when their play button is clicked.
            this.$slider.find('a.sp-video').not('[data-preinit]').each(function () {
                var video = $(this);
                that._preinitVideo(video);
            });
        },

        // Initialize the target video
        _initVideo: function (video) {
            var that = this;

            video.attr('data-init', true)
                .videoController();

            // When the video starts playing, pause the autoplay if it's running
            video.on('videoPlay.' + NS, function () {
                if (that.settings.playVideoAction === 'stopAutoplay' && typeof that.stopAutoplay !== 'undefined') {
                    that.stopAutoplay();
                    that.settings.autoplay = false;
                }

                // Fire the 'videoPlay' event
                var eventObject = { type: 'videoPlay', video: video };
                that.trigger(eventObject);
                if ($.isFunction(that.settings.videoPlay)) {
                    that.settings.videoPlay.call(that, eventObject);
                }
            });

            // When the video is paused, restart the autoplay
            video.on('videoPause.' + NS, function () {
                if (that.settings.pauseVideoAction === 'startAutoplay' && typeof that.startAutoplay !== 'undefined') {
                    that.startAutoplay();
                    that.settings.autoplay = true;
                }

                // Fire the 'videoPause' event
                var eventObject = { type: 'videoPause', video: video };
                that.trigger(eventObject);
                if ($.isFunction(that.settings.videoPause)) {
                    that.settings.videoPause.call(that, eventObject);
                }
            });

            // When the video ends, restart the autoplay (which was paused during the playback), or
            // go to the next slide, or replay the video
            video.on('videoEnded.' + NS, function () {
                if (that.settings.endVideoAction === 'startAutoplay' && typeof that.startAutoplay !== 'undefined') {
                    that.startAutoplay();
                    that.settings.autoplay = true;
                } else if (that.settings.endVideoAction === 'nextSlide') {
                    that.nextSlide();
                } else if (that.settings.endVideoAction === 'replayVideo') {
                    video.videoController('replay');
                }

                // Fire the 'videoEnd' event
                var eventObject = { type: 'videoEnd', video: video };
                that.trigger(eventObject);
                if ($.isFunction(that.settings.videoEnd)) {
                    that.settings.videoEnd.call(that, eventObject);
                }
            });
        },

        // Pre-initialize the video. This is for lazy loaded videos.
        _preinitVideo: function (video) {
            var that = this;

            video.attr('data-preinit', true);

            // When the video poster is clicked, remove the poster and create
            // the inline video
            video.on('click.' + NS, function (event) {

                // If the video is being dragged, don't start the video
                if (that.$slider.hasClass('sp-swiping')) {
                    return;
                }

                event.preventDefault();

                var href = video.attr('href'),
                    iframe,
                    provider,
                    regExp,
                    match,
                    id,
                    src,
                    videoAttributes,
                    videoWidth = video.children('img').attr('width'),
                    videoHeight = video.children('img').attr('height');

                // Check if it's a youtube or vimeo video
                if (href.indexOf('youtube') !== -1 || href.indexOf('youtu.be') !== -1) {
                    provider = 'youtube';
                } else if (href.indexOf('vimeo') !== -1) {
                    provider = 'vimeo';
                }

                // Get the id of the video
                regExp = provider === 'youtube' ? /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/ : /http:\/\/(www\.)?vimeo.com\/(\d+)/;
                match = href.match(regExp);
                id = match[2];

                // Get the source of the iframe that will be created
                src = provider === 'youtube' ? 'http://www.youtube.com/embed/' + id + '?enablejsapi=1&wmode=opaque' : 'http://player.vimeo.com/video/' + id + '?api=1';

                // Get the attributes passed to the video link and then pass them to the iframe's src
                videoAttributes = href.split('?')[1];

                if (typeof videoAttributes !== 'undefined') {
                    videoAttributes = videoAttributes.split('&');

                    $.each(videoAttributes, function (index, value) {
                        if (value.indexOf(id) === -1) {
                            src += '&' + value;
                        }
                    });
                }

                // Create the iframe
                iframe = $('<iframe></iframe>')
                    .attr({
                        'src': src,
                        'width': videoWidth,
                        'height': videoHeight,
                        'class': video.attr('class'),
                        'frameborder': 0
                    }).insertBefore(video);

                // Initialize the video and play it
                that._initVideo(iframe);
                iframe.videoController('play');

                // Hide the video poster
                video.css('display', 'none');
            });
        },

        // Called when a new slide is selected
        _videoOnGotoSlideComplete: function (event) {

            // Get the video from the previous slide
            var previousVideo = this.$slides.find('.sp-slide').eq(event.previousIndex).find('.sp-video[data-init]');

            // Handle the video from the previous slide by stopping it, or pausing it,
            // or remove it, depending on the value of the 'leaveVideoAction' option.
            if (event.previousIndex !== -1 && previousVideo.length !== 0) {
                if (this.settings.leaveVideoAction === 'stopVideo') {
                    previousVideo.videoController('stop');
                } else if (this.settings.leaveVideoAction === 'pauseVideo') {
                    previousVideo.videoController('pause');
                } else if (this.settings.leaveVideoAction === 'removeVideo') {
                    // If the video was lazy-loaded, remove it and show the poster again. If the video
                    // was not lazy-loaded, but inline, stop the video.
                    if (previousVideo.siblings('a.sp-video').length !== 0) {
                        previousVideo.siblings('a.sp-video').css('display', '');
                        previousVideo.videoController('destroy');
                        previousVideo.remove();
                    } else {
                        previousVideo.videoController('stop');
                    }
                }
            }

            // Handle the video from the selected slide
            if (this.settings.reachVideoAction === 'playVideo') {
                var loadedVideo = this.$slides.find('.sp-slide').eq(event.index).find('.sp-video[data-init]'),
                    unloadedVideo = this.$slides.find('.sp-slide').eq(event.index).find('.sp-video[data-preinit]');

                // If the video was already initialized, play it. If it's not initialized (because
                // it's lazy loaded) initialize it and play it.
                if (loadedVideo.length !== 0) {
                    loadedVideo.videoController('play');
                } else if (unloadedVideo.length !== 0) {
                    unloadedVideo.trigger('click.' + NS);
                }
            }
        },

        // Destroy the module
        destroyVideo: function () {
            this.$slider.find('.sp-video[ data-preinit ]').each(function () {
                var video = $(this);
                video.removeAttr('data-preinit');
                video.off('click.' + NS);
            });

            // Loop through the all the videos and destroy them
            this.$slider.find('.sp-video[ data-init ]').each(function () {
                var video = $(this);
                video.removeAttr('data-init');
                video.off('Video');
                video.videoController('destroy');
            });

            this.off('update.' + NS);
            this.off('gotoSlideComplete.' + NS);
        },

        videoDefaults: {

            // Sets the action that the video will perform when its slide container is selected
            // ( 'playVideo' and 'none' )
            reachVideoAction: 'none',

            // Sets the action that the video will perform when another slide is selected
            // ( 'stopVideo', 'pauseVideo', 'removeVideo' and 'none' )
            leaveVideoAction: 'pauseVideo',

            // Sets the action that the slider will perform when the video starts playing
            // ( 'stopAutoplay' and 'none' )
            playVideoAction: 'stopAutoplay',

            // Sets the action that the slider will perform when the video is paused
            // ( 'startAutoplay' and 'none' )
            pauseVideoAction: 'none',

            // Sets the action that the slider will perform when the video ends
            // ( 'startAutoplay', 'nextSlide', 'replayVideo' and 'none' )
            endVideoAction: 'none',

            // Called when the video starts playing
            videoPlay: function () { },

            // Called when the video is paused
            videoPause: function () { },

            // Called when the video ends
            videoEnd: function () { }
        }
    };

    $.SliderPro.addModule('Video', Video);

})(window, jQuery);

// Video Controller jQuery plugin
// Creates a universal controller for multiple video types and providers
; (function ($) {

    "use strict";

    // Check if an iOS device is used.
    // This information is important because a video can not be
    // controlled programmatically unless the user has started the video manually.
    var isIOS = window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;

    var VideoController = function (instance, options) {
        this.$video = $(instance);
        this.options = options;
        this.settings = {};
        this.player = null;

        this._init();
    };

    VideoController.prototype = {

        _init: function () {
            this.settings = $.extend({}, this.defaults, this.options);

            var that = this,
                players = $.VideoController.players,
                videoID = this.$video.attr('id');

            // Loop through the available video players
            // and check if the targeted video element is supported by one of the players.
            // If a compatible type is found, store the video type.
            for (var name in players) {
                if (typeof players[name] !== 'undefined' && players[name].isType(this.$video)) {
                    this.player = new players[name](this.$video);
                    break;
                }
            }

            // Return if the player could not be instantiated
            if (this.player === null) {
                return;
            }

            // Add event listeners
            var events = ['ready', 'start', 'play', 'pause', 'ended'];

            $.each(events, function (index, element) {
                var event = 'video' + element.charAt(0).toUpperCase() + element.slice(1);

                that.player.on(element, function () {
                    that.trigger({ type: event, video: videoID });
                    if ($.isFunction(that.settings[event])) {
                        that.settings[event].call(that, { type: event, video: videoID });
                    }
                });
            });
        },

        play: function () {
            if (isIOS === true && this.player.isStarted() === false || this.player.getState() === 'playing') {
                return;
            }

            this.player.play();
        },

        stop: function () {
            if (isIOS === true && this.player.isStarted() === false || this.player.getState() === 'stopped') {
                return;
            }

            this.player.stop();
        },

        pause: function () {
            if (isIOS === true && this.player.isStarted() === false || this.player.getState() === 'paused') {
                return;
            }

            this.player.pause();
        },

        replay: function () {
            if (isIOS === true && this.player.isStarted() === false) {
                return;
            }

            this.player.replay();
        },

        on: function (type, callback) {
            return this.$video.on(type, callback);
        },

        off: function (type) {
            return this.$video.off(type);
        },

        trigger: function (data) {
            return this.$video.triggerHandler(data);
        },

        destroy: function () {
            if (this.player.isStarted() === true) {
                this.stop();
            }

            this.player.off('ready');
            this.player.off('start');
            this.player.off('play');
            this.player.off('pause');
            this.player.off('ended');

            this.$video.removeData('videoController');
        },

        defaults: {
            videoReady: function () { },
            videoStart: function () { },
            videoPlay: function () { },
            videoPause: function () { },
            videoEnded: function () { }
        }
    };

    $.VideoController = {
        players: {},

        addPlayer: function (name, player) {
            this.players[name] = player;
        }
    };

    $.fn.videoController = function (options) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            // Instantiate the video controller or call a function on the current instance
            if (typeof $(this).data('videoController') === 'undefined') {
                var newInstance = new VideoController(this, options);

                // Store a reference to the instance created
                $(this).data('videoController', newInstance);
            } else if (typeof options !== 'undefined') {
                var currentInstance = $(this).data('videoController');

                // Check the type of argument passed
                if (typeof currentInstance[options] === 'function') {
                    currentInstance[options].apply(currentInstance, args);
                } else {
                    $.error(options + ' does not exist in videoController.');
                }
            }
        });
    };

    // Base object for the video players
    var Video = function (video) {
        this.$video = video;
        this.player = null;
        this.ready = false;
        this.started = false;
        this.state = '';
        this.events = $({});

        this._init();
    };

    Video.prototype = {
        _init: function () { },

        play: function () { },

        pause: function () { },

        stop: function () { },

        replay: function () { },

        isType: function () { },

        isReady: function () {
            return this.ready;
        },

        isStarted: function () {
            return this.started;
        },

        getState: function () {
            return this.state;
        },

        on: function (type, callback) {
            return this.events.on(type, callback);
        },

        off: function (type) {
            return this.events.off(type);
        },

        trigger: function (data) {
            return this.events.triggerHandler(data);
        }
    };

    // YouTube video
    var YoutubeVideoHelper = {
        youtubeAPIAdded: false,
        youtubeVideos: []
    };

    var YoutubeVideo = function (video) {
        this.init = false;
        var youtubeAPILoaded = window.YT && window.YT.Player;

        if (typeof youtubeAPILoaded !== 'undefined') {
            Video.call(this, video);
        } else {
            YoutubeVideoHelper.youtubeVideos.push({ 'video': video, 'scope': this });

            if (YoutubeVideoHelper.youtubeAPIAdded === false) {
                YoutubeVideoHelper.youtubeAPIAdded = true;

                var tag = document.createElement('script');
                tag.src = "http://www.youtube.com/player_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                window.onYouTubePlayerAPIReady = function () {
                    $.each(YoutubeVideoHelper.youtubeVideos, function (index, element) {
                        Video.call(element.scope, element.video);
                    });
                };
            }
        }
    };

    YoutubeVideo.prototype = new Video();
    YoutubeVideo.prototype.constructor = YoutubeVideo;
    $.VideoController.addPlayer('YoutubeVideo', YoutubeVideo);

    YoutubeVideo.isType = function (video) {
        if (video.is('iframe')) {
            var src = video.attr('src');

            if (src.indexOf('youtube.com') !== -1 || src.indexOf('youtu.be') !== -1) {
                return true;
            }
        }

        return false;
    };

    YoutubeVideo.prototype._init = function () {
        this.init = true;
        this._setup();
    };

    YoutubeVideo.prototype._setup = function () {
        var that = this;

        // Get a reference to the player
        this.player = new YT.Player(this.$video[0], {
            events: {
                'onReady': function () {
                    that.trigger({ type: 'ready' });
                    that.ready = true;
                },

                'onStateChange': function (event) {
                    switch (event.data) {
                        case YT.PlayerState.PLAYING:
                            if (that.started === false) {
                                that.started = true;
                                that.trigger({ type: 'start' });
                            }

                            that.state = 'playing';
                            that.trigger({ type: 'play' });
                            break;

                        case YT.PlayerState.PAUSED:
                            that.state = 'paused';
                            that.trigger({ type: 'pause' });
                            break;

                        case YT.PlayerState.ENDED:
                            that.state = 'ended';
                            that.trigger({ type: 'ended' });
                            break;
                    }
                }
            }
        });
    };

    YoutubeVideo.prototype.play = function () {
        var that = this;

        if (this.ready === true) {
            this.player.playVideo();
        } else {
            var timer = setInterval(function () {
                if (that.ready === true) {
                    clearInterval(timer);
                    that.player.playVideo();
                }
            }, 100);
        }
    };

    YoutubeVideo.prototype.pause = function () {
        // On iOS, simply pausing the video can make other videos unresponsive
        // so we stop the video instead.
        if (isIOS === true) {
            this.stop();
        } else {
            this.player.pauseVideo();
        }
    };

    YoutubeVideo.prototype.stop = function () {
        this.player.seekTo(1);
        this.player.stopVideo();
        this.state = 'stopped';
    };

    YoutubeVideo.prototype.replay = function () {
        this.player.seekTo(1);
        this.player.playVideo();
    };

    YoutubeVideo.prototype.on = function (type, callback) {
        var that = this;

        if (this.init === true) {
            Video.prototype.on.call(this, type, callback);
        } else {
            var timer = setInterval(function () {
                if (that.init === true) {
                    clearInterval(timer);
                    Video.prototype.on.call(that, type, callback);
                }
            }, 100);
        }
    };

    // Vimeo video
    var VimeoVideoHelper = {
        vimeoAPIAdded: false,
        vimeoVideos: []
    };

    var VimeoVideo = function (video) {
        this.init = false;

        if (typeof window.Froogaloop !== 'undefined') {
            Video.call(this, video);
        } else {
            VimeoVideoHelper.vimeoVideos.push({ 'video': video, 'scope': this });

            if (VimeoVideoHelper.vimeoAPIAdded === false) {
                VimeoVideoHelper.vimeoAPIAdded = true;

                var tag = document.createElement('script');
                tag.src = "http://a.vimeocdn.com/js/froogaloop2.min.js";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                var checkVimeoAPITimer = setInterval(function () {
                    if (typeof window.Froogaloop !== 'undefined') {
                        clearInterval(checkVimeoAPITimer);

                        $.each(VimeoVideoHelper.vimeoVideos, function (index, element) {
                            Video.call(element.scope, element.video);
                        });
                    }
                }, 100);
            }
        }
    };

    VimeoVideo.prototype = new Video();
    VimeoVideo.prototype.constructor = VimeoVideo;
    $.VideoController.addPlayer('VimeoVideo', VimeoVideo);

    VimeoVideo.isType = function (video) {
        if (video.is('iframe')) {
            var src = video.attr('src');

            if (src.indexOf('vimeo.com') !== -1) {
                return true;
            }
        }

        return false;
    };

    VimeoVideo.prototype._init = function () {
        this.init = true;
        this._setup();
    };

    VimeoVideo.prototype._setup = function () {
        var that = this;

        // Get a reference to the player
        this.player = $f(this.$video[0]);

        this.player.addEvent('ready', function () {
            that.ready = true;
            that.trigger({ type: 'ready' });

            that.player.addEvent('play', function () {
                if (that.started === false) {
                    that.started = true;
                    that.trigger({ type: 'start' });
                }

                that.state = 'playing';
                that.trigger({ type: 'play' });
            });

            that.player.addEvent('pause', function () {
                that.state = 'paused';
                that.trigger({ type: 'pause' });
            });

            that.player.addEvent('finish', function () {
                that.state = 'ended';
                that.trigger({ type: 'ended' });
            });
        });
    };

    VimeoVideo.prototype.play = function () {
        var that = this;

        if (this.ready === true) {
            this.player.api('play');
        } else {
            var timer = setInterval(function () {
                if (that.ready === true) {
                    clearInterval(timer);
                    that.player.api('play');
                }
            }, 100);
        }
    };

    VimeoVideo.prototype.pause = function () {
        this.player.api('pause');
    };

    VimeoVideo.prototype.stop = function () {
        this.player.api('seekTo', 0);
        this.player.api('pause');
        this.state = 'stopped';
    };

    VimeoVideo.prototype.replay = function () {
        this.player.api('seekTo', 0);
        this.player.api('play');
    };

    VimeoVideo.prototype.on = function (type, callback) {
        var that = this;

        if (this.init === true) {
            Video.prototype.on.call(this, type, callback);
        } else {
            var timer = setInterval(function () {
                if (that.init === true) {
                    clearInterval(timer);
                    Video.prototype.on.call(that, type, callback);
                }
            }, 100);
        }
    };

    // HTML5 video
    var HTML5Video = function (video) {
        Video.call(this, video);
    };

    HTML5Video.prototype = new Video();
    HTML5Video.prototype.constructor = HTML5Video;
    $.VideoController.addPlayer('HTML5Video', HTML5Video);

    HTML5Video.isType = function (video) {
        if (video.is('video') && video.hasClass('video-js') === false && video.hasClass('sublime') === false) {
            return true;
        }

        return false;
    };

    HTML5Video.prototype._init = function () {
        var that = this;

        // Get a reference to the player
        this.player = this.$video[0];
        this.ready = true;

        this.player.addEventListener('play', function () {
            if (that.started === false) {
                that.started = true;
                that.trigger({ type: 'start' });
            }

            that.state = 'playing';
            that.trigger({ type: 'play' });
        });

        this.player.addEventListener('pause', function () {
            that.state = 'paused';
            that.trigger({ type: 'pause' });
        });

        this.player.addEventListener('ended', function () {
            that.state = 'ended';
            that.trigger({ type: 'ended' });
        });
    };

    HTML5Video.prototype.play = function () {
        this.player.play();
    };

    HTML5Video.prototype.pause = function () {
        this.player.pause();
    };

    HTML5Video.prototype.stop = function () {
        this.player.currentTime = 0;
        this.player.pause();
        this.state = 'stopped';
    };

    HTML5Video.prototype.replay = function () {
        this.player.currentTime = 0;
        this.player.play();
    };

    // VideoJS video
    var VideoJSVideo = function (video) {
        Video.call(this, video);
    };

    VideoJSVideo.prototype = new Video();
    VideoJSVideo.prototype.constructor = VideoJSVideo;
    $.VideoController.addPlayer('VideoJSVideo', VideoJSVideo);

    VideoJSVideo.isType = function (video) {
        if ((typeof video.attr('data-videojs-id') !== 'undefined' || video.hasClass('video-js')) && typeof videojs !== 'undefined') {
            return true;
        }

        return false;
    };

    VideoJSVideo.prototype._init = function () {
        var that = this,
            videoID = this.$video.hasClass('video-js') ? this.$video.attr('id') : this.$video.attr('data-videojs-id');

        this.player = videojs(videoID);

        this.player.ready(function () {
            that.ready = true;
            that.trigger({ type: 'ready' });

            that.player.on('play', function () {
                if (that.started === false) {
                    that.started = true;
                    that.trigger({ type: 'start' });
                }

                that.state = 'playing';
                that.trigger({ type: 'play' });
            });

            that.player.on('pause', function () {
                that.state = 'paused';
                that.trigger({ type: 'pause' });
            });

            that.player.on('ended', function () {
                that.state = 'ended';
                that.trigger({ type: 'ended' });
            });
        });
    };

    VideoJSVideo.prototype.play = function () {
        this.player.play();
    };

    VideoJSVideo.prototype.pause = function () {
        this.player.pause();
    };

    VideoJSVideo.prototype.stop = function () {
        this.player.currentTime(0);
        this.player.pause();
        this.state = 'stopped';
    };

    VideoJSVideo.prototype.replay = function () {
        this.player.currentTime(0);
        this.player.play();
    };

    // Sublime video
    var SublimeVideo = function (video) {
        Video.call(this, video);
    };

    SublimeVideo.prototype = new Video();
    SublimeVideo.prototype.constructor = SublimeVideo;
    $.VideoController.addPlayer('SublimeVideo', SublimeVideo);

    SublimeVideo.isType = function (video) {
        if (video.hasClass('sublime') && typeof sublime !== 'undefined') {
            return true;
        }

        return false;
    };

    SublimeVideo.prototype._init = function () {
        var that = this;

        sublime.ready(function () {
            // Get a reference to the player
            that.player = sublime.player(that.$video.attr('id'));

            that.ready = true;
            that.trigger({ type: 'ready' });

            that.player.on('play', function () {
                if (that.started === false) {
                    that.started = true;
                    that.trigger({ type: 'start' });
                }

                that.state = 'playing';
                that.trigger({ type: 'play' });
            });

            that.player.on('pause', function () {
                that.state = 'paused';
                that.trigger({ type: 'pause' });
            });

            that.player.on('stop', function () {
                that.state = 'stopped';
                that.trigger({ type: 'stop' });
            });

            that.player.on('end', function () {
                that.state = 'ended';
                that.trigger({ type: 'ended' });
            });
        });
    };

    SublimeVideo.prototype.play = function () {
        this.player.play();
    };

    SublimeVideo.prototype.pause = function () {
        this.player.pause();
    };

    SublimeVideo.prototype.stop = function () {
        this.player.stop();
    };

    SublimeVideo.prototype.replay = function () {
        this.player.stop();
        this.player.play();
    };

    // JWPlayer video
    var JWPlayerVideo = function (video) {
        Video.call(this, video);
    };

    JWPlayerVideo.prototype = new Video();
    JWPlayerVideo.prototype.constructor = JWPlayerVideo;
    $.VideoController.addPlayer('JWPlayerVideo', JWPlayerVideo);

    JWPlayerVideo.isType = function (video) {
        if ((typeof video.attr('data-jwplayer-id') !== 'undefined' || video.hasClass('jwplayer') || video.find("object[data*='jwplayer']").length !== 0) &&
            typeof jwplayer !== 'undefined') {
            return true;
        }

        return false;
    };

    JWPlayerVideo.prototype._init = function () {
        var that = this,
            videoID;

        if (this.$video.hasClass('jwplayer')) {
            videoID = this.$video.attr('id');
        } else if (typeof this.$video.attr('data-jwplayer-id') !== 'undefined') {
            videoID = this.$video.attr('data-jwplayer-id');
        } else if (this.$video.find("object[data*='jwplayer']").length !== 0) {
            videoID = this.$video.find('object').attr('id');
        }

        // Get a reference to the player
        this.player = jwplayer(videoID);

        this.player.onReady(function () {
            that.ready = true;
            that.trigger({ type: 'ready' });

            that.player.onPlay(function () {
                if (that.started === false) {
                    that.started = true;
                    that.trigger({ type: 'start' });
                }

                that.state = 'playing';
                that.trigger({ type: 'play' });
            });

            that.player.onPause(function () {
                that.state = 'paused';
                that.trigger({ type: 'pause' });
            });

            that.player.onComplete(function () {
                that.state = 'ended';
                that.trigger({ type: 'ended' });
            });
        });
    };

    JWPlayerVideo.prototype.play = function () {
        this.player.play(true);
    };

    JWPlayerVideo.prototype.pause = function () {
        this.player.pause(true);
    };

    JWPlayerVideo.prototype.stop = function () {
        this.player.stop();
        this.state = 'stopped';
    };

    JWPlayerVideo.prototype.replay = function () {
        this.player.seek(0);
        this.player.play(true);
    };

})(jQuery);


// Generated by CoffeeScript 1.6.2
/*
jQuery Waypoints - v2.0.3
Copyright (c) 2011-2013 Caleb Troughton
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
*/
(function () { var t = [].indexOf || function (t) { for (var e = 0, n = this.length; e < n; e++) { if (e in this && this[e] === t) return e } return -1 }, e = [].slice; (function (t, e) { if (typeof define === "function" && define.amd) { return define("waypoints", ["jquery"], function (n) { return e(n, t) }) } else { return e(t.jQuery, t) } })(this, function (n, r) { var i, o, l, s, f, u, a, c, h, d, p, y, v, w, g, m; i = n(r); c = t.call(r, "ontouchstart") >= 0; s = { horizontal: {}, vertical: {} }; f = 1; a = {}; u = "waypoints-context-id"; p = "resize.waypoints"; y = "scroll.waypoints"; v = 1; w = "waypoints-waypoint-ids"; g = "waypoint"; m = "waypoints"; o = function () { function t(t) { var e = this; this.$element = t; this.element = t[0]; this.didResize = false; this.didScroll = false; this.id = "context" + f++; this.oldScroll = { x: t.scrollLeft(), y: t.scrollTop() }; this.waypoints = { horizontal: {}, vertical: {} }; t.data(u, this.id); a[this.id] = this; t.bind(y, function () { var t; if (!(e.didScroll || c)) { e.didScroll = true; t = function () { e.doScroll(); return e.didScroll = false }; return r.setTimeout(t, n[m].settings.scrollThrottle) } }); t.bind(p, function () { var t; if (!e.didResize) { e.didResize = true; t = function () { n[m]("refresh"); return e.didResize = false }; return r.setTimeout(t, n[m].settings.resizeThrottle) } }) } t.prototype.doScroll = function () { var t, e = this; t = { horizontal: { newScroll: this.$element.scrollLeft(), oldScroll: this.oldScroll.x, forward: "right", backward: "left" }, vertical: { newScroll: this.$element.scrollTop(), oldScroll: this.oldScroll.y, forward: "down", backward: "up" } }; if (c && (!t.vertical.oldScroll || !t.vertical.newScroll)) { n[m]("refresh") } n.each(t, function (t, r) { var i, o, l; l = []; o = r.newScroll > r.oldScroll; i = o ? r.forward : r.backward; n.each(e.waypoints[t], function (t, e) { var n, i; if (r.oldScroll < (n = e.offset) && n <= r.newScroll) { return l.push(e) } else if (r.newScroll < (i = e.offset) && i <= r.oldScroll) { return l.push(e) } }); l.sort(function (t, e) { return t.offset - e.offset }); if (!o) { l.reverse() } return n.each(l, function (t, e) { if (e.options.continuous || t === l.length - 1) { return e.trigger([i]) } }) }); return this.oldScroll = { x: t.horizontal.newScroll, y: t.vertical.newScroll } }; t.prototype.refresh = function () { var t, e, r, i = this; r = n.isWindow(this.element); e = this.$element.offset(); this.doScroll(); t = { horizontal: { contextOffset: r ? 0 : e.left, contextScroll: r ? 0 : this.oldScroll.x, contextDimension: this.$element.width(), oldScroll: this.oldScroll.x, forward: "right", backward: "left", offsetProp: "left" }, vertical: { contextOffset: r ? 0 : e.top, contextScroll: r ? 0 : this.oldScroll.y, contextDimension: r ? n[m]("viewportHeight") : this.$element.height(), oldScroll: this.oldScroll.y, forward: "down", backward: "up", offsetProp: "top" } }; return n.each(t, function (t, e) { return n.each(i.waypoints[t], function (t, r) { var i, o, l, s, f; i = r.options.offset; l = r.offset; o = n.isWindow(r.element) ? 0 : r.$element.offset()[e.offsetProp]; if (n.isFunction(i)) { i = i.apply(r.element) } else if (typeof i === "string") { i = parseFloat(i); if (r.options.offset.indexOf("%") > -1) { i = Math.ceil(e.contextDimension * i / 100) } } r.offset = o - e.contextOffset + e.contextScroll - i; if (r.options.onlyOnScroll && l != null || !r.enabled) { return } if (l !== null && l < (s = e.oldScroll) && s <= r.offset) { return r.trigger([e.backward]) } else if (l !== null && l > (f = e.oldScroll) && f >= r.offset) { return r.trigger([e.forward]) } else if (l === null && e.oldScroll >= r.offset) { return r.trigger([e.forward]) } }) }) }; t.prototype.checkEmpty = function () { if (n.isEmptyObject(this.waypoints.horizontal) && n.isEmptyObject(this.waypoints.vertical)) { this.$element.unbind([p, y].join(" ")); return delete a[this.id] } }; return t }(); l = function () { function t(t, e, r) { var i, o; r = n.extend({}, n.fn[g].defaults, r); if (r.offset === "bottom-in-view") { r.offset = function () { var t; t = n[m]("viewportHeight"); if (!n.isWindow(e.element)) { t = e.$element.height() } return t - n(this).outerHeight() } } this.$element = t; this.element = t[0]; this.axis = r.horizontal ? "horizontal" : "vertical"; this.callback = r.handler; this.context = e; this.enabled = r.enabled; this.id = "waypoints" + v++; this.offset = null; this.options = r; e.waypoints[this.axis][this.id] = this; s[this.axis][this.id] = this; i = (o = t.data(w)) != null ? o : []; i.push(this.id); t.data(w, i) } t.prototype.trigger = function (t) { if (!this.enabled) { return } if (this.callback != null) { this.callback.apply(this.element, t) } if (this.options.triggerOnce) { return this.destroy() } }; t.prototype.disable = function () { return this.enabled = false }; t.prototype.enable = function () { this.context.refresh(); return this.enabled = true }; t.prototype.destroy = function () { delete s[this.axis][this.id]; delete this.context.waypoints[this.axis][this.id]; return this.context.checkEmpty() }; t.getWaypointsByElement = function (t) { var e, r; r = n(t).data(w); if (!r) { return [] } e = n.extend({}, s.horizontal, s.vertical); return n.map(r, function (t) { return e[t] }) }; return t }(); d = { init: function (t, e) { var r; if (e == null) { e = {} } if ((r = e.handler) == null) { e.handler = t } this.each(function () { var t, r, i, s; t = n(this); i = (s = e.context) != null ? s : n.fn[g].defaults.context; if (!n.isWindow(i)) { i = t.closest(i) } i = n(i); r = a[i.data(u)]; if (!r) { r = new o(i) } return new l(t, r, e) }); n[m]("refresh"); return this }, disable: function () { return d._invoke(this, "disable") }, enable: function () { return d._invoke(this, "enable") }, destroy: function () { return d._invoke(this, "destroy") }, prev: function (t, e) { return d._traverse.call(this, t, e, function (t, e, n) { if (e > 0) { return t.push(n[e - 1]) } }) }, next: function (t, e) { return d._traverse.call(this, t, e, function (t, e, n) { if (e < n.length - 1) { return t.push(n[e + 1]) } }) }, _traverse: function (t, e, i) { var o, l; if (t == null) { t = "vertical" } if (e == null) { e = r } l = h.aggregate(e); o = []; this.each(function () { var e; e = n.inArray(this, l[t]); return i(o, e, l[t]) }); return this.pushStack(o) }, _invoke: function (t, e) { t.each(function () { var t; t = l.getWaypointsByElement(this); return n.each(t, function (t, n) { n[e](); return true }) }); return this } }; n.fn[g] = function () { var t, r; r = arguments[0], t = 2 <= arguments.length ? e.call(arguments, 1) : []; if (d[r]) { return d[r].apply(this, t) } else if (n.isFunction(r)) { return d.init.apply(this, arguments) } else if (n.isPlainObject(r)) { return d.init.apply(this, [null, r]) } else if (!r) { return n.error("jQuery Waypoints needs a callback function or handler option.") } else { return n.error("The " + r + " method does not exist in jQuery Waypoints.") } }; n.fn[g].defaults = { context: r, continuous: true, enabled: true, horizontal: false, offset: 0, triggerOnce: false }; h = { refresh: function () { return n.each(a, function (t, e) { return e.refresh() }) }, viewportHeight: function () { var t; return (t = r.innerHeight) != null ? t : i.height() }, aggregate: function (t) { var e, r, i; e = s; if (t) { e = (i = a[n(t).data(u)]) != null ? i.waypoints : void 0 } if (!e) { return [] } r = { horizontal: [], vertical: [] }; n.each(r, function (t, i) { n.each(e[t], function (t, e) { return i.push(e) }); i.sort(function (t, e) { return t.offset - e.offset }); r[t] = n.map(i, function (t) { return t.element }); return r[t] = n.unique(r[t]) }); return r }, above: function (t) { if (t == null) { t = r } return h._filter(t, "vertical", function (t, e) { return e.offset <= t.oldScroll.y }) }, below: function (t) { if (t == null) { t = r } return h._filter(t, "vertical", function (t, e) { return e.offset > t.oldScroll.y }) }, left: function (t) { if (t == null) { t = r } return h._filter(t, "horizontal", function (t, e) { return e.offset <= t.oldScroll.x }) }, right: function (t) { if (t == null) { t = r } return h._filter(t, "horizontal", function (t, e) { return e.offset > t.oldScroll.x }) }, enable: function () { return h._invoke("enable") }, disable: function () { return h._invoke("disable") }, destroy: function () { return h._invoke("destroy") }, extendFn: function (t, e) { return d[t] = e }, _invoke: function (t) { var e; e = n.extend({}, s.vertical, s.horizontal); return n.each(e, function (e, n) { n[t](); return true }) }, _filter: function (t, e, r) { var i, o; i = a[n(t).data(u)]; if (!i) { return [] } o = []; n.each(i.waypoints[e], function (t, e) { if (r(i, e)) { return o.push(e) } }); o.sort(function (t, e) { return t.offset - e.offset }); return n.map(o, function (t) { return t.element }) } }; n[m] = function () { var t, n; n = arguments[0], t = 2 <= arguments.length ? e.call(arguments, 1) : []; if (h[n]) { return h[n].apply(null, t) } else { return h.aggregate.call(null, n) } }; n[m].settings = { resizeThrottle: 100, scrollThrottle: 30 }; return i.load(function () { return n[m]("refresh") }) }) }).call(this);


/*!
* jquery.counterup.js 1.0
*
* Copyright 2013, Benjamin Intal http://gambit.ph @bfintal
* Released under the GPL v2 License
*
* Date: Nov 26, 2013
*/(function (e) { "use strict"; e.fn.counterUp = function (t) { var n = e.extend({ time: 400, delay: 10 }, t); return this.each(function () { var t = e(this), r = n, i = function () { var e = [], n = r.time / r.delay, i = t.text(), s = /[0-9]+,[0-9]+/.test(i); i = i.replace(/,/g, ""); var o = /^[0-9]+$/.test(i), u = /^[0-9]+\.[0-9]+$/.test(i), a = u ? (i.split(".")[1] || []).length : 0; for (var f = n; f >= 1; f--) { var l = parseInt(i / n * f); u && (l = parseFloat(i / n * f).toFixed(a)); if (s) while (/(\d+)(\d{3})/.test(l.toString())) l = l.toString().replace(/(\d+)(\d{3})/, "$1,$2"); e.unshift(l) } t.data("counterup-nums", e); t.text("0"); var c = function () { t.text(t.data("counterup-nums").shift()); if (t.data("counterup-nums").length) setTimeout(t.data("counterup-func"), r.delay); else { delete t.data("counterup-nums"); t.data("counterup-nums", null); t.data("counterup-func", null) } }; t.data("counterup-func", c); setTimeout(t.data("counterup-func"), r.delay) }; t.waypoint(i, { offset: "100%", triggerOnce: !0 }) }) } })(jQuery);


/**!
 * easy-pie-chart
 * Lightweight plugin to render simple, animated and retina optimized pie charts
 *
 * @license 
 * @author Robert Fleischmann <rendro87@gmail.com> (http://robert-fleischmann.de)
 * @version 2.1.7
 **/
!function (a, b) { "function" == typeof define && define.amd ? define(["jquery"], function (a) { return b(a) }) : "object" == typeof exports ? module.exports = b(require("jquery")) : b(jQuery) }(this, function (a) { var b = function (a, b) { var c, d = document.createElement("canvas"); a.appendChild(d), "object" == typeof G_vmlCanvasManager && G_vmlCanvasManager.initElement(d); var e = d.getContext("2d"); d.width = d.height = b.size; var f = 1; window.devicePixelRatio > 1 && (f = window.devicePixelRatio, d.style.width = d.style.height = [b.size, "px"].join(""), d.width = d.height = b.size * f, e.scale(f, f)), e.translate(b.size / 2, b.size / 2), e.rotate((-0.5 + b.rotate / 180) * Math.PI); var g = (b.size - b.lineWidth) / 2; b.scaleColor && b.scaleLength && (g -= b.scaleLength + 2), Date.now = Date.now || function () { return +new Date }; var h = function (a, b, c) { c = Math.min(Math.max(-1, c || 0), 1); var d = 0 >= c ? !0 : !1; e.beginPath(), e.arc(0, 0, g, 0, 2 * Math.PI * c, d), e.strokeStyle = a, e.lineWidth = b, e.stroke() }, i = function () { var a, c; e.lineWidth = 1, e.fillStyle = b.scaleColor, e.save(); for (var d = 24; d > 0; --d) d % 6 === 0 ? (c = b.scaleLength, a = 0) : (c = .6 * b.scaleLength, a = b.scaleLength - c), e.fillRect(-b.size / 2 + a, 0, c, 1), e.rotate(Math.PI / 12); e.restore() }, j = function () { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (a) { window.setTimeout(a, 1e3 / 60) } }(), k = function () { b.scaleColor && i(), b.trackColor && h(b.trackColor, b.trackWidth || b.lineWidth, 1) }; this.getCanvas = function () { return d }, this.getCtx = function () { return e }, this.clear = function () { e.clearRect(b.size / -2, b.size / -2, b.size, b.size) }, this.draw = function (a) { b.scaleColor || b.trackColor ? e.getImageData && e.putImageData ? c ? e.putImageData(c, 0, 0) : (k(), c = e.getImageData(0, 0, b.size * f, b.size * f)) : (this.clear(), k()) : this.clear(), e.lineCap = b.lineCap; var d; d = "function" == typeof b.barColor ? b.barColor(a) : b.barColor, h(d, b.lineWidth, a / 100) }.bind(this), this.animate = function (a, c) { var d = Date.now(); b.onStart(a, c); var e = function () { var f = Math.min(Date.now() - d, b.animate.duration), g = b.easing(this, f, a, c - a, b.animate.duration); this.draw(g), b.onStep(a, c, g), f >= b.animate.duration ? b.onStop(a, c) : j(e) }.bind(this); j(e) }.bind(this) }, c = function (a, c) { var d = { barColor: "#ef1e25", trackColor: "#f9f9f9", scaleColor: "#dfe0e0", scaleLength: 5, lineCap: "round", lineWidth: 3, trackWidth: void 0, size: 110, rotate: 0, animate: { duration: 1e3, enabled: !0 }, easing: function (a, b, c, d, e) { return b /= e / 2, 1 > b ? d / 2 * b * b + c : -d / 2 * (--b * (b - 2) - 1) + c }, onStart: function (a, b) { }, onStep: function (a, b, c) { }, onStop: function (a, b) { } }; if ("undefined" != typeof b) d.renderer = b; else { if ("undefined" == typeof SVGRenderer) throw new Error("Please load either the SVG- or the CanvasRenderer"); d.renderer = SVGRenderer } var e = {}, f = 0, g = function () { this.el = a, this.options = e; for (var b in d) d.hasOwnProperty(b) && (e[b] = c && "undefined" != typeof c[b] ? c[b] : d[b], "function" == typeof e[b] && (e[b] = e[b].bind(this))); "string" == typeof e.easing && "undefined" != typeof jQuery && jQuery.isFunction(jQuery.easing[e.easing]) ? e.easing = jQuery.easing[e.easing] : e.easing = d.easing, "number" == typeof e.animate && (e.animate = { duration: e.animate, enabled: !0 }), "boolean" != typeof e.animate || e.animate || (e.animate = { duration: 1e3, enabled: e.animate }), this.renderer = new e.renderer(a, e), this.renderer.draw(f), a.dataset && a.dataset.percent ? this.update(parseFloat(a.dataset.percent)) : a.getAttribute && a.getAttribute("data-percent") && this.update(parseFloat(a.getAttribute("data-percent"))) }.bind(this); this.update = function (a) { return a = parseFloat(a), e.animate.enabled ? this.renderer.animate(f, a) : this.renderer.draw(a), f = a, this }.bind(this), this.disableAnimation = function () { return e.animate.enabled = !1, this }, this.enableAnimation = function () { return e.animate.enabled = !0, this }, g() }; a.fn.easyPieChart = function (b) { return this.each(function () { var d; a.data(this, "easyPieChart") || (d = a.extend({}, b, a(this).data()), a.data(this, "easyPieChart", new c(this, d))) }) } });



/*!
 * The Final Countdown for jQuery v2.1.0 (http://hilios.github.io/jQuery.countdown/)
 * Copyright (c) 2015 Edson Hilios
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
!function (a) { "use strict"; "function" == typeof define && define.amd ? define(["jquery"], a) : a(jQuery) }(function (a) { "use strict"; function b(a) { if (a instanceof Date) return a; if (String(a).match(g)) return String(a).match(/^[0-9]*$/) && (a = Number(a)), String(a).match(/\-/) && (a = String(a).replace(/\-/g, "/")), new Date(a); throw new Error("Couldn't cast `" + a + "` to a date object.") } function c(a) { var b = a.toString().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"); return new RegExp(b) } function d(a) { return function (b) { var d = b.match(/%(-|!)?[A-Z]{1}(:[^;]+;)?/gi); if (d) for (var f = 0, g = d.length; g > f; ++f) { var h = d[f].match(/%(-|!)?([a-zA-Z]{1})(:[^;]+;)?/), j = c(h[0]), k = h[1] || "", l = h[3] || "", m = null; h = h[2], i.hasOwnProperty(h) && (m = i[h], m = Number(a[m])), null !== m && ("!" === k && (m = e(l, m)), "" === k && 10 > m && (m = "0" + m.toString()), b = b.replace(j, m.toString())) } return b = b.replace(/%%/, "%") } } function e(a, b) { var c = "s", d = ""; return a && (a = a.replace(/(:|;|\s)/gi, "").split(/\,/), 1 === a.length ? c = a[0] : (d = a[0], c = a[1])), 1 === Math.abs(b) ? d : c } var f = [], g = [], h = { precision: 100, elapse: !1 }; g.push(/^[0-9]*$/.source), g.push(/([0-9]{1,2}\/){2}[0-9]{4}( [0-9]{1,2}(:[0-9]{2}){2})?/.source), g.push(/[0-9]{4}([\/\-][0-9]{1,2}){2}( [0-9]{1,2}(:[0-9]{2}){2})?/.source), g = new RegExp(g.join("|")); var i = { Y: "years", m: "months", n: "daysToMonth", w: "weeks", d: "daysToWeek", D: "totalDays", H: "hours", M: "minutes", S: "seconds" }, j = function (b, c, d) { this.el = b, this.$el = a(b), this.interval = null, this.offset = {}, this.options = a.extend({}, h), this.instanceNumber = f.length, f.push(this), this.$el.data("countdown-instance", this.instanceNumber), d && ("function" == typeof d ? (this.$el.on("update.countdown", d), this.$el.on("stoped.countdown", d), this.$el.on("finish.countdown", d)) : this.options = a.extend({}, h, d)), this.setFinalDate(c), this.start() }; a.extend(j.prototype, { start: function () { null !== this.interval && clearInterval(this.interval); var a = this; this.update(), this.interval = setInterval(function () { a.update.call(a) }, this.options.precision) }, stop: function () { clearInterval(this.interval), this.interval = null, this.dispatchEvent("stoped") }, toggle: function () { this.interval ? this.stop() : this.start() }, pause: function () { this.stop() }, resume: function () { this.start() }, remove: function () { this.stop.call(this), f[this.instanceNumber] = null, delete this.$el.data().countdownInstance }, setFinalDate: function (a) { this.finalDate = b(a) }, update: function () { if (0 === this.$el.closest("html").length) return void this.remove(); var b, c = void 0 !== a._data(this.el, "events"), d = new Date; b = this.finalDate.getTime() - d.getTime(), b = Math.ceil(b / 1e3), b = !this.options.elapse && 0 > b ? 0 : Math.abs(b), this.totalSecsLeft !== b && c && (this.totalSecsLeft = b, this.elapsed = d >= this.finalDate, this.offset = { seconds: this.totalSecsLeft % 60, minutes: Math.floor(this.totalSecsLeft / 60) % 60, hours: Math.floor(this.totalSecsLeft / 60 / 60) % 24, days: Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7, daysToWeek: Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7, daysToMonth: Math.floor(this.totalSecsLeft / 60 / 60 / 24 % 30.4368), totalDays: Math.floor(this.totalSecsLeft / 60 / 60 / 24), weeks: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 7), months: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 30.4368), years: Math.abs(this.finalDate.getFullYear() - d.getFullYear()) }, this.options.elapse || 0 !== this.totalSecsLeft ? this.dispatchEvent("update") : (this.stop(), this.dispatchEvent("finish"))) }, dispatchEvent: function (b) { var c = a.Event(b + ".countdown"); c.finalDate = this.finalDate, c.elapsed = this.elapsed, c.offset = a.extend({}, this.offset), c.strftime = d(this.offset), this.$el.trigger(c) } }), a.fn.countdown = function () { var b = Array.prototype.slice.call(arguments, 0); return this.each(function () { var c = a(this).data("countdown-instance"); if (void 0 !== c) { var d = f[c], e = b[0]; j.prototype.hasOwnProperty(e) ? d[e].apply(d, b.slice(1)) : null === String(e).match(/^[$A-Z_][0-9A-Z_$]*$/i) ? (d.setFinalDate.call(d, e), d.start()) : a.error("Method %s does not exist on jQuery.countdown".replace(/\%s/gi, e)) } else new j(this, b[0], b[1]) }) } });



