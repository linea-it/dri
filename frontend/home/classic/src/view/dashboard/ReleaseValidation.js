Ext.define('Admin.view.dashboard.ReleaseValidation', {
    extend: 'Ext.container.Container',

    requires: [
        'Ext.ux.layout.ResponsiveColumn',
        'widget.uxiframe'
    ],

    id: 'releasevalidation',

    layout: 'hbox',

    controller: 'dashboard',
    viewModel: {
        type: 'dashboard'
    },

    listeners: {
        hide: 'onHideView'
    },

    items: [
        {
            xtype:'uxiframe',
            margin: '0 10 10 60',
            width: '100%',
            height: '100%',
            src: '/dri/apps/home/resources/validation.html',
            headerPosition: 'bottom'
        }
    ]
});
