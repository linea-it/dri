/**
 *
 */
Ext.define('Explorer.view.system.VacGrid', {
    extend: 'Ext.grid.Panel',

    xtype: 'system-vac-grid',

    requires:[
        'Ext.grid.column.Number'
    ],

    /**
    * @event ready
    * Evento disparado depois que a grid de objetos e reconfigurada
    * @param {Portal.view.target.Objects} [this] this panel
    */
    config: {
        ready: false,
        inputVac: null
    },

    emptyText: 'No data to dysplay.',

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
            },
            tbar: [
                {
                    xtype: 'combobox',
                    itemId: 'cmbVacInput',
                    emptyText: 'choose the VAC catalog',
                    width: 200,
                    valueField: 'id',
                    displayField: 'name_with_process_id',
                    queryMode: 'local',
                    hidden: true,
                    bind: {
                        store: '{vacProducts}',
                    },
                    readOnly: false,
                    listeners: {
                        select: 'onSelectVacProduct'
                    }
                },
                {
                  xtype: 'textfield',
                  itemId: 'txtVacInput',
                  readOnly: true,
                  hidden: false
                },
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-eye',
                    enableToggle: true,
                    toggleHandler: 'changeVisibleOverlayVacs',
                    pressed: true,
                    tooltip: 'Show or hide objects in visiomatic'
                },
                {
                    xtype: 'numberfield',
                    minValue: 0.1,
                    maxValue: 5,
                    step: 0.1,
                    fieldLabel: 'WAZP Radius',
                    // labelWidth: 100,
                    width: 160,
                    bind: "{vacRadius}",
                },
                {
                    xtype: 'numberfield',
                    minValue: 0.1,
                    maxValue: 5,
                    step: 0.1,
                    fieldLabel: 'z',
                    labelWidth: 20,
                    width: 80,
                    // bind: "{vacRadius}",
                },
                '-',
                {
                    xtype: 'colorbutton',
                    bind: '{vacOverlayColor}',
                    width: 30,
                    tooltip: 'Choose a color. Click on the color and then on ok.'
                },
                {
                    xtype: 'combobox',
                    displayField: 'name',
                    valueField: 'name',
                    queryMode: 'local',
                    width: 80,
                    store: {
                        fields: ['name'],
                        data: [
                            {'name': 'circle'},
                            {'name': 'ellipse'},
                            {'name': 'square'},
                            {'name': 'triangle'}
                        ]
                    },
                    bind: {
                        value: '{vacOverlaypointType}',
                    }
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: 'Size',
                    labelWidth: 40,
                    width: 100,
                    bind: '{vacOverlayPointSize}',
                    minValue: 0.2,
                    maxValue: 10,
                    step: 0.2,
                },
                {
                    xtype: 'button',
                    iconCls: 'x-tbar-loading',
                    handler: 'loadVacObjects',
                    tooltip: 'Refresh'
                },
                '-',
                {
                    xtype: "button",
                    iconCls: 'fa fa-info',
                    tooltip: "Product Log",
                    bind: {
                        href: '{currentVacProduct.productlog}',
                        disabled: '{!currentVacProduct.productlog}'
                    }
                }
            ]
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

                    // Se tiver a coluna id habilita as colunas de rating e reject
                    if (record.get('ucd') == 'meta.id;meta.main') {
                        column.locked = true;
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
                        column.format = '0.000';
                        column.renderer = null;
                        column.locked = true;
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
                // Se for maior que 10.000 usar notacao exponencial
                value = value.toExponential(1);

            } else {
                // Se for float
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
    },

    afterRender: function () {
        var me = this,
            vacCluster = me.getInputVac(),
            cmb = me.down("#cmbVacInput"),
            txt = me.down("#txtVacInput");

        me.callParent(arguments);

        if (vacCluster) {
            // Ja tem vac desabilita a opcao de selecionar o vac,
            // oculta a combobox e exibe um textfield com o nome do vac
            cmb.setVisible(false);
            txt.setVisible(true);
            txt.setValue(vacCluster.get('name_with_process_id'));

        } else {
            cmb.setVisible(true);
            txt.setVisible(false);
            txt.setValue('');
        }
    },

    setInputVac: function (vacCluster) {
        var me = this;
        if ((vacCluster) && (vacCluster.get('id') > 0)) {
            me.inputVac = vacCluster;
        }
    }
});
