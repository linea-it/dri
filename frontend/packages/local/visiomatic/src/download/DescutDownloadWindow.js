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
    width: 300,
    height: 350,
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
                    hideHeaders: true,
                    bind: {
                        store: '{fitsFiles}'
                    },
                    listeners: {
                        select: 'onSelect'
                    },
                    emptyText: 'Oops! No download was found for this tile.',
                    columns: [
                        {
                            text: 'URL',
                            dataIndex: 'url',
                            width: 23,
                            renderer: function (value, meta) {
                                meta.tdCls += 'x-cursor-pointer';
                                return '<i class="fa fa-download"></i>';
                            }
                        },
                        {
                            text: 'Filename',
                            dataIndex: 'filename',
                            flex: 1,
                            renderer: function (value, meta) {
                                meta.tdCls += 'x-cursor-pointer';
                                return value;
                            }
                        },
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Close',
                    scope: me,
                    handler: 'onClose'
                }
            ]
        });
        me.callParent(arguments);
    },

    onClose: function () {
        this.close();
    },

    loadFits: function (id) {
        var me = this,
        vm = me.getViewModel(),
        store = vm.getStore('fitsFiles');

        vm.set('datsetId', id);

        me.setLoading(true);

        store.addFilter([{
            property: 'id',
            value: id
        }]);

        store.load({
            scope: me,
            callback: function () {
                me.setLoading(false);
            }
        })
    }
});
