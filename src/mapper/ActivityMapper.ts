import { Users } from "../models/users";
import { ActivityAttributes } from "../models/activities";
import { Feedback } from "../models/feedback";
import { feedbackMapper } from "./FeedbackMapper";

export const mappedActivities = (activities: ActivityAttributes[]) => {
  const result = activities.map(async (activity) => {
    const {
      id,
      name,
      description,
      image,
      location,
      num_of_volunteers,
      status,
      created_at,
      updated_at,
      creator: creatorId,
    } = activity;
    try {
      const creator = await Users.findByPk(creatorId);
      const creatorName = creator ? creator.name : null;
      const feedbacks = await Feedback.findAll({ where: { activity_id: id } });
      const mappedFeedbacks = await feedbackMapper(feedbacks);
      return {
        id,
        name,
        description,
        image,
        location,
        num_of_volunteers,
        status,
        created_at,
        updated_at,
        creator: creatorId,
        feedback: mappedFeedbacks,
      };
    } catch (error) {
      console.error("Error fetching creator:", error);
      return null;
    }
  });
  return result.filter((activity) => activity !== null);
};