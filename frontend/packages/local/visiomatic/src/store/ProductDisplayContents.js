Ext.define('visiomatic.store.ProductDisplayContents', {
    extend: 'common.store.MyStore',

    alias: 'store.overlay-product-display-contents',

    requires: [
        'visiomatic.model.CatalogContent'
    ],

    model: 'visiomatic.model.CatalogContent',

    remoteFilter: true,

    remoteSort: false,

    pageSize: 0,

    proxy: {
        url: '/dri/api/productcontent/get_display_content/'
    },

    autoSort: true,

    ucds: [
        'meta.id;meta.main',
        'pos.eq.ra;meta.main',
        'pos.eq.dec;meta.main'
    ],

    check_ucds: function () {
        var me = this,
            status = [];

        me.each(function (record) {

            if (me.ucds.indexOf(record.get('ucd')) !== -1) {
                status.push(true);
            }

        }, me);

        if (status.length === me.ucds.length) {
            return true;
        } else {
            return false;
        }

    }

});
