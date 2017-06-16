Ext.define('Target.model.PermissionUser', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int', persist: false},
        {name:'prm_product', type:'int'},
        {name:'prm_user', type:'int'},
        {name:'username', type:'string', persist: false}
    ]

});
