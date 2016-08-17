Ext.define('Products.view.main.ComboType', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'comboType',
    requires: [
        'Products.store.Type'
    ],
    store: {
        type: 'type'
    },
    fieldLabel: 'Type',
    labelWidth: 40,
    width: 250,
    displayField: 'display_name',
    valueField: 'catalog_id'
});
