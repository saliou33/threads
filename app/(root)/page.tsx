import { fetchThreads } from "@/lib/actions/thread.actions";
import { UserButton, currentUser } from "@clerk/nextjs";
import ThreadCard from "@/components/cards/ThreadCard";
import Image from "next/image";
import { jsonify } from "@/lib/utils";

export default async function Home() {
  const user = await currentUser();
  const result = jsonify(await fetchThreads(1, 30));

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {result.threads.length === 0 ? (
          <p className="no-result">No Thread</p>
        ) : (
          <>
            {result.threads.map((thread: any) => (
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
            ))}
          </>
        )}
      </section>
    </>
  );
}
