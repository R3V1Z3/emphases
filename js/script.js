/* global $, jQuery, dragula, location, HtmlWhitelistedSanitizer */
var TOC = [];
var gist;
var document_content;
jQuery(document).ready(function() {
    
    // get url parameters
    // from http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }
    
    var fontsize = getURLParameter('fontsize');
    if (!fontsize) fontsize = 110;
    $('body').css('font-size', fontsize + '%');
    
    var showonly = getURLParameter('showonly');
    if (!showonly) showonly = '';
    
    var header = getURLParameter('header');
    if (!header) header = 'h1';
    var heading = getURLParameter('heading');
    if (!heading) heading = 'h2';
    
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
        document_content = objects[0];
        render(document_content);
        render_sections();
        position_sections();
        render_connections();
        render_info();
        register_keys();
        if (gist === 'f1ff10976bd1e43445b19af9fd5bd311') $('#header h1').attr('id', 'cheats');
    }).error(function(e) {
        console.log('Error on ajax return.');
    });
    
    // allow for custom CSS via Gist
    var css = getURLParameter('css');
    var cssfilename = getURLParameter('cssfilename');
    if (css) {
        $.ajax({
            url: 'https://api.github.com/gists/' + css,
            type: 'GET',
            dataType: 'jsonp'
        }).success(function(gistdata) {
            var objects = [];
            if (!cssfilename) {
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
            render_css(objects[0]);
        }).error(function(e) {
            console.log('Error on ajax return.');
        });
    }
    
    function render_css(css) {
        // attempt to sanitize CSS so hacker don't splode our website
        var parser = new HtmlWhitelistedSanitizer(true);
        var sanitizedHtml = parser.sanitizeString(css);
        $('head').append('<style>' + sanitizedHtml + '</style>');
    }

    function render(content) {
        var md = window.markdownit();
        $('#wrapper').html( md.render(content) );
    }
    
    function register_keys() {
        // Add listeners for keypress commands
        $(document).keypress(function(e) {
            if( e.which == 104 || e.which == 63 || e.which == 72 || e.which == 47 ) {
                $('#info').toggle();
            } else if( e.which == 88 || e.which == 120) {
                open_export();
            }
        });
    }
    
    function render_sections() {
        
        // remove any empty p elements
        $( 'p:empty' ).remove();
        
        // header section
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
            // remove any existing commas
            name = name.replace(',', '');
            // remove footnote reference from name
            var splice = name.split('[');
            name = name.split('[')[0];
            
            // add name as id for respective section
            $(this).nextUntil(heading).andSelf().wrapAll( '<div class="section" id="' + name + '"/>' );
            
            // handler for footnote sections
            if ( splice.length > 1 ) {
                var num = splice[1].split(']')[0];
                var text = $(this).text();
                $(this).text( text.split('[')[0] );
                $(this).parent().addClass( 'note note-' + Number( num ) );
                $(this).wrapInner( '<a class="handle" name="' + name + '"/>' );
                $(this).nextUntil(heading).wrapAll('<div class="content"/>');
            } else {
                // handler for other sections
                var handle = '<a class="handle" name="' + name + '">' + $(this).text() + '</a>';
                var $p = $(this).nextUntil(heading).wrapAll('<div class="content"/>');
                $p.first('p').prepend(handle);
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
        
        $( '.section' ).draggable({
            drag: function() { render_connections(); },
            stop: function() { render_connections(); }
        });

        $( '.section' ).resizable({
            resize: function() { render_connections(); },
            stop: function() { render_connections(); }
        });
    }
    
    function position_sections() {
        var docwidth = $(document).width();
        var $sections = $('.section *:contains("<!--")');
        if ( $sections.length > 0 ) {
            $sections.each(function() {
                // extract attributes
                var text = $sections.text();
                var s = text.substr(text.indexOf("<!-- {") + 6).split('}')[0];
                var pairs = s.split(',');
                for ( var i = 0; i < pairs.length; i++ ) {
                    var key = pairs[i].split(':')[0];
                    var value = pairs[i].split(':')[1];
                    $(this).parent().css( key, value );
                }
                var html = $(this).html();
                $(this).html( html.replace( /&lt;!--(.*?)--&gt;/, '') );
            });
        } else {
            var counter = 0;
            var left = 0;
            var top = 0;
            $sections = $('.section');
            $sections.each(function() {
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
            });
        }
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
        $('#command-count').html('<kbd>X</kbd> - open export window.');
        
        // hide info
        $('#hide').click(function() {
            $('#info').toggle();
        });
        
        var url = 'https://gist.github.com/' + gist;
        $('#gist-url').html('<a href="' + url + '">' + gist + '</a>');
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
    
    function open_export() {
        // open new window
        var xWindow = window.open(gist);
        var content = '';
        var newline = '\n\n'//'<br/>';
        
        // replace em content, we'll revert it back after
        $('.section .content em').each(function() {
            var id = $(this).attr('class');
            id = id.split('-')[1];
            var text = $(this).text();
            $(this).replaceWith( '_' + text + '[' + id + ']_' );
        });
        
        // iterate over all sections to get content
        $('.section').each(function() {
            // get section attributes

            if ( $(this).hasClass('note') ) {
                var classes = $(this).attr('class');
                var id = classes.substr( classes.indexOf("note-") + 5 ).split(' ')[0];
                content += '## ' + $(this).find('a.handle').text() + '[' + id + ']';
                content += newline;
                var li = $(this).find('ul li').text();
                content += '- ' + li + newline;
                content += $(this).find('p').text();
            } else {
                var h = $(this).find('a.handle').text();
                content += '## ' + h;
                content += newline;
                var $p = $(this).find('p');
                var replace = $p.text().replace( h, '');
                content += replace;
            }
            
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
        
        // revert document
        $('#wrapper').html('');
        render(content);
        render_sections();
        position_sections();
        render_connections();
        render_info();
    }

});
