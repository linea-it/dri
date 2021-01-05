Ext.define('visiomatic.model.FitsFiles', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'filename', type: 'string', default: null, persist: false},
        {name: 'url', type: 'string', default: null, persist: false},
    ]

});
