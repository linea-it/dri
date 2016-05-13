Ext.define('common.store.Tiles', {
    //extend: 'common.store.AllTiles',
    extend: 'common.store.MyStore',

    alias: 'store.tiles',

    pageSize: 100,

    remoteFilter: true,

    remoteSort: true,

    proxy: {
        type: 'django',
        url: '/dri/api/tiles/'
    },

    filterByRaDec: function (ra, dec) {

        var ra = parseFloat(ra),
            dec = parseFloat(dec),
            result;

        this.each(function (t) {

            // tli_urall < ra
            // AND tli_udecll < dec
            // AND tli_uraur > ra
            // AND tli_udecur > dec
            if (
                t.get('tli_urall') < ra &&
                t.get('tli_udecll') < dec &&
                t.get('tli_uraur') > ra &&
                t.get('tli_udecur') > dec) {

                result = t;
                return false;
            }
        }, this);

        return result;
    }
});
