/* global jQuery, $, interact */
jQuery(document).ready(function() {
    
    var toggle_html='<span class="toggle"></span>';

    // attach the plugin to an element
    $('#wrapper').gitdown( {    'title': 'Emphases',
                                'content': 'README.md',
                                'callback': main
    } );
    var $gd = $('#wrapper').data('gitdown');

    function main() {
        
        $('.info .app-title').html('<span class="em">Em</span>phases');
        
        position_sections();
        make_draggable();
        notize();
        register_events();
        render_connections();
        render_connections();
    }
    
    function position_sections() {
        var docwidth = $(document).width();
        var $sections = $('.section *');
        if ( $sections.length > 0 ) {
            // find attributes and position section
            $sections.children().each(function() {
                var comments = $(this).getComments();
                if ( comments.length > 0 ) {
                    // comment found, extract attributes
                    var text = comments[0];
                    var s = text.substr(text.indexOf("{") + 1).split('}')[0];
                    var pairs = s.split(',');
                    for ( var i = 0; i < pairs.length; i++ ) {
                        var key = pairs[i].split(':')[0];
                        var value = pairs[i].split(':')[1];
                        $(this).closest('.section').css( key, value );
                    }
                }
            });
        }
        
        // iterate over sections and position elements if they're at 0,0
        var counter = 0;
        var left = 0;
        var top = 0;
        $('.section').each(function() {
            var position = $(this).position();
            if ( position.top === 0 && position.left === 0 ) {
                // set default values for section positions
                if ( counter > 0 ) {
                    var prev_width = $(this).prev('.section').width();
                    // increment height if width of document is surpassed
                    if ( left > docwidth - prev_width * 2 ) {
                        left = 0;
                        top += $(this).prev('.section').height();
                    } else {
                        left += prev_width;
                    }
                    $(this).css( {top: top, left: left} );
                }
                counter += 1;
            }
        });
    }
    
    function notize() {
        $('.section').each(function() {
            
            var $s = $(this);
            
            // quickly add a draggable class for drag method
            $s.addClass('draggable');
            
            // set initial position values
            var x = $s.css('left').slice( 0, -2 );
            var y = $s.css('top').slice( 0, -2 );
            $s.attr('data-x', x);
            $s.attr('data-y', y);
            
            var name = $(this).find('a.handle').attr('name');
            // check if any anchor links reference this setion and add respective classes if so
            $(".content a[href*=#]").each(function() {
                var $link = $(this);
                var href = $link.attr('href').substr(1);
                if ( href === name ) {
                    // this is a note, so set boolean for later
                    var classes = ' note note-' + href;
                    $s.addClass(classes);
                    // add note class to anchor link too
                    $link.addClass( 'n-' + href );
                    $link.closest('.section').addClass('reference');
                }
            });
        });
        
        var counter = 1;
        // set colors for note links based on note sections
        $('.note').each(function() {
            $(this).addClass('notenum-' + counter);
            var bg = $(this).css('background-color');
            // get the note's id
            var id = $(this).attr('id');
            $( '.c-' + id ).css('border-color', bg);
            $( '.n-' + id ).css('background-color', bg);
            counter++;
        });
    }
    
    function render_connections() {
        if ( $('connection').length === 0 ) {
            $( '.section .content [class^="n"]' ).each(function() {
                var classes = $(this).attr('class');
                var to = classes.substr(classes.indexOf("n-") + 2).split(' ')[0];
                // get note's number from parent
                classes = $('.note-' + to).attr("class");
                var notenum = classes.substr(classes.indexOf("notenum-") + 8).split(' ')[0];
                // draw connection from $(this) to [to] and add class c- to connection border for color
                $(this).connections({ to: '.note-' + to , 'class': 'c-' + notenum});
            });
        } else {
            // update connections
            $('.section .content [class^="n"]').connections('update');
        }
    }
    
    function make_draggable() {
        // target elements with the "draggable" class
        interact('.draggable')//.allowFrom('.handle-heading')
            .draggable({
                // enable inertial throwing
                inertia: false,
                // keep the element within the area of it's parent
                restrict: {
                  restriction: "parent",
                  endOnly: true,
                  elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            },
            // enable autoScroll
            autoScroll: true,
            
            // call this function on every dragmove event
            onmove: dragMoveListener,
            // call this function on every dragend event
            onend: function (event) {
            }
        })
        .resizable({
            preserveAspectRatio: false,
            edges: { left: true, right: true, bottom: true, top: true }
            })
            .on('resizemove', function (event) {
            var target = event.target,
                x = (parseFloat(target.getAttribute('data-x')) || 0),
                y = (parseFloat(target.getAttribute('data-y')) || 0);
            
            // update the element's style
            target.style.width  = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';
            
            // translate when resizing from top or left edges
            x += event.deltaRect.left;
            y += event.deltaRect.top;
            
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
            render_connections();
        });
        
        function dragMoveListener (event) {
            var target = event.target,
            // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            $(target).css('top', y + 'px');
            $(target).css('left', x + 'px');
            // // translate the element
            // target.style.webkitTransform =
            // target.style.transform =
            //   'translate(' + x + 'px, ' + y + 'px)';
            
            // update the position attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
            render_connections();
        }
    }
    
    function open_export() {
        
        // open new window
        var xWindow = window.open('export');
        var content = '';
        var newline = '\n\n'; //'<br/>';
        
        // clone wrapper for interaction with export content
        var $export = $('#wrapper').clone();
        $export.attr('id', 'export');
        $('body').prepend($export);
        
        $('#export a.handle').each(function(){
            var text = $(this).text();
            $(this).text( '## ' + text + newline );
        });
        
        $('#export .content a[href*=#]').each(function(){
            var text = $(this).text();
            var link = $(this).attr('href');
            $(this).text( '[' + text + '](' + link + ')' );
        });
        
        $('#export li').each(function(){
            var text = $(this).text();
            $(this).text( '- ' + text + newline );
        });
        
        // iterate over all sections to get content
        $('#export .section').each(function() {

            content += $(this).text();
            
            // get section attributes
            var attr = '';
            var px = 'px';
            attr += 'left:' + $(this).position().left + px;
            attr += ',top:' + $(this).position().top + px;
            attr += ',width:' + $(this).width() + px;
            attr += ',height:' + $(this).height() + px;
            
            content += newline;
            content += '&lt;!-- {' + attr + '} -->';
            content += newline + newline;
        });
        xWindow.document.write( content.replace(/\n\n/g, '<br/>') );
        $export.remove();
    }
    
    function register_events() {
        // Key events
        $(document).keyup(function(e) {
            if( e.which == 88 ) {
                // x for export
                open_export();
            }
        });
    }
    

});