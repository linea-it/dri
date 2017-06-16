Ext.define('Target.store.FilterConditions', {
    extend: 'common.store.MyStore',

    alias: 'store.target-filter-conditions',

    requires: [
        'Target.model.FilterCondition'
    ],

    model: 'Target.model.FilterCondition',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/filtercondition/'
    },

    sorters: [
        {
            property: 'id',
            direction: 'ASC'
        }
    ]

});
