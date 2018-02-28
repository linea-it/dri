
Ext.define('CatalogBuilder.view.dialog.NewDialog', {
    alternateClassName: 'NewDialog',

    requires: [
        'CatalogBuilder.view.dialog.BaseDialog',
        'CatalogBuilder.view.dialog.NewDialogController'
    ],

    extend: 'CatalogBuilder.view.dialog.BaseDialog',
    controller: 'newdialog',

    title: 'New Query',
    buttonConfirmText: 'Ok',

    items:[
        {xtype:'label', text:'Select Release'},
        {xtype:'treepanel', reference:'treelist', flex:1, rootVisible:false, useArrows:true, allowChildren:false, displayField:'rls_display_name',
            listeners: {
                selectionchange: 'treelist_onSelectionChange'
            }
        }
    ],

    listeners: {
        open   : 'dialog_onOpen',
        cancel : 'dialog_onCancel',
        close  : 'dialog_onClose'
    }
});
