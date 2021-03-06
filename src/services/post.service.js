const { Op } = require('sequelize');

const { BlogPost, PostCategory, Category } = require('../database/models');

const {
  CATEGORY_ID_NOT_FOUND,
  POST_NOT_FOUND,
  UNAUTHORIZED_USER,
  USER_MODEL,
  CATEGORY_MODEL,
} = require('../utils/constants');

const checkIdsOnDb = async (categoryIds) => {
  const isIdRegistered = Promise.all(categoryIds.map((el) => 
    Category.findAll({
      where: { id: el },
    })));
  return isIdRegistered;
};

const verifyIdLength = async (categoryIds) => {
  const isIdRegistered = await checkIdsOnDb(categoryIds);
  return isIdRegistered.map((el) => el.length);
};

const createdPost = async (title, content, categoryIds, user) => {
  const post = await BlogPost.create({
    title,
    content,
    userId: user.userId,
  });

  Promise.all(categoryIds.map((el) =>
    PostCategory.create({
      categoryId: el,
      postId: post.dataValues.id,
    })));

  return {
    id: post.dataValues.id,
    title,
    content,
    userId: user.userId,
    updated: post.dataValues.updated,
    published: post.dataValues.updated,
  };
};

const setPost = async (title, content, categoryIds, user) => {
  const isIdRegisteredTest = await verifyIdLength(categoryIds);
  if (isIdRegisteredTest.includes(0)) return CATEGORY_ID_NOT_FOUND;

  return createdPost(title, content, categoryIds, user);
};

const getPosts = () => BlogPost.findAll({
  include: [USER_MODEL, CATEGORY_MODEL],
});

const getPostById = async (id) => {
  const post = await BlogPost.findByPk(id, {
    include: [USER_MODEL, CATEGORY_MODEL],
  });
  if (post === null) return POST_NOT_FOUND;
  return post;
};

const editPost = async (userId, title, content, postId) => {
  const post = await BlogPost.findByPk(postId);
  if (post.dataValues.userId !== userId.userId) {
    return UNAUTHORIZED_USER;
  }
  await BlogPost.update({ title, content }, { where: { userId: userId.userId } });
  const editedPost = await getPostById(postId);
  return editedPost;
};

const deletePost = async (postId, userId) => {
  const post = await BlogPost.findByPk(postId);
  if (post === null) return POST_NOT_FOUND;
  if (post.dataValues.userId !== userId.userId) return UNAUTHORIZED_USER;

  await BlogPost.destroy({ where: { id: postId } });
};

const getPostByTerm = async (query) => {
  if (query === '') return getPosts();
  const searchedPost = await BlogPost.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { content: { [Op.like]: `%${query}%` } },
      ],
    },
    include: [USER_MODEL, CATEGORY_MODEL],
  });
  return searchedPost;
};

module.exports = {
  setPost,
  getPosts,
  getPostById,
  editPost,
  deletePost,
  getPostByTerm,
};