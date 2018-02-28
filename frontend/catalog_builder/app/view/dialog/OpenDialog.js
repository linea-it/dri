
Ext.define('CatalogBuilder.view.dialog.OpenDialog', {
    alternateClassName: 'OpenDialog',

    requires: [
        'CatalogBuilder.view.dialog.BaseDialog',
        'CatalogBuilder.view.dialog.OpenDialogController'
    ],

    extend: 'CatalogBuilder.view.dialog.BaseDialog',
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
