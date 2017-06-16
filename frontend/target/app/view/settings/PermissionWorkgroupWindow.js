Ext.define('Target.view.settings.PermissionWorkgroupWindow', {
    extend: 'Ext.window.Window',

    title: 'Add a Workgroup',
    reference: 'winPermissionWorkgroup',
    width: 300,
    height: 150,
    layout: 'fit',
    modal: true,

    closeAction: 'hide',

    items: [
        {
            xtype: 'form',
            reference: 'permissionWorkgroupForm',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            border: false,
            bodyPadding: 10,
            fieldDefaults: {
                msgTarget: 'side',
                labelAlign: 'top',
                labelWidth: 100,
                labelStyle: 'font-weight:bold'
            },
            items: [
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'combobox',
                            name: 'user',
                            fieldLabel: 'Workgroup',
                            valueField: 'id',
                            reference: 'cmbPermissionWorkgroup',
                            displayField: 'wgp_workgroup',
                            allowBlank: false,
                            editable: false,
                            flex: 1,
                            hideLabel: true,
                            forceSelection: true,
                            bind: {
                                store: '{workgroups}'
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-plus',
                            ui: 'soft-green',
                            tooltip: 'Create Workgroup',
                            handler: 'onCreateWorkgroup'
                        }
                    ]
                }
            ]
        }
    ],
    buttons: [
        '->',
        {
            text: 'Cancel',
            handler: 'onCancelPermissionWorkgroup'
        }, {
            text: 'Add',
            ui: 'soft-green',
            handler: 'onAddPermissionWorkgroup',
            bind: {
                disabled: '{!cmbPermissionWorkgroup.selection}'
            }
        }
    ]

});
