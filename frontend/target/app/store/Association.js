Ext.define('Target.store.Association', {
    extend: 'common.store.MyStore',

    alias: 'store.association',

    requires: [
        'Target.model.Association'
    ],

    model: 'Target.model.Association',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/association/'
    }

});
