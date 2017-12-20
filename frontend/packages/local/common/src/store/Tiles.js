Ext.define('common.store.Tiles', {
    //extend: 'common.store.AllTiles',
    extend: 'common.store.MyStore',

    alias: 'store.tiles',

    pageSize: 100,

    remoteFilter: true,

    remoteSort: true,

    proxy: {
        type: 'django',
        timeout: 90000,
        url: '/dri/api/tiles/'
    },

    filterByRaDec: function (ra, dec) {
        /**
         * e necessario converter os cantos da tile em ra para -180 e 180
         * para que as tiles que ficam perto do 0 nao deem erro.
         *
         */
        var ra = parseFloat(ra),
            dec = parseFloat(dec),
            urall, uraur, result;

        this.each(function (t) {

            if (ra > 180) {
                ra = (ra - 360);
            }

            urall =  t.get('tli_urall');
            uraur = t.get('tli_uraur');

            if (urall > 180) {
                urall = urall - 360;
            }

            if (uraur > 180) {
                uraur = uraur - 360;
            }

            // tli_urall < ra
            // AND tli_udecll < dec
            // AND tli_uraur > ra
            // AND tli_udecur > dec
            if (
                urall < ra &&
                t.get('tli_udecll') < dec &&
                uraur > ra &&
                t.get('tli_udecur') > dec) {

                result = t;
                return false;
            }
        }, this);

        return result;
    }
});
