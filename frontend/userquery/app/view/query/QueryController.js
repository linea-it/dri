Ext.define('UserQuery.view.query.QueryController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.query',

    listen: {
        component: {
            'userquery-query-form': {}
        },
    },


    onChangeSqlField: function (field) {
        var me = this,
            vm = me.getViewModel(),
            record = vm.get('currentQuery');

        record.set('sql_sentence', field.getValue());

        vm.set('currentQuery', record);
        console.log(record)

        me.onFieldChange(field);
    },

    onFieldChange: function (field) {
        console.log('onFieldChange(%o)', field)
        var me = this,
            view = me.getView(),
            vm = me.getViewModel();

        // vm.set('formIsValid', view.formIsValid());

        view.checkSaveDisabled();
    },

    onClickBtnClear: function (btn) {
        // console.log('onClickBtnClear()');

        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            record = vm.get('currentQuery');

        // Verificar se houve alguma mudança na query
        if (record.dirty) {
            // Se a query foi alterada exibir uma janela de confirmação
            // antes de apagar o formulário.
            Ext.MessageBox.show({
                title: 'Alert',
                msg: 'The current query will overwrite, do you want to continue?',
                buttons: Ext.Msg.YESNO,
                icon: Ext.MessageBox.WARNING,
                fn: function (button) {
                    if (button == 'yes') {
                        view.clearQueryForm()
                    }
                }
            });
        } else {
            // A query não foi alterada apaga o formulário sem perguntar.
            view.clearQueryForm()
        }
    },

    onClickBtnSave: function (btn) {
        // console.log('onClickBtnSave()');
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            record = vm.get('currentQuery');

        if (view.formIsValid()) {
            view.fireEvent('savequery', record, view);
        }

    },

    onClickBtnCheck: function (btn) {
        // console.log('onClickBtnCheck()');
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            record = vm.get('currentQuery');

        if ((record.get('sql_sentence')) && (record.get('sql_sentence') !== '')) {

            view.fireEvent('checkquery', record, view);
        }
    },

    onClickBtnPreview: function (btn) {
        console.log('onClickBtnPreview()');
        var me = this,
            vm = this.getViewModel();

        console.log('Form is Valid: %o', vm.get('formIsValid'))

        console.log('Record is Changed: %o', vm.get('currentQuery').dirty)

        console.log('saveDisabled: %o', vm.get('saveDisabled'))

    },

    onClickBtnExecute: function (btn) {
        console.log('onClickBtnExecute()');
    },


});