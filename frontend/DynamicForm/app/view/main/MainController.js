/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('DynamicForm.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    onItemSelected: function (sender, record) {
        Ext.Msg.confirm('Confirm', 'Are you sure?', 'onConfirm', this);
    },

    onConfirm: function (choice) {
        if (choice === 'yes') {
            //
        }
    },

    onBtnClickRun: function () {
        console.log('onBtnClickRun')
        var me = this,
            inputfield = me.lookup('txtInput'),
            previewform = me.lookup('preview-form'),
            obj;

        console.log(previewform)

        if (inputfield.isValid()) {

            //test = '{"xtype": "textfield", "name": "campo1", "fieldLabel": "Campo 1", "value": "Text field value"}'

            // console.log(JSON.parse(inputfield.getValue()))
            // console.log(test)
            // console.log(JSON.parse(test))


            try {
                obj = JSON.parse(inputfield.getValue());
            } catch(err) {
                Ext.MessageBox.alert('Status', 'Json com formato invalido.');
            }
            previewform.removeAll()
            previewform.add(JSON.parse(inputfield.getValue()))
        } else {
            Ext.MessageBox.alert('Status', 'Não pode ser em branco.');
        }
    }
});
