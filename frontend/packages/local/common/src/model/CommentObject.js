Ext.define('common.model.CommentObject', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'catalog_id', type:'int'},
        {name:'object_id', type:'int'},
        {name:'owner', type:'string'},
        {name:'date', type:'date'},
        {name:'comments', type:'string'}
    ]

});
