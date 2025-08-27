import React, { useEffect, useState, useCallback } from 'react';

interface VersionInfo {
    version: string;
    buildHash: string;
    timestamp: number;
    git: {
        commit: string;
        branch: string;
        date: string;
        dirty: boolean;
    };
    package: {
        version: string;
        name: string;
    };
    cache: {
        static: string;
        dynamic: string;
        api: string;
        runtime: string;
    };
    features: {
        backgroundSync: boolean;
        pushNotifications: boolean;
        offlineSupport: boolean;
        cacheFirst: boolean;
        networkFirst: boolean;
    };
}

interface CacheInfo {
    version: string;
    caches: Record<string, { entries: number; size: number }>;
    totalSize: number;
}

interface ServiceWorkerManagerProps {
    onUpdateAvailable?: (version: string) => void;
    onUpdateInstalled?: (version: string) => void;
    onError?: (error: Error) => void;
    showUpdateNotification?: boolean;
    autoUpdate?: boolean;
}

const ServiceWorkerManager: React.FC<ServiceWorkerManagerProps> = ({
    onUpdateAvailable,
    onUpdateInstalled,
    onError,
    showUpdateNotification = true,
    autoUpdate = false
}) => {
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
    const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

    // Register service worker
    const registerServiceWorker = useCallback(async () => {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported');
            return;
        }

        try {
            const swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none'
            });

            setRegistration(swRegistration);
            console.log('Service Worker registered:', swRegistration);

            // Listen for updates
            swRegistration.addEventListener('updatefound', () => {
                const newWorker = swRegistration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            setWaitingWorker(newWorker);
                            onUpdateAvailable?.(newWorker.scriptURL);
                            
                            if (showUpdateNotification) {
                                setShowUpdatePrompt(true);
                            }
                            
                            if (autoUpdate) {
                                updateServiceWorker();
                            }
                        }
                    });
                }
            });

            // Listen for controller change
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service Worker controller changed');
                window.location.reload();
            });

            // Get version info
            await getVersionInfo(swRegistration);

        } catch (error) {
            console.error('Service Worker registration failed:', error);
            onError?.(error as Error);
        }
    }, [onUpdateAvailable, onError, showUpdateNotification, autoUpdate]);

    // Get version information from service worker
    const getVersionInfo = useCallback(async (swReg?: ServiceWorkerRegistration) => {
        const reg = swReg || registration;
        if (!reg) return;

        try {
            const channel = new MessageChannel();
            const versionPromise = new Promise<VersionInfo>((resolve) => {
                channel.port1.onmessage = (event) => {
                    resolve(event.data);
                };
            });

            reg.active?.postMessage({ type: 'GET_VERSION_INFO' }, [channel.port2]);
            const info = await versionPromise;
            setVersionInfo(info);
        } catch (error) {
            console.error('Failed to get version info:', error);
        }
    }, [registration]);

    // Get cache information
    const getCacheInfo = useCallback(async () => {
        if (!registration?.active) return;

        try {
            const channel = new MessageChannel();
            const cachePromise = new Promise<CacheInfo>((resolve) => {
                channel.port1.onmessage = (event) => {
                    resolve(event.data);
                };
            });

            registration.active.postMessage({ type: 'GET_CACHE_INFO' }, [channel.port2]);
            const info = await cachePromise;
            setCacheInfo(info);
        } catch (error) {
            console.error('Failed to get cache info:', error);
        }
    }, [registration]);

    // Update service worker
    const updateServiceWorker = useCallback(async () => {
        if (!waitingWorker) return;

        try {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
            setWaitingWorker(null);
            setShowUpdatePrompt(false);
            onUpdateInstalled?.(waitingWorker.scriptURL);
        } catch (error) {
            console.error('Failed to update service worker:', error);
            onError?.(error as Error);
        }
    }, [waitingWorker, onUpdateInstalled, onError]);

    // Clear cache
    const clearCache = useCallback(async (cacheName?: string) => {
        if (!registration?.active) return;

        try {
            const channel = new MessageChannel();
            registration.active.postMessage({ 
                type: 'CLEAR_CACHE', 
                cacheName 
            }, [channel.port2]);
            
            // Refresh cache info
            setTimeout(getCacheInfo, 1000);
        } catch (error) {
            console.error('Failed to clear cache:', error);
            onError?.(error as Error);
        }
    }, [registration, getCacheInfo, onError]);

    // Cache URLs
    const cacheUrls = useCallback(async (urls: string[]) => {
        if (!registration?.active) return;

        try {
            registration.active.postMessage({ 
                type: 'CACHE_URLS', 
                urls 
            });
        } catch (error) {
            console.error('Failed to cache URLs:', error);
            onError?.(error as Error);
        }
    }, [registration, onError]);

    // Handle online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Listen for service worker messages
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const { type, data } = event.data;
            
            switch (type) {
                case 'SW_ACTIVATED':
                    console.log('Service Worker activated:', data);
                    break;
                case 'SW_INSTALLED':
                    console.log('Service Worker installed:', data);
                    break;
                default:
                    console.log('Service Worker message:', type, data);
            }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);
        return () => {
            navigator.serviceWorker.removeEventListener('message', handleMessage);
        };
    }, []);

    // Register service worker on mount
    useEffect(() => {
        registerServiceWorker();
    }, [registerServiceWorker]);

    // Get cache info periodically
    useEffect(() => {
        const interval = setInterval(getCacheInfo, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, [getCacheInfo]);

    // Update notification component
    const UpdateNotification = () => {
        if (!showUpdatePrompt || !waitingWorker) return null;

        return (
            <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Update Available</h3>
                        <p className="text-sm opacity-90">
                            A new version of the app is available.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={updateServiceWorker}
                            className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
                        >
                            Update
                        </button>
                        <button
                            onClick={() => setShowUpdatePrompt(false)}
                            className="text-white opacity-70 hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Debug panel (only in development)
    const DebugPanel = () => {
        if (process.env.NODE_ENV !== 'development') return null;

        return (
            <div className="fixed top-4 right-4 bg-black text-red-500 p-4 rounded-lg shadow-lg z-50 max-w-xs text-xs">
                <h3 className="font-semibold mb-2">SW Debug</h3>
                <div className="space-y-1">
                    <div>Status: {registration ? 'Registered' : 'Not registered'}</div>
                    <div>Online: {isOnline ? 'Yes' : 'No'}</div>
                    {versionInfo && (
                        <div>Version: {versionInfo.version}</div>
                    )}
                    {cacheInfo && (
                        <div>Cache Size: {(cacheInfo.totalSize / 1024 / 1024).toFixed(2)} MB</div>
                    )}
                    {waitingWorker && (
                        <div className="text-yellow-500">Update pending</div>
                    )}
                </div>
                <div className="mt-2 space-y-1">
                    <button
                        onClick={() => getCacheInfo()}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                    >
                        Refresh Cache Info
                    </button>
                    <button
                        onClick={() => clearCache()}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs ml-1"
                    >
                        Clear Cache
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <UpdateNotification />
            <DebugPanel />
        </>
    );
};

export default ServiceWorkerManager;
