Ext.define('aladin.model.Image', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'img_url', type:'string'},
        {name:'product', type:'int'}
    ]
});
