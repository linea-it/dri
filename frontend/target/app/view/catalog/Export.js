Ext.define('Target.view.catalog.Export', {
    extend: 'Ext.form.Panel',

    xtype:'targets-catalog-export'

    // /**
    //  * @requires common.store.CSVDelimiters
    //  */
    // requires: [
    //     'common.store.CSVDelimiters',
    //     'Ext.view.MultiSelector'
    // ],

    // config: {
    //     catalog: null
    // },

    // scrollable: true,

    // initComponent: function () {
    //     var me = this;

    //     Ext.apply(this, {
    //         bodyPadding: 10,
    //         fieldDefaults:{
    //             labelAlign: 'top'
    //         },
    //         defaults: {
    //             xtype: 'textfield'
    //         },
    //         items: [{
    //             xtype:'fieldset',
    //             title: 'CSV',
    //             checkboxToggle: true,
    //             checkboxName: 'csv-export',
    //             items: [{
    //                 xtype: 'combobox',
    //                 fieldLabel: 'Delimiter',
    //                 displayField: 'delimiter',
    //                 store: Ext.create('common.store.CSVDelimiters'),
    //                 value: ';',
    //                 forceSelection: true,
    //                 editable: false,
    //                 name:'csv-delimiter'
    //             },{
    //                 xtype: 'radiogroup',
    //                 fieldLabel: 'Rejected Targets',
    //                 items: [
    //                     {boxLabel: 'Export all targets', name: 'csv-rejected', inputValue: 1, checked: true},
    //                     {boxLabel: 'Exclude rejected targets', name: 'csv-rejected', inputValue: 2},
    //                     {boxLabel: 'Add rejected column', name: 'csv-rejected', inputValue: 3}
    //                 ]
    //             },{
    //                 xtype: 'radiogroup',
    //                 fieldLabel: 'Rated Targets',
    //                 items: [
    //                     // {boxLabel: 'NAO INCLUIR', name: 'csv-rated', inputValue: 1, checked: true},
    //                     {boxLabel: 'My ratings', name: 'csv-rated', inputValue: 2, checked: true},
    //                     // {boxLabel: 'INCLUIR EM ARQUIVO SEPARADO', name: 'csv-rated', inputValue: 3},
    //                     {boxLabel: 'All users ratings', name: 'csv-rated', inputValue: 4, disabled: true}
    //                 ]
    //             }]
    //         },{
    //             xtype:'fieldset',
    //             title: 'Cutouts',
    //             checkboxToggle: true,
    //             checkboxName: 'images'
    //         }]
    //     });

    //     me.buttons = [{
    //         xtype: 'button',
    //         text: 'Submit',
    //         scope: this,
    //         handler: this.onClickSubmit
    //     }];

    //     me.callParent(arguments);
    // },

    // onClickSubmit: function () {
    //     // console.log("target.Export - onClickSubmit()");

    //     var me = this,
    //         catalog = me.getCatalog(),
    //         form = this.getForm(),
    //         values = form.getValues();

    //     // console.log(values);

    //     this.fireEvent('submitexport', catalog, values, me);
    // }
});
