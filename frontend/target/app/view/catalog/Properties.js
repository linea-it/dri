/**
 *
 */
Ext.define('Target.view.catalog.Properties', {
    extend: 'Ext.grid.property.Grid',

    xtype: 'targets-catalog-properties',

    requires: [
        'Ext.form.field.Text',
        'Ext.form.field.Date'
    ],

    nameColumnWidth: 90,

    // Esse atributo o default e true o que faz a property ser ordenada em ordem
    // alfabetica caso necessario ser em uma ordem expecifica mudar para false,
    // a ordem vai ser a que estiver no atributo source.
    sortableColumns: false,

    hideHeaders: true,

    sourceConfig: {
        // catalog_name: {
        //     displayName: "Name",
        //     editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false}),
        // },
        version: {
            displayName: 'Version',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        process_id: {
            displayName: 'Process Id',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        owner: {
            displayName: 'Owner',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        ingestion_date: {
            displayName: 'Date',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        num_objects: {
            displayName: 'Rows',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        }
    },

    source: {
        // catalog_name: "",
        version: '',
        process_id: '',
        owner: '',
        ingestion_date: '',
        num_objects: ''
    }

});
