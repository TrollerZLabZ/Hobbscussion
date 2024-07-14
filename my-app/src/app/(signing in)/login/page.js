"use client"
// import { useRouter } from 'next/router';
import { permanentRedirect } from "next/navigation";

// Redirect to /home
export default function LoginPage() {
    // const router = useRouter();
    // router.push('/home');
    permanentRedirect('/');
}