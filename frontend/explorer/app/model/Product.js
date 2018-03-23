Ext.define('Explorer.model.Product', {
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
        {name:'is_owner', type:'boolean', defaultValue: false},
        {name:'tablename', type:'string'},
        {name: 'epr_original_id', type: 'string'},
        {name: 'productlog', type: 'string'},
        // Nome do producto + process ID
        {
            name:'name_with_process_id',
            type:'string',
            convert: function (value, record) {
                if (record.get('epr_original_id')) {
                    return record.get('epr_original_id') + ' - ' + record.get("prd_display_name");
                } else {
                    return record.get("prd_display_name");
                }
            }
        },
    ]

});
