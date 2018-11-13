Ext.define('common.store.Footprints', {
    extend: 'common.store.Tiles',

    /**
     * @requires common.model.Footprint
     */
    requires: [
        'common.model.Footprint'
    ],

    alias: 'store.footprints',

    model: 'common.model.Footprint',

    remoteFilter: true,

    remoteSort: true,

    pageSize: 0,

    proxy: {
        type: 'django',
        timeout: 90000,
        url: '/dri/api/footprints/',
        reader: {
            type: 'array'
        }
    }

});
