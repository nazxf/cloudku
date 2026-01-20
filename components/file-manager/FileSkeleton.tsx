import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const FileGridSkeleton = () => {
    return (
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 pb-16 min-h-[220px] flex flex-col border border-gray-100 shadow-sm">
                    <div className="flex-1 flex flex-col items-center gap-4 mb-2">
                        {/* Huge Icon Placeholder */}
                        <Skeleton className="w-20 h-20 rounded-2xl bg-gray-100" />
                        
                        {/* Text Lines */}
                        <div className="w-full space-y-2 flex flex-col items-center">
                            <Skeleton className="h-4 w-3/4 bg-gray-100 rounded" />
                            <Skeleton className="h-3 w-1/2 bg-gray-50 rounded" />
                        </div>
                    </div>
                    
                    {/* Bottom Action Bar Placeholder */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                         <Skeleton className="w-8 h-8 rounded-lg bg-gray-50" />
                         <Skeleton className="w-8 h-8 rounded-lg bg-gray-50" />
                         <Skeleton className="w-8 h-8 rounded-lg bg-gray-50" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const FileListSkeleton = () => {
    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-gray-50/80 border-b border-gray-200 px-6 py-4 flex items-center gap-6">
                <Skeleton className="w-4 h-4 rounded bg-gray-200" /> {/* Checkbox */}
                <Skeleton className="h-5 w-[240px] bg-gray-200 rounded-md" /> {/* Name Column Header */}
                
                <div className="flex-1" /> {/* Spacer */}
                
                {/* Right Side Headers */}
                <div className="hidden md:flex items-center gap-8">
                    <Skeleton className="h-4 w-[120px] bg-gray-200 rounded hidden lg:block" />
                    <Skeleton className="h-4 w-[100px] bg-gray-200 rounded hidden xl:block" />
                    <Skeleton className="h-4 w-[80px] bg-gray-200 rounded" />
                </div>
                
                {/* Actions Header Spacer */}
                <div className="w-[80px] hidden sm:block"></div> 
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-6">
                        {/* Checkbox */}
                        <Skeleton className="w-4 h-4 rounded shrink-0 bg-gray-100" />

                        {/* File Icon */}
                        <Skeleton className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />

                        {/* File Name Bar (Long) */}
                        <div className="flex-1 max-w-md">
                             <Skeleton className="h-4 w-full bg-gray-200 rounded-md" />
                        </div>
                        
                        <div className="flex-1" /> {/* Flexible Spacer */}

                        {/* Metadata Columns (Right Aligned) */}
                        <div className="hidden md:flex items-center gap-8">
                             <Skeleton className="h-4 w-32 bg-gray-100 rounded hidden lg:block" />
                             <Skeleton className="h-4 w-24 bg-gray-100 rounded hidden xl:block" />
                             <Skeleton className="h-4 w-20 bg-gray-100 rounded" />
                        </div>

                        {/* Action Buttons (Far Right) */}
                        <div className="flex items-center gap-3 ml-4">
                            <Skeleton className="w-8 h-8 rounded-lg bg-gray-100" />
                            <Skeleton className="w-8 h-8 rounded-lg bg-gray-100" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
