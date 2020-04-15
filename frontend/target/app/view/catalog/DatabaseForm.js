/**
 *
 */
Ext.define('Target.view.catalog.DatabaseForm', {
    extend: 'Ext.form.Panel',

    xtype: 'targets-catalog-database-form',

    requires: [
        'Target.view.catalog.DatabaseController',
        'Target.store.ProductClass',
        'common.store.Releases',
        'common.store.Databases'
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
            },
            databases: {
                type: 'databases',
                autoLoad: true
            }
        }
    },

    config: {
        enableFolder: false,
        enablePublic: false
    },

    initComponent: function () {
        var me = this;

        // Recuperar do Settigs no backend se a interface de registro pelo
        // banco de dados estara disponivel.
        try{
            me.enableFolder = Settings.PRODUCT_REGISTER_FOLDERS;
        }
        catch (err){
            console.warn("Setting PRODUCT_REGISTER_FOLDERS not loaded.");
        }

        // Recuperar do Settigs no backend se a opcao de deixar a lista publica
        // vai estar ativa
        try{
            me.enablePublic = Settings.PRODUCT_REGISTER_ENABLE_PUBLIC;
        }
        catch (err){
            console.warn("Setting PRODUCT_REGISTER_ENABLE_PUBLIC not loaded.");
        }


        Ext.apply(this, {
            bodyPadding: 10,
            submitEmptyText: false,
            defaults: {
                anchor: '100%'
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'displayName',
                    fieldLabel: 'Name',
                    maxLength: 30,
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
                    },
                    value: 'objects',
                    hidden: !me.enableFolder,
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
                    xtype: 'combobox',
                    name: 'database',
                    fieldLabel: 'Database',
                    displayField: 'display_name',
                    valueField: 'name',
                    bind: {
                        store: '{databases}'
                    }
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
                    checked: false,
                    hidden: !me.enablePublic,
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
