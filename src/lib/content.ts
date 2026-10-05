/**
 * 4EOS site copy. Facts trace to site.ts or to what 4eos.com publishes.
 * Do not add client names, logos, case studies, certifications, outcome
 * numbers, or guarantees that 4EOS has not published. ProofSlot holds the
 * places where that material goes once it exists.
 */

import { site } from "./site";

export type Qa = { q: string; a: string };

export type GlyphName =
  | "managed"
  | "shield"
  | "cloud"
  | "network"
  | "roadmap"
  | "backup"
  | "phone"
  | "rack"
  | "hardware"
  | "ai";

export type ServiceSlug =
  | "managed-it"
  | "backup-disaster-recovery"
  | "network-infrastructure"
  | "cybersecurity"
  | "cloud-microsoft-365"
  | "it-strategy"
  | "voip"
  | "data-center"
  | "hardware";

export type Service = {
  slug: ServiceSlug;
  href: string;
  /** Page and schema name. */
  title: string;
  /** Short name for menus, cards, and breadcrumbs. */
  short: string;
  glyph: GlyphName;
  /** One line under the title in the mega-menu and footer. */
  menuLine: string;
  /** Outcome headline, the page h1. */
  headline: string;
  /** Meta description and hero lede. */
  summary: string;
  /** The longer case, in paragraphs. */
  body: string[];
  /** What the business is dealing with before 4EOS. */
  problems: string[];
  included: { title: string; body: string }[];
  delivery: string[];
  related: ServiceSlug[];
  faqs: Qa[];
  cta: { label: string; topic: TopicValue };
  parent?: ServiceSlug;
  family?: "Midwest VoIP" | "SafeHouse DataCenter";
};

