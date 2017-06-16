Ext.define('Target.model.Product', {
    extend: 'Ext.data.Model',

    requires: [
        'common.data.proxy.Django'
    ],

    fields: [
        {name:'id'},
        {name:'owner', type:'string'},
        {name:'prd_name', type:'string'},
        {name:'prd_display_name', type:'string'},
        {name:'prd_user_display_name', type:'string'},
        {name:'prd_class', type:'int'},
        {name:'prd_date', type:'date'},
        {name:'prd_is_public', type:'boolean', defaultValue: false},
        {name:'is_owner', type:'boolean', defaultValue: false}
    ]

});
