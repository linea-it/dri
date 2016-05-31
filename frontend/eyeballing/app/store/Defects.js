Ext.define('Eyeballing.store.Defects', {
    extend: 'common.store.MyStore',

    requires: [
        'Eyeballing.model.Defect'
    ],

    alias: 'store.defects',

    model: 'Eyeballing.model.Defect',

    remoteFilter: true,

    remoteSort: true,

    pageSize: 0,

    proxy: {
        type: 'django',
        url: '/dri/api/defect/'
    }

});
