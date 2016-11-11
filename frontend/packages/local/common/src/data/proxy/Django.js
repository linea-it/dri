/**
 * Created by glauber on 11/03/16.
 */
Ext.define('common.data.proxy.Django', {
    extend: 'Ext.data.proxy.Rest',

    requires: [
        'common.data.proxy.CrsfToken'
    ],

    alias: 'proxy.django',

    headers: {
        'Accept': 'application/json;'
    },

    startParam: 'offset',

    sortParam: 'ordering',

    reader: {
        type: 'json',
        rootProperty: 'results',
        totalProperty: 'count'
    },

    writer: {
    },

    // ExtJS sends partitial updates by default (only the changed fields)
    // The REST-Apis PUT-MEthod-Handler expects complete Records and fails if fields are missing
    // We correct this by telling ExtJS to send a PATCH-Request instead of POST for updates
    // Djangos The REST-Api handles PATCH like POST but without the check for completion
    actionMethods: {
        create: 'POST',
        read: 'GET',
        update: 'PATCH',
        destroy: 'DELETE'
    },

    encodeSorters: function (sorters) {
        // console.log('Django - encodeSorters(%o, %o)', sorters, preventArray)

        var aStr = [],
            sorter,
            s;

        for (var i in sorters) {
            sorter = sorters[i];

            s = (sorter.getDirection() == 'DESC' ? '-' : '') + sorter.getProperty();

            aStr.push(s);
        }

        return aStr.join();
    },

    getParams: function (operation) {
        // console.log('DjangoProxy - getParams(%o)', operation);

        var params = this.callParent(arguments);

        if (!operation.isReadOperation) {
            return params;
        }

        var filters = operation.getFilters();

        delete params[this.getFilterParam()];

        Ext.each(filters, function (filter) {

            var property = filter.getProperty(),
                value = filter.getValue(),
                p, v;

            switch (filter.getOperator()){

                case '<':
                    p = Ext.String.format('{0}__lt', property);
                    params[p] = value;
                    break;

                case '<=':
                    p = Ext.String.format('{0}__lte', property);
                    params[p] = value;
                    break;

                case '>=':
                    p = Ext.String.format('{0}__gte', property);
                    params[p] = value;
                    break;

                case '>':
                    p = Ext.String.format('{0}__gt', property);
                    params[p] = value;
                    break;

                case '!=':
                    p = Ext.String.format('{0}!', property);
                    params[p] = value;
                    break;

                case 'in':
                    p = Ext.String.format('{0}__in', property);
                    params[p] = value.join();
                    break;

                case 'like':
                    p = Ext.String.format('{0}__icontains', property);
                    params[p] = value;
                    break;

                case 'range':
                    p = Ext.String.format('{0}__range', property);
                    v = Ext.String.format('{0},{1}', value[0], value[1]);
                    params[p] = v;
                    break;

                default:
                    params[property] = value;

            }
        });

        return params;
    },

    buildUrl: function (request) {
            var me        = this,
                operation = request.getOperation(),
                records   = operation.getRecords(),
                record    = records ? records[0] : null,
                format    = me.getFormat(),
                url       = me.getUrl(request),
                id, params;

            if (record && !record.phantom) {
                id = record.getId();
            } else {
                id = operation.getId();
            }

            if ((me.getAppendId() && me.isValidId(id)) || (operation.action === 'update')) {

                if (!url.match(me.slashRe)) {
                    url += '/';
                }
                url += encodeURIComponent(id);

                params = request.getParams();
                if (params) {
                    delete params[me.getIdParam()];
                }

                // Adiciona '/' apos o id para ficar compativel com Django REST.
                url += '/';
            }

            if (format) {
                if (!url.match(me.periodRe)) {
                    url += '.';
                }

                url += format;
            }

            request.setUrl(url);

            // Substitui pelo metodo da superclass por que estava adicionando o id ao final da url novamente.
            //return me.callParent([request]);
            return Ext.data.RestProxy.superclass.buildUrl.apply(this, arguments);

        }

});
