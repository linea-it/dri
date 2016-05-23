Ext.define('Tile.view.eyeballing.Aladin', {
    extend: 'aladin.Aladin',

    xtype: 'eyeballing-aladin',

    requires: [
        'aladin.Aladin'
    ],

    // Iniciar com footprint visivel
    hideFootprint: false,

    // Inicar com tile grid visivel
    tilesGridVisible: true,

    // Inicar com nivel de zoom mais longe da tile.
    initialFov: 4,

    auxTools: [
        {
            xtype: 'button',
            iconCls: 'x-fa fa-exclamation-triangle',
            text: 'Flag',
            tooltip: 'Flag/Unflag',
            enableToggle: true,
            toggleHandler: 'onFlagDataset',
            bind: {
                pressed: '{flagged.flg_flagged}'
            }
        }
    ],

    showFlaggeds: function (flaggeds) {
        console.log('showFlaggeds(%o)', flaggeds);

        var me = this,
            aladin = me.getAladin(),
            libA = me.libA,
            catalog, marker,
            sources = [];

        if (aladin) {

            catalog = libA.catalog({name: 'Flaggeds', sourceSize: 18});

            flaggeds.each(function (record) {

                marker = libA.marker(
                    record.get('tli_ra'),
                    record.get('tli_dec'),
                    {
                        popupTitle: record.get('tli_tilename'),
                        popupDesc: 'TESTE'
                    }
                );

                sources.push(marker);

            },this);

            // console.log(sources);
            catalog.addSources(sources);
            aladin.addCatalog(catalog);
        }

    },

    createDefectPanel: function () {
        console.log('createDefectPanel()');
        // var me = this,
        //     w;

        // w = Ext.create('Ext.panel.Panel', {
        //     width: 200,
        //     height: 200,
        //     x: 100,
        //     y: 100,
        //     renderTo: me.body,
        //     header: false,
        //     resizable: false,
        //     constrain: true,
        //     style: {
        //         position: 'absolute',
        //         zIndex: 999
        //     },
        //     layout: 'fit',
        //     html: 'text',
        //     items: [
        //         {
        //             xtype: 'gridpanel',
        //             title: 'Teste',
        //             columns: [
        //                 {text: 'Feature', dataIndex: 'feature'}
        //             ]
        //         }
        //     ]
        // });

        // w.show();
    }

});
