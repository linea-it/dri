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
        product: null,
        currentSetting: null
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
                readOnly: true
            },
            items: [
                {
                    xtype: 'component',
                    html: [
                        '<p>The Settings Wizard helps you to define how your target list will be displayed.</p>',
                        '<p>Create or select an existing setting.</p>'
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'combobox',
                            itemId: 'cmbSetting',
                            reference: 'cmbSetting',
                            publishes: 'id',
                            fieldLabel: 'Setting',
                            displayField: 'cst_display_name',
                            store: {
                                type: 'settings',
                                listeners: {
                                    scope: me,
                                    load: 'onLoadComboSetting'
                                }
                            },
                            bind: {
                                selection: '{selectedSetting}'
                            },
                            listeners: {
                                select: 'onSelectSetting'
                            },
                            minChars: 0,
                            queryMode: 'local',
                            editable: false,
                            labelStyle: 'font-weight:bold',
                            readOnly: false,
                            labelWidth: 60,
                            width: 300
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
                                disabled: '{!selectedSetting.editable}'
                            }
                        }
                    ]
                },
                {
                    xtype: 'textfield',
                    fieldLabel: 'Owner',
                    bind: {
                        value: '{selectedSetting.owner}'
                    }
                },
                {
                    xtype: 'textareafield',
                    fieldLabel: 'Description',
                    name: 'cst_description',
                    bind: {
                        value: '{selectedSetting.cst_description}'
                    }
                }
            ],
            buttons: [
                {
                    itemId: 'card-next',
                    text: 'Next',
                    scope: me,
                    handler: function () {
                        this.fireEvent('next');
                    },
                    bind: {
                        disabled: '{!selectedSetting}',
                        hidden: '{!selectedSetting.editable}'
                    }
                },
                {
                    text: 'Finish',
                    itemId: 'SettingBtnFinish',
                    scope: me,
                    ui: 'soft-green',
                    handler: function () {
                        this.fireEvent('finish', this);
                    },
                    hidden: true
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
    },

    setCurrentSetting: function (currentSetting) {
        this.currentSetting = currentSetting;

        this.getViewModel().set('currentSetting', currentSetting);

        this.checkFinish();

    },

    onLoadComboSetting: function (store) {
        var me = this,
            currentSetting = me.getCurrentSetting(),
            combo = me.down('#cmbSetting'),
            setting;

        if (currentSetting) {
            if (currentSetting.get('id') > 0) {
                setting = store.getById(currentSetting.get('cst_setting'));
                combo.select(setting);
            }
        }
    },

    selectSetting: function (currentSetting) {
        this.setCurrentSetting(currentSetting);
        this.fireEvent('selectsetting', currentSetting);

    },

    checkFinish: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('displayContents'),
            currentSetting = vm.get('currentSetting');

        store.addFilter([
            {'property': 'pcn_product_id', value: currentSetting.get('cst_product')},
            {'property': 'pca_setting', value: currentSetting.get('cst_setting')}
        ]);
        store.load({
            callback: function () {

                if (this.check_ucds()) {
                    me.down('#SettingBtnFinish').setVisible(true);
                } else {
                    me.down('#SettingBtnFinish').setVisible(false);
                }
            }
        });

    }

});
