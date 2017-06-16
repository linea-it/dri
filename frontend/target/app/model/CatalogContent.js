Ext.define('Target.model.CatalogContent', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'product_id', type:'int'},
        {name:'setting_id', type:'int'},
        {name:'column_name', type:'string'},

        {name:'class_id', type:'int'},
        {name:'category', type:'string'},
        {name:'display_name', type:'string'},
        {name:'ucd', type:'string'},
        {name:'unit', type:'string'},
        {name:'reference', type:'string'},
        {name:'mandatory', type:'boolean'},

        {name:'content_setting', type:'int'},
        {name:'is_visible', type:'boolean'},
        {name:'order', type:'int'}

    ]
});

