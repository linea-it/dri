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
        filter: null
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
                            xtype: 'combobox',
                            itemId: 'cmbCutoutJob',
                            name: "cutouts",
                            fieldLabel: "Mosaic",
                            emptyText: 'Choose Mosaic',
                            displayField: 'cjb_display_name',
                            valueField: 'id',
                            store: {
                                type: 'cutoutjobs'
                            },
                            editable: false,
                            disabled: true
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
                                    disabled: true,
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

    setCurrentCatalog: function (currentCatalog) {
        var me = this,
            cmbCutouts = me.down("#cmbCutoutJob"),
            store = cmbCutouts.getStore();

        if ((currentCatalog) && (currentCatalog.get('id') > 0)) {

            me.currentCatalog = currentCatalog;

            store.addFilter([
                {
                    property: 'cjb_product',
                    value: currentCatalog.get('id')
                },
                {
                    property: 'cjb_status',
                    value: 'ok'
                }
            ]);

            store.load({
                callback: function() {
                    cmbCutouts.enable();
                }
            })
        }
    },

    onDownload: function () {
        var me = this,
            currentCatalog = me.getCurrentCatalog(),
            filter_id = me.getFilter(),
            form = me.down('form').getForm(),
            values,
            table_format = [],
            cutouts = null,
            report_format = [],
            filter = null;

        if (form.isValid()) {

            values = form.getValues();

            if (values.table_format) {
                table_format = values.table_format;

                if (Array.isArray(table_format)) {
                    table_format = table_format.join()
                }

            }

            if (values.cutouts) {
                cutouts = values.cutouts;
            }

            if (values.report_format) {
                report_format = values.report_format;
            }

            if (filter_id > 0) {
                filter = filter_id;
            }

            Ext.Ajax.request({
                url: '/dri/api/productexport/',
                scope: this,
                params: {
                    'product': currentCatalog.get('id'),
                    'filetypes': table_format,
                    'cutout': cutouts,
                    'filter': filter
//                    'report_format': report_format
                },
                success: function (response) {
                    me.onCancel();
                    Ext.MessageBox.alert('', 'The job will run in the background and you will be notified when it is finished.');
                },
                failure: function (response, opts) {
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
