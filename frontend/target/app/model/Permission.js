Ext.define('Target.model.Permission', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int', persist: false},
        {name:'prm_product', type:'int'},
        {name:'prm_user', default: null},
        {name:'prm_workgroup', default: null}
    ]

});
