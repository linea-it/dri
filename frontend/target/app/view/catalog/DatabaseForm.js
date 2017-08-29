/**
 *
 */
Ext.define('Target.view.catalog.DatabaseForm', {
    extend: 'Ext.form.Panel',

    xtype: 'targets-catalog-database-form',

    requires: [
        'Target.view.catalog.DatabaseController',
        'Target.store.ProductClass',
        'common.store.Releases'
    ],

    title: 'Database',

    controller: 'database',

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

    bodyPadding: 10,
    submitEmptyText: false,
    defaults: {
        labelAlign: 'top',
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
            // value: 'Registro de tabela Dessci'
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
            xtype: 'textfield',
            name: 'database',
            fieldLabel: 'Database',
            maxLength: 30,
            value: 'dessci',
            readOnly: true
        },
        {
            xtype: 'textfield',
            name: 'tablename',
            fieldLabel: 'Table name',
            maxLength: 61,
            emptyText: 'schema.table',
            regex: /[/\S+/]+[\\.][/\S+/]+/gi,
            regexText: 'Please use schema.table',
            allowBlank: false
            // value: 'brportal.e_987_2097'
        },
        {
            xtype: 'checkbox',
            boxLabel: 'Public',
            name: 'isPublic',
            checked: true
        },
        {
            xtype: 'textareafield',
            name: 'description',
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
