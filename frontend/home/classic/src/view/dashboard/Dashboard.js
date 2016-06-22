Ext.define('Admin.view.dashboard.Dashboard', {
    extend: 'Ext.container.Container',

    requires: [
        'Ext.ux.layout.ResponsiveColumn',
        'widget.uxiframe'
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

    items: [
        {
            xtype:'uxiframe',
            margin: '0 10 10 60',
            width: '100%',
            height: '100%',
            src: '/dri/apps/home/resources/sky.html',
            // src: '/dri-frontend/home/resources/sky.html',
            headerPosition: 'bottom'
        }
    ]
});
