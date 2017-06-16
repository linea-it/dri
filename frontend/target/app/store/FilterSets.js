Ext.define('Target.store.FilterSets', {
    extend: 'common.store.MyStore',

    alias: 'store.target-filtersets',

    requires: [
        'Target.model.FilterSet'
    ],

    model: 'Target.model.FilterSet',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/filterset/'
    },

    sorters: [
        {
            property: 'id',
            direction: 'ASC'
        }
    ]

});
