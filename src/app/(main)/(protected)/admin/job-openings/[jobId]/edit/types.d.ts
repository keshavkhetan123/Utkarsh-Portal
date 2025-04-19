interface NewJobOpening {
  title: string;
  description: string;
  location: string;
  role: string;
  pay: string;
  payNumeric: number;
  empBenefits: string;
  company: {
    name: string;
    domain: string;
    logo: string;
  } | null;
  jobType: string | null;
  registrationStart: Dayjs | null;
  registrationEnd: Dayjs | null;
  hidden: boolean;
  autoApprove: boolean;
  autoVisible: boolean;
  allowedJobTypes: string[];
  participatingGroups: {
    passOutYear?: number;
    program?: string;
    minCgpa?: number;
    // minCredits?: number;
    backlog?: boolean;
  }[];
}

type Company = {
  name: string;
  website: string;
  logo: string;
};

type JobOpening = {
  placementType: {
    name: string;
  };
  company: Company;
  title: string;
  id: string;
  location: string;
  role: string;
  pay: string;
  registrationStart: Date;
  registrationEnd: Date;
};
