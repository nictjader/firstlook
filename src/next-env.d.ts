/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: { client_id: string; callback: (response: any) => void; }) => void;
                    renderButton: (parent: HTMLElement, options: any) => void;
                    prompt: (notification?: (notification: any) => void) => void;
                    disableAutoSelect: () => void;
                };
            };
        };
    }
}

// This empty export is needed to make the file a module.
export {};
