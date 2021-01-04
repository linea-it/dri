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

        console.log('me')

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
                        // {
                        //     text: 'Filename',
                        //     dataIndex: 'filename',
                        //     flex: 1
                        // },
                        // {
                        //     text: 'Filter',
                        //     dataIndex: 'filter'
                        // },
                        {
                            text: 'URL',
                            dataIndex: 'url',
                            renderer: function (value, metadata, record) {
                                return '<a href=' + value + ' target=\'_blank\'><i class="fa fa-download"> </i></a>';
                            }
                        }
                    ]
                }
            ],
            buttons: [
                // {
                //     xtype: 'label',
                //     text: 'Right click "Save link as" to download files',
                //     flex: 1
                // },
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

    loadFits: function (response) {
        var me = this;
        this.loadFits = response.tli_tilename;

        var otherFiles = {
            detection: 'Detection Image',
            main: 'Main Catalog',
            magnitude: 'Magnitude Catalog',
            flux: 'Flux Catalog',
          };

        var result = []

        if(response.images) {
            Ext.each(Object.keys(response.images), function(key) {

                if (response.images[key] && response.images[key] !== '') {
                    result.push({
                        filename: key.toUpperCase() + '-Band Image',
                        url: response.images[key]
                    })
                }
            })
        }

        if(response.catalogs) {
            Ext.each(Object.keys(response.catalogs), function(key) {

                if (response.catalogs[key] && response.catalogs[key] !== '') {
                    result.push({
                        filename: key.toUpperCase() + '-Band Catalog',
                        url: response.catalogs[key]
                    })
                }
            })
        }
        console.log('response', response)
        Ext.each(Object.keys(otherFiles), function(key) {
            if(response[key]) {
                result.push({
                    filename: otherFiles[key],
                    url: response[key],
                })
            }
        })

        console.log('result', result)

        me.fireEvent('changeLoadFits', result);
    }
});
