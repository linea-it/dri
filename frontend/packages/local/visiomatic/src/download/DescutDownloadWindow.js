Ext.define('visiomatic.download.DescutDownloadWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'visiomatic.download.FitsController',
        'visiomatic.download.FitsModel'
    ],

    xtype: 'target-download-descut',

    viewModel: 'fits-files',
    controller: 'fits-files',

    title: 'Download',
    width: 600,
    height: 400,
    modal: true,
    autoShow: true,

    closeAction: 'destroy',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function () {

        var me = this;

        Ext.apply(this, {
            layout: 'fit',
            items: [
                {
                    xtype: 'gridpanel',
                    scrollable: true,
                    bind: {
                        store: '{fitsFiles}'
                    },
                    columns: [
                        {
                            text: 'Filename',
                            dataIndex: 'filename',
                            flex: 1
                        },
                        // {
                        //     text: 'Band',
                        //     dataIndex: 'band'
                        // },
                        {
                            text: 'URL',
                            dataIndex: 'file_source',
                            renderer: function (value, metadata, record) {
                                return '<a href=' + value + '><i class="fa fa-download"> </i></a>';
                            }
                        }
                    ]
                }
            ],
            buttons: [
                {
                    xtype: 'label',
                    text: 'Right click "Save link as" to download files',
                    flex: 1
                },
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
    },

    loadFits: function (tilename, tag) {
        var me = this;
        this.loadFits = tilename;
        me.fireEvent('changeLoadFits', tilename, tag);
    }
});
