import { permanentRedirect } from 'next/navigation'

export default function Page() {
//   redirect to /home
    permanentRedirect('/home')
}