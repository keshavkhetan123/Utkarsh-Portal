import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

type StudentAviralData = Promise<{
  username: string;
  randomPassword: string;
  name: string;
  currentSem: string;
  cgpa: number;
  program: string;
  passOutYear: number;
  backlog: boolean;
} | null>;

const CSV_FILE_PATH = path.join(process.cwd(), "src/server/utils/student_data.csv");

let cachedStudents: Record<string, any>[] | null = null;

async function loadStudentCSVData(): Promise<Record<string, any>[]> {
  if (cachedStudents) return cachedStudents;

  const fileContent = fs.readFileSync(CSV_FILE_PATH, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  cachedStudents = records;
  return records;
}

export const getStudentAviralData = async (
  username: string,
  password: string
): StudentAviralData => {
  try {
    const students = await loadStudentCSVData();
    const student = students.find(
      (s) => s.username.toLowerCase() === username.toLowerCase() && password === '1111'
    );

    if (!student) return null;

    return {
      username: student.username,
      randomPassword: student.randomPassword,
      name: student.name,
      currentSem: student.currentSemester,
      cgpa: parseFloat(student.CGPA),
      program: student.program,
      passOutYear: parseInt(student.passOutYear),
      backlog: student.Backlog.toLowerCase() === "true",
    };
  } catch (error) {
    console.error("Error in getStudentAviralData:", error);
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


