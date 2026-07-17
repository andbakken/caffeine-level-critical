import type { Locale } from "@/i18n/routing";
import { APP_NAME_FULL } from "@/lib/brand";

// Juridiske dokumenter (Vilkår, Personvernerklæring).
// Prosaen ligger her – ikke i messages/*.json – fordi tekstene er lange; det holder
// dem lesbare og strukturerte. Rendres av src/components/LegalArticle.tsx.
//
// Databehandleravtale ligger bevisst IKKE her: den er en avtale som skal signeres
// av begge parter, så vi sender den til kunder som ber om den (jf. vilkårenes
// punkt 8) i stedet for å publisere den som en ensidig nettside.
//
// ⚠️ MÅ GJENNOMGÅS AV JURIST FØR PRODUKSJON.

export type LegalSection = { heading: string; body?: string[]; bullets?: string[] };
export type LegalDoc = {
  title: string;
  metaDescription: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
};
export type LegalKey = "vilkar" | "personvern";

// Hvem som leverer den hostede tjenesten leses fra server-env – det skal IKKE stå i
// koden. Repoet er offentlig, så navn, postadresse og org.nr ville fulgt med i hver
// klone og ligget i git-historikken for alltid; historikk kan ikke angres. Apex setter
// disse i infra/compose.infra.yml. Selvhostere lar dem stå tomme – de juridiske sidene
// gjelder uansett kun vår hostede tjeneste og skjules av SELF_HOST=1.
//
// Bevisst uten NEXT_PUBLIC_-prefiks: slike vari bakes inn i bundlen ved build (samme
// felle som NEXT_PUBLIC_TAG_BASE_URL), og ville dermed havnet i imaget. Server-env
// uten prefiks slås opp ved runtime, og de juridiske sidene er dynamiske (ƒ).
const CONTACT_EMAIL = process.env.LEGAL_CONTACT_EMAIL?.trim() ?? "";
// Enkeltpersonforetak registreres på innehaverens navn – det er dette navnet som
// står i Enhetsregisteret og som må oppgis som avtalepart/behandlingsansvarlig.
const COMPANY = process.env.LEGAL_COMPANY_NAME?.trim() ?? "";
// Tom til foretaket er registrert. Er den tom, utelates org.nr fra tekstene
// – bedre enn å vise en synlig plassholder på en live side.
const ORGNR = process.env.LEGAL_COMPANY_ORGNR?.trim() ?? "";
// Forretningsadresse. E-handelsloven § 8 krever at næringsvirksomhet oppgir en
// geografisk adresse, så den står i kontaktpunktet i både vilkår og personvern.
const ADDRESS_NO = process.env.LEGAL_COMPANY_ADDRESS_NO?.trim() ?? "";
const ADDRESS_EN = process.env.LEGAL_COMPANY_ADDRESS_EN?.trim() ?? "";

/** Uten en identitet å peke på er dokumentene meningsløse («levert av ») – da skal
 *  sidene 404-e i stedet for å rendre halve setninger. Sjekkes av begge sidene. */
export const hasLegalIdentity = Boolean(COMPANY && CONTACT_EMAIL && ADDRESS_NO && ADDRESS_EN);

const companyNo = ORGNR ? `${COMPANY} (org.nr ${ORGNR})` : COMPANY;
const companyEn = ORGNR ? `${COMPANY} (company no. ${ORGNR})` : COMPANY;

