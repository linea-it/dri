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
    scrollable: true,

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
        },
    },

    config: {
        enableFolder: false,
        enablePublic: false
    },

    initComponent: function () {
        var me = this;

        // Recuperar do Settigs no backend se a interface de registro pelo
        // banco de dados estara disponivel.
        try {
            me.enableFolder = Settings.PRODUCT_REGISTER_FOLDERS;
        }
        catch (err) {
            console.warn("Setting PRODUCT_REGISTER_FOLDERS not loaded.");
        }

        // Recuperar do Settigs no backend se a opcao de deixar a lista publica
        // vai estar ativa
        try {
            me.enablePublic = Settings.PRODUCT_REGISTER_ENABLE_PUBLIC;
        }
        catch (err) {
            console.warn("Setting PRODUCT_REGISTER_ENABLE_PUBLIC not loaded.");
        }

        Ext.apply(this, {

            bodyPadding: 20,
            submitEmptyText: false,
            defaults: {
                anchor: '100%'
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'displayName',
                    fieldLabel: 'List Name',
                    minLength: 3,
                    maxLength: 30,
                    allowBlank: false,
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
                    hidden: !me.enableFolder,
                    bind: {
                        store: '{productclass}',
                    },
                    value: 'objects'
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
                    name: 'isPublic',
                    checked: false,
                    hidden: !me.enablePublic,
                },
                {
                    xtype: 'component',
                    html: [
                        '<p>The target positions must be filled in CSV format: manually, in the text area below, or by a file that can be a raw <strong>.csv</strong> or a compressed one in the formats <strong>.zip</strong> or <strong>.tar.gz</strong>.</p>',
                    ]
                },
                {
                    xtype: 'filefield',
                    hideLabel: true,
                    reference: 'fldFileUploaded',
                    name: 'file'
                },
                {
                    xtype: 'component',
                    html: [
                        '<em>The attachment size limit is 50Mb.</em><p></p>',
                    ]
                },
                {
                    xtype: 'textareafield',
                    name: 'csvData',
                    fieldLabel: 'Coordinates',
                    height: 150,
                    labelAlign: 'top',
                    emptyText: 'ra, dec',
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
                    text: 'Cancel',
                    iconCls: 'x-fa fa-close',
                    handler: 'onCancelAddCatalog'
                },
                {
                    xtype: 'button',
                    text: 'Submit',
                    iconCls: 'x-fa fa-check',
                    ui: 'soft-green',
                    handler: 'addCatalog'
                }
            ]
        });

        me.callParent(arguments);
    }
});
