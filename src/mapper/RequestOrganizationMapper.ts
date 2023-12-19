import { OrganizationRequestAttributes } from "../models/organization_request";
import { Organization } from "../models/organization";
import { Users } from "../models/users";

export const requestOrganizationMapper = async (
  requestOrganizations: OrganizationRequestAttributes[]
) => {
  const result = await Promise.all(
    requestOrganizations.map(async (request) => {
      const { id, user_id, organization_id, status, created_at, updated_at } =
        request;
      try {
        const user = await Users.findByPk(user_id);
        const organizer = await Organization.findByPk(organization_id);

        const userName = user ? user.name : null;
        const organizerName = organizer ? organizer.name : null;
        const organizerDescription = organizer ? organizer.description : null;
        const organizerLocation = organizer ? organizer.location : null;

        return {
          id,
          user: {
            id: user_id,
            name: userName,
          },
          organizer: {
            id: organization_id,
            name: organizerName,
            description: organizerDescription,
            location: organizerLocation,
          },
          status,
          created_at,
          updated_at,
        };
      } catch (error) {
        console.error("Error fetching user or organizer:", error);
        return null;
      }
    })
  );

  return result.filter((request) => request !== null);
};