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
  registrationStart: Date | null;
  registrationEnd: Date | null;
  hidden: boolean;
  autoApprove: boolean;
  autoVisible: boolean;
  allowSelected: boolean;
  participatingGroups: {
    passOutYear?: number;
    program?: string;
    minCgpa?: number;
    minCredits?: number;
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
