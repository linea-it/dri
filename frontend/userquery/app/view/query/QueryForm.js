

Ext.define('UserQuery.view.query.QueryForm', {
    extend: 'Ext.form.Panel',

    xtype: 'userquery-query-form',

    requires: [
        'UserQuery.view.query.QueryController',
        'UserQuery.view.query.QueryModel',
    ],

    controller: 'query',

    viewModel: 'query',

    title: 'Query Definition',

    bodyPadding: 20,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    defaults: {
        listeners: {
            change: 'onFieldChange'
        }
    },

    tbar: [
        {
            xtype: 'button',
            tooltip: 'Clear Query',
            reference: 'btnClear',
            iconCls: 'x-fa fa-file-o',
            handler: 'onClickBtnClear',
        },
        {
            xtype: 'button',
            tooltip: 'Save Query',
            reference: 'btnSave',
            iconCls: 'x-fa fa-floppy-o',
            handler: 'onClickBtnSave',
            disabled: true
            // bind: {
            //     disabled: '{saveDisabled}'
            // }
        },
    ],

    items: [
        {
            xtype: 'textfield',
            fieldLabel: 'Name',
            name: 'name',
            allowBlank: false,
            maxLength: 128,
            bind: {
                value: '{currentQuery.name}'
            }
        },
        {
            xtype: 'textfield',
            fieldLabel: 'Description',
            name: 'description',
            maxLength: 256,
            bind: {
                value: '{currentQuery.description}'
            }
        },
        {
            xtype: 'codemirror',
            fieldLabel: 'SQL Sentence ',
            name: 'sql_sentence',
            reference: 'sqlField',
            flex: 1,
            listeners: {
                change: 'onChangeSqlField'
            }
        }
    ],

    buttons: [
        {
            xtype: 'button',
            text: 'Check',
            reference: 'btnCheck',
            handler: 'onClickBtnCheck',
            // bind: {
            //     disabled: '{!sql_value}'
            // }
        },
        {
            xtype: 'button',
            text: 'Preview',
            reference: 'btnPreview',
            handler: 'onClickBtnPreview',
            // bind: {
            //     disabled: '{!sql_value}'
            // }
        },
        {
            xtype: 'button',
            text: 'Execute Query',
            tooltip: 'Execute Query',
            reference: 'btnStartJob',
            handler: 'onClickBtnExecute',
            iconCls: 'x-fa fa-play',
            // bind: {
            //     disabled: '{!sql_value}'
            // }
        },
    ],

    setQuery: function (record) {
        console.log('setQuery(%o)');
        var me = this,
            vm = me.getViewModel(),
            sqlField = me.lookup('sqlField');

        sqlField.setValue(record.get('sql_sentence'));

        vm.set('currentQuery', record);
        vm.set('formIsValid', me.formIsValid())

    },

    clearQueryForm: function () {
        console.log('clearQueryForm()');
        var me = this,
            vm = me.getViewModel(),
            sqlField = me.lookup('sqlField');

        record = Ext.create('UserQuery.model.Query', {
            name: 'Unnamed Query',
            sql_sentence: '',
            // TODO adicionar informação do release selecionado.
            // release
        });

        vm.set('currentQuery', record);

        sqlField.setValue('');

        me.fireEvent('clearform', me);
    },

    formIsValid: function () {
        // console.log('formIsValid()')
        var me = this,
            isValid = me.isValid(),
            vm = me.getViewModel(),
            record = vm.get('currentQuery');

        if ((isValid) && (record.get('sql_sentence') !== '')) {
            return true;

        } else {
            return false
        }
    },

    checkSaveDisabled: function () {
        var me = this,
            vm = me.getViewModel(),
            record = vm.get('currentQuery'),
            btnSave = me.lookup('btnSave');

        console.log(record)
        if ((!me.formIsValid) || (!record.dirty)) {
            btnSave.disable();
        } else {
            btnSave.enable();
        }
    }

});