/* global $, jQuery, dragula, location */
var TOC = [];
var gist;
jQuery(document).ready(function() {
    
    // get url parameters
    // from http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }
    
    var fontsize = getURLParameter('fontsize');
    if (!fontsize) fontsize = 110;
    $('body').css('font-size', fontsize + '%');
    
    var gist = getURLParameter('gist');
    var filename = getURLParameter('filename');
    if (!gist) gist = 'f1ff10976bd1e43445b19af9fd5bd311';
    $.ajax({
        url: 'https://api.github.com/gists/' + gist,
        type: 'GET',
        dataType: 'jsonp'
    }).success(function(gistdata) {
        var objects = [];
        if (!filename) {
            for (var file in gistdata.data.files) {
                if (gistdata.data.files.hasOwnProperty(file)) {
                    var o = gistdata.data.files[file].content;
                    if (o) {
                        objects.push(o);
                    }
                }
            }
        }
        else {
            objects.push(gistdata.data.files[filename].content);
        }
        render(objects[0]);
        render_sections();
        position_sections();
        render_connections();
        render_info();
        if (gist === 'f1ff10976bd1e43445b19af9fd5bd311') $('#header h1').attr('id', 'alexa-cheats');
    }).error(function(e) {
        console.log('Error on ajax return.');
    });
    
    var showonly = getURLParameter('showonly');
    if (!showonly) showonly = '';

    function render(content) {
        var md = window.markdownit();
        $('#wrapper').html( md.render(content) );
    }
    
    function render_sections() {
        
        // header section
        var header = 'h1';
        var heading = 'h2';
        if ( $('#wrapper ' + header).length ) {
            $('#wrapper ' + header).each(function() {
                $(this).nextUntil(heading).andSelf().wrapAll('<section id="header"/>');
                $(this).wrapInner('<a name="header"/>');
            });
        } else {
            //no header, so we'll add an empty one
            $('#wrapper').prepend('<section id="header"></section>');
        }
        
        // command sections
        $('#wrapper ' + heading).each(function() {
            var name = $(this).text().toLowerCase().replace(/\s/g, "-");
            name = name.replace(',', '');
            
            var splice = name.split('[');
            name = name.split('[')[0];
            
            // $(this).append(toggle_html);
            $(this).nextUntil(heading).andSelf().wrapAll( '<div class="section" id="' + name + '"/>' );
            if ( splice.length > 1 ) {
                var num = splice[1].split(']')[0];
                var text = $(this).text();
                $(this).text( text.split('[')[0] );
                $(this).parent().addClass( 'note note-' + Number( num ) );
                $(this).wrapInner( '<a class="handle" name="' + name + '"/>' );
                $(this).nextUntil(heading).wrapAll('<div class="content"/>');
            } else {
                $(this).nextUntil(heading).prepend( '<a class="handle" name="' + name + '">' + $(this).text() + '</a>' );
                $(this).nextUntil(heading).wrapAll('<div class="content"/>');
                $(this).remove();
            }
        });
        
        // wrap all command sections in new section
        $('#header').siblings().wrapAll('<section id="commands"/>');
        
        // update [1] footnote links
        $('.section em').each(function() {
            var text = $(this).text();
            var splice = text.split('[');
            var num = splice[1].split(']')[0];
            $(this).text( splice[0] );
            $(this).addClass( 'n-' + Number( num ) );
        });
        
        // hide all other sections if showonly has been specified
        if(showonly != '') {
            $('#' + showonly).siblings().hide();
        }
        
        // make sections draggable
        $( '.section' ).draggable({
            drag: function() {
                render_connections();
            },
            stop: function() {
                render_connections();
            }
        });

  
    }
    
    function position_sections() {
        var counter = 0;
        var y = 0;
        $( '.section' ).each(function() {
            if ( counter != 0 ) {
                var prev_height = $(this).prev('.section').height();
                y += prev_height;
                $(this).css( {top: y, left: 10} );
            }
            counter += 1;
        });
    }
    
    function render_connections() {
        if ( $('connection').length === 0 ) {
            $( '.section .content [class^="n"]' ).each(function() {
                    var classes = $(this).attr('class');
                    var to = classes.substr(classes.indexOf("n-") + 2).split(' ')[0];
                    $(this).connections({ to: '.note-' + to , 'class': 'c-' + to});
            });
        } else {
            // update connections
            $('.section .content [class^="n"]').connections('update');
        }
    }
    
    function render_info() {
        
        // render TOC
        $('#toc').html( toc_html() );
        
        // command count
        var command_count = $('li').length;
        $('#command-count').html('Total commands: ' + command_count);
        
        // hide info
        $('#hide').click(function() {
            $('#info').toggle();
        });
        
        var url = 'https://gist.github.com/' + gist;
        $('#gist-url').html('<a href="' + url + '">' + gist + '</a>');
        
        // Add keypress to toggle info on '?' or 'h'
        $(document).keypress(function(e) {
            if(e.which == 104 || e.which == 63 || e.which == 72 || e.which == 47) {
                $('#info').toggle();
            }
        });
    }
    
    function toc_html() {
        var html = '';
        // iterate section classes and get id name to compose TOC
        $( '#commands .section' ).each(function() {
            var name = $( this ).attr( 'id' );
            name = name.split('[')[0];
            html += '<a href="#' + name + '">';
            html += name;
            html += '</a>';
        });
        return html;
    }

});
