Ext.define('Products.view.main.ComboBand', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'comboBand',
    requires: [
        'Products.store.Band'
    ],
    store: {
        type: 'band'
    },
    fieldLabel: 'Band',
    labelWidth: 40,
    displayField: 'filter',
    valueField: 'id'

});
