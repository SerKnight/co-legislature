// lib/palantir.ts
// This file runs SERVER-SIDE ONLY — never import it in client components

import { Client, createClient } from "@osdk/client";

const token = process.env.PALANTIR_TOKEN!;
const url = process.env.PALANTIR_URL!;
const ontologyRid = process.env.PALANTIR_ONTOLOGY_RID!;

// For bearer token auth, pass an async function that returns the token
const auth = async () => token;

// Export the configured client
export const palantirClient: Client = createClient(url, ontologyRid, auth);