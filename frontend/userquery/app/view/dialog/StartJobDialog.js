Ext.define('UserQuery.view.dialog.StartJobDialog', {
    alternateClassName: 'StartJobDialog',

    requires: [
        'UserQuery.view.dialog.BaseDialog',
        'UserQuery.view.dialog.StartJobDialogController'
    ],

    extend: 'UserQuery.view.dialog.BaseDialog',
    controller: 'startjobdialog',

    title: 'Start Job',
    buttonConfirmText: 'Start',

    height: 170,
    width: 400,

    items: [
        {
            xtype: 'form',
            reference: 'frmForm',
            items:[
                // {
                //     xtype: 'textfield',
                //     fieldLabel: 'Display Name* ',
                //     name: 'display_name',
                //     width: '100%'
                // },
                {
                    xtype: 'textfield',
                    fieldLabel: 'Output Table* ',
                    name: 'display_name',
                    reference: 'txtName',
                    width: '100%'
                },
                // {
                //     xtype: 'checkbox',
                //     fieldLabel: 'Register DRI',
                //     name: 'associate_target_viewer'
                // },
                // {
                //     xtype: 'textfield',
                //     fieldLabel: 'Timeout',
                //     name: 'timeout',
                //     value: 0
                // }
            ]
        }
    ],

    listeners: {
        open: 'dialog_onOpen',
        confirm: 'dialog_onConfirm',
        close: 'dialog_onClose'
    }
});