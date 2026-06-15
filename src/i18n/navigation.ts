import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-bevisste erstatninger for next/link og navigasjons-API-ene.
// Bruk disse i stedet for next/link i UI så valgt språk følger med.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
