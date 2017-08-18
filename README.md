# WordStudy
WordStudy is a simple word study tool for the Bible that renders Markdown-formatted content hosted for free through GitHub Gist in a sleek, interactive interface that's printable and shareable.

## The Purpose
Many free, online Bible tools now include highlight features that let you add notes to portions of text. There aren't really any that are optimized for print or easy to share. This tool utilizes [GitHub Gist](https://gist.github.com/) as a free service for creating text documents that are easily rendered in a print-ready format that's easily shared via url.

## How it works
Simply create a document for free at GitHub Gist, get the document's ID, and add it to the url like so:
https://ugotsta.github.io/words/?gist=6e0ba6b41a06a146e9704ce8c39d0fd4

WordStudy will render the file, turning headers and respective content into sections that are easy to read.

### Customization
Once rendered, sections can be dragged to position them for better viewing/printing. Pressing <kbd>x</kbd> will provide an updated version of the document that includes position information that can be copied and pasted over the original file to save those details. With the position details included in the file, the url can easily be shared with positions intact.

## Content formatting
Content follows basic Markdown rules along with a few simple rules to aid with interaction.

#### Headers as sections
Sections are created using headers in Markdown like so:  
```## God```

Content following the header will be included as content within the newly created section. Sections can then be linked to using local links as described below. When a section has content linking to it, it will be rendered as a note and styled differently to set it apart from other content.

#### Local links for connected content
To create connections, just use Markdown to create links like so:  
```[God](#god)```

As long as a section labeled 'God' exists, the above portion of content will automatically link to it and a connection will be shown between the two.
