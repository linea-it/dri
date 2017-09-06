Ext.define('Target.view.settings.SettingWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.settings.SettingsController'
    ],

    controller: 'settings',
    viewModel: {
        data: {
            isEdit: false
        }
    },

    title: 'Create or edit a setting',
    width: 300,
    height: 350,
    layout: 'fit',
    modal: true,

    closeAction: 'destroy',

    config: {
        record: null
    },

    items: [
        {
            xtype: 'form',
            reference: 'settingForm',
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
                    xtype: 'textfield',
                    fieldLabel: 'Name',
                    name: 'cst_display_name',
                    itemId: 'cst_display_name',
                    allowBlank: false,
                    minLength: 3,
                    maxLength: 128
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'Public',
                    name: 'cst_is_public',
                    reference: 'isPublic',
                    listeners: {
                        change: function (chk, value) {
                            var form = this.up('form'),
                                editable = form.down('#isEditable');

                            if (value === false) {
                                editable.setValue(value);
                            }

                        }
                    }
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'Alow edition',
                    name: 'cst_is_editable',
                    itemId: 'isEditable',
                    bind: {
                        disabled: '{!isPublic.checked}'
                    }
                },
                {
                    xtype: 'textareafield',
                    fieldLabel: 'Description',
                    name: 'cst_description',
                    labelAlign: 'top',
                    flex: 1,
                    margin: '0',
                    allowBlank: true,
                    maxLength: 1024
                }
            ]
        }
    ],
    buttons: [
        {
            text: 'Delete',
            itemId: 'btnDeleteSetting',
            ui: 'soft-red',
            handler: 'deleteSetting',
            bind: {
                hidden: '{!isEdit}'
            }
        },
        '->',
        {
            text: 'Cancel',
            handler: 'cancelSetting'
        }, {
            text: 'Save',
            ui: 'soft-green',
            handler: 'addSetting'
        }
    ],

    setRecord: function (record) {
        var me = this,
            vm = me.getViewModel(),
            form = me.lookup('settingForm');

        me.record = record;

        form.loadRecord(record);

        if (record.get('id') > 0) {
            vm.set('isEdit', true);
        } else {
            vm.set('isEdit', false);
        }

    }

});
