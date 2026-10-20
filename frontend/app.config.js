require('dotenv').config();

module.exports = {
  expo: {
    name: 'Aurora',
    slug: 'aurora',
    owner: 'pawbuddies',
    version: '1.0.9',
    runtimeVersion: {
      policy: 'appVersion', // Use app version as runtime version
    },
    updates: {
      url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID || ''}`,
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
    },
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    scheme: 'aurora',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0A0E1A',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.auroracommune.app',
      config: {
        facebookAppId: process.env.FACEBOOK_APP_ID || (process.env.NODE_ENV === 'production' ? undefined : undefined),
        facebookDisplayName: 'Aurora',
      },
      infoPlist: {
        FacebookAppID: process.env.FACEBOOK_APP_ID || (process.env.NODE_ENV === 'production' ? undefined : undefined),
        FacebookDisplayName: 'Aurora',
        FacebookAutoLogAppEventsEnabled: true, // Enable automatic app event logging (required for test events)
        // CFBundleURLTypes for Facebook URL scheme (required for SDK deep linking)
        CFBundleURLTypes: [
          // Register the Aurora deep-link scheme so ios opens the app for aurora:// URLs
          {
            CFBundleURLSchemes: ['aurora'],
          },
          // Facebook URL scheme required by the Facebook SDK
          {
            CFBundleURLSchemes: [
              process.env.FACEBOOK_APP_ID ? `fb${process.env.FACEBOOK_APP_ID}` : undefined,
            ],
          },
        ],
        LSApplicationQueriesSchemes: ['fbapi', 'fb-messenger-share-api', 'fbauth2', 'fbshareextension'],
        ITSAppUsesNonExemptEncryption: false,
        NSUserTrackingUsageDescription: 'We use your data to improve your experience and provide personalized mental health support. Your privacy is important to us.',
        CFBundleDevelopmentRegion: 'en', // Force English locale for native components
        CFBundleLocalizations: ['en'], // Only allow English locale
        // Client Token is REQUIRED for events to transmit - ensure it's always set
        FacebookClientToken: process.env.FACEBOOK_CLIENT_TOKEN || '',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0A0E1A',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      softwareKeyboardLayoutMode: 'pan',
      package: 'com.auroracommune.app',
      config: {
        facebookAppId: process.env.FACEBOOK_APP_ID || (process.env.NODE_ENV === 'production' ? undefined : undefined),
        facebookDisplayName: 'Aurora',
      },
      permissions: [],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      // Viewport settings for proper scaling on iPad/web
      meta: {
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
      },
      // Security headers for web
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-updates', // Required for OTA updates
      'expo-tracking-transparency', // Required for iOS App Tracking Transparency
      'expo-localization', // Required for locale detection
      // Note: Metro config replaces this module with stub for non-iOS platforms to prevent bundling errors
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#60A5FA',
          sounds: [],
        },
      ],
      [
        'react-native-fbsdk-next',
        (() => {
        const facebookAppId = process.env.FACEBOOK_APP_ID || (process.env.NODE_ENV === 'production' ? undefined : undefined);
        // Client Token with fallback - REQUIRED for events to transmit
        const facebookClientToken = process.env.FACEBOOK_CLIENT_TOKEN || '';
        
        if (!facebookAppId && process.env.NODE_ENV === 'production') {
          console.warn('⚠️  FACEBOOK_APP_ID not set in production. Facebook login will not work.');
        }
        
        if (!process.env.FACEBOOK_CLIENT_TOKEN) {
          console.warn('⚠️  FACEBOOK_CLIENT_TOKEN not in env, Facebook SDK disabled. For production, set it in Railway/EAS env vars.');
        }
        
        const config = {
          appID: facebookAppId || undefined,
          displayName: 'Aurora',
          scheme: facebookAppId ? `fb${facebookAppId}` : undefined,
          // Client Token is REQUIRED for events to transmit to Facebook servers
          clientToken: facebookClientToken,
          // Critical settings for Facebook SDK to work correctly
          advertiserIDCollectionEnabled: true,
          autoLogAppEventsEnabled: true,
          // We initialize the SDK manually in JS via Settings.initializeSDK()
          // so auto init must be disabled to avoid double init.
          isAutoInitEnabled: false,
        };
        
        return config;
        })(),
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          // Reverse-DNS of the iOS OAuth client ID, e.g.
          //   com.googleusercontent.apps.123456789-abcdefg
          // Required to receive the OAuth callback URL on iOS.
          iosUrlScheme:
            process.env.GOOGLE_IOS_URL_SCHEME ||
            'com.googleusercontent.apps.REPLACE_WITH_IOS_CLIENT_ID',
        },
      ],
      require('./plugins/withAndroidLocale'),
      require('./plugins/withAndroidFacebookAutoLog'),
      require('./plugins/withIOSFacebookAppDelegate'),
      require('./plugins/withIOSFacebookClientToken'),
      require('./plugins/withIOSModularHeaders'),
      require('./plugins/withTikTokSDK'),
      [
        'react-native-appsflyer',
        {
          shouldUseStrictMode: false,
          shouldUsePurchaseConnector: false,
          preferAppsFlyerBackupRules: false,
        },
      ],
    ],
    extra: {
      // Expo Project ID for push notifications and EAS
      eas: {
        projectId: process.env.EAS_PROJECT_ID || '',
      },
      // Backend API URL
      // - For PRODUCTION: Set API_URL in .env to your Railway/Render URL (e.g., 'https://aurora-production.up.railway.app/api')
      // - For DEVELOPMENT: Leave as localhost (or set API_HOST for physical device testing)
      // IMPORTANT: In production builds, API_URL MUST be set to a production URL, not localhost!
      API_URL: process.env.API_URL || (process.env.NODE_ENV === 'production' 
        ? 'https://aurora-production.up.railway.app/api' 
        : 'http://localhost:3000/api'),
      // For local physical device testing, set your computer's IP (e.g., '192.168.1.100')
      // Only used in development mode when API_URL contains localhost
      API_HOST: process.env.API_HOST || null,
      // NOTE: OpenAI API Key is NOT exposed in frontend - all AI calls go through backend
      // Railway proxy URL for OpenAI Realtime API (voice)
      PROXY_URL: process.env.PROXY_URL || 'wss://aurora-production.up.railway.app',
      // For local physical device testing, set your computer's IP (e.g., '192.168.1.100')
      PROXY_HOST: process.env.PROXY_HOST || null,
      // PostHog Analytics
      // Prefer EXPO_PUBLIC_POSTHOG_API_KEY (recommended by PostHog) but keep POSTHOG_API_KEY for backwards compatibility
      EXPO_PUBLIC_POSTHOG_API_KEY:
        process.env.EXPO_PUBLIC_POSTHOG_API_KEY ||
        process.env.POSTHOG_API_KEY ||
        '',
      POSTHOG_API_KEY:
        process.env.POSTHOG_API_KEY ||
        process.env.EXPO_PUBLIC_POSTHOG_API_KEY ||
        '',
      POSTHOG_HOST: process.env.POSTHOG_HOST || 'https://eu.i.posthog.com',
      // Facebook — exposed so JS can call Settings.setAppID() with the SAME ID
      // that's baked into Info.plist via the iOS infoPlist + plugin config above.
      // Drift between these two has crashed iOS login before (URL scheme mismatch).
      FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || undefined,
      FACEBOOK_CLIENT_TOKEN: process.env.FACEBOOK_CLIENT_TOKEN || '',
      // TikTok Business SDK – App IDs are safe to ship in the binary
      // App Secret stays on the backend only
      TIKTOK_APP_ID: '6758727961',
      TIKTOK_TIKTOK_APP_ID: process.env.TIKTOK_APP_ID || '',
      // Google Sign-In Web Client ID — passed to GoogleSignin.configure() and used by
      // the backend to verify the returned ID token. Set GOOGLE_WEB_CLIENT_ID in .env
      // (or EAS env vars) to the OAuth 2.0 "Web application" client ID from Google
      // Cloud Console.
      GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID || null,
      // iOS-specific OAuth client ID (not always required at runtime — the iOS plugin
      // uses iosUrlScheme above — but exposing it lets the SDK pick it up directly).
      GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID || null,
      // AppsFlyer — override via EAS env for production
      APPSFLYER_DEV_KEY: process.env.APPSFLYER_DEV_KEY || process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY || '',
      APPSFLYER_APP_ID: process.env.APPSFLYER_APP_ID || process.env.EXPO_PUBLIC_APPSFLYER_APP_ID || '6758727961',
    },
  },
};