export const services: Service[] = [
  {
    slug: "managed-it",
    href: "/managed-it",
    title: "Managed IT Services",
    short: "Managed IT",
    glyph: "managed",
    menuLine: "CompleteCare monitoring, help desk, and onsite engineers",
    headline: "IT that is handled before it becomes a problem",
    summary:
      "CompleteCare managed IT from 4EOS: 24/7 monitoring, a live U.S.-based help desk, a primary engineer who knows your environment, and onsite visits from Fort Wayne.",
    body: [
      "Most growing companies do not need more tickets closed faster. They need fewer tickets. CompleteCare is built around that: systems are watched around the clock, patched on a schedule, and maintained so the problems that usually interrupt a workday are caught while they are still small.",
      "When someone does need help, they reach a live, U.S.-based help desk. Remote support is included without per-ticket billing, so no one hesitates to report a small issue. Your primary engineer knows the environment, and Eyes On Site visits mean we also know your office, your people, and how the work actually gets done.",
      "CompleteCare comes in three levels. Base covers the help desk, endpoint support, monitoring, and patching. Pro adds fully managed servers and network, a built-in security layer, backup verification and testing, and vendor management. Premium adds executive IT strategy, quarterly business reviews, compliance program support, and roadmap planning.",
    ],
    problems: [
      "Work stops while people wait for someone to answer",
      "The same issues come back every few weeks",
      "Nobody can say whether patches and backups actually ran",
      "Support is billed by the hour, so small problems go unreported",
    ],
    included: [
      {
        title: "Monitoring around the clock",
        body: "Servers, endpoints, and the network are watched 24/7, so failing drives, full disks, and stopped services are seen before staff notice them.",
      },
      {
        title: "A live, U.S.-based help desk",
        body: `People call or open a request and reach a person, ${site.hoursShort}. Remote help desk support is unlimited and never billed per ticket.`,
      },
      {
        title: "A primary engineer",
        body: "One engineer is assigned to your account and learns the environment. If they are unavailable, a senior engineer is dispatched instead.",
      },
      {
        title: "Eyes On Site",
        body: "Regular onsite engagement and same-day onsite visits when the work needs someone in the room.",
      },
      {
        title: "Patching and maintenance",
        body: "Monthly patching and maintenance on a schedule, so systems stay current without anyone having to remember.",
      },
      {
        title: "Vendor management",
        body: "On Pro and Premium, 4EOS works with your technology vendors so your team does not have to.",
      },
    ],
    delivery: [
      "A free assessment by a senior engineer sets the scope and the fixed monthly price",
      "Onboarding typically takes two to four weeks, with your current support kept in place until monitoring is live",
      "The first month includes an audit of what the previous provider left behind",
      "Cutover happens outside business hours",
    ],
    related: ["cybersecurity", "backup-disaster-recovery", "it-strategy"],
    faqs: [
      {
        q: "How much does managed IT cost?",
        a: "Managed IT is usually priced per user or per device. Across the industry, including at 4EOS, that typically lands between about $100 and $200 per user per month, depending on what is included. The real number depends on team size, locations, compliance requirements, hardware age, and add-ons such as security monitoring or VoIP. 4EOS quotes a fixed monthly price after a free assessment rather than offering a one-size rate.",
      },
      {
        q: "What is the difference between break-fix and managed IT?",
        a: "Break-fix means calling a technician after something fails and paying by the hour for the repair. Managed IT means a provider monitors, patches, and maintains your systems for a predictable monthly fee and fixes most problems before you notice them. With break-fix you pay for downtime. With managed IT you pay to prevent it.",
      },
      {
        q: "How long does it take to switch providers?",
        a: "For a small or mid-sized business, a typical transition takes two to four weeks. That covers documenting the environment, transferring admin access, enrolling devices in monitoring, reviewing backups and security, and introducing your team to the help desk. Your existing support stays in place until monitoring is live, and cutover happens outside business hours.",
      },
      {
        q: "Is help desk support billed per ticket?",
        a: "No. CompleteCare includes unlimited remote help desk support from a live, U.S.-based team, with no per-ticket billing. That keeps costs predictable and means small problems get reported before they turn into outages.",
      },
    ],
    cta: { label: "Get an IT Assessment", topic: "managed-it" },
  },
  {
    slug: "backup-disaster-recovery",
    href: "/managed-it/backup-disaster-recovery",
    parent: "managed-it",
    title: "Backup, Business Continuity and Disaster Recovery",
    short: "Backup & Disaster Recovery",
    glyph: "backup",
    menuLine: "Verified backups, tested restores, and a plan for the bad day",
    headline: "Know your business can recover, before you need to",
    summary:
      "Backup and disaster recovery from 4EOS: verified backups, immutable cloud copies, documented restore testing, and recovery in SafeHouse DataCenter in Fort Wayne.",
    body: [
      "A backup that has never been restored is a hope, not a plan. Many businesses learn that during an outage, a ransomware attack, or a failed server, which is the most expensive moment to find out.",
      "4EOS treats recovery as something to prove. Backups are verified, immutable copies are kept in the cloud, and restores are tested and documented, so you know what can be recovered and how long it takes before an incident forces the question.",
      "Continuity is wider than backup. We work with you to decide which systems matter most, how much data the business can afford to lose, and how quickly each system has to return. Then we connect that plan to your network, security, cloud services, and the SafeHouse DataCenter in Fort Wayne.",
    ],
    problems: [
      "Backups are scheduled, but nobody has tested a restore",
      "There is no agreed answer to which systems come back first",
      "One ransomware event could reach the backups too",
      "Recovery depends on one person remembering how it works",
    ],
    included: [
      {
        title: "Backup verification",
        body: "Backup jobs are checked, not just scheduled, so a failed job is caught the day it fails.",
      },
      {
        title: "Immutable cloud copies",
        body: "Backup copies protected from being changed or deleted, designed to keep a clean recovery point even if the network is compromised.",
      },
      {
        title: "Documented restore testing",
        body: "Restores are run and recorded, so recovery is demonstrated, not assumed.",
      },
      {
        title: "Recovery priorities",
        body: "We agree with you which systems are critical, how much data loss is acceptable, and how fast each system must be restored.",
      },
      {
        title: "Offsite recovery in Fort Wayne",
        body: "Remote backup and disaster recovery in SafeHouse DataCenter, part of the 4EOS family.",
      },
      {
        title: "A written plan",
        body: "Who does what during an incident, written down and reviewed, so recovery does not depend on one person's memory.",
      },
    ],
    delivery: [
      "Start with a review of what is backed up today and whether it can be restored",
      "Agree recovery priorities for each critical system",
      "Put verification, immutable copies, and offsite recovery in place",
      "Test restores on a schedule and report the results",
    ],
    related: ["data-center", "cybersecurity", "managed-it"],
    faqs: [
      {
        q: "How do I know my backups actually work?",
        a: "Only by restoring from them. 4EOS verifies backup jobs, keeps immutable cloud copies, and runs documented restore tests, so you can confirm data is recoverable before an incident makes you find out.",
      },
      {
        q: "What is the difference between backup and disaster recovery?",
        a: "Backup is a copy of your data. Disaster recovery is the plan and the infrastructure to get the business running again: which systems come back first, how much data loss is acceptable, how fast systems must return, and who is responsible during the incident.",
      },
      {
        q: "Where are recovery copies kept?",
        a: "Immutable copies are kept in the cloud, and remote backup and disaster recovery are available in SafeHouse DataCenter in Fort Wayne, part of the 4EOS family.",
      },
    ],
    cta: { label: "Get an IT Assessment", topic: "backup" },
  },
  {
    slug: "network-infrastructure",
    href: "/managed-it/network-infrastructure",
    parent: "managed-it",
    title: "Network and Infrastructure",
    short: "Network & Infrastructure",
    glyph: "network",
    menuLine: "Servers, networks, and site connectivity that hold up",
    headline: "A network your business can grow on",
    summary:
      "Network and infrastructure from 4EOS: managed servers and networks, connectivity between offices and job sites, hybrid environments, and Dell and Cisco hardware sized to the work.",
    body: [
      "The network is the part of IT nobody thinks about until it slows down or stops. Then everything stops with it: phones, line-of-business software, cloud apps, and the payment system.",
      "4EOS designs, runs, and maintains the servers, network, and connections your business runs on, across one office or several sites. When the business adds a location, a production line, or a remote team, the network is planned for it instead of patched around it.",
      "Because we also manage the security, cloud services, backup, and help desk, network decisions are made with the rest of the environment in view. As the largest Dell reseller in Northeast Indiana, with Microsoft and Cisco partnerships, we can source the equipment as well as run it.",
    ],
    problems: [
      "Slow or dropped connections that nobody can explain",
      "Each office or site was set up differently",
      "Servers and network gear past warranty and out of date",
      "New locations take too long to bring online",
    ],
    included: [
      {
        title: "Managed servers and network",
        body: "Servers and network equipment monitored and maintained as part of CompleteCare Pro and Premium.",
      },
      {
        title: "Multi-site connectivity",
        body: "Secure connections between offices, plants, job sites, and remote staff.",
      },
      {
        title: "Hybrid infrastructure",
        body: "On-premise systems where the work still belongs on-premise, connected cleanly to Microsoft 365 and Azure.",
      },
      {
        title: "Lifecycle planning",
        body: "A record of what you own, what is aging out, and when to replace it, so hardware is budgeted instead of failing first.",
      },
      {
        title: "Sourcing and installation",
        body: "Dell and Cisco equipment specified to the work, procured, and installed by the engineers who will support it.",
      },
    ],
    delivery: [
      "Document the current network, servers, and warranties",
      "Fix the risks that could take the business down first",
      "Standardize sites so each one is supported the same way",
      "Plan replacements and new sites in the technology roadmap",
    ],
    related: ["managed-it", "hardware", "cloud-microsoft-365"],
    faqs: [
      {
        q: "Can 4EOS support businesses with more than one location?",
        a: "Yes. 4EOS manages networks, servers, and secure connections across offices, plants, job sites, and remote staff, and plans new locations into the technology roadmap.",
      },
      {
        q: "Do you supply the hardware as well as manage it?",
        a: "Yes. 4EOS is the largest Dell reseller in Northeast Indiana and works with Microsoft and Cisco, so equipment can be specified, procured, installed, and supported by the same team.",
      },
    ],
    cta: { label: "Talk to an IT Expert", topic: "network" },
  },
  {
    slug: "cybersecurity",
    href: "/cybersecurity",
    title: "Cybersecurity and Compliance",
    short: "Cybersecurity",
    glyph: "shield",
    menuLine: "NIST-based protection, monitoring, training, and audit support",
    headline: "Security you can explain to your board and your auditor",
    summary:
      "Cybersecurity from 4EOS: a layered defense structured on the NIST Cybersecurity Framework, real-time monitoring, security awareness training, and HIPAA, PCI, and SEC compliance support.",
    body: [
      "Most leaders cannot answer a simple question with confidence: if someone tried to get in today, would we know, and could we recover? Insurers, auditors, and customers are asking that question more often.",
      "4EOS builds security on the NIST Cybersecurity Framework, so protection is structured instead of a collection of products. That means knowing what you have, protecting it in layers, detecting threats early, responding quickly, and recovering cleanly.",
      "People are part of the defense. Security awareness training teaches staff to spot phishing and suspicious requests. Where regulations apply, we help you meet HIPAA, PCI, and SEC requirements and keep the evidence ready for an audit.",
    ],
    problems: [
      "No clear picture of where the business is exposed",
      "Cyber insurance and customer questionnaires are getting harder",
      "Staff are the most targeted entry point",
      "Compliance evidence is scattered or missing",
    ],
    included: [
      {
        title: "A NIST-based structure",
        body: "Your security program organized around the NIST Cybersecurity Framework: identify, protect, detect, respond, and recover.",
      },
      {
        title: "Early detection and real-time monitoring",
        body: "Threats are watched for continuously, so suspicious activity is investigated early instead of discovered later.",
      },
      {
        title: "Security awareness training",
        body: "Training for the people who receive the phishing email, so they recognize it and report it.",
      },
      {
        title: "Compliance support",
        body: "Help meeting HIPAA, PCI, and SEC requirements, with documentation kept audit-ready.",
      },
      {
        title: "Recovery that is tested",
        body: "Security connects to verified backups and tested restores, because recovery is the last layer of defense.",
      },
      {
        title: "Secure AI adoption",
        body: "SecureAI gives the team access to leading AI models without sending company data to personal accounts.",
      },
    ],
    delivery: [
      "Assess the current security and patching posture",
      "Rank the gaps by what could actually hurt the business",
      "Close the most serious gaps first, then build out the remaining controls",
      "Monitor continuously and review the program with leadership",
    ],
    related: ["managed-it", "backup-disaster-recovery", "it-strategy"],
    faqs: [
      {
        q: "What cybersecurity framework does 4EOS follow?",
        a: "4EOS structures security on the NIST Cybersecurity Framework, which organizes protection into identifying assets and risks, protecting systems, detecting threats, responding to incidents, and recovering.",
      },
      {
        q: "Can 4EOS help with HIPAA, PCI, or SEC requirements?",
        a: "Yes. 4EOS provides compliance support for HIPAA, PCI, and SEC requirements, including the technical controls and documentation an auditor will ask for.",
      },
      {
        q: "Do you train employees?",
        a: "Yes. Security awareness training is part of the program, because phishing and social engineering usually target people rather than systems.",
      },
    ],
    cta: { label: "Talk to an IT Expert", topic: "cybersecurity" },
  },
  {
    slug: "cloud-microsoft-365",
    href: "/cloud-microsoft-365",
    title: "Cloud and Microsoft 365",
    short: "Cloud & Microsoft 365",
    glyph: "cloud",
    menuLine: "Microsoft 365, Azure, and hybrid environments, managed as one",
    headline: "The right systems in the cloud, and only the right ones",
    summary:
      "Cloud and Microsoft 365 services from 4EOS: migration planning and execution, Microsoft 365 and Azure management, hybrid environments, and licensing reviews.",
    body: [
      "Moving to the cloud is not a goal on its own. Some workloads belong there, some are cheaper and faster on-premise, and many businesses are paying for licenses and services nobody uses.",
      "4EOS helps you decide what should move, plans the migration before anything is moved, and then manages Microsoft 365, Azure, and the remaining on-premise systems as one environment, with the same security, backup, and support behind all of it.",
      "Cloud decisions sit inside your technology roadmap. That gives you one partner reviewing cloud services, licensing, security, networks, backup, and infrastructure, instead of several vendors managing overlapping pieces.",
    ],
    problems: [
      "Microsoft 365 licenses and settings nobody has reviewed",
      "A migration that stalled halfway",
      "Cloud bills that keep growing without explanation",
      "Files and identities spread across too many systems",
    ],
    included: [
      {
        title: "Migration planning and execution",
        body: "Email, files, and applications moved on a plan, with the order and the cutover agreed in advance.",
      },
      {
        title: "Microsoft 365 management",
        body: "Accounts, security settings, and licensing managed and reviewed, not left on defaults.",
      },
      {
        title: "Azure management",
        body: "Azure workloads run, secured, and monitored alongside everything else.",
      },
      {
        title: "Hybrid environments",
        body: "On-premise systems kept where they make sense and connected cleanly to the cloud.",
      },
      {
        title: "Licensing and cost review",
        body: "Unused licenses and resources found and removed, and cloud costs compared honestly with onsite options.",
      },
    ],
    delivery: [
      "Review what you run today and what it costs",
      "Decide what should move, what should stay, and what should be retired",
      "Migrate in planned stages with agreed cutovers",
      "Manage, secure, and back up the result as one environment",
    ],
    related: ["managed-it", "cybersecurity", "data-center"],
    faqs: [
      {
        q: "Which cloud platforms does 4EOS manage?",
        a: "4EOS manages Microsoft 365 and Azure, along with hybrid and on-premise infrastructure, as one environment.",
      },
      {
        q: "Should everything move to the cloud?",
        a: "Not always. 4EOS compares cloud and onsite options for each workload, including cost, performance, and security, and keeps on-premise systems where they still make sense.",
      },
      {
        q: "How does a migration work?",
        a: "The migration is planned before anything is moved: what moves, in what order, and when each cutover happens. Then 4EOS executes it and manages the result.",
      },
    ],
    cta: { label: "Talk to an IT Expert", topic: "cloud" },
  },
  {
    slug: "it-strategy",
    href: "/it-strategy",
    title: "IT Strategy and vCIO",
    short: "IT Strategy / vCIO",
    glyph: "roadmap",
    menuLine: "Executive IT leadership, roadmaps, and budgets without a full-time CIO",
    headline: "IT leadership without hiring a full-time CIO",
    summary:
      "IT strategy and vCIO services from 4EOS: executive-level IT guidance, a prioritized technology roadmap, budget planning, quarterly business reviews, and technology due diligence.",
    body: [
      "Many growing companies spend real money on technology without a plan. Purchases are made in emergencies, tools overlap, and nobody owns the question of what the business will need next year.",
      "A 4EOS vCIO acts as your part-time technology executive. We learn where the business is going, including hiring, new locations, customers, and compliance obligations, and turn that into a prioritized roadmap: what to invest in now, what can wait, and what to retire.",
      "The roadmap is reviewed with leadership at quarterly business reviews, projects are quoted in advance, and budgets are built from the plan instead of from surprises.",
    ],
    problems: [
      "IT spending is reactive and hard to forecast",
      "Technology decisions fall to whoever is closest",
      "Growth plans do not account for systems, security, or support",
      "Leadership gets technical detail instead of business options",
    ],
    included: [
      {
        title: "Executive IT strategy",
        body: "A vCIO who speaks in business terms and connects technology decisions to goals, risk, operations, and budget.",
      },
      {
        title: "A prioritized roadmap",
        body: "A written plan ranked by business impact, updated as the business changes.",
      },
      {
        title: "Quarterly business reviews",
        body: "A regular meeting with leadership to review the environment, the risks, and the next projects.",
      },
      {
        title: "Budget planning",
        body: "Projects quoted in advance and a technology budget built from the roadmap.",
      },
      {
        title: "Compliance program support",
        body: "Requirements from regulators, insurers, and customers translated into practical controls and owners.",
      },
      {
        title: "Technology due diligence",
        body: "For acquisitions and investors: a read on the technology before a deal closes, and a plan to bring it onto one standard after.",
      },
    ],
    delivery: [
      "Start with your business goals, not a product list",
      "Assess the current environment and rank the gaps",
      "Build the roadmap and the budget together",
      "Review progress with leadership every quarter",
    ],
    related: ["managed-it", "cybersecurity", "cloud-microsoft-365"],
    faqs: [
      {
        q: "What is a vCIO?",
        a: "A virtual CIO is a part-time technology executive. At 4EOS, the vCIO builds and maintains your technology roadmap, plans the budget, runs quarterly business reviews, and advises leadership on technology decisions.",
      },
      {
        q: "Is IT strategy included in managed IT?",
        a: "Executive-level IT strategy, quarterly business reviews, compliance program support, and roadmap planning are part of CompleteCare Premium. Strategy work can also be scoped on its own.",
      },
      {
        q: "Can 4EOS review technology before an acquisition?",
        a: "Yes. 4EOS provides technology due diligence before a deal closes, then onboards the new company onto one security and support standard.",
      },
    ],
    cta: { label: "Schedule a Consultation", topic: "strategy" },
  },
  {
    slug: "voip",
    href: "/voip",
    family: "Midwest VoIP",
    title: "Business VoIP by Midwest VoIP",
    short: "Midwest VoIP",
    glyph: "phone",
    menuLine: "Business phone systems, porting, and training",
    headline: "Business phones that work the way your team does",
    summary:
      "Business-class VoIP from Midwest VoIP, part of the 4EOS family: PBX installation, number porting, call routing, queues, ring groups, mobile apps, and end-user training.",
    body: [
      "Phones are still how many customers reach a business. Dropped calls, missed transfers, and a system nobody knows how to change cost revenue quietly.",
      "Midwest VoIP is part of the 4EOS family. It installs and supports business-class VoIP, moves your existing numbers, and sets up routing, queues, and ring groups around how calls should actually flow.",
      "Because the same family runs your IT, the phones and the network are planned together, and there is one number to call when something needs to change.",
    ],
    problems: [
      "An aging phone system that is hard to change",
      "Calls that do not reach the right person",
      "Remote and mobile staff without a business line",
      "Separate vendors for phones and for the network they run on",
    ],
    included: [
      {
        title: "PBX installation",
        body: "A business-class phone system installed and configured for your organization.",
      },
      {
        title: "Number porting",
        body: "Your existing numbers moved over.",
      },
      {
        title: "Routing, queues, and ring groups",
        body: "Calls routed to the right people, with queues and ring groups built around your workflow.",
      },
      {
        title: "Mobile app setup",
        body: "Staff can take business calls away from the desk.",
      },
      {
        title: "End-user training",
        body: "Training is included so the team uses the features they are paying for.",
      },
    ],
    delivery: [
      "Map how calls should flow today and as the team grows",
      "Port numbers and install the system",
      "Train the team",
      "Support it with the same family that runs your IT",
    ],
    related: ["managed-it", "network-infrastructure", "data-center"],
    faqs: [
      {
        q: "Is Midwest VoIP part of 4EOS?",
        a: "Yes. Midwest VoIP is part of the 4EOS family of companies, so phones and IT are supported together.",
      },
      {
        q: "Can we keep our phone numbers?",
        a: "Yes. Number porting is part of the installation.",
      },
      {
        q: "Is training included?",
        a: "Yes. End-user training is included with installation.",
      },
    ],
    cta: { label: "Talk to an IT Expert", topic: "voip" },
  },
  {
    slug: "data-center",
    href: "/data-center",
    family: "SafeHouse DataCenter",
    title: "SafeHouse DataCenter",
    short: "SafeHouse DataCenter",
    glyph: "rack",
    menuLine: "Fort Wayne co-location, hosting, and offsite recovery",
    headline: "A secure home for critical systems, in Fort Wayne",
    summary:
      "SafeHouse DataCenter, part of the 4EOS family: co-location in full or partial racks, 4EOS-administered hosted systems, and remote backup and disaster recovery in a secure Fort Wayne facility.",
    body: [
      "Some systems should not live in a closet at the office. They need protected power, cooling, connectivity, and physical security that most businesses cannot justify building for themselves.",
      "SafeHouse DataCenter is part of the 4EOS family. You can place your own equipment in a full or partial rack, or run on hosted systems that 4EOS administers. Either way, critical systems sit in a secure Fort Wayne facility instead of a back room.",
      "SafeHouse is also where offsite backup and disaster recovery come together, so the recovery plan has a local, physical home.",
    ],
    problems: [
      "Critical servers sitting in an office closet",
      "No offsite location for recovery",
      "Growth that would require building server room capacity",
      "Hosting with a provider you cannot reach in person",
    ],
    included: [
      {
        title: "Co-location",
        body: "Full or partial rack space for your mission-critical equipment.",
      },
      {
        title: "Hosted systems",
        body: "Systems administered by 4EOS, for businesses that would rather not own the hardware.",
      },
      {
        title: "Remote backup and disaster recovery",
        body: "Offsite copies and recovery capacity in Fort Wayne.",
      },
      {
        title: "Room to scale",
        body: "Add capacity without building infrastructure of your own.",
      },
    ],
    delivery: [
      "Decide what belongs in the data center and what belongs in the cloud",
      "Choose co-location, hosted systems, or both",
      "Move equipment or workloads on a planned schedule",
      "Connect SafeHouse to your backup and recovery plan",
    ],
    related: ["backup-disaster-recovery", "cloud-microsoft-365", "network-infrastructure"],
    faqs: [
      {
        q: "Where is SafeHouse DataCenter?",
        a: "SafeHouse DataCenter is a secure facility in Fort Wayne, Indiana, and part of the 4EOS family.",
      },
      {
        q: "What space is available?",
        a: "Full or partial rack space for your own equipment, or hosted systems administered by 4EOS.",
      },
    ],
    cta: { label: "Talk to an IT Expert", topic: "data-center" },
  },
  {
    slug: "hardware",
    href: "/hardware",
    title: "Hardware Procurement",
    short: "Hardware",
    glyph: "hardware",
    menuLine: "Dell, Microsoft, and Cisco hardware sized to the work",
    headline: "Hardware sized to the work, not the catalog",
    summary:
      "Hardware procurement from 4EOS, the largest Dell reseller in Northeast Indiana, with Microsoft and Cisco partnerships: right-sized specifications and procurement handled end to end.",
    body: [
      "Buying hardware one emergency at a time leads to mismatched machines, missed warranties, and specifications chosen by whoever was selling that week.",
      "4EOS is the largest Dell reseller in Northeast Indiana, with Microsoft and Cisco partnerships. We specify equipment to the work it has to do, handle the purchase, and install it with the engineers who will support it.",
      "Because hardware is part of your roadmap, replacements are planned and budgeted instead of forced by failures.",
    ],
    problems: [
      "Machines bought one at a time, all slightly different",
      "Expired warranties discovered when something breaks",
      "Overspending on specifications nobody needed",
    ],
    included: [
      {
        title: "Partner pricing",
        body: "Dell, Microsoft, and Cisco partnerships.",
      },
      {
        title: "Right-sized specifications",
        body: "Equipment chosen for the work, without overselling.",
      },
      {
        title: "End-to-end procurement",
        body: "Quoting, ordering, delivery, and installation handled for you.",
      },
      {
        title: "Lifecycle planning",
        body: "Replacements planned in the roadmap so they can be budgeted.",
      },
    ],
    delivery: [
      "Review what you own and what is aging out",
      "Specify replacements to the work",
      "Procure, configure, and install",
      "Track warranties and plan the next cycle",
    ],
    related: ["network-infrastructure", "managed-it", "it-strategy"],
    faqs: [
      {
        q: "What hardware does 4EOS supply?",
        a: "Enterprise-grade hardware through Dell, Microsoft, and Cisco partnerships. 4EOS is the largest Dell reseller in Northeast Indiana.",
      },
      {
        q: "How is hardware specified?",
        a: "Specifications are sized to the work the equipment has to do, not to the catalog, and procurement is handled end to end.",
      },
    ],
    cta: { label: "Talk to an IT Expert", topic: "hardware" },
  },
];

