Ext.define('common.store.Filters', {
    extend: 'common.store.MyStore',

    model: 'common.model.Filter',

    data:[
        {filter: 'g',   name: 'g'},
        {filter: 'r',   name: 'r'},
        {filter: 'i',   name: 'i'},
        {filter: 'z',   name: 'z'},
        {filter: 'y',   name: 'Y'},
        {filter: 'rgb', name: 'RGB'},
        {filter: 'irg', name: 'irg'}
    ]
});
