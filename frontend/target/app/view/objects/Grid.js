/**
 *
 */
Ext.define('Target.view.objects.Grid', {
    extend: 'Ext.grid.Panel',

    xtype: 'targets-objects-grid',

    requires:[
        'Ext.ux.CheckColumn',
        'Ext.grid.column.Number',
        'Ext.grid.column.Widget',
        'Ext.ux.rating.Picker'
    ],

    /**
    * @event ready
    * Evento disparado depois que a grid de objetos e reconfigurada
    * @param {Portal.view.target.Objects} [this] this panel
    */
    config: {
        ready: false,
        columnRating: true,
        columnAccept: true,
        columnComments: true
    },

    emptyText: 'No data to display.',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            enableLocking: true,
            syncRowHeight: true,
            columns: [
                Ext.create('Ext.grid.RowNumberer'),
                {text: '',  dataIndex: '', width: 50},
                {text: '',  dataIndex: '', flex: true}
            ],
            viewConfig: {
                stripeRows: true,
                markDirty: false,
                getRowClass: function (record) {
                    return record.get('_meta_reject') === true ? 'rejected-row' : '';
                }
            }
        });

        me.callParent(arguments);
    },

    reconfigureGrid: function (storeColumns) {
        // console.log('Targets Objects - reconfigureGrid(%o)', storeColumns);

        var me = this,
            columns = [],
            flag;

        // Coluna RowNunber
        columns.push(Ext.create('Ext.grid.RowNumberer', {
            width: 50,
            resizable: true,
            locked: true
        }));

        if (storeColumns.count() > 0) {

            flag = false;
            // flag = true;

            // Criar as colunas de acordo com as propriedades na store
            storeColumns.each(function (record) {

                // Se a coluna nao estiver visivel
                if (record.get('is_visible')) {

                    // type = me.getTypeColumn(record.get('data_type'));

                    var column = {
                        text: me.createColumnText(record),
                        dataIndex: record.get('column_name').toLowerCase(),
                        tooltip: me.createColumnTooltip(record),
                        renderer: me.formatNumber,
                        lockable: true
                    };

                    // if (type != undefined) {
                    //     column.filter = {type: type, itemDefaults: {emptyText: 'Search for...'}};
                    // }

                    // Se tiver a coluna id habilita as colunas de rating e reject
                    if (record.get('ucd') == 'meta.id;meta.main') {
                        // column.locked = true;
                        column.lockable = true;
                        column.renderer = null;
                        flag = true;
                    }

                    //  Tratamento Tilename default hidden
                    if (record.get('column_name').toLowerCase() == 'tilename') {
                        // column.hidden = true;
                        column.width = 120;

                    }

                    // Tratamento Ra e Dec caso possua colunas com estes ucds
                    // Formata a coluna para decimal com 4 casas.
                    if ((record.get('ucd') === 'pos.eq.ra;meta.main') ||
                        (record.get('ucd') === 'pos.eq.dec;meta.main')) {

                        column.width = 90;
                        column.xtype = 'numbercolumn';
                        column.format = '0.00000';
                        column.renderer = null;
                        // column.locked = true;
                        column.lockable = true;
                    }

                    // Coluna Radius
                    if (record.get('ucd') === 'phys.angSize;src') {
                        column.width = 80;
                        column.xtype = 'numbercolumn';
                        column.format = '0.000';
                        column.renderer = null;
                        // column.locked = true;
                        column.lockable = true;
                    }

                    columns.push(column);
                }

            },this);

            // Coluna Rating
            if ((me.getColumnRating()) && (flag === true)) {

                columns.push({
                    xtype: 'widgetcolumn',
                    width: 90,
                    sortable: true,
                    text: 'Rating',
                    dataIndex: '_meta_rating',
                    tooltip: 'Rating',
                    widget: {
                        xtype: 'rating',
                        minimum: 0,
                        // overStyle: 'color: orange;'
                        scale: '115%',
                        selectedStyle: 'color: rgb(96, 169, 23);',
                        style: {
                            'color': '#777777'
                        }
                        // listeners: {
                        // change: function (picker, value, oldvalue) {
                        //     console.log('picker ', value);
                        // console.log('oldvalue ', oldvalue);
                        // var record = picker.getWidgetRecord();
                        // me.fireEvent('changerating', record, value, oldvalue);
                        // }
                        // }
                    }
                });
            }
            // Coluna Reject
            if ((me.getColumnAccept()) && (flag === true)) {
                columns.push({
                    xtype: 'checkcolumn',
                    text: 'Reject',
                    dataIndex: '_meta_reject',
                    tooltip: 'Reject',
                    sortable: true,
                    width: 80
                });
            }
            // Coluna Comments
            if ((me.getColumnComments()) && (flag === true)) {
                columns.push({
                    text: 'Comments',
                    dataIndex: '_meta_comments',
                    tooltip: 'Comments',
                    align: 'center',
                    flex: 1,
                    sortable: false,
                    minWidth: 80,
                    renderer: function (value, metadata, record) {
                        var newValue = '';
                        if (value > 0) {
                            if (value == 1) {
                                //newValue = '<img src="resources/comment.png" title="Comment">';
                                newValue = '<i class="fa fa-comment-o"> </i>';
                            } else {
                                //newValue = '<spam class="x-fa fa-comments-o"> </span>';
                                newValue = '<i class="fa fa-comments-o"></i>';

                            }
                        }
                        return newValue;
                    }
                });
            }

        } else {

            columns.push({text: 'Placeholder',  dataIndex: '', hidden: true});
        }

        // // Ultima coluna tamanho variavel
        // var lastColumn = columns[columns.length - 1]
        // lastColumn.flex = 1;

        me.reconfigure(null, columns);

        // Marcar como ready
        me.setReady(true);
        this.fireEvent('ready', this);

    },

    getTypeColumn: function (type) {
        switch (type) {
            case 'integer':
            case 'real':
            case 'double precision':
            case 'bigint':
            case 'smallint':
                return 'number';
            case 'text':
                return 'string';
        }
    },

    createColumnText: function (record) {

        var unit = record.get('unit'),
            name = record.get('display_name');

        var text = unit != '' ? Ext.String.format('{0} ( {1} )', name, unit) : name;

        return text;

    },

    createColumnTooltip: function (record) {

        var tpl = new Ext.XTemplate(
            '<div>',
            '<p><spam><b>{display_name}</b></spam></p>',
            '<tpl if=\'column_name != ""\'>',
                '<p><spam>Name:</spam> {column_name}</p>',
            '</tpl>',
            '<tpl if=\'unit != ""\'>',
                '<p><spam>Unit:</spam> {unit}</p>',
            '</tpl>',

            '<tpl if=\'ucd != ""\'>',
                '<p><spam>ucd:</spam> {ucd}</p>',
            '</tpl>',

            '<tpl if=\'reference != ""\'>',
                '<p><spam>Reference:</spam> {reference}</p>',
            '</tpl>',

            '</div>'
        );

        return tpl.apply(record.data);
    },

    formatNumber: function (value) {
        var precision = 3,
            aValue, decimal;

        if (typeof(value) === 'number') {

            if (value > 10000) {
                // Se for maior que 10000 e tiver um float usar notacao exponencial
                if (value.toString().indexOf('.') != -1) {
                    value = value.toExponential(1);
                }

            } else {
                if (value.toString().indexOf('.') != -1) {
                    aValue = value.toString().split('.');
                    decimal = aValue[1];
                    // se tiver mais casas decimais
                    if (decimal.length > precision) {
                        value =  value.toFixed(precision);

                    }
                }
            }
        }

        return value;
    }
});
