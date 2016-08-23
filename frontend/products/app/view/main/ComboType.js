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
    displayField: 'pgr_display_name',
    valueField: 'id'
});
