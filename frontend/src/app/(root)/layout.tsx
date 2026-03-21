import { Sidebar } from '@/components/Sidebar';
import React from 'react'

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className='h-screen bg-white flex'>
            <Sidebar/>
            {children}
        </div>
    )
}