import type { Copy } from './types.js';

export const copy: Copy = {
  app: {
    name: 'Seyva Stokvel',
    tagline: 'Spaargeld gebou op vertroue.',
  },

  nav: {
    dashboard: 'Paneelbord',
    members: 'Lede',
    contributions: 'Bydraes',
    profile: 'Profiel',
  },

  auth: {
    loginTitle: 'Welkom terug',
    loginSubtitle: 'Teken in by jou stokvel',
    phonePlaceholder: '+27 8X XXX XXXX',
    phoneLabel: 'Selfoonnommer',
    pinLabel: 'PIN',
    pinPlaceholder: '••••',
    loginButton: 'Teken in',
    loggingIn: 'Teken in…',
    logoutButton: 'Teken uit',
    sessionExpired: 'Jou sessie het verstryk. Teken asseblief weer in.',
    invalidCredentials: 'Verkeerde nommer of PIN. Probeer asseblief weer.',
    rateLimited: 'Te veel pogings. Probeer asseblief oor ’n paar minute weer.',
    unknownError: 'Iets het verkeerd geloop. Probeer asseblief weer.',
  },

  dashboard: {
    balanceTitle: 'Totale balans',
    monthlyTargetLabel: 'Maandelikse doelwit',
    memberCountLabel: { one: '{count} lid', other: '{count} lede' },
    reconciledAtLabel: 'Gerekonsilieer {date}',
    nextPayoutLabel: 'Volgende uitbetaling',
    paidThisMonthLabel: 'Hierdie maand betaal',
    paidThisMonthValue: '{paid} / {total}',
    recentActivityLabel: 'Onlangse aktiwiteit',
  },

  members: {
    pageTitle: 'Lede',
    joinedLabel: 'Aangesluit {date}',
    loadFailed: 'Kon nie lede laai nie. Tik om weer te probeer.',
    contributionLabel: 'Bydrae',
    statusLabel: 'Status',
    memberSinceLabel: 'Lid sedert',
    statusNoContribution: 'Nog geen bydrae nie',
  },

  contributions: {
    pageTitle: 'Bydraes',
    monthLabel: '{month}',
    summaryLabel: '{month} · {paid} van {total} betaal',
    emptyMessage: 'Geen bydraes gevind vir die geselekteerde filters nie.',
    columnMember: 'Lid',
    columnMonth: 'Maand',
    columnAmount: 'Bedrag',
    columnStatus: 'Status',
    statusConfirmed: 'Bevestig',
    statusPending: 'Hangende',
    statusMissed: 'Gemis',
    offlineDisabledMessage: 'Jy het ’n verbinding nodig om geld te stuur.',
    makeContributionButton: 'Maak bydrae',
    loadFailed: 'Kon nie bydraes laai nie. Tik om weer te probeer.',
    amountLabel: 'Bedrag (R)',
    submitButton: 'Dien bydrae in',
    submitting: 'Stuur…',
    successMessage: 'Bydrae suksesvol ingedien.',
    monthSelectLabel: 'Maand',
  },

  errors: {
    membersLoadFailed: 'Kon nie lede laai nie.',
    dashboardLoadFailed: 'Kon nie paneelborddata laai nie.',
    contributionsLoadFailed: 'Kon nie bydraes laai nie.',
    notFound: 'Bladsy nie gevind nie.',
    unexpected: 'Iets het verkeerd geloop. Probeer asseblief weer.',
    offlineTitle: 'Jy is vanlyn',
    offlineBody: 'Sommige data kan van jou laaste sinkronisering wees.',
    retryButton: 'Probeer weer',
    goHomeButton: 'Gaan na paneelbord',
  },

  offline: {
    banner: 'Jy is vanlyn — wys laaste gesinkroniseerde data.',
    contributionDisabled: 'Bydraes vereis ’n verbinding.',
  },

  pwa: {
    updateAvailable: 'Opdatering beskikbaar',
    updateButton: 'Verfris',
    updateLater: 'Later',
    forcedUpdateTitle: 'Opdatering vereis',
    forcedUpdateBody: 'Werk asseblief op om Seyva te bly gebruik.',
    forcedUpdateButton: 'Werk nou op',
    recommendedUpdateBody: '’n Nuwe weergawe van Seyva is beskikbaar.',
    staleVersionTitle: 'Kan nie programweergawe verifieer nie',
    staleVersionBody: "Verbind aan ’n netwerk en tik 'Probeer weer' om voort te gaan.",
    retryButton: 'Probeer weer',
    installPromptTitle: 'Voeg Seyva by jou tuisskerm',
    installPromptBody: 'Kry vinnige toegang tot jou stokvel, selfs vanlyn.',
    installButton: 'Voeg by tuisskerm',
    installButtonDesktop: 'Installeer program',
    installDismiss: 'Nie nou nie',
  },

  pinLock: {
    statusLabel: 'Program gesluit',
    welcome: 'Welkom terug, {name}',
    prompt: 'Voer jou PIN in om voort te gaan',
    signOutInstead: 'Teken eerder uit',
  },

  profile: {
    pageTitle: 'Profiel',
    memberSince: 'Lid sedert {date}',
    phoneLabel: 'Selfoonnommer',
    accountSettings: 'Rekeninginstellings',
    notifications: 'Kennisgewings',
    privacySecurity: 'Privaatheid en sekuriteit',
    helpSupport: 'Hulp en ondersteuning',
  },

  language: {
    pickerLabel: 'Taal',
  },

  status: {
    online: 'Aanlyn',
    offline: 'Vanlyn',
  },
};
