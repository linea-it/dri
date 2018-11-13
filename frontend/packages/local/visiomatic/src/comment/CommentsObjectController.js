Ext.define('common.comment.CommentsObjectController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.comment-object',

    loadComments: function (catalog_id, object_id) {
        // console.log('loadComments(%o, %o)', catalog_id, object_id);
        var me = this,
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

    onNewComment: function () {
        // console.log('onNewComment')
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            store = vm.getStore('comments'),
            txtComment = me.lookup('txtComment'),
            value = txtComment.getValue(),
            newComment;

        if (value) {
            newComment = Ext.create('common.model.CommentObject', {
                catalog_id: vm.get('catalog_id'),
                object_id: vm.get('object_id'),
                comments: value,
            })

            txtComment.reset();

            store.add(newComment);

            me.applyChanges();
        }
    },

    onTxtCommentPressKey: function ( o, event){
        // console.log('onTxtCommentPressKey')
        var me = this,
            txtComment = me.lookup('txtComment');

        if (event.keyCode==13){
            // On Press Enter
            me.onNewComment();

        } else if (event.keyCode==27){
            // On Press Esc
            txtComment.reset();
        }
    },

    onClickUpdateComment: function (menuItem) {
        // console.log('onUpdateComment()');
        var me = this,
            grid = me.lookup('GridComments'),
            rowEditing = grid.findPlugin('rowediting'),
            button = menuItem.up('button'),
            record = button.getWidgetRecord();

        // Por default a primeira coluna e aberta para edicao.
        rowEditing.startEdit(record)
    },

    updateComment: function(editor, context){
        // console.log('updateComment(%o, %o)', editor, context);
        var me = this,
            record = context.record;

        record.set('comments', context.newValues['comments']);

        me.applyChanges();
    },

    onClickDeleteComment: function (menuItem) {
        // console.log('onDeleteComment(%o)', menuItem);
        var me = this,
            button = menuItem.up('button');
            record = button.getWidgetRecord();

        Ext.MessageBox.confirm(
            'Confirm',
            'Are you sure you want to do that?',
            function (btn) {
                if (btn === 'yes') {
                    me.deleteComment(record);
                }
            },
            me
        );
    },

    deleteComment: function (record) {
        //console.log('deleteComment(%o)', record);
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('comments');

        store.remove(record);

        me.applyChanges();
    },

    applyChanges: function () {
        // console.log('applyChanges()')
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            store = vm.getStore('comments');

        view.setLoading(true);

        store.sync({
            success: function () {
                store.load();

            },
            failure: function () {
                store.rejectChanges();
                me.onFailure();

            },
            callback: function () {
                view.setLoading(false);

                view.fireEvent('changecomments', store, view)
            }
        })
    },

    onFailure: function () {
        Ext.Msg.show({
            title: 'Sorry',
            msg: 'There was a problem and it was not possible to ' +
            'create the new record, please try again in a few ' +
            'moments. If the problem persists please notify us via'+
            ' the help desk.',
            icon: Ext.Msg.WARNING,
            buttons: Ext.Msg.OK
        });
    }
});
