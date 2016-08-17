Ext.define('Products.view.main.ComboDataset', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'comboDataset',
    requires: [
        'Products.store.Dataset'
    ],
    store: {
        type: 'dataset'
    },
    fieldLabel: 'Dataset',
    labelWidth: 60,
    displayField: 'display_name',
    valueField: 'display_name'

});
