Ext.define('UserQuery.view.dialog.SaveAsDialog', {
    alternateClassName: 'SaveAsDialog',

    requires: [
        'UserQuery.view.dialog.BaseDialog',
        'UserQuery.view.dialog.SaveAsDialogController'
    ],

    extend: 'UserQuery.view.dialog.BaseDialog',
    controller: 'saveasdialog',

    title: 'Save As',
    buttonConfirmText: 'Save',

    height: 180,
    width: 400,

    items: [
        {
            xtype: 'form',
            reference: 'frmForm',
            items:[
                {
                    xtype: 'textfield',
                    fieldLabel: 'Name* ',
                    name: 'name',
                    width: '100%'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: 'Description* ',
                    name: 'description',
                    width: '100%'
                }
            ]
        }
    ],

    listeners: {
        open: 'dialog_onOpen',
        confirm: 'dialog_onConfirm',
        close: 'dialog_onClose'
    }
});