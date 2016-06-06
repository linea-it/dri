/**
 *
 */
Ext.define('Target.view.preview.CoaddProperties', {
    extend: 'Ext.grid.property.Grid',

    xtype: 'targets-preview-coaddproperties',

    requires: [
        'Ext.form.field.Text'
    ],

    // Esse atributo o default e true o que faz a property ser ordenada em ordem
    // alfabetica caso necessario ser em uma ordem expecifica mudar para false,
    // a ordem vai ser a que estiver no atributo source.
    sortableColumns: false,

    hideHeaders: true,

    sourceConfig:{
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        coadd_objects_id: {
            displayName: 'Object Id',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        display_ra: {
            displayName: 'RA (deg)',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        display_dec: {
            displayName: 'Dec (deg)',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        l: {
            displayName: 'l (deg)',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        b: {
            displayName: 'b (deg)',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        mag_auto_magerr_g:{
            displayName: 'g',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        mag_auto_magerr_r: {
            displayName: 'r',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        mag_auto_magerr_i: {
            displayName: 'i',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        mag_auto_magerr_z: {
            displayName: 'z',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        },
        mag_auto_magerr_y: {
            displayName: 'Y',
            editor: Ext.create('Ext.form.field.Text', {readOnly: true, editable: false})
        }
    }
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
});
