Ext.define('visiomatic.model.Overlay', {
    extend: 'Ext.data.Model',

    idProperty: 'id',

    fields: [
        {name: 'id', type:'int'},
        {name: 'name', type:'string'},
        {name: 'color', type:'string'},
        {name: 'visible', type:'boolean'},
        {name: 'status', type:'string'},
        {name: 'status_message', type:'string'},
        {name: 'count', type:'int'},
        {name: 'total_count', type:'int'},
        {name: 'excess', type:'int'},
        {name: 'catalog'},
        {name: 'layers'},
        {name: 'objects'},

    ]

});

