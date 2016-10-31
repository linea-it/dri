Ext.define('Target.view.settings.SettingWindow', {
    extend: 'Ext.window.Window',

    title: 'Create or edit a setting',
    reference: 'winSetting',
    width: 300,
    height: 350,
    layout: 'fit',
    modal: true,
    // defaultFocus: 'cst_display_name',
    //
    //viewModel: 'settings',
    closeAction: 'destroy',

    config: {
        edit: false
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
                    boxLabel: 'Is Public',
                    name: 'cst_is_public'
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'Is Editable',
                    name: 'cst_is_editable'
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
            handler: 'onDeleteSetting',
            hidden: true
        },
        '->',
        {
            text: 'Cancel',
            handler: 'onCancelSetting'
        }, {
            text: 'Save',
            ui: 'soft-green',
            handler: 'onAddSetting'
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
