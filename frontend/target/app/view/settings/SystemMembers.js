Ext.define('Target.view.settings.SystemMembers', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.settings.SystemMembersController',
        'Target.view.settings.SystemMembersModel'
    ],

    xtype: 'targets-system-members',

    controller: 'system_members',

    viewModel: 'system_members',

    config: {
        currentCatalog: null
    },

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'panel',
                    // region: 'north',
                    height: 80,
                    bodyPadding: 10,
                    html: [
                        'TEXTO Explicativo'
                        // '</br>' + 'The list can be public or private in this case only the users selected or who are part of a group can access it.' +
                        // '</br>' + 'You can create workgroups.'
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Finish',
                    ui: 'soft-green',
                    scope: me,
                    handler: function () {
                        this.fireEvent('finish', this);
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    setCurrentCatalog: function (catalog) {
        var me = this,
            vm = me.getViewModel();

        me.currentCatalog = catalog;

        vm.set('currentCatalog', catalog);

        me.fireEvent('changecatalog', catalog, me);

    }
});
