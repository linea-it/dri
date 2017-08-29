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

    title: 'Upload',

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
        anchor: '100%'
    },
    items: [
        {
            xtype: 'textfield',
            name: 'displayName',
            fieldLabel: 'Name',
            regex: /^[a-z0-9-_\s]+$/i,
            regexText: 'Please use only letters and numbers separated ' +
                        'by spaces \' \', minus sign \'-\' or underscore \'_\'.'
            // value: 'Teste Import CSV'
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
            // value: 'galaxy_clusters'
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
            // value: 'y1_wide_survey'
        },
        {
            xtype: 'checkbox',
            boxLabel: 'Public',
            name: 'isPublic',
            checked: true
        },
        {
            xtype: 'textareafield',
            name: 'csvData',
            fieldLabel: 'Coordinates',
            height: 200,
            labelAlign: 'top',
            emptyText: 'ra, dec',
            allowBlank: false
            // value:  '93.96499634,-57.77629852\n' +
            //         '94.28079987,-55.13209915\n' +
            //         '68.05249786,-61.84970093\n'
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