export function getService(slug: ServiceSlug): Service {
  const service = services.find((s) => s.slug === slug);
  if (!service) throw new Error(`Unknown service ${slug}`);
  return service;
}

export const tiers = [
  {
    name: "Base",
    fit: "For teams that need dependable help desk coverage and fast answers.",
    points: [
      "Live U.S.-based help desk",
      "Remote support for endpoints",
      "Continuous system monitoring",
      "Monthly patching and maintenance",
    ],
  },
  {
    name: "Pro",
    fit: "For businesses that want the whole environment run for them.",
    points: [
      "Everything in Base",
      "Fully managed servers and network",
      "Built-in cybersecurity layer",
      "Backup verification and testing",
      "Vendor management",
    ],
  },
  {
    name: "Premium",
    fit: "For leaders who want IT tied to where the business is going.",
    points: [
      "Everything in Pro",
      "Executive-level IT strategy",
      "Quarterly business reviews",
      "Compliance program support",
      "Technology roadmap planning",
    ],
  },
] as const;

/* ------------------------------------------------------------------
   Homepage
------------------------------------------------------------------- */

export const proofFacts = [
  { title: `Since ${site.founded}`, body: "Founded and based in Fort Wayne" },
  { title: `${site.rating.value} on Google`, body: `From ${site.rating.count} published reviews` },
  { title: "24/7 monitoring", body: "Live U.S.-based help desk" },
  { title: "Dell, Microsoft, Cisco", body: "Largest Dell reseller in Northeast Indiana" },
] as const;

