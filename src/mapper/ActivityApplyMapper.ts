import { ActivityApplyAttributes } from "../models/activity_apply";
import { Users } from "../models/users";

export const activityApplyMapper = async (
  activityApplies: ActivityApplyAttributes[]
) => {
  const result = await Promise.all(
    activityApplies.map(async (activityApply) => {
      const { id, user_id, status, created_at, updated_at } =
        activityApply;

      try {
        const user = await Users.findByPk(user_id);
        const userName = user ? user.name : null;
        const userAvatar = user ? user.avatar : null;

        return {
          id,
          name: userName,
          avatar: userAvatar,
          status,
          created_at,
          updated_at,
        };
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    })
  );

  return result.filter((organization) => organization !== null);
};
