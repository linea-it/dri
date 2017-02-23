Ext.define('Target.view.cutout.AddJobWindow', {
    extend: 'Ext.window.Window',

    title: 'Create Cutout',
    reference: 'winAddJob',
    width: 640,
    height: 480,
    layout: 'fit',
    modal: true,

    closeAction: 'hide',

    items: [
        {
            xtype: 'tabpanel',
            ui: 'navigation',
            tabPosition: 'left',
            tabRotation: 0,
            items: [
                {
                    xtype: 'form',
                    title: 'Coadds Images'
                },
                {
                    xtype: 'form',
                    title: 'Single Epoch'
                }
            ]
        }

        // {
        //     xtype: 'form',
        //     reference: 'AddJobForm',
        //     layout: {
        //         type: 'vbox',
        //         align: 'stretch'
        //     },
        //     border: false,
        //     bodyPadding: 10,
        //     fieldDefaults: {
        //         msgTarget: 'side',
        //         labelAlign: 'top',
        //         labelWidth: 100,
        //         labelStyle: 'font-weight:bold'
        //     },
        //     items: [
        //         // {
        //         //     xtype: 'combobox',
        //         //     name: 'user',
        //         //     fieldLabel: 'User',
        //         //     valueField: 'id',
        //         //     reference: 'cmbPermissionUser',
        //         //     displayField: 'username',
        //         //     allowBlank: false,
        //         //     editable: false,
        //         //     bind: {
        //         //         store: '{users}'
        //         //     }
        //         // }
        //     ]
        // }
    ],
    buttons: [
        '->',
        {
            text: 'Cancel',
            handler: 'onCancelAddJob'
        }, {
            text: 'Submit',
            ui: 'soft-green',
            handler: 'onSubmitAddJob'
            // bind: {
            //     disabled: '{!cmbPermissionUser.selection}'
            // }
        }
    ]

});
