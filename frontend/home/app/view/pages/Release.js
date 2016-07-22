Ext.define('Home.view.pages.Release', {
    extend: 'Home.view.pages.Template',
    xtype: 'pages-release',

    data: {
        host: 'http://desportal.cosmology.illinois.edu/dri/apps/',
        pageTitle: 'Release Validation',
        appURL: 'eyeballing',
        imageUrl: 'resources/release.png',
        paragrafo1: 'The first implementation of the Release Validation was based on Aladin Lite, we plan to replace the display component by VisiOmatic.',
        paragrafo2: 'It includes the following functionalities: <ul class="app-paragrafo2"> <li>Flag images with artifacts</li>  <li>Add comments associated to a position (annotations)</li> <li>Ability to mark defects associated to position like Airplane trails, Bright horizontal stripes, Bright star, Cosmic Ray, Ghosts, Incomplete tile, Noisybackground, Satellite trails, Scattered light</li>  <li>Overlay of objects and object properties</li>  <li>View statistic of defects</li>  <li>Overlay of CCDs and mangle mask</li>  </ul> '
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
