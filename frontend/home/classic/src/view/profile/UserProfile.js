Ext.define('Admin.view.profile.UserProfile', {
    extend: 'Ext.container.Container',
    xtype: 'userprofile',

    requires: [
        'Ext.ux.layout.ResponsiveColumn',
        'Admin.view.profile.TargetWidget',
        'Admin.view.profile.ValidationWidget'
    ],

    controller: 'userprofile',
    viewModel: {
        type: 'userprofile'
    },
    cls: 'userProfile-container',

    layout: 'responsivecolumn',

    items: [
        {
            xtype: 'profilesocialpanel',

            // Use 50% of container when viewport is big enough, 100% otherwise
            responsiveCls: 'big-50 small-100'
        },
        {
            xtype: 'targetwidget',
            responsiveCls: 'big-50 small-100'
        },
        {
            xtype: 'validationwidget',
            responsiveCls: 'big-50 small-100'
        }
    ]
});
