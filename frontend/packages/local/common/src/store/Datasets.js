Ext.define('common.store.Datasets', {
    extend: 'common.store.Tiles',

    /**
     * @requires common.model.Dataset
     */
    requires: [
        'common.model.Dataset'
    ],

    alias: 'store.datasets',

    model: 'common.model.Dataset',

    remoteFilter: true,

    remoteSort: true,

    pageSize: 100,

    proxy: {
        type: 'django',
        url: '/dri/api/dataset/'
    }

});
