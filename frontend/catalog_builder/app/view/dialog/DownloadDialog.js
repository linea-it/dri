
Ext.define('CatalogBuilder.view.dialog.DownloadDialog', {
    alternateClassName: 'DownloadDialog',

    requires: [
        'CatalogBuilder.view.dialog.BaseDialog',
        'CatalogBuilder.view.dialog.DownloadDialogController'
    ],

    extend: 'CatalogBuilder.view.dialog.BaseDialog',
    controller: 'downloaddialog',

    title: 'Select Fields',
    buttonConfirmText: 'Download',

    height: 300,
    width: 400,

    items:[
        // {
        //     xtype:'container',
        //     width: '100%',
        //     layout: {
        //         type: 'hbox',
        //         padding:'5',
        //         pack:'end',
        //         align:'middle'
        //     },
        //     items:[
        //         {
        //             xtype:'label',
        //             text:'Select All'
        //         },
        //         {
        //             xtype: 'checkboxfield',
        //             reference : 'chkSelectAll',
        //             margin: '0 27 0 8'
        //         }
        //     ]
        // },
        {
            xtype: 'grid',
            width: '100%',
            height: 200,
            reference: 'grdFields',
            store: Ext.create('Ext.data.Store'),
            hideHeaders: true,
            columns: [
                {
                    dataIndex: 'column_name',
                    flex: 1
                },
                {
                    xtype: 'checkcolumn',   
                    dataIndex: 'selected',
                    width: 80
                }
            ]
        }
    ],

    listeners: {
        open   : 'dialog_onOpen',
        cancel : 'dialog_onCancel',
        close  : 'dialog_onClose',
        confirm: 'dialog_onConfirm'
    }
});
