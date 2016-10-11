Ext.define('Target.view.settings.Settings', {
    extend: 'Ext.form.Panel',

    requires: [
        'Target.view.settings.SettingsController',
        'Target.view.settings.SettingsModel'
    ],

    xtype: 'targets-settings',

    controller: 'settings',

    viewModel: 'settings',

    config: {
        product: null
    },

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            bodyPadding: 10,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                labelAlign: 'top',
                readOnly: true,
                labelStyle: 'font-weight:bold'
            },
            items: [
                {
                    xtype: 'fieldset',
                    layout: 'anchor',
                    defaults: {
                        labelAlign: 'top'
                        // anchor: '100%'
                    },
                    items: [
                        {
                            xtype: 'component',
                            html: [
                                '<h3>Locally loaded data</h3>',
                                '<p>This ComboBox uses local data from a JS array</p>'
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            items: [
                                {
                                    xtype: 'combobox',
                                    reference: 'cmbSetting',
                                    publishes: 'id',
                                    fieldLabel: 'Select Setting',
                                    displayField: 'cst_display_name',
                                    store: {
                                        type: 'settings'
                                    },
                                    bind: {
                                        selection: '{currentSetting}'
                                    },
                                    minChars: 0,
                                    queryMode: 'local',
                                    typeAhead: true,
                                    labelStyle: 'font-weight:bold'
                                },
                                {
                                    xtype: 'button',
                                    iconCls: 'x-fa fa-plus',
                                    handler: 'newSetting',
                                    margin: '0 0 0 5',
                                    tooltip: 'Add New Setting'
                                },
                                {
                                    xtype: 'button',
                                    iconCls: 'x-fa fa-pencil',
                                    handler: 'editSetting',
                                    tooltip: 'Edit Selected Setting',
                                    bind: {
                                        disabled: '{!currentSetting}'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'textfield',
                    fieldLabel: 'Name',
                    allowBlank: false,
                    name: 'cst_display_name',
                    bind: {
                        value: '{currentSetting.cst_display_name}'
                    }
                },
                {
                    xtype: 'textfield',
                    fieldLabel: 'Owner',
                    bind: {
                        value: '{currentSetting.owner}'
                    }
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'Is Default',
                    name: 'cst_is_default',
                    bind: {
                        value: '{currentSetting.cst_is_default}'
                    }
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'Is Public',
                    name: 'cst_is_public',
                    bind: {
                        value: '{currentSetting.cst_is_public}'
                    }
                },
                {
                    xtype: 'textareafield',
                    fieldLabel: 'Description',
                    name: 'cst_description',
                    bind: {
                        value: '{currentSetting.cst_description}'
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    setProduct: function (product) {
        this.product = product;

        if (product > 0) {
            this.fireEvent('changeproduct', product, this);
        }
    }

});
