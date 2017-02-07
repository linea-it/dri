Ext.define('Target.view.settings.Permission', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.settings.PermissionController',
        'Target.view.settings.PermissionModel',
        'Target.view.settings.PermissionUserWindow',
        'Ext.grid.feature.Grouping'
    ],

    xtype: 'targets-permission',

    controller: 'permission',

    viewModel: 'permission',

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
                        'EXPLICAÇÃO SOBRE PERMISÃO'
                    ]
                },
                {
                    xtype: 'panel',
                    flex: 1,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'checkbox',
                            boxLabel: 'Public',
                            name: 'is_public'
                            // bind: {
                            //     checked: true
                            // }
                        },
                        {
                            xtype: 'panel',
                            flex: 1,
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            items: [
                                {
                                    xtype: 'grid',
                                    title: 'Users',
                                    reference: 'permissionUsersGrid',
                                    flex: 1,
                                    split: true,
                                    frame: true,
                                    bind: {
                                        store: '{permissionUsers}'
                                    },
                                    columns: [
                                        {
                                            text: 'Username',
                                            dataIndex: 'username',
                                            flex: 1
                                        }
                                    ],
                                    tools: [
                                        {
                                            type: 'plus',
                                            handler: 'onAddUser',
                                            tooltip: 'Add User'
                                        },
                                        {
                                            type: 'minus',
                                            handler: 'onRemoveUser',
                                            tooltip: 'Remove User',
                                            bind: {
                                                hidden: '{!permissionUsersGrid.selection}'
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'grid',
                                    title: 'Workgroups',
                                    flex: 1,
                                    split: true,
                                    frame: true,
                                    bind: {
                                        store: '{permissionWorkgroups}'
                                    },
                                    columns: [
                                        {
                                            text: 'Workgroup',
                                            dataIndex: 'workgroup',
                                            flex: 1
                                        },
                                        {
                                            text: 'Username',
                                            dataIndex: 'username',
                                            flex: 1
                                        }
                                    ],
                                    features: [{
                                        ftype: 'grouping',
                                        startCollapsed: true,
                                        groupHeaderTpl: '{name} ({rows.length} User{[values.rows.length > 1 ? "s" : ""]})'
                                    }]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    },

    setCurrentCatalog: function (catalog) {
        var me = this;

        me.currentCatalog = catalog;
        me.fireEvent('changecatalog', catalog, me);

    }

});
