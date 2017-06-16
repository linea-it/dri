Ext.define('Explorer.store.ProductDisplayContents', {
    extend: 'common.store.MyStore',

    alias: 'store.product-display-contents',

    requires: [
        'Explorer.model.CatalogContent'
    ],

    model: 'Explorer.model.CatalogContent',

    remoteFilter: true,

    remoteSort: false,

    pageSize: 0,

    proxy: {
        url: '/dri/api/productcontent/get_display_content/'
    },

    autoSort: true,

    // sorters: [{
    //     property: 'order',
    //     direction: 'ASC'
    // }]
    ucds: ['meta.id;meta.main', 'pos.eq.ra;meta.main', 'pos.eq.dec;meta.main'],

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
