
Ext.define('UserQuery.view.dialog.OpenDialog', {
    alternateClassName: 'OpenDialog',

    requires: [
        'UserQuery.view.dialog.BaseDialog',
        'UserQuery.view.dialog.OpenDialogController'
    ],

    extend: 'UserQuery.view.dialog.BaseDialog',
    controller: 'opendialog',

    title: 'Open Query',
    buttonConfirmText: 'Open',

    items:[
        {xtype:'treepanel', reference:'treepanel', flex:1, rootVisible:false}
    ],

    listeners: {
        open   : 'dialog_onOpen',
        cancel : 'dialog_onCancel',
        close  : 'dialog_onClose'
    }
});
