/**
 * Created by glauber on 11/03/16.
 */
Ext.define('common.data.proxy.Django', {
    extend: 'Ext.data.proxy.Rest',

    requires: [
    ],

    alias: 'proxy.django',

    headers: {
        'Accept': "application/json;"
    },

    startParam: 'offset',

    sortParam: 'ordering',

    reader: {
        type: 'json',
        rootProperty: 'results',
        totalProperty: 'count'
    },

    encodeSorters: function(sorters, preventArray) {
        // console.log('Django - encodeSorters(%o, %o)', sorters, preventArray)

        var aStr = [],
            s;

        for (i in sorters){
            sorter = sorters[i];

            s = (sorter.getDirection() == 'DESC' ? '-' : '') + sorter.getProperty();

            aStr.push(s)
        }

        return aStr.join()
    },

    getParams: function(operation) {
        // console.log('DjangoProxy - getParams(%o)', operation)

        var params = this.callParent(arguments);

        if (!operation.isReadOperation){
            return params;
        }

        var filters = operation.getFilters();

        delete params[this.getFilterParam()];

        Ext.each(filters, function(filter){

            var property = filter.getProperty(),
                value = filter.getValue(),
                p, v;

            switch (filter.getOperator()){

                case '<':
                    p = Ext.String.format("{0}__lt", property);
                    params[p] = value;
                    break;

                case '<=':
                    p = Ext.String.format("{0}__lte", property);
                    params[p] = value;
                    break;

                case '>=':
                    p = Ext.String.format("{0}__gte", property);
                    params[p] = value;
                    break;

                case '>':
                    p = Ext.String.format("{0}__gt", property);
                    params[p] = value;
                    break;

                case '!=':
                    p = Ext.String.format("{0}!", property);
                    params[p] = value;
                    break;

                case 'in':
                    p = Ext.String.format("{0}__in", property);
                    params[p] = value.join();
                    break;

                case 'like':
                    p = Ext.String.format("{0}__icontains", property);
                    params[p] = value;
                    break;

                case 'range':
                    p = Ext.String.format("{0}__range", property);
                    v = Ext.String.format("{0},{1}", value[0], value[1]);
                    params[p] = v;
                    break;

                default:
                    params[property] = value;

            }
        });

        return params;
    }

});