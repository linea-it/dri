Ext.define('Home.view.pages.Sky', {
    extend: 'Home.view.pages.Template',
    xtype: 'pages-sky',

    data: {
        host: '',
        pageTitle: 'Sky Viewer',
        appURL: 'sky',
        imageUrl: 'resources/sky.png',
        paragrafo1: 'Sky Viewer implementation is based on HiPS (Hierarchical Progressive Survey) image format and the Aladin Lite client. The main functionalities are:',
        paragrafo2: 'Escrever o HTML com a formtação'
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
