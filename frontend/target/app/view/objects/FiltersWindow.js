Ext.define('Target.view.objects.FiltersWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.objects.FiltersController'
    ],

    title: 'Filters',
    width: 600,
    height: 350,
    layout: 'fit',
    modal: true,
    autoShow: true,

    closeAction: 'destroy',

    config: {
        edit: false
    },

    controller: 'filters',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {
            xtype: 'form',
            reference: 'filterForm',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            border: false,
            bodyPadding: 10,
            fieldDefaults: {
                msgTarget: 'side',
                labelAlign: 'top',
                labelWidth: 100,
                labelStyle: 'font-weight:bold'
            },
            items: [
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaults: {
                        flex: 1
                    },
                    items: [
                        {
                            xtype: 'combobox',
                            itemId: 'cmbProperty',
                            reference: 'cmbProperty',
                            publishes: 'id',
                            // fieldLabel: 'Property',
                            displayField: 'cst_display_name',
                            // store: {
                            //     type: 'settings',
                            //     listeners: {
                            //         scope: me,
                            //         load: 'onLoadComboSetting'
                            //     }
                            // },
                            // bind: {
                            //     selection: '{selectedSetting}'
                            // },
                            // listeners: {
                            //     select: 'onSelectSetting'
                            // },
                            minChars: 0,
                            queryMode: 'local',
                            editable: false,
                            labelStyle: 'font-weight:bold',
                            readOnly: false,
                            // width: 300,
                            margin: '0 5 0 0'
                        },
                        {
                            xtype: 'combobox',
                            itemId: 'cmbOperator',
                            reference: 'cmbOperator',
                            publishes: 'name',
                            // fieldLabel: 'Operator',
                            displayField: 'value',
                            store: {
                                fields: ['name', 'value'],
                                data: [
                                    {name : '=',   value: 'is equal to'},
                                    {name : '!=', value: 'is not equal to'},
                                    {name : '>',  value: 'is greater than'},
                                    {name : '>=', value: 'is greater than or equal to'},
                                    {name : '<', value: 'is less than'},
                                    {name : '<=', value: 'is less than or equal to'}
                                ]
                            },
                            // bind: {
                            //     selection: '{selectedSetting}'
                            // },
                            // listeners: {
                            //     select: 'onSelectSetting'
                            // },
                            minChars: 0,
                            queryMode: 'local',
                            editable: false,
                            labelStyle: 'font-weight:bold',
                            readOnly: false,
                            margin: '0 5 0 0'
                        },
                        {
                            xtype: 'textfield',
                            margin: '0 5 0 0'
                            // fieldLabel: 'Value'
                        },

                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-plus',
                            // ui: 'soft-green',
                            width: 40,
                            flex: false,
                            handler: 'onAddFilter'
                        }
                    ]
                }
            ]
        },
        {
            xtype: 'grid',
            layout: 'fit',
            flex: 1,
            columns: [
                {
                    text: 'Property',
                    dataIndex: 'name',
                    flex: 1
                },
                {
                    text: 'Operator',
                    flex: 1
                },
                {
                    text: 'Value',
                    flex: 1
                }
            ]
        }
    ],
    buttons: [
        {
            text: 'Delete',
            itemId: 'btnDeleteSetting',
            ui: 'soft-red',
            handler: 'onDeleteSetting',
            hidden: true
        },
        '->',
        {
            text: 'Cancel',
            handler: 'onCancelFilter'
        }, {
            text: 'Apply',
            ui: 'soft-green',
            handler: 'onApplyFilter'
        }
    ],

    setEdit: function (edit) {
        if (edit) {
            this.down('#btnDeleteSetting').setVisible(true);
        }
    },

    onDelete: function () {
        this.fireEvent('delete', this);

        this.close();
    }

});
