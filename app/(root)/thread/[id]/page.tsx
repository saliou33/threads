import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { jsonify } from "@/lib/utils";
import Comment from "@/components/forms/Comment";

export default async function Page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();

  if (!user) return null;

  const userInfo = jsonify(await fetchUser(user.id));
  if (!userInfo.onboarded) redirect("/onboarding");

  const thread = jsonify(await fetchThreadById(params.id));

  return (
    <section className="relative">
      <ThreadCard
        key={thread._id}
        id={thread._id}
        currentUserId={user?.id as string}
        parentId={thread.parentId}
        content={thread.text}
        author={thread.author}
        createdAt={thread.createdAt}
        comments={thread.children}
        community={thread.community}
      />

      <div className="mt-7">
        <Comment
          threadId={thread._id}
          currentUserImg={userInfo.image}
          currentUserId={userInfo._id}
        />
      </div>

      <div className="mt-10">
        {thread.children.map((child: any) => (
          <ThreadCard
            key={child._id}
            id={child._id}
            currentUserId={user?.id as string}
            parentId={child.parentId}
            content={child.text}
            author={child.author}
            createdAt={child.createdAt}
            comments={child.children}
            community={child.community}
            isComment
          />
        ))}
      </div>
    </section>
  );
}
