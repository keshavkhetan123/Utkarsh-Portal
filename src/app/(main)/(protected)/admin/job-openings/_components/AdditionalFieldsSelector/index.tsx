// import React, { useRef } from "react";
// import {
//   Button,
//   IconButton,
//   Paper,
//   Stack,
//   Typography,
// } from "@mui/material";
// import UploadFileIcon from "@mui/icons-material/UploadFile";
// import DeleteIcon from "@mui/icons-material/Delete";


// interface FileSelectorProps {
//   value: File[];
//   onChange: (files: File[]) => void;
// }

// export default function AdditionalFieldSelector(props: FileSelectorProps) {
//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files);
//       props.onChange([...props.value, ...newFiles]);
//     }
//   };

//   const handleRemove = (index: number) => {
//     const updatedFiles = props.value.filter((_, i) => i !== index);
//     props.onChange(updatedFiles);
//   };

//   return (
//     <Paper className="flex flex-col gap-4 pt-2 px-3 pb-3">
//       <Typography variant="subtitle1">Attach Files (Images or PDFs):</Typography>

//       <input
//         type="file"
//         accept="image/*,.pdf"
//         multiple
//         hidden
//         ref={inputRef}
//         onChange={handleFileChange}
//       />

//       <Button
//         variant="outlined"
//         startIcon={<UploadFileIcon />}
//         onClick={() => inputRef.current?.click()}
//       >
//         Upload Files
//       </Button>

//       <Stack spacing={1}>
//         {props.value.map((file, index) => (
//           <Paper
//             key={index}
//             variant="outlined"
//             className="flex items-center justify-between px-2 py-1"
//           >
//             <Typography variant="body2" noWrap maxWidth="80%">
//               {file.name}
//             </Typography>
//             <IconButton
//               size="small"
//               color="error"
//               onClick={() => handleRemove(index)}
//             >
//               <DeleteIcon fontSize="small" />
//             </IconButton>
//           </Paper>
//         ))}
//       </Stack>
//     </Paper>
//   );
// }



"use client";

import React, { useRef, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Stack,
  Paper,
  CircularProgress,
  IconButton,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "~/trpc/react";

interface FileSelectorProps {
  value: File[];
  onChange: (files: File[]) => void;
}

function AdditionalFieldSelector(props: FileSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      props.onChange([...props.value, ...newFiles]);
    }
  };

  const handleRemove = (index: number) => {
    const updatedFiles = props.value.filter((_, i) => i !== index);
    props.onChange(updatedFiles);
  };

  return (
    // <Paper className="flex flex-col gap-4 pt-2 px-3 pb-3 w-full">
    <Paper className="flex flex-col gap-4 pt-2 px-4 pb-4 w-full">
      <Typography variant="subtitle1">Attach Files (Images or PDFs):</Typography>

      <input
        type="file"
        accept="image/*,.pdf"
        multiple
        hidden
        ref={inputRef}
        onChange={handleFileChange}
      />

      <Button
        variant="outlined"
        startIcon={<UploadFileIcon />}
        onClick={() => inputRef.current?.click()}
         className="w-full"
      >
        Upload Files
      </Button>

      <Stack spacing={1}>
        {props.value.map((file, index) => (
          <Paper
            key={index}
            variant="outlined"
            className=" w-full px6 "
          >
            <Typography variant="body2" noWrap maxWidth="80%">
              {file.name}
            </Typography>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRemove(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}

export default function JobOpeningForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);

  const createJob = api.jobs.createJob.useMutation({
    onSuccess: () => {
      alert("Job opening posted successfully!");
      setTitle("");
      setDescription("");
      setFiles([]);
      setFileUrls([]);
    },
    onError: (err) => {
      alert(err.message || "Something went wrong");
    },
  });

  const uploadJobFile = api.jobs.uploadJobFile.useMutation();

  const handleSubmit = async () => {
    try {
      const urls: string[] = [];

      for (const file of files) {
        const reader = new FileReader();
        const dataUrl: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const key = `jobFile_${Date.now()}_${file.name}`;
        const res = await uploadJobFile.mutateAsync({
          key,
          fileDataUrl: dataUrl,
        });

        urls.push(res.url); // assuming `res.url` is a public link to access the file
      }

      setFileUrls(urls);

      createJob.mutate({
        title,
        description,
        attachments: urls,
      });
    } catch (err) {
      console.error("Error uploading files", err);
      alert("Failed to upload files.");
    }
  };

  return (
    <Stack spacing={3} className="p-6  mx-auto w-full">
      {/* <Typography variant="h4">Post a Job Opening</Typography>

      <TextField
        label="Job Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={4}
      /> */}

      <AdditionalFieldSelector value={files} onChange={setFiles} />

      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={createJob.isLoading || uploadJobFile.isLoading}
      >
        {createJob.isLoading || uploadJobFile.isLoading ? (
          <CircularProgress size={24} />
        ) : (
          "Submit Job Opening"
        )}
      </Button> */}

      {fileUrls.length > 0 && (
        <Paper className="p-4 mt-4 w-full">
          <Typography variant="h6">Uploaded Files:</Typography>
          <Stack spacing={1} mt={1}>
            {fileUrls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View File {idx + 1}
              </a>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
