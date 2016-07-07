Ext.define('Home.view.pages.Sky', {
    extend: 'Home.view.pages.Template',
    xtype: 'pages-sky',

    data: {
        host: 'http://desportal.cosmology.illinois.edu/dri/apps/',
        pageTitle: 'Sky Viewer',
        appURL: 'sky',
        imageUrl: 'resources/star.png',
        paragrafo1: 'Sky Viewer implementation is based on  HiPS (Hierarchical Progressive Survey)  image format and the Aladin Lite client. The main functionalities are:  ',
        paragrafo2: '<h2>Footprint</h2><ul class="app-paragrafo2">  <li>All-sky visualization in spherical projection</li>    <li>grizY and RGB HiPS images for DES releases</li>    <li>HiPS images from other suverys like 2MASS, WISE, DSS, SDSS9 as well as extinction and Halpha maps for comparions</li>    <li>Visualization of HEALPIX maps</li>    <li>Hierarchical overlay of objects</li>    <li>Overlay of polygons like DES footprint, tile grid CCDs and healpix grid</li>    <li>Search by RA, Dec or tilename</li>    <li>Direct link to specific RA, Dec position specified in the URL</li>    <li>Export the current view to PNG</li>    <li>Access to Tile Viewer</li></ul> <h2>Mosaic</h2><ul class="app-paragrafo2">    <li>Mosaic of thumbnails (400 x 400 pixels) for each tile in grizY and RGB for rapid evaluation of features in the co-add images</li>    <li>Ability to flag a tile</li>    <li>Link to the Tile Viewer</li></ul><h2>Tile List</h2><ul class="app-paragrafo2">    <li>Information for each tile like Tilename, RA, Dec, l, b, and Dataset in a searchable and sortable table</li>    <li>Link to the Tile Viewer</li></ul> '
    },

//    tpl: [
//        '<div class="page-title">',
//        '<h1>{pageTitle}</h1>',
//        '</div>',
//        '<p></p>',
//        '<figure class="app-image alignleft" style="width: 150px height: 150px">',
//            '<a target="_self" alt="{pageTitle}" href="{host}{appURL}">',
//                '<img width="150" height="150" src="{imageUrl}" alt="Go To {pageTitle}">',
//            '</a>',
//        '</figure>',
//        '<br>',
//        '<p class="app-paragrafo1">{paragrafo1}</p>',
//        '<a target="_self" alt="{pageTitle}" href="{host}{appURL}">Go To {pageTitle}</a>',
//        '<p></p>',
//        '<p class="app-paragrafo2">{paragrafo2}</p>',
//    ]
    
});
