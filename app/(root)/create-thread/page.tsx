import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { jsonify } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = jsonify(await fetchUser(user.id));

  if (!userInfo.onboarded) redirect("/onboarding");

  return (
    <>
      <h1 className="head-text">Create Thread</h1>;
      <PostThread userId={userInfo._id} />
    </>
  );
}
