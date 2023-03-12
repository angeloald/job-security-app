import Airtable from "Airtable";
import useSWR from "swr";

export const useAirtable = (
  isFetching: boolean,
  baseId: string,
  apiKey: string
) => {
  let fetcher = undefined;

  if (isFetching) {
    const table = new Airtable({ apiKey }).base(baseId);
    const getProfile = async (): Promise<Profile> => {
      const rows = await table("Profile").select().firstPage();
      const result = rows
        .map((row) => [row.get("Title"), row.get("Value")])
        .reduce((result, row) => {
          result[row[0]] = row[1];
          return result;
        }, {}) as Profile;

      return result;
    };

    const getEducation = async (): Promise<Education[]> => {
      const rows = await table("Education").select().firstPage();
      return rows.map((row) => ({
        institution: row.get("Institution"),
        area: row.get("Program"),
        studyType: row.get("Credential Type"),
        startDate: row.get("Start Date"),
        endDate: row.get("End Date"),
      })) as Education[];
    };

    const getToolsAndSkills = async (): Promise<ToolsAndSkills> => {
      const rows = await table("Tools and Skills").select().firstPage();
      const result = rows
        .map((row) => [row.get("Title"), row.get("Value")])
        .reduce((result, row) => {
          result[row[0]] = row[1].split(", ");
          return result;
        }, {}) as Profile;

      return result as unknown as ToolsAndSkills;
    };

    const getProjects = async (): Promise<Project[]> => {
      const rows = await table("Projects").select().firstPage();
      return rows.map((row) => ({
        name: row.get("Name"),
        description: row.get("Description"),
        url: row.get("URL"),
      })) as Project[];
    };

    const getExperience = async (): Promise<RawExperience[]> => {
      const rows = await table("Experience").select().firstPage();

      return rows.map((row) => ({
        ...row.fields,
        id: row.id,
      })) as RawExperience[];
    };

    fetcher = async () => {
      const [profile, education, toolsAndSkills, projects, experience] =
        await Promise.all([
          getProfile(),
          getEducation(),
          getToolsAndSkills(),
          getProjects(),
          getExperience(),
        ]);
      return {
        rawProfile: profile,
        rawEducation: education,
        rawSkills: toolsAndSkills,
        rawProjects: projects,
        rawExperience: experience,
      };
    };
  }

  return useSWR(isFetching ? "/api/resume" : null, fetcher);
};

export type Profile = {
  name: string;
  email: string;
};

export type Education = {
  area: string;
  studyType: string;
  startDate: string;
  institution: string;
  endDate: string;
};

export type ToolsAndSkills = [
  {
    keywords: string[];
    name: "Tools";
  },
  {
    keywords: string[];
    name: "Skills";
  }
];

export type Project = {
  url: string;
  name: string;
  description: string;
};

export type RawExperience = {
  Achievement: string;
  Company: string;
  Date: string;
  StartDate: string;
  EndDate?: string;
  Position: string;
  id: string;
};

export type RawData = {
  rawProfile: Profile;
  rawEducation: Education[];
  rawSkills: ToolsAndSkills;
  rawProjects: Project[];
  rawExperience: RawExperience[];
};

type Experience = {
  highlights: string[];
  startDate: string;
  endDate: string;
  position: string;
  company: string;
};
