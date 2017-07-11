Ext.define('Target.view.preview.DescutDownloadWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.preview.FitsModel',
    ],

    xtype: 'target-download-descut',

    viewModel: 'fits_files',
    viewController: 'fits_files',

    title: 'Download',
    width: 600,
    height: 400,
    modal: true,
    autoShow: true,

    closeAction: 'destroy',

    bodyPadding: 20,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function () {
        var me = this;
            // store = me.args.result;
console.log(this);
        Ext.apply(this, {
            layout: 'fit',
            items: [
                {
                    xtype: 'gridpanel',
                    scrollable: true,
                    // store: store,
                    bind: {
                        store: '{fits_files}',
                    },
                    columns: [
                        {
                            text: 'Tile Name',
                            dataIndex: 'tilename',
                            // renderer: function (value, metadata, record) {
                            //     return record.data.field1.get('tilename');
                            // },
                            flex: 1
                        },
                        {
                            text: 'Band',
                            // renderer: function (value, metadata, record) {
                            //     return record.data.field1.get('band');
                            // },
                        },
                        {
                            text: 'FITS',
                            // renderer: function (value, metadata, record) {
                            //     return '<a href=' + record.data.field1.get('url') + '>Download</a>';
                            // },
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    scope: me,
                    handler: 'onCancel'
                }
            ]
        });
        me.callParent(arguments);
    },

    onCancel: function () {
        this.close();
    }
});