export const challenges = [
  {
    title: "Reactive support and downtime",
    cost: "Work stops while people wait, and the same problems come back.",
    answer: "24/7 monitoring and maintenance catch issues early, and a live help desk answers when people need help.",
    href: "/managed-it",
    link: "How managed IT prevents downtime",
  },
  {
    title: "Cybersecurity uncertainty",
    cost: "You cannot say with confidence whether you are protected, or ready for an audit or an insurance questionnaire.",
    answer: "A layered defense on the NIST Cybersecurity Framework, staff training, and compliance support you can show an auditor.",
    href: "/cybersecurity",
    link: "How 4EOS approaches cybersecurity",
  },
  {
    title: "Spending without a roadmap",
    cost: "Budget goes to emergencies and overlapping tools instead of priorities.",
    answer: "A vCIO builds a prioritized roadmap and budget, reviewed with leadership each quarter, with projects quoted in advance.",
    href: "/it-strategy",
    link: "What a vCIO does",
  },
  {
    title: "Aging or fragmented systems",
    cost: "Unpatched servers, expired warranties, and systems that do not work together.",
    answer: "An assessment shows what you have, then modernization is planned across cloud, network, and hardware.",
    href: "/cloud-microsoft-365",
    link: "Cloud and Microsoft 365 services",
  },
  {
    title: "No one owns IT leadership",
    cost: "Technology decisions fall to whoever is closest, usually someone with another full-time job.",
    answer: "A primary engineer who knows your environment, backed by executive IT strategy when you need it.",
    href: "/about",
    link: "How 4EOS works with clients",
  },
  {
    title: "Growth adds risk",
    cost: "Remote staff, new locations, acquisitions, and compliance obligations each add systems to secure and support.",
    answer: "Networks, secure access, onboarding, and compliance planned into the roadmap before the change happens.",
    href: "/managed-it/network-infrastructure",
    link: "Network and infrastructure for growth",
  },
] as const;

