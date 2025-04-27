'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button} from "@mui/material";
export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const router = useRouter();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Authentication Error</h1>
      <p>{error ? decodeURIComponent(error) : "An unexpected error occurred."}</p>

      <Button onClick={() => router.push('/login')} style={{ marginTop: '1rem' }}>
        Back to Login
      </Button>
    </div>
  );
}
