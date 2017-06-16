Ext.define('Target.view.settings.PermissionUserWindow', {
    extend: 'Ext.window.Window',

    title: 'Add a User',
    reference: 'winPermissionUser',
    width: 300,
    height: 150,
    layout: 'fit',
    modal: true,

    closeAction: 'hide',

    items: [
        {
            xtype: 'form',
            reference: 'permissionUserForm',
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
                    xtype: 'combobox',
                    name: 'user',
                    fieldLabel: 'User',
                    valueField: 'id',
                    reference: 'cmbPermissionUser',
                    displayField: 'username',
                    allowBlank: false,
                    editable: false,
                    bind: {
                        store: '{users}'
                    }
                }
            ]
        }
    ],
    buttons: [
        '->',
        {
            text: 'Cancel',
            handler: 'onCancelPermissionUser'
        }, {
            text: 'Add',
            ui: 'soft-green',
            handler: 'onAddPermissionUser',
            bind: {
                disabled: '{!cmbPermissionUser.selection}'
            }
        }
    ]

});
