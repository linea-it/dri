Ext.define('Explorer.view.system.Aladin', {
    extend: 'aladin.Aladin',

    xtype: 'system-aladin',

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

    plotObject: function (object, productname) {
        var me = this,
            aladin = me.getAladin(),
            libA = me.libA,
            catalog;

        catalog = libA.catalog({
            name: productname,
            sourceSize: 12,
            color:'#A0F65A'
        });

        catalog.addSources([
            libA.marker(
                object._meta_ra,
                object._meta_dec,
                {
                    popupTitle: 'ID: ' + object._meta_id,
                    popupDesc: 'RA: ' + object._meta_ra + '</br>' +
                               'Dec: ' + object._meta_dec
                }
            )
        ]);

        aladin.addCatalog(catalog);

    },

    plotSystemMembers: function (productname, members) {
        var me = this,
            aladin = me.getAladin(),
            libA = me.libA,
            sources = [],
            catalog;

        catalog = libA.catalog({
            name: productname,
            sourceSize: 12,
            color:'#A0F65A'
        });

        members.each(function (object) {

            var circle = libA.marker(
                object.get('_meta_ra'),
                object.get('_meta_dec'),
                {
                    popupTitle: 'ID: ' + object.get('_meta_id'),
                    popupDesc: 'J2000: ' + object.get('_meta_ra') + ', ' + object.get('_meta_dec')
                }
            );

            sources.push(circle);

        }, me);

        catalog.addSources(sources);

        aladin.addCatalog(catalog);

    },

    drawRadius: function (ra, dec, radius, unit, options) {
        var me = this,
            aladin = me.getAladin(),
            libA = me.libA,
            overlay;

        overlay = libA.graphicOverlay({
            color: '#ee2345',
            lineWidth: 3
        });
        aladin.addOverlay(overlay);

        // Conversao de unidades
        if (unit === 'arcmin') {
            // Se estiver em minutos de arco dividir por 60
            radius = radius / 60;
        }

        overlay.add(libA.circle(ra, dec, radius));

    }

});
