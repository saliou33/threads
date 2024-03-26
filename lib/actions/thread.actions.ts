"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const thread = await Thread.create({ text, author, community: null });

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: thread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  connectToDB();
  try {
    // Fetch the threads that does not have a parent(top level post)
    const offset = (pageNumber - 1) * pageSize;

    const query = Thread.find({ parendId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(offset)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id id name parentId image",
        },
      });

    const totatPostCount = await Thread.countDocuments({
      parendId: { $in: [null, undefined] },
    });

    const threads = await query.exec();

    const isNext = totatPostCount > offset + threads.length;

    return {
      threads,
      isNext,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch threads: ${error.message}`);
  }
}

// TODO: Populate community
export async function fetchThreadById(id: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Failed to fetch thread by id: ${error.message}`);
  }
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path,
}: {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
}) {
  connectToDB();

  try {
    // find the original thread
    const parentThread = await Thread.findById(threadId);

    if (!parentThread) {
      throw new Error("Thread not found");
    }

    // Create a new thread
    const comment = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // save the comment thread
    const commentThread = await comment.save();

    // save the parent thread
    parentThread.children.push(commentThread._id);

    await parentThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to thread: ${error.message}`);
  }
}
