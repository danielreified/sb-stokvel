import type { Copy } from './types.js';

export const copy: Copy = {
  app: {
    name: 'Seyva Stokvel',
    tagline: 'Imali eyakhelwe phezu kwethemba.',
  },

  nav: {
    dashboard: 'Ikhasi elikhulu',
    members: 'Amalungu',
    contributions: 'Iminikelo',
    profile: 'Iphrofayela',
  },

  auth: {
    loginTitle: 'Sawubona futhi',
    loginSubtitle: 'Ngena ku-stokvel yakho',
    phonePlaceholder: '+27 8X XXX XXXX',
    phoneLabel: 'Inombolo yefoni',
    pinLabel: 'I-PIN',
    pinPlaceholder: '••••',
    loginButton: 'Ngena',
    loggingIn: 'Iyangenisa…',
    logoutButton: 'Phuma',
    sessionExpired: 'Iseshini yakho iphelelwe yisikhathi. Sicela ungene futhi.',
    invalidCredentials: 'Inombolo noma i-PIN ayilungile. Zama futhi.',
    rateLimited: 'Imizamo eminingi. Zama futhi emizuzwini embalwa.',
    unknownError: 'Kukhona okungahambanga kahle. Zama futhi.',
  },

  dashboard: {
    balanceTitle: 'Imali eyonke',
    monthlyTargetLabel: 'Inhloso yenyanga',
    memberCountLabel: { one: 'ilungu elingu-{count}', other: 'amalungu angu-{count}' },
    reconciledAtLabel: 'Kuhlanganiswe {date}',
    nextPayoutLabel: 'Ukukhokha okulandelayo',
    paidThisMonthLabel: 'Kukhokhwe kule nyanga',
    paidThisMonthValue: '{paid} / {total}',
    recentActivityLabel: 'Umsebenzi wakamuva',
  },

  members: {
    pageTitle: 'Amalungu',
    joinedLabel: 'Ujoyine {date}',
    loadFailed: 'Ayikwazanga ukulayisha amalungu. Cindezela ukuze uzame futhi.',
    contributionLabel: 'Umnikelo',
    statusLabel: 'Isimo',
    memberSinceLabel: 'Ilungu kusukela',
    statusNoContribution: 'Awukabi nawo umnikelo',
  },

  contributions: {
    pageTitle: 'Iminikelo',
    monthLabel: '{month}',
    summaryLabel: '{month} · {paid} kungu-{total} okukhokhiwe',
    emptyMessage: 'Ayikho iminikelo etholakele kulezi zihlungi.',
    columnMember: 'Ilungu',
    columnMonth: 'Inyanga',
    columnAmount: 'Inani',
    columnStatus: 'Isimo',
    statusConfirmed: 'Kuqinisekisiwe',
    statusPending: 'Kulindiwe',
    statusMissed: 'Akukhokhwanga',
    offlineDisabledMessage: 'Udinga ukuxhumeka ukuze uthumele imali.',
    makeContributionButton: 'Yenza umnikelo',
    loadFailed: 'Ayikwazanga ukulayisha iminikelo. Cindezela ukuze uzame futhi.',
    amountLabel: 'Inani (R)',
    submitButton: 'Thumela umnikelo',
    submitting: 'Iyathumela…',
    successMessage: 'Umnikelo uthunyelwe ngempumelelo.',
    monthSelectLabel: 'Inyanga',
  },

  errors: {
    membersLoadFailed: 'Ayikwazanga ukulayisha amalungu.',
    dashboardLoadFailed: 'Ayikwazanga ukulayisha idatha yekhasi elikhulu.',
    contributionsLoadFailed: 'Ayikwazanga ukulayisha iminikelo.',
    notFound: 'Ikhasi alitholakali.',
    unexpected: 'Kukhona okungahambanga kahle. Zama futhi.',
    offlineTitle: 'Awuxhunyiwe',
    offlineBody: 'Enye idatha ingaba ivela ekuvumelaniseni kwakho kokugcina.',
    retryButton: 'Zama futhi',
    goHomeButton: 'Iya ekhasini elikhulu',
  },

  offline: {
    banner: 'Awuxhunyiwe — sikhombisa idatha yokugcina exhunyiwe.',
    contributionDisabled: 'Iminikelo idinga ukuxhumeka.',
  },

  pwa: {
    updateAvailable: 'Kukhona isibuyekezo',
    updateButton: 'Vuselela',
    updateLater: 'Kamuva',
    forcedUpdateTitle: 'Kudingeka isibuyekezo',
    forcedUpdateBody: 'Sicela ubuyekeze ukuze uqhubeke usebenzisa i-Seyva.',
    forcedUpdateButton: 'Buyekeza manje',
    recommendedUpdateBody: 'Inguqulo entsha ye-Seyva iyatholakala.',
    staleVersionTitle: 'Ayikwazi ukuqinisekisa inguqulo yohlelo',
    staleVersionBody: "Xhuma kunethiwekhi bese ucindezela 'Zama futhi' ukuze uqhubeke.",
    retryButton: 'Zama futhi',
    installPromptTitle: 'Engeza i-Seyva esikrinini sakho sasekhaya',
    installPromptBody: 'Thola ukufinyelela okusheshayo ku-stokvel yakho, ngisho ungaxhumekile.',
    installButton: 'Engeza esikrinini sasekhaya',
    installButtonDesktop: 'Faka uhlelo',
    installDismiss: 'Hhayi manje',
  },

  pinLock: {
    statusLabel: 'Uhlelo luvaliwe',
    welcome: 'Sawubona futhi, {name}',
    prompt: 'Faka i-PIN yakho ukuze uqhubeke',
    signOutInstead: 'Kunalokho phuma',
  },

  profile: {
    pageTitle: 'Iphrofayela',
    memberSince: 'Ilungu kusukela {date}',
    phoneLabel: 'Inombolo yefoni',
    accountSettings: 'Izilungiselelo ze-akhawunti',
    notifications: 'Izaziso',
    privacySecurity: 'Ubumfihlo nokuphepha',
    helpSupport: 'Usizo nokusekela',
  },

  language: {
    pickerLabel: 'Ulimi',
  },

  status: {
    online: 'Uxhumekile',
    offline: 'Awuxhumekile',
  },
};
