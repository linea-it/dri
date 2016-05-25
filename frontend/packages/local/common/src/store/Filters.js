Ext.define('common.store.Filters', {
    extend: 'common.store.MyStore',

    model: 'common.model.Filter',

    alias: 'store.filters',

    remoteSort: true,

    remoteFilter: true,

    autoLoad: true,

    pageSize: 0,

    proxy: {
        type: 'django',
        url: '/dri/api/filters/'
    },

    sorters: [
        {
            property: 'lambda_min',
            direction: 'ASC'
        }
    ],

    filter: [
        {
            property: 'project',
            value: 'DES'
        }
    ]

    // data:[
    //     {filter: 'g',   name: 'g'},
    //     {filter: 'r',   name: 'r'},
    //     {filter: 'i',   name: 'i'},
    //     {filter: 'z',   name: 'z'},
    //     {filter: 'y',   name: 'Y'},
    //     {filter: 'rgb', name: 'RGB'},
    //     {filter: 'irg', name: 'irg'}
    // ]
});
