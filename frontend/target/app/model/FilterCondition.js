Ext.define('Target.model.FilterCondition', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int', default: null, persist: false},
        {name:'filterset', type:'int'},
        {name:'fcd_property', type:'int'},
        {name:'fcd_property_name', type:'string'},
        {name:'fcd_operation', type:'string'},
        {name:'fcd_value', type:'string'},
        // {name:'property_display_name', type:'string', persist: false},
        {name:'operator_display_name', type:'string', persist: false},
        {
            name:'property_display_name',
            type:'string',
            persist: false,
            convert: function (value, record) {
                if (!value) {
                    var propery = record.get('fcd_property_name');
                    switch (propery) {
                        case '_meta_rating':
                            value = 'Rating';

                            break;

                        case '_meta_reject':
                            value = 'Reject';

                            break;
                    }
                }

                return value;
            }
        }
    ]

});

