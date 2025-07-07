import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
  
  // This part won't be rendered due to the redirect
}
