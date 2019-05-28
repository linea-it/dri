Ext.define('Eyeballing.view.eyeballing.Aladin', {
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

    showFlaggeds: function (flaggeds) {
        var me = this,
            aladin = me.getAladin(),
            libA = me.libA,
            catalog, marker,
            sources = [];

        if (aladin) {

            catalog = libA.catalog({name: 'Flaggeds', sourceSize: 18, color: '#FF0000'});

            flaggeds.each(function (record) {

                marker = libA.marker(
                    record.get('tli_ra'),
                    record.get('tli_dec'),
                    {
                        popupTitle: record.get('tli_tilename'),
                        popupDesc: ''
                    }
                );

                sources.push(marker);

            },this);

            // console.log(sources);
            catalog.addSources(sources);
            aladin.addCatalog(catalog);
        }
    },

    showDefects: function (defects) {
        var me = this,
            aladin = me.getAladin(),
            libA = me.libA,
            catalog, marker,
            sources = [];

        if (aladin) {

            catalog = libA.catalog({name: 'Defects', sourceSize: 18, color: '#FFAF0A'});

            defects.each(function (record) {

                marker = libA.marker(
                    record.get('dfc_ra'),
                    record.get('dfc_dec'),
                    {
                        popupTitle: record.get('ftr_name'),
                        popupDesc: ''
                    }
                );

                sources.push(marker);

            },this);

            // console.log(sources);
            catalog.addSources(sources);
            aladin.addCatalog(catalog);
        }
    }

});
