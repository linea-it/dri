Ext.define('Target.view.objects.DownloadWindow', {
    extend: 'Ext.window.Window',

    xtype: 'target-download',

    title: 'Download',
    width: 300,
    height: 400,
    modal: true,
    autoShow: true,

    closeAction: 'destroy',

    bodyPadding: 20,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    config: {
        currentCatalog: null,
        filterSet: null
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'form',
                    reference: 'DownloadForm',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    border: false,
                    fieldDefaults: {
                        msgTarget: 'side',
                        labelAlign: 'top',
                        labelWidth: 100
                    },
                    items: [
                        {
                            xtype: 'fieldset',
                            title: 'Table',
                            defaults: {
                                anchor: '100%'
                            },
                            items: [
                                {
                                    xtype: 'checkboxgroup',
                                    columns: 1,
                                    items: [
                                        {boxLabel: 'CSV', name: 'table_format', inputValue: 'csv', checked: true},
                                        {boxLabel: 'FITS', name: 'table_format', inputValue: 'fits'},
                                        //{boxLabel: 'JSON', name: 'table_format', inputValue: 'json'}
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: 'checkbox',
                            boxLabel: 'Cutouts',
                            name: 'cutouts',
                            margin: '10 0 0 0',
                            inputValue: true
                        },
                        {
                            xtype: 'fieldset',
                            title: 'Report',
                            defaults: {
                                anchor: '100%'
                            },
                            items: [
                                {
                                    xtype: 'checkboxgroup',
                                    columns: 1,
                                    items: [
                                        // {boxLabel: 'HTML', name: 'report_format', inputValue: 'html'},
                                        {boxLabel: 'PDF', name: 'report_format', inputValue: 'pdf'}
                                    ]
                                }
                            ],
                            margin: '10 0 0 0'
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    scope: me,
                    handler: 'onCancel'
                },
                {
                    text: 'Download',
                    scope: me,
                    iconCls: 'x-fa fa-download',
                    ui: 'soft-green',
                    handler: 'onDownload'
                }
            ]
        });
        me.callParent(arguments);
    },

    setCurrentCatalog: function (currentCatalog, filterSet) {
        var me = this;

        if ((currentCatalog) && (currentCatalog.get('id') > 0)) {

            me.currentCatalog = currentCatalog;
            me.setFilterSet(filterSet);
        }
    },

    setFilterSet: function (filterSet) {
        var me = this;

        this.filterSet = filterSet;
    },

    onDownload: function () {
        var me = this,
            currentCatalog = me.getCurrentCatalog(),
            form = me.down('form').getForm(),
            values,
            table_format = [],
            cutouts = false,
            report_format = [],
            filterSet = me.getFilterSet(),
            filter = null;

        if (form.isValid()) {

            values = form.getValues();

            if (values.table_format) {
                table_format = values.table_format;
            }

            if (values.cutouts) {
                cutouts = values.cutouts;
            }

            if (values.report_format) {
                report_format = values.report_format;
            }

            if ((filterSet !== null) && (filterSet.get('id') > 0)) {
                filter = filterSet.get('id');
            }

            Ext.Ajax.request({
                url: '/dri/api/product/download/',
                scope: this,
                params: {
                    'product': currentCatalog.get('id'),
                    'type': table_format,
                    'cutouts': cutouts,
                    'report_format': report_format,
                    'filter': filter
                },
                success: function (response) {
                    // Recuperar a resposta e fazer o decode no json.
                    var obj = Ext.decode(response.responseText);

                    me.onCancel();
                },
                failure: function (response, opts) {
                    // TODO: Mostrar mensagem de falha
                    var msg = response.status + ' ' + response.statusText;
                    Ext.Msg.show({
                        title: 'Sorry',
                        msg: msg,
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK
                    });
                }
            });
        }

    },

    onCancel: function () {
        this.close();

    }
});
