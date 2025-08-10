import React, {ReactNode} from "react";

export default function RootLayout({
                                       children
                                   }: Readonly<{
    children: ReactNode
}>) {
    return (
        <div className="h-full bg-white">
            <div className="h-full">
                {children}
            </div>
        </div>
    )
}