Ext.define('Products.view.main.ComboRelease', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'comboRelease',
    requires: [
        'Products.store.Release'
    ],
    store: {
        type: 'release'
    },
    fieldLabel: 'Release',
    labelWidth: 60,
    displayField: 'display_name',
    valueField: 'display_name'

});
