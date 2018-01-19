/**
 *
 */
Ext.define('common.comment.CommentsObjectModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.comment-object',

    requires: [
        'common.store.CommentsObjects',
        'common.model.CommentObject'
    ],

    data: {
        catalog_id: null,
        object_id: null
    },

    stores: {
        comments: {
            type: 'comments-objects'
        }
    },

    links: {
        currentcomment: {
            type: 'common.model.CommentObject',
            create: true
        }
    }
});