export const deliverables = [
  {
    title: "Fewer interruptions",
    body: "Proactive monitoring, patching, and maintenance, so problems are handled before they reach your staff.",
  },
  {
    title: "A clear security position",
    body: "Protection structured on the NIST Cybersecurity Framework, with the evidence to show insurers, customers, and auditors.",
  },
  {
    title: "Recovery you have tested",
    body: "Verified backups, immutable copies, and documented restores, so you know what comes back and how fast.",
  },
  {
    title: "A plan and a budget",
    body: "A technology roadmap tied to business goals, reviewed with leadership, with projects quoted in advance.",
  },
  {
    title: "Modern, connected tools",
    body: "Microsoft 365, Azure, networks, and phones planned and managed as one environment.",
  },
  {
    title: "People who know you",
    body: "A primary engineer, a live help desk, and engineers who come onsite from Fort Wayne.",
  },
] as const;

export const differentiators = [
  {
    title: "Local accountability since 2002",
    body: `4EOS has been based in Fort Wayne since ${site.founded}. We serve ${site.serviceArea}, and the people responsible for your environment are close enough to sit down with you.`,
  },
  {
    title: "Engineers who show up",
    body: "Eyes On Site means regular onsite engagement, so we know your office and your people, not just your devices. Same-day onsite visits are available when the work needs it.",
  },
  {
    title: "A primary engineer, not a queue",
    body: "One engineer is assigned to your account and learns how your business runs. If they are unavailable, a senior engineer is dispatched.",
  },
  {
    title: "A real person on the line",
    body: "A live, U.S.-based help desk with unlimited remote support and no per-ticket billing.",
  },
  {
    title: "Advice sized to the need",
    body: "Free assessments are run by a senior engineer, not a salesperson. Recommendations are sized to what you need, and projects are quoted before work starts.",
  },
  {
    title: "One family, one number",
    body: "Managed IT, Midwest VoIP, and SafeHouse DataCenter work together, so your network, phones, and data center have one accountable team.",
  },
] as const;

