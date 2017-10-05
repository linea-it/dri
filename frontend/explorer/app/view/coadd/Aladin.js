Ext.define('Explorer.view.coadd.Aladin', {
    extend: 'aladin.Aladin',

    xtype: 'coadd-aladin',

    requires: [
        'aladin.Aladin'
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            hideFootprint: false,
            enableGoto: false,
            enableShift: false,
            infoEnabled: false,
            enableLayersControl: true,
            toolbarPosition: 'top',
            showFilters: false

        });

        me.callParent(arguments);
    },

    plotObject: function (object) {
        // console.log('plotObject(%o)', object)
        var me = this,
            aladin = me.getAladin(),
            libA = me.libA,
            catalog;

        catalog = libA.catalog({
            name: 'Coadd Object',
            sourceSize: 12,
            color:'#A0F65A'
        });

        catalog.addSources([
            libA.marker(
                object.RA,
                object.DEC,
                {
                    popupTitle: 'ID: ' + object.COADD_OBJECT_ID,
                    popupDesc: 'RA: ' + object.RA + '</br>' +
                               'Dec: ' + object.DEC
                }
            )
        ]);

        aladin.addCatalog(catalog);

    }

});
