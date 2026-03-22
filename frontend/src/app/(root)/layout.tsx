import { Sidebar } from "@/components/Sidebar";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className='h-screen bg-white flex overflow-hidden'> {/* Add overflow-hidden */}
            <Sidebar/>
            <main className="flex-1 w-full overflow-y-auto"> {/* Wrap children */}
                {children}
            </main>
        </div>
    )
}