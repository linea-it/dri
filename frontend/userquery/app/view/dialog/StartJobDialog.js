
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

    height: 200,

    items:[
        {xtype: 'textfield', fieldLabel: 'Table Name',  name:'name', reference:'txtName', width:'100%'},
    ],

    listeners: {
        open   : 'dialog_onOpen',
        cancel : 'dialog_onCancel',
        close  : 'dialog_onClose'
    }
});
