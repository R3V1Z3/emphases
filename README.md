# WordStudy
Simple word study tool for the Bible that pulls content from GitHub Gists and renders it in a sleek interface that simplifies printing.

## Content formatting
Content follows basic Markdown rules along with a few simple rules to aid with interaction.

### Headers as sections
Sections are created using headers in Markdown like so:  
```## God```

Content following the header will be included as content within the newly created section. Sections can then be linked to using local links as described below. When a section has content linking to it, it will be rendered as a note and styled differently to set it apart from other content.

### Local links for connected content
To create connections, just use Markdown to create links like so:  
```[God](#god)```

As long as a section labeled 'God' exists, the above portion of content will automatically link to it and a connection will be shown between the two.