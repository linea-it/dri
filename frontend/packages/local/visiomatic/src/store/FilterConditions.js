Ext.define('visiomatic.store.FilterConditions', {
    extend: 'Ext.data.Store',

    alias: 'store.overlay-filter-conditions',

    requires: [
        'visiomatic.model.FilterCondition'
    ],

    model: 'visiomatic.model.FilterCondition',

    remoteFilter: false,

    pageSize: 0,

    sorters: [
        {
            property: 'id',
            direction: 'ASC'
        }
    ]

});
