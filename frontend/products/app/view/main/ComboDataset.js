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
    displayField: 'tag_display_name',
    valueField: 'id'

});
