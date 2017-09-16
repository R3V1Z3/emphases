# Emphases
A simple word study and highlighting tool initially designed to aid in exposition of biblical texts. It renders Markdown-formatted content hosted for free through [GitHub Gist](https://gist.github.com/) in a sleek, interactive interface that's printable and shareable.
<!-- {left:-10px,top:-10px,width:567px,height:197px} -->

## How it works
Simply create a document for free at GitHub Gist, get the document's ID, and enter it in the Gist box in the Info panel. Emphases will render the file, turning headers and respective content into sections that are easy to read.
<!-- {left:597px,top:-8px,width:526px,height:193px} -->

## Formatting
Content follows basic Markdown rules along with a few simple rules to aid with interaction. [Headers](#headers-as-sections) within the document rendered as sections with subsequent content following under that header. [Local links](#local-links) within the document that point to headers in the same document will be rendered with lines connecting them to those headers.
<!-- {left:-10px,top:173px,width:537px,height:198px} -->

## Headers as sections
Sections are created using headers in Markdown like so:  
```## God```

Content following the header will be included as content within the newly created section. Sections can then be linked to using local links as described below. When a section has content linking to it, it will be rendered as a note and styled differently to set it apart from other content.
<!-- {left:609px,top:195px,width:510px,height:220px} -->

## Local links
To create connections, just use Markdown to create links like so:  
```[God](#god)```

As long as a section labeled 'God' exists, the above portion of content will automatically link to it and a connection will be shown between the two.

### Local link formatting
These local links must follow a few rules, mainly that the characters used are either lowercase alphanumeric or dashes. Spaces, commas, periods and other characters can be replaced with dashes in the links.

For example, to link to this section:  
```## Jesus the Messiah```

Simply use something like this:  
```[Jesus the Messiah](#jesus-the-messiah)```

<!-- {left:3px,top:338px,width:548px,height:392px} -->

## Customization
Once rendered, sections can be dragged to position them for better viewing/printing. Pressing <kbd>x</kbd> will provide an updated version of the document that includes position information that can be copied and pasted over the original file to save those details. With the position details included in the file, the url can easily be shared with positions intact.
<!-- {left:614px,top:434px,width:508px,height:256px} -->

## Example Gists
These examples, when they exist in this README file, will be pulled and shown in a Gist drop-down in the Info panel. <!-- This should <script src"http://google'.com"></script>be converted to html comment -->
- [Grace and Faith](?gist=576a1c645d3dbdfb69e8ae6bde8a1e46) - Exposition of Ephesians 2:8.
- [Desire and Authority](?gist=6e0ba6b41a06a146e9704ce8c39d0fd4) - The concept of desire for authority considered.
- [The Sons of God](?gist=f1ff10976bd1e43445b19af9fd5bd311) - Exposition of Sons of God in Genesis 6.
- [Jews and Judah](?gist=a6c78ff888e9a3ff955de93b1aa2d48e) - the word 'Jew' in reference to the name 'Judah'.
<!-- {left:0px,top:749px,width:1132px,height:217px} -->

## `$gd_info`
Word study and highlight tool    
`$gd_help_ribbon`
`$gd_gist`
`$gd_css`
`$gd_toc = "Table of Contents"`
`$gd_hide`
