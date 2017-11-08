
Ext.define('UserQuery.view.dialog.NewDialog', {
    alternateClassName: 'NewDialog',

    requires: [
        'UserQuery.view.dialog.BaseDialog',
        'UserQuery.view.dialog.NewDialogController'
    ],

    extend: 'UserQuery.view.dialog.BaseDialog',
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
        close  : 'dialog_onClose'
    }
});
