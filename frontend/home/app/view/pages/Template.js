Ext.define('Home.view.pages.Template', {
    extend: 'Ext.panel.Panel',
    xtype: 'pages-template',

    data: {
        host: '',
        pageTitle: '',
        appURL: '',
        imageUrl: '',
        paragrafo1: '',
        paragrafo2: ''
    },

    tpl: [
        '<div class="page-title">',
        '<h1>{pageTitle}</h1>',
        '</div>',
        '<p></p>',
        '<figure class="app-image alignleft" style="width: 150px height: 150px">',
            '<a target="_self" alt="{pageTitle}" href="{host}{appURL}">',
                '<img width="150" height="150" src="{imageUrl}" alt="Go To {pageTitle}">',
            '</a>',
        '</figure>',
        '<br>',
        '<p class="app-paragrafo1">{paragrafo1}</p>',
        '<a target="_self" alt="{pageTitle}" href="{host}{appURL}">Go To {pageTitle}</a>',
        '<p></p>',
        '<p class="app-paragrafo2">{paragrafo2}</p>',
    ]

});
