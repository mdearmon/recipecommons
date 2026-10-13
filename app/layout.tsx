import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Recipe Commons — A place for good recipes',description:'Discover recipes. Build your collection. Cook for your crowd.',icons:{icon:'/brand/bear-icon.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
