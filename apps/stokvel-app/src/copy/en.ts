/**
 * Central copy module for Seyva Stokvel (en-ZA locale).
 * ALL user-facing strings live here — never inline literals in components.
 *
 * Structure: copy.<feature>.<key>
 * Placeholder syntax: "Hello, {name}" (use interpolate() from lib/copy-utils.ts)
 * Pluralisation: { one: "1 member", other: "{count} members" }
 */
export const copy = {
  app: {
    name: 'Seyva Stokvel',
    tagline: 'Savings built on trust.',
  },

  nav: {
    dashboard: 'Dashboard',
    members: 'Members',
    contributions: 'Contributions',
    profile: 'Profile',
  },

  auth: {
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in to your stokvel',
    phonePlaceholder: '+27 8X XXX XXXX',
    phoneLabel: 'Mobile number',
    pinLabel: 'PIN',
    pinPlaceholder: '••••',
    loginButton: 'Sign in',
    loggingIn: 'Signing in…',
    logoutButton: 'Sign out',
    sessionExpired: 'Your session expired. Please sign in again.',
    invalidCredentials: 'Incorrect number or PIN. Please try again.',
    rateLimited: 'Too many attempts. Please try again in a few minutes.',
    unknownError: 'Something went wrong. Please try again.',
  },

  dashboard: {
    balanceTitle: 'Total balance',
    monthlyTargetLabel: 'Monthly target',
    memberCountLabel: { one: '{count} member', other: '{count} members' },
    reconciledAtLabel: 'Reconciled {date}',
    nextPayoutLabel: 'Next payout',
    paidThisMonthLabel: 'Paid this month',
    paidThisMonthValue: '{paid} / {total}',
    recentActivityLabel: 'Recent activity',
  },

  members: {
    pageTitle: 'Members',
    joinedLabel: 'Joined {date}',
    loadFailed: 'Could not load members. Tap to retry.',
  },

  contributions: {
    pageTitle: 'Contributions',
    monthLabel: '{month}',
    statusConfirmed: 'Confirmed',
    statusPending: 'Pending',
    statusMissed: 'Missed',
    offlineDisabledMessage: 'You need a connection to send money.',
    makeContributionButton: 'Make contribution',
    loadFailed: 'Could not load contributions. Tap to retry.',
    amountLabel: 'Amount (R)',
    submitButton: 'Submit contribution',
    submitting: 'Submitting…',
    successMessage: 'Contribution submitted successfully.',
    monthSelectLabel: 'Month',
  },

  errors: {
    membersLoadFailed: 'Could not load members.',
    dashboardLoadFailed: 'Could not load dashboard data.',
    contributionsLoadFailed: 'Could not load contributions.',
    notFound: 'Page not found.',
    unexpected: 'Something went wrong. Please try again.',
    offlineTitle: "You're offline",
    offlineBody: 'Some data may be from your last sync.',
    retryButton: 'Try again',
    goHomeButton: 'Go to dashboard',
  },

  offline: {
    banner: "You're offline — showing last synced data.",
    contributionDisabled: 'Contributions require a connection.',
  },

  pwa: {
    updateAvailable: 'Update available',
    updateButton: 'Refresh',
    updateLater: 'Later',
    forcedUpdateTitle: 'Update required',
    forcedUpdateBody: 'Please update to continue using Seyva.',
    forcedUpdateButton: 'Update now',
    recommendedUpdateBody: 'A new version of Seyva is available.',
    staleVersionTitle: 'Cannot verify app version',
    staleVersionBody: "Connect to a network and tap 'Retry' to continue.",
    retryButton: 'Retry',
    installPromptTitle: 'Add Seyva to your home screen',
    installPromptBody: 'Get quick access to your stokvel, even offline.',
    installButton: 'Add to home screen',
    installButtonDesktop: 'Install app',
    installDismiss: 'Not now',
  },

  profile: {
    pageTitle: 'Profile',
    memberSince: 'Member since {date}',
    phoneLabel: 'Mobile number',
  },
} as const;

export type Copy = typeof copy;
