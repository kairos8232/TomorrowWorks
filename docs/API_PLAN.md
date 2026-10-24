# API plan for TomorrowWorks

> **Proposed decision (21 Oct 2026):** DOSM Job Market Insights (demand) + ILO GenAI exposure index (AI exposure) + ESCO role skills. See [SIGNALS_AND_MATCHING.md](SIGNALS_AND_MATCHING.md). The rest of this file remains the wider candidate menu.

This is a menu of proposed sources, not a requirement to integrate every API. [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) defines the public claims each source must support. The Domain 1 brief requires at least one **updatable** AI or job-market trend source, with its name and date; hard-coded lists alone do not count. It does not require a live API call during the demo. The preliminary demo needs a rough, working feature, preferably trend evidence feeding role matching. Stage 1 of [CHECKLIST.md](CHECKLIST.md) chooses the minimum source and verifies that changed input changes the output.

## Next sources (decided 21 Oct 2026, 02:24)

DOSM Job Market Insights is quarterly and lags (Q2 2026 was released on 18 Aug 2026). Three additions make the app more current and more Malaysian, each in its own role:

| Source | Where it shows | What it may say | What it must not do | Access |
| --- | --- | --- | --- | --- |
| **GDELT DOC 2.0 API** (news index) | *Workplace changes* view | "This Malaysian outlet reported this on this date" — headline, outlet, date, link, topic tag (AI adoption, layoffs, hiring, reskilling) | Change any score; count articles as job demand or severity; copy article text | Free, no key; filter to Malaysian sources and a recent window; cite GDELT and link each original article ([terms](https://gdeltproject.org/about.html)). Store a dated snapshot with a refresh script; show "retrieved" date. **One request** for all topics (GDELT returned 429 on repeated calls, 21 Oct 2026); topic tags come from the topic terms found in the headline, else "Other". |
| **OpenDOSM `lfs_month`** (monthly Labour Force Survey) | *Demand* view, as context above the job-ad table | The published monthly unemployment rate (and labour force) for the latest month, with the month | Be mixed into the role score; be compared with job-ad counts as if the same measure | [Data catalogue](https://open.dosm.gov.my/data-catalogue/lfs_month); free API, no key, published rate limit 4 requests/min. Check fields and the latest month before display. |
| **NOSS** (National Occupational Skills Standards, Department of Skills Development / JPK) | *My pathway*, per role | "Malaysian certification route: SKM level n under NOSS <code>", with the official link | Claim a certificate is required for a job or promotion; invent a NOSS code | [JPK NOSS page](https://web.dsd.gov.my/index.php/en/tender/9-explore/1720-noss-eng-new). Look up each of the nine roles by hand; record code, title, level and link, or "no matching NOSS found". **Done 21 Oct 2026:** `data/pathway/noss.json`, from the current JPK register (22 Jan 2025) with page numbers. |

**Why ESCO still fits Malaysia:** ESCO, ILO WP140 and DOSM all use ISCO-08 occupation codes, and MASCO 2020 is built on ISCO-08, so the codes join directly. ESCO's skill descriptions come from an EU context and contain no Malaysian qualifications; NOSS/SKM and HRD Corp-claimable courses fill that local layer. Pitch line: *ESCO gives the shared skills vocabulary; DOSM and ILO give Malaysian demand and AI exposure; NOSS/SKM and HRD Corp give the local learning route.*

Background for the PRD: PERKESO's report [*Employment Outlook: Leveraging Artificial Intelligence in Bridging Occupations Qualifications*](https://lmx.perkeso.gov.my/bm/storage/2024/02/Employment-Outlook-Leveraging-Artificial-Intelligence-in-Bridging-Occupations-Qualifications.pdf) (2024).

## Cross-industry source map

| Signal type | Possible source | What the app may say | What it must not infer |
| --- | --- | --- | --- |
| Reported workplace issue | Dated news or official announcement metadata | “This source reported this issue for this industry.” | That the issue affects every worker, that coverage equals severity, or that jobs are growing/declining. |
| Advertised role or skill | Permitted job-ad API sample | “These ads in this sample mention this role or skill.” | Total hiring, national vacancies, or a reliable future forecast. |
| Labour-market context | Relevant official dataset | The published statistic, period, geography, and definition. | Role-level demand unless the dataset actually measures it. |
| Occupation/skill relationship | Reviewed classification source | A source describes a role as related to a skill. | That the relationship is validated for every Malaysian employer. |
| Certificate or qualification requirement | Dated employer posting, regulator, or professional body for the target role and jurisdiction | A specific credential is required or preferred **by that source**. | That a certificate is mandatory for every employer or promotion, or that a public news story proves it. |
| Future outlook | Documented scenario combining dated inputs | “Under these assumptions, this estimate changes.” | A guaranteed outcome or a present-day measurement. |

Every imported item needs a source name, original URL, publication date or period, retrieval date, geography, industry tag and tagging method, signal type, and coverage/limitations. A measure is required for any numeric claim. A personal credential requirement also needs the target role, jurisdiction, issuing or requiring body, and whether it is required or preferred. Keep original evidence separate from any inferred issue label or scenario output. Search and industry filters operate only on available records; an empty result must say whether the source has no coverage or no match.

The architecture can serve people in any industry, but the first sourced snapshot will cover only the industries verified in that source. Do not label an “All industries” view as complete national coverage.

## Smallest valid demo data path

1. Choose one public, updatable trend source and record its URL, publication date, retrieval date, licence or usage terms, and the meaning of its measure.
2. Import a small, real, attributed sample from that source into the app. A repeatable refresh command or documented import process must be able to replace it with newer source data; a fixed list typed into the code is insufficient.
3. Show the source and date beside the displayed signal. Label a saved sample as a snapshot, not live data.
4. Demonstrate that changing the sourced trend data changes at least one recommendation, rank, or explanation. Synthetic profiles and synthetic test fixtures are fine, but a synthetic trend list alone does not satisfy the source requirement.

This path needs no live API dependency during judging. An API integration is useful if access and terms allow it, but can be added in a later small stage.

## News and official-announcement candidates

| Source | Product use | Access and boundary |
| --- | --- | --- |
| [GDELT DOC 2.0 API](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/) | Candidate for dated article links about workplace changes across industries. Search terms and industry tagging rules need testing. | [GDELT's terms](https://gdeltproject.org/about.html) require a GDELT citation and link when its data is used. Check live response quality, Malaysia relevance, and publisher rights before showing article metadata. A matching article is news coverage, not verified labour demand. No live response has been tested for this project yet. |
| [NewsAPI](https://newsapi.org/docs) | Alternative article-search candidate if its coverage fits. | Its [Developer plan](https://newsapi.org/pricing) is limited to development/testing and cannot power a deployed Replit demo under that plan. It needs a key and appropriate access terms; no key or live response has been tested. |
| Government or agency announcements | Candidate for directly attributable policy, training, or industry notices. | Select a specific feed/API and check its terms, update dates, and relevance before integration. |

Collect permitted metadata and link to the original article or announcement. Do not copy full article bodies into the repository or create a news archive. Use an explicit, reviewable topic rule for “automation,” “skills shortage,” “wages,” or another issue tag; never turn a headline into a measured labour-market claim.

## Job and official-statistics sources to test

| Source | Product use | What its data means | Access and check |
| --- | --- | --- | --- |
| [Jooble Malaysia REST API](https://my.jooble.org/api/about) | Possible source of Malaysian job ads for target roles and skill mentions. | A sample of advertised vacancies, not a complete measure of Malaysian hiring or future demand. | Requires a Malaysia-specific API key. The [REST API documentation](https://help.jooble.org/en/support/solutions/articles/60001448238-rest-api-documentation) describes a free plan with 500 requests per key for its lifetime. Test response fields, coverage, dates, and permission for the intended display/analysis before relying on it. Not required if another suitable public source is chosen. |
| [Malaysia's Official Open API](https://developer.data.gov.my/quickstart) and [OpenDOSM catalogue](https://open.dosm.gov.my/data-catalogue) | Add Malaysian employment and wage context beside career recommendations. The [employment by sector dataset](https://open.dosm.gov.my/data-catalogue/employment_sector) is a candidate for broad sector context. | Official labour statistics, often broader and slower moving than individual job ads. The employment-by-sector dataset is annual employment share, not live vacancies or skill demand. | No API token is required; the [published limit](https://developer.data.gov.my/rate-limit) for the Data Catalogue and OpenDOSM endpoints is four requests per minute. Confirm the chosen dataset's fields, licence, geography, and update date before use. |

## Supporting sources to test

| Source | Product use | Boundary |
| --- | --- | --- |
| [ESCO occupation and skills API](https://esco.ec.europa.eu/en/use-esco/use-esco-services-api) | Supply consistent occupation names and skill relationships for explainable matching and skills gaps. | It describes a European classification, so validate role names and skills for the Malaysian example. ESCO [announced an API transition](https://esco.ec.europa.eu/pt/node/617) that will require a key; check the current access method before integration. |
| [OpenAlex API](https://help.openalex.org/api/) | Optional dated AI research signal for a clearly labelled research activity view. | Research publications are not evidence of Malaysian job demand. Keep this out of the first demo unless it adds a useful, explainable signal. |

The [arXiv API](https://info.arxiv.org/help/api/index.html) is another optional research source. It is not required for the first demo. We have checked its official documentation, but have not verified a live API response from the intended runtime.

## How the sources would work together

1. A visitor browses available public evidence by industry and search term without a profile. News, advertised vacancies, official statistics, and future estimates stay visibly distinct.
2. The chosen public trend source supplies a dated sample or live response. Extract role and skill signals only when the source supports them, using documented rules; retain source URLs and dates. A separate permitted news source may supply reported workplace issues.
3. ESCO can supply candidate role-to-skill relationships. Compare the profile with those relationships and explain the matched and missing skills. Any Malaysian adaptation must be recorded.
4. OpenDOSM can supply dated labour-market context where a relevant dataset exists. Display its measure separately from vacancy counts.
5. The app combines these signals in a documented recommendation formula, then shows a learning pathway. RunPod's GPU result should have a defined, visible role in that flow; Replit hosts the app and keeps API credentials in secrets.
6. SDG links are explained from reviewed role and skill mappings. Do not infer an SDG contribution solely from an API count or a model output.

## Stage 1 validation before implementation

- [ ] Select one public, updatable trend source and verify its sample data, update dates, reuse terms, and fit for the demo claim.
- [ ] Select a small initial set of covered industries; record gaps and the source's industry-tagging method.
- [ ] If workplace news is included, test a permitted article or announcement feed, its reuse rules, and its relevance; keep it distinct from demand.
- [ ] Choose a small attributed snapshot and a repeatable refresh/import method; verify that changed input affects a recommendation or explanation.
- [ ] If Jooble is chosen, obtain a Malaysia key and check its current terms for displaying, retaining, and analysing job ads, as well as the request limit.
- [ ] If OpenDOSM is chosen, select a relevant dataset and check its fields, frequency, update date, and licence.
- [ ] If ESCO is used for matching, test a relevant occupation/skill lookup and note any API-key migration effect.
- [ ] Before naming a certificate as needed for a role or promotion, verify an applicable dated employer, regulator, or professional-body requirement and record whether it is required or preferred.
- [ ] Decide whether an AI research feed is useful for the first demo. If used, test OpenAlex or arXiv and label it as research activity.
- [ ] Record sample fields, request limits, fallback behaviour, and a source-to-feature mapping before checking off the Stage 1 source decision.

If a live source is unavailable during the demo, show a clearly dated, attributed sample response collected under its usage terms. Never present cached or synthetic records as live data.