export const engagement = [
  {
    title: "Assess",
    body: "A senior engineer reviews your environment and tells you plainly what could hurt the business.",
    deliverables: [
      "Network and server health",
      "Security and patching posture",
      "Backup restorability",
      "Licensing and warranty exposure",
      "A risk summary ranked by business impact",
    ],
  },
  {
    title: "Plan",
    body: "We turn the findings into priorities, a roadmap, and a fixed monthly price.",
    deliverables: [
      "What to fix now and what can wait",
      "The right CompleteCare level",
      "Projects quoted in advance",
    ],
  },
  {
    title: "Improve",
    body: "Structured onboarding, usually two to four weeks, without dropping your current support.",
    deliverables: [
      "Devices enrolled in monitoring",
      "Cutover outside business hours",
      "A first-month audit of what the previous provider left",
    ],
  },
  {
    title: "Support",
    body: "Ongoing monitoring, help desk, onsite visits, and regular reviews as the business changes.",
    deliverables: [
      "24/7 monitoring",
      "Live help desk and a primary engineer",
      "Eyes On Site visits",
      "Quarterly business reviews on Premium",
    ],
  },
] as const;

/** Published on 4eos.com as Google reviews, attributed as published. */
export const reviews = [
  {
    author: "Ken B",
    body: "Extraordinary IT service that keeps business running - always - and puts your mind at ease that your mission-critical data is stored safely in your own private cloud where a real person is available to help anytime, although you'll not need it! Rock Solid - cannot say enough about 4EOS - highly recommend them for all your Managed Service Provider needs as well as your Managed Security Service Provider needs.",
  },
  {
    author: "David M",
    body: "Great company with great people. I would like to say, they are always available to fix problems, but with 4EOS as a business partner, I do not have problems. I can concentrate on running my business and let 4EOS keep my business running.",
  },
  {
    author: "Steve B",
    body: "Our company has used 4EOS for a long time. Excellent Service and Support.",
  },
  {
    author: "Josh G",
    body: "We use them where I work, excellent IT shop!",
  },
] as const;

