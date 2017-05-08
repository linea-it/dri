Ext.define('Target.model.ProductRelated', {
    extend: 'Ext.data.Model',

    requires: [
        'common.data.proxy.Django'
    ],

    fields: [
        {name:'id', type:'int', persist: false},
        {name:'prl_product', type:'int'},
        {name:'prl_related', type:'int'},
        {name:'prl_cross_identification', default: null},
        {name:'prl_cross_name', persist: false}

    ]

});

