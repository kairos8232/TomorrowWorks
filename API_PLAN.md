# API plan for TomorrowWorks

This is the proposed data plan for the first working demo. It records what each source would contribute; it does not claim that the integrations or live API responses have been verified. Stage 1 of [CHECKLIST.md](CHECKLIST.md) covers those checks before a source is used in the product.

## Primary sources to test

| Source | Product use | What its data means | Access and check |
| --- | --- | --- | --- |
| [Jooble Malaysia REST API](https://my.jooble.org/api/about) | Find current Malaysian job ads for the demo's target roles; extract visible role and skill mentions and link back to the ads. | A sample of advertised vacancies, not a complete measure of Malaysian hiring or future demand. | Requires a Malaysia-specific API key. The [REST API documentation](https://help.jooble.org/en/support/solutions/articles/60001448238-rest-api-documentation) describes a free plan with 500 requests per key for its lifetime. Test response fields, coverage, dates, and permission for the intended display/analysis before relying on it. |
| [Malaysia's Official Open API](https://developer.data.gov.my/quickstart) and [OpenDOSM catalogue](https://open.dosm.gov.my/data-catalogue) | Add Malaysian employment and wage context beside career recommendations. Query only specific relevant datasets once selected. | Official labour statistics, often broader and slower moving than individual job ads. Do not treat them as live role-level vacancies. | No API token is required; the [published limit](https://developer.data.gov.my/rate-limit) for the Data Catalogue and OpenDOSM endpoints is four requests per minute. Confirm the chosen dataset's fields, licence, geography, and update date. |

## Supporting sources to test

| Source | Product use | Boundary |
| --- | --- | --- |
| [ESCO occupation and skills API](https://esco.ec.europa.eu/en/use-esco/use-esco-services-api) | Supply consistent occupation names and skill relationships for explainable matching and skills gaps. | It describes a European classification, so validate role names and skills for the Malaysian example. ESCO [announced an API transition](https://esco.ec.europa.eu/pt/node/617) that will require a key; check the current access method before integration. |
| [OpenAlex API](https://help.openalex.org/api/) | Optional dated AI research signal for a clearly labelled research activity view. | Research publications are not evidence of Malaysian job demand. Keep this out of the first demo unless it adds a useful, explainable signal. |

The [arXiv API](https://info.arxiv.org/help/api/index.html) is another optional research source. It is not required for the first demo. We have checked its official documentation, but have not verified a live API response from the intended runtime.

## How the sources would work together

1. A synthetic user profile supplies current skills and interests.
2. Jooble supplies a dated sample of relevant Malaysian job ads. Extract role and skill mentions with documented rules; retain a source URL and retrieval date for each signal.
3. ESCO supplies candidate role-to-skill relationships. Compare the profile with those relationships and explain the matched and missing skills. Any Malaysian adaptation must be recorded.
4. OpenDOSM supplies dated labour-market context where a relevant dataset exists. Display its measure separately from vacancy counts.
5. The app combines these signals in a documented recommendation formula, then shows a learning pathway. RunPod's GPU result should have a defined, visible role in that flow; Replit hosts the app and keeps API credentials in secrets.
6. SDG links are explained from reviewed role and skill mappings. Do not infer an SDG contribution solely from an API count or a model output.

## Stage 1 validation before implementation

- [ ] Obtain the needed Jooble Malaysia key and test one small query from Replit without committing the key.
- [ ] Check Jooble's current API terms for displaying, retaining, and analysing job ads; confirm the 500-request lifetime limit.
- [ ] Select one or two relevant OpenDOSM datasets and test their responses, update dates, and licences from Replit.
- [ ] Test ESCO access and a relevant occupation/skill lookup; note any API-key migration effect.
- [ ] Decide whether an AI research feed is useful for the first demo. If used, test OpenAlex or arXiv and label it as research activity.
- [ ] Record sample fields, request limits, fallback behaviour, and a source-to-feature mapping before checking off the Stage 1 source decision.

If a live source is unavailable during the demo, show a clearly dated, attributed sample response collected under its usage terms. Never present cached or synthetic records as live data.
