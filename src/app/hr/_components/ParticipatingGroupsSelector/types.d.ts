interface ParticipatingGroupConfig {
  passOutYear?: number;
  program?: string;
  minCgpa?: number;
  // minCredits?: number;
  backlog?: boolean;
  selected?: boolean; // <-- new field
}

interface JobOpeningGroupsSelectorProps {
  jobTypeId: string;
  value: ParticipatingGroupConfig[];
  onChange: (value: ParticipatingGroupConfig[]) => void;
}

type JobOpeningGroupCardProps = {
  index: number;
  group: ParticipatingGroupConfig;
  onDelete: () => void;
  onChange: (newGroup: ParticipatingGroupConfig) => void;
  allGroups: {
    [key: number]: string[];
  };
  disabled?: boolean;
};
