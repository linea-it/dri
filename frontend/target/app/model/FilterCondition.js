Ext.define('Target.model.FilterCondition', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int', default: null, persist: false},
        {name:'filterset', type:'int'},
        {name:'fcd_property', type:'int'},
        {name:'fcd_operation', type:'string'},
        {name:'fcd_value', type:'string'},
        {name:'property_name', type:'string', persist: false},
        {name:'property_display_name', type:'string', persist: false},
        {name:'operator_display_name', type:'string', persist: false}
    ]

});

