Ext.define('Target.view.preview.DescutDownloadWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.preview.PreviewModel'
    ],

    xtype: 'target-download-descut',

    viewModel: 'preview',

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
        var me = this,
            store = me.args.result;

        Ext.apply(this, {
            layout: 'fit',
            items: [
                {
                    xtype: 'gridpanel',
                    scrollable: true,
                    store: store,
                    columns: [
                        {
                            text: 'Tile Name',
                            sortable: true,
                            renderer: function (value, metadata, record) {
                                return record.data.field1.get('TILENAME');
                            },
                            flex: 1
                        },
                        {
                            text: 'FITS',
                            dataIndex: 'image_src_fits',
                            renderer: function (value, metadata, record) {
                                return '<a href=' + record.data.field1.get('image_src_fits') + '>Download</a>';
                            },
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
