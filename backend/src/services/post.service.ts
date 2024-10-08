import { errorMessages } from '../utils/constants';
import PostModel, { IPost } from '../models/Post';
import isPostFormDataValid from '../utils/isPostFormDataValid';
import logger from '../utils/logger';
import path from 'path';

export interface CreatePostParams {
  userName: string;
  book: {
    title: string;
    authors: string;
    image: string;
  };
  title: string;
  rating: number;
  description: string;
  image?: string;
}

export async function getAllPosts(): Promise<IPost[]> {
  try {
    const posts = await PostModel.find().exec();
    return posts;
  } catch (error) {
    logger.error(`Error getting all posts: ${error}`);
    throw new Error(errorMessages.FAILED_TO_GET_ALL_POSTS);
  }
}

export async function getPostById(postId: string): Promise<IPost | null> {
  try {
    const post = await PostModel.findById(postId).exec();
    return post;
  } catch (error) {
    logger.error(`Error getting post by identifier: ${error}`);
    throw new Error(errorMessages.FAILED_TO_GET_POST_BY_ID);
  }
}

export async function getPostsByUserName(userName: string): Promise<IPost[]> {
  try {
    const posts = await PostModel.find({ userName }).exec();
    if (posts.length === 0) {
      return [];
    }
    return posts;
  } catch (error) {
    console.error('Error fetching posts by user:', error);
    throw new Error('Error fetching posts by user');
  }
}

export async function createPost(postData: CreatePostParams): Promise<IPost> {
  if (
    await PostModel.findOne({
      userName: postData.userName,
      title: postData.title,
    })
  ) {
    throw new Error(errorMessages.POST_ALREADY_EXISTS);
  }
  // console.log('postData', postData);
  if (!isPostFormDataValid(postData)) {
    throw new Error(errorMessages.INVALID_FORM_DATA);
  }

  try {
    const newPost = new PostModel({
      userName: postData.userName,
      book: postData.book,
      title: postData.title,
      comments: [],
      review: {
        rating: postData.rating,
        description: postData.description,
      },
      image: postData.image,
    });

    return await newPost.save();
  } catch (err) {
    console.log('err', err);
    throw new Error(
      'Error creating post ' + errorMessages.FAILED_TO_CREATE_POST
    );
  }
}

export async function updatePost(postId: string, updatedPost: any) {
  const updated = await PostModel.findByIdAndUpdate(postId, updatedPost, {
    new: true,
  }).exec();
  return updated;
}

export async function deletePost(postId: string): Promise<boolean> {
  try {
    const deletePostResult = await PostModel.deleteOne({ _id: postId });
    if (deletePostResult.deletedCount === 0) {
      return false;
    }
    return true;
  } catch (error) {
    logger.error(`Error deleting post: ${error}`);
    throw new Error(errorMessages.FAILED_TO_DELETE_POST);
  }
}

export async function addComment(
  postId: string,
  comment: any
): Promise<IPost | null> {
  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      return null;
    }
    post.comments.push(comment);
    const updatedPost = await post.save();
    return updatedPost;
  } catch (error) {
    logger.error(`Error adding comment: ${error}`);
    throw new Error('Error adding comment');
  }
}
