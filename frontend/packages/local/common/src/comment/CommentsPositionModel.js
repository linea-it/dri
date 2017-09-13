/**
 *
 */         
Ext.define('common.comment.CommentsPositionModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.comment-position',

    requires: [
        'common.store.CommentsPosition',
        'common.model.CommentPosition'
    ],

    data: {
        catalog_id: null,
        //object_id: null,
        coordinates: null
    },

    stores: {
        comments: {
            type: 'comments-position'
        }
    },

    links: {
        currentcomment: {
            type: 'common.model.CommentPosition',
            create: true
        }
    }
});