/* ------------------------------------------------------------------
   Industries
------------------------------------------------------------------- */

export type Industry = {
  slug: string;
  title: string;
  headline: string;
  summary: string;
  pressures: string[];
  offer: string;
  how: string[];
  services: ServiceSlug[];
  faqs: Qa[];
};

export const industries: Industry[] = [
  {
    slug: "healthcare",
    title: "Healthcare",
    headline: "Patient systems that stay available and stay private",
    summary:
      "IT for clinics and healthcare practices in Northeast Indiana: EHR uptime, HIPAA safeguards across every device and connection, encrypted backup, and staff phishing training.",
    pressures: ["HIPAA obligations", "EHR downtime stops the clinic", "Patient data on many devices"],
    offer: "EHR uptime, HIPAA safeguards, and backup for the systems that hold patient records.",
    how: [
      "HIPAA compliance support, with documentation kept audit-ready",
      "EHR availability treated as the priority it is",
      "Safeguards for patient data on every device and connection that can reach it",
      "Encrypted backup and tested recovery for clinical systems",
      "Phishing training for front desk and clinical staff",
    ],
    services: ["cybersecurity", "managed-it", "backup-disaster-recovery"],
    faqs: [
      {
        q: "What does 4EOS do for healthcare organizations?",
        a: "4EOS provides HIPAA compliance support, keeps EHR systems available, protects patient data across devices and connections, and backs up and tests recovery for clinical systems, sized for clinics and practices rather than hospital systems.",
      },
    ],
  },
  {
    slug: "manufacturing",
    title: "Manufacturing",
    headline: "Keep the line running and the plant floor protected",
    summary:
      "IT for Northeast Indiana manufacturers: production-critical systems monitored around the clock, office IT and plant systems kept safely apart, and vendor and procurement coordination.",
    pressures: ["Downtime costs production", "IT and plant systems meet", "Customer-driven security requirements"],
    offer: "Production uptime and a deliberate boundary between office IT and the plant floor.",
    how: [
      "Production-critical systems monitored around the clock",
      "Office IT and plant systems separated, and connected only where it is safe",
      "Backup and recovery for the systems the line depends on",
      "Vendor and procurement coordination",
      "Secure connections between plants and offices",
    ],
    services: ["managed-it", "network-infrastructure", "cybersecurity"],
    faqs: [
      {
        q: "What does 4EOS do for manufacturers?",
        a: "4EOS keeps production systems running, separates office IT from the plant floor except where a connection is safe, monitors production-critical systems around the clock, and coordinates vendors and procurement. 4EOS has supported Northeast Indiana manufacturers for more than 20 years.",
      },
    ],
  },
  {
    slug: "legal",
    title: "Legal",
    headline: "Client confidentiality, protected in every system",
    summary:
      "IT for law firms: secure document management, systems that stay up through trial preparation, and protection for privileged client data in email, on devices, and in the file store.",
    pressures: ["Privileged client data", "Deadlines that do not move", "Document systems the practice runs on"],
    offer: "Secure document systems and privileged data, protected through trial preparation.",
    how: [
      "Matter files limited to the people allowed to see them",
      "Systems kept available through trial preparation",
      "Email, devices, and the file store protected",
      "A help desk that treats a locked-out attorney as urgent",
      "Backup and recovery for the document management system",
    ],
    services: ["cybersecurity", "managed-it", "backup-disaster-recovery"],
    faqs: [
      {
        q: "What does 4EOS do for law firms?",
        a: "4EOS secures document management, protects privileged client data in email, on devices, and in the file store, keeps systems available through trial preparation, and backs up the document system the practice depends on.",
      },
    ],
  },
  {
    slug: "insurance",
    title: "Insurance",
    headline: "Agency systems available whenever producers need them",
    summary:
      "IT for insurance agencies: agency management systems kept available, client data protected, payments handled in line with PCI, and secure access for producers outside the office.",
    pressures: ["Agency system availability", "Client financial data", "PCI for payments"],
    offer: "Available agency systems, protected client data, and PCI-aligned payments.",
    how: [
      "Agency management systems kept available for producers",
      "Client data protected in the systems the agency runs on",
      "Payment handling aligned with PCI",
      "Secure access for producers working outside the office",
      "Monitoring that treats the agency system as business-critical",
    ],
    services: ["cybersecurity", "managed-it", "cloud-microsoft-365"],
    faqs: [
      {
        q: "What does 4EOS do for insurance agencies?",
        a: "4EOS keeps agency management systems available, protects client data, supports PCI-aligned payment handling, and gives producers secure access when they work outside the office.",
      },
    ],
  },
  {
    slug: "construction",
    title: "Construction",
    headline: "Field crews connected to the plans they need",
    summary:
      "IT for construction firms: connectivity for trailers and job sites, secure access to plans and project files from the field, and backup for the files every project depends on.",
    pressures: ["Crews away from the office", "Temporary job sites", "Large project files"],
    offer: "Job site connectivity and secure access to project files from the field.",
    how: [
      "Connectivity for trailers, job sites, and crews in the field",
      "Secure access to plans and project files from anywhere",
      "Support that can reach a superintendent who is not at a desk",
      "Backup for project files",
      "New sites planned into the network ahead of time",
    ],
    services: ["network-infrastructure", "cloud-microsoft-365", "managed-it"],
    faqs: [
      {
        q: "What does 4EOS do for construction firms?",
        a: "4EOS connects trailers and job sites, gives field crews secure access to plans and project files, supports staff who are not at a desk, and backs up project files.",
      },
    ],
  },
  {
    slug: "private-equity",
    title: "Private Equity",
    headline: "One technology standard across every portfolio company",
    summary:
      "IT for private equity firms and their holdings: technology due diligence before a close, rapid onboarding after it, and one security standard across the portfolio.",
    pressures: ["Unknown technology risk before a close", "Every holding runs differently", "Consistent security across companies"],
    offer: "Technology diligence before the close, then one standard across every holding.",
    how: [
      "Technology due diligence before a deal closes",
      "Rapid onboarding once a company joins the portfolio",
      "One security standard across holdings",
      "A baseline each new acquisition can be measured against",
      "Managed IT and security applied consistently at each company",
    ],
    services: ["it-strategy", "cybersecurity", "managed-it"],
    faqs: [
      {
        q: "What does 4EOS do for private equity firms?",
        a: "4EOS reviews a target's technology before a deal closes, onboards new holdings quickly, and applies one security and support standard across the portfolio.",
      },
    ],
  },
];

