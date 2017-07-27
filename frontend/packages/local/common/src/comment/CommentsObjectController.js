Ext.define('common.comment.CommentsObjectController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.comment-object',

    loadComments: function (catalog_id, object_id) {
        var me = this,
            // refs = me.getReferences(),
            // catalogPanel = refs.targetsCatalogPanel,
            view = me.getView(),
            vm = view.getViewModel(),
            store = vm.getStore('comments');
        
        vm.set('catalog_id', catalog_id);
        vm.set('object_id', object_id);

        store.filter([
            {
                property:'catalog_id',
                value: catalog_id
            },
            {
                property: 'object_id',
                value: object_id
            }
        ]);
    },

    onDeleteComment: function (item) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            comment = vm.get('currentcomment');

        Ext.MessageBox.confirm(
            'Confirm',
            'Are you sure you want to do that?',
            function (btn) {
                if (btn === 'yes') {
                    me.deleteComment(comment);
                }
            },
            this
        );
    },

    deleteComment: function (comment) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            store = vm.getStore('comments');
        
        view.setLoading(true);
        // Remover da store
        store.remove(comment);

        /*data: Object
            catalog_id: 74
            comments: "adasd"
            date: "2017-07-01 14:05"
            id: 21
            is_owner: true
            object_id: 3017197200
            owner: "admin"*/

        // Faz com que a store envie as alteracoes no caso um delete
        store.sync({
            success: function () {

                // Disparar evento de que houve mudanca nos comentarios
                view.fireEvent('changecomments', {type:'delete', comment:comment, total:store.data.items.length});
                view.setLoading(false);
            },
            failure: function (r, operation) {
                view.setLoading(false);
                // Recuperar a resposta e fazer o decode no json.
                var response = operation.request.proxy.reader.jsonData;
                if (response) {
                    // Exibe a msgBox de erro
                    Ext.Msg.alert('Status', response.msg);
                } else {
                    // Se nao tiver mensagem de erro ou retorno e
                    // por que e um erro do servidor.
                    Ext.MessageBox.show({
                        title: 'Server Side Failure',
                        msg: response.status + ' ' + response.statusText,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                }
            }
        });
    },

    onSaveComment: function (btn) {

        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            store = vm.getStore('comments');

        var currentcomment = vm.get('currentcomment');

        if (currentcomment.get('comments') != '') {
            view.setLoading(true);

            store.sync({
                success: function () {

                    store.commitChanges();

                    store.load({
                        callback: function () {

                            // Disparar evento de que houve mudanca nos comentarios
                            view.fireEvent('changecomments', {type:'delete', comment:currentcomment, total:store.data.items.length});
                            view.fireEvent('changecomments');
                        }
                    });

                    var model = Ext.create('common.model.CommentObject');
                    vm.set('currentcomment', model);

                    view.setLoading(false);
                },
                failure: function (response, opts) {
                    view.setLoading(false);
                    Ext.Msg.show({
                        title: 'Sorry',
                        msg: 'Was not possible to change the comment.',
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK
                    });
                    // Cancela as modificacoes na store
                    store.rejectChanges();
                }
            });
        }
    },

    onNewComment: function (comment) {

        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            store = vm.getStore('comments');

        var model = Ext.create('common.model.CommentObject', {
            catalog_id: vm.get('catalog_id'),
            object_id: vm.get('object_id'),
            is_owner: true,
            comments: comment,

            //FABIO, acrescentei a propriedade position, não salva
            //Mudança tbm no model/CommentsObject
            position_x:0, 
            position_y:1
        });

        store.insert(0, model);
        vm.set('currentcomment', model);

    }

});
