import { fetchUser, fetchUsers, getActivity } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo.onboarded) redirect("/onboarding");

  // get activities
  const activity = await getActivity(userInfo._id);

  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>

      <div className="mt-10 flex flex-col gap-5">
        {activity.length > 0 ? (
          <>
            {activity.map((thread) => (
              <Link key={thread._id} href={`/thread/${thread.parentId}`}>
                <article className="activity">
                  <Image
                    src={thread.author.image}
                    alt="Profile picture"
                    width={20}
                    height={20}
                    className="object-contain rounded-full"
                  />

                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">
                      {thread.author.name}
                    </span>{" "}
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3 ">No activity yet</p>
        )}
      </div>
    </section>
  );
}

export default Page;
