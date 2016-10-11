Ext.define('Target.view.settings.SettingWindow', {
    extend: 'Ext.window.Window',

    title: 'Add New Setting',
    reference: 'winSetting',
    width: 300,
    height: 350,
    layout: 'fit',
    modal: true,
    defaultFocus: 'cst_display_name',
    closeAction: 'destroy',
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
                    boxLabel: 'Is Default',
                    name: 'cst_is_default'
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'Is Public',
                    name: 'cst_is_public'
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
            text: 'Cancel',
            handler: 'onCancelSetting'
        }, {
            text: 'Save',
            handler: 'onAddSetting'
        }
    ]
});
