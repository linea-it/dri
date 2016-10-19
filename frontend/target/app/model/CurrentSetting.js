Ext.define('Target.model.CurrentSetting', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int', persist: false},
        {name:'cst_product', type:'int'},
        {name:'cst_setting', type:'int'}
    ]

});
