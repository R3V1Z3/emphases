var transforms = {}; // holds initial transform
var $t; // will hold container where transforms are made
var win;
var vars;

jQuery(document).ready(function () {

    // attach the plugin to an element
    $('#wrapper').gitdown({
        'title': 'Emphases',
        'content': 'README.md',
        'merge_gists': false,
        'callback': main
    });
    var $gd = $('#wrapper').data('gitdown');
    var eid = '#wrapper';
    var eid_inner = eid + ' .inner';

    var inner_width = $(eid_inner).width();
    var inner_height = $(eid_inner).height();

    function main() {
        $('connection').remove();

        treversed();
        $t = $('.inner').addClass('no-transition');

        position_sections();
        add_padding();
        configure_sections();
        notize();
        register_events();
        render_connections();
        update_transform(transforms);
        local_links();
        must_stay_focused();
    }

    // for the moment, this same code base will be used for multiple apps
    // treversed() will serve the differences for now until larger changes are needed
    function treversed() {
        transforms = {
            'scale': 1, 'translateX': '0px', 'translateY': '0px',
            'perspective': '400px', 'rotateX': '0deg', 'rotateY': '0deg', 'scaleZ': '1',
            'rotateZ': '0deg', 'translateZ': '0px'
        };
        if ( $gd.settings.title === 'TreversED' ) {
            transforms = {
                'scale': 1, 'translateX': '0px', 'translateY': '0px',
                'perspective': '400px', 'rotateX': '5deg', 'rotateY': '0deg', 'scaleZ': '1',
                'rotateZ': '5deg', 'translateZ': '0px'
            };
        }
    }

    function local_links() {
        $(eid_inner + ' a[href^=#]').addClass('local');
    }

    // initial routine to update current link and set starting focus
    function must_stay_focused() {
        // get current section based on current toc link
        var $c = $(eid + ' .info .toc a.current');
        $c.removeClass('current');

        var hash = window.location.hash;
        if ( hash !== '' ) {
            // resort to default if hash section doesn't exist
            var $hash = $(eid + ` .info .toc a[href=${hash}]`);
            if ( $hash.length > 0 ) $c = $hash;
        }

        $c.click();

        // for cases where only one section exists
        var id = $(eid + ' .section.current').attr('id');
        if ( $gd.settings.loaded ) {
            transform_focus(id);
        }

        if ( !$gd.settings.loaded ) {
            register_events_onstartup();
        }
    }

    function update_transform(t) {

        // ensure viewport doesn't go outside bounds
        var x = parseFloat(t['translateX']);
        var y = parseFloat(t['translateY']);
        
        var scale = parseFloat(t['translateZ']) / 100;
        
        t['translateX'] = x + 'px';
        t['translateY'] = y + 'px';

        var str = '';
        for (key in t) {
            str += `${key}(${t[key]}) `;
        }
        $t.css('transform', str);
        return t;
    }

    // t = true when rendering transforms
    function render_values() {
        $f = $(eid + ` .info .collapsible.perspective .field.slider`);
        $f.each(function () {
            var $i = $(this).find('input');
            var name = $i.attr('name');
            var value = $i.val();
            var suffix = $i.attr('data-suffix');
            if (suffix === undefined) suffix = '';
            f += `${name}(${value}${suffix}) `;
        });
        $(eid_inner + ' .section.current').css('transform', f);
    }

    function position_sections() {
        
        // width and height optimizations can be done via themes
        // we'll begin by getting width and height after theme injection
        var w = inner_width;
        var h = inner_height;

        var $sections = $('.section *');
        if ($sections.length > 0) {
            // find attributes and position section
            $sections.children().each(function () {
                var comments = $(this).getComments();
                if (comments.length > 0) {
                    // comment found, extract attributes
                    var text = comments[0];
                    var s = text.substr(text.indexOf("{") + 1).split('}')[0];
                    var pairs = s.split(',');
                    for (var i = 0; i < pairs.length; i++) {
                        var key = pairs[i].split(':')[0];
                        var value = pairs[i].split(':')[1];
                        if (key === 'left') {
                            value = parseFloat(value);// + w / 2;
                        } else if (key === 'top') {
                            value = parseFloat(value);// + h / 2;
                        } else if (key === 'transform') {
                            // special case, we'll add a data-transform attr
                            $(this).closest('.section').css('transform', value);
                            $(this).closest('.section').attr('data-transform', value);
                        }
                        $(this).closest('.section').css(key, value);
                    }
                }
            });
        }

        // now position elements that don't have position comments
        var counter = 0;
        var left = 0;
        var top = 0;
        var row_height = 0;
        $(eid_inner + ' .section').each(function () {

            var padding_left = parseFloat( $(this).css('padding-left') );
            var padding_top = parseFloat( $(this).css('padding-top') );

            // calculate and update section height
            var height = $(this).find('.content').height();
            if ( $(this).find('.handle-heading').is(":visible") ) {
                height += $(this).find('.handle-heading').height();
            }

            // row_height will be the height of the tallest section in the current row
            if ( height > row_height ) row_height = height;

            var x = parseFloat( $(this).css('left') );
            var y = parseFloat( $(this).css('top') );
            if ( x === 0 && y === 0 ) {
                $(this).height(height + padding_top);
                // set default values for section positions
                if (counter > 0) {
                    var prev_width = $(this).prev('.section').width() + padding_left;
                    // setup allowed_width to enforce single column when p tag used for heading
                    var allowed_width = w;
                    if ( $gd.settings.heading === 'p' || $gd.settings.heading === 'lyrics' ) {
                        allowed_width = prev_width;
                    }
                    // increment height if width of document is surpassed
                    if ( left > allowed_width - (prev_width * 1) ) {
                        left = 0;
                        top += row_height + padding_top;
                        row_height = 0;
                    } else {
                        left += prev_width;
                    }
                }
                $(this).css({ top: top, left: left });
                counter += 1;
            }
        });
    }

    function add_padding() {
        // now calculate the least and furthest section dimensions
        var $first = $(eid_inner + ' .section:first-child');
        var least_x = parseFloat( $first.css('left') );
        var least_y = parseFloat( $first.css('top') );
        var greatest_x = least_x;
        var greatest_y = least_y;
        $(eid + ' .section').each(function () {
            var $s = $(this);
            var current_x = parseFloat( $s.css('left') );
            var current_y = parseFloat( $s.css('top') );

            if ( current_x < least_x ) least_x = current_x;
            if ( current_y < least_y ) least_y = current_y;

            var current_width = $s.width();
            var current_height = $s.height();

            if ( current_x + current_width > greatest_x ) {
                greatest_x = current_x + current_width;
            }

            if ( current_y + current_height > greatest_y ) {
                greatest_y = current_y + current_height;
            }
        });

        var width = greatest_x - least_x;
        var height = greatest_y - least_y;

        var padding_x = width / 2;
        var padding_y = height / 2;

        $inner = $(eid_inner);
        $inner.width(width * 2);
        $inner.height(height * 2);

        $(eid_inner + ' .section').each(function () {
            var $s = $(this);
            var x = parseFloat( $s.css('left') );
            var y = parseFloat( $s.css('top') );
            $s.css('left', x - least_x + padding_x + 'px');
            $s.css('top', y - least_y + padding_y + 'px');
        });
    }

    function configure_sections() {
        $(eid + ' .section').each(function () {
            var $s = $(this);
            $s.addClass('no-transition');
            // set initial position values
            var x = $s.css('left').slice(0, -2);
            var y = $s.css('top').slice(0, -2);
            $s.attr('data-x', x);
            $s.attr('data-y', y);
        });
    }

    function notize() {
        $(eid + ' .section').each(function () {
            var $s = $(this);
            var name = $s.find('a.handle').attr('name');
            // check if any anchor links reference this setion and add respective classes if so
            $(".content a[href^=#]").each(function () {
                var $link = $(this);
                var href = $link.attr('href').substr(1);
                if (href === name) {
                    // this is a note, so set boolean for later
                    var classes = ' note note-' + href;
                    $s.addClass(classes);
                    // add note class to anchor link too
                    $link.addClass('n-' + href);
                    $link.addClass('n-reference');
                    $link.closest('.section').addClass('reference');
                }
            });
        });
    }

    function render_connections() {
        if ( $('connection').length > 0 ) {
            $('.n-reference').connections('remove');
        }
        $(eid + ' .section .content .n-reference').each(function () {
            // extract class this links to
            var classes = $(this).attr('class').split(' ');
            var to = '';
            for ( var i = 0; i < classes.length; i++ ) {
                var c = classes[i];
                if ( c !== 'n-reference' && c.indexOf('n-') > -1 ) {
                    to = c.substr(2);
                }
            }
            $(this).connections({ to: '.note-' + to });
        });
    }

    function open_export() {
        // open new window
        var xWindow = window.open('export');
        var content = export_content();
        xWindow.document.write(content.replace(/\n\n/g, '<br/>'));
    }

    function export_content() {

        // first remove interface elements
        $(eid_inner + ' .icon').remove();

        var content = '<pre>';
        var newline = '\n'; //'<br/>';

        // iterate over all sections to get content
        $(eid + ' .section').each(function () {
            // get content
            content += toMarkdown($(this).html());
            //get section attributes
            var attr = '';
            var px = 'px';
            attr += 'left:' + $(this).position().left + px;
            attr += ',top:' + $(this).position().top + px;
            attr += ',width:' + $(this).width() + px;
            attr += ',height:' + $(this).height() + px;
            content += newline + newline;
            content += '&lt;!-- {' + attr + '} -->';
            content += newline + newline;
        });
        content += newline + '</pre>';
        return content;
    }

    function default_transform() {
        var t = {
            'scale': 1, 'translateX': '0px', 'translateY': '0px',
            'perspective': '400px', 'rotateX': '0deg', 'rotateY': '0deg', 'scaleZ': '1',
            'rotateZ': '0deg', 'translateZ': '0px'
        };
        update_transform(t);
    }

    // id: section id this will be linked with
    // focus: location in text to place cursor
    function render_editor(id, focus) {
        // remove any existing editors first
        $(eid + ' .editor').remove();

        // use basic transform before positioning
        default_transform();

        var $s = $('.section#' + id);
        var left = $s.position().left;
        var top = $s.position().top;
        var width = $s.width();
        var height = $s.height();

        var content = toMarkdown($s.find('.content').html());
        var heading = toMarkdown($s.find('.handle-heading').html());

        var html = `<div class="editor" data-section="${id}">`;
        html += `<pre class="md heading">${heading}</pre>`;
        html += '<input class="editor-heading" />';
        html += `<pre class="md content">${content}</pre>`;
        html += '<textarea class="editor-content" />';
        html += '</div>';
        
        $s.after(html);
        var $editor = $('.editor');
        var padding = 100;
        $editor.css({
            top: top, left: left + width + padding,
            width: width, height: height + padding
        });
        $(eid + ' .editor-heading').val($('.md.heading').text());
        $(eid + ' .editor-content').val($('.md.content').text());

        // event handler for editor content changes
        $(eid + ' .editor-content').on('keyup change', function () {
            content = $('.editor-content').val();
            // get the attached section's current id
            var id = $(this).closest('.editor').attr('data-section');
            var container = `.section#${id} .content`;
            $gd.render(content, container);
            // register any newly created/edited links
            $s.find('a[href^=#]').click(function (e) {
                register_hash_click(e);
            });
            notize();
            render_connections();
        });

        // event handler for editor heading changes
        $(eid + ' .editor-heading').on('keyup change', function () {
            content = $('.editor-heading').val();
            var new_id = $gd.clean(content);
            
            // get id of the section linked with this editor
            var $editor_section = $(this).parent().prev();
            var prev_id = $editor_section.attr('id');
            if ( $editor_section.hasClass('note') ) {
                $editor_section.removeClass(`note-${prev_id}`);
                $editor_section.addClass(`note-${new_id}`);
            }
            $editor_section.attr('id', new_id);
            var $s = $(eid + ` .section#${new_id}`);
            $s.find('.handle-heading')
                .html(`<a class="handle" name="${new_id}">${content}</a>`);
            
            // update parent editor with the newly linked id
            $(this).closest('.editor').attr('data-section', new_id);

            // update all links to this section
            var $l = $(eid + ` a[href=#${prev_id}]`);
            $l.attr('href', '#' + new_id);
            $l.removeClass(`n-${prev_id}`);
            if ( $l.hasClass('n-reference') ) {
                $l.addClass(`n-${new_id}`);
            }

            //update_toc();
            // update toc link
            var $toc_link = $(eid + ` .info .toc a[href=#${new_id}]`);
            $toc_link.text(content);

            notize();
            render_connections();
        });

        // restore transform
        update_transform(transforms);

        $(eid + ' .editor .md').remove();

    }

    function transform_focus(element) {
        var t = '';

        var e = document.getElementById(element);
        var x = e.offsetLeft;
        var y = e.offsetTop;
        var w = e.offsetWidth;
        var h = e.offsetHeight;

        // make width adjustment if editor is open for this section
        if (is_editor_linked(element)) {
            w += $(eid + ' .editor').width() + 50;
        }

        var maxwidth = window.innerWidth;
        var maxheight = window.innerHeight;

        // center viewport on section
        var translateX = x - (maxwidth / 2) + w / 2;
        var translateY = y - (maxheight / 2) + h / 2;

        transforms['translateX'] = -translateX + 'px';
        transforms['translateY'] = -translateY + 'px';

        update_transform(transforms);
    }

    // returns true if editor is open and has specified id
    function is_editor_linked(id) {
        var $editor = $(eid + ' .editor');
        if ($editor.length > 0) {
            var editor_id = $editor.attr('data-section');
            if (editor_id === id) {
                return true;
            }
        }
        return false;
    }

    function position_editor($s) {
        var left = parseFloat( $s.css('left') );
        var top = parseFloat( $s.css('top') );
        var $editor = $(eid + ' .editor');
        var padding = 100;
        $editor.css('left', left + $s.width() + padding);
        $editor.css('top', top);
        $editor.css('width', $s.width());
        $editor.css('height', $s.height() + padding);
    }

    function update_toc() {
        var s = [];
        $( eid_inner + ' .section a.handle' ).each(function(){
            s.push( $gd.clean($(this).text()) );
        });
        $gd.set_sections(s);
        $gd.update_toc(s);
        $(eid + ' .info .toc a').click(function (e) {
            register_hash_click(e);
        });
    }

    function create_section(x, y, prefix) {
        if ( prefix === '' || prefix === undefined ) prefix = 'Section';
        name = unique_name(prefix);
        var html = default_section_html(name);
        $('.inner').append(html);
        var id = $gd.clean(name);
        $s = $('#' + id);
        $s.css({ "top": y + 'px', "left": x + 'px' });
        $s.css({ "width": '200px', "height": '100px' });
        $s.attr('data-x', x).attr('data-y', y);
        update_toc();

        // make this section active by clicking toc link
        $(eid + ` .toc a[href=#${id}]`).click();
        // make section current if it's clicked
        $s.click(function (e) {
            register_section_events(e);
        });

        render_editor(id);
        create_buttons(id);
        render_connections();
    }

    function register_section_events(e) {
        var $t = $(e.target);
        if ( $t.is('a') ) return;
        var id = $t.closest('.section').attr('id');
        activate_section(id);
    }

    function unique_name(prefix) {
        var x = 1;
        do {
            var n = prefix + ' ' + x;
            // check if id already exists
            if ($('#' + $gd.clean(n)).length === 0) {
                return n;
            }
            x++;
        }
        while (x < 200);
    }

    function default_section_html(name) {
        var id = $gd.clean(name);
        var html = '<div class="section heading no-transition" id="' + id + '">';
        html += '<h2 class="handle-heading">';
        html += '<a class="handle" name="' + id + '">' + name + '</a>'
        html += '</h2>';
        html += '<div class="content">';
        html += '<p>New content</p>';
        html += '</div>'; // .content
        html += '</div>'; // .section
        return html;
    }

    function activate_section(id) {
        var $s = $(eid_inner + ` .section#${id}`);
        // only act if section exists
        if ($s.length < 1) return;
        // remove .current class from active section
        var $current = $(eid + ' .section.current').removeClass('current');
        // remove current toc link
        $(eid + ' .info .toc a.current').removeClass('current');
        $s.addClass('current');
        $(eid + ` .info .toc a[href=#${id}]`).addClass('current');

        create_buttons(id);

        // move editor to clicked section if already opened
        if ( $(eid_inner + ' .editor').length > 0 ) {
            render_editor(id);
        }
    }

    function create_buttons(id) {
        var $s = $(eid_inner + ` .section#${id}`);
        // delete all extant .icon first
        $(eid_inner + ' .section .icon').remove();

        // RESIZE
        // functionality is handled via interactjs .inner event
        $s.append('<div class="icon resize">⤨</div>');

        // ROTATE
        // functionality is handled via interactjs .inner event
        $s.append('<div class="icon rotate">↻</div>');

        // DELETE

        // only create .delete icon if more than one section exists
        if ( $(eid_inner + ' .section').length < 2 ) return;

        $s.append('<div class="icon delete">X</div>');
        var $delete = $s.find('.delete');
        $delete.click(function(e){
            var $s = $(e.target).closest('.section');
            $(eid + ` .info .toc a[href=#${$s.attr('id')}]`).remove();
            $s.remove();
            $(eid_inner + ' .editor').remove();
            // add header class to first section if no header exists
            if ( $(eid_inner + ' .section.header').length < 1 ) {
                var $h = $(eid_inner + ' .section:first-child');
                $h.removeClass('heading').addClass('header');
            }
        });
    }

    function register_events_onstartup() {

        // Key events
        $(document).keyup(function (e) {
            if ( e.which == 83 && e.altKey ) {
                // alt-x for export
                open_export();
            }
        });

        // .section interactions
        interact(eid_inner).ignoreFrom('input, textarea, .section')
        .draggable({
            // enable inertial throwing
            inertia: false,
            // call this function on every dragmove event
            onmove: function (event) {
                $(eid_inner + ' .section .icon').remove();
                var tx = parseFloat(transforms['translateX']) + event.dx;
                var ty = parseFloat(transforms['translateY']) + event.dy;
                transforms['translateX'] = tx + 'px';
                transforms['translateY'] = ty + 'px';
                update_transform(transforms);
                render_connections();
            }
        })
        .on('tap', function (event) {
            //event.preventDefault();
            $('.editor').remove();
        })
        .on('doubletap', function (e) {
            if ($(e.target).hasClass('inner')) {
                // create new section
                e.preventDefault();
                create_section(e.offsetX, e.offsetY);
            }
        })
        .on('hold', function (event) {
            // event.clientX
        });
    }

    function register_hash_click(e) {
        e.preventDefault();
        var id = e.target.getAttribute('href').substr(1);
        activate_section(id);
        transform_focus(id);
        render_connections();
        // update url hash
        window.location.hash = '#' + id;
    }

    function register_events() {

        $(eid + ' .info .field.selector.app a.id').click(function (e) {
            // configure url with hash and other needed params
            var url = $(this).attr('data-id');
            var css = $gd.settings.css;
            url += `?css=${css}${location.hash}`;

            // open window, receiveMessage will then wait for Ready message
            win = window.open(url);
            win.postMessage('Hello?', '*');
        });

        // listen for Ready messages from any opened windows
        window.addEventListener( 'message', function(e) {
            var o = $gd.settings.origin;
            if ( o === '*' || e.origin === o ) {
                if ( e.data === 'Ready.' ) {
                    var content = export_content();
                    $(eid).append('<div id="gd-export"></div>');
                    content = $('#gd-export').html(content).text();
                    $('#gd-export').remove();
                    var json = { "content": content };
                    var message = JSON.stringify(json);
                    e.source.postMessage( message, $gd.settings.origin );
                    console.log('Message sent to child window.');
                }
            }
        }, false);

        // make section current if it's clicked
        $(eid + ' .section').click(function (e) {
            register_section_events(e);
        });

        // mousewheel zoom handler
        $(eid_inner).on('wheel', function (event) {
            event.preventDefault();
            if (this !== event.target) return;

            var scale = parseFloat(transforms['translateZ']);
            if (event.originalEvent.deltaY < 0) {
                scale += 20;
            } else {
                scale -= 20;
            }
            if (scale < -300) scale = -300;
            if (scale > 300) scale = 300;

            // center scale on cursor position
            var x = event.originalEvent.offsetX;
            var y = event.originalEvent.offsetY;
            $('.inner').css('transform-origin', `${x}px ${y}px`);
            
            transforms['translateZ'] = scale + 'px';
            update_transform(transforms);
            render_connections();
        });

        // reference and toc link click handler
        $(eid + ' a[href^=#]').click(function (e) {
            register_hash_click(e);
        });

        /* LOCAL LINK INTERACTION */
        interact(eid + ' a.local')
        .draggable({
            // enable inertial throwing
            inertia: false,
            // keep the element within the area of it's parent
            // enable autoScroll
            autoScroll: false,
            onstart: function(e) {
                $('.container .link-clone').remove();
                // todo
                var c = $(e.target).text();
                var html = `<div class="link-clone no-transition">${c}</div>`;
                $('.container').append(html);
                var $clone = $(eid_inner + ' .link-clone');
                var x = e.pageX;
                var y = e.pageY;
                $clone.css('left', x);
                $clone.css('top', y);
                var id = $(e.target).closest('.section').attr('id');
                $clone.attr('data-section-from', id);
            },
            // call this function on every dragmove event
            onmove: function (e) {
                var $clone = $('.container .link-clone');
                var target = e.target;
                var $target = $(target);

                $clone.css('left', e.pageX);
                $clone.css('top', e.pageY);
            },
            onend: function (e) {
                var $clone = $('.container .link-clone');
                var target = e.target;
                var $target = $(target);
                console.log(e.target);

                $clone.css('left', e.pageX);
                $clone.css('top', e.pageY);

                $clone.remove();
            }
        });
        // .resizable({
        //     preserveAspectRatio: false,
        //     edges: { left: true, right: true, bottom: true, top: true }
        // })
        // .on('resizemove', function (e) {
        //     render_connections();
        // })
        // .on('doubletap', function (e) {
        // });

        /* SECTION INERACTION */
        interact(eid + ' .section')
            .draggable({
                // enable inertial throwing
                inertia: false,
                // keep the element within the area of it's parent
                restrict: {
                    restriction: 'self',
                    endOnly: true,
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                },
                // enable autoScroll
                autoScroll: false,
                // call this function on every dragmove event
                onmove: function (e) {
                    var target = e.target;
                    var $target = $(target);

                    // keep the dragged position in the data-x/data-y attributes
                    var x = (parseFloat(target.getAttribute('data-x')) || 0) + e.dx;
                    var y = (parseFloat(target.getAttribute('data-y')) || 0) + e.dy;

                    $target.css('top', y + 'px');
                    $target.css('left', x + 'px');

                    // adjust editor based on selected section position
                    var id = target.getAttribute('id');
                    if (is_editor_linked(id)) {
                        if ($target.hasClass('section')) {
                            position_editor($target);
                        }
                    }

                    // update the position attributes
                    $target.attr('data-x', x);
                    $target.attr('data-y', y);

                    render_connections();
                }
            })
            .resizable({
                preserveAspectRatio: false,
                edges: { left: false, right: true, bottom: true, top: false }
            })
            .on('resizemove', function (e) {
                var target = e.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0),
                    y = (parseFloat(target.getAttribute('data-y')) || 0);

                // update the element's style
                target.style.width = e.rect.width + 'px';
                target.style.height = e.rect.height + 'px';

                // check if editor is open for this section
                var id = target.getAttribute('id');
                if (is_editor_linked(id)) {
                    position_editor($(target));
                }
                render_connections();
            })
            .on('doubletap', function (e) {
                var id = $(event.target).closest('.section').attr('id');
                render_editor(id);
                transform_focus(id);
                render_connections();
            });
    }

});
