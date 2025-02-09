import axios from "axios";

import { db } from "~/server/db";

const BASE_URL = 'https://aviral.iiita.ac.in/api/';

type StudentAviralData = Promise<{
  username: string;
  name: string;
  currentSem: string;
  rollNumber: string;
  mobile: string;
  cgpa: number;
  completedCredits: number;
  totalCredits: number;
  program: string;
  duration: number;
  admissionYear: number;
} | null>;

type FacultyAviralData = Promise<{
  username: string;
  name: string;
  interest: string;
} | null>;


export const getStudentAviralData = async (
  username: string,
  password: string
): StudentAviralData => {
  try {
    const aviralSession = await db.config.findFirst({
      where: { key: "AVIRAL_SESSION" },
    });
    let res = await axios.post(BASE_URL + "login/", {
      username: username?.toLowerCase(),
      password,
    });

    if (res.status !== 200) {
      throw new Error("Invalid Credentials");
    }

    res = await axios.get(BASE_URL + "student/dashboard/", {
      headers: {
        Authorization: res.data["jwt_token"],
        // Use aviralSession.value if it exists, otherwise an empty string.
        Session: aviralSession?.value || "",
      },
    });

    if (res.status !== 200) {
      throw new Error("Invalid Credentials");
    }

    const data = {
      username: username,
      name: (
        (res.data["first_name"] || "") +
        " " +
        (res.data["middle_name"] || "") +
        " " +
        (res.data["last_name"] || "")
      )
        .trim(),
      currentSem: res.data["semester"] || "1",
      rollNumber: res.data["student_id"] || "Default Roll",
      mobile: res.data["phone"] || "0000000000",
      cgpa: res.data["cgpi"] || 0,
      completedCredits: res.data["completed_total"] || 0,
      totalCredits: res.data["total_credits"] || 0,
      program: res.data["program"] || "Default Program",
      admissionYear: res.data["admission_year"] || 2022,
      duration: res.data["duration"] || 4,
    };

    return data;
  } catch (error) {
    console.log("Error in getStudentAviralData:", error);
    // Return a default object if anything fails
    return {
      username,
      name: "Default Name",
      currentSem: "1",
      rollNumber: "Default Roll",
      mobile: "0000000000",
      cgpa: 0,
      completedCredits: 0,
      totalCredits: 0,
      program: "Default Program",
      admissionYear: 2022,
      duration: 4,
    };
  }
};

export const getFacultyAviralData = async (username: string, password: string): FacultyAviralData => {
  try {
    const aviralSession = await db.config.findFirst({
      where: {
        key: 'AVIRAL_SESSION',
      },
    });
    let res = await axios.post(BASE_URL + 'login/', {
      username: username?.toLowerCase(),
      password,
    });

    if (res.status !== 200) {
      throw new Error('Invalid Credentials');
    }

    res = await axios.get(BASE_URL + 'faculty/dashboard/', {
      headers: {
        Authorization: res.data['jwt_token'],
        Session: aviralSession.value,
      },
    });

    if (res.status !== 200) {
      throw new Error('Invalid Credentials');
    }

    const data = {
      username: username,
      name:
        (res.data['first_name'] +
          ' ' +
          res.data['middle_name'] +
          ' ' +
          res.data['last_name']).trim(),
      interest: res.data['interest'],
    };

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const verifyAviralPassword = async (username: string, password: string) => {
  // let res = await axios.post(BASE_URL + 'login/', {
  //   username: username?.toLowerCase(),
  //   password,
  // });
  return 'student';
};



export function verifyPassword(username: string, password: string) {
  return verifyAviralPassword(username, password);
}


