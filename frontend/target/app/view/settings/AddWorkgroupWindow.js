Ext.define('Target.view.settings.AddWorkgroupWindow', {
    extend: 'Ext.window.Window',

    title: 'Create a Workgroup',
    reference: 'winAddWorkgroup',
    width: 400,
    height: 450,
    modal: true,

    closeAction: 'destroy',

    items: [
        {
            xtype: 'form',
            reference: 'createWorkgroupForm',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            border: false,
            bodyPadding: 10,
            flex: 1,
            fieldDefaults: {
                msgTarget: 'side',
                labelAlign: 'top',
                labelStyle: 'font-weight:bold'
            },
            items: [
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Name',
                            labelAlign: 'left',
                            name: 'wgp_workgroup',
                            allowBlank: false,
                            maxLength: 60,
                            reference: 'txtWorkgroupName',
                            labelWidth: 70,
                            flex: 1
                        },
                        {
                            xtype: 'button',
                            text: 'Create',
                            ui: 'soft-green',
                            handler: 'onInsertWorkgroup',
                            reference: 'btnCreateWorkgroup'
                        }
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'combobox',
                            name: 'user',
                            fieldLabel: 'Add Users',
                            labelAlign: 'left',
                            labelWidth: 70,
                            valueField: 'id',
                            reference: 'cmbAddWorkgroupUser',
                            displayField: 'username',
                            editable: false,
                            bind: {
                                store: '{users2}'
                            },
                            disabled: true,
                            flex: 1
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-plus',
                            ui: 'soft-green',
                            handler: 'onAddUserInWorkgroup',
                            bind: {
                                disabled: '{!cmbAddWorkgroupUser.selection}'
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-minus',
                            ui: 'soft-red',
                            handler: 'onRemoveUserInWorkgroup',
                            bind: {
                                disabled: '{!WorkgroupUsersGrid.selection}'
                            }
                        }
                    ]
                },
                {
                    xtype: 'grid',
                    reference: 'WorkgroupUsersGrid',
                    columns: [
                        {
                            text: 'Users',
                            dataIndex: 'username',
                            flex: 1
                        }
                    ],
                    bind: {
                        store: '{workgroupUsers}'
                    },
                    flex: 1
                }
            ]
        }
    ],
    buttons: [
        '->',
        {
            text: 'Cancel',
            handler: 'onCancelCreateWorkgroup'
        }
        //  {
        //     text: 'Add',
        //     ui: 'soft-green',
        //     handler: 'onInsertWorkgroup'
        // }
    ]

});
