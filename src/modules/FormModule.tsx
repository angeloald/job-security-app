import styles from "@/styles/Home.module.css";
import { Button, Checkbox, Input, Form } from "react-daisyui";
import { useState } from "react";
import { RawData } from "@/hooks/useAirtable";
import { saveAs } from "file-saver";

export const FormModule = ({ data }: { data: RawData }) => {
  const [name, setName] = useState(data?.rawProfile.name);
  const [email, setEmail] = useState(data?.rawProfile.email);
  const [tools, setTools] = useState<{ tool: string; checked: boolean }[]>(
    data?.rawSkills.tools.map((tool: string) => ({
      tool,
      checked: true,
    }))
  );
  const [skills, setSkills] = useState<{ skill: string; checked: boolean }[]>(
    data?.rawSkills.skills.map((skill: string) => ({
      skill,
      checked: true,
    }))
  );
  const [projects, setProjects] = useState(
    data?.rawProjects.map((project) => ({ ...project, checked: true }))
  );

  const [education, setEducation] = useState(
    data?.rawEducation.map((ed) => ({
      ...ed,
      checked: true,
    }))
  );

  const [experience, setExperience] = useState(
    data?.rawExperience.map((ex) => ({
      ...ex,
      checked: true,
    }))
  );

  const [jsonFileName, setJsonFileName] = useState("");

  const companies = new Set(experience.map((ex) => ex.Company));

  const handleUpdateTools = (checked: boolean, toolName: string) => {
    setTools(
      tools.map((d) => (d.tool === toolName ? { ...d, checked: checked } : d))
    );
  };

  const handleUpdateSkills = (checked: boolean, skillName: string) => {
    setSkills(
      skills.map((d) =>
        d.skill === skillName ? { ...d, checked: checked } : d
      )
    );
  };

  const handleUpdateProjects = (checked: boolean, projectName: string) => {
    setProjects(
      projects.map((d) =>
        d.name === projectName ? { ...d, checked: checked } : d
      )
    );
  };

  const handleUpdateEducation = (checked: boolean, institutionName: string) => {
    setEducation(
      education.map((d) =>
        d.institution === institutionName ? { ...d, checked: checked } : d
      )
    );
  };

  const handleUpdateExperience = (checked: boolean, experienceId: string) => {
    setExperience(
      experience.map((d) =>
        d.id === experienceId ? { ...d, checked: checked } : d
      )
    );
  };

  const generateJsonResume = () => {
    const _basics = {
      name,
      email,
    };
    const _education = education
      .filter(({ checked }) => checked)
      .map((ed) => ({
        area: ed.area,
        studyType: ed.studyType,
        startDate: ed.startDate,
        institution: ed.institution,
        endDate: ed.endDate,
      }));

    const _tools = tools
      .filter(({ checked }) => checked)
      .map((tool) => tool.tool);
    const _skills = skills
      .filter(({ checked }) => checked)
      .map((skill) => skill.skill);

    const _toolsAndSkills = [
      {
        keywords: _tools,
        name: "Tools",
      },
      {
        keywords: _skills,
        name: "Skills",
      },
    ];

    const _projects = projects
      .filter(({ checked }) => checked)
      .map((project) => ({
        url: project.url,
        keywords: [null],
        name: project.name,
        description: project.description,
      }));

    const _experienceObj = experience
      .filter(({ checked }) => checked)
      .reduce((acc, ex) => {
        acc[ex.Company] = {
          website: "",
          startDate: ex["Start Date"],
          endDate: ex["End Date"] || "Present",
          position: ex.Position,
          company: ex.Company,
          highlights: acc[ex.Company]?.highlights || [],
        };
        acc[ex.Company].highlights.push(ex.Achievement);
        return acc;
      }, {});
    const _experience = Object.keys(_experienceObj).map(
      (v) => _experienceObj[v]
    );

    const resumeJSON = {
      selectedTemplate: 1,
      headings: {
        work: "Professional Experience",
        skills: "Tools and Skills",
        awards: "",
        education: "Education",
        projects: "Projects",
      },
      basics: _basics,
      education: _education,
      work: _experience,
      skills: _toolsAndSkills,
      projects: _projects,
      awards: [
        {
          title: "",
          date: "",
          awarder: "",
          summary: "",
        },
      ],
      sections: [
        "templates",
        "profile",
        "work",
        "skills",
        "projects",
        "awards",
        "education",
      ],
    };

    const file = new Blob([JSON.stringify(resumeJSON)], {
      type: "application/json",
    });

    saveAs(file, jsonFileName.split(".json")[0] + ".json");
  };

  return (
    <div className={styles.form}>
      <div className={styles.personalInfo}>
        <p className={styles.labels}>Profile</p>
        <Input
          placeholder="Name"
          color="ghost"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Email"
          color="ghost"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className={styles.experience}>
        <p className={styles.labels}>EXPERIENCE</p>
        {[...companies].map((company: string) => (
          <div key={company}>
            <p>{company}</p>
            {experience
              .filter((ex) => ex.Company === company)
              .map((ex) => (
                <Form.Label key={ex.id} title={ex.Achievement}>
                  <Checkbox
                    checked={ex.checked}
                    onChange={(e) =>
                      handleUpdateExperience(e.target.checked, ex.id)
                    }
                  />
                </Form.Label>
              ))}
          </div>
        ))}
        <p className={styles.labels}>Tools</p>
        <Form className={styles.text}>
          {tools?.map(({ tool, checked }) => (
            <Form.Label title={tool} key={tool}>
              <Checkbox
                checked={checked}
                onChange={(e) => handleUpdateTools(e.target.checked, tool)}
              />
            </Form.Label>
          ))}
        </Form>
        <p className={styles.labels}>SKILLS</p>
        <Form className={styles.text}>
          {skills?.map(({ skill, checked }) => (
            <Form.Label title={skill} key={skill}>
              <Checkbox
                checked={checked}
                onChange={(e) => handleUpdateSkills(e.target.checked, skill)}
              />
            </Form.Label>
          ))}
        </Form>
        <p className={styles.labels}>PROJECTS</p>
        <Form className={styles.text}>
          {projects.map(({ checked, name, description }) => (
            <div key={name}>
              <Form.Label title={name} className="flex flex-col">
                <Checkbox
                  checked={checked}
                  onChange={(e) => handleUpdateProjects(e.target.checked, name)}
                />
              </Form.Label>
              <span className={styles.text}>{description}</span>
            </div>
          ))}
        </Form>
        <p className={styles.labels}>EDUCATION</p>
        <Form className={styles.text}>
          {education.map(
            ({ checked, area, endDate, institution, startDate, studyType }) => (
              <div key={institution}>
                <Form.Label title={institution} className="flex flex-col">
                  <Checkbox
                    checked={checked}
                    onChange={(e) =>
                      handleUpdateEducation(e.target.checked, institution)
                    }
                  />
                </Form.Label>
                <span className={styles.text}>{`${startDate}-${endDate}`}</span>
                <span className={styles.text}>{`${area} (${studyType})`}</span>
              </div>
            )
          )}
        </Form>
      </div>
      <div className={styles.submitButton}>
        <Input
          placeholder="Enter Filename"
          color="ghost"
          value={jsonFileName}
          onChange={(e) => setJsonFileName(e.target.value)}
        />
        <Button onClick={() => generateJsonResume()}>Submit</Button>
      </div>
    </div>
  );
};
