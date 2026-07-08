import type { Locale } from "@/i18n/routing";
import { APP_NAME_FULL } from "@/lib/brand";

// Juridiske dokumenter (Vilkår, Personvernerklæring, Databehandleravtale).
// Prosaen ligger her – ikke i messages/*.json – fordi tekstene er lange; det holder
// dem lesbare og strukturerte. Rendres av src/components/LegalArticle.tsx.
//
// ⚠️ MÅ GJENNOMGÅS AV JURIST FØR PRODUKSJON. Alt i [hakeparentes] er plassholdere
// som må fylles inn med reelle selskapsopplysninger før lansering.

export type LegalSection = { heading: string; body?: string[]; bullets?: string[] };
export type LegalDoc = {
  title: string;
  metaDescription: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
};
export type LegalKey = "vilkar" | "personvern" | "databehandleravtale";

// Reelle opplysninger vi allerede kjenner fra infra/oppsett.
const CONTACT_EMAIL = "personvern@questroasted.app";
const COMPANY = "[Selskapsnavn AS]"; // TODO: registrert selskapsnavn
const ORGNR = "[org.nr]"; // TODO: organisasjonsnummer
const ADDRESS = "[postadresse]"; // TODO: forretningsadresse

export const legal: Record<Locale, Record<LegalKey, LegalDoc>> = {
  no: {
    vilkar: {
      title: "Vilkår for bruk",
      metaDescription: `Vilkår for bruk av den hostede versjonen av ${APP_NAME_FULL}.`,
      updated: "2. juli 2026",
      intro: [
        `Disse vilkårene gjelder for bruk av den hostede versjonen av ${APP_NAME_FULL} («tjenesten»), levert av ${COMPANY} (org.nr ${ORGNR}) («vi», «oss»). Ved å opprette en instans aksepterer du vilkårene.`,
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
            "Du er selv ansvarlig for å informere dine egne brukere (ansatte) om bruken, i tråd med personvernregelverket. Se databehandleravtalen.",
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
            "Du kan si opp abonnementet når som helst med virkning fra utløpet av inneværende betalingsperiode. Ved oppsigelse settes instansen på pause og dataene slettes etter en rimelig oppbevaringsperiode, jf. databehandleravtalen. Vi kan si opp eller suspendere tjenesten ved vesentlig mislighold eller manglende betaling.",
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
            "I den grad loven tillater det, er vårt samlede ansvar begrenset til det du har betalt for tjenesten de siste tolv månedene. Vi er ikke ansvarlige for indirekte tap, tapte data utover det som følger av databehandleravtalen, eller tap som skyldes forhold utenfor vår kontroll.",
          ],
        },
        {
          heading: "8. Personvern og databehandling",
          body: [
            "For personopplysninger vi behandler på dine vegne er du behandlingsansvarlig og vi databehandler. Dette reguleres av vår databehandleravtale, som utgjør en del av disse vilkårene. Se også personvernerklæringen.",
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
            `Vilkårene reguleres av norsk rett. Tvister søkes løst i minnelighet; hvis ikke, er verneting ${ADDRESS} sitt hjemting.`,
          ],
        },
        {
          heading: "11. Kontakt",
          body: [`Spørsmål? Kontakt oss på ${CONTACT_EMAIL}.`],
        },
      ],
    },
    personvern: {
      title: "Personvernerklæring",
      metaDescription: `Hvordan ${APP_NAME_FULL} behandler personopplysninger – for besøkende og kunder.`,
      updated: "2. juli 2026",
      intro: [
        `Denne erklæringen beskriver hvordan ${COMPANY} (org.nr ${ORGNR}) behandler personopplysninger. For besøkende på nettsiden og for kontoinnehavere er vi behandlingsansvarlig. For opplysninger som ligger inne i en kundes instans (f.eks. ansattes kallenavn og konsumhendelser) er kunden behandlingsansvarlig og vi databehandler – se databehandleravtalen.`,
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
          body: [`Behandlingsansvarlig: ${COMPANY}, ${ADDRESS}. E-post: ${CONTACT_EMAIL}.`],
        },
      ],
    },
    databehandleravtale: {
      title: "Databehandleravtale (DPA)",
      metaDescription: `Databehandleravtale mellom kunden (behandlingsansvarlig) og ${COMPANY} (databehandler) for den hostede tjenesten.`,
      updated: "2. juli 2026",
      intro: [
        `Denne databehandleravtalen («avtalen») inngås mellom kunden («behandlingsansvarlig») og ${COMPANY} (org.nr ${ORGNR}) («databehandler») og regulerer databehandlers behandling av personopplysninger på vegne av behandlingsansvarlig i forbindelse med den hostede tjenesten. Avtalen er en del av vilkårene og gjelder så lenge behandlingen pågår.`,
      ],
      sections: [
        {
          heading: "1. Formål og omfang",
          body: [
            "Databehandler behandler personopplysninger utelukkende for å levere den hostede tjenesten til behandlingsansvarlig, og kun etter dokumenterte instrukser fra behandlingsansvarlig – herunder disse vilkårene og bruken av tjenesten.",
          ],
        },
        {
          heading: "2. Kategorier av registrerte og personopplysninger",
          body: ["Behandlingen omfatter typisk:"],
          bullets: [
            "Registrerte: behandlingsansvarliges ansatte og brukere av instansen.",
            "Opplysninger: kallenavn, avdeling, valgfritt profilbilde (avatar), administrators e-postadresse, og hendelser om logget konsum (drikketype, tidspunkt, stasjon).",
            "Ingen særlige kategorier av personopplysninger skal legges inn i tjenesten.",
          ],
        },
        {
          heading: "3. Databehandlers plikter",
          bullets: [
            "Behandle personopplysninger kun etter behandlingsansvarliges instruks.",
            "Sikre at personer med tilgang har taushetsplikt.",
            "Iverksette egnede tekniske og organisatoriske sikkerhetstiltak (GDPR art. 32), herunder kryptert overføring, tilgangsstyring og sikkerhetskopi.",
            "Bistå behandlingsansvarlig med å oppfylle plikter overfor de registrerte og tilsynsmyndigheter.",
          ],
        },
        {
          heading: "4. Underdatabehandlere",
          body: [
            "Behandlingsansvarlig gir generell forhåndsgodkjenning til bruk av underdatabehandlere. Databehandler inngår avtale med hver underdatabehandler med tilsvarende forpliktelser, og varsler ved planlagte endringer slik at behandlingsansvarlig kan protestere. Nåværende underdatabehandlere:",
          ],
          bullets: [
            "Hetzner Online GmbH – hosting/lagring (EU).",
            "Stripe – betalingsbehandling.",
            "Resend – transaksjons-e-post.",
          ],
        },
        {
          heading: "5. Aggregerte og anonymiserte data",
          body: [
            "Databehandler kan produsere aggregerte og anonymiserte data fra behandlingen – for eksempel et samlet totaltall for antall loggede kopper på tvers av alle kunder – og bruke slike data til statistikk, drift, forbedring og markedsføring av tjenesten. Dette er kun tillatt når dataene er irreversibelt anonymisert slik at verken en registrert eller en enkeltkunde kan identifiseres. Slike anonyme data regnes ikke som personopplysninger og er ikke underlagt denne avtalen.",
          ],
        },
        {
          heading: "6. Registrertes rettigheter og sikkerhetsbrudd",
          body: [
            "Databehandler bistår behandlingsansvarlig med å besvare henvendelser fra registrerte om deres rettigheter. Ved brudd på personopplysningssikkerheten varsler databehandler behandlingsansvarlig uten ugrunnet opphold, og bistår med nødvendig informasjon.",
          ],
        },
        {
          heading: "7. Overføring til tredjeland",
          body: [
            "Personopplysninger behandles og lagres innenfor EU/EØS og overføres ikke til land utenfor EØS uten at det foreligger et gyldig overføringsgrunnlag og behandlingsansvarliges godkjenning.",
          ],
        },
        {
          heading: "8. Sletting og retur",
          body: [
            "Ved opphør av tjenesten sletter databehandler, etter behandlingsansvarliges valg, alle personopplysninger eller returnerer dem, og sletter eksisterende kopier innen en rimelig frist, med mindre lagring er lovpålagt.",
          ],
        },
        {
          heading: "9. Revisjon",
          body: [
            "Databehandler gjør tilgjengelig informasjon som er nødvendig for å dokumentere at pliktene i denne avtalen overholdes, og muliggjør revisjoner på rimelige vilkår.",
          ],
        },
        {
          heading: "10. Varighet og lovvalg",
          body: [
            "Avtalen gjelder så lenge databehandler behandler personopplysninger på vegne av behandlingsansvarlig. Avtalen reguleres av norsk rett.",
          ],
        },
        {
          heading: "11. Kontakt",
          body: [`Spørsmål om databehandlingen: ${CONTACT_EMAIL}.`],
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
        `These terms govern the use of the hosted version of ${APP_NAME_FULL} (the "service"), provided by ${COMPANY} (company no. ${ORGNR}) ("we", "us"). By creating an instance you accept these terms.`,
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
            "You are responsible for informing your own users (employees) about the use, in line with data protection law. See the data processing agreement.",
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
            "You may cancel at any time, effective at the end of the current billing period. On cancellation the instance is paused and data is deleted after a reasonable retention period, per the data processing agreement. We may suspend or terminate the service for material breach or non-payment.",
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
            "To the extent permitted by law, our total liability is limited to the amount you paid for the service in the preceding twelve months. We are not liable for indirect losses, data loss beyond what follows from the data processing agreement, or losses caused by circumstances beyond our control.",
          ],
        },
        {
          heading: "8. Privacy and data processing",
          body: [
            "For personal data we process on your behalf, you are the controller and we are the processor. This is governed by our data processing agreement, which forms part of these terms. See also the privacy policy.",
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
          body: [`Questions? Contact us at ${CONTACT_EMAIL}.`],
        },
      ],
    },
    personvern: {
      title: "Privacy Policy",
      metaDescription: `How ${APP_NAME_FULL} processes personal data – for visitors and customers.`,
      updated: "2 July 2026",
      intro: [
        `This policy describes how ${COMPANY} (company no. ${ORGNR}) processes personal data. For website visitors and account holders we are the controller. For data held inside a customer's instance (e.g. employees' nicknames and consumption events) the customer is the controller and we are the processor – see the data processing agreement.`,
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
          body: [`Controller: ${COMPANY}, ${ADDRESS}. Email: ${CONTACT_EMAIL}.`],
        },
      ],
    },
    databehandleravtale: {
      title: "Data Processing Agreement (DPA)",
      metaDescription: `Data processing agreement between the customer (controller) and ${COMPANY} (processor) for the hosted service.`,
      updated: "2 July 2026",
      intro: [
        `This data processing agreement (the "agreement") is entered into between the customer (the "controller") and ${COMPANY} (company no. ${ORGNR}) (the "processor") and governs the processor's processing of personal data on behalf of the controller in connection with the hosted service. It forms part of the terms and applies for as long as the processing continues.`,
      ],
      sections: [
        {
          heading: "1. Purpose and scope",
          body: [
            "The processor processes personal data solely to provide the hosted service to the controller, and only on documented instructions from the controller – including these terms and the use of the service.",
          ],
        },
        {
          heading: "2. Categories of data subjects and personal data",
          body: ["The processing typically covers:"],
          bullets: [
            "Data subjects: the controller's employees and users of the instance.",
            "Data: nickname, department, optional profile picture (avatar), the admin's email address, and consumption events (drink type, time, station).",
            "No special categories of personal data are to be entered into the service.",
          ],
        },
        {
          heading: "3. Processor obligations",
          bullets: [
            "Process personal data only on the controller's instructions.",
            "Ensure persons with access are bound by confidentiality.",
            "Implement appropriate technical and organisational security measures (GDPR Art. 32), including encrypted transfer, access control and backups.",
            "Assist the controller in meeting its obligations towards data subjects and supervisory authorities.",
          ],
        },
        {
          heading: "4. Sub-processors",
          body: [
            "The controller gives general prior authorisation for the use of sub-processors. The processor enters into agreements with each sub-processor with equivalent obligations, and gives notice of planned changes so the controller can object. Current sub-processors:",
          ],
          bullets: [
            "Hetzner Online GmbH – hosting/storage (EU).",
            "Stripe – payment processing.",
            "Resend – transactional email.",
          ],
        },
        {
          heading: "5. Aggregated and anonymised data",
          body: [
            "The processor may produce aggregated and anonymised data from the processing – for example a combined total of cups logged across all customers – and use such data for statistics, operation, improvement and marketing of the service. This is permitted only where the data is irreversibly anonymised so that neither a data subject nor an individual customer can be identified. Such anonymous data is not personal data and is not subject to this agreement.",
          ],
        },
        {
          heading: "6. Data subject rights and breaches",
          body: [
            "The processor assists the controller in responding to data subject requests. In the event of a personal data breach, the processor notifies the controller without undue delay and assists with the necessary information.",
          ],
        },
        {
          heading: "7. International transfers",
          body: [
            "Personal data is processed and stored within the EU/EEA and is not transferred outside the EEA without a valid transfer basis and the controller's approval.",
          ],
        },
        {
          heading: "8. Deletion and return",
          body: [
            "On termination of the service, the processor – at the controller's choice – deletes or returns all personal data and deletes existing copies within a reasonable period, unless storage is required by law.",
          ],
        },
        {
          heading: "9. Audit",
          body: [
            "The processor makes available information necessary to demonstrate compliance with this agreement and allows for audits on reasonable terms.",
          ],
        },
        {
          heading: "10. Duration and governing law",
          body: [
            "The agreement applies for as long as the processor processes personal data on behalf of the controller. It is governed by Norwegian law.",
          ],
        },
        {
          heading: "11. Contact",
          body: [`Questions about the processing: ${CONTACT_EMAIL}.`],
        },
      ],
    },
  },
};
