Ext.define('Admin.view.dashboard.Dashboard', {
    extend: 'Ext.container.Container',

    requires: [
        'Ext.ux.layout.ResponsiveColumn',
        'widget.uxiframe'
        //'Ext.ux.IFrame'

    ],

    id: 'dashboard',

    controller: 'dashboard',
    viewModel: {
        type: 'dashboard'
    },

    layout: 'hbox',
    
    listeners: {
        hide: 'onHideView'
    },

    // listeners: {
    //     afterrender: function (comp) {
    //         Ext.Ajax.request({
    //             url: "/dri-frontend/home/resources/sky.html",
    //             success: function(response) {
    //                 var obj = (response.responseText);        
    //                 console.log(obj)

    //             }
    //         });
    //     }
    // },
    

    items: [
        {
            xtype:'uxiframe',
            margin: '0 10 10 60',
            width: '100%',
            height: '100%',
            src: '/dri/apps/home/resources/sky.html',
            // src: '/dri-frontend/home/resources/sky.html',
            headerPosition: 'bottom'        
        },



        // {
        //     xtype: 'panel',
        //     layout: 'hbox',
        //     items: [
        //     // {
        //     //     xtype: 'dashboardnetworkpanel',
        //     //     margin : '10 10 10 10'
        //     // },
        //     {
        //         xtype: 'dashboardtodospanel',
        //         margin : '10 10 10 10'
        //     }]
        // },
        // {
        //     xtype: 'dashboardnetworkpanel',
        //     margin : '10 10 10 10'
        //     // 60% width when viewport is big enough,
        //     // 100% when viewport is small
        //     // responsiveCls: 'big-60 small-100'
        // },
        // {
        //     xtype: 'dashboardhddusagepanel',
        //     responsiveCls: 'big-20 small-50'
        // },
        // {
        //     xtype: 'dashboardearningspanel',
        //     responsiveCls: 'big-20 small-50'
        // },
        // {
        //     xtype: 'dashboardsalespanel',
        //     responsiveCls: 'big-20 small-50'
        // },
        // {
        //     xtype: 'dashboardtopmoviepanel',
        //     responsiveCls: 'big-20 small-50'
        // },
        // {
        //     xtype: 'dashboardweatherpanel',
        //     responsiveCls: 'big-40 small-100'
        // },
        // {
        //     xtype: 'dashboardtodospanel',
        //     responsiveCls: 'big-60 small-100'
        // },
        // {
        //     xtype: 'dashboardservicespanel',
        //     margin : '10 10 10 10'
        //     // responsiveCls: 'big-40 small-100'
        // }
    ]
});