export const legal: Record<Locale, Record<LegalKey, LegalDoc>> = {
  no: {
    vilkar: {
      title: "Vilkår for bruk",
      metaDescription: `Vilkår for bruk av den hostede versjonen av ${APP_NAME_FULL}.`,
      updated: "2. juli 2026",
      intro: [
        `Disse vilkårene gjelder for bruk av den hostede versjonen av ${APP_NAME_FULL} («tjenesten»), levert av ${companyNo} («vi», «oss»). Ved å opprette en instans aksepterer du vilkårene.`,
        "Selvhostet versjon er fri programvare under AGPL-3.0 og dekkes ikke av disse vilkårene, kun av lisensen.",
      ],
      sections: [
        {
          heading: "1. Tjenesten",
          body: [
            "Tjenesten er et lekent verktøy for å logge og rangere kaffe-, te- og kakaokonsum på arbeidsplassen, med NFC-/QR-skanning, toppliste, merker og statistikk. Vi hoster og drifter en dedikert instans for din organisasjon på ditt eget subdomene.",
          ],
        },
        {
          heading: "2. Konto og bruk",
          body: [
            "Du er ansvarlig for å oppgi korrekte opplysninger ved registrering og for aktivitet på din instans, inkludert administratortilgang. Du må ikke bruke tjenesten til ulovlige formål eller på en måte som skader tjenesten eller andre.",
            "Du er selv ansvarlig for å informere dine egne brukere (ansatte) om bruken, i tråd med personvernregelverket. Se punkt 8 om databehandling.",
          ],
        },
        {
          heading: "3. Priser, betaling og prøveperiode",
          body: [
            "Hostet tjeneste koster 249 kr per måned. Vi er foreløpig ikke merverdiavgiftsregistrert, og det påløper derfor ikke MVA på beløpet. Nye kunder får en gratis prøveperiode på 14 dager. Du oppgir betalingskort ved oppstart, men belastes ikke før prøveperioden er over.",
            "Sier du opp før prøveperioden utløper, belastes du ingenting. Etter prøveperioden fornyes abonnementet automatisk hver måned til du sier det opp. Betaling håndteres av Stripe.",
          ],
        },
        {
          heading: "4. Oppsigelse",
          body: [
            "Du kan si opp abonnementet når som helst med virkning fra utløpet av inneværende betalingsperiode. Ved oppsigelse settes instansen på pause og dataene slettes etter en rimelig oppbevaringsperiode. Vi kan si opp eller suspendere tjenesten ved vesentlig mislighold eller manglende betaling.",
          ],
        },
        {
          heading: "5. Tilgjengelighet og support",
          body: [
            "Vi tilstreber høy oppetid, men tjenesten leveres «som den er» uten garanti for uavbrutt eller feilfri drift. Vi kan gjøre nødvendig vedlikehold og oppdateringer. Support gis via e-post etter beste evne.",
          ],
        },
        {
          heading: "6. Immaterielle rettigheter",
          body: [
            "Programvaren er tilgjengelig under AGPL-3.0. Vi beholder rettighetene til varemerke og merkevare. Data du og dine brukere legger inn, tilhører din organisasjon.",
          ],
        },
        {
          heading: "7. Ansvarsbegrensning",
          body: [
            "I den grad loven tillater det, er vårt samlede ansvar begrenset til det du har betalt for tjenesten de siste tolv månedene. Vi er ikke ansvarlige for indirekte tap, tapte data, eller tap som skyldes forhold utenfor vår kontroll. Ansvar etter en inngått databehandleravtale kommer i tillegg og reguleres av den avtalen.",
          ],
        },
        {
          heading: "8. Personvern og databehandling",
          body: [
            "For personopplysninger vi behandler på dine vegne er du behandlingsansvarlig og vi databehandler. Personvernerklæringen beskriver hva vi behandler, hvor det lagres og hvilke underleverandører vi bruker.",
            `Trenger du en databehandleravtale etter GDPR artikkel 28, inngår vi den med deg – kontakt oss på ${CONTACT_EMAIL}, så sender vi avtalen til signering. Er en slik avtale inngått, går den foran disse vilkårene ved motstrid om behandlingen av personopplysninger.`,
          ],
        },
        {
          heading: "9. Endringer",
          body: [
            "Vi kan oppdatere vilkårene. Ved vesentlige endringer varsler vi på e-post eller i tjenesten i rimelig tid før de trer i kraft. Fortsatt bruk etter ikrafttredelse regnes som aksept.",
          ],
        },
        {
          heading: "10. Lovvalg og verneting",
          body: [
            "Vilkårene reguleres av norsk rett. Tvister søkes løst i minnelighet; hvis ikke, avgjøres de av norske domstoler etter saksøktes alminnelige verneting.",
          ],
        },
        {
          heading: "11. Kontakt",
          body: [`${COMPANY}, ${ADDRESS_NO}. Spørsmål? Kontakt oss på ${CONTACT_EMAIL}.`],
        },
      ],
    },
    personvern: {
      title: "Personvernerklæring",
      metaDescription: `Hvordan ${APP_NAME_FULL} behandler personopplysninger – for besøkende og kunder.`,
      updated: "2. juli 2026",
      intro: [
        `Denne erklæringen beskriver hvordan ${companyNo} behandler personopplysninger. For besøkende på nettsiden og for kontoinnehavere er vi behandlingsansvarlig. For opplysninger som ligger inne i en kundes instans (f.eks. ansattes kallenavn og konsumhendelser) er kunden behandlingsansvarlig og vi databehandler; vi inngår databehandleravtale med kunder som ber om det.`,
      ],
      sections: [
        {
          heading: "1. Hvilke opplysninger vi behandler",
          bullets: [
            "Nettsiden: vi bruker ingen sporings- eller markedsføringscookies og samler ikke inn personopplysninger om besøkende utover det som er teknisk nødvendig.",
            "Konto/onboarding: organisasjonsnavn, ønsket subdomene og administrators e-postadresse.",
            "Betaling: håndteres av Stripe; vi lagrer ikke kortopplysninger.",
            "Innlogging: en teknisk øktinformasjonskapsel (session-cookie) som er nødvendig for å holde deg innlogget.",
          ],
        },
        {
          heading: "2. Formål og rettslig grunnlag",
          body: [
            "Vi behandler opplysningene for å levere, fakturere og drifte tjenesten, og for å svare på henvendelser. Rettslig grunnlag er oppfyllelse av avtale (GDPR art. 6 (1) b) og vår berettigede interesse i å drive og forbedre tjenesten (art. 6 (1) f).",
          ],
        },
        {
          heading: "3. Informasjonskapsler",
          body: [
            "Vi bruker kun strengt nødvendige informasjonskapsler (for innlogging og sikkerhet). For å forstå trafikken på nettsidene våre bruker vi Umami – en personvernvennlig, selvhostet analyseløsning som kjører på våre egne servere i EU. Den setter ingen informasjonskapsler, sporer deg ikke på tvers av nettsteder, og samler ikke inn opplysninger som identifiserer deg. Vi bruker ingen reklame- eller tredjeparts sporingscookies, og trenger derfor ikke et samtykkebanner.",
          ],
        },
        {
          heading: "4. Aggregert bruksstatistikk",
          body: [
            "Vi teller ett anonymt, aggregert totaltall: hvor mange kopper som er logget til sammen på tvers av alle hostede instanser. Dette tallet inneholder ingen opplysninger om enkeltpersoner, avdelinger eller enkeltkunder, og regnes som anonym statistikk – ikke personopplysninger. Vi bruker det til å vise aktivitet på nettsiden og til å forstå bruken av tjenesten.",
          ],
        },
        {
          heading: "5. Lagring og lokasjon",
          body: [
            "All data lagres i EU (datasenter i Finland, via Hetzner) og forlater aldri EØS. Vi tar regelmessig sikkerhetskopi.",
          ],
        },
        {
          heading: "6. Databehandlere",
          body: ["Vi bruker følgende underleverandører, alle med databehandleravtale:"],
          bullets: [
            "Hetzner Online GmbH – hosting og lagring (EU: Finland/Tyskland).",
            "Stripe – betalingsbehandling.",
            "Resend – utsending av transaksjons-e-post (velkomst, innlogging).",
          ],
        },
        {
          heading: "7. Lagringstid",
          body: [
            "Kontoopplysninger lagres så lenge du er kunde. Ved oppsigelse slettes instansdata etter en rimelig oppbevaringsperiode. Faktura-/regnskapsopplysninger oppbevares så lenge bokføringsloven krever.",
          ],
        },
        {
          heading: "8. Dine rettigheter",
          body: [
            `Du har rett til innsyn, retting, sletting og dataportabilitet, og kan protestere mot eller be om begrensning av behandlingen. Kontakt oss på ${CONTACT_EMAIL}. Du kan også klage til Datatilsynet.`,
          ],
        },
        {
          heading: "9. Endringer",
          body: [
            "Vi kan oppdatere erklæringen. Gjeldende versjon ligger alltid her, med dato for siste oppdatering øverst.",
          ],
        },
        {
          heading: "10. Kontakt",
          body: [`Behandlingsansvarlig: ${companyNo}, ${ADDRESS_NO}. E-post: ${CONTACT_EMAIL}.`],
        },
      ],
    },
  },
  en: {
    vilkar: {
      title: "Terms of Service",
      metaDescription: `Terms of service for the hosted version of ${APP_NAME_FULL}.`,
      updated: "2 July 2026",
      intro: [
        `These terms govern the use of the hosted version of ${APP_NAME_FULL} (the "service"), provided by ${companyEn} ("we", "us"). By creating an instance you accept these terms.`,
        "The self-hosted version is free software under AGPL-3.0 and is not covered by these terms, only by that licence.",
      ],
      sections: [
        {
          heading: "1. The service",
          body: [
            "The service is a playful tool for logging and ranking coffee, tea and cocoa consumption at work, with NFC/QR scanning, leaderboards, badges and statistics. We host and operate a dedicated instance for your organisation on your own subdomain.",
          ],
        },
        {
          heading: "2. Account and use",
          body: [
            "You are responsible for providing accurate information at sign-up and for activity on your instance, including admin access. You must not use the service for unlawful purposes or in ways that harm the service or others.",
            "You are responsible for informing your own users (employees) about the use, in line with data protection law. See section 8 on data processing.",
          ],
        },
        {
          heading: "3. Pricing, payment and trial",
          body: [
            "The hosted service costs 249 NOK per month. We are not currently VAT-registered, so no VAT is added to this amount. New customers get a 14-day free trial. You add a payment card at sign-up but are not charged until the trial ends.",
            "If you cancel before the trial ends, you are charged nothing. After the trial the subscription renews automatically each month until you cancel. Payments are handled by Stripe.",
          ],
        },
        {
          heading: "4. Cancellation",
          body: [
            "You may cancel at any time, effective at the end of the current billing period. On cancellation the instance is paused and data is deleted after a reasonable retention period. We may suspend or terminate the service for material breach or non-payment.",
          ],
        },
        {
          heading: "5. Availability and support",
          body: [
            'We aim for high uptime, but the service is provided "as is" without warranty of uninterrupted or error-free operation. We may perform necessary maintenance and updates. Support is provided by email on a best-effort basis.',
          ],
        },
        {
          heading: "6. Intellectual property",
          body: [
            "The software is available under AGPL-3.0. We retain our trademark and brand rights. Data you and your users enter belongs to your organisation.",
          ],
        },
        {
          heading: "7. Limitation of liability",
          body: [
            "To the extent permitted by law, our total liability is limited to the amount you paid for the service in the preceding twelve months. We are not liable for indirect losses, data loss, or losses caused by circumstances beyond our control. Liability under a data processing agreement, where one has been entered into, applies in addition and is governed by that agreement.",
          ],
        },
        {
          heading: "8. Privacy and data processing",
          body: [
            "For personal data we process on your behalf, you are the controller and we are the processor. The privacy policy describes what we process, where it is stored and which sub-processors we use.",
            `If you need a data processing agreement under GDPR Article 28, we will enter into one with you – contact us at ${CONTACT_EMAIL} and we will send it for signing. Where such an agreement is in place, it prevails over these terms in the event of conflict regarding the processing of personal data.`,
          ],
        },
        {
          heading: "9. Changes",
          body: [
            "We may update these terms. For material changes we give reasonable notice by email or in the service. Continued use after the changes take effect constitutes acceptance.",
          ],
        },
        {
          heading: "10. Governing law and jurisdiction",
          body: [
            "These terms are governed by Norwegian law. Disputes are sought resolved amicably; failing that, the courts of Norway have jurisdiction.",
          ],
        },
        {
          heading: "11. Contact",
          body: [`${COMPANY}, ${ADDRESS_EN}. Questions? Contact us at ${CONTACT_EMAIL}.`],
        },
      ],
    },
    personvern: {
      title: "Privacy Policy",
      metaDescription: `How ${APP_NAME_FULL} processes personal data – for visitors and customers.`,
      updated: "2 July 2026",
      intro: [
        `This policy describes how ${companyEn} processes personal data. For website visitors and account holders we are the controller. For data held inside a customer's instance (e.g. employees' nicknames and consumption events) the customer is the controller and we are the processor; we enter into a data processing agreement with customers who request one.`,
      ],
      sections: [
        {
          heading: "1. What we process",
          bullets: [
            "Website: we use no tracking or marketing cookies and collect no personal data about visitors beyond what is technically necessary.",
            "Account/onboarding: organisation name, chosen subdomain and the admin's email address.",
            "Payment: handled by Stripe; we do not store card details.",
            "Login: a technical session cookie required to keep you signed in.",
          ],
        },
        {
          heading: "2. Purpose and legal basis",
          body: [
            "We process the data to deliver, bill and operate the service, and to respond to enquiries. The legal basis is performance of a contract (GDPR Art. 6(1)(b)) and our legitimate interest in running and improving the service (Art. 6(1)(f)).",
          ],
        },
        {
          heading: "3. Cookies",
          body: [
            "We use only strictly necessary cookies (for login and security). To understand traffic on our websites we use Umami – a privacy-friendly, self-hosted analytics tool running on our own EU servers. It sets no cookies, does not track you across sites, and collects no data that identifies you. We use no advertising or third-party tracking cookies, so no consent banner is required.",
          ],
        },
        {
          heading: "4. Aggregate usage statistics",
          body: [
            'We count a single anonymous, aggregate total: how many cups have been logged in total across all hosted instances. This number contains no information about individuals, departments or individual customers and is considered anonymous statistics – not personal data. We use it to show activity on our website and to understand usage of the service.',
          ],
        },
        {
          heading: "5. Storage and location",
          body: [
            "All data is stored in the EU (data centre in Finland, via Hetzner) and never leaves the EEA. We take regular backups.",
          ],
        },
        {
          heading: "6. Processors",
          body: ["We use the following sub-processors, all under a data processing agreement:"],
          bullets: [
            "Hetzner Online GmbH – hosting and storage (EU: Finland/Germany).",
            "Stripe – payment processing.",
            "Resend – sending transactional email (welcome, login).",
          ],
        },
        {
          heading: "7. Retention",
          body: [
            "Account data is kept for as long as you are a customer. On cancellation, instance data is deleted after a reasonable retention period. Invoicing/accounting data is kept for as long as bookkeeping law requires.",
          ],
        },
        {
          heading: "8. Your rights",
          body: [
            `You have the right to access, rectification, erasure and data portability, and can object to or request restriction of processing. Contact us at ${CONTACT_EMAIL}. You may also complain to the Norwegian Data Protection Authority (Datatilsynet).`,
          ],
        },
        {
          heading: "9. Changes",
          body: [
            "We may update this policy. The current version is always here, with the last-updated date at the top.",
          ],
        },
        {
          heading: "10. Contact",
          body: [`Controller: ${companyEn}, ${ADDRESS_EN}. Email: ${CONTACT_EMAIL}.`],
        },
      ],
    },
  },
};
