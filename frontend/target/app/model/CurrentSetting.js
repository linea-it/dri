Ext.define('Target.model.CurrentSetting', {
    extend: 'Ext.data.Model',
    requires: [
        'common.data.proxy.Django'
    ],

    fields: [
        {name:'id', type:'int', persist: false},
        {name:'cst_product', type:'int'},
        {name:'cst_setting', type:'int'},
        {name:'editable', type:'boolean', default: false, persist: false}
    ],

    proxy: {
        type: 'django',
        url: '/dri/api/currentsetting/'
    }

});
