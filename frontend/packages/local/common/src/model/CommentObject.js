Ext.define('common.model.CommentObject', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id' },
        { name: 'catalog_id', type: 'int' },
        { name: 'object_id', type: 'string' },
        { name: 'comments', type: 'string' },
        { name: 'owner', type: 'string', persist: false },
        { name: 'date', type: 'date', persist: false },
        { name: 'is_owner', type: 'boolean', persist: false }
    ]

});
