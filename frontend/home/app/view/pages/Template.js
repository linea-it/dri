Ext.define('Home.view.pages.Template', {
    extend: 'Ext.Component',
    xtype: 'pages-template',

    scrollable : {
        direction: 'vertical'
    },

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
        '<div style="height: 190px;">',
        '<figure class="app-image alignleft" style="width: 150px height: 150px">',
            '<a target="_self" alt="{pageTitle}" href="{host}{appURL}">',
                '<img width="150" height="134" src="{imageUrl}" alt="Go To {pageTitle}">',

            '</a>',
        '</figure>',
        '<br>',
        '<p class="app-paragrafo1">{paragrafo1}</p>',
        '</div>',
        '<br>',
        // '<a target="_self" alt="{pageTitle}" href="{host}{appURL}">Go To {pageTitle}</a>',
        '<p></p>',
        '<p class="app-paragrafo2">{paragrafo2}</p>'
    ],

    afterRender: function () {
        this.callParent(arguments);

        // console.log('afterrender');
        // Fix Scroll

        var me = this;
        // me.setHeight(this.bodyElement.dom.scrollHeight);
        // me.setHeight(me.getEl().dom.scrollHeight);

    }

});
