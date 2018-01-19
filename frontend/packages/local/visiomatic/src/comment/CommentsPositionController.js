Ext.define('visiomatic.comment.CommentsPositionController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.comment-position',

    loadComments: function (event, dataset) {
        var vm = this.getView().getViewModel(),
            storeComments = vm.getStore('comments'),
            targetPosition = event.targetPosition,
            lat = targetPosition ? targetPosition.lat : event.latlng.lat,
            lng = targetPosition ? targetPosition.lng : event.latlng.lng;
        
        vm.set('pst_dataset', dataset.id);
        vm.set('pst_dec',     lat);
        vm.set('pst_ra',      lng);
        
        storeComments.filter([
            /*{
                property: 'pst_dataset',
                value: dataset.id
            },*/
            {
                property: 'coordinates',
                value: '[['+ lng + ',' + lat+ '],['+ lng + ',' + lat+ ']]'
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

        // Faz com que a store envie as alteracoes no caso um delete
        store.sync({
            success: function () {

                // Disparar evento de que houve mudanca nos comentarios
                comment.isCommentPosition = true;
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
        var me    = this,
            view  = me.getView(),
            vm    = view.getViewModel(),
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
                            currentcomment.isCommentPosition = true;
                            view.fireEvent('changecomments', {type:'delete', comment:currentcomment, total:store.data.items.length});
                            //view.fireEvent('changecomments');
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
        var vm = this.getView().getViewModel(),
            store = vm.getStore('comments');

        var model = Ext.create('common.model.CommentPosition', {
            pst_ra: vm.get('pst_ra'),
            pst_dec: vm.get('pst_dec'),
            pst_comment: comment,
            pst_dataset: vm.get('pst_dataset')
        });

        store.insert(0, model);
        vm.set('currentcomment', model);
    }

});
