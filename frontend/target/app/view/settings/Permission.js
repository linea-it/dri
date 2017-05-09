Ext.define('Target.view.settings.Permission', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.settings.PermissionController',
        'Target.view.settings.PermissionModel',
        'Target.view.settings.PermissionUserWindow',
        'Target.view.settings.PermissionWorkgroupWindow',
        'Target.view.settings.AddWorkgroupWindow',
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
                        'You can choose which users or workgroups can access this list.' +
                        '</br>' + 'The list can be public or private in this case only the users selected or who are part of a group can access it.' +
                        '</br>' + 'You can create workgroups.'
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
                            name: 'is_public',
                            reference: 'chkIsPlublic',
                            listeners: {
                                change: 'onChangeIsPublic'
                            }
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
                                    reference: 'permissionWorkgroupsGrid',
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
                                    }],
                                    tools: [
                                        {
                                            type: 'plus',
                                            handler: 'onAddWorkgroup',
                                            tooltip: 'Add Workgroup'
                                        },
                                        {
                                            type: 'minus',
                                            handler: 'onRemoveWorkgroup',
                                            tooltip: 'Remove Workgroup',
                                            bind: {
                                                hidden: '{!permissionWorkgroupsGrid.selection}'
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    scope: me,
                    handler: function () {
                        this.fireEvent('finish', this);
                    }
                },
                {
                    text: 'Ok',
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
        var me = this;

        me.currentCatalog = catalog;

        me.fireEvent('changecatalog', catalog, me);

    }
});
