Ext.define('common.store.CSVDelimiters', {
    extend: 'common.store.MyStore',

    fields: ['delimiter'],
    data:[
        [','],
        [';'],
        ['|']
    ]
});