/* ------------------------------------------------------------------
   General FAQs. Answers match what 4EOS publishes.
------------------------------------------------------------------- */

export const generalFaqs: Qa[] = [
  {
    q: "What does a free IT assessment include?",
    a: "A senior engineer, not a salesperson, reviews your network and server health, your security and patching posture, whether backups can actually be restored, and your licensing and warranty exposure. You get a plain-English summary of risks ranked by what could hurt the business, and a prioritized list you could act on even if you never hire 4EOS. There is no obligation.",
  },
  services[0].faqs[0],
  services[0].faqs[1],
  services[0].faqs[2],
  {
    q: "Where does 4EOS work?",
    a: `4EOS is based at ${site.address.street} in Fort Wayne, Indiana, and serves ${site.serviceArea}. Remote support covers clients wherever they work, and engineers visit onsite.`,
  },
  {
    q: "What are the help desk hours?",
    a: `The live, U.S.-based help desk is staffed ${site.hours}. Monitoring runs 24/7. Call ${site.phone} or email ${site.helpdesk}.`,
  },
  {
    q: "What happens if my primary engineer is unavailable?",
    a: "A senior engineer is dispatched instead, so onsite and urgent work does not wait on one person's schedule.",
  },
  {
    q: "Are Midwest VoIP and SafeHouse DataCenter part of 4EOS?",
    a: "Yes. Both are part of the 4EOS family, so business phones, the data center, and managed IT are supported by one accountable team.",
  },
  {
    q: "How should I choose a managed IT provider?",
    a: "Look for a partner that plans technology around the business instead of waiting for tickets. Ask about response times, how they handle cybersecurity, whether monitoring is proactive, their experience in your industry, whether they offer both local and remote support, and whether they do strategic planning or only break-fix work.",
  },
];

/* ------------------------------------------------------------------
   Contact topics, used by the consultation form and service CTAs.
------------------------------------------------------------------- */

export const topics = [
  { value: "assessment", label: "A free IT assessment" },
  { value: "managed-it", label: "Managed IT services" },
  { value: "cybersecurity", label: "Cybersecurity and compliance" },
  { value: "cloud", label: "Cloud and Microsoft 365" },
  { value: "strategy", label: "IT strategy or vCIO" },
  { value: "backup", label: "Backup and disaster recovery" },
  { value: "network", label: "Network and infrastructure" },
  { value: "voip", label: "Business phones (Midwest VoIP)" },
  { value: "data-center", label: "SafeHouse DataCenter" },
  { value: "hardware", label: "Hardware" },
  { value: "secureai", label: "SecureAI" },
  { value: "other", label: "Something else" },
] as const;

export type TopicValue = (typeof topics)[number]["value"];

export function isTopic(value: unknown): value is TopicValue {
  return topics.some((t) => t.value === value);
}
