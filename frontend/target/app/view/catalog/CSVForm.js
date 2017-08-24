/**
 *
 */
Ext.define('Target.view.catalog.CSVForm', {
    extend: 'Ext.form.Panel',

    xtype: 'targets-catalog-csv-form',

    requires: [
        'Target.view.catalog.CSVController',
        'Target.store.ProductClass',
        'common.store.Releases'
    ],

    title: 'Upload CSV',

    controller: 'csvform',

    viewModel: {
        stores: {
            productclass: {
                type: 'product_class',
                autoLoad: true,
                filters: [
                    {
                        property: 'pgr_name',
                        value: 'targets'
                    }
                ]
            },
            releases: {
                type: 'releases',
                autoLoad: true
            }
        }
    },

    bodyPadding: 20,
    submitEmptyText: false,
    defaults: {
        // labelAlign: 'top',
        anchor: '100%'
    },
    items: [
        {
            xtype: 'textfield',
            name: 'display_name',
            fieldLabel: 'Name',
            regex: /^[a-z0-9-_\s]+$/i,
            regexText: 'Please use only letters and numbers separated ' +
                        'by spaces \' \', minus sign \'-\' or underscore \'_\'.'
        },
        {
            xtype: 'combobox',
            name: 'classname',
            fieldLabel: 'Folder',
            valueField: 'pcl_name',
            displayField: 'pcl_display_name',
            allowBlank: false,
            editable: false,
            bind: {
                store: '{productclass}'
            }
        },
        {
            xtype: 'combobox',
            name: 'release',
            fieldLabel: 'Release',
            displayField: 'rls_display_name',
            valueField: 'rls_name',
            bind: {
                store: '{releases}'
            }
        },
        {
            xtype: 'checkbox',
            boxLabel: 'Public',
            name: 'is_public',
            checked: true
        },
        // TODO add file Field para permitir o upload de um arquivo csv completo
        // {
        //     xtype: 'filefield',
        //     fieldLabel: 'Choose CSV file'
        // },
        {
            xtype: 'textareafield',
            name: 'csvData',
            fieldLabel: 'CSV Data',
            height: 200,
            labelAlign: 'top',
            emptyText: 'id, ra, dec, col1, col2, ...',
            value: 'id_auto,ra,dec'
        },
        {
            xtype: 'textareafield',
            name: 'description',
            labelAlign: 'top',
            fieldLabel: 'Description'
        }

    ],

    buttons: [
        '->',
        {
            xtype: 'button',
            text: 'Submit',
            iconCls: 'x-fa fa-check',
            ui: 'soft-green',
            handler: 'addCatalog'
        },
        {
            xtype: 'button',
            text: 'Cancel',
            iconCls: 'x-fa fa-close',
            handler: 'onCancelAddCatalog'
        }
    ]

});
