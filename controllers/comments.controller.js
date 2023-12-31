const { checkArticleIdExists } = require("../models/articles-model");
const {
  selectCommentsByArticleId,
  insertNewComment,
  removeCommentById,
  checkCommentIdExists,
  updateCommentVotes,
} = require("../models/comments-model");

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;

  checkArticleIdExists(article_id)
    .then(() => {
      return selectCommentsByArticleId(article_id);
    })
    .then((comments) => {
      return res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;

  return insertNewComment(article_id, newComment)
    .then((postedComment) => {
      return res.status(201).send({ postedComment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;

  checkCommentIdExists(comment_id)
    .then(() => {
      return removeCommentById(comment_id);
    })
    .then(() => {
      return res.status(204).send();
    })
    .catch(next);
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  checkCommentIdExists(comment_id)
    .then(() => {
      return updateCommentVotes(inc_votes, comment_id);
    })
    .then((updatedComment) => {
      return res.status(200).send({ updatedComment });
    })
    .catch(next);
};
