Ext.define('Home.view.pages.Template', {
    // extend: 'Ext.Component',
    extend: 'Ext.panel.Panel',
    xtype: 'pages-template',

    layout: 'fit',

    scrollable : true,

    data: {
        host: '',
        pageTitle: '',
        appURL: '',
        imageUrl: '',
        paragrafo1: '',
        paragrafo2: '',
        video: ''
    },

    // height: 2000,

    tpl: [
        '<div style="height:100vh;  width: 1000px; overflow: hidden;">',
        '<div style="height:100vh; width: 1200px;  overflow: scroll;">',
        '<div class="page-title">',
        '<h1>{pageTitle}</h1>',
        '</div>',
        '<div style="height: 350px;">',
            '<iframe width="500" height="350" src="{video}"></iframe>',
        '</div>',
        // '<figure class="app-image alignleft" style="width: 100px height: 100px">',
        //     '<a target="_self" alt="{pageTitle}" href="{appURL}">',
        //         '<img width="50" height="50" src="{imageUrl}" alt="Go To {pageTitle}">',
        //     '</a>',
        // '</figure>',
        // '<a target="_self" alt="{pageTitle}" href="{appURL}"><h2>{pageTitle}</h2></a>',
        '<p class="app-paragrafo1">{paragrafo1} <a target="_self" alt="{pageTitle}" href="{appURL}">click here</a></p>',
        '<p></p>',
        // '<div style="height: 190px;">',
        // '<figure class="app-image alignleft" style="width: 150px height: 150px">',
        //     '<a target="_self" alt="{pageTitle}" href="{appURL}">',
        //         '<img width="150" height="134" src="{imageUrl}" alt="Go To {pageTitle}">',

        //     '</a>',
        // '</figure>',
        // '<br>',
        '<br>',
        '<p></p>',
        '<p class="app-paragrafo2">{paragrafo2}</p>',
        '</div>',
        '</div>'
    ],

    afterRender: function () {
        this.callParent(arguments);

        // console.log('afterrender');
        // Fix Scroll

        var me = this;

        // me.doLayout();
        // me.setHeight(this.bodyElement.dom.scrollHeight);
        // me.setHeight(me.getEl().dom.scrollHeight);

    }

});
