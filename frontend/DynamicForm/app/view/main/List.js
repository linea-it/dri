/**
 * This view is an example list of people.
 */
Ext.define('DynamicForm.view.main.List', {
    extend: 'Ext.panel.Panel',
    xtype: 'mainlist',

    requires: [
        'Ext.form.field.Text',
        'Ext.form.field.Number',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Radio',
        'Ext.form.field.Date',
        'Ext.form.field.Time',
        'Ext.form.FieldSet'
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            layout: {
                type: 'hbox',
                pack: 'start',
                align: 'stretch'
            },
            items: [{
                xtype: 'panel',
                title: 'Input',
                flex: 1,
                bodyPadding: 10,
                layout: 'form',
                items: [
                    {
                        xtype: 'textareafield',
                        name: 'textarea1',
                        emptyText: 'Copie e Cole um exemplo aqui',
                        reference: 'txtInput',
                        allowBlank:false,
                        height: 300
                    },
                ],
                tbar: [
                    {
                        xtype: 'button',
                        text: 'Run',
                        handler: 'onBtnClickRun'
                    }
                ]
            },
            {
                xtype: 'form',
                title: 'Preview',
                reference: 'preview-form',
                flex: 1,
                bodyPadding: 10,
                layout: 'form',
            }, {
                xtype: 'panel',
                title: "Exemplos",
                flex: 1,
                html: '<b>Textfield:</b> </br> {"xtype": "textfield", "name": "campo1", "fieldLabel": "Campo 1", "value": "Text field value"}' +
                    '</br></br><b>Number Field (Com Validação):</b> </br> {"xtype": "numberfield", "name": "numberfield1", "fieldLabel": "Number field", "value": 5, "minValue": 0,"maxValue": 50}' +
                    '</br></br><b>Checkbox:</b> </br> {"xtype": "checkboxfield","name": "checkbox1","fieldLabel": "Checkbox","boxLabel": "box label"}' +
                    '</br></br><b>Radio:</b> </br> {"xtype": "radiofield","name": "radio1","value": "radiovalue1","fieldLabel": "Radio buttons","boxLabel": "radio 1"}' +
                    '</br></br><b>Datefield:</b> </br> {"xtype": "datefield","name": "date1","fieldLabel": "Date Field"}' +
                    '</br></br><b>Timefield:</b> </br> {"xtype": "timefield","name": "time1","fieldLabel": "Time Field","minValue": "1:30 AM","maxValue": "9:15 PM"}' +
                    '</br></br><b>Agrupados:</b> </br> {"xtype": "fieldset","title": "Details","collapsible": true,"defaults": {"labelAlign": "top"},"items": [{"xtype": "textfield", "name": "campo1", "fieldLabel": "Campo 1", "value": "Text field value"},{"xtype": "datefield","name": "date1","fieldLabel": "Date Field"}]}'
            }]
        })

        me.callParent(arguments);
    },

});
